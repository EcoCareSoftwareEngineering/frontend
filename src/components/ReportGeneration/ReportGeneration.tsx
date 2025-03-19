import { TTimePeriod, TTimeSelection } from '../../types/generalTypes'
import { TDevice, TDeviceUsage } from '../../types/deviceTypes'
import { geDateRangeAndPeriod } from '../../utils'
import { BarChart, PieChart } from '@mui/x-charts'
import { useApi } from '../../contexts/ApiContext'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  TEnergyGoal,
  TEnergySums,
  TEnergyValues,
} from '../../types/energyTypes'
import {
  Typography,
  Divider,
  Button,
  Paper,
  Grid,
  Card,
  Box,
} from '@mui/material'

interface ReportContentProps {
  energyValues: TEnergyValues
  energySums: TEnergySums
  deviceUsage: AllDevicesUsage
  energyGoals: TEnergyGoal[]
  devices: TDevice[]
}

// The component where the report content is stored
const ReportContent = React.forwardRef<HTMLDivElement, ReportContentProps>(
  ({ energyValues, energySums, deviceUsage, energyGoals, devices }, ref) => {
    const colors = ['#07cb83', '#fbad53', '#ec443b']

    const deviceFaults = devices.filter(d => d.faultStatus == 'Fault')

    const deviceChartData =
      deviceUsage?.map((device: any) => ({
        id: device.deviceId,
        value: device.usage.reduce(
          (sum: number, entry: TDeviceUsage) => sum + entry.usage,
          0
        ),
        label: devices.find(d => d.deviceId == device.deviceId)?.name,
      })) || []

    return (
      <Paper
        ref={ref}
        sx={{
          p: 4,
          top: '10000%',
          position: 'absolute',
          backgroundColor: 'white',
          width: '800px',
        }}
      >
        <Typography variant='h4' gutterBottom color='primary'>
          EcoCare Smart Home Report
        </Typography>
        <Typography variant='subtitle1' gutterBottom>
          Generated on: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant='h5' gutterBottom>
          Energy Overview
        </Typography>

        {/* Energy Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2'>Consumption</Typography>
              <Typography variant='h6' color='error'>
                {energySums?.energyUsed?.toFixed(1) || 0} kWh
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2'>Generation</Typography>
              <Typography variant='h6' color='success'>
                {energySums?.energyGenerated?.toFixed(1) || 0} kWh
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2'>Net Energy</Typography>
              <Typography variant='h6' color='primary'>
                {energySums?.netEnergy?.toFixed(1) || 0} kWh
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Energy Chart */}
        {energyValues && energyValues.length > 0 && (
          <Box sx={{ height: 300, mb: 4, width: '100%' }}>
            <BarChart
              dataset={energyValues}
              xAxis={[
                {
                  scaleType: 'band',
                  data: energyValues?.map(entry => entry.datetime) ?? [],
                  valueFormatter: date => {
                    return date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      hour12: true,
                    })
                  },
                  tickLabelStyle: {
                    angle: 45,
                    textAnchor: 'start',
                    fontSize: 12,
                  },
                },
              ]}
              series={[
                {
                  color: colors[1],
                  label: 'Net Total',
                  data: energyValues.map(e => e.netEnergy),
                  valueFormatter: v => {
                    return (v ?? 0.0).toFixed(1) + ' kWh'
                  },
                  stack: 'total',
                },
                {
                  color: colors[0],
                  label: 'Generation',
                  data: energyValues.map(e => e.energyGenerated),
                  stack: 'total',
                },
                {
                  color: colors[2],
                  label: 'Usage',
                  data: energyValues.map(e => e.energyUsage),
                  stack: 'total',
                },
              ]}
              height={300}
              width={750}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Energy Saving Goal */}
        <Typography variant='h5' gutterBottom>
          Progress Towards Energy Saving Goals
        </Typography>

        {energyGoals ? (
          energyGoals.map(goal => (
            <Box sx={{ mb: 3 }} key={goal.goalId || goal.name}>
              <Typography variant='subtitle1' gutterBottom>
                Goal: {goal.name}
              </Typography>

              <Box
                sx={{
                  height: 20,
                  width: '100%',
                  bgcolor: '#f0f0f0',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${Math.min(
                      100,
                      ((goal.progress || 0) / goal.target) * 100
                    )}%`,
                    bgcolor: '#4caf50',
                    borderRadius: 1,
                    position: 'relative',
                  }}
                />
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant='body2'>
                    Current: {goal.progress || 0} kWh
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant='body2'>
                    Target: {goal.target} kWh
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant='body2' sx={{ mt: 1 }}>
                Progress: {((goal.progress / goal.target) * 100).toFixed(0)}%
              </Typography>

              {goal.date && (
                <Typography variant='body2' sx={{ mt: 1 }}>
                  Deadline: {new Date(goal.date).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography variant='body1'>
            No active energy saving goals.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Device Faults Section */}
        <Typography variant='h5' gutterBottom>
          Device Faults
        </Typography>
        {deviceFaults && deviceFaults.length > 0 ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              {deviceFaults.length} issue{deviceFaults.length > 1 ? 's' : ''}{' '}
              detected
            </Typography>

            {deviceFaults.map((fault, index) => (
              <Card
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: 'white',
                  border: `1px solid red`,
                  borderLeft: `6px solid red`,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant='subtitle1'>{fault.name}</Typography>
                </Box>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: '#f8f8f8',
              borderRadius: 1,
              mb: 3,
            }}
          >
            <Typography variant='h6' color='success.main' sx={{ mb: 1 }}>
              All Systems Operating Normally
            </Typography>
            <Typography variant='body1'>
              No device faults have been detected.
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant='h5' gutterBottom>
          Device Usage
        </Typography>

        {/* Device Usage Section */}
        <Grid
          container
          direction='column'
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
          spacing={3}
        >
          {/* Device Chart */}
          <Grid item>
            {deviceChartData.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '300px',
                  width: '100%',
                }}
              >
                <PieChart
                  width={900} // Adjust width
                  height={300}
                  series={[
                    {
                      data: deviceChartData,
                      innerRadius: 30,
                      paddingAngle: 2,
                      cornerRadius: 4,
                    },
                  ]}
                  legend={{
                    position: { vertical: 'top', horizontal: 'left' }, // Move legend outside
                    direction: 'column', // Arrange items horizontally
                  }}
                />
              </Box>
            )}
          </Grid>

          {/* Device List */}
          <Grid item>
            {deviceUsage && deviceUsage.length > 0 ? (
              <Box>
                {deviceUsage.map((device, index) => (
                  <Box
                    key={index}
                    sx={{
                      py: 1,
                      borderBottom:
                        index < deviceUsage.length - 1
                          ? '1px solid #eee'
                          : 'none',
                      display: 'flex',
                      width: '90%',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography>
                      {devices.find(d => device.deviceId == d.deviceId)?.name}
                    </Typography>
                    <Typography>
                      {device.usage
                        .reduce((sum, entry) => sum + entry.usage, 0)
                        .toFixed(1)}
                      hours
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body1'>No device data available.</Typography>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Summary */}
        <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2, mt: 2 }}>
          <Typography variant='h6' gutterBottom>
            Summary
          </Typography>
          <Typography variant='body1'>
            This report summarizes your smart home energy data.
            {energySums && (
              <>
                <br />
                Total consumption: {energySums.energyUsed.toFixed(1)} kWh.
                <br />
                Total generation: {energySums.energyGenerated.toFixed(1)} kWh.
                <br />
                Net energy: {energySums.netEnergy.toFixed(1)} kWh.
              </>
            )}
            {deviceFaults && deviceFaults.length > 0 && (
              <>
                <br />
                <br />
                <span style={{ color: '#f44336', fontWeight: 'bold' }}>
                  Attention: {deviceFaults.length} device fault
                  {deviceFaults.length > 1 ? 's' : ''} detected.
                </span>
              </>
            )}
          </Typography>
        </Box>
      </Paper>
    )
  }
)

type AllDevicesUsage = {
  deviceId: number
  usage: TDeviceUsage[]
}[]

// Main component for the download button
const DownloadReportButton = ({ devices }: { devices: TDevice[] }) => {
  const reportRef = useRef(null)
  const [energyValues, setEnergyValues] = useState<TEnergyValues>([])
  const [energySums, setEnergySums] = useState<TEnergySums>({
    energyGenerated: 0,
    energyUsed: 0,
    netEnergy: 0,
    totalSum: 0,
  })
  const [energyGoals, setEnergyGoals] = useState<TEnergyGoal[]>([])
  const [deviceUsage, setDeviceUsage] = useState<AllDevicesUsage>([])
  const [showReport, setShowReport] = useState<boolean>(false)
  const { API, isAuthenticated } = useApi()

  const energyValuesRef = useRef(energyValues)

  // Keep ref updated but prevent re-renders
  useEffect(() => {
    energyValuesRef.current = energyValues
  }, [energyValues])

  // Ensure function reference remains stable
  const waitForEnergyValues = useCallback(async () => {
    while (energyValuesRef.current.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }, [])

  // Fetch data function
  const fetchData = (timeSelection: TTimeSelection) => {
    const [startDate, endDate, period] = geDateRangeAndPeriod(timeSelection)
    // Fetch energy data
    fetchEnergyData(startDate, endDate, period)

    // Fetch device data
    fetchDeviceData(startDate, endDate)
  }

  // Fetch energy data from API
  const fetchEnergyData = (
    startDate: Date,
    endDate: Date,
    period: TTimePeriod
  ) => {
    if (isAuthenticated) {
      API.get(
        `/energy/?startDate=${startDate.toISOString().split('T')[0]}&endDate=${
          endDate.toISOString().split('T')[0]
        }&timePeriod=${period}`,
        'Fetch energy usage for report',
        [404]
      )
        .then((res: AxiosResponse) => {
          const result = res.data.map((item: any) => {
            const netEnergy = item.energyGeneration - item.energyUse
            return {
              datetime: new Date(item.datetime),
              energyGenerated:
                netEnergy > 0
                  ? item.energyGeneration - netEnergy
                  : item.energyGeneration,
              energyUsage:
                netEnergy < 0
                  ? -1 * item.energyUse - netEnergy
                  : -1 * item.energyUse,
              netEnergy: netEnergy,
            }
          })

          setEnergyValues(result)

          // Calculate sums
          const sums = res.data.reduce(
            (acc: any, curr: any) => {
              acc.energyGenerated += curr.energyGeneration
              acc.energyUsed += curr.energyUse
              return acc
            },
            { energyGenerated: 0, energyUsed: 0 }
          )

          setEnergySums({
            ...sums,
            netEnergy: sums.energyGenerated - sums.energyUsed,
            totalSum: sums.energyGenerated + sums.energyUsed,
          })
        })
        .catch(err => {
          console.error('Error fetching energy data:', err)
        })
    }
  }

  // Fetch device usage data from API
  const fetchDeviceData = (startDate: Date, endDate: Date) => {
    if (isAuthenticated) {
      API.get(
        `/devices/usage/?rangeStart=${
          startDate.toISOString().split('T')[0]
        }&rangeEnd=${endDate.toISOString().split('T')[0]}`,
        'Fetch device usage for report',
        [404]
      )
        .then(res => {
          setDeviceUsage(
            res.data.map((deviceItem: any) => ({
              deviceId: deviceItem.deviceId,
              usage: deviceItem.usage.map((usageItem: any) => ({
                ...usageItem,
                datetime: new Date(usageItem.datetime),
              })),
            }))
          )
        })
        .catch(err => {
          console.error('Error fetching device data:', err)
        })
    }
  }

  // Fetch current energy goal with real progress data
  const fetchEnergyGoal = () => {
    if (isAuthenticated) {
      API.get('/goals/', 'Fetch energy goals for report', [404])
        .then(res => {
          setEnergyGoals(
            res.data.map((item: any) => ({
              ...item,
              date: new Date(item.date),
            }))
          )
        })
        .catch(err => {
          console.error('Error fetching energy goals:', err)
        })
    }
  }

  const generatePDF = async () => {
    setShowReport(true)

    fetchData('Today')
    fetchEnergyGoal()

    waitForEnergyValues()
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (!reportRef.current) return

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // A4 h x w in mm
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add page 2+
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save('ecocare_smart_home_report.pdf')
      setShowReport(false)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <div>
      {showReport && (
        <ReportContent
          ref={reportRef}
          energyValues={energyValues}
          energySums={energySums}
          deviceUsage={deviceUsage}
          energyGoals={energyGoals}
          devices={devices}
        />
      )}
      <Button variant='contained' color='primary' onClick={generatePDF}>
        <i className='bi bi-clipboard-data' />
        Generate Report
      </Button>
    </div>
  )
}

export default DownloadReportButton

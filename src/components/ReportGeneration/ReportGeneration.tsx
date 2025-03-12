import React, { useRef, useEffect, useState } from 'react'
import { Box, Button, Paper, Typography, Grid, Card, Divider, Chip } from '@mui/material'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { LineChart, BarChart, PieChart } from '@mui/x-charts'
import { useApi } from '../../contexts/ApiContext'
import { getTimePeriodForSelection, handleUpdateTimePeriod } from '../../utils'

// The component where the report content is stored
const ReportContent = React.forwardRef((props, ref) => {
  const { energyValues, energySums, deviceUsageData, energyGoal, deviceFaults } = props
  const colors = ['#07cb83', '#fbad53', '#ec443b']

  // Create device chart data
  const deviceChartData = deviceUsageData?.map((device, index) => ({
    id: device.deviceName,
    value: device.usageHours || device.usage || 0,
    label: device.deviceName
  })) || []

  // Function to get severity color for device faults
  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
      case 'low':
        return '#2196f3' // blue
      case 'medium':
        return '#ff9800' // orange
      case 'high':
        return '#f44336' // red
      default:
        return '#757575' // grey
    }
  }

  // Function to format timestamp for device faults
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown'
    
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch (e) {
      return timestamp
    }
  }

  return (
    <Paper
      ref={ref}
      sx={{
        p: 4,
        top: '10000%',
        position: 'absolute',
        backgroundColor: 'white',
        width: '800px'
      }}
    >
      <Typography variant='h4' gutterBottom color="primary">
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
            <Typography variant='h6' color="error">
              {energySums?.energyUsed?.toFixed(1) || 0} kWh
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='body2'>Generation</Typography>
            <Typography variant='h6' color="success">
              {energySums?.energyGenerated?.toFixed(1) || 0} kWh
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='body2'>Net Energy</Typography>
            <Typography variant='h6' color="primary">
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
                data: energyValues.map(entry => entry.datetime),
                valueFormatter: (date) => {
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
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
      
      {energyGoal ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            Goal: {energyGoal.name}
          </Typography>
          
          <Box sx={{ 
            height: 20, 
            width: '100%', 
            bgcolor: '#f0f0f0', 
            borderRadius: 1,
            mb: 1
          }}>
            <Box 
              sx={{ 
                height: '100%', 
                width: `${Math.min(100, ((energyGoal.progress || 0) / energyGoal.target) * 100)}%`,
                bgcolor: '#4caf50',
                borderRadius: 1,
                position: 'relative'
              }}
            />
          </Box>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant='body2'>Current: {energyGoal.progress || 0} kWh</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant='body2'>Target: {energyGoal.target} kWh</Typography>
            </Grid>
          </Grid>
          
          <Typography variant='body2' sx={{ mt: 1 }}>
            Progress: {(((energyGoal.progress || 0) / energyGoal.target) * 100).toFixed(0)}%
          </Typography>
          
          {energyGoal.date && (
            <Typography variant='body2' sx={{ mt: 1 }}>
              Deadline: {new Date(energyGoal.date).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      ) : (
        <Typography variant='body1'>No active energy saving goals.</Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Device Faults Section - New Addition */}
      <Typography variant='h5' gutterBottom>
        Device Faults
      </Typography>
      
      {deviceFaults && deviceFaults.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            {deviceFaults.length} issue{deviceFaults.length > 1 ? 's' : ''} detected
          </Typography>
          
          {deviceFaults.map((fault, index) => (
            <Card 
              key={index} 
              sx={{ 
                p: 2, 
                mb: 2, 
                backgroundColor: 'white',
                border: `1px solid ${getSeverityColor(fault.severity)}`,
                borderLeft: `6px solid ${getSeverityColor(fault.severity)}`,
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='subtitle1'>
                  {fault.deviceName}
                </Typography>
                <Chip 
                  label={fault.severity.toUpperCase()} 
                  size="small" 
                  sx={{ 
                    backgroundColor: getSeverityColor(fault.severity),
                    color: 'white',
                    minWidth: 80,
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              <Typography variant='body1' sx={{ mb: 1 }}>
                {fault.description}
              </Typography>
              <Typography variant='caption' color="text.secondary">
                {formatTimestamp(fault.timestamp)}
              </Typography>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center', 
          backgroundColor: '#f8f8f8', 
          borderRadius: 1,
          mb: 3
        }}>
          <Typography variant='h6' color="success.main" sx={{ mb: 1 }}>
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
      <Grid container spacing={3}>
        {/* Device List */}
        <Grid item xs={6}>
          {deviceUsageData && deviceUsageData.length > 0 ? (
            <Box>
              {deviceUsageData.map((device, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    py: 1, 
                    borderBottom: index < deviceUsageData.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography>{device.deviceName}</Typography>
                  <Typography>{(device.usageHours || device.usage || 0).toFixed(1)} hours</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1">No device data available.</Typography>
          )}
        </Grid>
        
        {/* Device Chart */}
        <Grid item xs={6}>
          {deviceChartData.length > 0 && (
            <Box sx={{ height: 250 }}>
              <PieChart
                series={[{
                  data: deviceChartData,
                  innerRadius: 30,
                  paddingAngle: 2,
                  cornerRadius: 4,
                }]}
                height={250}
                width={350}
              />
            </Box>
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
              <br /><br />
              <span style={{ color: '#f44336', fontWeight: 'bold' }}>
                Attention: {deviceFaults.length} device fault{deviceFaults.length > 1 ? 's' : ''} detected.
              </span>
            </>
          )}
        </Typography>
      </Box>
    </Paper>
  )
})

// Main component for the download button
const DownloadReportButton = () => {
  const reportRef = useRef(null)
  const [energyValues, setEnergyValues] = useState([])
  const [energySums, setEnergySums] = useState({
    energyGenerated: 0,
    energyUsed: 0,
    netEnergy: 0,
    totalSum: 0
  })
  const [energyGoal, setEnergyGoal] = useState(null)
  const [deviceUsageData, setDeviceUsageData] = useState([])
  const [deviceFaults, setDeviceFaults] = useState([])
  
  const { API, isAuthenticated } = useApi()
  
  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchData('Today')
      fetchEnergyGoal()
      fetchDeviceFaults()
    }
  }, [isAuthenticated])
  
  // Fetch data function
  const fetchData = (timeSelection) => {
    // Create date range based on selected time frame
    const endDate = new Date()
    const startDate = handleUpdateTimePeriod(timeSelection)
    endDate.setDate(endDate.getDate() + 1)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)
    
    // Fetch energy data
    fetchEnergyData(startDate, endDate, timeSelection)
    
    // Fetch device data
    fetchDeviceData(startDate, endDate)
  }
  
  // Fetch energy data from API
  const fetchEnergyData = (startDate, endDate, timeSelection) => {
    if (isAuthenticated) {
      const period = getTimePeriodForSelection(timeSelection)
      
      API.get(
        `/energy/?startDate=${startDate.toISOString().split('T')[0]}&endDate=${
          endDate.toISOString().split('T')[0]
        }&timePeriod=${period}`,
        'Fetch energy usage for report',
        [404]
      )
        .then((res) => {
          const result = []

          res.data.forEach((item) => {
            const netEnergy = item.energyGeneration - item.energyUse
            result.push({
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
            })
          })

          setEnergyValues(result)
          
          // Calculate sums
          const sums = res.data.reduce(
            (acc, curr) => {
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
  const fetchDeviceData = (startDate, endDate) => {
    if (isAuthenticated) {
      API.get(
        `/devices/usage/?startDate=${startDate.toISOString().split('T')[0]}&endDate=${
          endDate.toISOString().split('T')[0]
        }`,
        'Fetch device usage for report',
        [404]
      )
        .then((res) => {
          setDeviceUsageData(res.data)
        })
        .catch(err => {
          console.error('Error fetching device data:', err)
          setDeviceUsageData([])
        })
    }
  }
  
  // Fetch device faults from API - New Addition
  const fetchDeviceFaults = () => {
    if (isAuthenticated) {
      API.get(
        '/devices/faults/',
        'Fetch device faults for report',
        [404]
      )
        .then((res) => {
          // Process and set device faults
          if (res.data && Array.isArray(res.data)) {
            setDeviceFaults(res.data.map(fault => ({
              deviceId: fault.deviceId || '',
              deviceName: fault.deviceName || 'Unknown Device',
              timestamp: fault.timestamp || new Date().toISOString(),
              description: fault.description || 'Unknown error',
              severity: fault.severity || 'medium'
            })));
          }
        })
        .catch(err => {
          console.error('Error fetching device faults:', err)
          // In case of error, set empty array to ensure the component renders properly
          setDeviceFaults([])
        })
    }
  }
  
  // Fetch current energy goal with real progress data
  const fetchEnergyGoal = () => {
    if (isAuthenticated) {
      API.get(
        '/goals/current/',
        'Fetch current energy goal for report',
        [404]
      )
        .then((res) => {
          if (res.data) {
            setEnergyGoal(res.data)
          } else {
            // If no current goal, try to get the most recent one
            return API.get('/goals/', 'Fetch all energy goals for report', [404])
              .then((goalsRes) => {
                if (goalsRes.data && goalsRes.data.length > 0) {
                  // Sort by date (newest first) and take the first one
                  const sortedGoals = [...goalsRes.data].sort((a, b) => {
                    return new Date(b.date) - new Date(a.date)
                  })
                  setEnergyGoal(sortedGoals[0])
                } else {
                  setEnergyGoal(null)
                }
              })
          }
        })
        .catch(err => {
          console.error('Error fetching energy goals:', err)
          setEnergyGoal(null)
        })
    }
  }

  const generatePDF = async () => {
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

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save('ecocare_smart_home_report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <div>
      <ReportContent 
        ref={reportRef} 
        energyValues={energyValues} 
        energySums={energySums}
        deviceUsageData={deviceUsageData}
        energyGoal={energyGoal}
        deviceFaults={deviceFaults}
      />
      <Button variant='contained' color='primary' onClick={generatePDF}>
        <i className='bi bi-clipboard-data' />
        Generate Report
      </Button>
    </div>
  )
}

export default DownloadReportButton
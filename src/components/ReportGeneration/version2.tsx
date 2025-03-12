import React, { useEffect, useRef, useState } from 'react'
import { PDFExport } from '@progress/kendo-react-pdf'
import { Button } from '@mui/material'
import { BarChart, PieChart } from '@mui/x-charts'
import { useApi } from '../../contexts/ApiContext'
import { TEnergySums, TEnergyValues } from '../../types/energyTypes'
import { AxiosResponse } from 'axios'

const ReportComponent = () => {
  const [energyValues, setEnergyValues] = useState<TEnergyValues>()
  const [energyData, setEnergyData] = useState<TEnergySums>()
  const [isLoading, setIsLoading] = useState(true)
  const { API, isAuthenticated } = useApi()
  const reportRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true)
      const endDate = new Date()
      const startDate = new Date()
      endDate.setDate(endDate.getDate() + 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      // Fetch energy usage
      API.get(
        `/energy/?startDate=${startDate.toISOString().split('T')[0]}&endDate=${
          endDate.toISOString().split('T')[0]
        }`,
        'Fetch energy usage request'
      )
        .then((res: AxiosResponse) => {
          const result: TEnergyValues = []

          res.data.forEach((item: any) => {
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
          const sums = res.data.reduce(
            (acc: any, curr: any) => {
              acc.energyGenerated += curr.energyGeneration
              acc.energyUsed += curr.energyUse
              return acc
            },
            { energyGenerated: 0, energyUsed: 0 }
          )

          setEnergyData({
            ...sums,
            netEnergy: sums.energyGenerated - sums.energyUsed,
            totalSum: sums.energyGenerated + sums.energyUsed,
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isAuthenticated])

  const downloadPDF = () => {
    if (!isLoading && reportRef.current) {
      setTimeout(() => {
        reportRef.current.save()
      }, 500)
    } else {
      alert('Data is still loading, please try again shortly.')
    }
  }

  return (
    <>
      {/* Hidden report content */}
      <div style={{ display: 'none' }}>
        <PDFExport
          ref={reportRef}
          paperSize='A4'
          margin='1cm'
          fileName={`EcoCare_SmartHome_Report_${
            new Date().toISOString().split('T')[0]
          }.pdf`}
          author='EcoCare Smart Home System'
          scale={0.8}
        >
          <div>
            <h1>EcoCare Smart Home Daily Report</h1>
            <p>Generated on: {new Date().toLocaleDateString()}</p>

            <div
              style={{ borderTop: '1px solid #ddd', margin: '20px 0' }}
            ></div>

            <h2>Energy Overview</h2>
            <BarChart
              dataset={energyValues}
              xAxis={[
                {
                  scaleType: 'band',
                  data: energyValues?.map(entry => entry.datetime) ?? [],
                  valueFormatter: (date: Date) => {
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
              series={
                energyValues
                  ? [
                      {
                        // color: colors[1],
                        label: 'Net Total',
                        data: energyValues?.map(e => e.netEnergy) ?? [],
                        valueFormatter: v => {
                          return (v ?? 0.0).toFixed(1) + ' kWh'
                        },
                        stack: 'total',
                      },
                      {
                        // color: colors[0],
                        label: 'Generation',
                        data: energyValues?.map(e => e.energyGenerated) ?? [],
                        valueFormatter: (v, { dataIndex }) => {
                          if (energyValues) {
                            const netEnergy = energyValues[dataIndex].netEnergy
                            return v !== null && v !== undefined
                              ? `${(netEnergy < 0 ? v : netEnergy + v).toFixed(
                                  1
                                )} kWh`
                              : '0.0 kWh'
                          }
                          return '0.0 kWh'
                        },

                        stack: 'total',
                      },
                      {
                        // color: colors[2],
                        label: 'Usage',
                        data: energyValues?.map(e => e.energyUsage) ?? [],
                        valueFormatter: (v, { dataIndex }) => {
                          if (energyValues) {
                            const netEnergy = energyValues[dataIndex].netEnergy
                            return v !== null && v !== undefined
                              ? `${(netEnergy < 0 ? v : netEnergy + v).toFixed(
                                  1
                                )} kWh`
                              : '0.0 kWh'
                          }
                          return '0.0 kWh'
                        },

                        stack: 'total',
                      },
                    ]
                  : []
              }
              slotProps={{ legend: { hidden: true } }}
              grid={{ vertical: true, horizontal: true }}
              className='bar-chart'
            />

            <p>Total Consumption: {energyData?.energyUsed} kWh</p>
            <p>Total Generation: {energyData?.energyGenerated} kWh</p>
            <p>Net Returned to Grid: {energyData?.netEnergy} kWh</p>

            <div
              style={{ borderTop: '1px solid #ddd', margin: '20px 0' }}
            ></div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h2>Device Energy Usage</h2>
                {/* <PieChart
                  series={[
                    {
                      data: deviceUsageData.map(device => ({
                        label: device.deviceName,
                        value: device.energyConsumed,
                      })),
                    },
                  ]}
                  width={200}
                  height={200}
                />
                <ul>
                  {deviceUsageData.map((device, index) => (
                    <li key={index}>
                      {device.deviceName}: {device.energyConsumed} kWh
                    </li>
                  ))}
                </ul> */}
              </div>

              <div>
                <h2>Device Usage Hours</h2>
                {/* <BarChart
                  dataset={deviceUsageData}
                  xAxis={[{ scaleType: 'band', dataKey: 'deviceName' }]}
                  series={[{ dataKey: 'usageHours', label: 'Hours Used' }]}
                  width={300}
                  height={200}
                /> */}
              </div>
            </div>

            <div
              style={{ borderTop: '1px solid #ddd', margin: '20px 0' }}
            ></div>

            <h2>Summary</h2>
            <p>Your home consumed {energyData?.energyUsed} kWh today.</p>

            {/* {deviceFaultData.length > 0 && (
              <p style={{ color: '#f44336' }}>
                Note: {deviceFaultData.length} device{' '}
                {deviceFaultData.length === 1 ? 'fault was' : 'faults were'}{' '}
                detected today.
              </p>
            )} */}
          </div>
        </PDFExport>
      </div>

      {/* Visible button to trigger download */}
      <Button onClick={downloadPDF} variant='contained' color='primary'>
        DOWNLOAD DEVICE REPORT
      </Button>
    </>
  )
}

export default ReportComponent

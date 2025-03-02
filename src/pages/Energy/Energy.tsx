import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { TEnergySums, TEnergyValues } from '../../types/energyTypes'
import Dropdown from '../../components/Dropdown/Dropdown'
import { useApi } from '../../contexts/ApiContext'
import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import './Energy.scss'

const colors = ['#07cb83', '#fbad53', '#ec443b']

const tempData = [
  { label: 'Group A', value: 35, color: colors[2] },
  { label: 'Group B', value: 15, color: colors[1] },
  { label: 'Group C', value: 50, color: colors[0] },
]

const Energy = () => {
  const [energyValues, setEnergyValues] = useState<TEnergyValues>()
  const [energySums, setEnergySums] = useState<TEnergySums>({
    energyGenerated: 0,
    energyUsed: 0,
    netEnergy: 0,
    totalSum: 0,
  })

  const { API, loading, isAuthenticated } = useApi()

  const fetchEnergyData = (startDate: Date) => {
    if (isAuthenticated) {
      startDate.setHours(0, 0, 0, 0)
      const today = new Date().setHours(0, 0, 0, 0)
      // API.get(
      //   `/energy/?startDate=2025-01-01&endDate=${
      //     startDate.toISOString().split('T')[0]
      //   }`,
      //   'Fetch energy usage request'
      // )
      API.get(
        `/energy/?startDate=2025-01-01&endDate=2025-01-02`,
        'Fetch energy usage request'
      )
        .then((res: AxiosResponse) => {
          setEnergyValues(
            res.data.map((item: any) => {
              const energyUse = -1 * item.energyUse
              const netEnergy = item.energyGeneration - item.energyUse
              const energyGenerated =
                item.energyGeneration - netEnergy > 0
                  ? item.energyGeneration
                  : item.energyGeneration - netEnergy
              const energyUsage =
                energyUse - netEnergy < 0 ? energyUse - netEnergy : energyUse
              return {
                datetime: new Date(item.datetime).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                netEnergy: netEnergy,
                energyUsage: energyUsage,
                energyGenerated: energyGenerated,
              }
            })
          )
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
        .catch((err: AxiosError) => {
          console.error('GET request failed', err)
        })
    }
  }

  console.log(energySums)

  useEffect(() => {
    fetchEnergyData(new Date())
  }, [isAuthenticated])

  const handleSelect = (value: string) => {
    console.log('Selected:', value)
  }

  return (
    <div className='home page-content'>
      <LoadingModal open={loading} />
      {/* Container for device usage */}
      <div className='energy-data'>
        <div className='header'>
          Energy Generation and Usage
          <Dropdown
            options={['Today', 'This week', 'This month', 'This year']}
            onSelect={handleSelect}
          />
        </div>
        <div className='data-container'>
          <ul className='consumption-list'>
            <li key={1}>
              <PieChart
                className='pie-chart'
                slotProps={{ legend: { hidden: true } }}
                tooltip={{ trigger: 'none' }}
                series={[
                  {
                    innerRadius: '70%',
                    data: [
                      {
                        value: energySums.energyGenerated / energySums.totalSum,
                        color: colors[0],
                      },
                      {
                        value: energySums.energyUsed / energySums.totalSum,
                        color: '#3d4e69',
                      },
                    ],
                  },
                ]}
              >
                <PieCenterLabel>
                  {(
                    (energySums.energyGenerated / energySums.totalSum) *
                    100
                  ).toFixed(0) + '%'}
                </PieCenterLabel>
              </PieChart>
              <div className='data-label'>
                <p className='label'>Energy Generated</p>
                <p className='details'>{`${energySums.energyGenerated.toFixed(
                  2
                )} kWh`}</p>
              </div>
            </li>
            <li key={2}>
              <PieChart
                className='pie-chart'
                slotProps={{ legend: { hidden: true } }}
                tooltip={{ trigger: 'none' }}
                series={[
                  {
                    innerRadius: '70%',
                    data: [
                      {
                        value: energySums.energyUsed / energySums.totalSum,
                        color: colors[2],
                      },
                      {
                        value: energySums.energyGenerated / energySums.totalSum,
                        color: '#3d4e69',
                      },
                    ],
                  },
                ]}
              >
                <PieCenterLabel>
                  {(
                    (energySums.energyUsed / energySums.totalSum) *
                    100
                  ).toFixed(0) + '%'}
                </PieCenterLabel>
              </PieChart>
              <div className='data-label'>
                <p className='label'>Energy Usage</p>
                <p className='details'>{`${energySums.energyUsed.toFixed(
                  2
                )} kWh`}</p>
              </div>
            </li>
            <li>
              <PieChart
                className='pie-chart net-energy'
                series={[
                  {
                    innerRadius: '75%',
                    paddingAngle: 3,
                    startAngle: -90,
                    endAngle: 90,
                    data: tempData,
                  },
                ]}
                slotProps={{ legend: { hidden: true } }}
              >
                <PieCenterLabel>
                  {energySums.netEnergy.toFixed(2) + ' kWh'}
                </PieCenterLabel>
              </PieChart>
            </li>
          </ul>
          {!loading && (
            <BarChart
              xAxis={[
                {
                  scaleType: 'band',
                  data: energyValues?.map(entry => entry.datetime) ?? [],
                },
              ]}
              series={[
                {
                  color: colors[1],
                  label: 'Net Total',
                  data: energyValues?.map(e => e.netEnergy) ?? [],
                  stack: 'total',
                },
                {
                  color: colors[0],
                  label: 'Generation',
                  data: energyValues?.map(e => e.energyGenerated) ?? [],
                  stack: 'total',
                },
                {
                  color: colors[2],
                  label: 'Usage',
                  data: energyValues?.map(e => e.energyUsage) ?? [],
                  stack: 'total',
                },
              ]}
              slotProps={{ legend: { hidden: true } }}
              grid={{ vertical: true, horizontal: true }}
              className='line-chart'
            />
          )}
        </div>
      </div>

      {/* Container for various metrics */}
    </div>
  )
}

export default Energy

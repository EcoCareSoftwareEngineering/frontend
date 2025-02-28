import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'
import Dropdown from '../../components/Dropdown/Dropdown'
import { TEnergyData, TEnergyValues } from '../../types/energyTypes'
import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { AxiosError, AxiosResponse } from 'axios'
import { useApi } from '../../contexts/ApiContext'
import { useEffect, useState } from 'react'
import './Energy.scss'

const colors = ['#07cb83', '#fbad53', '#ec443b']

const Energy = () => {
  const [energyGeneration, setEnergyGeneration] = useState<TEnergyValues>()
  const [energyUsage, setEnergyUsage] = useState<TEnergyValues>()
  const [energyData, setEnergyData] = useState<TEnergyData>()
  const { API, loading, isAuthenticated } = useApi()

  const fetchEnergyData = () => {
    if (isAuthenticated)
      API.get(
        `/energy/?startDate=2025-01-02&endDate=2025-01-02`,
        'Fetch energy usage request'
      )
        .then((res: AxiosResponse) => {
          setEnergyData(() => {
            const usageTotal = sumArrayValues(res.data.energyUsage)
            const generatedTotal = sumArrayValues(res.data.energyGeneration)
            const totalAll = usageTotal + generatedTotal
            setEnergyGeneration({
              percentage: generatedTotal / totalAll,
              data: res.data.energyGeneration,
              sum: generatedTotal,
            })
            setEnergyUsage({
              percentage: usageTotal / totalAll,
              data: res.data.energyUsage,
              sum: usageTotal,
            })

            const energyUsed = res.data.energyUsage.map(
              (usage: number) => usage * -1
            )
            const netEnergy = energyUsed.map(
              (usage: number, index: number) =>
                usage + res.data.energyGeneration[index]
            )
            return {
              energyGenerated: res.data.energyGeneration.map(
                (value: number, index: number) =>
                  netEnergy[index] > 0 ? value - netEnergy[index] : value
              ),
              energyUsed: energyUsed.map((value: number, index: number) =>
                netEnergy[index] < 0 ? value - netEnergy[index] : value
              ),
              netEnergy: netEnergy,
            }
          })
        })
        .catch((err: AxiosError) => {
          console.error('GET request failed', err)
        })
  }

  useEffect(() => {
    fetchEnergyData()
  }, [isAuthenticated])

  const sumArrayValues = (arr: number[]): number =>
    arr.reduce((acc, num) => acc + num, 0)

  const handleSelect = (value: string) => {
    console.log('Selected:', value)
  }

  return (
    <div className='home page-content'>
      {/* Container for device usage */}
      <div className='energy-consumption'>
        <div className='header'>
          Device Usage by Location
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
                        value: energyGeneration
                          ? energyGeneration.percentage
                          : 0,
                        color: colors[0],
                      },
                      {
                        value: energyUsage ? energyUsage.percentage : 0,
                        color: '#3d4e69',
                      },
                    ],
                  },
                ]}
              >
                <PieCenterLabel>
                  {(
                    (energyGeneration ? energyGeneration.percentage : 0) * 100
                  ).toFixed(0) + '%'}
                </PieCenterLabel>
              </PieChart>
              <div className='data-label'>
                <p className='label'>Energy Generated</p>
                <p className='details'>{`${energyGeneration?.sum.toFixed(
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
                        value: energyUsage ? energyUsage.percentage : 0,
                        color: colors[1],
                      },
                      {
                        value: energyGeneration
                          ? energyGeneration.percentage
                          : 0,
                        color: '#3d4e69',
                      },
                    ],
                  },
                ]}
              >
                <PieCenterLabel>
                  {((energyUsage ? energyUsage.percentage : 0) * 100).toFixed(
                    0
                  ) + '%'}
                </PieCenterLabel>
              </PieChart>
              <div className='data-label'>
                <p className='label'>Energy Consumed</p>
                <p className='details'>{`${energyUsage?.sum.toFixed(
                  2
                )} kWh`}</p>
              </div>
            </li>
          </ul>
          {!loading && (
            <BarChart
              xAxis={[
                {
                  data: Array.from(
                    { length: energyData?.energyUsed.length ?? 0 },
                    (_, i) => i + 1
                  ),
                  scaleType: 'band',
                },
              ]}
              series={[
                {
                  color: colors[1],
                  label: 'Net Total',
                  data: energyData?.netEnergy ?? [],
                  stack: 'total',
                },
                {
                  color: colors[0],
                  label: 'Generation',
                  data: energyData?.energyGenerated ?? [],
                  stack: 'total',
                },
                {
                  color: colors[2],
                  label: 'Usage',
                  data: energyData?.energyUsed ?? [],
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

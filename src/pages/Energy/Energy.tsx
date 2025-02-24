import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'
import Dropdown from '../../components/Dropdown/Dropdown'
import { TEnergyData, TEnergyValues } from '../../types/energyTypes'
import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { API } from '../../utils'
import './Energy.scss'

const colors = ['#07cb83', '#fbad53', '#ec443b']
// const colors = ['#07cb83', '#ec443b', '#fbad53']

const tableData = [
  {
    name: 'Energy Generation',
    usage: 0.32,
    data: [523, 178, 342, 610, 295, 438, 219, 587, 224, 678],
  },
  {
    name: 'Energy Usage',
    usage: 0.12,
    data: [67, 243, 298, 372, 217, 266, 110, 428, 450, 189],
  },
]

const Energy = () => {
  const [energyGeneration, setEnergyGeneration] = useState<TEnergyValues>([])
  const [energyUsage, setEnergyUsage] = useState<TEnergyValues>([])
  const [energyData, setEnergyData] = useState<TEnergyData>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchEnergyData = () => {
    setIsLoading(true)
    API.get(
      `/energy/?startDate=2025-01-02&endDate=2025-01-02`,
      'Fetch energy usage request'
    )
      .then((res: AxiosResponse) => {
        console.log(res.data)
        setEnergyData(() => {
          // Set actual values
          setEnergyGeneration(res.data.energyGeneration)
          setEnergyUsage(res.data.energyUsage)

          // Calculate net values for visualization
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
      .catch((err: AxiosError) => console.log(err))
      .finally(() => {
        console.log(energyData)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchEnergyData()
  }, [])

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
            {tableData.map((item, index) => {
              let start = 0
              for (let i = index; i > 0; i--) {
                start += tableData[i - 1].usage
              }
              return (
                <li key={index}>
                  <PieChart
                    className='pie-chart'
                    slotProps={{ legend: { hidden: true } }}
                    tooltip={{ trigger: 'none' }}
                    series={[
                      {
                        innerRadius: '70%',
                        data: [
                          { value: start, color: '#3d4e69' },
                          { value: item.usage, color: colors[index] },
                          { value: 1 - (start + item.usage), color: '#3d4e69' },
                        ],
                      },
                    ]}
                  >
                    <PieCenterLabel>
                      {(item.usage * 100).toFixed(0) + '%'}
                    </PieCenterLabel>
                  </PieChart>
                  <div className='data-label'>
                    <p className='label'>{item.name}</p>
                    <p className='details'>{`${item.data.reduce(
                      (acc, num) => acc + num,
                      0
                    )} kWh`}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          {!isLoading && (
            <BarChart
              xAxis={[
                {
                  data: Array.from(
                    { length: energyUsage.length },
                    (_, i) => i + 1
                  ),
                  scaleType: 'band',
                },
              ]}
              series={[
                {
                  color: colors[1],
                  label: 'Net Total',
                  data: energyData?.netEnergy,
                  stack: 'total',
                },
                {
                  color: colors[0],
                  label: 'Generation',
                  data: energyData?.energyGenerated,
                  stack: 'total',
                },
                {
                  color: colors[2],
                  label: 'Usage',
                  data: energyData?.energyUsed,
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

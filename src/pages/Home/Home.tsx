import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'
import Dropdown from '../../components/Dropdown/Dropdown'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import './Home.scss'
import { useEffect, useState } from 'react'
import axios from 'axios'

const colors = ['#07cb83', '#fbad53', '#ec443b', '#8440a0']

// HOME PAGE SHOULD SHOW THIS:
// Device usage by room
// Solar panel performance
// Thermostat temp + humidity
// Security activity?
// Device faults?

const Home = () => {
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rangeStart = '2024-03-01' // Example start date
        const rangeEnd = '2024-03-10' // Example end date
        const response = await axios.get(
          /api/devices/usage/?rangeStart=${rangeStart}&rangeEnd=${rangeEnd}
        )

        const formattedData = response.data.map((device) => {
          return {
            name: Device ${device.deviceId},
            usage: device.usage.reduce((acc, entry) => acc + entry.usage, 0) / (24 * device.usage.length), // Average daily usage percentage
            data: device.usage.map(entry => entry.usage),
          }
        })

        setTableData(formattedData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
          <LineChart
            xAxis={[{ data: [...Array(24).keys()].map(i => i + 1) }]} // 24-hour format
            series={tableData.map((element, index) => ({
              label: element.name,
              data: element.data,
              showMark: false,
              color: colors[index % colors.length],
              curve: 'linear',
            }))}
            slotProps={{ legend: { hidden: true } }}
            grid={{ vertical: true, horizontal: true }}
            className='line-chart'
          />
        </div>
      </div>

      {/* Container for various metrics */}
    </div>
  )
}

export default Home

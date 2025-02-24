import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'
import Dropdown from '../../components/Dropdown/Dropdown'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import './Home.scss'

const colors = ['#07cb83', '#fbad53', '#ec443b', '#8440a0']

const tableData = [
  {
    name: 'Living Room',
    usage: 0.32,
    data: [523, 178, 342, 610, 295, 438, 219, 587, 224, 678],
  },
  {
    name: 'Hallway',
    usage: 0.12,
    data: [67, 243, 298, 372, 217, 266, 110, 428, 450, 189],
  },
  {
    name: 'Bedroom',
    usage: 0.16,
    data: [275, 389, 512, 634, 421, 310, 289, 478, 660, 149],
  },
  {
    name: 'Kitchen',
    usage: 0.18,
    data: [189, 499, 602, 287, 435, 580, 672, 214, 389, 521],
  },
]

// HOME PAGE SHOULD SHOW THIS:
// Device usage by room
// Solar panel performance
// Thermostat temp + humidity
// Security activity?
// Device faults?

const Home = () => {
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
          <LineChart
            xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }]}
            series={tableData.map((element, index) => {
              return {
                label: element.name,
                data: element.data,
                showMark: false,
                color: colors[index],
                curve: 'linear',
              }
            })}
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

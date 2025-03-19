import DeviceUseByRoom from '../../components/DeviceUseByRoom/DeviceUseByRoom'
import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'
import NetEnergyDial from '../../components/NetEnergyDial/NetEnergyDial'
import { TTimePeriod, TTimeSelection } from '../../types/generalTypes'
import { TDeviceFaults, TDevicePower } from '../../types/deviceTypes'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { TEnergyGoal, TEnergySums } from '../../types/energyTypes'
import { geDateRangeAndPeriod, getCSSVariable } from '../../utils'
import { useDevices } from '../../contexts/DeviceContext'
import Dropdown from '../../components/Dropdown/Dropdown'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { PieChart } from '@mui/x-charts'
import './Home.scss'

const Home = () => {
  const [energySums, setEnergySums] = useState<TEnergySums>({
    energyGenerated: 0,
    energyUsed: 0,
    netEnergy: 0,
    totalSum: 0,
  })

  const [deviceFaults, setDeviceFaults] = useState<TDeviceFaults>({
    okCount: 0,
    faultCount: 0,
  })
  const [devicePower, setDevicePower] = useState<TDevicePower>({
    powerOn: 0,
    powerOff: 0,
  })
  const [energyGoal, setEnergyGoal] = useState<TEnergyGoal>()

  const { devices, devicesLoaded } = useDevices()
  const { API, isAuthenticated, loading } = useApi()

  const activeColor = getCSSVariable('--active-color')
  const inactiveColor = getCSSVariable('--inactive-color')

  const GREEN = getCSSVariable('--green-color')
  const YELLOW = getCSSVariable('--yellow-color')
  const RED = getCSSVariable('--red-color')

  // Fix viewport size update styles
  useEffect(() => {
    if (localStorage.getItem('starting')) {
      document.body.style.display = 'none'
      setTimeout(() => (document.body.style.display = 'block'), 50)
      localStorage.removeItem('starting')
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) handleSelectNetEnergy('Today')
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      API.get('/goals/', 'Fetch energy goals request')
        .then((res: AxiosResponse) => {
          const data = res.data.map((goal: TEnergyGoal) => ({
            ...goal,
            percentage: goal.progress / goal.target,
          }))
          setEnergyGoal(
            data.reduce(
              (max: any, item: any) =>
                item.percentage > max.percentage ? item : max,
              data[0]
            )
          )
        })
        .catch((err: AxiosError) => {
          console.error('GET request failed', err)
        })
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (devicesLoaded) {
      const faultData = {
        okCount: devices.filter(d => d.faultStatus == 'Ok').length,
        faultCount: devices.filter(d => d.faultStatus == 'Fault').length,
      }
      setDeviceFaults(faultData)

      const powerData = {
        powerOn: devices.filter(d => d.status == 'On').length,
        powerOff: devices.filter(d => d.status == 'Off').length,
      }
      setDevicePower(powerData)
    }
  }, [devicesLoaded])

  const fetchEnergyData = (
    startDate: Date,
    endDate: Date,
    period: TTimePeriod
  ) => {
    API.get(
      `/energy/?startDate=${startDate.toISOString().split('T')[0]}&endDate=${
        endDate.toISOString().split('T')[0]
      }&timePeriod=${period}`,
      'Fetch energy usage request',
      [404]
    )
      .then((res: AxiosResponse) => {
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

  const handleSelectNetEnergy = (value: TTimeSelection) => {
    // setNetEnergyTime(value)
    const [startDate, endDate, period] = geDateRangeAndPeriod(value)
    fetchEnergyData(startDate, endDate, period)
  }

  return (
    <div className='home page-content'>
      {/* Container for device usage */}
      <LoadingModal open={loading} />
      <div className='energy-consumption'>
        <DeviceUseByRoom />
      </div>

      <div className='item-container'>
        {/* Net Energy */}
        <div className='item net-energy'>
          <div className='header'>
            Net Energy
            <Dropdown onSelect={handleSelectNetEnergy} />
          </div>
          <NetEnergyDial
            transform='translate(150, 142)'
            value={energySums.netEnergy.toFixed(2) + ' kWh'}
            angle={(() => {
              const totalEnergy =
                energySums.energyGenerated + energySums.energyUsed
              if (totalEnergy == 0) return 1.5

              let angle = (energySums.netEnergy / totalEnergy) * 90 - 45
              return Math.max(-45, Math.min(45, angle))
            })()}
          />
        </div>

        {/* Device Faults */}
        <div className='item pie-item'>
          <div className='header'>
            Device Faults
            <Dropdown
              onSelect={() => {
                console.warn('Fault logs not implemented')
              }}
            />
          </div>
          <div className='pie-data'>
            <PieChart
              className='pie-chart'
              slotProps={{ legend: { hidden: true } }}
              series={[
                {
                  innerRadius: '75%',
                  data: [
                    {
                      label: 'Status: Ok',
                      value: deviceFaults.okCount,
                      color: GREEN,
                    },
                    {
                      label: 'Status: Fault',
                      value: deviceFaults.faultCount,
                      color: YELLOW,
                    },
                  ],
                },
              ]}
            >
              <PieCenterLabel>
                {`${(
                  (!isNaN(deviceFaults.okCount / devices.length)
                    ? deviceFaults.okCount / devices.length
                    : 0) * 100
                ).toFixed(0)}% `}
              </PieCenterLabel>
            </PieChart>
            <div className='data-label'>
              <p className='label'>Device Faults:</p>
              <p className='details'>{`Normal: ${deviceFaults.okCount}`}</p>
              <p className='details'>{`Faults: ${deviceFaults.faultCount}`}</p>
            </div>
          </div>
        </div>

        {/* Device Status */}
        <div className='item pie-item'>
          <div className='header'>Device Power Status</div>
          <div className='pie-data'>
            <PieChart
              className='pie-chart'
              slotProps={{ legend: { hidden: true } }}
              series={[
                {
                  innerRadius: '75%',
                  data: [
                    {
                      label: 'Power: On',
                      value: devicePower.powerOn,
                      color: GREEN,
                    },
                    {
                      label: 'Power: Off',
                      value: devicePower.powerOff,
                      color: RED,
                    },
                  ],
                },
              ]}
            >
              <PieCenterLabel>
                {`${(
                  (!isNaN(devicePower.powerOn / devices.length)
                    ? devicePower.powerOn / devices.length
                    : 0) * 100
                ).toFixed(0)}% `}
              </PieCenterLabel>
            </PieChart>
            <div className='data-label'>
              <p className='label'>Device Power:</p>
              <p className='details'>{`Power On: ${devicePower.powerOn}`}</p>
              <p className='details'>{`Power Off: ${devicePower.powerOff}`}</p>
            </div>
          </div>
        </div>

        {/* Progress to next energy goal */}
        <div className='item pie-item'>
          <div className='header'>Next Energy Milestone</div>
          <div className='pie-data'>
            <PieChart
              className='pie-chart'
              tooltip={{ trigger: 'none' }}
              slotProps={{ legend: { hidden: true } }}
              series={[
                {
                  innerRadius: '75%',
                  data: [
                    {
                      label: 'Progress',
                      value: energyGoal?.progress ?? 0,
                      color: activeColor,
                    },
                    {
                      value: energyGoal
                        ? energyGoal?.target - energyGoal?.progress
                        : 1,
                      color: inactiveColor,
                    },
                  ],
                },
              ]}
            >
              <PieCenterLabel>
                {`${(
                  (energyGoal ? energyGoal?.progress / energyGoal?.target : 0) *
                  100
                ).toFixed(0)}% `}
              </PieCenterLabel>
            </PieChart>
            <div className='data-label'>
              <p className='label'>{energyGoal?.name}:</p>
              <p className='details'>{`Target: ${energyGoal?.target} kWh`}</p>
              <p className='details'>{`Progress: ${energyGoal?.progress} kWh`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

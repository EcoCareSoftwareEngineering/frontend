import DeviceUseByRoom from '../../components/DeviceUseByRoom/DeviceUseByRoom'
import NetEnergyDial from '../../components/NetEnergyDial/NetEnergyDial'
import { TTimePeriod, TTimeSelection } from '../../types/generalTypes'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useDevices } from '../../contexts/DeviceContext'
import Dropdown from '../../components/Dropdown/Dropdown'
import { TDeviceFaults } from '../../types/deviceTypes'
import { TEnergySums } from '../../types/energyTypes'
import { geDateRangeAndPeriod } from '../../utils'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { PieChart } from '@mui/x-charts'
import './Home.scss'
import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'

// HOME PAGE SHOULD SHOW THIS:
// Thermostat temp
// Device faults
// Next highest goal

const Home = () => {
  const [energySums, setEnergySums] = useState<TEnergySums>({
    energyGenerated: 0,
    energyUsed: 0,
    netEnergy: 0,
    totalSum: 0,
  })

  const [deviceFaults, setDeviceFaults] = useState<TDeviceFaults>({
    okCount: 1,
    faultCount: 0,
  })

  const { API, loading, isAuthenticated } = useApi()
  const { devices, devicesLoaded } = useDevices()

  // Fix viewport size update styles
  useEffect(() => {
    if (localStorage.getItem('starting')) {
      document.body.style.display = 'none'
      setTimeout(() => (document.body.style.display = 'block'), 50)
      localStorage.removeItem('starting')
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      handleSelectNetEnergy('Today')
    }
  }, [])

  useEffect(() => {
    if (devicesLoaded) {
      const data = {
        okCount: devices.filter(d => d.faultStatus == 'Ok').length,
        faultCount: devices.filter(d => d.faultStatus == 'Fault').length,
      }
      if (data.okCount + data.faultCount == 0) data.okCount = 1
      setDeviceFaults(data)
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
        <div className='item device-faults'>
          <div className='header'>Device Faults</div>
          <div className='device-faults-data'>
            <PieChart
              className='pie-chart'
              slotProps={{ legend: { hidden: true } }}
              series={[
                {
                  innerRadius: '70%',
                  data: [
                    {
                      label: 'Status: Ok',
                      value: deviceFaults.okCount,
                      color: '#07cb83',
                    },
                    {
                      label: 'Status: Fault',
                      value: deviceFaults.faultCount,
                      color: '#ec443b',
                    },
                  ],
                },
              ]}
            >
              <PieCenterLabel>
                {`${((deviceFaults.okCount / devices.length) * 100).toFixed(
                  0
                )}% `}
              </PieCenterLabel>
            </PieChart>
            <div className='data-label'>
              <p className='label'>
                {`Device Faults:
                ${deviceFaults.faultCount == 0 ? 'all devices normal' : ''}`}
              </p>
              <p className='details'>{`Active: ${deviceFaults.okCount}`}</p>
              <p className='details'>{`Faults: ${deviceFaults.faultCount}`}</p>
            </div>
          </div>
        </div>
        <div className='item'> </div>
        <div className='item'> </div>
      </div>
    </div>
  )
}

export default Home

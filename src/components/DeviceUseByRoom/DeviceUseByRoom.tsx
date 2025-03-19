import { TDevicesByRooms, TUsagesByRoom } from '../../types/deviceTypes'
import { TTimePeriod, TTimeSelection } from '../../types/generalTypes'
import PieCenterLabel from '../PieCenterLabel/PieCenterLabel'
import { useDevices } from '../../contexts/DeviceContext'
import { PieChart, LineChart } from '@mui/x-charts'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import Dropdown from '../Dropdown/Dropdown'
import './DeviceUseByRoom.scss'
import {
  getFormattedDateString,
  geDateRangeAndPeriod,
  formatDuration,
  getCSSVariable,
} from '../../utils'

const colors = ['#07cb83', '#fbad53', '#ec443b', '#8440a0']

const DeviceUseByRoom = () => {
  const [timeSelection, setTimeSelection] = useState<TTimeSelection>('Today')
  const [roomUsages, setRoomUsages] = useState<TUsagesByRoom>([])
  const [roomUsageSum, setRoomUsageSum] = useState<number>(0)
  const { tags, devices, devicesLoaded } = useDevices()
  const { API } = useApi()

  const inactiveColor = getCSSVariable('--inactive-color')

  useEffect(() => {
    if (devicesLoaded) {
      handleSelectForDeviceUsage('Today')
    }
  }, [devicesLoaded])

  const fetchDeviceUsage = (
    startDate: Date,
    endDate: Date,
    period: TTimePeriod
  ) => {
    API.get(
      `/devices/usage/?rangeStart=${
        startDate.toISOString().split('T')[0]
      }&rangeEnd=${endDate.toISOString().split('T')[0]}&timePeriod=${period}`,
      'Fetch devices usage by location'
    )
      .then((res: AxiosResponse) => {
        const devicesByRoom = devices.reduce((acc, { deviceId, roomTag }) => {
          if (!roomTag || roomTag === null) return acc
          let room = acc.find(r => r.roomTag === roomTag)
          if (!room) {
            room = { roomTag, devices: [] }
            acc.push(room)
          }
          room.devices.push(deviceId)
          return acc
        }, [] as TDevicesByRooms)

        setRoomUsages(() => {
          let rooms: TUsagesByRoom = devicesByRoom.map(
            ({ roomTag, devices }) => {
              const roomUsage = res.data.filter((d: any) =>
                devices.includes(d.deviceId)
              )

              const usages = roomUsage.length
                ? roomUsage[0].usage.map(({ datetime }: any, i: number) => ({
                    datetime: new Date(datetime),
                    usage: roomUsage.reduce(
                      (sum: number, { usage }: any) => sum + usage[i].usage,
                      0
                    ),
                  }))
                : []

              return {
                roomTag,
                label: tags.find(t => t.tagId === roomTag)?.name,
                totalUsage: usages.reduce(
                  (sum: number, u: any) => sum + u.usage,
                  0
                ),
                usage: usages,
              }
            }
          )

          if (rooms.length > 4) {
            rooms.sort((a, b) => a.totalUsage - b.totalUsage)

            const toGroup = rooms.slice(0, rooms.length - 3)
            const remaining = rooms.slice(-3)

            const groupedUsage = toGroup.reduce(
              (acc, room) => {
                acc.totalUsage += room.totalUsage
                acc.usage = acc.usage.map((u, i) => ({
                  datetime: u.datetime,
                  usage: u.usage + (room.usage[i]?.usage || 0),
                }))
                return acc
              },
              {
                label: 'Other Rooms',
                roomTag: -1,
                totalUsage: 0,
                usage: toGroup[0].usage.map(u => ({ ...u })),
              }
            )

            rooms = [...remaining, groupedUsage]
          }

          // Sort by total usage (descending) - keep Other  at the end
          rooms.sort((a, b) => {
            if (a.label === 'Other Rooms') return 1
            if (b.label === 'Other Rooms') return -1
            return b.totalUsage - a.totalUsage
          })

          setRoomUsageSum(rooms.reduce((sum, room) => sum + room.totalUsage, 0))
          return rooms
        })
      })
      .catch((err: AxiosError) => {
        console.error('GET request failed', err)
      })
  }

  const handleSelectForDeviceUsage = (value: TTimeSelection) => {
    setTimeSelection(value)
    const [startDate, endDate, period] = geDateRangeAndPeriod(value)
    fetchDeviceUsage(startDate, endDate, period)
  }

  const yAxisConfig = () => {
    const yValues = roomUsages[0]?.usage.map(d => d.usage) ?? []
    const maxY = yValues.length > 0 ? Math.max(...yValues) * 1.2 : 10
    return [{ min: 0, max: Math.max(maxY, 10), label: 'Minutes' }]
  }

  return (
    <>
      <div className='header'>
        Device Usage by Location
        <Dropdown onSelect={handleSelectForDeviceUsage} />
      </div>
      <div className='data-container'>
        <ul className='consumption-list'>
          {roomUsages.map((item, index) => {
            let start = 0
            for (let i = index; i > 0; i--) {
              start += roomUsages[i - 1].totalUsage
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
                        {
                          value: roomUsageSum == 0 ? 1 : start,
                          color: inactiveColor,
                        },
                        {
                          value: item.totalUsage,
                          color: colors[index],
                        },
                        {
                          value: roomUsageSum - (start + item.totalUsage),
                          color: inactiveColor,
                        },
                      ],
                    },
                  ]}
                >
                  <PieCenterLabel>
                    {(
                      (!isNaN(item.totalUsage / roomUsageSum)
                        ? item.totalUsage / roomUsageSum
                        : 0) * 100
                    ).toFixed(0) + '%'}
                  </PieCenterLabel>
                </PieChart>
                <div className='data-label'>
                  <p className='label'>{item.label}</p>
                  <p className='details'>{formatDuration(item.totalUsage)}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <LineChart
          yAxis={yAxisConfig()}
          xAxis={[
            {
              scaleType: 'band',
              data: roomUsages[0]?.usage.map(entry => entry.datetime) ?? [],
              valueFormatter: (date: Date, context) =>
                context.location === 'tick'
                  ? getFormattedDateString(date, timeSelection, false)
                  : getFormattedDateString(date, timeSelection, true),
              tickLabelStyle: {
                angle: 45,
                textAnchor: 'start',
                fontSize: 12,
              },
            },
          ]}
          series={roomUsages.map((element, index) => {
            return {
              label: element.label,
              data: element.usage.map(e => e.usage) ?? [],
              valueFormatter: v => formatDuration(v),
              showMark: false,
              color: colors[index],
              curve: 'linear',
            }
          })}
          slotProps={{ legend: { hidden: true } }}
          grid={{ vertical: true, horizontal: true }}
          className='usage-line-chart line-chart'
        />
      </div>
    </>
  )
}

export default DeviceUseByRoom

import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom'
import { TDevice, TDeviceState, TTag } from '../../types/deviceTypes'
import { useDevices } from '../../contexts/DeviceContext'
import Dropdown from '../../components/Dropdown/Dropdown'
import { LineChart } from '@mui/x-charts/LineChart'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import dayjs from 'dayjs'
import './Device.scss'
import {
  FormControlLabel,
  Typography,
  TextField,
  Button,
  Switch,
  Paper,
  Box,
} from '@mui/material'

import { getCSSVariable, getLinkTopLevel } from '../../utils'

type TUsageData = {
  deviceId: number
  usage: { datetime: string; usage: number }[]
}

const colors = [getCSSVariable('--active-color')]

const tableData = [
  {
    name: 'Living Room',
    usage: 0.32,
    data: [523, 178, 342, 610, 295, 438, 219, 587, 224, 678],
  },
  // {
  //   name: 'Hallway',
  //   usage: 0.12,
  //   data: [67, 243, 298, 372, 217, 266, 110, 428, 450, 189],
  // },
  // {
  //   name: 'Bedroom',
  //   usage: 0.16,
  //   data: [275, 389, 512, 634, 421, 310, 289, 478, 660, 149],
  // },
  // {
  //   name: 'Kitchen',
  //   usage: 0.18,
  //   data: [189, 499, 602, 287, 435, 580, 672, 214, 389, 521],
  // },
]

const Device = () => {
  const { devices, setDevices, devicesLoaded } = useDevices()
  const { API, isAuthenticated, loading } = useApi()
  const { id } = useParams()

  const [device, setDevice] = useState<TDevice>()
  const [updating, setUpdating] = useState<boolean>(false)
  const [stateValue, setStateValue] = useState<string>('')
  const [currentStateValue, setCurrentStateValue] = useState<string>('')
  const [powerVisualState, setPowerVisualState] = useState<'On' | 'Off'>('Off')
  const [usageData, setUsageData] = useState<number[]>([])
  const [timeRange, setTimeRange] = useState<string>('Today')
  const deviceId = id ? parseInt(id, 10) : null
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const cachedDevice = location.state?.device
    if (cachedDevice && cachedDevice.deviceId === deviceId) {
      setDevice(cachedDevice)
      setPowerVisualState(cachedDevice.status)
      if (cachedDevice.state && cachedDevice.state.length > 0) {
        const value = String(cachedDevice.state[0].value || '')
        setStateValue(value)
        setCurrentStateValue(value)
      }
    } else if (deviceId && devices.length > 0) {
      const foundDevice = devices.find(device => device.deviceId === deviceId)
      if (foundDevice) {
        setDevice(foundDevice)
        setPowerVisualState(foundDevice.status)
        if (foundDevice.state && foundDevice.state.length > 0) {
          const value = String(foundDevice.state[0].value || '')
          setStateValue(value)
          setCurrentStateValue(value)
        }
      }
    }
  }, [deviceId, location.state])

  // useEffect(() => {
  //   if (deviceId && isAuthenticated)
  // }, [deviceId, isAuthenticated, timeRange])

  const updateDevice = (putData: TDevice | any) => {
    setUpdating(true)
    API.put(`/devices/${deviceId}/`, putData, 'Update device state')
      .then((response: AxiosResponse) => {
        const updatedDevice = {
          ...response.data,
          location: device?.location,
        }
        setDevice(updatedDevice)
        if (device && device.state.length > 0) {
          setStateValue(response.data.state[0].value)
        }
        setPowerVisualState(response.data.status)
        setDevices(
          devices.map(d =>
            d.deviceId === response.data.deviceId ? { ...updatedDevice } : d
          )
        )

        enqueueSnackbar('Device state updated successfully', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        })
        navigate(location.pathname, { state: { device: updatedDevice } })
      })
      .catch((err: AxiosError | any) => {
        console.error('PUT request failed', err)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const getFormattedStateValue = () => {
    switch (device?.state[0].datatype) {
      case 'integer':
        return parseInt(currentStateValue)
      case 'float':
        return parseFloat(currentStateValue)
      case 'boolean':
        return currentStateValue == 'On' ? true : false
      default:
        return currentStateValue
    }
  }

  const handleUpdateDeviceState = () => {
    if (device) {
      const devicePutData = {
        ...device,
        state: [{ ...device?.state[0], value: getFormattedStateValue() }],
      }
      updateDevice(devicePutData)
    }
  }

  const handleUpdateDevicePower = () => {
    if (device) {
      const devicePutData = {
        ...device,
        status: device.status == 'On' ? 'Off' : 'On',
      }
      updateDevice(devicePutData)
    }
  }

  return (
    <div className='device page-content'>
      <LoadingModal open={!devicesLoaded || loading} />
      <div className='page-header'>
        <h2 className='page-title'>{`Devices - ${device?.name}`}</h2>
        <Button
          onClick={() => {
            navigate(`${getLinkTopLevel()}/devices`)
          }}
          variant='contained'
        >
          <i className='bi bi-arrow-left' />
          Back
        </Button>
      </div>

      <div className='device-grid-container'>
        {/* Device Properties */}
        <div className='device-grid-item'>
          <Paper elevation={2} className='device-properties'>
            <Box p={3}>
              <Typography variant='h5' gutterBottom>
                Device Properties
              </Typography>
              <table className='properties-table'>
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{device?.name}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{device?.description || 'No description'}</td>
                  </tr>
                  <tr>
                    <th>Location</th>
                    <td>{device?.location || 'Not assigned'}</td>
                  </tr>
                  <tr>
                    <th>IP Address</th>
                    <td>{device?.ipAddress || 'Not available'}</td>
                  </tr>
                  <tr>
                    <th>Unlocked</th>
                    <td>{device?.unlocked ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <th>PIN Enabled</th>
                    <td>{device?.pinEnabled ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <th>Fault Status</th>
                    <td
                      className={
                        device?.faultStatus === 'Ok'
                          ? 'status-ok'
                          : 'status-fault'
                      }
                    >
                      {device?.faultStatus}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Paper>
        </div>

        {/* Device Tags */}
        <div className='device-grid-item'>
          <Paper elevation={2} className='device-tags'>
            <Box p={3}>
              <Typography variant='h5' gutterBottom>
                Device Tags
              </Typography>

              {device?.customTags && device.customTags.length > 0 ? (
                <div className='tags-section'>
                  <Typography variant='subtitle2' gutterBottom>
                    Custom Tags
                  </Typography>
                  <table className='tags-table'>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {device.customTags.map(tag => (
                        <tr key={`custom-${tag.tagId}`}>
                          <td>{tag.tagId}</td>
                          <td>{tag.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Typography variant='body2' className='no-tags'>
                  No custom tags assigned
                </Typography>
              )}

              {device?.userTags && device.userTags.length > 0 ? (
                <div className='tags-section'>
                  <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                    User Tags
                  </Typography>
                  <table className='tags-table'>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {device.userTags.map(tag => (
                        <tr key={`user-${tag.tagId}`}>
                          <td>{tag.tagId}</td>
                          <td>{tag.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Typography variant='body2' className='no-tags'>
                  No user tags assigned
                </Typography>
              )}

              {device?.roomTag ? (
                <div className='tags-section'>
                  <Typography variant='body1' gutterBottom sx={{ mt: 2 }}>
                    Room Tag
                  </Typography>
                  <table className='tags-table'>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{device.roomTag}</td>
                        <td>{device.location || 'Room'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <Typography variant='body2' className='no-tags'>
                  No room tag assigned
                </Typography>
              )}
            </Box>
          </Paper>
        </div>

        {/* Device Control */}
        <div className='device-grid-item'>
          <Paper elevation={2} className='device-control'>
            <Box p={3}>
              <Typography variant='h5' gutterBottom>
                Device Control
              </Typography>
              <table className='properties-table'>
                <tbody>
                  <tr>
                    <th>Power</th>
                    <td>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={powerVisualState === 'On'}
                            onChange={handleUpdateDevicePower}
                            disabled={updating}
                          />
                        }
                        label={powerVisualState}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              {device?.state && device?.state.length > 0 ? (
                <table>
                  <tbody>
                    <tr>
                      <th>
                        Current {device?.state[0].fieldName} (
                        {device?.state[0].datatype})
                      </th>
                      <td>
                        <p
                          style={{
                            marginBlock: '2px',
                            marginLeft: '6%',
                          }}
                        >
                          {stateValue}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        New {device?.state[0].fieldName} (
                        {device?.state[0].datatype})
                      </th>
                      <td>
                        <TextField
                          fullWidth
                          value={currentStateValue}
                          onChange={e => setCurrentStateValue(e.target.value)}
                          placeholder={`Enter ${device?.state[0].datatype} value`}
                          variant='outlined'
                          size='small'
                        />
                      </td>
                    </tr>
                    <tr>
                      <Button
                        variant='contained'
                        onClick={handleUpdateDeviceState}
                        className='update-btn'
                        disabled={updating}
                        sx={{ mt: 2 }}
                      >
                        Set State
                      </Button>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <Typography sx={{ mt: 2, width: '100%' }}>
                  This device does not have a controllable state.
                </Typography>
              )}
            </Box>
          </Paper>
        </div>
      </div>

      <div className='device-usage-container'>
        <div className='header'>
          Device Usage by Location
          <Dropdown
            options={['Today', 'Past week', 'Past month', 'Past year']}
            onSelect={() => console.log('ad')}
          />
        </div>
        <div className='data-container'>
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
    </div>
  )
}

export default Device

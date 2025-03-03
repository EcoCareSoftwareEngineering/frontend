import { useLocation, useParams, Link } from 'react-router-dom'
import { useDevices } from '../../contexts/DeviceContext'
import { useApi } from '../../contexts/ApiContext'
import { TDevice, TDeviceState } from '../../types/deviceTypes'
import { useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { AxiosError, AxiosResponse } from 'axios'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { LineChart } from '@mui/x-charts/LineChart'
import Dropdown from '../../components/Dropdown/Dropdown'
import dayjs from 'dayjs'
import './Device.scss'

import {
  Typography,
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Divider
} from '@mui/material'

type TUsageData = {
  deviceId: number;
  usage: { datetime: string; usage: number }[];
}

const Device = () => {
  const { devices, devicesLoaded } = useDevices()
  const { id } = useParams()
  const { API, loading } = useApi()

  const [device, setDevice] = useState<TDevice>()
  const [updating, setUpdating] = useState<boolean>(false)
  const [stateValue, setStateValue] = useState<string>('')
  const [powerVisualState, setPowerVisualState] = useState<'On' | 'Off'>('Off')
  const [usageData, setUsageData] = useState<number[]>([])
  const [xAxisLabels, setXAxisLabels] = useState<number[]>([])
  const [timeRange, setTimeRange] = useState<string>('Today')
  const [loadingUsage, setLoadingUsage] = useState<boolean>(false)
  const deviceId = id ? parseInt(id, 10) : null
  const location = useLocation()


  useEffect(() => {
    const cachedDevice = location.state?.device
    if (cachedDevice && cachedDevice.deviceId === deviceId) {
      setDevice(cachedDevice)
      setPowerVisualState(cachedDevice.status)
      if (cachedDevice.state && cachedDevice.state.length > 0) {
        setStateValue(String(cachedDevice.state[0].value || ''))
      }
    } else if (deviceId && devices.length > 0) {
      const foundDevice = devices.find(device => device.deviceId === deviceId)
      if (foundDevice) {
        setDevice(foundDevice)
        setPowerVisualState(foundDevice.status)
        if (foundDevice.state && foundDevice.state.length > 0) {
          setStateValue(String(foundDevice.state[0].value || ''))
        }
      }
    }
  }, [deviceId, devices, location.state])

  useEffect(() => {
    if (!deviceId) return
    
    fetchUsageData(timeRange)
  }, [deviceId, timeRange])
  
  const fetchUsageData = (range: string) => {
    if (!deviceId) return
    
    setLoadingUsage(true)
    
    const endDate = dayjs().format('YYYY-MM-DD')
    let startDate
    
    switch (range) {
      case 'Today':
        startDate = dayjs().format('YYYY-MM-DD')
        break
      case 'This week':
        startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
        break
      case 'This month':
        startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
        break
      case 'This year':
        startDate = dayjs().subtract(365, 'day').format('YYYY-MM-DD')
        break
      default:
        startDate = dayjs().format('YYYY-MM-DD')
    }
    
    API.get(`/devices/usage/?rangeStart=${startDate}&rangeEnd=${endDate}`, 'Fetch device usage')
      .then((response: AxiosResponse) => {
        console.log('got stuff')

        const data = response.data as TUsageData[]
        
        const deviceData = data.find(d => d.deviceId === deviceId)
        
        if (deviceData && deviceData.usage.length > 0) {
          const usageValues = deviceData.usage.map(item => item.usage)
          
          const labels = Array.from({ length: usageValues.length }, (_, i) => i + 1)
          
          setUsageData(usageValues)
          setXAxisLabels(labels)
        } else {
          setUsageData([])
          setXAxisLabels([])
        }
      })
      .catch((err: AxiosError | any) => {
        console.error('GET request failed', err)
        
        const sampleData = Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 10)
        const sampleLabels = Array.from({ length: sampleData.length }, (_, i) => i + 1)
        
        setUsageData(sampleData)
        setXAxisLabels(sampleLabels)
      })
      .finally(() => {
        setLoadingUsage(false)
      })
  }
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  const togglePower = () => {
    if (!device || updating) return
    
    setUpdating(true)
    
    const newStatus = device.status === 'On' ? 'Off' : 'On'
    
    API.put(`/devices/${deviceId}/`, { status: newStatus }, 'Update device status')
      .then((response: AxiosResponse) => {
        setPowerVisualState(newStatus)
        
        setDevice(prevDevice => {
          if (!prevDevice) return prevDevice
          return {
            ...prevDevice,
            status: newStatus
          }
        })
        
        enqueueSnackbar(`Device power turned ${newStatus}`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
      .catch((err: AxiosError | any) => {
        console.error('PUT request failed', err)
        enqueueSnackbar('Failed to update device power', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const updateDeviceState = () => {
    if (!device || !device.state || device.state.length === 0) return
    
    setUpdating(true)
    
    let typedValue: string | number | boolean = stateValue
    const datatype = device.state[0].datatype
    
    if (datatype === 'integer') {
      typedValue = parseInt(stateValue, 10)
    } else if (datatype === 'float') {
      typedValue = parseFloat(stateValue)
    } else if (datatype === 'boolean') {
      typedValue = stateValue.toLowerCase() === 'true'
    }
    
    const newState = [{
      ...device.state[0],
      value: typedValue
    }]
    
    API.put(`/devices/${deviceId}/`, { state: newState }, 'Update device state')
      .then((response: AxiosResponse) => {
        setDevice(prevDevice => {
          if (!prevDevice) return prevDevice
          return {
            ...prevDevice,
            state: newState
          }
        })
        
        enqueueSnackbar('Device state updated successfully', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
      .catch((err: AxiosError | any) => {
        console.error('PUT request failed', err)
        enqueueSnackbar('Failed to update device state', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  if (!devicesLoaded || loading) {
    return <LoadingModal open={!devicesLoaded || loading} />
  }

  if (!device) {
    return (
      <div className="device page-content">
        <div className="page-header">
          <Typography variant="h4" component="h2">Device Info</Typography>
          <Button component={Link} to="/devices" variant="outlined">
            <i className="bi bi-arrow-left" />
            Back
          </Button>
        </div>
        <Typography variant="body1">
          The device with ID {id} could not be found.
        </Typography>
      </div>
    )
  }

  return (
    <div className="device page-content">
      <div className="page-header">
        <div className="header-left"></div>
        <Typography variant="h4" component="h2" className="page-title">Device Info</Typography>
        <div className="header-right">
          <Button component={Link} to="/devices" variant="outlined">
            <i className="bi bi-arrow-left" />
            Back
          </Button>
        </div>
      </div>
      
      <Divider className="main-divider" />
      
      <Grid container spacing={3}>
        {/* Device Properties Table - Left Side */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="device-properties">
            <Box p={3}>
              <table className="properties-table">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{device.name}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{device.description || "No description"}</td>
                  </tr>
                  <tr>
                    <th>Location</th>
                    <td>{device.location || "Not assigned"}</td>
                  </tr>
                  <tr>
                    <th>Unlocked</th>
                    <td>{device.unlocked ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <th>IP Address</th>
                    <td>{device.ipAddress || "Not available"}</td>
                  </tr>
                  <tr>
                    <th>PIN Enabled</th>
                    <td>{device.pinEnabled ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <th>Fault Status</th>
                    <td className={device.faultStatus === 'Ok' ? 'status-ok' : 'status-fault'}>
                      {device.faultStatus}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
        
        {/* Device Control - Right Side */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="device-control">
            <Box p={3}>
              {/* Power Toggle */}
              <Box className="power-control">
                <FormControlLabel
                  control={
                    <Switch
                      checked={powerVisualState === 'On'}
                      onChange={togglePower}
                      disabled={updating}
                    />
                  }
                  label={`Power: ${powerVisualState}`}
                />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* State Control */}
              {device.state && device.state.length > 0 ? (
                <Box className="state-control">
                  <Typography variant="body1" gutterBottom>
                    {device.state[0].fieldName} ({device.state[0].datatype}):
                  </Typography>
                  
                  <TextField
                    fullWidth
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                    placeholder={`Enter ${device.state[0].datatype} value`}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  />
                  
                  <Button
                    variant="contained"
                    onClick={updateDeviceState}
                    disabled={updating}
                    sx={{ mt: 2 }}
                  >
                    Set State
                  </Button>
                </Box>
              ) : (
                <Typography variant="body1">
                  This device does not have any controllable state.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default Device
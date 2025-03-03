import { useLocation, useParams, Link } from 'react-router-dom'
import { useDevices } from '../../contexts/DeviceContext'
import { useApi } from '../../contexts/ApiContext'
import { TDevice, TDeviceState } from '../../types/deviceTypes'
import { useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { AxiosError, AxiosResponse } from 'axios'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import './Device.scss'

// Material UI imports
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

const Device = () => {
  const { devices, devicesLoaded } = useDevices()
  const { id } = useParams()
  const { API, loading } = useApi()

  const [device, setDevice] = useState<TDevice>()
  const [updating, setUpdating] = useState<boolean>(false)
  const [stateValue, setStateValue] = useState<string>('')
  const deviceId = id ? parseInt(id, 10) : null
  const location = useLocation()

  useEffect(() => {
    const cachedDevice = location.state?.device
    if (cachedDevice && cachedDevice.deviceId === deviceId) {
      setDevice(cachedDevice)
      if (cachedDevice.state && cachedDevice.state.length > 0) {
        setStateValue(String(cachedDevice.state[0].value || ''))
      }
    } else if (deviceId && devices.length > 0) {
      const foundDevice = devices.find(device => device.deviceId === deviceId)
      if (foundDevice) {
        setDevice(foundDevice)
        if (foundDevice.state && foundDevice.state.length > 0) {
          setStateValue(String(foundDevice.state[0].value || ''))
        }
      }
    }
  }, [deviceId, devices, location.state])

  const togglePower = () => {
    if (!device) return
    
    setUpdating(true)
    
    const newStatus = device.status === 'On' ? 'Off' : 'On'
    
    
  }

  const updateDeviceState = () => {
    if (!device || !device.state || device.state.length === 0) return
    
    setUpdating(true)
    
    // Convert value to the appropriate type based on the data type
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
        <Typography variant="h4" component="h2">Device Info</Typography>
        <Button component={Link} to="/devices" variant="outlined">
          <i className="bi bi-arrow-left" />
          Back
        </Button>
      </div>
      
      <Typography variant="body1" className="device-description">
        Description: {device.description || "No description"}
      </Typography>
      
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
                    <th>Device ID</th>
                    <td>{device.deviceId}</td>
                  </tr>
                  <tr>
                    <th>Room Tag</th>
                    <td>{device.roomTag || "None"}</td>
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
                      checked={device.status === 'On'}
                      onChange={togglePower}
                      disabled={updating}
                    />
                  }
                  label={`Power: ${device.status}`}
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
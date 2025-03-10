import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import {
  TDevice,
  TDeviceState,
  TDeviceUsage,
  TTag,
} from '../../types/deviceTypes'
import { useDevices } from '../../contexts/DeviceContext'
import Dropdown from '../../components/Dropdown/Dropdown'
import { LineChart } from '@mui/x-charts/LineChart'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import './Device.scss'
import {
  FormControlLabel,
  Typography,
  TextField,
  Button,
  Switch,
  Paper,
  Box,
  Autocomplete,
  Chip,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
} from '@mui/material'

import {
  getCSSVariable,
  getLinkTopLevel,
  getTimePeriodForSelection,
  handleUpdateTimePeriod,
} from '../../utils'
import {
  TMUIAutocompleteOption,
  SetState,
  TTimeSelection,
} from '../../types/generalTypes'

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
]

const Device = () => {
  const { tags, devices, setDevices, devicesLoaded } = useDevices()
  const { API, isAuthenticated, loading } = useApi()
  const { id } = useParams()

  const [device, setDevice] = useState<TDevice>()
  const [updating, setUpdating] = useState<boolean>(false)
  const [stateValue, setStateValue] = useState<string>('')
  const [currentStateValue, setCurrentStateValue] = useState<string>('')
  const [powerVisualState, setPowerVisualState] = useState<'On' | 'Off'>('Off')
  const [usageData, setUsageData] = useState<TDeviceUsage[]>([])
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

  const fetchDeviceUsage = (
    startDate: Date,
    endDate: Date,
    timeSelection: TTimeSelection
  ) => {
    const period = getTimePeriodForSelection(timeSelection)
    API.get(
      `/devices/usage/?deviceId=${id}&rangeStart=${
        startDate.toISOString().split('T')[0]
      }&rangeEnd=${endDate.toISOString().split('T')[0]}&timePeriod=${period}`
    )
      .then((res: AxiosResponse) => {
        setUsageData(
          res.data[0].usage.map((e: any) => ({
            datetime: new Date(e.datetime),
            usage: e.usage,
          }))
        )
      })
      .catch((err: AxiosError | any) => {
        console.error('GET request failed', err)
      })
  }

  useEffect(() => {
    if (deviceId && isAuthenticated) {
      handleSelect('Today')
    }
  }, [deviceId, isAuthenticated, timeRange])

  const handleSelect = (value: string) => {
    if (['Today', 'Past week', 'Past month', 'Past year'].includes(value)) {
      const endDate = new Date()
      const startDate = handleUpdateTimePeriod(value as TTimeSelection)
      endDate.setDate(endDate.getDate() + 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      fetchDeviceUsage(startDate, endDate, value as TTimeSelection)
    } else {
      console.error('Invalid time period selected:', value)
    }
  }

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

  const yAxisConfig = () => {
    const yValues = usageData.map(d => d.usage)
    const maxY = yValues.length > 0 ? Math.max(...yValues) : 10
    return [{ min: 0, max: Math.max(maxY, 10) }]
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

      <div className='device-data-container'>
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

          <div className='device-grid-item device-usage'>
            <div className='usage-header'>
              <h5>Device Usage</h5>
              <Dropdown
                options={['Today', 'Past week', 'Past month', 'Past year']}
                onSelect={handleSelect}
              />
            </div>
            <div className='data-container'>
              <LineChart
                yAxis={yAxisConfig()}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: usageData.map(entry => entry.datetime) ?? [],
                    valueFormatter: (date: Date) => {
                      return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        // day: 'numeric',
                      })
                    },
                    tickLabelStyle: {
                      angle: 45,
                      textAnchor: 'start',
                      fontSize: 12,
                    },
                  },
                ]}
                series={
                  usageData
                    ? [
                        {
                          label: 'Usage',
                          data: usageData?.map(e => e.usage) ?? [],
                          valueFormatter: v => {
                            return (v ?? 0).toFixed(0) + ' mins'
                          },
                          showMark: false,
                          color: colors[0],
                        },
                      ]
                    : []
                }
                slotProps={{ legend: { hidden: true } }}
                grid={{ vertical: true, horizontal: true }}
                className='line-chart'
              />
            </div>
          </div>
        </div>

        <div className='device-grid-container'>
          {/* Device Tags */}
          <div className='device-grid-item'>
            <Paper elevation={2} className='device-tags'>
              <Box p={3}>
                <Typography variant='h5' gutterBottom>
                  Device Tags
                </Typography>

                <Typography variant='h6'>Location</Typography>
                <TagsAutocomplete
                  device={device}
                  setDevice={setDevice}
                  type='Room'
                />
                <Typography variant='h6'>User Tags</Typography>
                <TagsAutocomplete
                  device={device}
                  setDevice={setDevice}
                  type='User'
                />
                <Typography variant='h6'>Custom Tags</Typography>
                <TagsAutocomplete
                  device={device}
                  setDevice={setDevice}
                  type='Custom'
                />
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
        </div>
      </div>
    </div>
  )
}

const TagsAutocomplete = ({
  setDevice,
  device,
  type,
}: {
  setDevice: SetState<TDevice | undefined>
  device: TDevice | undefined
  type: string
}) => {
  const [value, setValue] = useState<any>(
    device && type != 'Room'
      ? device[type == 'Custom' ? 'customTags' : 'userTags'].map(
          (tag: TTag) => ({
            label: tag.name,
            id: tag.tagId,
          })
        )
      : { id: device?.roomTag, label: device?.location ?? '' }
  )
  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [tagName, setTagName] = useState<string>()
  const [inputValue, setInputValue] = useState('')
  const { tags, setTags, devices, setDevices } = useDevices()
  const navigate = useNavigate()
  const { API } = useApi()

  useEffect(() => {
    if (device)
      switch (type) {
        case 'Custom':
          setValue(
            device.customTags.map((tag: TTag) => ({
              label: tag.name,
              id: tag.tagId,
            }))
          )
          return
        case 'User':
          setValue(
            device.userTags.map((tag: TTag) => ({
              label: tag.name,
              id: tag.tagId,
            }))
          )
          return
        default:
          setValue(
            device.roomTag
              ? { id: device.roomTag, label: device.location ?? '' }
              : undefined
          )
          return
      }
  }, [device])

  const isTagSelected = (option: TMUIAutocompleteOption) => {
    if (option == null) return false

    if (type != 'Room') {
      return value?.find((item: any) => item?.id === option.id) ? true : false
    } else return value?.id === option.id
  }

  const handleTagSelected = (option: TMUIAutocompleteOption[]) => {
    let newValue
    if (type != 'Room') {
      const newOption = option.slice(-1)[0]
      if (newOption == null) {
        newValue = []
      } else if (isTagSelected(newOption)) {
        newValue = value.filter((item: any) => item?.id !== newOption?.id)
      } else {
        newValue = [...value, newOption]
      }
    } else {
      newValue = option
    }

    setValue(newValue)
    handleUpdateDeviceTags(newValue)
  }

  const handleCreateTag = () => {
    const postData = {
      tagType: type,
      name: tagName,
    }
    API.post(
      '/tags/',
      postData,
      `Create new ${type.toLowerCase()} tag request\n`
    )
      .then((res: AxiosResponse) => {
        const createdTag = {
          tagId: res.data.id,
          name: tagName,
          tagType: type,
        } as TTag
        setTags([...tags, createdTag])
        enqueueSnackbar('Successfully created new tag', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        })
      })
      .catch((err: AxiosError | any) => {
        console.error('POST request failed', err)
      })
      .finally(() => {
        handleCloseAddModal()
      })
  }

  const handleUpdateDeviceTags = (newValue: any) => {
    const valueJson =
      type == 'Room'
        ? newValue.id
        : newValue.length > 0
        ? tags
            .filter(t => newValue.some((val: any) => val.id == t.tagId))
            .map(tag => tag.tagId)
        : []
    const field =
      type == 'Room' ? 'roomTag' : type == 'User' ? 'userTags' : 'customTags'
    const updatedDevice = {
      ...device,
      [field]: valueJson,
    }
    API.put(
      `/devices/${device?.deviceId}/`,
      updatedDevice,
      `Update device ${type.toLowerCase()} tag request\n`
    )
      .then((res: AxiosResponse) => {
        setValue(newValue)
        const finalDevice = {
          ...(device as TDevice),
          ...updatedDevice,
          location: tags.find(t => t.tagId === updatedDevice.roomTag)?.name,
        }
        console.log(finalDevice)
        setDevice(finalDevice)
        setDevices(
          devices.map(d => (d.deviceId === res.data.deviceId ? finalDevice : d))
        )
        enqueueSnackbar(
          `Successfully updated device ${type.toLowerCase()} tag`,
          {
            variant: 'success',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center',
            },
          }
        )
        navigate(location.pathname, { state: { device: finalDevice } })
      })
      .catch((err: AxiosError | any) => {
        console.error('POST request failed', err)
      })
  }

  const handleCloseAddModal = () => {
    setTagName(undefined)
    setShowAdd(false)
  }

  return (
    <>
      <Autocomplete
        multiple={type != 'Room'}
        id='tags-autocomplete'
        options={tags
          .filter(tag => tag.tagType === type)
          .map((tag: TTag) => ({
            label: tag.name,
            id: tag.tagId,
          }))}
        value={value}
        onChange={(_, option) => handleTagSelected(option)}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        getOptionLabel={option => (option ? option.label : '')}
        renderInput={params => (
          <TextField
            {...params}
            variant='outlined'
            placeholder={`Search ${type.toLowerCase()} tags`}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option?.label} {...getTagProps({ index })} />
          ))
        }
        renderOption={(props, option) => {
          return (
            <ListItem
              {...props}
              dense
              component='li'
              disablePadding
              sx={{ pl: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge='start'
                  checked={isTagSelected(option)}
                  disableRipple
                  size='small'
                />
              </ListItemIcon>
              <ListItemText primary={option?.label} />
            </ListItem>
          )
        }}
        noOptionsText={
          <Button
            fullWidth
            onClick={() => setShowAdd(true)}
            className='add-tag-btn'
            sx={{
              justifyContent: 'flex-start',
              backgroundColor: '#228B22',
              color: 'white',
            }}
          >
            <i
              className='bi bi-plus-lg'
              style={{ paddingInline: '5px 10px' }}
            />
            {`Add ${type.toLowerCase()} tag`}
          </Button>
        }
        ListboxComponent={props => (
          <Paper
            {...props}
            sx={{
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                p: 1,
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: 1,
              }}
            >
              <Button
                fullWidth
                onClick={() => setShowAdd(true)}
                className='add-tag-btn'
                sx={{
                  justifyContent: 'flex-start',
                  backgroundColor: '#228B22',
                  color: 'white',
                }}
              >
                <i
                  className='bi bi-plus-lg'
                  style={{ paddingInline: '5px 10px' }}
                />
                {`Add ${type.toLowerCase()} tag`}
              </Button>
            </Box>

            <ul
              {...props}
              style={{
                margin: 0,
                listStyle: 'none',
              }}
            >
              {props.children}
            </ul>
          </Paper>
        )}
      />
      <Modal
        open={showAdd}
        onClose={handleCloseAddModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box>
          <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
            Create New {type} Tag:
          </Typography>
          <div className='modal-table device-info'>
            <strong style={{ alignContent: 'center' }}>Name:</strong>
            <TextField
              fullWidth
              value={tagName}
              onChange={e => setTagName(e.target.value)}
              placeholder='Enter tag name'
              variant='outlined'
              size='small'
            />
          </div>
          <div style={{ marginTop: '20px' }} className='actions'>
            <Button className='cancel-btn' onClick={handleCloseAddModal}>
              <i className='bi bi-x-lg' />
              Cancel
            </Button>
            <Button className='submit-btn' onClick={handleCreateTag}>
              <i className='bi bi-plus-lg' />
              Create
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  )
}

export default Device

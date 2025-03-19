import DeleteDeviceModal from '../../components/DeviceModals/DeleteDeviceModal'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import EditDeviceModal from '../../components/DeviceModals/EditDeviceModal'
import { TDevice, TDeviceUsage, TTag } from '../../types/deviceTypes'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useParams, useNavigate } from 'react-router-dom'
import { useDevices } from '../../contexts/DeviceContext'
import Dropdown from '../../components/Dropdown/Dropdown'
import { LineChart } from '@mui/x-charts/LineChart'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { enqueueSnackbar } from 'notistack'
import './Device.scss'

import {
  getFormattedDateString,
  geDateRangeAndPeriod,
  getLinkTopLevel,
  getCSSVariable,
} from '../../utils'

import {
  TMUIAutocompleteOption,
  TTimeSelection,
  TTimePeriod,
  SetState,
} from '../../types/generalTypes'

import {
  ListItemIcon,
  ListItemText,
  Autocomplete,
  Typography,
  TextField,
  Checkbox,
  ListItem,
  Tooltip,
  Button,
  Paper,
  Modal,
  Chip,
  Box,
} from '@mui/material'

const Device = () => {
  const [timeSelection, setTimeSelection] = useState<TTimeSelection>('Today')
  const { devices, setDevices, devicesLoaded } = useDevices()
  const { API, isAuthenticated, loading } = useApi()
  const { id } = useParams()

  const [device, setDevice] = useState<TDevice>()
  const [updating, setUpdating] = useState<boolean>(false)
  const [stateIndex, setStateIndex] = useState<number>(0)
  const [currentStateValue, setCurrentStateValue] = useState<string>('')
  const [powerVisualState, setPowerVisualState] = useState<'On' | 'Off'>('Off')
  const [usageData, setUsageData] = useState<TDeviceUsage[]>([])
  const deviceId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()

  const [showDelete, setShowDelete] = useState<boolean>(false)
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const setDeleteIsClosed = () => setShowDelete(false)
  const handleClickDelete = () => {
    setShowDelete(true)
    setDevice(device)
  }

  const [showUnlock, setShowUnlock] = useState<boolean>(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [pin, setPin] = useState(['', '', '', ''])

  const lineColor = getCSSVariable('--active-color')

  useEffect(() => {
    if (deviceId && devices.length > 0) {
      const foundDevice = devices.find(device => device.deviceId === deviceId)
      if (foundDevice) {
        setDevice(foundDevice)
        setPowerVisualState(foundDevice.status)
        if (foundDevice.state && foundDevice.state.length > 0) {
          const value = String(foundDevice.state[stateIndex].value || '')
          setCurrentStateValue(value)
        }
      }
    }
  }, [deviceId, devices])

  useEffect(() => {
    setCurrentStateValue(device?.state[stateIndex].value?.toString() ?? '')
  }, [device, stateIndex])

  const fetchDeviceUsage = (
    startDate: Date,
    endDate: Date,
    period: TTimePeriod
  ) => {
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
  }, [deviceId, isAuthenticated])

  const handleSelect = (value: TTimeSelection) => {
    setTimeSelection(value)
    const [startDate, endDate, period] = geDateRangeAndPeriod(value)
    fetchDeviceUsage(startDate, endDate, period)
  }

  const updateDevice = (putData: TDevice | any) => {
    setUpdating(true)
    API.put(`/devices/${deviceId}/`, putData, 'Update device state')
      .then((response: AxiosResponse) => {
        const updatedDevice = {
          ...response.data,
          location: device?.location,
        }
        console.log(updatedDevice)
        setDevice(updatedDevice)
        setPowerVisualState(response.data.status)
        setDevices(
          devices.map(d =>
            d.deviceId === response.data.deviceId ? { ...updatedDevice } : d
          )
        )

        enqueueSnackbar('Device state updated successfully', {
          preventDuplicate: true,
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        })
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
        state: device.state.map((state, index) =>
          index === stateIndex
            ? { ...state, value: getFormattedStateValue() }
            : state
        ),
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

  const handleCloseUnlock = () => {
    setPin(['', '', '', ''])
    setShowUnlock(false)
  }

  const handlePinChange = (index: number, value: string) => {
    // Regex to accept only digits in 0-9
    if (!/^[0-9]?$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && pin[index] === '') {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newPin = [...pin]
        newPin[index - 1] = ''
        setPin(newPin)
      }
    }
  }

  const unlockDevice = () => {
    const postData = {
      pin: pin.join(''),
    }
    API.post(
      `/devices/unlock/${id}/`,
      postData,
      `Unlock device with ID ${device?.deviceId} request.\n`
    )
      .then((_: AxiosResponse) => {
        const newDevice = {
          ...(device as TDevice),
          unlocked: true,
        }
        setDevice(newDevice)
        setDevices(
          devices.map(d => (d.deviceId == device?.deviceId ? newDevice : d))
        )
        handleCloseUnlock()
      })
      .catch((err: AxiosError) => {
        console.error('POST request failed', err)
        inputRefs.current[0]?.focus()
        setPin(['', '', '', ''])
      })
  }

  const yAxisConfig = () => {
    const yValues = usageData.map(d => d.usage) ?? []
    const maxY = yValues.length > 0 ? Math.max(...yValues) * 1.2 : 10
    return [{ min: 0, max: Math.max(maxY, 10), label: 'Minutes' }]
  }

  return (
    <div className='device page-content'>
      <LoadingModal open={!devicesLoaded || loading} />
      <Modal open={showUnlock} onClose={handleCloseUnlock}>
        <Box className='unlock-device-modal'>
          <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
            Unlock Device
          </Typography>
          <Typography id='modal-description'>Enter device pin code</Typography>
          <div className='pin-inputs'>
            {pin.map((digit, index) => (
              <TextField
                key={index}
                type='tel'
                inputRef={el => (inputRefs.current[index] = el)}
                value={digit}
                onChange={e => handlePinChange(index, e.target.value)}
                onKeyDown={e =>
                  handleKeyDown(
                    index,
                    e as React.KeyboardEvent<HTMLInputElement>
                  )
                }
                variant='outlined'
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  style: { textAlign: 'center', fontSize: '1.5rem' },
                }}
                className='pin-field'
              />
            ))}
          </div>
          <div className='actions'>
            <Button className='cancel-btn' onClick={handleCloseUnlock}>
              <i className='bi bi-x-lg' />
              Cancel
            </Button>
            <Button className='update-btn' onClick={unlockDevice}>
              <i className='bi bi-unlock-fill' />
              Unlock
            </Button>
          </div>
        </Box>
      </Modal>
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
        <div className='device-grid-container container-1'>
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
                      <th>IP Address</th>
                      <td>{device?.ipAddress || 'Not available'}</td>
                    </tr>
                    <tr>
                      <th>Location</th>
                      <td>{device?.location || 'Not assigned'}</td>
                    </tr>
                    <tr>
                      <th>Power Status</th>
                      <td>
                        <div
                          className={`status ${
                            device?.status === 'On'
                              ? 'status-ok'
                              : 'status-fault'
                          }`}
                        >
                          <i
                            className={`bi ${
                              device?.status === 'On'
                                ? 'bi-battery-full'
                                : 'bi-power'
                            }`}
                          />
                          {device?.status}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>Fault Status</th>
                      <td>
                        <div
                          className={`status ${
                            device?.faultStatus === 'Ok'
                              ? 'status-ok'
                              : 'status-fault'
                          }`}
                        >
                          <i
                            className={`bi ${
                              device?.faultStatus === 'Ok'
                                ? 'bi-check-lg'
                                : 'bi-x-lg'
                            }`}
                          />
                          {device?.faultStatus}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>Unlocked</th>
                      <td>{device?.unlocked ? 'Yes' : 'No'}</td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </Paper>
          </div>

          <div className='device-grid-item device-usage'>
            <div className='usage-header'>
              <h5>Device Usage</h5>
              <Dropdown onSelect={handleSelect} />
            </div>
            <div className='data-container'>
              <LineChart
                yAxis={yAxisConfig()}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: usageData.map(entry => entry.datetime) ?? [],
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
                          color: lineColor,
                        },
                      ]
                    : []
                }
                slotProps={{ legend: { hidden: true } }}
                grid={{ vertical: true, horizontal: true }}
                className='device-line-chart line-chart'
              />
            </div>
          </div>
        </div>

        <div className='device-grid-container container-2'>
          {/* Device Tags */}
          <div className='device-grid-item'>
            <Paper elevation={2} className='device-tags'>
              <Box p={3}>
                <Typography
                  variant='h5'
                  gutterBottom
                  sx={{ paddingBottom: '15px' }}
                >
                  Device Tags
                </Typography>

                <TagsAutocomplete
                  device={device}
                  setDevice={setDevice}
                  type='Room'
                />
                <Typography variant='h6'>User & Custom Tags</Typography>
                <TagsAutocomplete
                  device={device}
                  setDevice={setDevice}
                  type='User'
                />
                <div style={{ height: '10px' }} />
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
                <Typography
                  variant='h5'
                  gutterBottom
                  sx={{ paddingBottom: '6px' }}
                >
                  Device Control
                </Typography>
                {device?.state && device?.state.length > 0 && (
                  <Typography className='state-name' variant='h6' gutterBottom>
                    {`Device State ${stateIndex + 1} of ${
                      device?.state.length
                    } - ${device?.state[stateIndex].fieldName} (${
                      device?.state[stateIndex].datatype
                    })`}
                  </Typography>
                )}
                {device?.state && device?.state.length > 0 ? (
                  <>
                    <table className='control-table'>
                      <tbody>
                        <tr>
                          <th>Current {device?.state[stateIndex].fieldName}</th>
                          <td>
                            <p
                              style={{
                                marginBlock: '2px',
                                marginLeft: '5%',
                              }}
                            >
                              {device?.state[stateIndex].value}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <th>New {device?.state[stateIndex].fieldName}</th>
                          <td>
                            <TextField
                              fullWidth
                              value={currentStateValue}
                              onChange={e =>
                                setCurrentStateValue(e.target.value)
                              }
                              placeholder={`Enter ${device?.state[stateIndex].datatype} value`}
                              variant='outlined'
                              size='small'
                            />
                          </td>
                        </tr>
                        <tr></tr>
                      </tbody>
                    </table>
                    <div className='control-buttons'>
                      <Button
                        variant='contained'
                        onClick={() => setStateIndex(stateIndex - 1)}
                        className='switch-state-btn prev'
                        disabled={updating || stateIndex == 0}
                        sx={{ mt: 2 }}
                      >
                        <i className='bi bi-chevron-left' />
                        Prev
                      </Button>
                      <Button
                        variant='contained'
                        onClick={handleUpdateDeviceState}
                        className='update-btn'
                        disabled={updating}
                        sx={{ mt: 2 }}
                      >
                        Set State
                      </Button>
                      <Button
                        variant='contained'
                        onClick={() => setStateIndex(stateIndex + 1)}
                        className='switch-state-btn next'
                        disabled={
                          updating || stateIndex == device.state.length - 1
                        }
                        sx={{ mt: 2 }}
                      >
                        Next
                        <i className='bi bi-chevron-right' />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Typography sx={{ mt: 2, width: '100%' }}>
                    This device does not have a controllable state.
                  </Typography>
                )}
              </Box>
            </Paper>
          </div>

          {/* Device Actions */}
          <div className='device-grid-item'>
            <Paper elevation={2} className='device-actions'>
              <Box p={3}>
                <Typography
                  variant='h5'
                  gutterBottom
                  sx={{ paddingBottom: '10px' }}
                >
                  Device Actions
                </Typography>
                <div className='buttons'>
                  <Button
                    disabled={updating}
                    onClick={handleUpdateDevicePower}
                    className={`power-btn ${powerVisualState.toLowerCase()}`}
                  >
                    <i className='bi bi-power' />
                    Turn Device {powerVisualState == 'On' ? 'Off' : 'On'}
                  </Button>
                  <Button
                    disabled={updating || device?.unlocked}
                    onClick={() => setShowUnlock(true)}
                    className='unlock-btn'
                  >
                    <i
                      className={`bi ${
                        device?.unlocked ? 'bi-unlock' : 'bi-lock'
                      }`}
                    />
                    {device?.unlocked ? 'Device is Unlocked' : 'Unlock Device'}
                  </Button>
                  <Button
                    disabled={updating}
                    onClick={() => setShowEdit(true)}
                    className='edit-btn'
                  >
                    <i className='bi bi-pencil' />
                    Edit Device Details
                  </Button>
                  <EditDeviceModal
                    showEdit={showEdit}
                    selectedDevice={device as TDevice}
                    setShowEdit={setShowEdit}
                  />
                  <Button
                    disabled={updating}
                    onClick={handleClickDelete}
                    className='delete-btn'
                  >
                    <i className='bi bi-trash' />
                    Delete Device
                  </Button>
                  <DeleteDeviceModal
                    showDelete={showDelete}
                    setDeleteIsClosed={setDeleteIsClosed}
                    selectedDevice={device as TDevice | null}
                    setSelectedDevice={
                      setDevice as Dispatch<SetStateAction<TDevice | null>>
                    }
                  />
                </div>
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
  const { tags, setTags, devices, setDevices } = useDevices()
  const [showAdd, setShowAdd] = useState<boolean>(false)
  const [tagName, setTagName] = useState<string>()
  const [inputValue, setInputValue] = useState('')
  const { API } = useApi()

  const [value, setValue] = useState<any>(type == 'Room' ? null : [])
  const [options, setOptions] = useState<any>([])

  useEffect(() => {
    if (!device || !tags) return
    setOptions(
      tags
        .filter(tag => tag.tagType === type)
        .map((tag: TTag) => ({
          id: tag.tagId,
          label: tag.name,
        }))
    )
  }, [device, tags, type])

  useEffect(() => {
    if (options && device) {
      const newValue =
        type !== 'Room'
          ? (device[type === 'Custom' ? 'customTags' : 'userTags']
              .map(tagId =>
                options.find(
                  (option: TMUIAutocompleteOption) => option?.id === tagId
                )
              )
              .filter(Boolean) as TMUIAutocompleteOption[])
          : options.find(
              (option: TMUIAutocompleteOption) => option?.id === device?.roomTag
            ) || null
      setValue(newValue)
    }
  }, [options])

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
          tagId: res.data.tagId,
          name: tagName,
          tagType: type,
        } as TTag
        const updatedTags = [...tags, createdTag]
        setTags(updatedTags)
        setOptions(
          updatedTags
            .filter(tag => tag.tagType === type)
            .map((tag: TTag) => ({
              id: tag.tagId,
              label: tag.name,
            }))
        )
        enqueueSnackbar(`Successfully created ${type.toLowerCase()} tag`, {
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

  const handleDeleteTag = (tag: TMUIAutocompleteOption) => {
    API.delete(
      `/tags/${tag?.id}/`,
      `Delete existing ${type.toLowerCase()} tag request\n`
    )
      .then((_: AxiosResponse) => {
        setTags(tags.filter(t => t.tagId !== tag?.id))
        enqueueSnackbar(`Successfully deleted ${type.toLowerCase()} tag`, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        })
      })
      .catch((err: AxiosError | any) => {
        console.error('DELETE request failed', err)
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
      type == 'Room' ? 'roomTag' : type == 'User' ? 'userTag' : 'customTag'
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
          ...res.data,
          location: tags.find(t => t.tagId === updatedDevice.roomTag)?.name,
        }
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
        id='tags-autocomplete'
        value={value}
        options={options}
        inputValue={inputValue}
        multiple={type != 'Room'}
        onChange={(_, option) => handleTagSelected(option)}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
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
              <Tooltip title={`Delete ${type.toLowerCase()} tag`}>
                <Button
                  className='delete-btn'
                  onClick={event => {
                    event.stopPropagation()
                    handleDeleteTag(option)
                  }}
                >
                  <i className='bi bi-trash' />
                  Delete
                </Button>
              </Tooltip>
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
      <Modal open={showAdd} onClose={handleCloseAddModal}>
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

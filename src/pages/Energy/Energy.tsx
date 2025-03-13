import DownloadReportButton from '../../components/ReportGeneration/ReportGeneration'
import { getTimePeriodForSelection, handleUpdateTimePeriod } from '../../utils'
import PieCenterLabel from '../../components/PieCenterLabel/PieCenterLabel'
import { ValidApiError, TTimeSelection } from '../../types/generalTypes'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useDeferredValue, useEffect, useState } from 'react'
import Dropdown from '../../components/Dropdown/Dropdown'
import { useDevices } from '../../contexts/DeviceContext'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { BarChart, PieChart } from '@mui/x-charts/'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { DatePicker } from '@mui/x-date-pickers'
import { enqueueSnackbar } from 'notistack'
import dayjs, { Dayjs } from 'dayjs'
import {
  TEnergyValues,
  TEnergyGoal,
  TEnergySums,
} from '../../types/energyTypes'
import {
  LinearProgress,
  TextField,
  Typography,
  Tooltip,
  Button,
  Modal,
  Box,
} from '@mui/material'
import './Energy.scss'

const colors = ['#07cb83', '#fbad53', '#ec443b']

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const Energy = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false)
  const [editModalIsOpen, setEditModalIsOpen] = useState<boolean>(false)
  const [addModalIsOpen, setAddModalIsOpen] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [currentGoal, setCurrentGoal] = useState<{
    target?: number
    name?: string
    id?: number
  }>({ name: '', target: undefined })
  useDeferredValue(currentGoal)

  const [energyValues, setEnergyValues] = useState<TEnergyValues>()
  const [energyGoals, setEnergyGoals] = useState<TEnergyGoal[]>([])
  const [energySums, setEnergySums] = useState<TEnergySums>({
    energyGenerated: 0,
    energyUsed: 0,
    netEnergy: 0,
    totalSum: 0,
  })

  const { API, loading, isAuthenticated } = useApi()
  const { devices } = useDevices()

  const fetchEnergyData = (
    startDate: Date,
    endDate: Date,
    timeSelection: TTimeSelection
  ) => {
    if (isAuthenticated) {
      const period = getTimePeriodForSelection(timeSelection)
      API.get(
        `/energy/?startDate=${startDate.toISOString().split('T')[0]}&endDate=${
          endDate.toISOString().split('T')[0]
        }&timePeriod=${period}`,
        'Fetch energy usage request',
        [404]
      )
        .then((res: AxiosResponse) => {
          const result: TEnergyValues = []

          res.data.forEach((item: any) => {
            const netEnergy = item.energyGeneration - item.energyUse
            result.push({
              datetime: new Date(item.datetime),
              energyGenerated:
                netEnergy > 0
                  ? item.energyGeneration - netEnergy
                  : item.energyGeneration,
              energyUsage:
                netEnergy < 0
                  ? -1 * item.energyUse - netEnergy
                  : -1 * item.energyUse,
              netEnergy: netEnergy,
            })
          })

          setEnergyValues(result)
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
        .catch(err => {
          if (err instanceof ValidApiError) {
            enqueueSnackbar(
              'No energy data found for the\n selected time period.',
              {
                preventDuplicate: true,
                variant: 'warning',
                style: {
                  maxWidth: '200px',
                  textAlign: 'left',
                  whiteSpace: 'pre-line',
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'center',
                },
              }
            )
          } else {
            console.error('GET request failed', err)
          }
        })
    }
  }

  const fetchEnergyGoals = () => {
    if (isAuthenticated)
      API.get('/goals/', 'Fetch energy goals request').then(
        (res: AxiosResponse) => {
          setEnergyGoals(
            res.data.map((goal: any) => ({
              ...goal,
              date: goal.date ? new Date(goal.date) : undefined,
            }))
          )
        }
      )
  }

  useEffect(() => {
    // Create start date
    handleSelect('Today')
    fetchEnergyGoals()
  }, [isAuthenticated])

  // Event handlers
  const handleAddModalClose = () => {
    setAddModalIsOpen(false)
    setSelectedDate(null)
    setCurrentGoal({
      target: undefined,
      name: '',
    })
  }

  const handleEditModalOpen = (row: TEnergyGoal) => {
    setEditModalIsOpen(true)
    setSelectedDate(dayjs(row.date))
    setCurrentGoal({
      id: row.goalId,
      target: row.target,
      name: row.name,
    })
  }

  const handleEditModalClose = () => {
    setEditModalIsOpen(false)
    setSelectedDate(null)
    setCurrentGoal({
      target: undefined,
      name: '',
    })
  }

  const handleDeleteModalOpen = (row: TEnergyGoal) => {
    setDeleteModalIsOpen(true)
    setCurrentGoal({
      id: row.goalId,
      target: row.target,
      name: row.name,
    })
  }

  const handleDeleteModalClosed = () => {
    setDeleteModalIsOpen(false)
    setCurrentGoal({
      target: undefined,
      name: '',
    })
  }

  const handleAddModalSubmit = () => {
    const postData = {
      name: currentGoal.name,
      target: currentGoal.target,
      date: selectedDate?.utc().format('YYYY-MM-DD'),
    }
    API.post('/goals/', postData, 'Create new goal request\n')
      .then((res: AxiosResponse) => {
        setEnergyGoals([
          ...energyGoals,
          {
            ...res.data,
            date: res.data.date ? new Date(res.data.date) : undefined,
          },
        ])
        enqueueSnackbar('Successfully added energy goal', {
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
        handleAddModalClose()
      })
  }

  const handleEditModalSubmit = () => {
    if (currentGoal.id) {
      const putData = {
        name: currentGoal.name,
        target: currentGoal.target,
        date: selectedDate?.utc().format('YYYY-MM-DD'),
      }
      API.put(`/goals/${currentGoal.id}/`, putData, 'Create new goal request\n')
        .then((res: AxiosResponse) => {
          setEnergyGoals(
            energyGoals.map((goal: TEnergyGoal) =>
              goal.goalId === res.data.goalId
                ? { ...res.data, date: new Date(res.data.date) }
                : goal
            )
          )
          enqueueSnackbar('Successfully updated energy goal', {
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
          handleEditModalClose()
        })
    }
  }

  const handleConfirmDelete = () => {
    if (currentGoal.id) {
      API.delete(`/goals/${currentGoal.id}/`, 'Delete selected goal request\n')
        .then((_: AxiosResponse) => {
          setEnergyGoals(
            energyGoals.filter(goal => goal.goalId !== currentGoal.id)
          )
          enqueueSnackbar('Successfully deleted energy goal', {
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
        .finally(() => {
          handleDeleteModalClosed()
        })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGoal(prev => {
      return {
        ...prev,
        [e.target.name]:
          e.target.type == 'number'
            ? parseFloat(e.target.value)
            : e.target.value,
      }
    })
  }

  const handleSelect = (value: string) => {
    if (['Today', 'Past week', 'Past month', 'Past year'].includes(value)) {
      const endDate = new Date()
      const startDate = handleUpdateTimePeriod(value as TTimeSelection)
      endDate.setDate(endDate.getDate() + 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
      fetchEnergyData(startDate, endDate, value as TTimeSelection)
    } else {
      console.error('Invalid time period selected:', value)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      flex: 8,
    },
    {
      field: 'target',
      headerName: 'Target',
      width: 100,
    },
    {
      field: 'progress',
      headerName: 'Progress',
      minWidth: 150,
      flex: 25,
      renderCell: (params: any) => {
        const percentage = (params.row.progress / params.row.target) * 100
        return (
          <Box>
            <LinearProgress
              variant='determinate'
              value={percentage}
              sx={{
                width: '90%',
              }}
            />
            <Typography>{`${Math.round(percentage)}%`}</Typography>
          </Box>
        )
      },
    },
    {
      field: 'date',
      headerName: 'Deadline',
      minWidth: 150,
      maxWidth: 250,
      flex: 8,
      renderCell: (params: any) => {
        return dateFormatter.format(params.value)
      },
    },
    {
      field: 'deviceActions',
      headerName: 'Actions',
      resizable: false,
      width: 100,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => {
        return (
          <div className='actions'>
            <Tooltip title='Edit device'>
              <Button onClick={() => handleEditModalOpen(params.row)}>
                <i className='bi bi-pencil' />
              </Button>
            </Tooltip>
            <Tooltip title='Delete device'>
              <Button onClick={() => handleDeleteModalOpen(params.row)}>
                <i className='bi bi-trash' />
              </Button>
            </Tooltip>
            <Modal open={deleteModalIsOpen} onClose={handleDeleteModalClosed}>
              <Box>
                <Typography
                  id='modal-modal-title'
                  fontWeight='bold'
                  variant='h5'
                >
                  Remove Goal from System:
                </Typography>
                <div className='modal-table device-info'>
                  <strong>Device ID:</strong> {currentGoal?.id}
                  <strong>Name:</strong> {currentGoal?.name}
                  <strong>Target:</strong> {currentGoal?.target}
                </div>
                <Typography id='modal-description' sx={{ mt: 2 }}>
                  Are you sure you want to delete this goal from the system?
                  Once it has been removed, it will needed to be created again.
                </Typography>
                <div className='actions'>
                  <Button
                    className='cancel-btn'
                    onClick={handleDeleteModalClosed}
                  >
                    <i className='bi bi-x-lg' />
                    Cancel
                  </Button>
                  <Button className='delete-btn' onClick={handleConfirmDelete}>
                    <i className='bi bi-trash' />
                    Delete
                  </Button>
                </div>
              </Box>
            </Modal>
          </div>
        )
      },
    },
  ]

  return (
    <div className='energy page-content'>
      <LoadingModal open={loading} />
      <div className='page-header'>
        <h2 className='page-title'>Energy Data</h2>
        <DownloadReportButton devices={devices} />
      </div>
      {/* Container for device usage */}
      <div className='energy-data page-card'>
        <div className='header'>
          Energy Generation and Usage
          <Dropdown
            options={['Today', 'Past week', 'Past month', 'Past year']}
            onSelect={handleSelect}
          />
        </div>
        <div className='data-container'>
          <ul className='consumption-list'>
            <li key={1}>
              <PieChart
                className='pie-chart'
                slotProps={{ legend: { hidden: true } }}
                tooltip={{ trigger: 'none' }}
                series={[
                  {
                    innerRadius: '70%',
                    data: [
                      {
                        value: energySums.energyGenerated / energySums.totalSum,
                        color: colors[0],
                      },
                      {
                        value: energySums.totalSum
                          ? energySums.energyUsed / energySums.totalSum
                          : 100,
                        color: '#3d4e69',
                      },
                    ],
                  },
                ]}
              >
                <PieCenterLabel>
                  {(energySums.totalSum
                    ? (energySums.energyGenerated / energySums.totalSum) * 100
                    : 0
                  ).toFixed(0) + '%'}
                </PieCenterLabel>
              </PieChart>
              <div className='data-label'>
                <p className='label'>Generation</p>
                <p className='details'>{`${energySums.energyGenerated.toFixed(
                  2
                )} kWh`}</p>
              </div>
            </li>
            <li key={2}>
              <PieChart
                className='pie-chart'
                slotProps={{ legend: { hidden: true } }}
                tooltip={{ trigger: 'none' }}
                series={[
                  {
                    innerRadius: '70%',
                    data: [
                      {
                        value: energySums.energyUsed / energySums.totalSum,
                        color: colors[2],
                      },
                      {
                        value: energySums.totalSum
                          ? energySums.energyGenerated / energySums.totalSum
                          : 100,
                        color: '#3d4e69',
                      },
                    ],
                  },
                ]}
              >
                <PieCenterLabel>
                  {(energySums.totalSum
                    ? (energySums.energyUsed / energySums.totalSum) * 100
                    : 0
                  ).toFixed(0) + '%'}
                </PieCenterLabel>
              </PieChart>
              <div className='data-label'>
                <p className='label'>Consumption</p>
                <p className='details'>{`${energySums.energyUsed.toFixed(
                  2
                )} kWh`}</p>
              </div>
            </li>
            <li>
              <div className='net-energy'>
                <NetEnergyDial
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
            </li>
          </ul>
          {!loading && (
            <BarChart
              dataset={energyValues}
              xAxis={[
                {
                  scaleType: 'band',
                  data: energyValues?.map(entry => entry.datetime) ?? [],
                  valueFormatter: value => {
                    const date = value instanceof Date ? value : new Date(value)
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
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
                energyValues
                  ? [
                      {
                        color: colors[1],
                        label: 'Net Total',
                        data: energyValues?.map(e => e.netEnergy) ?? [],
                        valueFormatter: v => {
                          return (v ?? 0.0).toFixed(1) + ' kWh'
                        },
                        stack: 'total',
                      },
                      {
                        color: colors[0],
                        label: 'Generation',
                        data: energyValues?.map(e => e.energyGenerated) ?? [],
                        valueFormatter: v =>
                          v !== null && v !== undefined
                            ? `${Number(v).toFixed(1)} kWh`
                            : '0.0 kWh',
                        stack: 'total',
                      },
                      {
                        color: colors[2],
                        label: 'Usage',
                        data: energyValues?.map(e => e.energyUsage) ?? [],
                        valueFormatter: v =>
                          v !== null && v !== undefined
                            ? `${Number(v).toFixed(1)} kWh`
                            : '0.0 kWh',
                        stack: 'total',
                      },
                    ]
                  : []
              }
              slotProps={{ legend: { hidden: true } }}
              grid={{ vertical: true, horizontal: true }}
              className='bar-chart'
            />
          )}
        </div>
      </div>

      {/* Energy Goals */}
      <div className='page-header'>
        <h2 className='page-title'>Energy Goals</h2>
        <Button variant='contained' onClick={() => setAddModalIsOpen(true)}>
          <i className='bi bi-plus-lg' />
          Add Energy Goal
        </Button>
      </div>
      <div className='energy-goals page-card'>
        <DataGrid
          rows={energyGoals}
          columns={columns}
          paginationMode='server'
          rowCount={energyGoals?.length}
          getRowId={row => row.goalId}
          disableRowSelectionOnClick
          disableColumnResize
          slots={{
            noRowsOverlay: () => (
              <Box>
                <Typography>No data available</Typography>
              </Box>
            ),
          }}
        />
      </div>

      {/* Modals */}
      <Modal
        open={addModalIsOpen || editModalIsOpen}
        onClose={addModalIsOpen ? handleAddModalClose : handleEditModalClose}
      >
        <Box>
          <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
            {addModalIsOpen ? 'Add' : 'Update'} Energy Goal
          </Typography>
          <div className='modal-table goal-info'>
            <strong className='input-field-name'>Name:</strong>
            <TextField
              size='small'
              name='name'
              placeholder='Name of energy goal'
              value={currentGoal?.name}
              onChange={handleChange}
            />
            <strong className='input-field-name'>Target:</strong>
            <TextField
              size='small'
              type='number'
              name='target'
              placeholder='Target value (kWh)'
              value={currentGoal?.target}
              onChange={handleChange}
            />
          </div>
          <div className='modal-details-container'>
            <strong className='field-name'>Goal Deadline:</strong>
            <DatePicker
              format='dddd DD MMMM YYYY'
              onChange={date => setSelectedDate(date)}
              value={selectedDate}
            />
          </div>
          <div className='event-actions actions'>
            <Button
              className='cancel-btn'
              onClick={
                addModalIsOpen ? handleAddModalClose : handleEditModalClose
              }
            >
              <i className='bi bi-x-lg' />
              Cancel
            </Button>
            <Button
              className={addModalIsOpen ? 'submit-btn' : 'update-btn'}
              onClick={
                addModalIsOpen ? handleAddModalSubmit : handleEditModalSubmit
              }
            >
              <i className='bi bi-floppy' />
              {addModalIsOpen ? 'Create' : 'Save'}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

const NetEnergyDial = ({ angle, value }: { angle: number; value: string }) => {
  return (
    <svg className='pie-chart' width='1000' height='1000' viewBox='0 0 300 170'>
      <g transform='translate(125, 190)'>
        <path
          d='M-116.438,-3.812A116.5,116.5,0,0,1,-56.525,-101.868L-43.225,-75.934A87.375,87.375,0,0,0,-87.292,-3.812Z'
          visibility='visible'
          cursor='unset'
          fill='#ec443b'
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />
        <path
          d='M-49.741,-105.347A116.5,116.5,0,0,1,-0.763,-116.498L-1.526,-87.362A87.375,87.375,0,0,0,-36.441,-79.413Z'
          visibility='visible'
          cursor='unset'
          fill='#fbad53'
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />
        <path
          d='M6.859,-116.298A116.5,116.5,0,0,1,116.438,-3.812L87.292,-3.812A87.375,87.375,0,0,0,6.096,-87.162Z'
          visibility='visible'
          cursor='unset'
          fill='#07cb83'
          opacity='1'
          filter='none'
          strokeWidth='0'
          strokeLinejoin='round'
        />
        <text x='-48' y='-6' className='pie-center-item'>
          {value}
        </text>
        <text x='-104' y='20' className='net-energy-label'>
          Net returned to the grid
        </text>
        <line
          x1='0'
          y1='-50'
          x2='0'
          y2='-100'
          stroke='white'
          strokeWidth='6'
          strokeLinecap='round'
          transform={`rotate(${angle})`}
        />
      </g>
    </svg>
  )
}

export default Energy

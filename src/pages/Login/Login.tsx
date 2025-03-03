import { useApi } from '../../contexts/ApiContext'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import { useState, useRef } from 'react'
import {
  ToggleButtonGroup,
  InputAdornment,
  ToggleButton,
  Typography,
  IconButton,
  TextField,
  Button,
  Box,
  Card,
} from '@mui/material'
import './Login.scss'
import { enqueueSnackbar } from 'notistack'

const TOUCHSCREEN_LOGIN = {
  username: 'touchscreen',
  password: 'touchscreenPassword',
}

const Login = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [mode, setMode] = useState<'login' | 'pin'>('login')
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [passwordCheck, setPasswordCheck] = useState('')
  const [showLogin, setShowLogin] = useState(true)

  const [pin, setPin] = useState(['', '', '', ''])
  const [userCredentials, setUserCredentials] = useState({
    username: '',
    password: '',
  })

  const { API, setIsAuthenticated } = useApi()
  const navigate = useNavigate()

  // Handle form changes
  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value })
  }

  const handlePinChange = (index: number, value: string) => {
    // Regex to accept only digits in 0-9
    if (!/^[0-9]?$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) inputRefs.current[index + 1]?.focus()
    else if (newPin.join('').length === 4) handlePinSubmit(newPin.join(''))
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

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordCheck(e.target.value)
  }

  // Handle submits
  const handleLogin = (localRequest: boolean) => {
    API.post(
      '/accounts/login/',
      localRequest ? TOUCHSCREEN_LOGIN : userCredentials,
      'Login attempt failed\n Username or password incorrect\n'
    ).then((res: AxiosResponse) => {
      localStorage.setItem('token', res.data.token)
      axios.defaults.headers.common['token'] = res.data.token
      setIsAuthenticated(true)
      navigate(localRequest ? '/local' : '/remote')
    })
  }

  const handlePinSubmit = (pinValue?: string) => {
    const postData = {
      pinCode: pinValue ? pinValue : pin.join(),
    }
    API.post(
      '/unlock/',
      postData,
      'Failed to unlock device\n Incorrect pin code\n'
    ).then((_: AxiosResponse) => {
      handleLogin(true)
    })
  }

  const handleSignUp = () => {
    if (userCredentials.password !== passwordCheck) {
      enqueueSnackbar('Your passwords do not match. Please try again', {
        preventDuplicate: true,
        variant: 'error',
        style: {
          maxWidth: '200px',
          textAlign: 'left',
          whiteSpace: 'pre-line',
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      })
    }
    API.post(
      '/accounts/signup/',
      userCredentials,
      'Sign up attempt failed'
    ).then((_: AxiosResponse) => {
      enqueueSnackbar('Successfully created your new account', {
        preventDuplicate: true,
        variant: 'success',
        style: {
          maxWidth: '200px',
          textAlign: 'left',
          whiteSpace: 'pre-line',
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      })
      setUserCredentials({
        username: userCredentials.username,
        password: '',
      })
      setPasswordCheck('')
      setShowPassword1(false)
      setShowPassword2(false)
      setShowLogin(true)
    })
  }

  const resetUserCredentials = () => {
    setUserCredentials({
      username: '',
      password: '',
    })
  }

  return (
    <Box className='login-container'>
      <Card className='login-card'>
        {showLogin ? (
          <>
            <h2>Login</h2>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, newMode) => newMode && setMode(newMode)}
              className='toggle-group'
            >
              <ToggleButton value='login'>Remote</ToggleButton>
              <ToggleButton value='pin'>Local</ToggleButton>
            </ToggleButtonGroup>

            {mode === 'login' ? (
              <Box className='login-form'>
                <TextField
                  label='Username'
                  variant='outlined'
                  fullWidth
                  name='username'
                  value={userCredentials.username}
                  onChange={handleCredentialChange}
                />
                <TextField
                  label='Password'
                  type={showPassword1 ? 'text' : 'password'}
                  variant='outlined'
                  fullWidth
                  name='password'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword1(prev => !prev)}
                          edge='end'
                        >
                          {showPassword1 ? (
                            <i className='bi bi-eye' />
                          ) : (
                            <i className='bi bi-eye-slash' />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  value={userCredentials.password}
                  onChange={handleCredentialChange}
                />
                <Button
                  color='primary'
                  variant='contained'
                  className='submit-btn'
                  onClick={() => handleLogin(false)}
                  fullWidth
                >
                  Sign In
                </Button>
                <div className='signup-link'>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setShowLogin(false)
                      resetUserCredentials()
                      setShowPassword1(false)
                      setShowPassword2(false)
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </Box>
            ) : (
              <Box className='pin-container'>
                <Typography>Enter your pin code</Typography>
                <Box className='pin-inputs'>
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
                </Box>
                <Button
                  fullWidth
                  color='primary'
                  variant='contained'
                  className='submit-btn'
                  onClick={() => handlePinSubmit()}
                >
                  Sign In
                </Button>
              </Box>
            )}
          </>
        ) : (
          <>
            <h2>Create Account</h2>
            <Box className='login-form'>
              <TextField
                label='Username'
                variant='outlined'
                fullWidth
                name='username'
                value={userCredentials.username}
                onChange={handleCredentialChange}
              />
              <TextField
                label='Password'
                type={showPassword1 ? 'text' : 'password'}
                variant='outlined'
                fullWidth
                name='password'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setShowPassword1(prev => !prev)}
                        edge='end'
                      >
                        {showPassword1 ? (
                          <i className='bi bi-eye' />
                        ) : (
                          <i className='bi bi-eye-slash' />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={userCredentials.password}
                onChange={handleCredentialChange}
              />
              <TextField
                label='Confirm Password'
                type={showPassword2 ? 'text' : 'password'}
                variant='outlined'
                fullWidth
                name='password'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setShowPassword2(prev => !prev)}
                        edge='end'
                      >
                        {showPassword2 ? (
                          <i className='bi bi-eye' />
                        ) : (
                          <i className='bi bi-eye-slash' />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={passwordCheck}
                onChange={handleConfirmPasswordChange}
              />
              <Button
                color='primary'
                variant='contained'
                className='submit-btn'
                onClick={handleSignUp}
                fullWidth
              >
                Sign Up
              </Button>
              <div className='signup-link'>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setShowLogin(true)
                    resetUserCredentials()
                    setPasswordCheck('')
                    setShowPassword1(false)
                    setShowPassword2(false)
                  }}
                >
                  Log In
                </button>
              </div>
            </Box>
          </>
        )}
      </Card>
    </Box>
  )
}

export default Login

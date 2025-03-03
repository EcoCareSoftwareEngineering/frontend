import { useApi } from '../../contexts/ApiContext'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import { useState, useRef } from 'react'
import {
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
  Box,
  Card,
} from '@mui/material'
import './Login.scss'

const TOUCHSCREEN_LOGIN = {
  username: 'touchscreen',
  password: 'touchscreenPassword',
}

const Login = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [pin, setPin] = useState(['', '', '', ''])
  const [mode, setMode] = useState<'login' | 'pin'>('login')
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

  return (
    <Box className='login-container'>
      <Card className='login-card'>
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
              type='password'
              variant='outlined'
              fullWidth
              name='password'
              value={userCredentials.password}
              onChange={handleCredentialChange}
            />
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleLogin(false)}
              fullWidth
            >
              Sign In
            </Button>
            <p className='signup-link'>
              Don't have an account? <a href='#'>Sign Up</a>
            </p>
          </Box>
        ) : (
          <Box className='pin-container'>
            <Box className='pin-inputs'>
              {pin.map((digit, index) => (
                <TextField
                  key={index}
                  inputRef={el => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={e => handlePinChange(index, e.target.value)}
                  variant='outlined'
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '1.5rem' },
                  }}
                  className='pin-field'
                />
              ))}
            </Box>
            <Button
              variant='contained'
              color='primary'
              fullWidth
              onClick={() => handlePinSubmit()}
            >
              Verify Pin
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default Login

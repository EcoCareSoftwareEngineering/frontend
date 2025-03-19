import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DeviceProvider } from './contexts/DeviceContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ApiProvider } from './contexts/ApiContext'
import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import AppRouter from './AppRouter'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'
import './App.scss'

// @ts-ignore - Import alias in vite.config
import 'bootstrap-icons'

dayjs.extend(utc)

function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <SnackbarProvider>
              <DeviceProvider>
                <AppRouter />
              </DeviceProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ApiProvider>
    </BrowserRouter>
  )
}

export default App

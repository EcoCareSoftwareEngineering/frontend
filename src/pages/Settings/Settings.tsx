import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useTheme } from '../../contexts/ThemeContext'
import './Settings.scss'

const Settings = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className='settings page-content'>
      <LoadingModal open={false} />
      <div className='page-header'>
        <h2 className='page-title'>Settings</h2>
      </div>
      <button onClick={toggleTheme} className='p-2'>
        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </button>
    </div>
  )
}

export default Settings

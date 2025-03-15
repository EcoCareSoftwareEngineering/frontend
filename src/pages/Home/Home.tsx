import DeviceUseByRoom from '../../components/DeviceUseByRoom/DeviceUseByRoom'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useApi } from '../../contexts/ApiContext'
import { useEffect } from 'react'
import './Home.scss'

// HOME PAGE SHOULD SHOW THIS:
// Device usage by room
// Solar panel performance
// Thermostat temp + humidity
// Security activity?
// Device faults?

const Home = () => {
  const { API, loading } = useApi()

  // Fix viewport size update styles
  useEffect(() => {
    if (localStorage.getItem('starting')) {
      document.body.style.display = 'none'
      setTimeout(() => (document.body.style.display = 'block'), 50)
      localStorage.removeItem('starting')
    }
  }, [])

  return (
    <div className='home page-content'>
      {/* Container for device usage */}
      <LoadingModal open={loading} />
      <div className='energy-consumption'>
        <DeviceUseByRoom />
      </div>

      {/* Container for various metrics */}
      <div className='item-container'>
        <div className='item'> </div>
        <div className='item'> </div>
        <div className='item'> </div>
        <div className='item'> </div>
      </div>
    </div>
  )
}

export default Home

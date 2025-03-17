import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { useApi } from '../../contexts/ApiContext'
import './Messages.scss'

const Settings = () => {
  const { loading } = useApi()

  return (
    <div className='messages page-content'>
      <LoadingModal open={loading} />
      <div className='page-header'>
        <h2 className='page-title'>Messages</h2>
      </div>
      <h3 className='page-title'>Not to be implemented in the prototype</h3>
    </div>
  )
}

export default Settings

import './App.css'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// @ts-ignore - Import alias in vite.config
import 'bootstrap-icons'
import Devices from './pages/Devices/Devices'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/devices' element={<Devices />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

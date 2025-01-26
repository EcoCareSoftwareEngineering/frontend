import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className='navbar'>
      <div className='navbar-logo'>
        <Link to='/'>
          <img src='/tree.png' />
          EcoCare
        </Link>
      </div>

      {/* Toggle button for mobile */}
      <button className='navbar-toggle' onClick={toggleMenu}>
        {isOpen ? '✖' : '☰'}
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li>
          <Link to='/' onClick={() => setIsOpen(false)}>
            <i className='bi bi-house'></i>
            Home
          </Link>
        </li>
        <li>
          <Link to='/devices' onClick={() => setIsOpen(false)}>
            Devices
          </Link>
        </li>
        <li>
          <Link to='/analytics' onClick={() => setIsOpen(false)}>
            Analytics
          </Link>
        </li>
        <li>
          <Link to='/rules' onClick={() => setIsOpen(false)}>
            Rules
          </Link>
        </li>
        <li>
          <Link to='/account' onClick={() => setIsOpen(false)}>
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar

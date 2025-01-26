import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.scss'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const getLinkClassName = (path: string) => {
    return location.pathname === path ? 'nav-button active' : 'nav-button'
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className='navbar'>
      <div className='navbar-logo'>
        <Link to='/'>
          Eco
          <p style={{ color: '#1f8cfb' }}>Care</p>
        </Link>
      </div>

      <button className='navbar-toggle' onClick={toggleMenu}>
        {isOpen ? '✖' : '☰'}
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li>
          <Link
            to='/'
            className={getLinkClassName('/')}
            onClick={() => setIsOpen(false)}
          >
            <div className='bar' />
            <i className='bi bi-house' />
            Home
          </Link>
        </li>
        <li>
          <Link
            to='/devices'
            className={getLinkClassName('/devices')}
            onClick={() => setIsOpen(false)}
          >
            <div className='bar' />
            <i className='bi bi-pc-display-horizontal' />
            Devices
          </Link>
        </li>
        <li>
          <Link
            to='/analytics'
            className={getLinkClassName('/analytics')}
            onClick={() => setIsOpen(false)}
          >
            <div className='bar' />
            <i className='bi bi-graph-up' />
            Analytics
          </Link>
        </li>
        <li>
          <Link
            to='/rules'
            className={getLinkClassName('/rules')}
            onClick={() => setIsOpen(false)}
          >
            <div className='bar' />
            <i className='bi bi-calendar-week' />
            Rules
          </Link>
        </li>
        <li>
          <Link
            to='/settings'
            className={getLinkClassName('/settings')}
            onClick={() => setIsOpen(false)}
          >
            <div className='bar' />
            <i className='bi bi-gear' />
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar

import { Link, useLocation } from 'react-router-dom'
import { getLinkTopLevel } from '../../utils'
import { useState } from 'react'
import './Navbar.scss'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const getLinkClassName = (path: string) => {
    if (path === window.location.pathname) {
      return 'nav-button active'
    } else if (path !== getLinkTopLevel()) {
      return location.pathname.includes(path)
        ? 'nav-button active'
        : 'nav-button'
    } else {
      return 'nav-button'
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className='navbar'>
      <div className='navbar-header'>
        {/* Navbar Logo */}
        <div className='navbar-logo'>
          <Link to={getLinkTopLevel()}>
            Eco<p style={{ color: '#2992ff' }}>Care</p>
          </Link>
        </div>

        {/* Mobile toggle menu button */}
        <button
          className={`navbar-toggle ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <div className='bars-container'>
            <div className='bars' id='bar1' />
            <div className='bars' id='bar2' />
            <div className='bars' id='bar3' />
          </div>
        </button>
      </div>

      {/* Main Navigation Links */}
      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <div className='main-links'>
          <li>
            <Link
              to={getLinkTopLevel()}
              className={getLinkClassName(getLinkTopLevel())}
              onClick={() => setIsOpen(false)}
            >
              <div className='bar' />
              <i className='bi bi-house' />
              Overview
            </Link>
          </li>
          <li>
            <Link
              to={`${getLinkTopLevel()}/devices`}
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
              to={`${getLinkTopLevel()}/energy`}
              className={getLinkClassName('/energy')}
              onClick={() => setIsOpen(false)}
            >
              <div className='bar' />
              <i className='bi bi-graph-up' />
              Energy
            </Link>
          </li>
          <li>
            <Link
              to={`${getLinkTopLevel()}/automation`}
              className={getLinkClassName('/automation')}
              onClick={() => setIsOpen(false)}
            >
              <div className='bar' />
              <i className='bi bi-calendar-week' />
              Automation
            </Link>
          </li>
          <li>
            <Link
              to={`${getLinkTopLevel()}/messages`}
              className={getLinkClassName('/messages')}
              onClick={() => setIsOpen(false)}
            >
              <div className='bar' />
              <i className='bi bi-chat-dots' />
              Messages
            </Link>
          </li>
          <li>
            <Link
              to={`${getLinkTopLevel()}/settings`}
              className={getLinkClassName('/settings')}
              onClick={() => setIsOpen(false)}
            >
              <div className='bar' />
              <i className='bi bi-gear' />
              Settings
            </Link>
          </li>
        </div>
        <div>
          <li>
            <Link to={`/`} className='nav-button logout-button'>
              <i
                className={`bi ${
                  getLinkTopLevel().includes('local')
                    ? 'bi-power'
                    : 'bi-box-arrow-left'
                }`}
              />
              {getLinkTopLevel().includes('local') ? 'Power Off' : 'Sign Out'}
            </Link>
          </li>
        </div>
      </ul>
    </nav>
  )
}

export default Navbar

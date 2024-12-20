import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">EcoCare</Link>
      </div>

      {/* Toggle button for mobile */}
      <button className="navbar-toggle" onClick={toggleMenu}>
        {isOpen ? '✖' : '☰'}
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li>
          <Link to="/" onClick={() => setIsOpen(false)}>Dashboard</Link>
        </li>
        <li>
          <Link to="/devices" onClick={() => setIsOpen(false)}>Devices</Link>
        </li>
        <li>
          <Link to="/utilities" onClick={() => setIsOpen(false)}>Utilities</Link>
        </li>
        <li>
          <Link to="/account" onClick={() => setIsOpen(false)}>My Account</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

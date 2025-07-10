import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const SuperAdminNavbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={() => setIsMobile(false)}>
          Super Admin Panel
        </NavLink>

        <div className={`nav-menu ${isMobile ? 'active' : ''}`}>
          <NavLink to="/superadmindashboard" className="nav-item" onClick={() => setIsMobile(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/sa-attendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Attendance
          </NavLink>
          {/* <NavLink to="/sa-dailyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Daily Attendance
          </NavLink> */}
          <div className="nav-item dropdown">
            <span className="dropdown-toggle">Daily Attendance ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/sa-dailyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Daily Attendance
              </NavLink>
              <NavLink to="/sa-a-attendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Admins Daily Attendance
              </NavLink>
            </div>
          </div>
          {/* <NavLink to="/sa-monthlyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Monthly Attendance
          </NavLink> */}
          <div className="nav-item dropdown">
            <span className="dropdown-toggle">Monthly Attendance ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/sa-monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Monthly Attendance
              </NavLink>
              <NavLink to="/sa-a-monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Admins Monthly Attendance
              </NavLink>
            </div>
          </div>
          {/* <NavLink to="/sa-leaves" className="nav-item" onClick={() => setIsMobile(false)}>
            Leaves
          </NavLink> */}
          <div className="nav-item dropdown">
            <span className="dropdown-toggle">Leaves ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/sa-leaves" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Leaves
              </NavLink>
              <NavLink to="/sa-a-leave" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Admins Leaves
              </NavLink>
            </div>
          </div>
        </div>

        <div className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
          {isMobile ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default SuperAdminNavbar;

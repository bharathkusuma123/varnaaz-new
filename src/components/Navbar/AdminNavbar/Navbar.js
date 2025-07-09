import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const AdminNavbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={() => setIsMobile(false)}>
         Admin Panel
        </NavLink>

        <div className={`nav-menu ${isMobile ? 'active' : ''}`}>
           <NavLink to="/admindashboard" className="nav-item" onClick={() => setIsMobile(false)}>
            Managers
          </NavLink>
          <NavLink to="/attendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Attendance
          </NavLink>
          <NavLink to="/dailyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Daily Attendance
          </NavLink>
          <NavLink to="/monthlyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Monthly Attendance
          </NavLink>
          <NavLink to="/leaves" className="nav-item" onClick={() => setIsMobile(false)}>
            Leaves
          </NavLink>
        </div>

        <div className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
          {isMobile ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

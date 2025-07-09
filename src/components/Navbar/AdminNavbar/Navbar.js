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

           <div className="nav-item dropdown">
            <span className="dropdown-toggle">Daily Attendance ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/dailyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Daily Attendance
              </NavLink>
              <NavLink to="/a-m-attendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Managers Daily Attendance
              </NavLink>
            </div>
          </div>


          {/* <NavLink to="/dailyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Daily Attendance
          </NavLink> */}

           <div className="nav-item dropdown">
            <span className="dropdown-toggle">Monthly Attendance ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Monthly Attendance
              </NavLink>
              <NavLink to="/a-m-monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Managers Monthly Attendance
              </NavLink>
            </div>
          </div>
          {/* <NavLink to="/monthlyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Monthly Attendance
          </NavLink> */}

            <div className="nav-item dropdown">
            <span className="dropdown-toggle">Leaves ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/leaves" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Leaves
              </NavLink>
              <NavLink to="/a-m-leave" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Managers Leaves
              </NavLink>
            </div>
          </div>
          {/* <NavLink to="/leaves" className="nav-item" onClick={() => setIsMobile(false)}>
            Leaves
          </NavLink> */}
        </div>

        <div className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
          {isMobile ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

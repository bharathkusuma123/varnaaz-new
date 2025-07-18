
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const AdminNavbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsMobile(false);
    // You can also add auth clearing logic here if needed
    navigate('/');
  };

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

             <div className="nav-item dropdown">
                      <span className="dropdown-toggle">Task Manager ▾</span>
                      <div className="dropdown-menu">
                        <NavLink to="/a-taskmanager" className="dropdown-item" onClick={() => setIsMobile(false)}>
                           Task Manager
                        </NavLink>
                        <NavLink to="/a-mytaskmanager" className="dropdown-item" onClick={() => setIsMobile(false)}>
                          My Tasks
                        </NavLink>
                      </div>
                    </div>
            {/* <NavLink to="/a-taskmanager" className="nav-item" onClick={() => setIsMobile(false)}>
                Task Manager
              </NavLink> */}

          {/* Logout shown in mobile view */}
          <div className="nav-item logout-icon-mobile" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </div>
        </div>

        <div className="navbar-icons">
          {/* Logout shown in desktop view */}
          <div className="logout-icon-desktop" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </div>
          <div className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
            {isMobile ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

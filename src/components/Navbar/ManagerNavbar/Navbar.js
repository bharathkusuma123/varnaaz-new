// import React, { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import { FaBars, FaTimes } from 'react-icons/fa';
// import './Navbar.css';

// const ManagerNavbar = () => {
//   const [isMobile, setIsMobile] = useState(false);

//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         <NavLink to="/" className="navbar-logo" onClick={() => setIsMobile(false)}>
//           Manager Panel
//         </NavLink>

//         <div className={`nav-menu ${isMobile ? 'active' : ''}`}>
//           <NavLink to="/managerdashboard" className="nav-item" onClick={() => setIsMobile(false)}>
//             Dashboard
//           </NavLink>
//           <NavLink to="/m-attendance" className="nav-item" onClick={() => setIsMobile(false)}>
//             Attendance
//           </NavLink>
//           {/* <NavLink to="/m-dailyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
//             Daily Attendance
//           </NavLink> */}
//           <div className="nav-item dropdown">
//             <span className="dropdown-toggle">Daily Attendance ▾</span>
//             <div className="dropdown-menu">
//               <NavLink to="/m-dailyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
//                 My Daily Attendance
//               </NavLink>
//               <NavLink to="/m-e-dailyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
//                 Employers Daily Attendance
//               </NavLink>
//             </div>
//           </div>
//           {/* <NavLink to="/m-monthlyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
//             Monthly Attendance
//           </NavLink> */}
//           <div className="nav-item dropdown">
//             <span className="dropdown-toggle">Monthly Attendance ▾</span>
//             <div className="dropdown-menu">
//               <NavLink to="/m-monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
//                 My Monthly Attendance
//               </NavLink>
//               <NavLink to="/m-e-monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
//                 Employers Monthly Attendance
//               </NavLink>
//             </div>
//           </div>
//           {/* <NavLink to="/m-leaves" className="nav-item" onClick={() => setIsMobile(false)}>
//             Leaves
//           </NavLink> */}
//           <div className="nav-item dropdown">
//             <span className="dropdown-toggle">Leaves ▾</span>
//             <div className="dropdown-menu">
//               <NavLink to="/m-leaves" className="dropdown-item" onClick={() => setIsMobile(false)}>
//                 My Leaves
//               </NavLink>
//               <NavLink to="/m-e-leave" className="dropdown-item" onClick={() => setIsMobile(false)}>
//                 Employers Leaves
//               </NavLink>
//             </div>
//           </div>
//         </div>

//         <div className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
//           {isMobile ? <FaTimes /> : <FaBars />}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default ManagerNavbar;








import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const ManagerNavbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsMobile(false);
    // Optional: Clear auth state/session here
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={() => setIsMobile(false)}>
          Manager Panel
        </NavLink>

        <div className={`nav-menu ${isMobile ? 'active' : ''}`}>
          <NavLink to="/managerdashboard" className="nav-item" onClick={() => setIsMobile(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/m-attendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Attendance
          </NavLink>

          <div className="nav-item dropdown">
            <span className="dropdown-toggle">Daily Attendance ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/m-dailyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Daily Attendance
              </NavLink>
              <NavLink to="/m-e-dailyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Employers Daily Attendance
              </NavLink>
            </div>
          </div>

          <div className="nav-item dropdown">
            <span className="dropdown-toggle">Monthly Attendance ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/m-monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Monthly Attendance
              </NavLink>
              <NavLink to="/m-e-monthlyattendance" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Employers Monthly Attendance
              </NavLink>
            </div>
          </div>

          <div className="nav-item dropdown">
            <span className="dropdown-toggle">Leaves ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/m-leaves" className="dropdown-item" onClick={() => setIsMobile(false)}>
                My Leaves
              </NavLink>
              <NavLink to="/m-e-leave" className="dropdown-item" onClick={() => setIsMobile(false)}>
                Employers Leaves
              </NavLink>
            </div>
          </div>

          {/* Logout for mobile */}
          <div className="nav-item logout-icon-mobile" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </div>
        </div>

        <div className="navbar-icons">
          {/* Logout for desktop */}
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

export default ManagerNavbar;

// import React, { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import { FaBars, FaTimes } from 'react-icons/fa';
// import './Navbar.css';

// const EmployeeNavbar = () => {
//   const [isMobile, setIsMobile] = useState(false);

//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         <NavLink to="/" className="navbar-logo" onClick={() => setIsMobile(false)}>
//           Employee Panel
//         </NavLink>

//         <div className={`nav-menu ${isMobile ? 'active' : ''}`}>
//             <NavLink to="/employedashboard" className="nav-item" onClick={() => setIsMobile(false)}>
//             Dashboard
//           </NavLink>
//           <NavLink to="/e-attendance" className="nav-item" onClick={() => setIsMobile(false)}>
//             Attendance
//           </NavLink>
//           <NavLink to="/e-dailyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
//             Daily Attendance
//           </NavLink>
//           <NavLink to="/e-monthlyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
//             Monthly Attendance
//           </NavLink>
//           <NavLink to="/e-leaves" className="nav-item" onClick={() => setIsMobile(false)}>
//             Leaves
//           </NavLink>
//         </div>

//         <div className="mobile-menu-icon" onClick={() => setIsMobile(!isMobile)}>
//           {isMobile ? <FaTimes /> : <FaBars />}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default EmployeeNavbar;



import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const EmployeeNavbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsMobile(false);
    // Optional: clear session or auth logic here
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={() => setIsMobile(false)}>
          Employee Panel
        </NavLink>

        <div className={`nav-menu ${isMobile ? 'active' : ''}`}>
          <NavLink to="/employedashboard" className="nav-item" onClick={() => setIsMobile(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/e-attendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Attendance
          </NavLink>
          <NavLink to="/e-dailyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Daily Attendance
          </NavLink>
          <NavLink to="/e-monthlyattendance" className="nav-item" onClick={() => setIsMobile(false)}>
            Monthly Attendance
          </NavLink>
          <NavLink to="/e-leaves" className="nav-item" onClick={() => setIsMobile(false)}>
            Leaves
          </NavLink>

          {/* Logout item for mobile */}
          <div className="nav-item logout-icon-mobile" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </div>
        </div>

        <div className="navbar-icons">
          {/* Logout icon for desktop */}
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

export default EmployeeNavbar;


import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import ViewEmployees from './ViewEmployees'; // Import the new component
import ManagerNavbar from '../../Navbar/ManagerNavbar/Navbar';

function ManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State to store the UID
  const [uid, setUid] = React.useState(null);

  useEffect(() => {
    // First try to get UID from location state
    if (location.state?.uid) {
      setUid(location.state.uid);
      localStorage.setItem('currentUserUid', location.state.uid);
    } else {
      // If not in location state, check localStorage
      const storedUid = localStorage.getItem('currentUserUid');
      if (storedUid) {
        setUid(storedUid);
      }
    }
  }, [location.state]);

  console.log("Manager Dashboard - Current UID:", uid); // Verify UID in console

  const handleEmployeeRegistration = () => {
    console.log("Navigating to employee registration with manager UID:", uid);
    navigate('/employeeregistration', { state: { managerUid: uid } });
  };

  const handleViewDetails = () => {
    console.log("View details clicked with manager UID:", uid);
    navigate('/viewemployees', { state: { managerUid: uid } });
  };

  return (
    <>
      <ManagerNavbar/>
      <div className="container mt-5">
        <h1 className="text-center mb-4">Manager Dashboard</h1>
        <div className="d-flex justify-content-center gap-4">
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleEmployeeRegistration}
          >
            Employee Registration
          </Button>
          
          <Button 
            variant="info" 
            size="lg"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>
    </>
  );
}

export default ManagerDashboard;
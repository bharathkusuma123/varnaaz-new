import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import ViewEmployees from './ViewEmployees'; // Import the new component

function ManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the UID passed from the login page
  const { uid } = location.state || {};
  
  console.log("Manager Dashboard - Received UID:", uid);

  const handleEmployeeRegistration = () => {
    console.log("Navigating to employee registration with manager UID:", uid);
    navigate('/employeeregistration', { state: { managerUid: uid } });
  };

  const handleViewDetails = () => {
    console.log("View details clicked with manager UID:", uid);
    navigate('/viewemployees', { state: { managerUid: uid } });
  };

  return (
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
  );
}

export default ManagerDashboard;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the UID passed from the login page
  const { uid } = location.state || {};
  
  console.log("admin Dashboard - Received UID:", uid); // Verify UID in console

  const handleManagerRegistration = () => {
    console.log("Navigating to admin registration with superadmin UID:", uid);
    navigate('/managerregistration', { state: { adminUid: uid } });
  };

  const handleViewDetails = () => {
    console.log("View details clicked with admin UID:", uid);
    navigate('/viewmanagers', { state: { adminUid: uid } });
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">admin Dashboard</h1>
      <div className="d-flex justify-content-center gap-4">
        <Button 
          variant="primary" 
          size="lg"
          onClick={handleManagerRegistration}
        >
          Manager Registration
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

export default AdminDashboard;
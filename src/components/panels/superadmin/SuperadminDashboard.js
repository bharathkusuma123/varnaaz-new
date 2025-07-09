import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Navbar from '../../Navbar/SuperAdminNavbar/Navbar';
import SuperAdminNavbar from '../../Navbar/SuperAdminNavbar/Navbar';

function SuperadminDashboard() {
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

  console.log("Superadmin Dashboard - Current UID:", uid); // Verify UID in console

  const handleAdminRegistration = () => {
    console.log("Navigating to admin registration with superadmin UID:", uid);
    navigate('/adminregistrationform', { state: { superadminUid: uid } });
  };

  const handleViewDetails = () => {
    console.log("View details clicked with superadmin UID:", uid);
    navigate('/viewadmindetails', { state: { superadminUid: uid } });
  };

  return (
    <>
      <SuperAdminNavbar/>
      <div className="container mt-5">
        <h1 className="text-center mb-4">Superadmin Dashboard</h1>
        <div className="d-flex justify-content-center gap-4">
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleAdminRegistration}
          >
            Admin Registration
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

export default SuperadminDashboard;
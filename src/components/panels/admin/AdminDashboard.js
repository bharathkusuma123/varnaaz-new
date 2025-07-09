import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import AdminNavbar from '../../Navbar/AdminNavbar/Navbar';

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the UID from location state or localStorage
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

  console.log("Admin Dashboard - Current UID:", uid); // Verify UID in console

  const handleManagerRegistration = () => {
    console.log("Navigating to admin registration with admin UID:", uid);
    navigate('/managerregistration', { state: { adminUid: uid } });
  };

  const handleViewDetails = () => {
    console.log("View details clicked with admin UID:", uid);
    navigate('/viewmanagers', { state: { adminUid: uid } });
  };

  return (
    <>
      <AdminNavbar/>
      <div className="container mt-5">
        <h1 className="text-center mb-4">Admin Dashboard</h1>
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
    </>
  );
}

export default AdminDashboard;
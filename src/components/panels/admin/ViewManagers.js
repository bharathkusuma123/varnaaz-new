import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Adjust the path to your firebase config
import { Table, Button, Spinner, Container, Alert } from 'react-bootstrap';

function ViewManagers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [Managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get adminUid from location state
  const { adminUid } = location.state || {};

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        if (!adminUid) {
          throw new Error('admin UID not found. Please login again.');
        }

        console.log('Fetching managers for admin:', adminUid);
        
        // Query users collection where manager_uid matches current manager's UID
        const q = query(
          collection(db, 'users'),
          where('admin_uid', '==', adminUid)
        );

        const querySnapshot = await getDocs(q);
        const managersData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include manager (optional filter)
          if (data.role === 'manager') {
            managersData.push({
              id: doc.id,
              fullName: data.fullName || '',
              email: data.email || '',
              phone: data.phone || '',
              role: data.role || '',
              createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
            });
          }
        });

        console.log('Fetched managers:', managersData);
        setManagers(managersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching managers:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchManagers();
  }, [adminUid]);

  const handleBack = () => {
    navigate('/admindashboard', { state: { uid: adminUid } });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading managers...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">managers Under Your admin</h2>
      
      {Managers.length === 0 ? (
        <Alert variant="info">
          No managers found under your admin.
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="mt-4">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {Managers.map((manager, index) => (
                <tr key={manager.id}>
                  <td>{index + 1}</td>
                  <td>{manager.fullName}</td>
                  <td>{manager.email}</td>
                  <td>{manager.phone}</td>
                  <td className="text-capitalize">{manager.role}</td>
                  <td>{manager.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-3">
            <p>Total Managers: {Managers.length}</p>
          </div>
        </>
      )}
      
      <Button 
        variant="primary" 
        onClick={handleBack} 
        className="mt-3"
      >
        Back to Dashboard
      </Button>
    </Container>
  );
}

export default ViewManagers;
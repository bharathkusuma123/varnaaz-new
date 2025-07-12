import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Adjust the path to your firebase config
import { Table, Button, Spinner, Container, Alert } from 'react-bootstrap';

function ViewAdminDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [Admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get superadminUid from location state
  const { superadminUid } = location.state || {};

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        if (!superadminUid) {
          throw new Error('admin UID not found. Please login again.');
        }

        console.log('Fetching admins for admin:', superadminUid);
        
        // Query users collection where admin_uid matches current admin's UID
        const q = query(
          collection(db, 'users'),
          where('superadmin_uid', '==', superadminUid)
        );

        const querySnapshot = await getDocs(q);
        const adminsData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include admin (optional filter)
          if (data.role === 'admin') {
            adminsData.push({
              id: doc.id,
              fullName: data.fullName || '',
              email: data.email || '',
              phone: data.phone || '',
              role: data.role || '',
              createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
            });
          }
        });

        console.log('Fetched admins:', adminsData);
        setAdmins(adminsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admins:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [superadminUid]);

  const handleBack = () => {
    navigate('/superadmindashboard', { state: { uid: superadminUid } });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading admins...</p>
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
      <h2 className="mb-4">admins Under Your admin</h2>
      
      {Admins.length === 0 ? (
        <Alert variant="info">
          No admins found under your admin.
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="mt-4">
            <thead className="thead-dark">
              <tr>
                <th>S.no</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {Admins.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.fullName}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td className="text-capitalize">{admin.role}</td>
                  <td>{admin.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-3">
            <p>Total Admins: {Admins.length}</p>
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

export default ViewAdminDetails;
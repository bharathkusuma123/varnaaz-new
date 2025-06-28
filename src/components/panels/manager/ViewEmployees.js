import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Adjust the path to your firebase config
import { Table, Button, Spinner, Container, Alert } from 'react-bootstrap';

function ViewEmployees() {
  const location = useLocation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get managerUid from location state
  const { managerUid } = location.state || {};

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!managerUid) {
          throw new Error('Manager UID not found. Please login again.');
        }

        console.log('Fetching employees for manager:', managerUid);
        
        // Query users collection where manager_uid matches current manager's UID
        const q = query(
          collection(db, 'users'),
          where('manager_uid', '==', managerUid)
        );

        const querySnapshot = await getDocs(q);
        const employeesData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include employees (optional filter)
          if (data.role === 'employee') {
            employeesData.push({
              id: doc.id,
              fullName: data.fullName || '',
              email: data.email || '',
              phone: data.phone || '',
              role: data.role || '',
              createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
            });
          }
        });

        console.log('Fetched employees:', employeesData);
        setEmployees(employeesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [managerUid]);

  const handleBack = () => {
    navigate('/managerdashboard', { state: { uid: managerUid } });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading employees...</p>
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
      <h2 className="mb-4">Employees Under Your Management</h2>
      
      {employees.length === 0 ? (
        <Alert variant="info">
          No employees found under your management.
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
              {employees.map((employee, index) => (
                <tr key={employee.id}>
                  <td>{index + 1}</td>
                  <td>{employee.fullName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone}</td>
                  <td className="text-capitalize">{employee.role}</td>
                  <td>{employee.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-3">
            <p>Total Employees: {employees.length}</p>
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

export default ViewEmployees;
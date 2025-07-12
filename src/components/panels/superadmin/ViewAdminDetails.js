
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { Table, Button, Spinner, Container, Alert, Form, Row, Col } from 'react-bootstrap';

function ViewAdminDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedManager, setSelectedManager] = useState('all');
  const [managers, setManagers] = useState([]);
  const [admins, setAdmins] = useState([]);

  const { superadminUid } = location.state || {};

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        if (!superadminUid) {
          throw new Error('Superadmin UID not found. Please login again.');
        }

        const usersList = [];
        const managersList = [];
        const adminsList = [];

        // Step 1: Fetch Admins
        const adminQuery = query(
          collection(db, 'users'),
          where('superadmin_uid', '==', superadminUid)
        );
        const adminSnapshot = await getDocs(adminQuery);

        const adminUIDs = [];

        for (const adminDoc of adminSnapshot.docs) {
          const data = adminDoc.data();
          if (data.role === 'admin') {
            const adminId = adminDoc.id;
            const adminObj = {
              id: adminId,
              fullName: data.fullName || '',
            };
            
            usersList.push({
              id: adminId,
              fullName: data.fullName || '',
              email: data.email || '',
              phone: data.phone || '',
              role: data.role || '',
              createdAt: data.createdAt
                ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
                : 'N/A',
            });
            
            adminsList.push(adminObj);
            adminUIDs.push(adminId);

            // Step 2: Fetch Managers under this admin
            const managerQuery = query(
              collection(db, 'users'),
              where('admin_uid', '==', adminId)
            );
            const managerSnapshot = await getDocs(managerQuery);

            for (const managerDoc of managerSnapshot.docs) {
              const managerData = managerDoc.data();
              if (managerData.role === 'manager') {
                const managerId = managerDoc.id;
                const managerObj = {
                  id: managerId,
                  fullName: managerData.fullName || '',
                  adminId: adminId
                };
                
                usersList.push({
                  id: managerId,
                  fullName: managerData.fullName || '',
                  email: managerData.email || '',
                  phone: managerData.phone || '',
                  role: managerData.role || '',
                  createdAt: managerData.createdAt
                    ? new Date(managerData.createdAt.seconds * 1000).toLocaleDateString()
                    : 'N/A',
                  adminId: adminId
                });
                
                managersList.push(managerObj);

                // Step 3: Fetch Employees under this manager
                const employeeQuery = query(
                  collection(db, 'users'),
                  where('manager_uid', '==', managerId)
                );
                const employeeSnapshot = await getDocs(employeeQuery);

                for (const empDoc of employeeSnapshot.docs) {
                  const empData = empDoc.data();
                  if (empData.role === 'employee') {
                    usersList.push({
                      id: empDoc.id,
                      fullName: empData.fullName || '',
                      email: empData.email || '',
                      phone: empData.phone || '',
                      role: empData.role || '',
                      createdAt: empData.createdAt
                        ? new Date(empData.createdAt.seconds * 1000).toLocaleDateString()
                        : 'N/A',
                      managerId: managerId,
                      adminId: adminId
                    });
                  }
                }
              }
            }
          }
        }

        setUsers(usersList);
        setFilteredUsers(usersList);
        setManagers(managersList);
        setAdmins(adminsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [superadminUid]);

  // Filter users based on selected role and manager
  useEffect(() => {
    let filtered = users;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
      
      // If filtering employees and a manager is selected
      if (selectedRole === 'employee' && selectedManager !== 'all') {
        filtered = filtered.filter(user => user.managerId === selectedManager);
      }
      
      // If filtering managers and an admin is selected
      if (selectedRole === 'manager' && selectedManager !== 'all') {
        filtered = filtered.filter(user => user.adminId === selectedManager);
      }
    }
    
    setFilteredUsers(filtered);
  }, [selectedRole, selectedManager, users]);

  const handleBack = () => {
    navigate('/superadmindashboard', { state: { uid: superadminUid } });
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedManager('all'); // Reset manager filter when role changes
  };

  const handleManagerChange = (e) => {
    setSelectedManager(e.target.value);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading users...</p>
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
      <h2 className="mb-4">All Users under your Hierarchy</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group controlId="roleFilter">
            <Form.Label>Select Role:</Form.Label>
            <Form.Control
              as="select"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </Form.Control>
          </Form.Group>
        </Col>

        {selectedRole === 'employee' && (
          <Col md={4}>
            <Form.Group controlId="managerFilter">
              <Form.Label>Select Manager:</Form.Label>
              <Form.Control
                as="select"
                value={selectedManager}
                onChange={handleManagerChange}
              >
                <option value="all">All Managers</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        )}

        {selectedRole === 'manager' && (
          <Col md={4}>
            <Form.Group controlId="adminFilter">
              <Form.Label>Select Admin:</Form.Label>
              <Form.Control
                as="select"
                value={selectedManager}
                onChange={handleManagerChange}
              >
                <option value="all">All Admins</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.fullName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        )}
      </Row>

      {filteredUsers.length === 0 ? (
        <Alert variant="info">No users found with the selected filters.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="mt-4">
            <thead className="thead-dark">
              <tr>
                <th>S.No</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined Date</th>
                {selectedRole === 'employee' && <th>Manager</th>}
                {selectedRole === 'manager' && <th>Admin</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td className="text-capitalize">{user.role}</td>
                  <td>{user.createdAt}</td>
                  {selectedRole === 'employee' && (
                    <td>{managers.find(m => m.id === user.managerId)?.fullName || 'N/A'}</td>
                  )}
                  {selectedRole === 'manager' && (
                    <td>{admins.find(a => a.id === user.adminId)?.fullName || 'N/A'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-3">
            <p>Total Users: {filteredUsers.length}</p>
          </div>
        </>
      )}

      <Button variant="primary" onClick={handleBack} className="mt-3">
        Back to Dashboard
      </Button>
    </Container>
  );
}

export default ViewAdminDetails;
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { Table, Button, Spinner, Container, Alert, Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import AdminNavbar from '../../Navbar/AdminNavbar/Navbar';

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for UID and user data
  const [uid, setUid] = React.useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedManager, setSelectedManager] = useState('all');
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

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

  useEffect(() => {
    if (uid) {
      fetchAllUsers();
    }
  }, [uid]);

  const fetchAllUsers = async () => {
    try {
      if (!uid) {
        throw new Error('Admin UID not found. Please login again.');
      }

      const usersList = [];
      const managersList = [];

      // Step 1: Fetch Managers under this admin
      const managerQuery = query(
        collection(db, 'users'),
        where('admin_uid', '==', uid)
      );
      const managerSnapshot = await getDocs(managerQuery);

      for (const managerDoc of managerSnapshot.docs) {
        const managerData = managerDoc.data();
        if (managerData.role === 'manager') {
          const managerId = managerDoc.id;
          const managerObj = {
            id: managerId,
            fullName: managerData.fullName || '',
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
          });
          
          managersList.push(managerObj);

          // Step 2: Fetch Employees under this manager
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
                managerId: managerId
              });
            }
          }
        }
      }

      setUsers(usersList);
      setFilteredUsers(usersList);
      setDisplayedUsers(usersList);
      setManagers(managersList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Filter users based on selected role and manager
  useEffect(() => {
    let filtered = users;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
      
      // If filtering employees and a manager is selected
      if (selectedRole === 'employee' && selectedManager !== 'all') {
        filtered = filtered.filter(user => user.managerId === selectedManager);
      }
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedRole, selectedManager, users]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDisplayedUsers(filteredUsers);
    } else {
      const searchResults = filteredUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedUsers(searchResults);
    }
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm, filteredUsers]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = displayedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(displayedUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleManagerRegistration = () => {
    navigate('/managerregistration', { state: { adminUid: uid } });
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
      <>
        <AdminNavbar/>
        <Container className="text-center mt-5">
          <Spinner animation="border" />
          <p>Loading users...</p>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar/>
        <Container className="mt-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <AdminNavbar/>
      <Container className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h2>Users Under Your Administration</h2>
          <Button 
            variant="primary" 
            onClick={handleManagerRegistration}
          >
            Register New Manager
          </Button>
        </div>

        <Row className="mb-3 align-items-end">
          <Col md={3}>
            <Form.Group controlId="roleFilter">
              <Form.Label>Select Role:</Form.Label>
              <Form.Control
                as="select"
                value={selectedRole}
                onChange={handleRoleChange}
              >
                <option value="all">All Roles</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </Form.Control>
            </Form.Group>
          </Col>

          {selectedRole === 'employee' && (
            <Col md={3}>
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

          <Col md={3}>
            <Form.Group controlId="searchFilter">
              <Form.Label>Search:</Form.Label>
              <InputGroup>
                <FormControl
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        {displayedUsers.length === 0 ? (
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
                  {selectedRole === 'employee' && <th>Manager</th>}
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{indexOfFirstUser + index + 1}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td className="text-capitalize">{user.role}</td>
                    {selectedRole === 'employee' && (
                      <td>{managers.find(m => m.id === user.managerId)?.fullName || 'N/A'}</td>
                    )}
                    <td>{user.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <p>Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, displayedUsers.length)} of {displayedUsers.length} users</p>
              </div>
              <div>
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => paginate(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  );
}

export default AdminDashboard;
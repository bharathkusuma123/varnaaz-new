// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../../../firebase/firebase'; // Adjust the path to your firebase config
// import { Table, Button, Spinner, Container, Alert } from 'react-bootstrap';

// function ViewManagers() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [Managers, setManagers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Get adminUid from location state
//   const { adminUid } = location.state || {};

//   useEffect(() => {
//     const fetchManagers = async () => {
//       try {
//         if (!adminUid) {
//           throw new Error('admin UID not found. Please login again.');
//         }

//         console.log('Fetching managers for admin:', adminUid);
        
//         // Query users collection where manager_uid matches current manager's UID
//         const q = query(
//           collection(db, 'users'),
//           where('admin_uid', '==', adminUid)
//         );

//         const querySnapshot = await getDocs(q);
//         const managersData = [];

//         querySnapshot.forEach((doc) => {
//           const data = doc.data();
//           // Only include manager (optional filter)
//           if (data.role === 'manager') {
//             managersData.push({
//               id: doc.id,
//               fullName: data.fullName || '',
//               email: data.email || '',
//               phone: data.phone || '',
//               role: data.role || '',
//               createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
//             });
//           }
//         });

//         console.log('Fetched managers:', managersData);
//         setManagers(managersData);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching managers:', err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchManagers();
//   }, [adminUid]);

//   const handleBack = () => {
//     navigate('/admindashboard', { state: { uid: adminUid } });
//   };

//   if (loading) {
//     return (
//       <Container className="text-center mt-5">
//         <Spinner animation="border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </Spinner>
//         <p>Loading managers...</p>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="mt-5">
//         <Alert variant="danger">{error}</Alert>
//         <Button variant="secondary" onClick={handleBack}>
//           Back to Dashboard
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container className="mt-5">
//       <h2 className="mb-4">managers Under Your admin</h2>
      
//       {Managers.length === 0 ? (
//         <Alert variant="info">
//           No managers found under your admin.
//         </Alert>
//       ) : (
//         <>
//           <Table striped bordered hover responsive className="mt-4">
//             <thead className="thead-dark">
//               <tr>
//                 <th>#</th>
//                 <th>Full Name</th>
//                 <th>Email</th>
//                 <th>Phone</th>
//                 <th>Role</th>
//                 <th>Joined Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Managers.map((manager, index) => (
//                 <tr key={manager.id}>
//                   <td>{index + 1}</td>
//                   <td>{manager.fullName}</td>
//                   <td>{manager.email}</td>
//                   <td>{manager.phone}</td>
//                   <td className="text-capitalize">{manager.role}</td>
//                   <td>{manager.createdAt}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//           <div className="mt-3">
//             <p>Total Managers: {Managers.length}</p>
//           </div>
//         </>
//       )}
      
//       <Button 
//         variant="primary" 
//         onClick={handleBack} 
//         className="mt-3"
//       >
//         Back to Dashboard
//       </Button>
//     </Container>
//   );
// }

// export default ViewManagers;



import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { Table, Button, Spinner, Container, Alert, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

function ViewManagers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('manager');
  const [selectedManager, setSelectedManager] = useState('all');
  const [managers, setManagers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  // Get adminUid from location state
  const { adminUid } = location.state || {};

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!adminUid) {
          throw new Error('Admin UID not found. Please login again.');
        }

        console.log('Fetching users for admin:', adminUid);
        
        // Query all users under this admin (managers and their employees)
        const usersQuery = query(
          collection(db, 'users'),
          where('admin_uid', '==', adminUid)
        );

        const querySnapshot = await getDocs(usersQuery);
        const usersData = [];
        const managersList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const userObj = {
            id: doc.id,
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || '',
            managerId: data.manager_uid || '',
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
          };

          usersData.push(userObj);
          
          if (data.role === 'manager') {
            managersList.push({
              id: doc.id,
              fullName: data.fullName || ''
            });
          }
        });

        console.log('Fetched users:', usersData);
        setAllUsers(usersData);
        setManagers(managersList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [adminUid]);

  // Filter users based on selected role and manager
  useEffect(() => {
    let filtered = allUsers;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
      
      // If filtering employees and a manager is selected
      if (selectedRole === 'employee' && selectedManager !== 'all') {
        filtered = filtered.filter(user => user.managerId === selectedManager);
      }
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedRole, selectedManager, allUsers]);

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

  const handleBack = () => {
    navigate('/admindashboard', { state: { uid: adminUid } });
  };

  const handleManagerRegistration = () => {
    navigate('/managerregistrationform', { state: { adminUid: adminUid } });
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
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
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
    <Container className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
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
              <option value="manager">Managers</option>
              <option value="employee">Employees</option>
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
              <Form.Control
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
        <Alert variant="info">
          {searchTerm.trim() === '' 
            ? `No ${selectedRole}s found under your administration.` 
            : 'No users match your search criteria.'}
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
      
      <Button 
        variant="secondary" 
        onClick={handleBack} 
        className="mt-3"
      >
        Back to Dashboard
      </Button>
    </Container>
  );
}

export default ViewManagers;
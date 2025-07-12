// import React, { useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Button } from 'react-bootstrap';
// import Navbar from '../../Navbar/SuperAdminNavbar/Navbar';
// import SuperAdminNavbar from '../../Navbar/SuperAdminNavbar/Navbar';

// function SuperadminDashboard() {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // State to store the UID
//   const [uid, setUid] = React.useState(null);

//   useEffect(() => {
//     // First try to get UID from location state
//     if (location.state?.uid) {
//       setUid(location.state.uid);
//       localStorage.setItem('currentUserUid', location.state.uid);
//     } else {
//       // If not in location state, check localStorage
//       const storedUid = localStorage.getItem('currentUserUid');
//       if (storedUid) {
//         setUid(storedUid);
//       }
//     }
//   }, [location.state]);

//   console.log("Superadmin Dashboard - Current UID:", uid); // Verify UID in console

//   const handleAdminRegistration = () => {
//     console.log("Navigating to admin registration with superadmin UID:", uid);
//     navigate('/adminregistrationform', { state: { superadminUid: uid } });
//   };

//   const handleViewDetails = () => {
//     console.log("View details clicked with superadmin UID:", uid);
//     navigate('/viewadmindetails', { state: { superadminUid: uid } });
//   };

//   return (
//     <>
//       <SuperAdminNavbar/>
//       <div className="container mt-5">
//         <h1 className="text-center mb-4">Superadmin Dashboard</h1>
//         <div className="d-flex justify-content-center gap-4">
//           <Button 
//             variant="primary" 
//             size="lg"
//             onClick={handleAdminRegistration}
//           >
//             Admin Registration
//           </Button>
          
//           <Button 
//             variant="info" 
//             size="lg"
//             onClick={handleViewDetails}
//           >
//             View Details
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// }

// export default SuperadminDashboard;

// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../../../firebase/firebase';
// import { Table, Button, Spinner, Container, Alert, Form, Row, Col } from 'react-bootstrap';
// import SuperAdminNavbar from '../../Navbar/SuperAdminNavbar/Navbar';

// function SuperadminDashboard() {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // State for UID and user data
//   const [uid, setUid] = React.useState(null);
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRole, setSelectedRole] = useState('all');
//   const [selectedManager, setSelectedManager] = useState('all');
//   const [managers, setManagers] = useState([]);
//   const [admins, setAdmins] = useState([]);

//   useEffect(() => {
//     // First try to get UID from location state
//     if (location.state?.uid) {
//       setUid(location.state.uid);
//       localStorage.setItem('currentUserUid', location.state.uid);
//     } else {
//       // If not in location state, check localStorage
//       const storedUid = localStorage.getItem('currentUserUid');
//       if (storedUid) {
//         setUid(storedUid);
//       }
//     }
//   }, [location.state]);

//   useEffect(() => {
//     if (uid) {
//       fetchAllUsers();
//     }
//   }, [uid]);

//   const fetchAllUsers = async () => {
//     try {
//       if (!uid) {
//         throw new Error('Superadmin UID not found. Please login again.');
//       }

//       const usersList = [];
//       const managersList = [];
//       const adminsList = [];

//       // Step 1: Fetch Admins
//       const adminQuery = query(
//         collection(db, 'users'),
//         where('superadmin_uid', '==', uid)
//       );
//       const adminSnapshot = await getDocs(adminQuery);

//       const adminUIDs = [];

//       for (const adminDoc of adminSnapshot.docs) {
//         const data = adminDoc.data();
//         if (data.role === 'admin') {
//           const adminId = adminDoc.id;
//           const adminObj = {
//             id: adminId,
//             fullName: data.fullName || '',
//           };
          
//           usersList.push({
//             id: adminId,
//             fullName: data.fullName || '',
//             email: data.email || '',
//             phone: data.phone || '',
//             role: data.role || '',
//             createdAt: data.createdAt
//               ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
//               : 'N/A',
//           });
          
//           adminsList.push(adminObj);
//           adminUIDs.push(adminId);

//           // Step 2: Fetch Managers under this admin
//           const managerQuery = query(
//             collection(db, 'users'),
//             where('admin_uid', '==', adminId)
//           );
//           const managerSnapshot = await getDocs(managerQuery);

//           for (const managerDoc of managerSnapshot.docs) {
//             const managerData = managerDoc.data();
//             if (managerData.role === 'manager') {
//               const managerId = managerDoc.id;
//               const managerObj = {
//                 id: managerId,
//                 fullName: managerData.fullName || '',
//                 adminId: adminId
//               };
              
//               usersList.push({
//                 id: managerId,
//                 fullName: managerData.fullName || '',
//                 email: managerData.email || '',
//                 phone: managerData.phone || '',
//                 role: managerData.role || '',
//                 createdAt: managerData.createdAt
//                   ? new Date(managerData.createdAt.seconds * 1000).toLocaleDateString()
//                   : 'N/A',
//                 adminId: adminId
//               });
              
//               managersList.push(managerObj);

//               // Step 3: Fetch Employees under this manager
//               const employeeQuery = query(
//                 collection(db, 'users'),
//                 where('manager_uid', '==', managerId)
//               );
//               const employeeSnapshot = await getDocs(employeeQuery);

//               for (const empDoc of employeeSnapshot.docs) {
//                 const empData = empDoc.data();
//                 if (empData.role === 'employee') {
//                   usersList.push({
//                     id: empDoc.id,
//                     fullName: empData.fullName || '',
//                     email: empData.email || '',
//                     phone: empData.phone || '',
//                     role: empData.role || '',
//                     createdAt: empData.createdAt
//                       ? new Date(empData.createdAt.seconds * 1000).toLocaleDateString()
//                       : 'N/A',
//                     managerId: managerId,
//                     adminId: adminId
//                   });
//                 }
//               }
//             }
//           }
//         }
//       }

//       setUsers(usersList);
//       setFilteredUsers(usersList);
//       setManagers(managersList);
//       setAdmins(adminsList);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   // Filter users based on selected role and manager
//   useEffect(() => {
//     let filtered = users;
    
//     if (selectedRole !== 'all') {
//       filtered = filtered.filter(user => user.role === selectedRole);
      
//       // If filtering employees and a manager is selected
//       if (selectedRole === 'employee' && selectedManager !== 'all') {
//         filtered = filtered.filter(user => user.managerId === selectedManager);
//       }
      
//       // If filtering managers and an admin is selected
//       if (selectedRole === 'manager' && selectedManager !== 'all') {
//         filtered = filtered.filter(user => user.adminId === selectedManager);
//       }
//     }
    
//     setFilteredUsers(filtered);
//   }, [selectedRole, selectedManager, users]);

//   const handleAdminRegistration = () => {
//     navigate('/adminregistrationform', { state: { superadminUid: uid } });
//   };

//   const handleRoleChange = (e) => {
//     setSelectedRole(e.target.value);
//     setSelectedManager('all'); // Reset manager filter when role changes
//   };

//   const handleManagerChange = (e) => {
//     setSelectedManager(e.target.value);
//   };

//   if (loading) {
//     return (
//       <>
//         <SuperAdminNavbar/>
//         <Container className="text-center mt-5">
//           <Spinner animation="border" />
//           <p>Loading users...</p>
//         </Container>
//       </>
//     );
//   }

//   if (error) {
//     return (
//       <>
//         <SuperAdminNavbar/>
//         <Container className="mt-5">
//           <Alert variant="danger">{error}</Alert>
//         </Container>
//       </>
//     );
//   }

//   return (
//     <>
//       <SuperAdminNavbar/>
//       <Container className="mt-3">
//         <div className="d-flex justify-content-between align-items-center mb-1">
//           <h1> </h1>
//           <Button 
//             variant="primary" 
//             size="lg"
//             onClick={handleAdminRegistration}
//           >
//             Admin Registration
//           </Button>
//         </div>

//         {/* <h2 className="mb-4">All Users under your Hierarchy</h2> */}

//         <Row className="mb-1">
//           <Col md={4}>
//             <Form.Group controlId="roleFilter">
//               <Form.Label>Select Role:</Form.Label>
//               <Form.Control
//                 as="select"
//                 value={selectedRole}
//                 onChange={handleRoleChange}
//               >
//                 <option value="all">All Roles</option>
//                 <option value="admin">Admin</option>
//                 <option value="manager">Manager</option>
//                 <option value="employee">Employee</option>
//               </Form.Control>
//             </Form.Group>
//           </Col>

//           {selectedRole === 'employee' && (
//             <Col md={4}>
//               <Form.Group controlId="managerFilter">
//                 <Form.Label>Select Manager:</Form.Label>
//                 <Form.Control
//                   as="select"
//                   value={selectedManager}
//                   onChange={handleManagerChange}
//                 >
//                   <option value="all">All Managers</option>
//                   {managers.map(manager => (
//                     <option key={manager.id} value={manager.id}>
//                       {manager.fullName}
//                     </option>
//                   ))}
//                 </Form.Control>
//               </Form.Group>
//             </Col>
//           )}

//           {selectedRole === 'manager' && (
//             <Col md={4}>
//               <Form.Group controlId="adminFilter">
//                 <Form.Label>Select Admin:</Form.Label>
//                 <Form.Control
//                   as="select"
//                   value={selectedManager}
//                   onChange={handleManagerChange}
//                 >
//                   <option value="all">All Admins</option>
//                   {admins.map(admin => (
//                     <option key={admin.id} value={admin.id}>
//                       {admin.fullName}
//                     </option>
//                   ))}
//                 </Form.Control>
//               </Form.Group>
//             </Col>
//           )}
//         </Row>

//         {filteredUsers.length === 0 ? (
//           <Alert variant="info">No users found with the selected filters.</Alert>
//         ) : (
//           <>
//             <Table striped bordered hover responsive className="mt-4">
//               <thead className="thead-dark">
//                 <tr>
//                   <th>S.No</th>
//                   <th>Full Name</th>
//                   <th>Email</th>
//                   <th>Phone</th>
//                   <th>Role</th>
//                   <th>Joined Date</th>
//                   {selectedRole === 'employee' && <th>Manager</th>}
//                   {selectedRole === 'manager' && <th>Admin</th>}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map((user, index) => (
//                   <tr key={user.id}>
//                     <td>{index + 1}</td>
//                     <td>{user.fullName}</td>
//                     <td>{user.email}</td>
//                     <td>{user.phone}</td>
//                     <td className="text-capitalize">{user.role}</td>
//                     <td>{user.createdAt}</td>
//                     {selectedRole === 'employee' && (
//                       <td>{managers.find(m => m.id === user.managerId)?.fullName || 'N/A'}</td>
//                     )}
//                     {selectedRole === 'manager' && (
//                       <td>{admins.find(a => a.id === user.adminId)?.fullName || 'N/A'}</td>
//                     )}
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//             <div className="mt-3">
//               <p>Total Users: {filteredUsers.length}</p>
//             </div>
//           </>
//         )}
//       </Container>
//     </>
//   );
// }

// export default SuperadminDashboard;


import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { Table, Button, Spinner, Container, Alert, Form, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import SuperAdminNavbar from '../../Navbar/SuperAdminNavbar/Navbar';
import { FaSearch } from 'react-icons/fa';

function SuperadminDashboard() {
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
  const [admins, setAdmins] = useState([]);
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
        throw new Error('Superadmin UID not found. Please login again.');
      }

      const usersList = [];
      const managersList = [];
      const adminsList = [];

      // Step 1: Fetch Admins
      const adminQuery = query(
        collection(db, 'users'),
        where('superadmin_uid', '==', uid)
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
      setDisplayedUsers(usersList);
      setManagers(managersList);
      setAdmins(adminsList);
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
      
      // If filtering managers and an admin is selected
      if (selectedRole === 'manager' && selectedManager !== 'all') {
        filtered = filtered.filter(user => user.adminId === selectedManager);
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

  const handleAdminRegistration = () => {
    navigate('/adminregistrationform', { state: { superadminUid: uid } });
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
        <SuperAdminNavbar/>
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
        <SuperAdminNavbar/>
        <Container className="mt-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <SuperAdminNavbar/>
      <Container className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h1> </h1>
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleAdminRegistration}
          >
            Admin Registration
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
                <option value="admin">Admin</option>
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

          {selectedRole === 'manager' && (
            <Col md={3}>
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
                  <th>Joined Date</th>
                  {selectedRole === 'employee' && <th>Manager</th>}
                  {selectedRole === 'manager' && <th>Admin</th>}
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

export default SuperadminDashboard;
// import React, { useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Button } from 'react-bootstrap';
// import ViewEmployees from './ViewEmployees'; // Import the new component
// import ManagerNavbar from '../../Navbar/ManagerNavbar/Navbar';

// function ManagerDashboard() {
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

//   console.log("Manager Dashboard - Current UID:", uid); // Verify UID in console

//   const handleEmployeeRegistration = () => {
//     console.log("Navigating to employee registration with manager UID:", uid);
//     navigate('/employeeregistration', { state: { managerUid: uid } });
//   };

//   const handleViewDetails = () => {
//     console.log("View details clicked with manager UID:", uid);
//     navigate('/viewemployees', { state: { managerUid: uid } });
//   };

//   return (
//     <>
//       <ManagerNavbar/>
//       <div className="container mt-5">
//         <h1 className="text-center mb-4">Manager Dashboard</h1>
//         <div className="d-flex justify-content-center gap-4">
//           <Button 
//             variant="primary" 
//             size="lg"
//             onClick={handleEmployeeRegistration}
//           >
//             Employee Registration
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

// export default ManagerDashboard;








import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { Table, Button, Spinner, Container, Alert, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import ManagerNavbar from '../../Navbar/ManagerNavbar/Navbar';

function ManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    // Get UID from location state or localStorage
    if (location.state?.uid) {
      setUid(location.state.uid);
      localStorage.setItem('currentUserUid', location.state.uid);
    } else {
      const storedUid = localStorage.getItem('currentUserUid');
      if (storedUid) {
        setUid(storedUid);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (uid) {
      fetchEmployees();
    }
  }, [uid]);

  const fetchEmployees = async () => {
    try {
      if (!uid) {
        throw new Error('Manager UID not found. Please login again.');
      }

      console.log('Fetching employees for manager:', uid);
      
      const q = query(
        collection(db, 'users'),
        where('manager_uid', '==', uid),
        where('role', '==', 'employee')
      );

      const querySnapshot = await getDocs(q);
      const employeesData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesData.push({
          id: doc.id,
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || '',
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
        });
      });

      console.log('Fetched employees:', employeesData);
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
      setDisplayedEmployees(employeesData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDisplayedEmployees(filteredEmployees);
    } else {
      const searchResults = filteredEmployees.filter(employee => 
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedEmployees(searchResults);
    }
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm, filteredEmployees]);

  // Pagination logic
  const indexOfLastEmployee = currentPage * usersPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - usersPerPage;
  const currentEmployees = displayedEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(displayedEmployees.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEmployeeRegistration = () => {
    navigate('/employeeregistration', { state: { managerUid: uid } });
  };

  if (loading) {
    return (
      <>
        <ManagerNavbar/>
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading employees...</p>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ManagerNavbar/>
        <Container className="mt-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <ManagerNavbar/>
      <Container className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Employees Under Your Management</h2>
          <Button 
            variant="primary" 
            onClick={handleEmployeeRegistration}
          >
            Register New Employee
          </Button>
        </div>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="searchFilter">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search employees..."
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

        {displayedEmployees.length === 0 ? (
          <Alert variant="info">
            {searchTerm.trim() === '' 
              ? 'No employees found under your management.' 
              : 'No employees match your search criteria.'}
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
                {currentEmployees.map((employee, index) => (
                  <tr key={employee.id}>
                    <td>{indexOfFirstEmployee + index + 1}</td>
                    <td>{employee.fullName}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td className="text-capitalize">{employee.role}</td>
                    <td>{employee.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <p>Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, displayedEmployees.length)} of {displayedEmployees.length} employees</p>
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

export default ManagerDashboard;
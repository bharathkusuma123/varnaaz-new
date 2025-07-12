// import React, { useState, useEffect } from 'react';
// import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
// import { db } from '../../../../firebase/firebase';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './Leaves.css';
// import SearchBar from '../../../Navbar/Layout/SearchBar';
// import Pagination from '../../../Navbar/Layout/Pagination';
// import ManagerNavbar from '../../../Navbar/ManagerNavbar/Navbar';

// const ManagerEmployeeLeaves = () => {
//   // Get current logged-in manager's UID from localStorage
//   const currentManagerUid = localStorage.getItem('currentUserUid');
  
//   const [leaves, setLeaves] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const leaveTypes = [
//     { value: 'casual', label: 'Casual Leave' },
//     { value: 'sick', label: 'Sick Leave' },
//     { value: 'earned', label: 'Earned Leave' },
//     { value: 'maternity', label: 'Maternity Leave' },
//     { value: 'paternity', label: 'Paternity Leave' },
//     { value: 'other', label: 'Other' }
//   ];

//   useEffect(() => {
//     fetchEmployeeLeaves();
//   }, []);

//   const fetchEmployeeLeaves = async () => {
//     setLoading(true);
//     try {
//       // Query all employee leaves where supervisorUid matches current manager
//       const leavesRef = collection(db, 'employeeLeaves');
//       const q = query(leavesRef, where('supervisorUid', '==', currentManagerUid));
//       const querySnapshot = await getDocs(q);

//       const allLeaves = [];
//       querySnapshot.forEach((doc) => {
//         const employeeData = doc.data();
//         const employeeLeaves = employeeData.leaves || [];
        
//         employeeLeaves.forEach(leave => {
//           allLeaves.push({
//             ...leave,
//             employeeName: employeeData.employeeName || 'Unknown Employee',
//             employeeUid: doc.id,
//             docId: doc.id, // Store document ID for updates
//             leaveIndex: employeeLeaves.indexOf(leave) // Store index of leave in array
//           });
//         });
//       });

//       // Sort by applied date (newest first)
//       allLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
//       setLeaves(allLeaves);
//     } catch (err) {
//       console.error('Error fetching employee leaves:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusUpdate = async (leave, newStatus) => {
//     try {
//       const employeeDocRef = doc(db, 'employeeLeaves', leave.docId);
//       const employeeDoc = await getDoc(employeeDocRef);
      
//       if (employeeDoc.exists()) {
//         const leavesArray = [...employeeDoc.data().leaves];
        
//         // Update the specific leave's status
//         leavesArray[leave.leaveIndex] = {
//           ...leavesArray[leave.leaveIndex],
//           status: newStatus
//         };

//         // Update the document
//         await updateDoc(employeeDocRef, {
//           leaves: leavesArray
//         });

//         // Update local state to reflect the change
//         setLeaves(prevLeaves => 
//           prevLeaves.map(l => 
//             l.leaveId === leave.leaveId ? { ...l, status: newStatus } : l
//           )
//         );

//         alert(`Leave ${newStatus.toLowerCase()} successfully!`);
//       }
//     } catch (err) {
//       console.error('Error updating leave status:', err);
//       alert('Failed to update leave status');
//     }
//   };

//   const filteredLeaves = leaves.filter(leave =>
//     leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (leave.description && leave.description.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   return (
//     <>
//       <ManagerNavbar/>
//       <div className="leaves-container">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h2>Employee Leave Requests</h2>
//           <p className="subtitle">Viewing leave requests from employees under your supervision</p>
//         </div>

//         <SearchBar
//           placeholder="Search by employee name, leave type or description..."
//           value={searchQuery}
//           onChange={(val) => {
//             setSearchQuery(val);
//             setCurrentPage(1);
//           }}
//         />

//         <div className="table-responsive">
//           {loading ? (
//             <p>Loading employee leave requests...</p>
//           ) : filteredLeaves.length === 0 ? (
//             <p className="text-muted text-center mt-4">
//               {leaves.length === 0 
//                 ? "No employees found under your supervision" 
//                 : "No leave requests match your search criteria"}
//             </p>
//           ) : (
//             <>
//               <table className="table table-bordered">
//                 <thead className="table-light">
//                   <tr>
//                     <th>S.No</th>
//                     <th>Employee Name</th>
//                     <th>Leave Type</th>
//                     <th>From</th>
//                     <th>To</th>
//                     <th>Description</th>
//                     <th>Status</th>
//                     <th>Applied On</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedLeaves.map((leave, index) => (
//                     <tr key={`${leave.employeeUid}_${leave.leaveId}`}>
//                       <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                       <td>{leave.employeeName}</td>
//                       <td>{leaveTypes.find(t => t.value === leave.leaveType)?.label || leave.leaveType}</td>
//                       <td>{new Date(leave.fromDate).toLocaleDateString('en-IN')}</td>
//                       <td>{new Date(leave.toDate).toLocaleDateString('en-IN')}</td>
//                       <td>{leave.description || 'N/A'}</td>
//                       <td className={`fw-bold text-${leave.status === 'Pending' ? 'warning' : leave.status === 'Approved' ? 'success' : 'danger'}`}>
//                         {leave.status}
//                       </td>
//                       <td>{new Date(leave.appliedOn).toLocaleDateString('en-IN')}</td>
//                       <td>
//                         {leave.status === 'Pending' ? (
//                           <div className="d-flex gap-2">
//                             <button 
//                               className="btn btn-sm btn-success"
//                               onClick={() => handleStatusUpdate(leave, 'Approved')}
//                             >
//                               Approve
//                             </button>
//                             <button 
//                               className="btn btn-sm btn-danger"
//                               onClick={() => handleStatusUpdate(leave, 'Rejected')}
//                             >
//                               Reject
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-muted">Action taken</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={Math.ceil(filteredLeaves.length / itemsPerPage)}
//                 onPageChange={setCurrentPage}
//               />
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ManagerEmployeeLeaves;





import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Leaves.css';
import SearchBar from '../../../Navbar/Layout/SearchBar';
import Pagination from '../../../Navbar/Layout/Pagination';
import ManagerNavbar from '../../../Navbar/ManagerNavbar/Navbar';

const ManagerEmployeeLeaves = () => {
  const currentManagerUid = localStorage.getItem('currentUserUid');
  
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'earned', label: 'Earned Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    fetchEmployeeLeaves();
  }, []);

  const fetchEmployeeLeaves = async () => {
    setLoading(true);
    try {
      const leavesRef = collection(db, 'employeeLeaves');
      const q = query(leavesRef, where('supervisorUid', '==', currentManagerUid));
      const querySnapshot = await getDocs(q);

      const allLeaves = [];
      querySnapshot.forEach((doc) => {
        const employeeData = doc.data();
        const employeeLeaves = employeeData.leaves || [];
        
        employeeLeaves.forEach(leave => {
          // Ensure status is set, default to 'Pending' if not specified
          const leaveStatus = leave.status || 'Pending';
          allLeaves.push({
            ...leave,
            status: leaveStatus,
            employeeName: employeeData.employeeName || 'Unknown Employee',
            employeeUid: doc.id,
            docId: doc.id,
            leaveIndex: employeeLeaves.indexOf(leave)
          });
        });
      });

      allLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
      setLeaves(allLeaves);
    } catch (err) {
      console.error('Error fetching employee leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leave, newStatus) => {
    try {
      const employeeDocRef = doc(db, 'employeeLeaves', leave.docId);
      const employeeDoc = await getDoc(employeeDocRef);
      
      if (employeeDoc.exists()) {
        const leavesArray = [...employeeDoc.data().leaves];
        
        leavesArray[leave.leaveIndex] = {
          ...leavesArray[leave.leaveIndex],
          status: newStatus
        };

        await updateDoc(employeeDocRef, {
          leaves: leavesArray
        });

        setLeaves(prevLeaves => 
          prevLeaves.map(l => 
            l.leaveId === leave.leaveId ? { ...l, status: newStatus } : l
          )
        );
      }
    } catch (err) {
      console.error('Error updating leave status:', err);
      alert('Failed to update leave status');
    }
  };

  const filteredLeaves = leaves.filter(leave =>
    leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (leave.description && leave.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <ManagerNavbar/>
      <div className="leaves-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Employee Leave Requests</h2>
          <p className="subtitle">Viewing leave requests from employees under your supervision</p>
        </div>

        <SearchBar
          placeholder="Search by employee name, leave type or description..."
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
        />

        <div className="table-responsive">
          {loading ? (
            <p>Loading employee leave requests...</p>
          ) : filteredLeaves.length === 0 ? (
            <p className="text-muted text-center mt-4">
              {leaves.length === 0 
                ? "No employees found under your supervision" 
                : "No leave requests match your search criteria"}
            </p>
          ) : (
            <>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Employee Name</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.map((leave, index) => (
                    <tr key={`${leave.employeeUid}_${leave.leaveId}`}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{leave.employeeName}</td>
                      <td>{leaveTypes.find(t => t.value === leave.leaveType)?.label || leave.leaveType}</td>
                      <td>{new Date(leave.fromDate).toLocaleDateString('en-IN')}</td>
                      <td>{new Date(leave.toDate).toLocaleDateString('en-IN')}</td>
                      <td>{leave.description || 'N/A'}</td>
                      <td>
                        {leave.status === 'Pending' ? (
                          <select 
                            className="form-select form-select-sm bg-warning text-dark"
                            value={leave.status}
                            onChange={(e) => handleStatusUpdate(leave, e.target.value)}
                          >
                            {statusOptions.map(option => (
                              <option 
                                key={option.value} 
                                value={option.value}
                                className={option.value === 'Approved' ? 'bg-success' : 
                                           option.value === 'Rejected' ? 'bg-danger' : 'bg-warning'}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span 
                            className={`badge ${leave.status === 'Approved' ? 'bg-success' : 'bg-danger'}`}
                          >
                            {leave.status}
                          </span>
                        )}
                      </td>
                      <td>{new Date(leave.appliedOn).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredLeaves.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ManagerEmployeeLeaves;

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Leaves.css';
import SearchBar from '../../../Navbar/Layout/SearchBar';
import Pagination from '../../../Navbar/Layout/Pagination';
import AdminNavbar from '../../../Navbar/AdminNavbar/Navbar';

const AdminManagerLeavesPage = () => {
  const currentAdminUid = localStorage.getItem('currentUserUid');
  
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
    fetchManagerLeaves();
  }, []);

  const fetchManagerLeaves = async () => {
    setLoading(true);
    try {
      const leavesRef = collection(db, 'm_employeeLeaves');
      const q = query(leavesRef, where('supervisorUid', '==', currentAdminUid));
      const querySnapshot = await getDocs(q);

      const allLeaves = [];
      querySnapshot.forEach((doc) => {
        const employeeData = doc.data();
        const employeeLeaves = employeeData.leaves || [];
        
        employeeLeaves.forEach(leave => {
          // Ensure each leave has a status, defaulting to 'Pending' if not set
          const leaveStatus = leave.status || 'Pending';
          allLeaves.push({
            ...leave,
            status: leaveStatus,
            employeeName: employeeData.employeeName || 'Unknown Manager',
            employeeUid: doc.id,
            docId: doc.id,
            leaveIndex: employeeLeaves.indexOf(leave)
          });
        });
      });

      allLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
      setLeaves(allLeaves);
    } catch (err) {
      console.error('Error fetching manager leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leave, newStatus) => {
    try {
      const employeeDocRef = doc(db, 'm_employeeLeaves', leave.docId);
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
      <AdminNavbar/>
      <div className="leaves-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Manager Leave Requests</h2>
          <p className="subtitle">Viewing leave requests from managers under your supervision</p>
        </div>

        <SearchBar
          placeholder="Search by manager name, leave type or description..."
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
        />

        <div className="table-responsive">
          {loading ? (
            <p>Loading manager leave requests...</p>
          ) : filteredLeaves.length === 0 ? (
            <p className="text-muted text-center mt-4">
              {leaves.length === 0 
                ? "No managers found under your supervision" 
                : "No leave requests match your search criteria"}
            </p>
          ) : (
            <>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Manager Name</th>
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
                            className={`form-select form-select-sm bg-warning text-dark`}
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

export default AdminManagerLeavesPage;
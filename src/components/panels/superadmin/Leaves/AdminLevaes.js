import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Leaves.css';
import SearchBar from '../../../../components/Navbar/Layout/SearchBar';
import Pagination from '../../../../components/Navbar/Layout/Pagination';
import SuperAdminNavbar from '../../../Navbar/SuperAdminNavbar/Navbar';

const AdminLevaes = () => {
  // Get current logged-in superadmin's UID from localStorage
  const currentUserUid = localStorage.getItem('currentUserUid');
  const superadminUid = localStorage.getItem('superadmin_uid') || currentUserUid;
  
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

  useEffect(() => {
    fetchAdminLeaves();
  }, []);

  const fetchAdminLeaves = async () => {
    setLoading(true);
    try {
      // Query all admin leaves where supervisorUid matches current superadmin
      const leavesRef = collection(db, 'a_employeeLeaves');
      const q = query(leavesRef, where('supervisorUid', '==', superadminUid));
      const querySnapshot = await getDocs(q);

      const allLeaves = [];
      querySnapshot.forEach((doc) => {
        const adminData = doc.data();
        const adminLeaves = adminData.leaves || [];
        
        adminLeaves.forEach(leave => {
          allLeaves.push({
            ...leave,
            adminName: adminData.employeeName || 'Unknown Admin',
            adminUid: doc.id,
            docId: doc.id, // Store document ID for updates
            leaveIndex: adminLeaves.indexOf(leave) // Store index of leave in array
          });
        });
      });

      // Sort by applied date (newest first)
      allLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
      setLeaves(allLeaves);
    } catch (err) {
      console.error('Error fetching admin leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leave, newStatus) => {
    try {
      const adminDocRef = doc(db, 'a_employeeLeaves', leave.docId);
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists()) {
        const leavesArray = [...adminDoc.data().leaves];
        
        // Update the specific leave's status
        leavesArray[leave.leaveIndex] = {
          ...leavesArray[leave.leaveIndex],
          status: newStatus
        };

        // Update the document
        await updateDoc(adminDocRef, {
          leaves: leavesArray,
          lastUpdated: serverTimestamp()
        });

        // Update local state to reflect the change
        setLeaves(prevLeaves => 
          prevLeaves.map(l => 
            l.leaveId === leave.leaveId ? { ...l, status: newStatus } : l
          )
        );

        alert(`Leave ${newStatus.toLowerCase()} successfully!`);
      }
    } catch (err) {
      console.error('Error updating leave status:', err);
      alert('Failed to update leave status');
    }
  };

  const filteredLeaves = leaves.filter(leave =>
    leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leave.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (leave.description && leave.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <SuperAdminNavbar/>
      <div className="leaves-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Admin Leave Requests</h2>
          <p className="subtitle">Viewing leave requests from admins under your supervision</p>
        </div>

        <SearchBar
          placeholder="Search by admin name, leave type or description..."
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
        />

        <div className="table-responsive">
          {loading ? (
            <p>Loading admin leave requests...</p>
          ) : filteredLeaves.length === 0 ? (
            <p className="text-muted text-center mt-4">
              {leaves.length === 0 
                ? "No admins found under your supervision" 
                : "No leave requests match your search criteria"}
            </p>
          ) : (
            <>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Admin Name</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.map((leave, index) => (
                    <tr key={`${leave.adminUid}_${leave.leaveId}`}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{leave.adminName}</td>
                      <td>{leaveTypes.find(t => t.value === leave.leaveType)?.label || leave.leaveType}</td>
                      <td>{new Date(leave.fromDate).toLocaleDateString('en-IN')}</td>
                      <td>{new Date(leave.toDate).toLocaleDateString('en-IN')}</td>
                      <td>{leave.description || 'N/A'}</td>
                      <td className={`fw-bold text-${leave.status === 'Pending' ? 'warning' : leave.status === 'Approved' ? 'success' : 'danger'}`}>
                        {leave.status}
                      </td>
                      <td>{new Date(leave.appliedOn).toLocaleDateString('en-IN')}</td>
                      <td>
                        {leave.status === 'Pending' ? (
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusUpdate(leave, 'Approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleStatusUpdate(leave, 'Rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">Action taken</span>
                        )}
                      </td>
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

export default AdminLevaes;
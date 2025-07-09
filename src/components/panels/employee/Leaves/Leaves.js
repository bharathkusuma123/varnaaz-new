import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Leaves.css';
import SearchBar from '../../../Navbar/Layout/SearchBar';
import Pagination from '../../../Navbar/Layout/Pagination';
import EmployeeNavbar from '../../../Navbar/EmployeeNavbar/Navbar';

const EmployeeLeavesPage = () => {
  // Get current logged-in user's UID and supervisor UID from localStorage
  const currentUserUid = localStorage.getItem('currentUserUid');
  const supervisorUid = localStorage.getItem('manager_uid') || null;

  const [user, setUser] = useState({ 
    name: '', 
    uid: currentUserUid || 'shashank123' // Fallback for testing
  });
  const [leaveType, setLeaveType] = useState('casual');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [description, setDescription] = useState('');
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
    fetchUserName();
    fetchLeaves();
  }, []);

  const fetchUserName = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUser((prev) => ({ 
          ...prev, 
          name: userDoc.data().fullName || userDoc.data().name || 'Employee' 
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user name', err);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'employeeLeaves', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLeaves(docSnap.data().leaves || []);
      } else {
        setLeaves([]);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
    setLoading(false);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) return alert("Please fill both dates");

    const newLeave = {
      leaveId: Date.now().toString(),
      leaveType,
      fromDate,
      toDate,
      description,
      status: 'Pending',
      appliedOn: new Date().toISOString(),
      supervisorUid: supervisorUid // Add supervisor UID to leave record
    };

    try {
      const docRef = doc(db, 'employeeLeaves', user.uid);
      const docSnap = await getDoc(docRef);
      
      const leaveData = {
        employeeName: user.name,
        employeeUid: user.uid,
        supervisorUid: supervisorUid, // Store supervisor UID at document level
        lastUpdated: serverTimestamp()
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...leaveData,
          leaves: [...docSnap.data().leaves, newLeave]
        });
      } else {
        await setDoc(docRef, {
          ...leaveData,
          leaves: [newLeave],
          createdAt: serverTimestamp()
        });
      }
      
      fetchLeaves();
      resetForm();
      document.getElementById('closeModalBtn').click();
      alert('Leave Applied!');
    } catch (err) {
      console.error('Apply Leave Error:', err);
      alert('Error applying leave');
    }
  };

  const resetForm = () => {
    setLeaveType('casual');
    setFromDate('');
    setToDate('');
    setDescription('');
  };

  const filteredLeaves = leaves.filter(leave =>
    leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (leave.description && leave.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <EmployeeNavbar/>
      <div className="leaves-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Leave Management</h2>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#leaveModal">
            Apply Leave
          </button>
        </div>

        <SearchBar
          placeholder="Search leave type or description..."
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
        />

        <div className="table-responsive">
          {loading ? (
            <p>Loading...</p>
          ) : filteredLeaves.length === 0 ? (
            <p className="text-muted text-center mt-4">No leave requests found.</p>
          ) : (
            <>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.map((leave, index) => (
                    <tr key={leave.leaveId}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{leaveTypes.find(t => t.value === leave.leaveType)?.label || leave.leaveType}</td>
                      <td>{new Date(leave.fromDate).toLocaleDateString('en-IN')}</td>
                      <td>{new Date(leave.toDate).toLocaleDateString('en-IN')}</td>
                      <td>{leave.description || 'N/A'}</td>
                      <td className={`fw-bold text-${leave.status === 'Pending' ? 'warning' : leave.status === 'Approved' ? 'success' : 'danger'}`}>
                        {leave.status}
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

        {/* Modal */}
        <div className="modal fade" id="leaveModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleApplyLeave}>
                <div className="modal-header">
                  <h5 className="modal-title">Apply for Leave</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeModalBtn" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Leave Type</label>
                    <select className="form-select" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required>
                      {leaveTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>From</label>
                    <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label>To</label>
                    <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-success" type="submit">Submit</button>
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeLeavesPage;
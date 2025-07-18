import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SearchBar from '../../../Navbar/Layout/SearchBar';
import Pagination from '../../../Navbar/Layout/Pagination';
import SuperAdminNavbar from '../../../Navbar/SuperAdminNavbar/Navbar';

const Superadmintaskmanager = () => {
  const currentUserUid = localStorage.getItem('currentUserUid');
  const superAdminUid = localStorage.getItem('superadmin_uid') || null;

  const [user, setUser] = useState({ 
    name: '', 
    uid: currentUserUid || 'superadmin123' // Fallback for testing
  });
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUserName();
    fetchTasks();
    fetchAdmins();
  }, []);

  const fetchUserName = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUser((prev) => ({ 
          ...prev, 
          name: userDoc.data().fullName || userDoc.data().name || 'Super Admin' 
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user name', err);
    }
  };

  const fetchAdmins = async () => {
    try {
      if (!superAdminUid) {
        throw new Error('Super Admin UID not found. Please login again.');
      }

      console.log('Fetching admins for super admin:', superAdminUid);
      
      const q = query(
        collection(db, 'users'),
        where('superadmin_uid', '==', superAdminUid),
        where('role', '==', 'admin')
      );

      const querySnapshot = await getDocs(q);
      const adminsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        adminsData.push({
          id: doc.id,
          fullName: data.fullName || '',
        });
      });

      console.log('Fetched admins:', adminsData);
      setAdmins(adminsData);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'sa_superadmintasks', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTasks(docSnap.data().tasks || []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
    setLoading(false);
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedAdmin || !taskName) return alert("Please select an admin and enter task name");

    const newTask = {
      taskId: Date.now().toString(),
      adminId: selectedAdmin,
      adminName: admins.find(a => a.id === selectedAdmin)?.fullName || 'Admin',
      taskName,
      taskDescription,
      status: 'Assigned',
      assignedOn: new Date().toISOString(),
      assignedBy: user.name,
      assignedByUid: user.uid
    };

    try {
      const docRef = doc(db, 'sa_superadmintasks', user.uid);
      const docSnap = await getDoc(docRef);
      
      const taskData = {
        superAdminName: user.name,
        superAdminUid: user.uid,
        lastUpdated: serverTimestamp()
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...taskData,
          tasks: [...docSnap.data().tasks, newTask]
        });
      } else {
        await setDoc(docRef, {
          ...taskData,
          tasks: [newTask],
          createdAt: serverTimestamp()
        });
      }
      
      fetchTasks();
      resetForm();
      document.getElementById('closeModalBtn').click();
      alert('Task Assigned Successfully!');
    } catch (err) {
      console.error('Assign Task Error:', err);
      alert('Error assigning task');
    }
  };

  const resetForm = () => {
    setSelectedAdmin('');
    setTaskName('');
    setTaskDescription('');
  };

  const filteredTasks = tasks.filter(task =>
    task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.taskDescription && task.taskDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
    task.adminName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <SuperAdminNavbar/>
      <div className="leaves-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Super Admin Task Management</h2>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#taskModal">
            Assign Task
          </button>
        </div>

        <SearchBar
          placeholder="Search tasks by name, description or admin..."
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
        />

        <div className="table-responsive">
          {loading ? (
            <p>Loading...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-muted text-center mt-4">No tasks assigned yet.</p>
          ) : (
            <>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Admin Name</th>
                    <th>Task Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    {/* <th>Assigned By</th> */}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map((task, index) => (
                    <tr key={task.taskId}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{task.adminName}</td>
                      <td>{task.taskName}</td>
                      <td>{task.taskDescription || 'N/A'}</td>
                      <td className={`fw-bold text-${
                        task.status === 'Assigned' ? 'warning' : 
                        task.status === 'Completed' ? 'success' : 
                        task.status === 'In Progress' ? 'primary' : 'danger'
                      }`}>
                        {task.status}
                      </td>
                      {/* <td>{task.assignedBy}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredTasks.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        {/* Modal */}
        <div className="modal fade" id="taskModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAssignTask}>
                <div className="modal-header">
                  <h5 className="modal-title">Assign New Task</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeModalBtn" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Admin</label>
                    <select 
                      className="form-select" 
                      value={selectedAdmin} 
                      onChange={(e) => setSelectedAdmin(e.target.value)} 
                      required
                    >
                      <option value="">Select Admin</option>
                      {admins.map(admin => (
                        <option key={admin.id} value={admin.id}>{admin.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Task Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={taskName} 
                      onChange={(e) => setTaskName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      value={taskDescription} 
                      onChange={(e) => setTaskDescription(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-success" type="submit">Assign</button>
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

export default Superadmintaskmanager;
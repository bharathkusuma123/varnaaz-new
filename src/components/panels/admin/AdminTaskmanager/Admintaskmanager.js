import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SearchBar from '../../../Navbar/Layout/SearchBar';
import Pagination from '../../../Navbar/Layout/Pagination';
import AdminNavbar from '../../../Navbar/AdminNavbar/Navbar';

const Admintaskmanager = () => {
  const currentUserUid = localStorage.getItem('currentUserUid');
  const adminUid = localStorage.getItem('admin_uid') || 
                 localStorage.getItem('superadmin_uid') || null;

  const [user, setUser] = useState({ 
    name: '', 
    uid: currentUserUid || 'admin123' // Fallback for testing
  });
  const [selectedManager, setSelectedManager] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUserName();
    fetchTasks();
    fetchManagers();
  }, []);

  const fetchUserName = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUser((prev) => ({ 
          ...prev, 
          name: userDoc.data().fullName || userDoc.data().name || 'Admin' 
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user name', err);
    }
  };

  const fetchManagers = async () => {
    try {
      if (!adminUid) {
        throw new Error('Admin UID not found. Please login again.');
      }

      console.log('Fetching managers for admin:', adminUid);
      
      const q = query(
        collection(db, 'users'),
        where('admin_uid', '==', adminUid),
        where('role', 'in', ['manager', 'seniormanager'])
      );

      const querySnapshot = await getDocs(q);
      const managersData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        managersData.push({
          id: doc.id,
          fullName: data.fullName || '',
        });
      });

      console.log('Fetched managers:', managersData);
      setManagers(managersData);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'a_admintasks', user.uid);
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
    if (!selectedManager || !taskName) return alert("Please select a manager and enter task name");

    const newTask = {
      taskId: Date.now().toString(),
      managerId: selectedManager,
      managerName: managers.find(m => m.id === selectedManager)?.fullName || 'Manager',
      taskName,
      taskDescription,
      status: 'Assigned',
      assignedOn: new Date().toISOString(),
      assignedBy: user.name,
      assignedByUid: user.uid
    };

    try {
      const docRef = doc(db, 'a_admintasks', user.uid);
      const docSnap = await getDoc(docRef);
      
      const taskData = {
        adminName: user.name,
        adminUid: user.uid,
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
    setSelectedManager('');
    setTaskName('');
    setTaskDescription('');
  };

  const filteredTasks = tasks.filter(task =>
    task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.taskDescription && task.taskDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
    task.managerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <AdminNavbar/>
      <div className="leaves-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Admin Task Management</h2>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#taskModal">
            Assign Task
          </button>
        </div>

        <SearchBar
          placeholder="Search tasks by name, description or manager..."
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
                    <th>Manager Name</th>
                    <th>Task Name</th>
                    <th>Description</th>
                    <th>Status</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map((task, index) => (
                    <tr key={task.taskId}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{task.managerName}</td>
                      <td>{task.taskName}</td>
                      <td>{task.taskDescription || 'N/A'}</td>
                      <td className={`fw-bold text-${
                        task.status === 'Assigned' ? 'warning' : 
                        task.status === 'Completed' ? 'success' : 
                        task.status === 'In Progress' ? 'primary' : 'danger'
                      }`}>
                        {task.status}
                      </td>
                     
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
                    <label>Manager</label>
                    <select 
                      className="form-select" 
                      value={selectedManager} 
                      onChange={(e) => setSelectedManager(e.target.value)} 
                      required
                    >
                      <option value="">Select Manager</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>{manager.fullName}</option>
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

export default Admintaskmanager;
import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import ManagerNavbar from '../../../Navbar/ManagerNavbar/Navbar';
import './MyTasksManager.css';

function MyTasksManager() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUserUid = localStorage.getItem('currentUserUid');

    useEffect(() => {
        fetchAssignedTasks();
    }, []);

    const fetchAssignedTasks = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'a_admintasks'));
            const querySnapshot = await getDocs(q);
            const allTasks = [];

            querySnapshot.forEach((docSnapshot) => {
                const adminTasks = docSnapshot.data().tasks || [];
                const managerTasks = adminTasks.filter(task => task.managerId === currentUserUid);
                allTasks.push(...managerTasks);
            });

            setTasks(allTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Update local state immediately
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.taskId === taskId ? { ...task, status: newStatus } : task
                )
            );

            // Find and update the task in a_admintasks collection
            const q = query(collection(db, 'a_admintasks'));
            const querySnapshot = await getDocs(q);

            for (const docSnapshot of querySnapshot.docs) {
                const tasksData = docSnapshot.data().tasks || [];
                const taskIndex = tasksData.findIndex(task => task.taskId === taskId);

                if (taskIndex !== -1) {
                    const updatedTasks = [...tasksData];
                    updatedTasks[taskIndex] = {
                        ...updatedTasks[taskIndex],
                        status: newStatus,
                    };
                    await updateDoc(docSnapshot.ref, { tasks: updatedTasks });
                    break; // exit after updating the matching doc
                }
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            fetchAssignedTasks(); // Revert state in case of error
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Assigned':
                return 'status-pending'; // orange
            case 'In Progress':
                return 'status-in-progress'; // blue
            case 'Completed':
                return 'status-approved'; // green
            default:
                return '';
        }
    };

    return (
        <>
            <ManagerNavbar />
            <div className="tasks-container">
                <div className="tasks-header">
                    <h2>My Tasks</h2>
                    <p className="welcome-message">Here are the tasks assigned to you by admin</p>
                </div>

                {loading ? (
                    <div className="text-center mt-4">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="no-tasks">No tasks assigned yet.</div>
                ) : (
                    <div className="tasks-table-container">
                        <table className="tasks-table">
                            <thead>
                                <tr>
                                    <th>Task Name</th>
                                    <th className="description-column">Description</th>
                                    <th>Assigned On</th>
                                    {/* <th>Assigned By</th> */}
                                    <th className="status-column">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.taskId}>
                                        <td>{task.taskName}</td>
                                        <td>{task.taskDescription || 'N/A'}</td>
                                        <td>{new Date(task.assignedOn).toLocaleDateString()}</td>
                                        {/* <td>{task.assignedBy}</td> */}
                                        <td>
                                            <select
                                                className={`form-select ${getStatusClass(task.status)}`}
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.taskId, e.target.value)}
                                                disabled={task.status === 'Completed'}
                                            >
                                                <option value="Assigned">Assigned</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default MyTasksManager;
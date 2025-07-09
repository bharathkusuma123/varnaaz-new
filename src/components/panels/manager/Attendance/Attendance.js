import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Attendance.css';
import ManagerNavbar from '../../../Navbar/ManagerNavbar/Navbar';

const ManagerAttendance = () => {
    // Get user data from localStorage or context (modified to get actual logged in user)
    const currentUserUid = localStorage.getItem('currentUserUid');
    const managerUid = localStorage.getItem('manager_uid') || null;
    const adminUid = localStorage.getItem('admin_uid') || null;
    const superadminUid = localStorage.getItem('superadmin_uid') || null;
    
    // Determine the supervisor UID based on what's available
    const supervisorUid = managerUid || adminUid || superadminUid;

    const [user, setUser] = useState({
        fullName: "Loading...",
        uid: currentUserUid
    });

    const [attendance, setAttendance] = useState({
        checkInTime: null,
        checkOutTime: null,
        duration: null,
        status: "N/A"
    });

    // Fetch user details on component mount
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userDocRef = doc(db, 'users', currentUserUid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    setUser({
                        fullName: userDocSnap.data().fullName || "Unknown User",
                        uid: currentUserUid
                    });
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        if (currentUserUid) {
            fetchUserDetails();
        }
    }, [currentUserUid]);

    const getCurrentDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const today = getCurrentDate();

    useEffect(() => {
        const loadAttendanceData = async () => {
            try {
                const docRef = doc(db, 'm_attendance', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data()[today]) {
                    const todayData = docSnap.data()[today];
                    setAttendance({
                        checkInTime: todayData.checkIn ? new Date(todayData.checkIn.seconds * 1000).toLocaleTimeString() : null,
                        checkOutTime: todayData.checkOut ? new Date(todayData.checkOut.seconds * 1000).toLocaleTimeString() : null,
                        duration: todayData.duration || null,
                        status: todayData.status || "N/A"
                    });
                }
            } catch (error) {
                console.error("Error loading attendance data:", error);
            }
        };

        if (user.uid) {
            loadAttendanceData();
        }
    }, [today, user.uid]);

    const calculateDuration = (checkInTime, checkOutTime) => {
        const diffMs = checkOutTime - checkInTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);
        const remainingMins = diffMins % 60;
        return `${diffHrs}h ${remainingMins}m`;
    };

    const handleCheckIn = async () => {
        const now = new Date();
        const checkInTime = now.toLocaleTimeString();
        
        try {
            const docRef = doc(db, 'm_attendance', user.uid);
            
            await setDoc(docRef, {
                fullName: user.fullName,
                supervisorUid: supervisorUid, // Storing supervisor UID
                [today]: {
                    checkIn: now,
                    status: "Checked In",
                    supervisorUid: supervisorUid // Also storing in daily record
                }
            }, { merge: true });

            setAttendance({
                ...attendance,
                checkInTime,
                status: "Checked In"
            });
        } catch (error) {
            console.error("Error checking in:", error);
            alert("Failed to check in");
        }
    };

    const handleCheckOut = async () => {
        const now = new Date();
        const checkOutTime = now.toLocaleTimeString();
        
        try {
            const docRef = doc(db, 'm_attendance', user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists() || !docSnap.data()[today]?.checkIn) {
                alert("You need to check in first!");
                return;
            }

            const checkInTimestamp = docSnap.data()[today].checkIn.toDate();
            const duration = calculateDuration(checkInTimestamp, now);

            const updateData = {
                fullName: user.fullName,
                supervisorUid: supervisorUid, // Maintaining supervisor UID
                [today]: {
                    ...docSnap.data()[today],
                    checkOut: now,
                    duration: duration,
                    status: "Present",
                    supervisorUid: supervisorUid // Also in daily record
                }
            };

            await setDoc(docRef, updateData, { merge: true });

            setAttendance({
                ...attendance,
                checkOutTime,
                duration,
                status: "Present"
            });
        } catch (error) {
            console.error("Error checking out:", error);
            alert("Failed to check out");
        }
    };

    return (
        <>
            <ManagerNavbar/>
            <div className="attendance-container">
                <div className="attendance-header">
                    <h2>Attendance</h2>
                    <p className="welcome-message">Welcome, {user.fullName}</p>
                </div>

                <div className="attendance-card">
                    <div className="attendance-date">
                        <span className="date-label">Date:</span>
                        <span className="date-value">{today}</span>
                    </div>

                    <div className="attendance-details">
                        <div className="detail-row">
                            <span className="detail-label">Check-In:</span>
                            <span className="detail-value">
                                {attendance.checkInTime || "Not checked in"}
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Check-Out:</span>
                            <span className="detail-value">
                                {attendance.checkOutTime || "Not checked out"}
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">
                                {attendance.duration || "N/A"}
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className={`detail-value status-${attendance.status.toLowerCase().replace(' ', '-')}`}>
                                {attendance.status}
                            </span>
                        </div>
                    </div>

                    <div className="attendance-actions">
                        {!attendance.checkInTime && (
                            <button 
                                onClick={handleCheckIn}
                                className="btn checkin-btn"
                            >
                                Check In
                            </button>
                        )}

                        {attendance.checkInTime && !attendance.checkOutTime && (
                            <button 
                                onClick={handleCheckOut}
                                className="btn checkout-btn"
                            >
                                Check Out
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManagerAttendance;
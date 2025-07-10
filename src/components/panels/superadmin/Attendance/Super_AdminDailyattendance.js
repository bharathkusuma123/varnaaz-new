import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase';
import SearchBar from '../../../../components/Navbar/Layout/SearchBar';
import Pagination from '../../../../components/Navbar/Layout/Pagination';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DailyAttendance.css';
import SuperAdminNavbar from '../../../Navbar/SuperAdminNavbar/Navbar';

const Super_AdminDailyattendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, '/'));
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const currentSuperAdminUid = localStorage.getItem('currentUserUid');

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const attendanceRef = collection(db, 'a_attendance');
      const querySnapshot = await getDocs(attendanceRef);
      const data = [];

      querySnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Match admins under this super admin
        if (userData.supervisorUid === currentSuperAdminUid) {
          Object.keys(userData).forEach(date => {
            if (date.includes('/')) {
              const attendance = userData[date];
              data.push({
                id: `${userId}_${date}`,
                userId,
                name: userData.name || attendance.name || 'N/A',
                date,
                checkIn: attendance.checkIn || null,
                checkOut: attendance.checkOut || null,
                status: attendance.status || 'N/A',
                duration: attendance.duration || 'N/A'
              });
            }
          });
        }
      });

      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [currentSuperAdminUid]);

  const filteredData = attendanceData
    .filter(item => item.date === selectedDate)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Admin Attendance Report - ${selectedDate}`, 14, 15);

    const tableData = filteredData.map((item, index) => [
      index + 1,
      item.name,
      item.date,
      item.checkIn ? formatTime(item.checkIn) : 'N/A',
      item.checkOut ? formatTime(item.checkOut) : 'N/A',
      item.status,
      item.duration
    ]);

    doc.autoTable({
      head: [['S.No', 'Name', 'Date', 'Check-In', 'Check-Out', 'Status', 'Duration']],
      body: tableData,
      startY: 20,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    doc.save(`admin_attendance_${selectedDate.replace(/\//g, '-')}.pdf`);
  };

  return (
    <>
      <SuperAdminNavbar />
      <div className="daily-attendance-container">
        <h2>Admin Daily Attendance</h2>
        <p className="subtitle">Viewing attendance for admins under your supervision</p>

        <div className="filter-section">
          <label htmlFor="date-filter">Select Date:</label>
          <input
            type="date"
            id="date-filter"
            value={selectedDate.split('/').reverse().join('-')}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split('-');
              setSelectedDate(`${day}/${month}/${year}`);
              setCurrentPage(1);
            }}
          />
          <button onClick={generatePDF} className="btn btn-primary ms-3">
            Export to PDF
          </button>
        </div>

        <SearchBar placeholder="Search by name..." value={searchQuery} onChange={setSearchQuery} />

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.date}</td>
                        <td>{item.checkIn ? formatTime(item.checkIn) : 'Not Checked In'}</td>
                        <td>{item.checkOut ? formatTime(item.checkOut) : 'Not Checked Out'}</td>
                        <td className={`status-${item.status.toLowerCase().replace(' ', '-')}`}>
                          {item.status}
                        </td>
                        <td>{item.duration}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        {attendanceData.length === 0
                          ? "No admins found under your supervision"
                          : "No attendance records found for this date"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Super_AdminDailyattendance;

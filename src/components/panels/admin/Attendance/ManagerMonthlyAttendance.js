import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../../firebase/firebase';
import * as XLSX from "xlsx";
import "./MonthlyAttendance.css";
import AdminNavbar from "../../../Navbar/AdminNavbar/Navbar";

const AdminManagerMonthlyAttendance = () => {
  // Get current logged-in admin's UID from localStorage
  const currentAdminUid = localStorage.getItem('currentUserUid');

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const daysInMonth = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const getAttendance = async () => {
    try {
      setLoading(true);
      const colRef = collection(db, "m_attendance");
      const snapshot = await getDocs(colRef);

      const [year, month] = selectedMonth.split("-");
      const monthToMatch = `${month}/${year}`;

      const result = [];
      
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const userId = docSnap.id;
        
        // Only process managers who report to this admin
        if (data.supervisorUid === currentAdminUid) {
          const name = data.fullName || data.name || userId;
          const attendance = {};

          for (const [date, value] of Object.entries(data)) {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
              const [day, m, y] = date.split("/");
              const dateMonth = `${m}/${y}`;
              if (dateMonth === monthToMatch) {
                attendance[day] = value.status === "Present" ? "P" : "";
              }
            }
          }

          result.push({ uid: userId, name, attendance });
        }
      });

      setAttendanceData(result);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (attendanceData.length === 0) {
      alert("No data to export");
      return;
    }

    const wsData = [
      ["S.No", "Manager Name", ...daysInMonth, "Total Present"],
      ...attendanceData.map((user, idx) => {
        const row = [
          idx + 1,
          user.name,
          ...daysInMonth.map((d) => user.attendance[d] || ""),
        ];
        const totalPresent = daysInMonth.filter(
          (d) => user.attendance[d] === "P"
        ).length;
        row.push(totalPresent);
        return row;
      }),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = [{wch: 5}, {wch: 20}, ...daysInMonth.map(() => ({wch: 3})), {wch: 12}];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Manager_Attendance_${selectedMonth}.xlsx`);
  };

  useEffect(() => {
    getAttendance();
  }, [selectedMonth, currentAdminUid]);

  return (
    <>
      <AdminNavbar/>
      <div className="monthly-attendance-container">
        <h2 className="title">
          Manager Monthly Attendance for {getMonthName(selectedMonth)}{" "}
          {selectedMonth.split("-")[0]}
        </h2>
        <p className="subtitle">Viewing attendance for managers under your supervision</p>

        <div className="filters">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button className="download-btn" onClick={downloadExcel}>
            Download Excel
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading manager attendance data...</div>
        ) : attendanceData.length === 0 ? (
          <div className="no-data">
            No managers found under your supervision or no attendance records for selected month
          </div>
        ) : (
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Manager Name</th>
                  {daysInMonth.map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                  <th>Total Present</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((user, idx) => {
                  const totalPresent = daysInMonth.filter(
                    (d) => user.attendance[d] === "P"
                  ).length;

                  return (
                    <tr key={user.uid}>
                      <td>{idx + 1}</td>
                      <td>{user.name}</td>
                      {daysInMonth.map((d) => (
                        <td key={d} className={user.attendance[d] === "P" ? "present" : ""}>
                          {user.attendance[d] || ""}
                        </td>
                      ))}
                      <td className="total-present">{totalPresent}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminManagerMonthlyAttendance;
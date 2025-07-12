import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import * as XLSX from "xlsx";
import "./MonthlyAttendance.css";
import ManagerNavbar from "../../../Navbar/ManagerNavbar/Navbar";

const ManagerEmployeeMonthlyAttendance = () => {
  const currentManagerUid = localStorage.getItem('currentUserUid');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate days in month dynamically
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // Update daysInMonth when selectedMonth changes
  useEffect(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const daysCount = getDaysInMonth(year, month);
    const daysArray = Array.from({ length: daysCount }, (_, i) => 
      String(i + 1).padStart(2, "0")
    );
    setDaysInMonth(daysArray);
  }, [selectedMonth]);

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split("-");
    return new Date(year, month - 1).toLocaleString("default", { month: "long" });
  };

  const getAttendance = async () => {
    try {
      setLoading(true);
      const colRef = collection(db, "e_attendance");
      const snapshot = await getDocs(colRef);

      const [year, month] = selectedMonth.split("-");
      const monthToMatch = `${month}/${year}`;

      const result = [];
      
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.supervisorUid === currentManagerUid) {
          const userId = docSnap.id;
          const name = data.name || userId;
          const attendance = {};

          for (const [date, value] of Object.entries(data)) {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
              const [day, m, y] = date.split("/");
              if (`${m}/${y}` === monthToMatch) {
                attendance[day] = value.status === "Present" ? "P" : "A"; // A for Absent
              }
            }
          }

          result.push({ uid: userId, name, attendance });
        }
      });

      setAttendanceData(result);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!attendanceData.length) {
      alert("No data to export");
      return;
    }

    const wsData = [
      ["S.No", "Employee Name", ...daysInMonth, "Total Present", "Total Absent"],
      ...attendanceData.map((user, idx) => {
        const presentDays = daysInMonth.filter(d => user.attendance[d] === "P");
        const absentDays = daysInMonth.filter(d => user.attendance[d] === "A");
        return [
          idx + 1,
          user.name,
          ...daysInMonth.map(d => user.attendance[d] || "-"),
          presentDays.length,
          absentDays.length
        ];
      })
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      {wch: 5},  // S.No
      {wch: 20}, // Employee Name
      ...daysInMonth.map(() => ({wch: 3})), // Day columns
      {wch: 12}, // Total Present
      {wch: 12}  // Total Absent
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Employee_Attendance_${selectedMonth}.xlsx`);
  };

  useEffect(() => {
    getAttendance();
  }, [selectedMonth, currentManagerUid]);

  return (
    <>
      <ManagerNavbar/>
      <div className="monthly-attendance-container">
        <h2 className="title">
          Employee Attendance for {getMonthName(selectedMonth)} {selectedMonth.split("-")[0]}
        </h2>
        <p className="subtitle">Viewing employees under your supervision</p>

        <div className="filters">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            max={new Date().toISOString().slice(0, 7)}
          />
          <button 
            className="download-btn" 
            onClick={downloadExcel}
            disabled={!attendanceData.length}
          >
            Download Excel
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading data...</div>
        ) : !attendanceData.length ? (
          <div className="no-data">
            No attendance records found for selected month
          </div>
        ) : (
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee</th>
                  {daysInMonth.map(d => <th key={d}>{d}</th>)}
                  <th>Present</th>
                  <th>Absent</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((user, idx) => {
                  const presentDays = daysInMonth.filter(d => user.attendance[d] === "P");
                  const absentDays = daysInMonth.filter(d => user.attendance[d] === "A");
                  return (
                    <tr key={user.uid}>
                      <td>{idx + 1}</td>
                      <td>{user.name}</td>
                      {daysInMonth.map(d => (
                        <td 
                          key={d} 
                          className={
                            user.attendance[d] === "P" ? "present" : 
                            user.attendance[d] === "A" ? "absent" : ""
                          }
                        >
                          {user.attendance[d] || ""}
                        </td>
                      ))}
                      <td className="total-present">{presentDays.length}</td>
                      <td className="total-absent">{absentDays.length}</td>
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

export default ManagerEmployeeMonthlyAttendance;
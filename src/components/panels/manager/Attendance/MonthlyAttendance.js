import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../../firebase/firebase';
import * as XLSX from "xlsx";
import "./MonthlyAttendance.css";
import ManagerNavbar from "../../../Navbar/ManagerNavbar/Navbar";

const ManagerMonthlyAttendance = () => {
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [attendanceData, setAttendanceData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to get days in month (handles leap years)
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
      const colRef = collection(db, "m_attendance");
      const snapshot = await getDocs(colRef);

      const [year, month] = selectedMonth.split("-");
      const monthToMatch = `${month}/${year}`;

      const result = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const userId = docSnap.id;
        const name = data.name || userId;

        const attendance = {};
        for (const [date, value] of Object.entries(data)) {
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
            const [day, m, y] = date.split("/");
            if (`${m}/${y}` === monthToMatch) {
              attendance[day] = value.status === "Present" ? "P" : "";
            }
          }
        }

        return { uid: userId, name, attendance };
      });

      setAttendanceData(result);
    } catch (error) {
      console.error("Error fetching attendance:", error);
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
      ["S.No", "User Name", ...daysInMonth, "Total Present"],
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
    ws['!cols'] = [
      {wch: 5},  // S.No
      {wch: 20}, // User Name
      ...daysInMonth.map(() => ({wch: 3})), // Day columns
      {wch: 12}  // Total Present
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${selectedMonth}.xlsx`);
  };

  useEffect(() => {
    getAttendance();
  }, [selectedMonth]);

  return (
    <>
      <ManagerNavbar/>
      <div className="monthly-attendance-container">
        <h2 className="title">
          Monthly Attendance for {getMonthName(selectedMonth)}{" "}
          {selectedMonth.split("-")[0]}
        </h2>

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
            disabled={attendanceData.length === 0}
          >
            Download Excel
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading attendance data...</div>
        ) : attendanceData.length === 0 ? (
          <div className="no-data">
            No attendance records found for selected month
          </div>
        ) : (
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User Name</th>
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
                        <td 
                          key={d} 
                          className={user.attendance[d] === "P" ? "present" : ""}
                        >
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

export default ManagerMonthlyAttendance;
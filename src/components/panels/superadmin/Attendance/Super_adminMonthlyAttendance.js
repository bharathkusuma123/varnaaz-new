import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../../firebase/firebase';
import * as XLSX from "xlsx";
import "./MonthlyAttendance.css";
import SuperAdminNavbar from "../../../Navbar/SuperAdminNavbar/Navbar";

const Super_adminMonthlyAttendance = () => {
  const currentSuperAdminUid = localStorage.getItem("currentUserUid");

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Function to get the number of days in a month
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
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const getAttendance = async () => {
    setLoading(true);

    try {
      const colRef = collection(db, "a_attendance");
      const snapshot = await getDocs(colRef);

      const [year, month] = selectedMonth.split("-");
      const monthToMatch = `${month}/${year}`;

      const result = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const userId = docSnap.id;

        if (data.supervisorUid === currentSuperAdminUid) {
          const name = data.name || userId;
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
      ["S.No", "Admin Name", ...daysInMonth, "Total Present"],
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
    const colWidths = [
      { wch: 5 },   // S.No
      { wch: 20 },  // Admin Name
      ...daysInMonth.map(() => ({ wch: 3 })),  // Day columns
      { wch: 12 }   // Total Present
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Admin_Attendance_${selectedMonth}.xlsx`);
  };

  useEffect(() => {
    getAttendance();
  }, [selectedMonth]);

  return (
    <>
      <SuperAdminNavbar />
      <div className="monthly-attendance-container">
        <h2 className="title">
          Admin Monthly Attendance for {getMonthName(selectedMonth)} {selectedMonth.split("-")[0]}
        </h2>
        <p className="subtitle">Viewing attendance for admins under your supervision</p>

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
          <div className="loading">Loading admin attendance data...</div>
        ) : attendanceData.length === 0 ? (
          <div className="no-data">
            No admins found under your supervision or no attendance records for selected month
          </div>
        ) : (
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Admin Name</th>
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

export default Super_adminMonthlyAttendance;
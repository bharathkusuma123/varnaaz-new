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

  const daysInMonth = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const getAttendance = async () => {
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
          const dateMonth = `${m}/${y}`;
          if (dateMonth === monthToMatch) {
            attendance[day] = value.status === "Present" ? "P" : "";
          }
        }
      }

      return { uid: userId, name, attendance };
    });

    setAttendanceData(result);
  };

  const downloadExcel = () => {
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
        />
        <button className="download-btn" onClick={downloadExcel}>
          Download Excel
        </button>
      </div>

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
                    <td key={d}>{user.attendance[d] || ""}</td>
                  ))}
                  <td>{totalPresent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default ManagerMonthlyAttendance;

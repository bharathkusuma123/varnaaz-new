import './App.css';
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './components/loginSignup/login';
import Signup from './components/loginSignup/signup';
import AdminDashboard from './components/panels/admin/AdminDashboard';
import ManagerDashboard from './components/panels/manager/ManagerDashboard';
import EmployeeDashboard from './components/panels/employee/EmployeeDashboard';
import SuperadminDashboard from './components/panels/superadmin/SuperadminDashboard';
import AdminRegistrationForm from './components/panels/superadmin/AdminRegistrationForm';
import ManagerRgistration from './components/panels/admin/ManagerRegistration';
import EmployeeRegistration from './components/panels/manager/EmployeeRegistration';
import ViewEmployees from './components/panels/manager/ViewEmployees';
import ViewManagers from './components/panels/admin/ViewManagers';
import ViewAdminDetails from './components/panels/superadmin/ViewAdminDetails';
import Superadminnavbar from './components/Navbar/SuperAdminNavbar/Navbar';
import Attendance from './components/panels/admin/Attendance/Attendance';
import DailyAttendance from './components/panels/admin/Attendance/DailyAttendance';
import MonthlyAttendance from './components/panels/admin/Attendance/MonthlyAttendance';
import LeavesPage from './components/panels/admin/Leaves/Leaves';
import SuperAdminAttendance from './components/panels/superadmin/Attendance/Attendance';
import SuperAdminDailyAttendance from './components/panels/superadmin/Attendance/DailyAttendance';
import SuperAdminMonthlyAttendance from './components/panels/superadmin/Attendance/MonthlyAttendance';
import SuperAdminLeavesPage from './components/panels/superadmin/Leaves/Leaves';
import ManagerAttendance from './components/panels/manager/Attendance/Attendance';
import ManagerDailyAttendance from './components/panels/manager/Attendance/DailyAttendance';
import ManagerMonthlyAttendance from './components/panels/manager/Attendance/MonthlyAttendance';
import ManagerLeavesPage from './components/panels/manager/Leaves/Leaves';
import EmployeeAttendance from './components/panels/employee/Attendance/Attendance';
import EmployeeDailyAttendance from './components/panels/employee/Attendance/DailyAttendance';
import EmployeeMonthlyAttendance from './components/panels/employee/Attendance/MonthlyAttendance';
import EmployeeLeavesPage from './components/panels/employee/Leaves/Leaves';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/managerdashboard" element={<ManagerDashboard />} />
          <Route path="/employedashboard" element={<EmployeeDashboard />} />
          <Route path="/superadmindashboard" element={<SuperadminDashboard />} />
          <Route path="/adminregistrationform" element={<AdminRegistrationForm />} />
          <Route path="/managerregistration" element={<ManagerRgistration />} />
          <Route path="/employeeregistration" element={<EmployeeRegistration />} />
          <Route path="/viewemployees" element={<ViewEmployees />} />
          <Route path="/viewmanagers" element={<ViewManagers />} />
          <Route path="/viewadmindetails" element={<ViewAdminDetails />} />

          {/* Admin attendances */}
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/dailyattendance" element={<DailyAttendance />} />
          <Route path="/monthlyattendance" element={<MonthlyAttendance />} />
          <Route path="/leaves" element={<LeavesPage />} />

          {/* Super admin attendances */}
          <Route path="/sa-attendance" element={<SuperAdminAttendance />} />
          <Route path="/sa-dailyattendance" element={<SuperAdminDailyAttendance />} />
          <Route path="/sa-monthlyattendance" element={<SuperAdminMonthlyAttendance />} />
          <Route path="/sa-leaves" element={<SuperAdminLeavesPage />} />

          {/* Manager attendances */}
          <Route path="/m-attendance" element={<ManagerAttendance />} />
          <Route path="/m-dailyattendance" element={<ManagerDailyAttendance />} />
          <Route path="/m-monthlyattendance" element={<ManagerMonthlyAttendance />} />
          <Route path="/m-leaves" element={<ManagerLeavesPage />} />

          {/* Employee attendances */}
          <Route path="/e-attendance" element={<EmployeeAttendance />} />
          <Route path="/e-dailyattendance" element={<EmployeeDailyAttendance />} />
          <Route path="/e-monthlyattendance" element={<EmployeeMonthlyAttendance />} />
          <Route path="/e-leaves" element={<EmployeeLeavesPage />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

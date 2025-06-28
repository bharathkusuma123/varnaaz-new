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
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

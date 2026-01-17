import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';


import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import OTs from './pages/OTs';
import SurgeryScheduler from './pages/SurgeryScheduler';
import Reports from './pages/Reports';
import Resources from './pages/Resources';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
             <Route index element={
               <ProtectedRoute>
                 <Dashboard />
               </ProtectedRoute>
             } />
             
             <Route path="doctors" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Doctors />
                </ProtectedRoute>
             } />

             <Route path="patients" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <Patients />
                </ProtectedRoute>
             } />
            
             <Route path="ots" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <OTs />
                </ProtectedRoute>
             } />

             <Route path="surgeries" element={
                <ProtectedRoute>
                  <SurgeryScheduler />
                </ProtectedRoute>
             } />

             <Route path="resources" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <Resources />
                </ProtectedRoute>
             } />

             <Route path="reports" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <Reports />
                </ProtectedRoute>
             } />

             <Route path="audit-logs" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
             } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

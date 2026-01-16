import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check if user's role is in the list
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
     return <div className="text-center mt-10 text-red-600 font-bold">Access Denied: You do not have permission to view this page.</div>;
  }

  return children;
};



export default ProtectedRoute;

import { Navigate } from 'react-router-dom';
import authUtils from '../utils/auth';

export default function ProtectedRoute({ children }) {
  return authUtils.isAuthenticated() ? children : <Navigate to="/login" />;
}
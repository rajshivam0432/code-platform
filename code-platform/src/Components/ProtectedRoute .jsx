// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // alert("Please Login first")
  return token ? children : <Navigate to="/signin" />;
};
export default ProtectedRoute; 
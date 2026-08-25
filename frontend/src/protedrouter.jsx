import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Children } from "react";

function ProtedRouter({ roles, children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to={"/"} />;
  }

  const rol = jwtDecode(token);
  if (!rol.rol) {
    return <Navigate to={"/"} />;
  }

  if (roles.includes(rol.rol)) {
    return children;
  }
  return <Navigate to={"/"} />;
}

export default ProtedRouter;

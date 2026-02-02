import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../features/auth/authSlice";

const ProtectedRoutes = () => {
    const isAuth = useSelector(selectIsAuth);
    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;

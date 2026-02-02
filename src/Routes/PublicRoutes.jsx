import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../features/auth/authSlice";

const PublicRoutes = () => {
    const isAuth = useSelector(selectIsAuth);
    return isAuth ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoutes;

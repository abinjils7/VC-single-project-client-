import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";

const AdminRoutes = () => {
    const user = useSelector(selectCurrentUser);
    const isAuth = user && user.role === "admin";

    return isAuth ? <Outlet /> : <Navigate to="/home" replace />;
};

export default AdminRoutes;

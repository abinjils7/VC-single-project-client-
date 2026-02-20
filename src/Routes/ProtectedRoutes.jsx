import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth, selectCurrentUser } from "../features/auth/authSlice";

const ProtectedRoutes = () => {
    const isAuth = useSelector(selectIsAuth);
    const user = useSelector(selectCurrentUser);

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    // If admin tries to access normal protected routes, redirect to admin dashboard
    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;

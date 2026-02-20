import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth, selectCurrentUser } from "../features/auth/authSlice";

const PublicRoutes = () => {
    const isAuth = useSelector(selectIsAuth);
    const user = useSelector(selectCurrentUser);

    if (isAuth) {
        if (user?.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default PublicRoutes;

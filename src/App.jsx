import { Routes, Route } from "react-router-dom";
import Login from "./Pages/AuthPages/Login";
import Register from "./Pages/AuthPages/Register";
import HomePage from "./Pages/StartupPages/home";
import ForgotPassword from "./Pages/AuthPages/ForgetPassword";
import ChangePassword from "./Pages/AuthPages/ChangePassword";
import ResetPassword from "./Pages/AuthPages/ResetPassword";
import ProfilePage from "./Pages/ComonPages/Profile";
import ChatPage from "./Pages/ChatPages/Chat";
import PitchInbox from "./Pages/InvestorPages/PitchInbox";
import Analytics from "./Pages/ComonPages/Analytics";
import SubscriptionPlans from "./Pages/SubscriptionPages/SubscriptionPlans";
import SubscriptionPopup from "./Components/SubscriptionPopup";
import Maintenance from "./Pages/ComonPages/Maintenance"; // <-- NEW: maintenance page

import { Toaster } from "sonner";

import PublicRoutes from "./Routes/PublicRoutes";
import ProtectedRoutes from "./Routes/ProtectedRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import AdminDashboard from "./Pages/AdminPages/Dashboard";
import ManageUsers from "./Pages/AdminPages/ManageUsers";
import Reports from "./Pages/AdminPages/Reports";
import PostNews from "./Pages/AdminPages/PostNews";

import { useGetMeQuery } from "./features/auth/authApiSlice";

function App() {
  const { isLoading } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <SubscriptionPopup />
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        {/* Public Routes - Accessible only when NOT logged in */}
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgetPassword" element={<ForgotPassword />} />
        </Route>

        {/* Protected Routes - Accessible only when logged in */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/ChangePassword" element={<ChangePassword />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/pitch-inbox" element={<PitchInbox />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/subscribe" element={<SubscriptionPlans />} />
        </Route>

        {/* Admin Routes - Accessible only by ADMIN */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/post-news" element={<PostNews />} />
        </Route>

        {/* Maintenance page — accessible by everyone, not inside any guard */}
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>
    </>
  );
}

export default App;

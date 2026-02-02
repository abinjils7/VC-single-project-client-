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
import StartupAnalytics from "./Pages/StartupPages/Analytics";
import SubscriptionPlans from "./Pages/SubscriptionPages/SubscriptionPlans";
import SubscriptionPopup from "./Components/SubscriptionPopup";

import { Toaster } from 'react-hot-toast';

import PublicRoutes from "./Routes/PublicRoutes";
import ProtectedRoutes from "./Routes/ProtectedRoutes";
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
      <Toaster position="top-center" reverseOrder={false} />
      <SubscriptionPopup />
      <Routes>
        {/* Public Routes - Accessible only when NOT logged in */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Register />} />
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
          <Route path="/analytics" element={<StartupAnalytics />} />
          <Route path="/subscribe" element={<SubscriptionPlans />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register.tsx";
import { BrowseListings } from "./pages/BrowseListings";
import { PaymentCallback } from "./pages/PaymentCallback";
import { ProtectedRoutes } from "./secure/protectedRoutes.tsx";
import { Dashboard } from './secure/dashboard.tsx';
import { MyListings } from './secure/my-listings.tsx';
import { TransactionsPage } from './secure/transactions.tsx';
import { Profile } from "./secure/profile.tsx";
import { Earnings } from './secure/earnings.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<BrowseListings />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />

        {/* Protected Routes — wrapped in AppShell via ProtectedRoutes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/earnings" element={<Earnings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

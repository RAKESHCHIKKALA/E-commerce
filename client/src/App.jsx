import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./pages/navbar/navbar";
import Signup from "./pages/signup/signup";
import Signin from "./pages/signin/signin";
import Home from "./pages/home/home";
import Profile from "./pages/profile/profile";
import Cart from "./pages/cart/cart";
import ProductDetail from "./pages/product/product";
import Buy from "./pages/buy/buy";

import AdminDashboard from "./pages/admin/admindashboard/admindashboard";

import AdminProducts from "./pages/admin/products/addproducts"
import AdminOrders from "./pages/admin/orders/orders"
import UserOrders from "./pages/orders/orders"


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // prevents flicker
  const API_BASE = import.meta.env.VITE_API_url || "http://localhost:1234";

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setIsLoggedIn(false);
    setLoading(false);
    return;
  }

  axios
    .get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setIsLoggedIn(true);
    })
    .catch(() => {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

// Listen for login/logout changes
useEffect(() => {
  const handleStorage = () => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  };

  window.addEventListener("storage", handleStorage);

  return () => window.removeEventListener("storage", handleStorage);
}, []);


  return (
    <BrowserRouter>
      {/* Pass status to Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        loading={loading}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/buy/:id" element={<Buy />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts/>}/>
        <Route path="/admin/orders" element={<AdminOrders/>}/>
        
      </Routes>
   
    </BrowserRouter>
  );
}

export default App;

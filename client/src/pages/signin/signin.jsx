import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./signin.css";

function Signin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     const res = await axios.post(`${API_URL}/users/login`, form);


      // 1️⃣ Save token & admin info BEFORE navigating
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isAdmin", res.data.user.isAdmin ? "true" : "false");

      // 2️⃣ Tell React app that login state changed
      window.dispatchEvent(new Event("storage"));

      // 3️⃣ Navigate after storing data
      navigate("/");

      console.log(res.data);

    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="auth-shell">
      <div className="glow orb1"></div>
      <div className="glow orb2"></div>
      <div className="signin-card">
        <h2>Welcome Back</h2>
        <p className="sub">Dive into your account with a single click.</p>

        <form onSubmit={handleSubmit} className="signin-form">
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button type="submit" className="cta">
            Sign In
          </button>
        </form>

        <p className="footnote">
          Don’t have an account? <a href="/signup">Create one</a>
        </p>
      </div>
    </div>
  );
}

export default Signin;

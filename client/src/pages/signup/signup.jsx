import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./signup.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
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
      const res = await axios.post(`${API_BASE}/users/register`, form);


      // If backend sends token — save it
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
         window.dispatchEvent(new Event("storage"));
      }

      alert("Signup Successful!");
      navigate("/"); // redirect to home
    } catch (err) {
      alert("Registration Failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-shell">
      <div className="glow orb1"></div>
      <div className="glow orb2"></div>
      <div className="signup-card">
        <h2>Create an Account</h2>
        <p className="sub">Shop faster with your personal account.</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />

          <button type="submit" className="cta">
            Sign Up
          </button>
        </form>

        <p className="signin-link">
          Already have an account? <a href="/signin">Login</a>
        </p>
      </div>
      
    </div>
  );
}

export default Signup;

import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
function Navbar({ isLoggedIn, loading, onLogout }) {
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (loading) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    if (onLogout) onLogout();
    window.dispatchEvent(new Event("storage")); // sync other listeners
    navigate("/signin");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">E-Shop</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {/* NOT LOGGED IN */}
        {!isLoggedIn && (
          <>
            <Link to="/signin">Signin</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}

        {/* LOGGED IN */}
        {isLoggedIn && (
          <>
            {/* Admin Links */}
            {isAdmin ? (
              <>
                <Link to="/admin">Admin Dashboard</Link>
                <Link to="/admin/products">Manage Products</Link>
                <Link to="/admin/orders">Manage Orders</Link>
              </>
            ) : (
              /* Normal User Links */
              <>
                <Link to="/profile">Profile</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/orders">Orders</Link>
              </>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

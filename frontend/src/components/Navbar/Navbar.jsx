import React, { useContext, useState,useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Link } from 'react-router-dom';
import './Navbar.css'; // For custom styling
import { StockContext } from '../../Context/StockContext';


const Navbar = ({ setShowlogin }) => {
  const { token, setToken } = useContext(StockContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar
  useEffect(() => {
    const showLoginPopup = localStorage.getItem('showLoginPopup');
    if (showLoginPopup === 'true' && !token) {
      setShowlogin(true); // Show login popup if localStorage says so and user is not logged in
    }
  }, [token, setShowlogin]);
  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    document.body.classList.toggle('sidebar-open'); // For handling body scroll when sidebar is open
  };

  // Logout function
  const handleLogout = () => {
    setToken(""); // Clear the token in context
    localStorage.removeItem("token"); // Remove the token from localStorage
  };

  return (
    <div className="navbar-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <i className="fa-solid fa-arrow-left"></i> : <i className="fa-solid fa-arrow-right"></i>}
        </button>
        <ul className="sidebar-nav">
          <li className="nav-item">
            <Link to={token ? "/":"#"} className="nav-link" 
            onClick={(e)=>{
                     if(!token){
                      e.preventDefault();
                      setShowlogin(true);
                      localStorage.setItem('showLoginPopup', 'true');
                     }
            }} >
              <i className="bi bi-house-door"></i> {/* Bootstrap icon */}
              {isSidebarOpen && <span className="link-text">Home</span>}
            </Link>
          </li>
          <li>
          </li>
          <li className="nav-item">
         
  <Link
    to={token ? "/dashboard" : "#"}
    className="nav-link"
    onClick={(e) => {
      if (!token) {
        e.preventDefault(); // Prevent navigation if there's no token
        setShowlogin(true); // Show login popup
        localStorage.setItem('showLoginPopup', 'true');
      }
    }}
  >
    <i className="bi bi-speedometer2"></i> {/* Bootstrap icon */}
    {isSidebarOpen && <span className="link-text">Dashboard</span>}
  </Link>
</li>

          <li className="nav-item">
            <Link to="/services" className="nav-link">
              <i className="bi bi-gear"></i> {/* Bootstrap icon */}
              {isSidebarOpen && <span className="link-text">Services</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link">
              <i className="bi bi-envelope"></i> {/* Bootstrap icon */}
              {isSidebarOpen && <span className="link-text">Contact</span>}
            </Link>
          </li>
        </ul>
      </div>

      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light">
        <a className="navbar-brand mx-auto" href="/home">
          Stock Management
        </a>
        <div className="ms-auto">
          <ul className="navbar-nav">
            {token ? (
              <li className="nav-item">
                <button className="btn ms-3" onClick={handleLogout}>
                <i className="fa-solid fa-circle-left icon-white"></i>
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <button className="btn signin ms-3" onClick={() => setShowlogin(true)}>
                  <i className="fa-solid fa-right-to-bracket icon-white"></i>
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // For styling

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isExpanded ? '<<' : '>>'}
      </button>
      <ul className="sidebar-nav">
        <li className="nav-item">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link to="/services" className="nav-link">Services</Link>
        </li>
        <li className="nav-item">
          <Link to="/contact" className="nav-link">Contact</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

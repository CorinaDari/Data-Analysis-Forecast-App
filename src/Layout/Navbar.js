import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="navbar-container">
      <button className="menu-icon" onClick={toggleMenu}>
        ☰
      </button>
      <nav className={`sidebar ${isOpen ? "open" : ""}`}>
        <ul>
          <li>
            <Link to="/">
              <span className="icon">🏠</span>
              <span className="label">Home</span>
            </Link>
          </li>
        
          <li>
            <Link to="/client-profile">
              <span className="icon">👤</span>
              <span className="label">Client Profile</span>
            </Link>
          </li>
          <li>
            <Link to="/sales-intervals">
              <span className="icon">📆</span>
              <span className="label">Sales Intervals</span>
            </Link>
          </li>
          <li>
            <Link to="/future-sales">
              <span className="icon">🔮</span>
              <span className="label">Future Sales</span>
            </Link>
          </li>
          <li>
            <Link to="/price-impact">
              <span className="icon">💰</span>
              <span className="label">Price Impact</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;

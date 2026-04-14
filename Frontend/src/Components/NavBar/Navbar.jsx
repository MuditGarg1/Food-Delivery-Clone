import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);
  const { getTotalCartAmount, token, setToken, role, setRole } = useContext(StoreContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("customer");
    navigate("/");
  };

  return (
    <div className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/"><img className="logo" src={assets.logo} alt="Logo" /></Link>
      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("Home")} className={menu === "Home" ? "active" : ""}>Home</Link>
        <a href='#footer' onClick={() => setMenu("Contact-Us")} className={menu === "Contact-Us" ? "active" : ""}>Contact Us</a>
      </ul>
      <div className="navbar-right">
        {role === 'customer' && !token && (
            <Link to="/owner" className="add-restaurant-link">Add Restaurant</Link>
        )}
        {role === 'customer' && token && (
            <Link to="/owner" className="add-restaurant-link">Partner with us</Link>
        )}
        {role === 'admin' && (
            <Link to="/admin" className="add-restaurant-link">Admin Panel</Link>
        )}
        {role === 'shop_owner' && (
            <Link to="/owner" className="add-restaurant-link">Shop Panel</Link>
        )}

        {!token ? (
          <button className="sign-in-btn" onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className='navbar-profile'>
            <img className="profile-icon" src={assets.profile_icon} alt="Profile" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><span>Orders</span></li>
              <li onClick={logout}><img src={assets.logout_icon} alt="" /><span>Logout</span></li>
            </ul>
          </div>
        )}
        <div className='navbar-search-icon'>
          <Link to='/cart'>
             <img src={assets.basket_icon} alt="Cart" className="cart-icon" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

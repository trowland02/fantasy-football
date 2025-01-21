import React, { useState, useEffect } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import "./navbar.css";
import { HiOutlineMenu } from 'react-icons/hi'
import { AiOutlineClose } from 'react-icons/ai'

const FormatComponent = () => {
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setFontSize(Math.max(Math.min(30 * width / 1000, 26), 14));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { fontSize };
};

export default function NavbarUser() {
  const { fontSize } = FormatComponent();
  const [showMenu, setShowMenu] = useState(false);
  const navLinks = [
    { title: "Home", path: "/users" },
    { title: "Players", path: "/users/players" },
    { title: "Socials", path: "/users/socials" },
    { title: "Games", path: "/users/games" },
    { title: "Rules", path: "/users/rules" },
    { title: "Password", path: "/users/change-password" }
  ]
  const handleShowMenu = () => setShowMenu(!showMenu);
  const closeShowMenu = () => setShowMenu(false);

  return (
    <div className="header">
      <Link to="/" className="exit" style={{ fontSize: fontSize }}>Logout</Link>
      <div className="menu-icon-container">
        {showMenu ? (
          <AiOutlineClose className="menu-icon" style={{ fontSize: 0.8 * fontSize }} onClick={closeShowMenu} />
        ) : (
          <HiOutlineMenu className="menu-icon" style={{ fontSize: 0.8 * fontSize }} onClick={handleShowMenu} />
        )}
      </div>
      <div className="nav-item-container">
        {navLinks?.map((item) => (
          <div className="nav-item" key={item.path} >
            <CustomLink to={item.path} style={{ fontSize: 0.8 * fontSize }} >{item.title}</CustomLink>
          </div>
        ))}
      </div>
      <div className={showMenu ? "side-menu active" : "side-menu"} 
      >
        {navLinks?.map((item) => (
          <div className="nav-item" key={item.path} 
          >
            <CustomLink to={item.path} style={{ fontSize: 0.8 * fontSize }} >{item.title}</CustomLink>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname });

  return (
    <Link to={to} {...props} className={isActive ? "nav-item active" : "nav-item"}>
      {children}
    </Link>
  );
}
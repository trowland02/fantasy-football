import React, { useState, useEffect } from "react";
import { Link, } from "react-router-dom";
import "./navbar.css";

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

export default function NavbarBack() {
  const { fontSize } = FormatComponent();

  return (
    <div className="header">
      <div className="exit">
        <Link to="/users/games" className="exit" style={{ fontSize: fontSize }}>Back</Link>
      </div>
    </div>
  )
}

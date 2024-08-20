import React from 'react';
import './LogoClick.css';
import logoImage from '../../../assets/logo.png';

const LogoClick = () => {
  return (
    <a href="/" className="logo-container">
      <img src={logoImage} alt="Logo" className="logo-image" />
    </a>
  );
};

export default LogoClick;

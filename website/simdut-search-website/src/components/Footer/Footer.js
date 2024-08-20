import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} Rafic Haddad. All rights reserved.</p>
        <p>
          <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <h1>Privacy Policy</h1>
      <p>This Privacy Policy outlines how we collect, use, and protect your personal information.</p>

      <div className="section">
        <h2>Information We Collect</h2>
        <ul>
          <li><strong>Personal Information:</strong> <br></br> When you sign up for an account, we collect your email address to manage your account and communicate with you, especially for password reset requests.</li> <br></br>
          <li><strong>Non-Personal Information:</strong> <br></br> We collect non-personal information such as your browser type, operating system, and the pages you visit on our site. This information is stored in browser storage for features like Dark Mode.</li>
        </ul>
      </div>

      <div className="section">
        <h2>How We Use Your Information</h2>
        <ul>
          <li><strong>To Provide and Improve Our Service:</strong> <br></br> We use your information to provide, maintain, and improve our Service.</li> <br></br>
          <li><strong>To Communicate with You:</strong> <br></br> We use your email address to send you information and updates related to your account, such as password reset instructions.</li> <br></br>
          <li><strong>To Ensure Security:</strong> <br></br> Passwords are encrypted to ensure they are stored securely.</li>
        </ul>
      </div>

      <div className="section">
        <h2>Sharing of Information</h2>
        <p>We do not share your personal information with third parties, except as necessary to comply with legal requirements, protect our rights, or as part of a merger, acquisition, or sale of our assets.</p>
      </div>

      <div className="section">
        <h2>Data Security</h2>
        <p>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee its absolute security.</p>
      </div>

      <div className="section">
        <h2>Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. You are advised to review this Privacy Policy periodically for any changes.</p>
      </div>

      <div className="section">
        <h2>Contact Us</h2>
        <p>If you have any questions about these Terms or the Privacy Policy, please contact us at <a href="mailto:rafic.george.haddad@gmail.com">rafic.george.haddad@gmail.com</a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

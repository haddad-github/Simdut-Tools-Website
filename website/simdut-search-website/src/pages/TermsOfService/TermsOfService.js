import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-of-service">
      <h1>Terms of Service</h1>
      <p>Welcome to Simdut Tools ("Service"). By using our Service, you agree to comply with and be bound by these Terms of Service ("Terms"). Please review the following terms carefully. If you do not agree to these terms, you should not use this site or service.</p>

      <div className="section">
        <h2>Use of the Service</h2>
        <ul>
          <li><strong>Account Security:</strong> <br></br> You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</li> <br></br>
          <li><strong>Prohibited Activities:</strong> <br></br> You agree not to use the Service for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction.</li>
        </ul>
      </div>

      <div className="section">
        <h2>User Content</h2>
        <ul>
          <li><strong>Ownership:</strong> <br></br> Users retain ownership of the content they submit to the Service. However, by submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, distribute, and display such content.</li> <br></br>
          <li><strong>Responsibility:</strong> <br></br> You are solely responsible for the content you submit.</li>
        </ul>
      </div>

      <div className="section">
        <h2>Modification of Terms</h2>
        <p>We reserve the right to modify these Terms at any time. You agree to review these Terms periodically to ensure you are aware of any modifications. Your continued use of the Service after any modifications indicates your acceptance of the modified Terms.</p>
      </div>

      <div className="section">
        <h2>Termination</h2>
        <p>We reserve the right to terminate your access to the Service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service.</p>
      </div>
    </div>
  );
};

export default TermsOfService;

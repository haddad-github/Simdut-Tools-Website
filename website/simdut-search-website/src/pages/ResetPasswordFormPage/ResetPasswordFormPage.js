import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPasswordFormPage.css';
import {useTranslation} from "react-i18next";

const ResetPasswordFormPage = () => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //New password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //Error
  const [error, setError] = useState('');

  //Success
  const [success, setSuccess] = useState('');

  //Get the token from the URL
  const { token } = useParams();

  //Hook to navigate link
  const navigate = useNavigate();

  //Hook to translate
  const { t } = useTranslation();

  //Submit new password
  const handleSubmit = async (e) => {
    //Prevent default page reload
    e.preventDefault();

    //Check if password and confirm password match
    if (newPassword !== confirmPassword) {
      setError(t('passwordNotMatch'));
      return;
    }

    //API call to reset password
    try {
      const response = await fetch('https://website-api.simduttools.com/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setError('');

        //Redirect to login after a delay
        setTimeout(() => navigate('/login'), 3000); // changed from history.push to navigate
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to reset password. Please try again later.');
    }
  };

  return (
    <div className="reset-password-page">
      <h2>Reset Password</h2>
      {/* If error, display error */}
      {error && <div className="error">{error}</div>}
      {/* If success, display success */}
      {success && <div className="success">{success}</div>}

      {/* Submit form */}
      <form onSubmit={handleSubmit}>
        {/*New password*/}
        <label>
          New Password: <br></br>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        {/* Confirm password */}
        <label>
          Confirm Password: <br></br>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordFormPage;

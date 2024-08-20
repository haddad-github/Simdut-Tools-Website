import React, {useEffect, useState} from 'react';
import './LoginButton.css';
import logo from '../../../assets/logo.png';
import eyeIcon from '../../../assets/visibility_pass.png';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from "react-google-recaptcha";

const LoginButton = ({ setIsLoggedIn, showLoginForm, setShowLoginForm }) => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Username & password & email
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailForReset, setEmailForReset] = useState('');

  //Captcha
  const [captchaToken, setCaptchaToken] = useState('');

  //Password visibility button
  const [passwordVisible, setPasswordVisible] = useState(false);

  //Logging in
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Reset password
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);

  //Notification
  const [notificationMessage, setNotificationMessage] = useState('');

  //Hook to translate language
  const {t} = useTranslation();

  //Upon clicking login
  const handleLoginClick = () => {
    setShowLoginForm(!showLoginForm);
  };

  //Upon clicking password visibility icon
  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setShowResetPasswordForm(false);
    setLoginError('');
  };

  //Async for logging in
  const handleLoginSubmit = async (event) => {
    //Prevent page refresh (default submission form behavior)
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    //Call API route to login, feed it username & password
    try {
      const response = await fetch('https://website-api.simduttools.com/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
      });

      //Catch response (userId & token)
      const data = await response.json();

      //Set userId and token in the local storage (for it to be used and validated for other components/pages)
      //isLoggedIn becomes true and close the login form
      if (response.ok) {
        localStorage.setItem('userId', JSON.stringify(data.userId));
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        setShowLoginForm(false);
      } else {
        setLoginError(data.message);
      }
    } catch (error) {
      setLoginError('Failed to connect to the server: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  //Upon clicking forgot password
  const handleForgotPasswordClick = () => {
    setShowResetPasswordForm(true);
  };

  //Async for password reset
  const handlePasswordResetRequest = async (event) => {
    //Prevent page refresh (default submission form behavior)
    event.preventDefault();

    //Captcha
    if (!captchaToken){
      setNotificationMessage('Please compete the reCAPTCHA.');
      return;
    }

    //Call API route to reset password, feed it the user's email
    try {
      const response = await fetch('https://website-api.simduttools.com/request_password_reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForReset, captcha_response: captchaToken}),
      });

      //Contains messageId and message
      const data = await response.json();

      //Show notification and close reset password form
      if (response.ok) {
        setNotificationMessage('Please check your email to reset your password.');
        setShowResetPasswordForm(false); // Hide the reset form
      } else {
        setNotificationMessage('Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Network or other error:', error);
      alert('An error occurred while trying to send the reset link.'); // Display a more generic error message
    }
  };

  const handleCaptchaResponse = (token) => {
    setCaptchaToken(token);
  };



  return (
      <>
        {/* Login button */}
        <button className="login-button" onClick={handleLoginClick}>
          {t('loginButton')}
        </button>

        {/* If showLoginForm is true, form to show */}
        {showLoginForm && (
            <div className="login-modal">
              <div className="overlay" onClick={() => setShowLoginForm(false)}></div>
              <div className="login-form">

                {notificationMessage && (
                    <div className="notification-message">{notificationMessage}</div>
                )}
                <img src={logo} alt="Logo" className="login-logo"/>
                <h2>{t('loginButton')}</h2>

                {/* If loginError is true */}
                {loginError && <div className="login-error">{loginError}</div>}
                <button className="close-btn" onClick={() => setShowLoginForm(false)}>×</button>
                <form onSubmit={handleLoginSubmit}>
                  <label>
                    {t('username')}:
                    <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                  </label>
                  <label className="password-label">
                    {t('password')}:
                    <div className="input-wrapper">
                      <input
                          type={passwordVisible ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                      <img
                          src={eyeIcon}
                          alt="Toggle Visibility"
                          className={`toggle-visibility ${passwordVisible ? "visible" : ""}`}
                          onClick={handleTogglePasswordVisibility}
                      />
                    </div>
                  </label>
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {t('loginButton')}
                  </button>
                </form>
                <div className="forgot-password-link" onClick={handleForgotPasswordClick}>
                  {t('forgotPassword')}
                </div>

                {/* Reset password form */}
                {showResetPasswordForm && (
                    <form onSubmit={handlePasswordResetRequest} className="reset-password-form">
                      <label>
                        {t('email')}:
                        <input
                            type="email"
                            value={emailForReset}
                            onChange={(e) => setEmailForReset(e.target.value)}
                            required
                        />
                      </label>
                      {/* CAPTCHA */}
                      <ReCAPTCHA
                          sitekey="6LeAkOYpAAAAAGNY4wnuTzD6lXO8yqz_bAb2oKl-"
                          onChange={handleCaptchaResponse}
                          />
                      <button type="submit" className="reset-password-submit-btn">
                        {t('sendResetInstructions')}
                      </button>
                    </form>
                )}
              </div>
            </div>
        )}
      </>
  );
}

export default LoginButton;

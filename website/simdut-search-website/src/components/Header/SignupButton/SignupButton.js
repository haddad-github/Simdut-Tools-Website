import React, { useState } from 'react';
import './SignupButton.css';
import logo from '../../../assets/logo.png';
import eyeIcon from '../../../assets/visibility_pass.png';
import { useTranslation } from 'react-i18next';

const SignupButton = ( {onSuccessfulRegistration} ) => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //displaying sign up form & function to update it (set to false by default)
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  //username state & function to update it
  const [username, setUsername] = useState('');

  //password state & function to update it
  const [password, setPassword] = useState('');

  //password confirmation state & function to update it
  const [confirmPassword, setConfirmPassword] = useState('');

  //password visibility & function to turn it on or off
  const [passwordVisible, setPasswordVisible] = useState(false);

  //submitting state & function to update it
  const [isSubmitting, setIsSubmitting] = useState(false);

  //registration failure & function to update it
  const [errorMessage, setErrorMessage] = useState('');

  //registration success & function to update it
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  //email & function to update it
  const [email, setEmail] = useState('');

  //Regex for basic email validation
  const emailRegex = /\S+@\S+\.\S+/;

  const {t} = useTranslation();

  //Clicking on sign up triggers the opposite state (if it's on, clicking closes it and vice versa)
  //Set the state of the error message and registration success to empty & false
  const handleSignUpClick = () => {
    setShowSignUpForm(!showSignUpForm);
    setErrorMessage('');
    setRegistrationSuccess(false);
  };

  //Clicking password visibility icon
  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  //Upon submitting the form
  const handleSignUpSubmit = async (event) => {
    //Prevent the browser from refreshing after submitting (which is the default behavior)
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Email validation check
    if (!emailRegex.test(email)) {
      setErrorMessage('Invalid email'); // Set error message if email does not match regex
      setIsSubmitting(false);
      return; // Stop the form submission
    }

    //Make sure password field matches confirm password
    if (password !== confirmPassword) {
      //setErrorMessage('Passwords do not match!');
      setErrorMessage(t('passwordNotMatch'))
      setIsSubmitting(false);
      return;
    }

    //Make the API call to register (POST request)
    try {
      const response = await fetch('https://website-api.simduttools.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });

      //If successful, close the form and prompt a message to indicate that it's successful
      if (response.ok) {

        //Success state
        setRegistrationSuccess(true);

        //Reset the form fields here
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');

      } else {
        //Error handling
        const errorData = await response.json();
        setErrorMessage(errorData.message);
      }
    } catch (error) {
      console.error('Error during registration: ', error);
      setErrorMessage('An error occurred during registration.');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {/*Sign Up button*/}
      <button className="sign-up-button" onClick={handleSignUpClick}>
        {t('signUp')}
      </button>

      {/* If showSignUpForm is true, render form */}
      {showSignUpForm && (
        <div className="signup-modal">
          <div className="overlay" onClick={handleSignUpClick}></div>
          <div className="sign-up-form">
            <img src={logo} alt="Logo" className="logo"/>
            <h2>{t('signUp')}</h2>

            {/* Successful registration */}
            {registrationSuccess ? (
              <div className="registration-success">
                {t('registrationSuccessful')}
                {/*<button onClick={onSuccessfulRegistration}>Sign In</button>*/}
                <button onClick={() => {
                  setShowSignUpForm(false); //Close the signup form
                  onSuccessfulRegistration(); //Open the login form
                }}>{t('loginButton')}</button>
              </div>
              ) : (
              <>
                {/* Close button */}
                <button className="close-btn" onClick={handleSignUpClick}>×</button>

                {/* Upon submitting form */}
                <form onSubmit={handleSignUpSubmit}>
                  {errorMessage && <div className="error-message">{errorMessage}</div>}

                  {/* Username */}
                  <label>
                    {t('username')}:
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder={t('uniqueUser')}
                    />
                  </label>

                  {/* Password */}
                  <label className="password-label">
                    {t('password')}:
                    <div className="input-wrapper">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={t('createPassword')}
                      />

                      {/* Eye icon visibility */}
                      <img
                        src={eyeIcon}
                        alt="Toggle Visibility"
                        className={`toggle-visibility ${passwordVisible ? "visible" : ""}`}
                        onClick={handleTogglePasswordVisibility}
                      />
                    </div>
                  </label>

                  {/* Confirm password */}
                  <label>
                    {t('confirmPassword')}:
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder={t('confirmPassword')}
                    />
                  </label>

                  {/* Email */}
                  <label>
                    {t('email')}:
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t('enterYourEmail')}
                      />
                  </label>

                  {/* Sign up submit button */}
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {t('signUp')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SignupButton;

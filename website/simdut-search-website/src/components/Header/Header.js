import React, {useState} from 'react';
import DarkModeButton from './DarkModeButton/DarkModeButton';
import LoginButton from './LoginButton/LoginButton';
import LogoClick from './LogoClick/LogoClick';
import NavBar from './NavBar/NavBar';
import './Header.css';
import SignupButton from "./SignupButton/SignupButton";
import Profile from "./Profile/Profile";
import TranslateButton from "./TranslateButton/TranslateButton";
import { useNavigate } from 'react-router-dom';

function Header({ isLoggedIn, setIsLoggedIn }) {
    //For URL navigation
    const navigate = useNavigate();

    //Sign in form
    const [showSignInForm, setShowSignInForm] = useState(false);

    //Successful registration
    const handleSuccessfulRegistration = () => {
      setShowSignInForm(true);
    };

    //Wipe logged in state and userID when logout
    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        navigate('/');
    }

  return (
    <header className="header">
      <TranslateButton/>
      <LogoClick />
      <NavBar />
      <div className="auth-darkmode">
        <div className="sign-in-container">
          {!isLoggedIn ? (
            <>
              <SignupButton onSuccessfulRegistration={handleSuccessfulRegistration} />
              <LoginButton
                  setIsLoggedIn={setIsLoggedIn}
                  showLoginForm={showSignInForm}
                  setShowLoginForm={setShowSignInForm} />
            </>
          ) : (
            <Profile setIsLoggedIn={setIsLoggedIn} />
          )}
        </div>
        <DarkModeButton />
      </div>
    </header>
  );
}

export default Header;

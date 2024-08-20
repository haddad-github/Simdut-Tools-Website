import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import profileLogo from '../../../assets/profile_logo.png';
import myProfileIcon from '../../../assets/my_profile_list_choice.png';
import myListIcon from '../../../assets/my_lists_list_choice.png';
import logoutIcon from '../../../assets/logout_list_choice.png';
import { useTranslation } from 'react-i18next';

const Profile = ({ setIsLoggedIn }) => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Dropdown state; shown or not
  const [showDropdown, setShowDropdown] = useState(false);

  //URL redirection
  const navigate = useNavigate();

  //Hook to translate language
  const {t} = useTranslation();

  //Navigates to the Profile Page
  const goToProfilePage = () => {
        navigate('/profilepage');
    };

  //Navigates to the All Lists Page
  const goToAllListsPage = () => {
        navigate('/alllistspage');
    };

  //Dropdown
  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  //Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    //TODO
    //Clear stored user data and tokens
  };

  return (
    <div className="profile-container">
      <button className="profile-button" onClick={handleToggleDropdown}>
        <img src={profileLogo} alt="Profile" className="profile-logo" />
        <span className="profile-text">{t('profile')}</span>
      </button>

      {/* If showDropdown is true, render 3 buttons that redirect to other routes */}
      {showDropdown && (
        <div className="dropdown-menu show">
          <ul>

            {/* Profile page */}
            <li onClick={goToProfilePage}>
              <img src={myProfileIcon} alt="" /> {t('myProfile')}
            </li>

            {/* All Lists page */}
            <li onClick={goToAllListsPage}>
              <img src={myListIcon} alt="" /> {t('myLists')}
            </li>

            {/* Logout button */}
            <li onClick={handleLogout}>
              <img src={logoutIcon} alt="" /> {t('logoutButton')}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Profile;

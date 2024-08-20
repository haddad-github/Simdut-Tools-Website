import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { useTranslation } from 'react-i18next';

function ProfilePage({ isLoggedIn }) {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [emailChangeMessage, setEmailChangeMessage] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [username, setUsername] = useState('');


  //Navigate URLs (redirect)
  const navigate = useNavigate();

  //Hook to translate language
  const {t} = useTranslation();

  //Simple email validation regex
  const emailRegex = /\S+@\S+\.\S+/;

  //Effect to fetch current user email, triggered by logged in status, navigation or current email states
  useEffect(() => {
    const fetchUserDetails = async () => {
      //Get user ID and token
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      //If no user ID, return him to the main page
      if (!userId) {
        navigate('/');
        return;
      }

      //Fetch user's details based on his user ID
      try {
        const response = await fetch(`https://website-api.simduttools.com/user/details/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        //Set the user's current email
        const userDetails = await response.json();
        console.log(userDetails);
        setCurrentEmail(userDetails.email);
        setUsername(userDetails.username);
      } catch (error) {
        console.error('Failed to fetch user details:', error.message);
      }
    };

    if (isLoggedIn) {
      fetchUserDetails();
    }
  }, [isLoggedIn, navigate, setCurrentEmail]);

  //Redirect to the homepage if not logged in
  if (!isLoggedIn) {
    navigate('/');
    return null;
  }

  //Password change
  const handlePasswordChange = async (e) => {
    //Prevent page reload
    e.preventDefault()
    //New password field and confirm new password field have to match
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeMessage('New passwords do not match');
      return;
    }

    //Get the user's ID
    const userId = localStorage.getItem('userId');

    //Construct the request body to change the password
    const requestBody = {
      user_id: userId,
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmNewPassword,
    };

    //API call to change password
    try {
      const response = await fetch('https://website-api.simduttools.com/user/change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordChangeMessage('Password changed successfully');
      } else {
        setPasswordChangeMessage(data.message);
      }
    } catch (error) {
      setPasswordChangeMessage('Failed to change password');
    }
  };

  //Change email
  const handleEmailChange = async (e) => {
    //Prevent page refresh
    e.preventDefault();

    //Email has to be in a standard format
    if (!emailRegex.test(email)) {
      setEmailChangeMessage('Please enter a valid email address');
      return;
    }

    //API call to update email
    try {
      const response = await fetch('https://website-api.simduttools.com/user/update_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: localStorage.getItem('userId'),
          new_email: email,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmailChangeMessage('Email updated successfully');
      } else {
        setEmailChangeMessage(data.message);
      }
    } catch (error) {
      setEmailChangeMessage('Failed to update email');
    }
  };

  return (
    <div className="profile-page">
      <h1>{username}</h1>
      {/* If passwordChangeMessage is true, display it */}
      {passwordChangeMessage && <p>{passwordChangeMessage}</p>}

      {/* Password change form */}
      <form className="form-profile" onSubmit={handlePasswordChange}>
        {/* Current password field */}
        <label>
          {t('currentPassword')}:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <br />

        {/* New password field */}
        <label>
          {t('newPassword')}:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <br />

        {/* Confirm new password field */}
        <label>
          {t('confirmNewPassword')}:
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </label>
        <br />

        {/* Change password button */}
        <button type="submit">{t('changePasswordButton')}</button>

      </form>

      {/* If emailChangeMessage is true, display message */}
      {emailChangeMessage && <p>{emailChangeMessage}</p>}
      {/* Email change form */}
      <form onSubmit={handleEmailChange}>
        <label>
          {t('currentEmail')}:
          <input
            type="email"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            disabled // Make this field read-only
          />
        </label>

        {/* New email field */}
        <label>
          {t('newEmail')}:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            title="Please enter a valid email address"
          />
        </label>
        <br />

        {/* Change email submit button */}
        <button type="submit">{t('changeEmail')}</button>
      </form>
    </div>
  );
}

export default ProfilePage;

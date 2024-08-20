import React, { useState, useEffect } from 'react';
import DarkModeToggle from "react-dark-mode-toggle";
import './DarkModeButton.css';
import { useTranslation } from 'react-i18next';

const DarkModeButton = () => {
  //Dark Mode state constant and function that updates the value of the constant
  //Defaults to false
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    return savedMode === 'true' ? true : false;
  });

  //Effect activates after rendering the component
  //Adds or remove the 'dark-mode' class to the <body> of the document
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    //Save dark mode state to localStorage
    localStorage.setItem('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="dark-mode-toggle">
      {/* Dark Mode button || toggle (onChange) || sync current mode (checked) || button size (size) */}
      <DarkModeToggle
        onChange={setIsDarkMode}
        checked={isDarkMode}
        size={80}
      />
    </div>
  );
};

export default DarkModeButton;
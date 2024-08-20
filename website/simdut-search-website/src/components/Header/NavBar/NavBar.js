import React from 'react';
import './NavBar.css';
import whmisLogo from '../../../assets/WHMIS_logo.svg';
import mailLogo from '../../../assets/mail_icon.png';
import githubLogo from '../../../assets/GitHub_Invertocat_Logo.svg.png';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  //Hook to translate language
  const {t} = useTranslation();

  return (
    <nav className="nav-bar">
      {/*SIMDUT Official Website*/}
      <a href="https://simdut.org/" target="_blank" rel="noopener noreferrer" className="nav-item">
        <img src={whmisLogo} alt="WHMIS" className="nav-logo"/>
          {t('officialSIMDUT')}
      </a>

      {/*Mail To*/}
      <a href="mailto:rafic.george.haddad@gmail.com" className="nav-item mail">
        <img src={mailLogo} alt="Mail" className="nav-logo"/>
          {t('contactUs')}
      </a>

      {/*Github Repo*/}
      <a href="https://github.com/haddad-github/SIMDUT-TOOLS" target="_blank" rel="noopener noreferrer" className="nav-item">
        <img src={githubLogo} alt="GitHub" className="nav-logo"/>
          {t('githubRepo')}
      </a>
    </nav>
  );
};

export default NavBar;

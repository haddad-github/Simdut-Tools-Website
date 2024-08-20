import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './TranslateButton.css';

//Import flag icons and the logo for the language change button
import flagEN from '../../../assets/flag-icons-main/1x1/gb.svg';
import flagFR from '../../../assets/flag-icons-main/1x1/fr.svg';
import flagES from '../../../assets/flag-icons-main/1x1/es.svg';
import flagPT from '../../../assets/flag-icons-main/1x1/pt.svg';
import flagDE from '../../../assets/flag-icons-main/1x1/de.svg';
import flagIT from '../../../assets/flag-icons-main/1x1/it.svg';
import flagGR from '../../../assets/flag-icons-main/1x1/gr.svg';
import flagRU from '../../../assets/flag-icons-main/1x1/ru.svg';
import flagJP from '../../../assets/flag-icons-main/1x1/jp.svg';
import flagCN from '../../../assets/flag-icons-main/1x1/cn.svg';
import flagAR from '../../../assets/flag-icons-main/1x1/sa.svg';

const TranslateButton = () => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  //Translation
  const { i18n } = useTranslation();

  //Language change
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setShowDropdown(false);
  };

  //Current flag, defaults to EN
  const getCurrentFlag = (language) => {
    const flags = {
      en: flagEN,
      fr: flagFR,
      es: flagES,
      pt: flagPT,
      de: flagDE,
      it: flagIT,
      gr: flagGR,
      ru: flagRU,
      jp: flagJP,
      cn: flagCN,
      ar: flagAR,
    };
    return flags[language] || flagEN;
  };

  //Handles language codes like 'en-US'
  const currentLangCode = i18n.language.split('-')[0];

  const currentFlag = getCurrentFlag(currentLangCode);

  return (
    <div className="translate-button-container">
      <button className="language-change-button" onClick={() => setShowDropdown(!showDropdown)}>
        <img src={currentFlag} alt="Current Language" className="flag-icon" />
      </button>

      {/* if showDropdown is true, render all languages */}
      {showDropdown && (
        <div className="translate-dropdown">
          <ul>
            <li onClick={() => changeLanguage('en')}>
              <img src={flagEN} alt="English" className="flag-icon" /> English
            </li>
            <li onClick={() => changeLanguage('fr')}>
              <img src={flagFR} alt="French" className="flag-icon" /> Français
            </li>
            <li onClick={() => changeLanguage('es')}>
              <img src={flagES} alt="Spanish" className="flag-icon" /> Español
            </li>
            <li onClick={() => changeLanguage('pt')}>
              <img src={flagPT} alt="Portuguese" className="flag-icon" /> Português
            </li>
            <li onClick={() => changeLanguage('de')}>
              <img src={flagDE} alt="German" className="flag-icon" /> Deutsch
            </li>
            <li onClick={() => changeLanguage('it')}>
              <img src={flagIT} alt="Italian" className="flag-icon" /> Italiano
            </li>
            <li onClick={() => changeLanguage('gr')}>
              <img src={flagGR} alt="Greek" className="flag-icon" /> Ελληνικά
            </li>
            <li onClick={() => changeLanguage('ru')}>
              <img src={flagRU} alt="Russian" className="flag-icon" /> Русский
            </li>
            <li onClick={() => changeLanguage('jp')}>
              <img src={flagJP} alt="Japanese" className="flag-icon" /> 日本語
            </li>
            <li onClick={() => changeLanguage('cn')}>
              <img src={flagCN} alt="Chinese" className="flag-icon" /> 中文
            </li>
            <li onClick={() => changeLanguage('ar')}>
              <img src={flagAR} alt="Arabic" className="flag-icon" /> عربي
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TranslateButton;

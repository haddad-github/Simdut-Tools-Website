import React, { useEffect, useState } from 'react';
import './MostSearched.css';
import {useTranslation} from "react-i18next";

const MostSearched = () => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Search Query count
  const [mostSearchedQuery, setMostSearchedQuery] = useState('');

  //Hook to translate language
  const {t} = useTranslation();

  //Effect activates after rendering the component
  //API call to /most_searched to get most searched product query
  useEffect(() => {
    const fetchMostSearched = async () => {
      try {
        const response = await fetch('https://website-api.simduttools.com/most_searched');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMostSearchedQuery(data.query);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };
    fetchMostSearched();
    //[] = empty array of dependency list, meaning the effect will run once and doesn't depend on anything to trigger it
  }, []);

  return (
    <div className="most-searched">
      <h2>{t('mostSearched')}</h2>
      <p>{mostSearchedQuery}</p>
    </div>
  );
};

export default MostSearched;

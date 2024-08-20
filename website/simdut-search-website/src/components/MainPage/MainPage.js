import React, {useState} from 'react';

import TrafficStats from './TrafficStats/TrafficStats';
import MostSearched from './MostSearched/MostSearched';
import SearchBar from './SearchBar/SearchBar';
import SearchFilters from './SearchFilters/SearchFilters';
import SavedLists from './SavedLists/SavedLists';
import './MainPage.css';

const MainPage = ({ isLoggedIn }) => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //User's list
  const [userLists, setUserLists] = useState([]);

  //Refresh user's list by fetching user ID and making an API call
  const refreshUserLists = async () => {
    const userId = localStorage.getItem("userId");
    if (isLoggedIn && userId) {
      try {
        const response = await fetch(`https://website-api.simduttools.com/user/${userId}/lists`);
        if (!response.ok) throw new Error('Failed to fetch lists');
        const data = await response.json();
        setUserLists(data);
      } catch (error) {
        console.error('Failed to refresh user lists:', error);
      }
    }
  };

  return (
    <div className="main-page">

      {/* Any components that should align left */}
      <div className="side-component">
        <TrafficStats />
      </div>

      {/* Any components to be center-aligned */}
      <div className="main-content">
        <MostSearched />
        <SearchBar isLoggedIn={isLoggedIn} userLists={userLists} refreshUserLists={refreshUserLists}/>
        <SearchFilters refreshUserLists={refreshUserLists}/>
      </div>

      {/* Pass isLoggedIn down to SavedLists */}
      <div className="saved-lists-container">
        <SavedLists isLoggedIn={isLoggedIn} userLists={userLists} setUserLists={setUserLists} refreshUserLists={refreshUserLists} />
      </div>
    </div>
  );
};

export default MainPage;

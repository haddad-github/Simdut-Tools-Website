import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ isLoggedIn, userId, refreshUserLists }) => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Term search
  const [searchTerm, setSearchTerm] = useState(''); //stores the current input by the user

  //Suggestion
  const [suggestions, setSuggestions] = useState([]); //holds autocomplete suggestion
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(true); //flag to control when to fetch suggestions

  //Search results
  const [searchResults, setSearchResults] = useState([]); //stores result from the search query

  //User lists (through the search bar)
  const [userLists, setUserLists] = useState([]); //stores user lists
  const [showAddToListIndex, setShowAddToListIndex] = useState(null);
  const [addedLists, setAddedLists] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false); //added to list confirmation
  const [selectedLists, setSelectedLists] = useState(new Set()); //track selected lists

  //Search error
  const [searchError, setSearchError] = useState('');

  //Hook to translate language
  const {t} = useTranslation();

  //Updates the selected lists when checkboxes are checked
  //Takes the list ID as a parameter
  const handleCheckboxChange = (listId) => {
    //Function to update the state of the selected lists
    //prevSelectedLists are those previously selected (clones for incremental update logic)
    setSelectedLists((prevSelectedLists) => {
      const updatedSelectedLists = new Set(prevSelectedLists);
      //Checks if the list exists in the set; if so, delete it (uncheck)..
      if (updatedSelectedLists.has(listId)) {
        updatedSelectedLists.delete(listId);
        //..else checks it
      } else {
        updatedSelectedLists.add(listId);
      }
      return updatedSelectedLists;
    });
  };

  const handleConfirmAdd = async (productCAS) => {
    //Names of lists to which the item was added
    let addedListsNames = [];
    //Send the product's CAS as the productId
    for (let listId of selectedLists) {
      const payload = { productId: productCAS };
      try {
        const response = await fetch(`https://website-api.simduttools.com/lists/${listId}/add_product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error('Failed to add product to list. Response: ' + response.statusText);
        } else {
          //Upon successful addition, find the list's name and add it to the list
          const listName = userLists.find(list => list.list_id === listId)?.name;
          if (listName) {
            addedListsNames.push(listName);
          }
        }
      } catch (error) {
        console.error('Failed to add product to list:', error);
      }
    }

    //Update the state with the names of the lists
    if (addedListsNames.length > 0) {
      setAddedLists(addedListsNames);
      setShowConfirmation(true); //show the confirmation popup
      //Hide the confirmation after 5 seconds (*note: 1 second = 1000ms)
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
    }

    //Reset list checks after successful addition and close dropdown
    setSelectedLists(new Set());
    setShowAddToListIndex(null);
  };

  //Debugging use: log when component mounts and when isLoggedIn or userId changes
  useEffect(() => {}, [isLoggedIn, userId]);

  //Dropdown for list selection
  const toggleDropdown = (productCAS) => {
    setShowAddToListIndex(showAddToListIndex === productCAS ? null : productCAS);
  };

  //Autocomplete effect that triggers after[during] searching a term
  useEffect(() => {
    //Has to be non-empty
    if (searchTerm.trim() === '' || !shouldFetchSuggestions) {
      setSuggestions([]);
      return;
    }
    //Async to API call for approximate search results based on the current string
    const fetchAutocompleteSuggestions = async () => {
      try {
        const response = await fetch(`https://api.simduttools.com//products/autocomplete?approx=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        } else {
          throw new Error('Autocomplete suggestions failed to load');
        }
        //If error, reset suggestions
      } catch (error) {
        console.error('Error fetching autocomplete suggestions: ', error);
        setSuggestions([]);
      }
    };

    //Set delay (prevents memory leaks and too many queries too fast)
    const debounceTimeout = setTimeout(fetchAutocompleteSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, shouldFetchSuggestions]);

  //Effect for keeping the state of the user list updated if logged in/out
  //Triggered by state of logged in, presence of user ID and user list refresh
  useEffect(() => {
    //Access the local storage and set the user's list
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userId = localStorage.getItem("userId");
    setUserLists(userLists);

    //Async to fetch user's list
    const fetchUserLists = async () => {
      //If not logged in or not user ID, return
      if (!isLoggedIn || !userId) return;
      //Else, API call to fetch user's list
      try {
        const response = await fetch(`https://website-api.simduttools.com/user/${userId}/lists`);
        if (!response.ok) {
          throw new Error('Failed to fetch user lists');
        }
        const data = await response.json();
        setUserLists(data); // Update the state with fetched data
      } catch (error) {
        console.error('Error fetching user lists:', error);
      }
    };
    fetchUserLists();
  }, [isLoggedIn, userId, refreshUserLists]);

  //When a change occurs in the input box (as user types)
  //Update search term state and suggestions
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShouldFetchSuggestions(true);
  };

  //When user clicks on an automcomplete suggestions
  const handleSuggestionClick = (nomfrancais) => {
    setSearchTerm(nomfrancais); //set search term to the value of the clicked suggestions
    setSuggestions([]); //clear the suggestion list
    setShouldFetchSuggestions(false); //prevents fetching suggestions now that the selection has been made
  };

  //Triggers when search is submitted
  const handleSearchSubmit = async (event) => {
    //Prevent page reloading
    event.preventDefault();

    //Prevent empty search
    if (!searchTerm.trim()) {
      setSearchError(t('searchCannotBeEmpty'));
      return;
    }

    //Empty suggestion list
    setSuggestions([]);

    //Query based on french name and then based on english name if that fails
    let queryUrl = `https://api.simduttools.com//products/search?nomfrancais=${encodeURIComponent(searchTerm)}`;
    try {
      //Try searching by nomfrancais
      let response = await fetch(queryUrl);
      if (!response.ok) throw new Error('Search by nomfrancais failed');
      let results = await response.json();

      //If no results for nomfrancais, try nomanglais
      if (results.length === 0) {
        queryUrl = `https://api.simduttools.com//products/search?nomanglais=${encodeURIComponent(searchTerm)}`;
        response = await fetch(queryUrl);
        if (!response.ok) throw new Error('Search by nomanglais failed');
        results = await response.json();
      }

      //Set the search results
      setSearchResults(results);

      //Record the search activity
      const recordSearchUrl = `https://website-api.simduttools.com/track_search`;
      const searchRecordBody = isLoggedIn && userId ? { search_query: searchTerm, user_id: userId } : { search_query: searchTerm };

      const searchRecordResponse = await fetch(recordSearchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRecordBody)
      });

      if (!searchRecordResponse.ok) {
        throw new Error('Failed to record search activity');
      }

      console.log(`Search activity recorded for query: ${searchTerm}`);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="search-bar-container">
      {/* Search bar */}
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder={t('searchForProduct')}
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="search-error">{t('searchButton')}</button>
      </form>
      {/* If showConfirmation is true (added to list prompt) add list names to the prompt */}
      {showConfirmation && (
        <div className="confirmation-popup">
          {t('addedToListPrompt')} {addedLists.join(', ')}
        </div>
      )}
      {searchError && <div className="search-error-message">{searchError}</div>}

      {/* If there's a suggestion, autocomplete dropdown */}
      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion.nomfrancais)}>
              {suggestion.nomfrancais} ({suggestion.nomanglais})
            </li>
          ))}
        </ul>
      )}

      {/* If there's a search result: format the table */}
      {searchResults.length > 0 && (
        <div className="search-results-container">
          <table className="search-bar-table">
            <thead>
              <tr>
                <th>{t('frenchName')}</th>
                <th>{t('englishName')}</th>
                <th>CAS</th>
                <th>No. UN</th>
                <th>{t('classifications')}</th>
                <th>{t('lastUpdated')}</th>
                <th>{t('addToList')}</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((product) => (
                <tr key={product.cas}>
                  <td>{product.nomfrancais}</td>
                  <td>{product.nomanglais}</td>
                  <td>{product.cas}</td>
                  <td>{product.noun}</td>
                  <td>{product.classification}</td>
                  <td>{new Date(product.date).toLocaleDateString()}</td>
                  <td>
                    {/* If isLoggedIn is true, add the "add-to-list" button */}
                    {isLoggedIn ? (
                      <>
                        <button
                          className="add-to-list-button"
                          onClick={() => toggleDropdown(product.cas)} //change to product.cas for unique identification
                        >
                          +
                        </button>
                        {/* Match against product.cas for dropdown display */}
                        {/* User lists displayed */}
                        {showAddToListIndex === product.cas && (
                          <div className="list-dropdown">
                            <ul>
                              {userLists.map((list) => (
                                <li key={list.list_id}>
                                  <label>
                                    {/* Checkboxes */}
                                    <input
                                      type="checkbox"
                                      checked={selectedLists.has(list.list_id)}
                                      onChange={() => handleCheckboxChange(list.list_id)}
                                    />
                                    {list.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                            {/* Confirm lists selection */}
                            <button
                              className="confirm-selection"
                              onClick={() => handleConfirmAdd(product.cas)} // Correctly pass the product's CAS
                            >
                              {t('confirmButton')}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <span>Login to add</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
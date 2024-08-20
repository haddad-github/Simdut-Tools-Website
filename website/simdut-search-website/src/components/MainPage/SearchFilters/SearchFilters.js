import React, { useState, useEffect } from 'react';
import './SearchFilters.css';
import { useTranslation } from 'react-i18next';

const SearchFilters = (refreshUserLists) => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Each input for the filters
  const [casNumber, setCasNumber] = useState('');
  const [unNumber, setUnNumber] = useState('');
  const [classification, setClassification] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  //Search results
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  //Load more
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  //User lists
  const [userLists, setUserLists] = useState([]);
  const [showAddToListIndex, setShowAddToListIndex] = useState(null);
  const [selectedLists, setSelectedLists] = useState(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedLists, setAddedLists] = useState([]);

  //Logged in and user ID
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userId = localStorage.getItem("userId");

  //Hook to translate language
  const {t} = useTranslation();

  //Fetch user lists effect triggered by logged in state, presence of user ID and user list refresh
  useEffect(() => {
    const fetchUserLists = async () => {
      if (!isLoggedIn || !userId) return;

      try {
        const response = await fetch(`https://website-api.simduttools.com/user/${userId}/lists`);
        if (!response.ok) {
          throw new Error('Failed to fetch user lists');
        }
        const data = await response.json();
        setUserLists(data);
      } catch (error) {
        console.error('Error fetching user lists:', error);
      }
    };
    fetchUserLists();
  }, [isLoggedIn, userId, refreshUserLists]);

  //Updates the selected lists when checkboxes are checked
  //Takes the list ID as a parameter
  const handleCheckboxChange = (listId) => {
      setSelectedLists(prevSelectedLists => {
          //Create new set from the previous state (clone)
          const updatedSelectedLists = new Set(prevSelectedLists);

          //Check if the list is already selected
          if (updatedSelectedLists.has(listId)) {
              //If it's already selected, remove it from the set
              updatedSelectedLists.delete(listId);
          } else {
              //If the list is not selected, add it to the set
              updatedSelectedLists.add(listId);
          }
          //Update list set state
          return updatedSelectedLists;
      });
  };


  const handleConfirmAdd = async (productCAS) => {
    //Names of lists to which the item was added
    let addedListsNames = [];
    //Send the product's CAS as the productId
    for (let listId of selectedLists) {
      try {
        const response = await fetch(`https://website-api.simduttools.com/lists/${listId}/add_product`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({productId: productCAS}),
        });
        if (!response.ok) {
          throw new Error('Failed to add product to list');
        } else {
          //Upon successful addition, find the list's name and add it to the list
          const listName = userLists.find(list => list.list_id === listId)?.name;
          if (listName) {
            addedListsNames.push(listName);
          }
        }
      } catch (error) {
        console.error('Error adding product to list:', error);
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

  //Dropdown for list selection
  const toggleDropdown = (productCAS) => {
    setShowAddToListIndex(showAddToListIndex === productCAS ? null : productCAS);
  };

  //Async for search
  const handleSearch = async (newSearch = false) => {
    //If new search; reset pagination | set loading display | reset search error
    if (newSearch) setPage(0);
    setIsLoading(true);
    setSearchError('');

    //Validate that at least one search filter is not
    if (!casNumber && !unNumber && !classification && !startDate && !endDate) {
      setSearchError(t('atLeastOneFilter'));
      setIsLoading(false);
      return;
    }

    //Search parameters for API call and pagination
    try {
      const response = await fetch(`https://api.simduttools.com//products/search?${new URLSearchParams({
        casNumber, unNumber, classification, startDate, endDate, limit: 5, offset: page * 5,
      })}`);
      const data = await response.json();

      //If new search
      if (newSearch) {
        //Set results
        setSearchResults(data);
        //If not new search (new pagination only), append previous results to keep them present
      } else {
        setSearchResults(prev => [...prev, ...data]);
      }
      //Increment the page count for pagination
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      setSearchError('Failed to perform search.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="search-filters">
        <div className="search-filters-heading">
            <h2>{t('groupsSearchFilters')}</h2>
        </div>
        {/* Filters */}
        <div className="filter-row">
          <div className="filter-group">
            {/* CAS number */}
            <label htmlFor="casNumber">CAS</label>
            <input id="casNumber" type="text" value={casNumber} onChange={(e) => setCasNumber(e.target.value)}
                   placeholder="e.g., 83-32-9"/>
          </div>
          {/* NoUN */}
          <div className="filter-group">
            <label htmlFor="unNumber">NoUN</label>
            <input id="unNumber" type="text" value={unNumber} onChange={(e) => setUnNumber(e.target.value)}
                   placeholder="e.g., UN1369"/>
          </div>
          {/* Clasifications */}
          <div className="filter-group">
          <label htmlFor="classification">
            {t('classifications')} <span style={{fontSize: '0.8em', color: '#999'}}> *Note: [OR = ","] [AND = ";"]</span>
          </label>
            <input id="classification" type="text" value={classification}
                   onChange={(e) => setClassification(e.target.value)} placeholder="e.g., DS.1c.3,DS.1o.4"/>
          </div>
          {/* Start Date and End Date */}
          <div className="filter-group date-range">
            <label htmlFor="startDate">{t('startDate')}</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
            <label htmlFor="endDate">{t('endDate')}</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
          </div>
        </div>
        {/* Search Button */}
        <button className="search-button" onClick={() => handleSearch(true)} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        {/* If searchError is true, display error */}
        {searchError && <div style={{color: 'red'}}>{searchError}</div>}
        {/* If showConfirmation is true, pop up products added to list */}
        {showConfirmation && (
          <div className="confirmation-popup">
            {t('addedToListPrompt')} {addedLists.join(', ')}
          </div>
        )}

        {/* If there's a search result: format the table */}
        {searchResults.length > 0 && (
            <div className="table-container">
              <table>
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
                {searchResults.map((result, index) => (
                    <tr key={index}>
                      <td>{result.nomfrancais}</td>
                      <td>{result.nomanglais}</td>
                      <td>{result.cas}</td>
                      <td>{result.noun}</td>
                      <td>{result.classification}</td>
                      <td>{new Date(result.date).toLocaleDateString()}</td>
                      <td>
                        {isLoggedIn ? (
                            <>
                              <button
                                  className="add-to-list-button"
                                  onClick={() => toggleDropdown(result.cas)}
                              >
                                +
                              </button>
                              {/* Match against product.cas for dropdown display */}
                              {/* User lists displayed */}
                              {showAddToListIndex === result.cas && (
                                  <div className="list-dropdown">
                                    <ul>
                                      {userLists.map((list) => (
                                          <li key={list.list_id}>
                                            <label>
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
                                        onClick={() => handleConfirmAdd(result.cas)}
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
              {/* If there's a search result with greater than 5 products returned */}
              {searchResults.length > page * 5 && (
                  <button onClick={() => handleSearch(false)} className="see-more-button" disabled={isLoading}>
                    See More
                  </button>
              )}
            </div>
        )}
        {isLoading && <div className="loading">Loading...</div>}
      </div>
  );
}

export default SearchFilters;

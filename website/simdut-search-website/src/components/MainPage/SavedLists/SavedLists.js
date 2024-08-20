import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SavedLists.css';
import { useTranslation } from 'react-i18next';

const SavedLists = ({ isLoggedIn, refreshUserLists }) => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Lists and list creation
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [createListError, setCreateListError] = useState("");

  //Hook to translate language
  const {t} = useTranslation();

  //Async fetch user's saved lists
  const fetchUserLists = async () => {
    //Get user's ID through the local storage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return;
    }

    //API call to fetch user's list
    try {
      const response = await fetch(`https://website-api.simduttools.com/user/${userId}/lists`);
      const data = await response.json();
      if (response.ok) {
        setLists(data)
      } else {
        console.error("Failed to fetch lists:", data.message);
      }
    } catch (error) {
      console.error("Failed to connect to the server:", error);
    }
  };

  //Set the list, triggers when isLogged value is changed
  //User can only see lists when he's logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserLists();
    }
  }, [isLoggedIn]);

  //Async create list
  const handleCreateList = async () => {
    //List name cannot be empty
    if (!newListName.trim()) {
      setCreateListError(t('listNameCannotBeEmpty'));
      return;
    }

    //Double-check if user is logged
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setCreateListError("User ID is missing. Please log in again.");
      return;
    }

    //API call to create list with list name and user's ID
    try {
      const response = await fetch('https://website-api.simduttools.com/create_list', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: newListName, user_id: userId}),
      });
      const data = await response.json();
      if (response.ok) {
        setLists([...lists, {id: data.id, name: newListName}]); //update to include list ID
        setNewListName(""); //clear input field after successful creation
        setCreateListError(""); //clear any previous errors
        refreshUserLists();
        fetchUserLists(); //r-fetch the user lists after creating a new list, fixes issue with list's URL
      } else {
        setCreateListError(data.message);
      }
    } catch (error) {
      setCreateListError("Failed to connect to the server.");
    }
  };

  return (
    <div className="saved-lists">
      <h2>{t('savedLists')}</h2>
      {/* List user's lists but by their display name rather than ID */}
      {isLoggedIn ? (
        <>
          <ul>
            {lists.length > 0 ? (
                lists.map((list) => (
                    <li key={list.list_id}>
                        <Link to={`/mylists/${list.list_id}`}>
                            {list.name}
                        </Link>
                    </li>
                ))
                //Else display that no list is saved
            ) : (
                <p>No saved lists.</p>
            )}
          </ul>

          {/* If createListError is true, display the error*/}
          {createListError &&
              <div className="error">{createListError}</div>}

          {/* Input box where to enter list name */}
          <input
            className="new-list-input"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder={t('enterNewList')}
          />
          <button className="create-list-button" onClick={handleCreateList}>
            + {t('createNewListButton')}
          </button>
        </>
          //Else display to log in to create a list
      ) : (
        <p>{t('logInToCreate')}</p>
      )}
    </div>
  );
};

export default SavedLists;

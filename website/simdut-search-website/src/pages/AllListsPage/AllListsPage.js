import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllListsPage.css';
import { useTranslation } from 'react-i18next';

const AllListsPage = ({ isLoggedIn }) => {
    //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
    //User's list
    const [userLists, setUserLists] = useState([]);

    //Navigate URLs (redirect)
    const navigate = useNavigate();

    //Hook to translate language
    const {t} = useTranslation();

    //Effect to fetch user lists, triggered by being logged in or navigating to this page's URL
    useEffect(() => {
        //Async to fetch the user's list
        const fetchUserLists = async () => {
            const userId = localStorage.getItem("userId");
            //If no user ID or not logged in, set empty list
            if (!userId || !isLoggedIn) {
                setUserLists([]);
                return;
            }

            //API call to fetch user's lists
            try {
                const response = await fetch(`https://website-api.simduttools.com/user/${userId}/lists`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch lists');
                const lists = await response.json();
                setUserLists(lists);
            } catch (error) {
                console.error('Failed to fetch user lists:', error);
            }
        }

        fetchUserLists();
    }, [isLoggedIn, navigate]);

    //When user clicks on a specific list in the list
    const handleListClick = (listId) => {
        navigate(`/mylists/${listId}`);
    };

    //Deleting a single list in a list
    const handleDeleteList = async (listId, event) => {
        //Prevents deleting before the prompt is accepted
        event.stopPropagation();

        const isConfirmed = window.confirm('Are you sure you want to delete this list?');
        if (!isConfirmed) return;

        try {
            const response = await fetch(`https://website-api.simduttools.com/lists/${listId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to delete the list');

            //Refresh the lists to reflect the deletion
            const updatedLists = userLists.filter(list => list.list_id !== listId);
            setUserLists(updatedLists);
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    return (
        <div className="lists-container">
            {/* If logged, load lists */}
            {isLoggedIn ? (
                <>
                    <h2>{t('myLists')}</h2>
                    <ul>
                        {userLists.map(list => (
                            <li key={list.list_id} className="list-item">
                                <div className="list-item-content" onClick={() => handleListClick(list.list_id)}>
                                    {list.name}
                                </div>
                                {/* Delete button */}
                                <button className="delete-btn" onClick={(e) => handleDeleteList(list.list_id, e)}>
                                    {t('delete')}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
                //else (not logged in), display message to have saved lists saved
            ) : (
                <h2>Log in to see your saved lists.</h2>
            )}
        </div>
    );
};

export default AllListsPage;

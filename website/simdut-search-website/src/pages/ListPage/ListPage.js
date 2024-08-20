import React, { useState, useEffect } from 'react';
import './ListPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//Format date function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
};


const ListPage = () => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //List details (products)
  const [listDetails, setListDetails] = useState({name: '', products: []});

  //Loading state
  const [isLoading, setIsLoading] = useState(true);

  //User ID
  const userId = localStorage.getItem("userId");

  //Retrieve the list ID from the URL parameters
  const {listId} = useParams();

  //Hook to navigate URL
  const navigate = useNavigate();

  //Hook for translating languages
  const {t} = useTranslation();

  //Trigger file download
  const downloadFile = async (format) => {
    try {
      const response = await fetch(`https://website-api.simduttools.com/lists/${listId}/items?format=${format}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': format === 'pdf' ? 'application/pdf' : 'text/csv',
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      //Convert object to blob and create a blob URL for it to be downloaded
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      //Use list's name in the download
      let filename = listDetails.name || 'list';
      filename = filename.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
      const extension = format === 'pdf' ? 'pdf' : (format === 'csv' ? 'csv' : 'xlsx');
      link.download = `${filename}.${extension}`;

      //Add link to the document body and click to trigger the download, then remove the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  //Delete list
  const handleDeleteList = async () => {
    //Prompt to confirm
    const isConfirmed = window.confirm('Are you sure you want to delete this list?');
    if (!isConfirmed) return;

    //API call to delete
    try {
      const response = await fetch(`https://website-api.simduttools.com/lists/${listId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete the list');

      //Navigate back to the all lists page
      navigate('/alllists');
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  //Remove a product (fed the product's CAS (unique identifier))
  const handleRemoveProduct = async (productCAS) => {
    //Prompt for confirmation
    if (window.confirm('Are you sure you want to remove this product from the list?')) {
      //API call to delete the product
      try {
        const response = await fetch(`https://website-api.simduttools.com/lists/${listId}/remove_product/${productCAS}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          //Update the state by removing the product using the correct CAS number
          setListDetails(prevState => ({
            ...prevState,
            products: prevState.products.filter(product => product.product_details.cas !== productCAS)
          }));
        } else {
          throw new Error('Failed to remove the product from the list');
        }
      } catch (error) {
        console.error('Error removing product:', error);
      }
    }
  };

  //Effect to set the list details (products and name), triggered by the presence of a list ID and a user ID
  useEffect(() => {
    const fetchListDetails = async () => {
      setIsLoading(true);
      try {
        //Fetch the list name from the user's lists
        const listsResponse = await fetch(`https://website-api.simduttools.com/user/${userId}/lists`);
        if (!listsResponse.ok) throw new Error('Lists could not be fetched');
        const lists = await listsResponse.json();
        const currentList = lists.find(list => list.list_id.toString() === listId);
        if (!currentList) throw new Error('List not found');

        //Fetch list items along with their details
        const itemsResponse = await fetch(`https://website-api.simduttools.com/lists/${listId}/items`);
        if (!itemsResponse.ok) throw new Error('List items could not be fetched');
        const itemsWithDetails = await itemsResponse.json();

        //Format the date for each product and update the state with the new details
        const formattedProducts = itemsWithDetails.map((product) => ({
          ...product,
          date: formatDate(product.date),
        }));

        //Set the list details
        setListDetails({ name: currentList.name, products: formattedProducts });
      } catch (error) {
        console.error('Error fetching list details:', error);
        setListDetails({ name: '', products: [] });
      }
      setIsLoading(false);
    };

    if (userId) {
      fetchListDetails();
    }
  }, [listId, userId]);

  return (
      <div className="list-page">
        <div className="list-header">
          {/* List name */}
          <h1>{isLoading ? 'Loading...' : `${t('listName')} ${listDetails.name}`}</h1>
        </div>
          {!isLoading && (
              //Delete button
              <button className="delete-list-button" onClick={handleDeleteList}>{t('deleteList')}</button>
          )}

        {/* Download buttons */}
        <div className="download-buttons">

          {/* as PDF */}
          <button onClick={() => downloadFile('pdf')}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1667px-PDF_file_icon.svg.png" alt="PDF" style={{ height: '20px', marginRight: '8px' }} />
            {t('downloadPDF')}
          </button>

          {/* as CSV */}
          <button onClick={() => downloadFile('csv')}>
            <img src="https://cdn-icons-png.flaticon.com/512/8242/8242984.png" alt="CSV" style={{ height: '20px', marginRight: '8px' }} />
            {t('downloadCSV')}
          </button>

          {/* as Excel */}
          <button onClick={() => downloadFile('xlsx')}>
            <img src="https://cdn.pixabay.com/photo/2023/06/01/12/02/excel-logo-8033473_960_720.png" alt="Excel" style={{ height: '20px', marginRight: '8px' }} />
            {t('downloadExcel')}
          </button>

        {/* If isLoading is false and there's at least one product i nthe least, display the table */}
        </div>
        {!isLoading && (
            listDetails.products.length > 0 ? (
                <table>
                  <thead>
                  <tr>
                    <th>{t('frenchName')}</th>
                    <th>{t('englishName')}</th>
                    <th>CAS</th>
                    <th>No. UN</th>
                    <th>{t('classifications')}</th>
                    <th>{t('lastUpdated')}</th>
                    <th>{t('delete')}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {listDetails.products.map((product, index) => (
                      <tr key={index}>
                        <td>{product.product_details.nomfrancais}</td>
                        <td>{product.product_details.nomanglais}</td>
                        <td>{product.product_details.cas}</td>
                        <td>{product.product_details.noun}</td>
                        <td>{product.product_details.classification}</td>
                        <td>{formatDate(product.product_details.date)}</td>
                        {/* Button to delete button */}
                        <td>
                          <button className="remove-product" onClick={() => handleRemoveProduct(product.product_details.cas)}>{t('delete')}</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
                //else the list has no products
            ) : (
                <p>This list has no products.</p>
            )
        )}
      </div>
  );
}

export default ListPage;

import React, { useState, useEffect } from 'react';
import './TrafficStats.css';
import totalUsersIcon from '../../../assets/users_total.png';
import searchesIcon from '../../../assets/product_searches.png';
import listsCreatedIcon from '../../../assets/lists.png';
import { useTranslation } from 'react-i18next';

const TrafficStats = () => {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Initialize the count for each at 0
  const [stats, setStats] = useState({
    totalUsers: 0,
    searches: 0,
    listsCreated: 0
  });

  //Hook to translate language
  const {t} = useTranslation();

  //Effect to update stats, currently is not triggered by anything other than a refresh of the page
  useEffect(() => {
    //Async fetch stats with API calls
    const fetchStats = async () => {
      try {
        const responses = await Promise.all([
          fetch('https://website-api.simduttools.com/total_users'),
          fetch('https://website-api.simduttools.com/total_products_searched', {headers: {'Cache-Control': 'no-cache'}}),
          fetch('https://website-api.simduttools.com/total_lists_created')
        ]);

        const data = await Promise.all(responses.map(res => res.json()));

        //Set stats
        setStats({
          totalUsers: data[0].total_users,
          searches: data[1].total_products_searched,
          listsCreated: data[2].total_lists_created
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="traffic-stats">
      {/* Total users */}
      <div className="stat-item">
        <img src={totalUsersIcon} alt="Total users" className="stat-icon" />
        <span>{stats.totalUsers} {t('totalUsers')}</span>
      </div>

      {/* Products searched */}
      <div className="stat-item">
        <img src={searchesIcon} alt="Products searched" className="stat-icon" />
        <span>{stats.searches} {t('productsSearched')}</span>
      </div>

      {/* Lists created */}
      <div className="stat-item">
        <img src={listsCreatedIcon} alt="Lists created" className="stat-icon" />
        <span>{stats.listsCreated} {t('listsCreated')}</span>
      </div>
    </div>
  );
};

export default TrafficStats;

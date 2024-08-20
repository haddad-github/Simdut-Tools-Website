import React, { useState } from 'react';
import Header from './components/Header/Header';
import MainPage from './components/MainPage/MainPage';
import Footer from './components/Footer/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AllListsPage from "./pages/AllListsPage/AllListsPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ListPage from "./pages/ListPage/ListPage";
import ResetPasswordFormPage from "./pages/ResetPasswordFormPage/ResetPasswordFormPage";
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService/TermsOfService';

function App() {
  //Format: const [constant, fonctionThatUpdatesConstantValue] = useState(defaultValue)
  //Logged in state
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  //Set logged in site-wide
  const handleSetIsLoggedIn = (loggedIn) => {
    localStorage.setItem('isLoggedIn', loggedIn.toString());
    setIsLoggedIn(loggedIn);
  };

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={handleSetIsLoggedIn} />
        <Routes>
          {/* Routes */}
          <Route path="/" element={<MainPage isLoggedIn={isLoggedIn} />} />
          <Route path="/alllistspage" element={<AllListsPage isLoggedIn={isLoggedIn}/>} />
          <Route path="/profilepage" element={<ProfilePage isLoggedIn={isLoggedIn} />} />
          <Route path="/mylists/:listId" element={<ListPage />} />
          <Route path="/reset_password/:token" element={<ResetPasswordFormPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

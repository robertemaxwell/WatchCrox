import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
import TransactionsPage from './pages/TransactionsPage';
import MyListingsPage from './pages/MyListingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/new" element={<CreateListingPage />} />
            <Route path="/listings/:id" element={<ListingDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            {/* Add more routes for other pages later */}
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;

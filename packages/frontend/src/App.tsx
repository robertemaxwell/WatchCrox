import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import CreateListingPage from './pages/CreateListingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/new" element={<CreateListingPage />} />
            {/* Add more routes for other pages later */}
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;

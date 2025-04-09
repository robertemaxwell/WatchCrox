import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, login, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-xl font-bold">
            WatchCrox
          </Link>
        </div>

        <div className="flex space-x-4 items-center">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/listings" className="hover:text-gray-300">
            Explore
          </Link>
          
          {user ? (
            <>
              <Link to="/listings/new" className="hover:text-gray-300">
                Sell a Watch
              </Link>
              <div className="relative group">
                <button className="hover:text-gray-300 flex items-center">
                  {user.username || 'Account'}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 w-48 mt-2 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block z-10">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link to="/my-listings" className="block px-4 py-2 hover:bg-gray-100">
                    My Listings
                  </Link>
                  <Link to="/transactions" className="block px-4 py-2 hover:bg-gray-100">
                    Transactions
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={login}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
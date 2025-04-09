import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WatchCrox</h3>
            <p className="text-gray-300">
              The secure marketplace for luxury watches, powered by blockchain escrow.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className="text-gray-300 hover:text-white">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/listings/new" className="text-gray-300 hover:text-white">
                  Sell a Watch
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/watchcrox" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/watchcrox" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  Twitter
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} WatchCrox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
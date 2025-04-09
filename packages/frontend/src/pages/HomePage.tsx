import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-800 text-white py-16 rounded-lg mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Buy and Sell Luxury Watches with Confidence
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            WatchCrox is the first peer-to-peer marketplace that uses blockchain escrow to 
            ensure secure transactions for luxury timepieces.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/listings" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition"
            >
              Explore Watches
            </Link>
            <Link 
              to="/listings/new" 
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition"
            >
              Sell a Watch
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Connect Your Wallet</h3>
              <p className="text-gray-600">
                Use MetaMask to login securely. Your wallet is your identity on our platform.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Buy or Sell</h3>
              <p className="text-gray-600">
                Browse listings or create your own. Funds are safely held in our smart contract escrow.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Securely Exchange</h3>
              <p className="text-gray-600">
                Seller ships the watch, buyer confirms receipt, and the escrow releases payment automatically.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Watches Section */}
      <section className="py-12 bg-gray-100 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Watches</h2>
            <Link to="/listings" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would be populated with actual listings */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Rolex Submariner</h3>
                <p className="text-gray-600 mb-4">Mint condition, box and papers included</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">$12,000</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">ETH</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Omega Speedmaster</h3>
                <p className="text-gray-600 mb-4">Professional "Moonwatch", excellent condition</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">$5,000</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">USDC</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Patek Philippe Nautilus</h3>
                <p className="text-gray-600 mb-4">Ref. 5711, blue dial, unworn</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">$110,000</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">ETH</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Grand Seiko Snowflake</h3>
                <p className="text-gray-600 mb-4">SBGA211, Spring Drive movement</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">$4,800</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">USDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  id: string;
  title: string;
  price: string;
  image: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
}

const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        // In a real app, this would fetch from your backend
        // For now using mock data based on the authenticated user
        if (user) {
          // Simulate API call delay
          setTimeout(() => {
            setListings([
              {
                id: '101',
                title: 'Vintage Omega Seamaster',
                price: '1.2 ETH',
                image: 'https://placehold.co/200x150?text=Omega',
                status: 'active',
                createdAt: '2023-04-15'
              },
              {
                id: '102',
                title: 'Rolex Submariner 2019',
                price: '3.5 ETH',
                image: 'https://placehold.co/200x150?text=Rolex',
                status: 'active',
                createdAt: '2023-04-10'
              },
              {
                id: '103',
                title: 'Vintage Seiko Chronograph',
                price: '0.7 ETH',
                image: 'https://placehold.co/200x150?text=Seiko',
                status: 'sold',
                createdAt: '2023-03-25'
              }
            ]);
            setLoading(false);
          }, 500);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          <p className="font-bold">Not Authenticated</p>
          <p>Please log in to view your listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link 
          to="/listings/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create New Listing
        </Link>
      </div>
      
      {listings.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600 text-center">You don't have any listings yet.</p>
          <div className="mt-4 text-center">
            <Link 
              to="/listings/new" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Create Your First Listing
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img 
                  src={listing.image} 
                  alt={listing.title} 
                  className="w-full h-48 object-cover"
                />
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(listing.status)}`}>
                  {listing.status.toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                <p className="text-gray-600 mb-2">Listed on: {listing.createdAt}</p>
                <p className="text-lg font-bold text-blue-600">{listing.price}</p>
                <div className="mt-4 flex justify-between">
                  <Link 
                    to={`/listings/${listing.id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                  {listing.status === 'active' && (
                    <button className="text-red-600 hover:underline">
                      Remove Listing
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListingsPage; 
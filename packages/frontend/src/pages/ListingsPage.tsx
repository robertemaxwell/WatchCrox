import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingAPI } from '../services/api';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: string;
  brand: string;
  model: string;
  currency: string;
  seller: {
    id: number;
    username: string;
    ethereum_address: string;
  };
  listing_images: Array<{
    id: number;
    ipfs_uri: string;
  }>;
}

const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    brand: '',
    condition: '',
    currency: '',
    minPrice: '',
    maxPrice: ''
  });
  
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await listingAPI.getListings();
        setListings(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch listings');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, []);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const filteredListings = listings.filter(listing => {
    return (
      (filters.brand === '' || listing.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
      (filters.condition === '' || listing.condition === filters.condition) &&
      (filters.currency === '' || listing.currency === filters.currency) &&
      (filters.minPrice === '' || listing.price >= parseFloat(filters.minPrice)) &&
      (filters.maxPrice === '' || listing.price <= parseFloat(filters.maxPrice))
    );
  });
  
  const getImagePlaceholder = () => {
    return '/logo192.png';
  };
  
  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'New';
      case 'LikeNew':
        return 'Like New';
      case 'Used':
        return 'Used';
      case 'Fair':
        return 'Fair';
      case 'Poor':
        return 'Poor';
      default:
        return condition;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-700">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Luxury Watches</h1>
        <Link 
          to="/listings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Listing
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Search brands"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="LikeNew">Like New</option>
              <option value="Used">Used</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              name="currency"
              value={filters.currency}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Currencies</option>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Min price"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Max price"
            />
          </div>
        </div>
      </div>
      
      {/* Listings */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No watches found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <Link key={listing.id} to={`/listings/${listing.id}`}>
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                <div className="h-48 bg-gray-200 relative">
                  {listing.listing_images && listing.listing_images.length > 0 ? (
                    <img 
                      src={listing.listing_images[0].ipfs_uri.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getImagePlaceholder();
                      }}
                    />
                  ) : (
                    <img 
                      src={getImagePlaceholder()} 
                      alt="Not available"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm shadow">
                    {getConditionLabel(listing.condition)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{listing.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${listing.currency === 'ETH' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {listing.currency}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{listing.brand} {listing.model}</p>
                  <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{listing.price} {listing.currency}</span>
                    <span className="text-sm text-gray-500">
                      By {listing.seller.username || listing.seller.ethereum_address.substring(0, 10) + '...'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsPage; 
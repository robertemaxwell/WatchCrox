import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await listingAPI.getListing(Number(id));
        setListing(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch listing details');
        console.error('Error fetching listing details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchListing();
    }
  }, [id]);

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
          onClick={() => navigate('/listings')} 
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-yellow-100 p-4 rounded-lg text-yellow-700">
        <p>Listing not found</p>
        <button 
          onClick={() => navigate('/listings')} 
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link 
          to="/listings"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Listings
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2">
            <div className="h-80 bg-gray-200 relative">
              {listing.listing_images && listing.listing_images.length > 0 ? (
                <img 
                  src={listing.listing_images[activeImageIndex].ipfs_uri.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
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
            
            {/* Thumbnail Navigation */}
            {listing.listing_images && listing.listing_images.length > 1 && (
              <div className="flex p-2 gap-2 overflow-x-auto">
                {listing.listing_images.map((image, index) => (
                  <div 
                    key={image.id} 
                    className={`w-16 h-16 rounded-md cursor-pointer ${index === activeImageIndex ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image.ipfs_uri.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                      alt={`${listing.title} - image ${index+1}`}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getImagePlaceholder();
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Listing Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <span className={`px-2 py-1 rounded text-sm ${listing.currency === 'ETH' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {listing.currency}
              </span>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl font-bold">{listing.price} {listing.currency}</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500">{listing.brand} {listing.model}</p>
              <p className="text-gray-500">Condition: {getConditionLabel(listing.condition)}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{listing.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Seller Information</h3>
              <p className="text-gray-700">
                {listing.seller.username || listing.seller.ethereum_address.substring(0, 10) + '...'}
              </p>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage; 
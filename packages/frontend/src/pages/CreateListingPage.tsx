import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listingAPI } from '../services/api';

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    model: '',
    price: '',
    currency: 'ETH',
    condition: 'New'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a listing');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const listingData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      const response = await listingAPI.createListing(listingData);
      navigate(`/listings/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
      console.error('Error creating listing:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sell Your Watch</h1>
      
      {error && (
        <div className="bg-red-100 p-4 mb-6 rounded-lg text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="e.g., Rolex Submariner Date 2022"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
              placeholder="e.g., Rolex, Omega, Patek Philippe"
            />
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
              placeholder="e.g., Submariner, Speedmaster"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="w-full p-2 border rounded"
            placeholder="Include details about your watch such as material, movement, complications, etc."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.000001"
              min="0"
              className="w-full p-2 border rounded"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency *
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition *
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="New">New</option>
              <option value="LikeNew">Like New</option>
              <option value="Used">Used</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
        
        {/* Image upload component would go here */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Image upload functionality will be added later</p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage; 
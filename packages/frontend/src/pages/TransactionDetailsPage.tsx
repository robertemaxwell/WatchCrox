import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI } from '../services/api';

interface Transaction {
  id: number;
  escrow_id: string;
  status: string;
  asset_type: string;
  amount: number;
  created_at: string;
  updated_at: string;
  listing: {
    id: number;
    title: string;
    description: string;
    brand: string;
    model: string;
    price: number;
    currency: string;
    condition: string;
    listing_images: Array<{
      id: number;
      ipfs_uri: string;
    }>;
  };
  buyer: {
    id: number;
    username: string;
    ethereum_address: string;
  };
  seller: {
    id: number;
    username: string;
    ethereum_address: string;
  };
  dispute?: {
    id: number;
    reason: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        if (!id) return;
        
        const response = await transactionAPI.getTransaction(Number(id));
        setTransaction(response.data);
      } catch (err: any) {
        console.error('Error fetching transaction details:', err);
        setError(err.message || 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!transaction) return;
    
    try {
      setUpdateLoading(true);
      await transactionAPI.updateTransactionStatus(transaction.id, newStatus);
      
      // Refresh transaction data
      const response = await transactionAPI.getTransaction(transaction.id);
      setTransaction(response.data);
    } catch (err: any) {
      console.error('Error updating transaction status:', err);
      setError(err.message || 'Failed to update transaction status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleOpenDispute = async () => {
    if (!transaction || !disputeReason.trim()) return;
    
    try {
      setUpdateLoading(true);
      await transactionAPI.updateTransactionStatus(transaction.id, 'DISPUTED', disputeReason);
      
      // Refresh transaction data
      const response = await transactionAPI.getTransaction(transaction.id);
      setTransaction(response.data);
      setShowDisputeModal(false);
    } catch (err: any) {
      console.error('Error opening dispute:', err);
      setError(err.message || 'Failed to open dispute');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'AWAITING_PAYMENT':
      case 'FUNDED':
      case 'AWAITING_DELIVERY':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISPUTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormattedStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  const getTransactionType = (): 'buy' | 'sell' => {
    if (!user || !transaction) return 'buy';
    return user.id === transaction.buyer.id ? 'buy' : 'sell';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatName = (user: { username: string, ethereum_address: string }) => {
    return user.username || formatAddress(user.ethereum_address);
  };

  const getImageUrl = (ipfsUri: string) => {
    return ipfsUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
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

  const renderActionButtons = () => {
    if (!user || !transaction) return null;
    
    const transactionType = getTransactionType();
    
    switch (transaction.status) {
      case 'AWAITING_PAYMENT':
        return transactionType === 'buy' ? (
          <button 
            onClick={() => handleStatusUpdate('FUNDED')}
            disabled={updateLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {updateLoading ? 'Processing...' : 'Pay Now'}
          </button>
        ) : (
          <p className="text-yellow-600">Waiting for buyer to pay</p>
        );
        
      case 'FUNDED':
        return transactionType === 'sell' ? (
          <button 
            onClick={() => handleStatusUpdate('AWAITING_DELIVERY')}
            disabled={updateLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {updateLoading ? 'Processing...' : 'Ship Item'}
          </button>
        ) : (
          <p className="text-yellow-600">Waiting for seller to ship</p>
        );
        
      case 'AWAITING_DELIVERY':
        return transactionType === 'buy' ? (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <button 
              onClick={() => handleStatusUpdate('DELIVERED')}
              disabled={updateLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {updateLoading ? 'Processing...' : 'Confirm Receipt'}
            </button>
            <button 
              onClick={() => setShowDisputeModal(true)}
              disabled={updateLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Open Dispute
            </button>
          </div>
        ) : (
          <p className="text-yellow-600">In transit to buyer</p>
        );
        
      case 'DELIVERED':
        return (
          <div className="bg-green-100 p-3 rounded text-green-800">
            <p className="font-medium">Transaction Completed</p>
            <p className="text-sm">This transaction has been successfully completed.</p>
          </div>
        );
        
      case 'DISPUTED':
        return (
          <div className="bg-red-100 p-3 rounded text-red-800">
            <p className="font-medium">Transaction Disputed</p>
            <p className="text-sm">
              Dispute reason: {transaction.dispute?.reason}
            </p>
            <p className="text-sm">
              Dispute status: {transaction.dispute?.status}
            </p>
          </div>
        );
        
      default:
        return null;
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
          <p>Please log in to view transaction details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/transactions')} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          <p className="font-bold">Transaction Not Found</p>
          <p>The requested transaction could not be found.</p>
          <button 
            onClick={() => navigate('/transactions')} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link 
          to="/transactions"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Transactions
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-2xl font-bold">
              Transaction #{transaction.id}
            </h1>
            <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {getFormattedStatus(transaction.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Transaction Type:</p>
              <p className="font-medium">{getTransactionType() === 'buy' ? 'Purchase' : 'Sale'}</p>
            </div>
            <div>
              <p className="text-gray-600">Amount:</p>
              <p className="font-medium">{transaction.amount} {transaction.asset_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Escrow ID:</p>
              <p className="font-mono text-sm">{transaction.escrow_id}</p>
            </div>
            <div>
              <p className="text-gray-600">Created:</p>
              <p className="font-medium">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-4">Watch Details</h2>
          <div className="md:flex">
            <div className="md:w-1/3 mb-4 md:mb-0">
              {transaction.listing.listing_images && transaction.listing.listing_images.length > 0 ? (
                <img 
                  src={getImageUrl(transaction.listing.listing_images[0].ipfs_uri)} 
                  alt={transaction.listing.title}
                  className="w-full h-48 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo192.png';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
            
            <div className="md:w-2/3 md:pl-6">
              <h3 className="text-lg font-semibold">
                <Link to={`/listings/${transaction.listing.id}`} className="text-blue-600 hover:text-blue-800">
                  {transaction.listing.title}
                </Link>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-gray-600">Brand:</p>
                  <p>{transaction.listing.brand}</p>
                </div>
                <div>
                  <p className="text-gray-600">Model:</p>
                  <p>{transaction.listing.model}</p>
                </div>
                <div>
                  <p className="text-gray-600">Condition:</p>
                  <p>{getConditionLabel(transaction.listing.condition)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Listed Price:</p>
                  <p>{transaction.listing.price} {transaction.listing.currency}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600">Description:</p>
                <p className="text-sm">{transaction.listing.description}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Buyer Information</h2>
            <p><span className="text-gray-600">Name:</span> {formatName(transaction.buyer)}</p>
            <p><span className="text-gray-600">Ethereum Address:</span> {formatAddress(transaction.buyer.ethereum_address)}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Seller Information</h2>
            <p><span className="text-gray-600">Name:</span> {formatName(transaction.seller)}</p>
            <p><span className="text-gray-600">Ethereum Address:</span> {formatAddress(transaction.seller.ethereum_address)}</p>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Transaction Status</h2>
          {renderActionButtons()}
        </div>
      </div>
      
      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Open Dispute</h2>
            <p className="mb-2 text-gray-700">
              Transaction: {transaction.listing.title}
            </p>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Reason for dispute
              <textarea 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue with this transaction..."
              />
            </label>
            <div className="mt-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowDisputeModal(false);
                  setDisputeReason('');
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                onClick={handleOpenDispute}
                disabled={!disputeReason.trim() || updateLoading}
              >
                {updateLoading ? 'Processing...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailsPage; 
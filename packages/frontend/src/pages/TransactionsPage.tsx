import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI, userAPI } from '../services/api';
import { Link } from 'react-router-dom';

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
    brand: string;
    model: string;
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
  };
}

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<Record<number, boolean>>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [fundingModalOpen, setFundingModalOpen] = useState(false);
  const [selectedTxForFunding, setSelectedTxForFunding] = useState<Transaction | null>(null);
  const [verifyingBalance, setVerifyingBalance] = useState<boolean>(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        if (user) {
          // Add timeout to prevent hanging requests
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fetching transactions timed out')), 5000)
          );
          
          const responsePromise = transactionAPI.getUserTransactions(user.id);
          const response = await Promise.race([responsePromise, timeoutPromise]) as any;
          
          setTransactions(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching transactions:', error);
        setError(error.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleStatusUpdate = async (txId: number, newStatus: string) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [txId]: true }));
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Status update timed out')), 5000)
      );
      
      const responsePromise = transactionAPI.updateTransactionStatus(txId, newStatus);
      await Promise.race([responsePromise, timeoutPromise]);
      
      // Update the transaction in the local state
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.id === txId ? { ...tx, status: newStatus } : tx
        )
      );
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      setError(error.message || 'Failed to update transaction status');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [txId]: false }));
    }
  };

  const openDisputeModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDisputeModal(true);
  };

  const handleSubmitDispute = async () => {
    if (!selectedTransaction || !disputeReason.trim()) return;
    
    try {
      setUpdateLoading(prev => ({ ...prev, [selectedTransaction.id]: true }));
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Dispute submission timed out')), 5000)
      );
      
      const responsePromise = transactionAPI.updateTransactionStatus(
        selectedTransaction.id, 
        'DISPUTED', 
        disputeReason
      );
      
      await Promise.race([responsePromise, timeoutPromise]);
      
      // Update the transaction in the local state
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.id === selectedTransaction.id ? { 
            ...tx, 
            status: 'DISPUTED',
            dispute: {
              id: 0, // This will be replaced when we refresh
              reason: disputeReason,
              status: 'OPEN'
            }
          } : tx
        )
      );
      
      setShowDisputeModal(false);
      setDisputeReason('');
      setSelectedTransaction(null);
    } catch (error: any) {
      console.error('Error opening dispute:', error);
      setError(error.message || 'Failed to open dispute');
    } finally {
      if (selectedTransaction) {
        setUpdateLoading(prev => ({ ...prev, [selectedTransaction.id]: false }));
      }
    }
  };

  const verifyBalanceForTransaction = async (tx: Transaction) => {
    if (!user) return false;
    
    try {
      setVerifyingBalance(true);
      setBalanceError(null);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Balance check timed out')), 5000)
      );
      
      const responsePromise = userAPI.checkBalance(user.id, tx.asset_type, tx.amount);
      const response = await Promise.race([responsePromise, timeoutPromise]) as any;
      
      if (!response.data.hasBalance) {
        setBalanceError(`Insufficient balance. You need ${tx.amount} ${tx.asset_type}.`);
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Error verifying balance:', err);
      setBalanceError(err.message || 'Failed to verify balance');
      return false;
    } finally {
      setVerifyingBalance(false);
    }
  };

  const openFundingModal = async (tx: Transaction) => {
    try {
      setSelectedTxForFunding(tx);
      const hasBalance = await verifyBalanceForTransaction(tx);
      if (hasBalance) {
        setFundingModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error opening funding modal:', error);
      setError(error.message || 'An error occurred');
    }
  };

  const handleFundTransaction = async () => {
    if (!selectedTxForFunding) return;
    
    try {
      setUpdateLoading(prev => ({ ...prev, [selectedTxForFunding.id]: true }));
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction update timed out')), 5000)
      );
      
      const responsePromise = transactionAPI.updateTransactionStatus(selectedTxForFunding.id, 'FUNDED');
      await Promise.race([responsePromise, timeoutPromise]);
      
      // Update the transaction in the local state
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.id === selectedTxForFunding.id ? { ...tx, status: 'FUNDED' } : tx
        )
      );
      
      setFundingModalOpen(false);
      setSelectedTxForFunding(null);
      setBalanceError(null);
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      setError(error.message || 'Failed to update transaction status');
    } finally {
      if (selectedTxForFunding) {
        setUpdateLoading(prev => ({ ...prev, [selectedTxForFunding.id]: false }));
      }
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

  const getTransactionType = (tx: Transaction): 'buy' | 'sell' => {
    if (!user) return 'buy';
    return user.id === tx.buyer.id ? 'buy' : 'sell';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatName = (user: { username: string, ethereum_address: string }) => {
    return user.username || `${user.ethereum_address.substring(0, 10)}...`;
  };

  const getStatusActions = (tx: Transaction) => {
    if (!user) return null;
    
    const transactionType = getTransactionType(tx);
    
    switch (tx.status) {
      case 'AWAITING_PAYMENT':
        return transactionType === 'buy' ? (
          <button 
            onClick={() => openFundingModal(tx)}
            disabled={!!updateLoading[tx.id]}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {updateLoading[tx.id] ? 'Processing...' : 'Pay Now'}
          </button>
        ) : null;
        
      case 'FUNDED':
        return transactionType === 'sell' ? (
          <button 
            onClick={() => handleStatusUpdate(tx.id, 'AWAITING_DELIVERY')}
            disabled={!!updateLoading[tx.id]}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {updateLoading[tx.id] ? 'Processing...' : 'Ship Item'}
          </button>
        ) : null;
        
      case 'AWAITING_DELIVERY':
        return transactionType === 'buy' ? (
          <div className="flex space-x-2">
            <button 
              onClick={() => handleStatusUpdate(tx.id, 'DELIVERED')}
              disabled={!!updateLoading[tx.id]}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {updateLoading[tx.id] ? 'Processing...' : 'Confirm Receipt'}
            </button>
            <button 
              onClick={() => openDisputeModal(tx)}
              disabled={!!updateLoading[tx.id]}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Open Dispute
            </button>
          </div>
        ) : null;
        
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
          <p>Please log in to view your transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {balanceError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{balanceError}</p>
        </div>
      )}
      
      {transactions.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600 text-center">No transactions found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watch</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counterparty</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const transactionType = getTransactionType(transaction);
                  const counterparty = transactionType === 'buy' ? transaction.seller : transaction.buyer;
                  
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transactionType === 'buy' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {transactionType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link to={`/listings/${transaction.listing.id}`} className="text-blue-600 hover:text-blue-800">
                          {transaction.listing.title} 
                          <span className="text-gray-500 ml-1">
                            ({transaction.listing.brand} {transaction.listing.model})
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatName(counterparty)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.amount} {transaction.asset_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {getFormattedStatus(transaction.status)}
                        </span>
                        {transaction.dispute && (
                          <div className="mt-1 text-xs text-red-600">
                            Dispute: {transaction.dispute.status}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2 items-center">
                          {getStatusActions(transaction)}
                          <Link 
                            to={`/transactions/${transaction.id}`} 
                            className="text-blue-600 hover:text-blue-800 ml-2"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Funding Confirmation Modal */}
      {fundingModalOpen && selectedTxForFunding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Payment</h2>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">You are about to pay for:</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedTxForFunding.listing.title}</p>
                <p className="text-sm text-gray-600">
                  {selectedTxForFunding.listing.brand} {selectedTxForFunding.listing.model}
                </p>
                <p className="font-semibold mt-2">
                  {selectedTxForFunding.amount} {selectedTxForFunding.asset_type}
                </p>
              </div>
            </div>
            
            <div className="mb-4 bg-yellow-50 p-3 rounded text-yellow-800 text-sm">
              This will transfer funds to an escrow account. They will be released to the seller 
              after you confirm receipt of the item.
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => {
                  setFundingModalOpen(false);
                  setSelectedTxForFunding(null);
                }}
                disabled={!!updateLoading[selectedTxForFunding.id]}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                onClick={handleFundTransaction}
                disabled={!!updateLoading[selectedTxForFunding.id]}
              >
                {updateLoading[selectedTxForFunding.id] ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Open Dispute</h2>
            <p className="mb-2 text-gray-700">
              Transaction: {selectedTransaction?.listing.title}
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
                  setSelectedTransaction(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                onClick={handleSubmitDispute}
                disabled={!disputeReason.trim()}
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage; 
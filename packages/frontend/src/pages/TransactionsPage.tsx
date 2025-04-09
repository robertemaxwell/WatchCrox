import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Transaction {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  itemName: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
}

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // In a real app, this would fetch from your backend
        // For now using mock data
        if (user) {
          // Simulate API call delay
          setTimeout(() => {
            setTransactions([
              {
                id: '1',
                date: '2023-05-15',
                type: 'buy',
                itemName: 'Vintage Watch',
                amount: '0.5 ETH',
                status: 'completed'
              },
              {
                id: '2',
                date: '2023-05-10',
                type: 'sell',
                itemName: 'Collector\'s Edition Rolex',
                amount: '2.3 ETH',
                status: 'completed'
              },
              {
                id: '3',
                date: '2023-05-05',
                type: 'buy',
                itemName: 'Antique Pocket Watch',
                amount: '0.8 ETH',
                status: 'pending'
              }
            ]);
            setLoading(false);
          }, 500);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
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
          <p>Please log in to view your transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      
      {transactions.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600 text-center">No transactions found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'buy' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {transaction.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{transaction.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage; 
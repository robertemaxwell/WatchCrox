import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  walletAddress: string;
  listings: number;
  transactions: number;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // In a real app, this would fetch from your backend
        // For now using mock data based on the authenticated user
        if (user) {
          // Simulate API call delay
          setTimeout(() => {
            setProfile({
              name: user.username || 'User',
              email: 'user@example.com', // Not in the User interface, using placeholder
              walletAddress: user.ethereum_address,
              listings: 5,
              transactions: 12
            });
            setLoading(false);
          }, 500);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          <p className="font-bold">Not Authenticated</p>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Wallet Address</h3>
          <p className="font-mono bg-gray-100 p-2 rounded break-all">{profile.walletAddress}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="font-semibold mb-2">Activity</h3>
          <div className="flex justify-between border-b pb-3">
            <span>Active Listings</span>
            <span className="font-bold">{profile.listings}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span>Completed Transactions</span>
            <span className="font-bold">{profile.transactions}</span>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="font-semibold mb-2">Account Settings</h3>
          <div className="space-y-4">
            <button className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Edit Profile
            </button>
            <button className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
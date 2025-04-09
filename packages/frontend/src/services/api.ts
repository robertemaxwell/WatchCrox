import axios from 'axios';

const API_URL = '/api/v1';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in cross-origin requests
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Request challenge for wallet signature
  getChallenge: async (address: string) => {
    return api.post('/auth/challenge', { address });
  },
  
  // Authenticate with signed message
  authenticate: async (address: string, signature: string) => {
    return api.post('/auth/authenticate', { address, signature });
  },
};

// User API calls
export const userAPI = {
  getUser: async (id: number) => {
    return api.get(`/users/${id}`);
  },
  
  updateUser: async (id: number, userData: { username: string }) => {
    return api.put(`/users/${id}`, { user: userData });
  },
};

// Listing API calls
export const listingAPI = {
  getListings: async () => {
    return api.get('/listings');
  },
  
  getListing: async (id: number) => {
    return api.get(`/listings/${id}`);
  },
  
  createListing: async (listingData: any) => {
    return api.post('/listings', { listing: listingData });
  },
  
  updateListing: async (id: number, listingData: any) => {
    return api.put(`/listings/${id}`, { listing: listingData });
  },
  
  deleteListing: async (id: number) => {
    return api.delete(`/listings/${id}`);
  },
  
  // Listing images
  getListingImages: async (listingId: number) => {
    return api.get(`/listings/${listingId}/listing_images`);
  },
  
  addListingImage: async (listingId: number, ipfsUri: string) => {
    return api.post(`/listings/${listingId}/listing_images`, { 
      listing_image: { ipfs_uri: ipfsUri } 
    });
  },
  
  deleteListingImage: async (imageId: number) => {
    return api.delete(`/listing_images/${imageId}`);
  },
};

// Transaction API calls
export const transactionAPI = {
  getTransactions: async () => {
    return api.get('/transactions');
  },
  
  getTransaction: async (id: number) => {
    return api.get(`/transactions/${id}`);
  },
  
  createTransaction: async (transactionData: any) => {
    return api.post('/transactions', { transaction: transactionData });
  },
  
  updateTransactionStatus: async (id: number, status: string, reason?: string) => {
    const data: any = { transaction: { status } };
    if (reason) {
      data.reason = reason;
    }
    return api.put(`/transactions/${id}`, data);
  },
  
  getUserTransactions: async (userId: number) => {
    return api.get(`/user/${userId}/transactions`);
  },
};

// Dispute API calls
export const disputeAPI = {
  getDisputes: async () => {
    return api.get('/disputes');
  },
  
  getDispute: async (id: number) => {
    return api.get(`/disputes/${id}`);
  },
  
  createDispute: async (txId: number, reason: string) => {
    return api.post('/disputes', { 
      dispute: { 
        tx_id: txId,
        reason
      } 
    });
  },
  
  resolveDispute: async (id: number, resolution: string, notes?: string) => {
    return api.put(`/disputes/${id}`, { 
      dispute: { 
        status: 'RESOLVED',
        resolution,
        resolution_notes: notes
      } 
    });
  },
};

export default api; 
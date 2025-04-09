import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

export interface WalletService {
  connectWallet: () => Promise<string>;
  getAddress: () => Promise<string | null>;
  signMessage: (message: string) => Promise<string>;
  isMetaMaskInstalled: () => boolean;
}

class MetaMaskService implements WalletService {
  private provider: any = null;
  private ethereum: any = null;
  private _isMetaMaskInstalled: boolean = false;
  
  constructor() {
    this.init();
  }
  
  private async init() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('Not in browser environment, skipping MetaMask detection');
        return;
      }

      // Detect if MetaMask is installed
      this.ethereum = await detectEthereumProvider({
        silent: true, // Silence console errors
        mustBeMetaMask: true
      });
      
      if (this.ethereum) {
        this._isMetaMaskInstalled = true;
        // Initialize ethers provider with MetaMask
        this.provider = new ethers.BrowserProvider(this.ethereum);
        
        // Listen for account changes
        this.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            // User has disconnected all accounts
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }
        });
      } else {
        console.log('MetaMask not detected. Please install MetaMask to use wallet features.');
      }
    } catch (error) {
      console.error('Failed to initialize wallet service:', error);
    }
  }
  
  isMetaMaskInstalled(): boolean {
    return this._isMetaMaskInstalled;
  }
  
  async connectWallet(): Promise<string> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }
    
    try {
      // Request account access
      const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }
  
  async getAddress(): Promise<string | null> {
    if (!this.ethereum) {
      return null;
    }
    
    try {
      const accounts = await this.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }
  
  async signMessage(message: string): Promise<string> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }
    
    try {
      const address = await this.getAddress();
      if (!address) {
        throw new Error('No wallet connected');
      }
      
      const signer = await this.provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }
}

// Create singleton instance
const walletService = new MetaMaskService();
export default walletService; 
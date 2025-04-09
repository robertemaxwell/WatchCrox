require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
// To help with env vars
require("dotenv").config();

// Use environment variables for private keys
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {},
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [PRIVATE_KEY],
      chainId: 137,
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
}; 
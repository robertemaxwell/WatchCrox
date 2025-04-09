# WatchCrox - Comprehensive v1 Development Plan

This document outlines an **opinionated, end-to-end development plan** for the WatchCrox decentralized luxury watch marketplace. It incorporates all clarifications provided and includes architecture, recommended technologies, MVP scope, user flows, and a high-level roadmap for future iterations.

---
## Table of Contents
1. [Overview & Guiding Principles](#overview--guiding-principles)
2. [MVP Feature Set](#mvp-feature-set)
3. [High-Level Architecture](#high-level-architecture)
4. [Technical Components](#technical-components)
   1. [Smart Contracts](#smart-contracts)
   2. [Backend Services & APIs](#backend-services--apis)
   3. [Frontend](#frontend)
   4. [Data Storage (IPFS + CDN Hybrid)](#data-storage-ipfs--cdn-hybrid)
   5. [Payments & DeFi Integration](#payments--defi-integration)
   6. [Authentication](#authentication)
5. [Detailed User Flows](#detailed-user-flows)
   1. [Listing a Watch](#listing-a-watch)
   2. [Buying a Watch](#buying-a-watch)
   3. [Escrow and Settlement Flow](#escrow-and-settlement-flow)
   4. [Dispute/Arbitration Flow (Manual/Centralized)](#disputearbitration-flow-manualcentralized)
6. [Implementation Strategy](#implementation-strategy)
   1. [Smart Contract Development](#smart-contract-development)
   2. [Backend / API Implementation](#backend--api-implementation)
   3. [Frontend Implementation](#frontend-implementation)
   4. [Testing & Audits](#testing--audits)
7. [Deployment Approach](#deployment-approach)
   1. [Testnets & Mainnet Deployment](#testnets--mainnet-deployment)
   2. [Continuous Integration / Continuous Deployment (CI/CD)](#continuous-integration--continuous-deployment-cicd)
8. [Future Roadmap & v2 Enhancements](#future-roadmap--v2-enhancements)
9. [Resources & Team Roles](#resources--team-roles)
10. [Conclusion](#conclusion)

---

## 1. Overview & Guiding Principles
**WatchCrox** is an MVP marketplace for luxury watches, combining:
- **Custom Escrow Smart Contracts** to ensure trustless payments.
- **Centralized Arbitration** for dispute resolution in v1.
- **Multiple Crypto On/Off Ramps** for ETH, USDC, BTC.
- **Aggregator-Based Swaps** (e.g., 1inch) for real-time conversions (stable to stable or stable to ETH).
- **Minimal Friction for Users**: No mandatory KYC/AML in v1, manual shipping verification, and a straightforward user interface.

**Key MVP Design Principles**:
1. **Security by Design**: Clear escrow release mechanics.  
2. **Simplicity & Speed**: Avoid feature bloat in v1; deliver a functioning marketplace quickly.  
3. **Foundation for Future Scalability**: Lay the groundwork for advanced shipping integrations, decentralized arbitration, and compliance in future versions.

---

## 2. MVP Feature Set
Below are the core features for v1:

1. **Listing Creation**
   - Sellers can create listings of luxury watches with images, descriptions, and optional metadata.
   - Basic input fields: brand, model, price (crypto/fiat), condition, proof of authenticity (uploaded as images/docs).

2. **Wallet-Based Authentication (Sign-in with Ethereum)**
   - Users connect via MetaMask, WalletConnect, or a compatible wallet.
   - No email/password required. Basic user profile stored server-side if needed.

3. **P2P Escrow Contract**
   - Funds are locked in a **custom, single-escrow** contract for each transaction.
   - Release occurs only when the buyer manually confirms delivery.

4. **Manual Shipping & Delivery Confirmation**
   - Buyer and seller coordinate shipping offline.
   - Buyer manually clicks “Confirm Delivery” to release escrow.

5. **Centralized Arbitration Panel**
   - If there’s a dispute, the platform’s admin or an appointed panel can mediate.
   - Admin has a special role to override escrow release in extreme cases (e.g., proven scam).

6. **Hybrid Storage of Watch Assets**
   - **IPFS** for listing images and authenticity certificates (immutable references).
   - **CDN** for faster content delivery or fallback.

7. **Basic On/Off Ramp Integration**
   - Integrate at least two providers (e.g., **Wyre** for US-based, **Transak** for broader international coverage).
   - Offer direct deposit to user wallets.  
   - The user can then use aggregator-based swaps (e.g., 1inch) to convert between ETH and USDC or vice versa.

8. **Basic Admin Interface**
   - Manage listings, user disputes, and escrow overrides.

**Not in v1** but planned for v2+:
- Automated shipping integrations (FedEx, DHL).
- KYC/AML flows.
- Decentralized arbitration.
- Additional altcoins and multi-chain bridging.
- NFT-based “digital certificate of authenticity.”

---

## 3. High-Level Architecture
```plaintext
           ┌────────────┐
           │   Frontend  │
           │ (React/Next)│
           └─────┬───────┘
                 │
                 ▼
     ┌───────────────────────┐
     │       Backend         │  <-- (Rails or Node.js, minimal orchestration)
     │ (API layer, optional) │
     └─────────┬─────────────┘
               │
               ▼
        ┌───────────────┐
        │Smart Contracts │ <-- (Custom Escrow, deployed on L2)
        │(Solidity)      │
        └───────┬────────┘
                │
                ▼
         ┌───────────────┐
         │    DeFi &     │
         │  On/Off Ramps │ <-- (Wyre, Transak, 1inch aggregator)
         └───────────────┘

       ┌────────────────┐        ┌─────────────┐
       │   IPFS Storage │ <----> │ CDN Fallback│
       └────────────────┘        └─────────────┘

	1.	Frontend: Next.js + React + Tailwind CSS. Connect user wallets via MetaMask or WalletConnect.
	2.	Backend: Optional, minimal Rails or Node.js service for orchestrating listings, user profiles, and referencing IPFS.
	3.	Smart Contracts: Deployed on a Layer 2 (e.g., Polygon) for lower fees.
	4.	DeFi & Payment: Integrations with aggregator-based swaps and on/off ramp providers.
	5.	Storage: IPFS for immutability and decentralized hosting of watch images/certificates. A CDN fallback for performance.

⸻

4. Technical Components

4.1 Smart Contracts

Tech: Solidity, aiming to deploy on a Layer 2 (e.g., Polygon).

Key Contract: EscrowContract.sol
	•	Each purchase results in a new escrow instance or an internal ledger mapping (depending on the design).
	•	Store the buyer and seller addresses, purchase price, and status (e.g., AWAITING_DELIVERY, DELIVERED, DISPUTED).
	•	Include an “admin” address for dispute resolution override.

Functions:
	1.	initializeEscrow(buyer, seller, amount, assetType):
	•	Sets up the escrow details.
	2.	lockFunds():
	•	Called by the buyer to lock the funds (ETH or ERC20).
	3.	confirmDelivery():
	•	Buyer confirms watch receipt → triggers fund release to seller.
	4.	disputeEscrow():
	•	Buyer or seller can raise a dispute → sets contract state to DISPUTED.
	5.	resolveDispute(buyerWins):
	•	Admin function to forcibly release funds to buyer or seller.

Example Skeleton (very verbose for clarity):

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WatchCroxEscrow {
    address public admin;

    enum EscrowStatus { AWAITING_PAYMENT, FUNDED, AWAITING_DELIVERY, DELIVERED, DISPUTED, RESOLVED }
    enum AssetType { ETH, USDC } // We can expand if needed

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        AssetType assetType;
        EscrowStatus status;
    }

    mapping (uint256 => Escrow) public escrows;
    uint256 public escrowCounter;

    constructor() {
        admin = msg.sender; // Deploying address is admin
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function initializeEscrow(
        address _buyer,
        address _seller,
        uint256 _amount,
        AssetType _assetType
    )
        external
        returns (uint256)
    {
        escrowCounter++;
        escrows[escrowCounter] = Escrow({
            buyer: _buyer,
            seller: _seller,
            amount: _amount,
            assetType: _assetType,
            status: EscrowStatus.AWAITING_PAYMENT
        });

        return escrowCounter;
    }

    function lockFunds(uint256 _escrowId) external payable {
        Escrow storage e = escrows[_escrowId];
        require(msg.sender == e.buyer, "Only buyer can lock funds");
        require(e.status == EscrowStatus.AWAITING_PAYMENT, "Escrow not awaiting payment");

        if (e.assetType == AssetType.ETH) {
            require(msg.value == e.amount, "Incorrect ETH amount");
        } else if (e.assetType == AssetType.USDC) {
            // For example USDC, we assume user has approved this contract
            IERC20 usdc = IERC20(<USDC_CONTRACT_ADDRESS>);
            require(usdc.transferFrom(msg.sender, address(this), e.amount), "Transfer failed");
        }

        e.status = EscrowStatus.FUNDED;
    }

    function markShipped(uint256 _escrowId) external {
        Escrow storage e = escrows[_escrowId];
        require(msg.sender == e.seller, "Only seller can mark shipped");
        require(e.status == EscrowStatus.FUNDED, "Escrow not funded");
        e.status = EscrowStatus.AWAITING_DELIVERY;
    }

    function confirmDelivery(uint256 _escrowId) external {
        Escrow storage e = escrows[_escrowId];
        require(msg.sender == e.buyer, "Only buyer can confirm");
        require(e.status == EscrowStatus.AWAITING_DELIVERY, "Escrow not awaiting delivery");

        e.status = EscrowStatus.DELIVERED;
        _releaseFunds(_escrowId);
    }

    function disputeEscrow(uint256 _escrowId) external {
        Escrow storage e = escrows[_escrowId];
        require(msg.sender == e.buyer || msg.sender == e.seller, "Must be buyer or seller");
        require(e.status == EscrowStatus.AWAITING_DELIVERY, "Cannot dispute now");
        e.status = EscrowStatus.DISPUTED;
    }

    function resolveDispute(uint256 _escrowId, bool buyerWins) external onlyAdmin {
        Escrow storage e = escrows[_escrowId];
        require(e.status == EscrowStatus.DISPUTED, "Escrow not disputed");
        if (buyerWins) {
            _refundBuyer(_escrowId);
        } else {
            _releaseFunds(_escrowId);
        }
        e.status = EscrowStatus.RESOLVED;
    }

    function _releaseFunds(uint256 _escrowId) internal {
        Escrow storage e = escrows[_escrowId];
        if (e.assetType == AssetType.ETH) {
            payable(e.seller).transfer(e.amount);
        } else if (e.assetType == AssetType.USDC) {
            IERC20 usdc = IERC20(<USDC_CONTRACT_ADDRESS>);
            usdc.transfer(e.seller, e.amount);
        }
    }

    function _refundBuyer(uint256 _escrowId) internal {
        Escrow storage e = escrows[_escrowId];
        if (e.assetType == AssetType.ETH) {
            payable(e.buyer).transfer(e.amount);
        } else if (e.assetType == AssetType.USDC) {
            IERC20 usdc = IERC20(<USDC_CONTRACT_ADDRESS>);
            usdc.transfer(e.buyer, e.amount);
        }
    }
}

4.2 Backend Services & APIs
	•	Rails 7.1 (recommended for clarity, but Node.js is equally viable).
	•	Minimal responsibilities:
	•	Store user profiles, listing details, references to IPFS media, and the current “status” of each listing.
	•	Serve a GraphQL or REST API to the frontend.
	•	Provide an admin panel to handle disputes and other overrides.

4.3 Frontend
	•	Next.js (React + TypeScript) with Tailwind CSS.
	•	Wallet Integration: @web3-react/core or wagmi for MetaMask/WalletConnect.
	•	SIWE (Sign-In with Ethereum) for user login, if needed.
	•	End result is a responsive web interface that can easily transition to mobile apps in future.

4.4 Data Storage (IPFS + CDN Hybrid)
	•	IPFS for images, certificates, etc.
	•	Pinata or Infura to pin files for reliability.
	•	CDN (e.g., Cloudflare or AWS CloudFront) for fallback or caching frequently accessed images.

4.5 Payments & DeFi Integration
	•	Fiat On/Off Ramps:
	•	Wyre (good for US-based users),
	•	Transak (broader global coverage).
	•	Aggregator-based swaps (e.g., 1inch or Paraswap) to swap ETH ↔ USDC.
	•	For BTC, consider bridging solutions or wrapped BTC (WBTC).
	•	No additional volatility tokens in v1 to reduce complexity.

4.6 Authentication
	•	Sign-In With Ethereum is the simplest path:
	1.	Generate a nonce on the backend.
	2.	User signs the nonce with wallet.
	3.	Verify signature → create session.

⸻

5. Detailed User Flows

5.1 Listing a Watch
	1.	User connects wallet (SIWE) → user session established.
	2.	Navigate to “Create Listing”:
	•	Fill out brand, model, condition, price, currency (ETH or USDC in v1).
	•	Upload images/certificates (stored on IPFS).
	3.	Publish:
	•	Listing record created in the backend.
	•	IPFS references are stored in the listing entity.

5.2 Buying a Watch
	1.	Browse/Filter: Users see watch listings and pick one.
	2.	Click “Buy”:
	•	System prompts for signing a transaction to create an escrow.
	•	The initializeEscrow() is called from the DApp with relevant details.
	3.	Lock Funds:
	•	Buyer confirms locking either ETH or USDC in the escrow contract via lockFunds(escrowId).

5.3 Escrow and Settlement Flow
	1.	Seller Ships: Once the contract is FUNDED, seller marks “Shipped” (calls markShipped()).
	2.	Buyer Confirms Delivery: Buyer manually checks the package and then calls confirmDelivery().
	3.	Funds Released: The contract automatically pays the seller.

5.4 Dispute/Arbitration Flow (Manual/Centralized)
	1.	Dispute: If the buyer or seller claims an issue, they call disputeEscrow() before confirming delivery.
	2.	Panel/Admin: Admin logs into the admin panel, sees the dispute, and calls resolveDispute() on the smart contract, deciding whether to release funds to the seller or refund the buyer.

⸻

6. Implementation Strategy

6.1 Smart Contract Development
	1.	Local Development: Use Hardhat or Truffle to write and test the escrow contract.
	2.	Libraries: Use OpenZeppelin for ERC20 interactions and safe math.
	3.	Automated Tests: Provide full coverage for escrow logic (funding, edge cases, disputes).

6.2 Backend / API Implementation
	1.	Models:
	•	User (public address, optional username).
	•	Listing (title, description, images [IPFS URIs], price, currency).
	•	Transaction (escrowId, references to listing, buyer, seller).
	2.	REST or GraphQL Endpoints:
	•	GET /api/listings – list available watches.
	•	POST /api/listings – create new listing (requires wallet auth).
	•	GET /api/disputes – admin-only dispute listing.
	•	POST /api/disputes/{id}/resolve – admin resolves a dispute, calls contract function.
	3.	Admin Panel:
	•	Simple interface to see disputes and listings, with a button to trigger arbitration logic on-chain.

6.3 Frontend Implementation
	1.	Next.js Pages:
	•	Home – featured listings.
	•	ListingDetails – watch detail view, price in ETH/USDC with aggregator-based conversion if desired.
	•	CreateListing – form for new listing.
	•	MyProfile – user’s listed watches, purchases, etc.
	2.	Wallet Connection:
	•	Use wagmi or @web3-react/core for wallet connections.
	•	On “Buy” or “Confirm Delivery,” prompt the user to sign a transaction.
	3.	UX & Styling:
	•	Tailwind CSS for quick iteration.
	•	Minimal brand design for v1 (neutral, modern feel).

6.4 Testing & Audits
	1.	Unit Tests:
	•	Smart Contract: Hardhat or Truffle test coverage for edge cases.
	•	Backend: RSpec (if Rails) or Jest (if Node).
	2.	Integration Tests:
	•	Use ephemeral test environment or testnet (e.g., Polygon Mumbai).
	3.	Security Audit (optional in v1 due to time constraints):
	•	Plan for a future external audit before going mainnet if feasible.

⸻

7. Deployment Approach

7.1 Testnets & Mainnet Deployment
	•	Polygon Mumbai for v1 testing (low gas).
	•	Polygon Mainnet for production deployment to avoid Ethereum L1’s high fees.
	•	Alternatively, Arbitrum or Optimism if that aligns with user preference, but Polygon is simplest from a user-adoption standpoint right now.

7.2 Continuous Integration / Continuous Deployment (CI/CD)
	•	GitHub Actions or GitLab CI:
	•	Lint + test on each push.
	•	Deploy automatically to staging environment (Mumbai).
	•	Manual approval to deploy to production (Polygon mainnet).

⸻

8. Future Roadmap & v2 Enhancements
	1.	Shipping Integration:
	•	FedEx, DHL, or UPS APIs, auto-confirm shipping status → partial or automatic release triggers.
	2.	Decentralized Arbitration:
	•	Integrate with Kleros or similar to remove centralized control over dispute resolution.
	3.	KYC/AML:
	•	For higher-value transactions or certain jurisdictions. Possibly partner with a compliance provider (e.g., Sumsub).
	4.	Multi-Chain Expansion:
	•	Add bridging for BTC, or use wBTC more seamlessly.
	5.	NFT-based Certificate of Authenticity:
	•	Issue an NFT for each verified watch that proves authenticity and ownership history on-chain.
	6.	Native Mobile App:
	•	iOS/Android with wallet integration. Possibly use React Native for code sharing.

⸻

9. Resources & Team Roles
	1.	Smart Contract Engineer:
	•	Designs, implements, and tests WatchCroxEscrow.sol on L2 testnets.
	2.	Backend/Full-Stack Engineer:
	•	Implements minimal Rails (or Node) API, handles IPFS/CDN integration, manages database migrations.
	3.	Frontend Engineer:
	•	Builds Next.js/Tailwind UI, wallet integrations, user flows.
	4.	Product/Project Manager:
	•	Oversees feature prioritization, sprint planning, backlog grooming.
	5.	QA & Testing:
	•	Conducts integration tests across contracts, backend, and frontend.
	6.	Admin/Customer Support:
	•	Handles dispute resolution via the admin panel (centralized approach in v1).

⸻

10. Conclusion

The above plan ensures a fast, secure, and minimal v1 launch for WatchCrox:
	•	MVP focuses on direct, P2P escrow with manual shipping confirmation.
	•	Minimal friction: No KYC/AML, no advanced shipping APIs, no multi-chain complexity for v1.
	•	Scalable: Architecture ready for future enhancements like decentralized arbitration, deeper compliance, and shipping integrations.

With this approach, we can deliver a functional decentralized luxury watch marketplace quickly, gather user feedback, and iterate towards a robust, fully borderless trading ecosystem.

Next Steps:
	1.	Finalize contract architecture.
	2.	Implement the escrow contract and test on a local environment → then on Polygon Mumbai.
	3.	Develop the minimal Rails/Next.js stack.
	4.	Launch on mainnet.
	5.	Gather feedback, iterate, plan v2 expansions.

We have designed this plan so it can be executed swiftly while ensuring a solid foundation for advanced features in the near future. By focusing on essential components for trustless payments, simple dispute resolution, and a wallet-native user experience, WatchCrox v1 can make a notable impact in the luxury watch space.


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WatchCroxEscrow {
    address public admin;

    enum EscrowStatus { AWAITING_PAYMENT, FUNDED, AWAITING_DELIVERY, DELIVERED, DISPUTED, RESOLVED }
    enum AssetType { ETH, USDC }

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
        admin = msg.sender;
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
            // For USDC, assume user has approved this contract
            IERC20 usdc = IERC20(getUSDCAddress());
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
            IERC20 usdc = IERC20(getUSDCAddress());
            usdc.transfer(e.seller, e.amount);
        }
    }

    function _refundBuyer(uint256 _escrowId) internal {
        Escrow storage e = escrows[_escrowId];
        if (e.assetType == AssetType.ETH) {
            payable(e.buyer).transfer(e.amount);
        } else if (e.assetType == AssetType.USDC) {
            IERC20 usdc = IERC20(getUSDCAddress());
            usdc.transfer(e.buyer, e.amount);
        }
    }
    
    // This would be set during deployment or via admin function
    function getUSDCAddress() internal pure returns (address) {
        // For Mumbai testnet or Polygon, replace with actual address
        return 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // Polygon USDC
    }
} 
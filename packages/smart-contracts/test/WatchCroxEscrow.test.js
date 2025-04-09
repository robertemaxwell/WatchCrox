const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WatchCroxEscrow", function () {
  let WatchCroxEscrow;
  let escrow;
  let owner;
  let buyer;
  let seller;
  let addr1;

  beforeEach(async function () {
    WatchCroxEscrow = await ethers.getContractFactory("WatchCroxEscrow");
    [owner, buyer, seller, addr1] = await ethers.getSigners();
    escrow = await WatchCroxEscrow.deploy();
    await escrow.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await escrow.admin()).to.equal(owner.address);
    });
  });

  describe("Escrow Creation", function () {
    it("Should create a new escrow", async function () {
      const amount = ethers.utils.parseEther("1.0");
      const tx = await escrow.initializeEscrow(
        buyer.address,
        seller.address,
        amount,
        0 // ETH
      );
      
      await tx.wait();
      
      const escrowData = await escrow.escrows(1);
      expect(escrowData.buyer).to.equal(buyer.address);
      expect(escrowData.seller).to.equal(seller.address);
      expect(escrowData.amount).to.equal(amount);
      expect(escrowData.assetType).to.equal(0); // ETH
      expect(escrowData.status).to.equal(0); // AWAITING_PAYMENT
    });
  });

  describe("Escrow Flow", function () {
    beforeEach(async function () {
      const amount = ethers.utils.parseEther("1.0");
      await escrow.initializeEscrow(
        buyer.address,
        seller.address,
        amount,
        0 // ETH
      );
    });

    it("Should allow buyer to lock funds", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await escrow.connect(buyer).lockFunds(1, { value: amount });
      
      const escrowData = await escrow.escrows(1);
      expect(escrowData.status).to.equal(1); // FUNDED
    });

    it("Should allow seller to mark as shipped", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await escrow.connect(buyer).lockFunds(1, { value: amount });
      await escrow.connect(seller).markShipped(1);
      
      const escrowData = await escrow.escrows(1);
      expect(escrowData.status).to.equal(2); // AWAITING_DELIVERY
    });

    it("Should allow buyer to confirm delivery", async function () {
      const amount = ethers.utils.parseEther("1.0");
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      
      await escrow.connect(buyer).lockFunds(1, { value: amount });
      await escrow.connect(seller).markShipped(1);
      await escrow.connect(buyer).confirmDelivery(1);
      
      const escrowData = await escrow.escrows(1);
      expect(escrowData.status).to.equal(3); // DELIVERED
      
      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      expect(finalSellerBalance.sub(initialSellerBalance)).to.equal(amount);
    });

    it("Should allow buyer to dispute and admin to resolve", async function () {
      const amount = ethers.utils.parseEther("1.0");
      
      await escrow.connect(buyer).lockFunds(1, { value: amount });
      await escrow.connect(seller).markShipped(1);
      await escrow.connect(buyer).disputeEscrow(1);
      
      let escrowData = await escrow.escrows(1);
      expect(escrowData.status).to.equal(4); // DISPUTED
      
      await escrow.connect(owner).resolveDispute(1, true); // Buyer wins
      
      escrowData = await escrow.escrows(1);
      expect(escrowData.status).to.equal(5); // RESOLVED
    });
  });
}); 
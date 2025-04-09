module Api
  module V1
    class TransactionsController < BaseController
      before_action :set_transaction, only: [:show, :update]
      
      def index
        # In a real app, we would filter by current user
        @transactions = Transaction.includes(:listing, :buyer, :seller).all
        render json: @transactions, include: [:listing, :buyer, :seller]
      end
      
      def show
        render json: @transaction, include: [:listing, :buyer, :seller, :dispute]
      end
      
      def create
        # Initialize escrow on the blockchain
        # In a real implementation, this would call our smart contract
        escrow_id = initialize_escrow
        
        @transaction = Transaction.new(transaction_params)
        @transaction.escrow_id = escrow_id
        @transaction.status = "AWAITING_PAYMENT"
        
        if @transaction.save
          render json: @transaction, status: :created
        else
          render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        # Update transaction status
        # In a real implementation, this would verify blockchain state
        if @transaction.update(update_params)
          # If marked as disputed, create a dispute record
          if update_params[:status] == "DISPUTED" && !@transaction.dispute.present?
            reason = params[:reason] || "Dispute opened"
            @transaction.create_dispute(reason: reason, status: "OPEN")
          end
          
          render json: @transaction
        else
          render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def user_transactions
        # Get transactions for a specific user (as buyer or seller)
        user_id = params[:user_id]
        @transactions = Transaction.where("buyer_id = ? OR seller_id = ?", user_id, user_id)
                                  .includes(:listing, :buyer, :seller)
        
        render json: @transactions, include: [:listing, :buyer, :seller]
      end
      
      private
      
      def set_transaction
        @transaction = Transaction.find(params[:id])
      end
      
      def transaction_params
        params.require(:transaction).permit(:listing_id, :buyer_id, :seller_id, :asset_type, :amount)
      end
      
      def update_params
        params.require(:transaction).permit(:status)
      end
      
      def initialize_escrow
        # In a real implementation, this would call our smart contract
        # Example with Web3:
        # contract = web3.eth.contract(ABI).at(CONTRACT_ADDRESS)
        # result = contract.initializeEscrow(buyer, seller, amount, asset_type)
        # return result.escrow_id
        
        # For MVP, just generate a random ID
        "escrow_#{SecureRandom.hex(8)}"
      end
    end
  end
end

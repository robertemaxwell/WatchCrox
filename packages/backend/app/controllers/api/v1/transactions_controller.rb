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
      
      def create_verified
        # First verify that the buyer has sufficient funds
        buyer_id = transaction_params[:buyer_id]
        asset_type = transaction_params[:asset_type]
        amount = transaction_params[:amount]
        
        buyer = User.find(buyer_id)
        
        # In a real implementation, this would check the blockchain wallet balance
        # For now, we'll use the same simulation method as in UsersController
        has_balance = verify_balance(buyer, asset_type, amount)
        
        unless has_balance
          return render json: { 
            error: "Insufficient funds", 
            details: "User does not have enough #{asset_type} for this transaction" 
          }, status: :payment_required
        end
        
        # Proceed with transaction creation if balance is sufficient
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
      
      def verify_balance(user, currency, amount)
        # This is a temporary simulation
        # In a real implementation, you would check the actual wallet balance
        
        # For testing, let's say:
        # - User 1 has enough ETH but not enough USDC
        # - User 2 has enough USDC but not enough ETH
        # - Users 3+ have enough of both
        
        case user.id
        when 1
          return currency == 'ETH'
        when 2
          return currency == 'USDC'
        else
          # For other users, return true as long as the amount is reasonable
          return amount.to_f < 10000
        end
      end
    end
  end
end

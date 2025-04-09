module Api
  module V1
    class DisputesController < BaseController
      before_action :set_dispute, only: [:show, :update]
      # In a real app, we would add admin-only protection for resolution
      
      def index
        # In a real app, we would filter by current user or admin status
        @disputes = Dispute.includes(:tx).all
        render json: @disputes, include: { tx: { include: [:listing, :buyer, :seller] } }
      end
      
      def show
        render json: @dispute, include: { tx: { include: [:listing, :buyer, :seller] } }
      end
      
      def create
        @dispute = Dispute.new(dispute_params)
        @dispute.status = "OPEN"
        
        # Update the related transaction status
        transaction = Transaction.find(@dispute.tx_id)
        transaction.update(status: "DISPUTED")
        
        if @dispute.save
          render json: @dispute, status: :created
        else
          render json: { errors: @dispute.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        # Admin-only endpoint to resolve disputes
        # In a real implementation, this would call our smart contract
        
        if params[:resolution].blank? && dispute_params[:status] == "RESOLVED"
          return render json: { error: "Resolution is required to resolve a dispute" }, status: :unprocessable_entity
        end
        
        if @dispute.update(dispute_params)
          # If dispute is resolved, update the transaction
          if dispute_params[:status] == "RESOLVED"
            @dispute.tx.update(status: "RESOLVED")
            
            # In a real implementation, this would call the smart contract to release funds
            # For example:
            # resolve_on_blockchain(@dispute.tx.escrow_id, @dispute.resolution == "BUYER_WINS")
          end
          
          render json: @dispute
        else
          render json: { errors: @dispute.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      private
      
      def set_dispute
        @dispute = Dispute.find(params[:id])
      end
      
      def dispute_params
        params.require(:dispute).permit(:tx_id, :reason, :status, :resolution, :resolution_notes)
      end
      
      def resolve_on_blockchain(escrow_id, buyer_wins)
        # In a real implementation, this would call our smart contract
        # Example with Web3:
        # contract = web3.eth.contract(ABI).at(CONTRACT_ADDRESS)
        # contract.resolveDispute(escrow_id, buyer_wins)
      end
    end
  end
end

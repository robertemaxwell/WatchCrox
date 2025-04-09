module Api
  module V1
    class UsersController < BaseController
      before_action :set_user, only: [:show, :update, :check_balance]
      
      def show
        render json: @user, include: { 
          listings: { include: :listing_images },
          purchases: { include: :listing },
          sales: { include: :listing }
        }
      end
      
      def update
        # In a real app, we would only allow users to update their own profile
        if @user.update(user_params)
          render json: @user
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def check_balance
        currency = params[:currency]
        amount = params[:amount].to_f
        
        # In a real implementation, we would check blockchain wallet balance
        # or an internal database of user funds
        
        # For MVP purposes, we'll simulate balance checking
        # In production, you would integrate with wallet API or blockchain
        
        # Simulate a balance check for testing purposes
        has_balance = simulate_balance_check(@user, currency, amount)
        
        render json: { 
          hasBalance: has_balance,
          currency: currency,
          required_amount: amount
        }
      end
      
      private
      
      def set_user
        @user = User.find(params[:id])
      end
      
      def user_params
        params.require(:user).permit(:username)
      end
      
      def simulate_balance_check(user, currency, amount)
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
          return amount < 10000
        end
      end
    end
  end
end

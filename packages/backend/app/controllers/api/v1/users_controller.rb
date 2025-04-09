module Api
  module V1
    class UsersController < BaseController
      before_action :set_user, only: [:show, :update]
      
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
      
      private
      
      def set_user
        @user = User.find(params[:id])
      end
      
      def user_params
        params.require(:user).permit(:username)
      end
    end
  end
end

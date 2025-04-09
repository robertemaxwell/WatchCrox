module Api
  module V1
    class ListingsController < BaseController
      before_action :set_listing, only: [:show, :update, :destroy]
      # In a real app, we would add authentication here
      # before_action :authenticate_user!, except: [:index, :show]
      
      def index
        @listings = Listing.includes(:seller, :listing_images).all
        render json: @listings, include: [:seller, :listing_images]
      end
      
      def show
        render json: @listing, include: [:seller, :listing_images]
      end
      
      def create
        # In a real app, we would set the seller to the current user
        @listing = Listing.new(listing_params)
        
        # Set a default seller_id if not provided
        @listing.seller_id ||= User.first&.id || create_default_seller.id
        
        if @listing.save
          render json: @listing, status: :created
        else
          render json: { errors: @listing.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        # In a real app, we would check if the current user owns the listing
        if @listing.update(listing_params)
          render json: @listing
        else
          render json: { errors: @listing.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def destroy
        # In a real app, we would check if the current user owns the listing
        @listing.destroy
        head :no_content
      end
      
      private
      
      def set_listing
        @listing = Listing.find(params[:id])
      end
      
      def listing_params
        params.require(:listing).permit(:title, :description, :price, :condition, 
                                      :brand, :model, :currency, :seller_id)
      end
      
      def create_default_seller
        User.create!(
          username: "default_seller",
          email: "default@example.com"
        )
      end
    end
  end
end

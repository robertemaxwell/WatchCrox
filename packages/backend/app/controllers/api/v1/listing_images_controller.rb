module Api
  module V1
    class ListingImagesController < BaseController
      before_action :set_listing, only: [:index, :create]
      before_action :set_image, only: [:destroy]
      
      def index
        @images = @listing.listing_images
        render json: @images
      end
      
      def create
        # In a real implementation, this would handle upload to IPFS
        # For MVP, we'll just accept an IPFS URI directly
        @image = @listing.listing_images.new(image_params)
        
        if @image.save
          render json: @image, status: :created
        else
          render json: { errors: @image.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def destroy
        # In a real app, we would check if the current user owns the listing
        @image.destroy
        head :no_content
      end
      
      private
      
      def set_listing
        @listing = Listing.find(params[:listing_id])
      end
      
      def set_image
        @image = ListingImage.find(params[:id])
      end
      
      def image_params
        params.require(:listing_image).permit(:ipfs_uri)
      end
    end
  end
end 
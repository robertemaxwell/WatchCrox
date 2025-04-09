module Api
  module V1
    class AuthController < BaseController
      # Step 1: Request a challenge nonce
      def challenge
        address = params.require(:address)
        # Generate a random nonce to be signed by the wallet
        nonce = SecureRandom.hex(16)
        # Store nonce with expiration (session or Redis would be better in production)
        session[:auth_nonce] = {
          value: nonce,
          address: address.downcase,
          expires_at: 5.minutes.from_now.to_i  # Store as integer timestamp instead of Time object
        }
        
        render json: { nonce: nonce }
      end
      
      # Step 2: Verify the signed message
      def authenticate
        params.require([:address, :signature])
        address = params[:address].downcase
        signature = params[:signature]
        
        # Retrieve the challenge from session
        nonce_data = session[:auth_nonce]
        
        # Debug session data
        Rails.logger.info("Session data: #{session.to_h}")
        Rails.logger.info("Nonce data: #{nonce_data.inspect}")
        
        # Validate nonce exists, matches requested address, and hasn't expired
        if nonce_data.blank? || 
           nonce_data['address'] != address || 
           nonce_data['expires_at'].to_i < Time.current.to_i
          return render json: { error: 'Invalid or expired authentication request' }, status: :unauthorized
        end
        
        # In a real implementation, we would verify the signature cryptographically
        # This would use eth_utils or similar library to recover the signer address
        # from the signature and compare it to the provided address
        
        # For MVP, we'll simulate successful authentication
        # In production, implement: verified = eth_utils.verify_signature(message, signature, address)
        verified = true # Replace with actual signature verification
        
        if verified
          # Find or create user
          user = User.find_by(ethereum_address: address)
          if user.nil?
            user = User.create!(ethereum_address: address)
          end
          
          # Generate JWT token (would require JWT gem in real implementation)
          token = generate_token(user)
          
          # Clear the nonce
          session.delete(:auth_nonce)
          
          render json: { 
            token: token,
            user: {
              id: user.id,
              ethereum_address: user.ethereum_address,
              username: user.username
            }
          }
        else
          render json: { error: 'Invalid signature' }, status: :unauthorized
        end
      end
      
      private
      
      def generate_token(user)
        # In real implementation, use JWT gem
        # payload = {
        #   user_id: user.id,
        #   exp: 24.hours.from_now.to_i
        # }
        # JWT.encode(payload, ENV['JWT_SECRET'], 'HS256')
        
        # For MVP, just return a sample token
        "sample_token_#{user.id}_#{Time.now.to_i}"
      end
    end
  end
end 
module Api
  module V1
    class BaseController < ApplicationController
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActionController::ParameterMissing, with: :bad_request
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
      
      private
      
      def not_found
        render json: { error: 'Record not found' }, status: :not_found
      end
      
      def bad_request
        render json: { error: 'Bad request' }, status: :bad_request
      end
      
      def unprocessable_entity(exception)
        render json: { error: exception.record.errors.full_messages.join(', ') }, status: :unprocessable_entity
      end
    end
  end
end 
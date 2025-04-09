Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  namespace :api do
    namespace :v1 do
      # Authentication
      post 'auth/challenge', to: 'auth#challenge'
      post 'auth/authenticate', to: 'auth#authenticate'
      
      # Users
      resources :users, only: [:show, :update]
      get 'users/:id/balance/check', to: 'users#check_balance'
      
      # Listings
      resources :listings do
        resources :listing_images, only: [:index, :create]
      end
      resources :listing_images, only: [:destroy]
      
      # Transactions
      resources :transactions, only: [:index, :show, :create, :update]
      get 'user/:user_id/transactions', to: 'transactions#user_transactions'
      post 'transactions/verified', to: 'transactions#create_verified'
      
      # Disputes
      resources :disputes, only: [:index, :show, :create, :update]
    end
  end
end

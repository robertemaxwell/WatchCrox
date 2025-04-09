class User < ApplicationRecord
  has_many :listings, foreign_key: 'seller_id', dependent: :destroy
  has_many :purchases, class_name: 'Transaction', foreign_key: 'buyer_id'
  has_many :sales, class_name: 'Transaction', foreign_key: 'seller_id'
  
  validates :ethereum_address, presence: true, uniqueness: true
end

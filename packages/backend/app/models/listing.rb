class Listing < ApplicationRecord
  belongs_to :seller, class_name: 'User'
  has_many :listing_images, dependent: :destroy
  has_many :transactions, dependent: :nullify
  
  validates :title, :description, :price, :condition, :brand, :model, :currency, presence: true
  validates :price, numericality: { greater_than: 0 }
  validates :currency, inclusion: { in: %w[ETH USDC] }
  validates :condition, inclusion: { in: %w[New LikeNew Used Fair Poor] }
end

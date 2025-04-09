class Transaction < ApplicationRecord
  belongs_to :listing
  belongs_to :buyer, class_name: 'User'
  belongs_to :seller, class_name: 'User'
  has_one :dispute, foreign_key: 'tx_id', dependent: :destroy
  
  validates :escrow_id, presence: true, uniqueness: true
  validates :status, presence: true, inclusion: { in: %w[AWAITING_PAYMENT FUNDED AWAITING_DELIVERY DELIVERED DISPUTED RESOLVED] }
  validates :asset_type, presence: true, inclusion: { in: %w[ETH USDC] }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  
  # Ensure buyer and seller are different users
  validate :different_buyer_and_seller
  
  private
  
  def different_buyer_and_seller
    if buyer_id == seller_id
      errors.add(:buyer_id, "can't be the same as seller")
    end
  end
end

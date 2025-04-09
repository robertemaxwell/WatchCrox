class Dispute < ApplicationRecord
  belongs_to :tx, class_name: 'Transaction'
  
  validates :reason, presence: true
  validates :status, presence: true, inclusion: { in: %w[OPEN RESOLVED] }
  validates :resolution, inclusion: { in: %w[BUYER_WINS SELLER_WINS] }, allow_nil: true
  
  # Ensure resolution is present when status is RESOLVED
  validate :resolution_required_when_resolved
  
  private
  
  def resolution_required_when_resolved
    if status == 'RESOLVED' && resolution.blank?
      errors.add(:resolution, "can't be blank when status is RESOLVED")
    end
  end
end

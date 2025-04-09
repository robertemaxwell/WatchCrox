class ListingImage < ApplicationRecord
  belongs_to :listing
  
  validates :ipfs_uri, presence: true
end

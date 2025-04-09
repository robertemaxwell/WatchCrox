# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Clear existing data
puts 'Clearing existing data...'
Dispute.destroy_all
Transaction.destroy_all
ListingImage.destroy_all
Listing.destroy_all
User.destroy_all

# Create users
puts 'Creating users...'
seller1 = User.create!(
  ethereum_address: '0x1234567890123456789012345678901234567890',
  username: 'watch_collector'
)

seller2 = User.create!(
  ethereum_address: '0x2345678901234567890123456789012345678901',
  username: 'vintage_timepieces'
)

buyer1 = User.create!(
  ethereum_address: '0x3456789012345678901234567890123456789012',
  username: 'watch_enthusiast'
)

buyer2 = User.create!(
  ethereum_address: '0x4567890123456789012345678901234567890123',
  username: 'luxury_buyer'
)

admin = User.create!(
  ethereum_address: '0x9876543210987654321098765432109876543210',
  username: 'admin_user'
)

# Create listings
puts 'Creating listings...'
listing1 = Listing.create!(
  title: 'Rolex Submariner Date',
  description: 'Mint condition Rolex Submariner Date ref. 126610LN with box and papers. Purchased in 2022.',
  price: 12000.00,
  condition: 'LikeNew',
  brand: 'Rolex',
  model: 'Submariner Date',
  currency: 'ETH',
  seller: seller1
)

listing2 = Listing.create!(
  title: 'Omega Speedmaster Professional',
  description: 'Omega Speedmaster Professional "Moonwatch" ref. 310.30.42.50.01.001. Hesalite crystal version with manual wind movement.',
  price: 5000.00,
  condition: 'Used',
  brand: 'Omega',
  model: 'Speedmaster Professional',
  currency: 'USDC',
  seller: seller1
)

listing3 = Listing.create!(
  title: 'Vintage Seiko 6139-6005 "Pogue"',
  description: 'Rare vintage Seiko 6139-6005 "Pogue" chronograph in yellow dial. Famous for being worn in space by Colonel William Pogue.',
  price: 2500.00,
  condition: 'Fair',
  brand: 'Seiko',
  model: '6139-6005',
  currency: 'ETH',
  seller: seller2
)

listing4 = Listing.create!(
  title: 'Grand Seiko SBGA211 "Snowflake"',
  description: 'Grand Seiko SBGA211 "Snowflake" with Spring Drive movement. Titanium case and bracelet with stunning textured white dial.',
  price: 4800.00,
  condition: 'New',
  brand: 'Grand Seiko',
  model: 'SBGA211',
  currency: 'USDC',
  seller: seller2
)

# Create listing images
puts 'Creating listing images...'
ListingImage.create!(
  listing: listing1,
  ipfs_uri: 'ipfs://Qm123456789abcdefghijklmnopqrstuvwxyz123/rolex1.jpg'
)

ListingImage.create!(
  listing: listing1,
  ipfs_uri: 'ipfs://Qm123456789abcdefghijklmnopqrstuvwxyz124/rolex2.jpg'
)

ListingImage.create!(
  listing: listing2,
  ipfs_uri: 'ipfs://Qm123456789abcdefghijklmnopqrstuvwxyz125/omega1.jpg'
)

ListingImage.create!(
  listing: listing3,
  ipfs_uri: 'ipfs://Qm123456789abcdefghijklmnopqrstuvwxyz126/seiko1.jpg'
)

ListingImage.create!(
  listing: listing4,
  ipfs_uri: 'ipfs://Qm123456789abcdefghijklmnopqrstuvwxyz127/grandseiko1.jpg'
)

# Create transactions
puts 'Creating transactions...'
tx1 = Transaction.create!(
  escrow_id: 'escrow_123456789abcdef',
  listing: listing1,
  buyer: buyer1,
  seller: seller1,
  status: 'FUNDED',
  asset_type: 'ETH',
  amount: 12000.00
)

tx2 = Transaction.create!(
  escrow_id: 'escrow_234567890abcdef',
  listing: listing2,
  buyer: buyer2,
  seller: seller1,
  status: 'DELIVERED',
  asset_type: 'USDC',
  amount: 5000.00
)

tx3 = Transaction.create!(
  escrow_id: 'escrow_345678901abcdef',
  listing: listing3,
  buyer: buyer2,
  seller: seller2,
  status: 'DISPUTED',
  asset_type: 'ETH',
  amount: 2500.00
)

# Create disputes
puts 'Creating disputes...'
Dispute.create!(
  tx: tx3,
  reason: 'Watch condition is worse than described. Several scratches on case and crystal.',
  status: 'OPEN'
)

puts 'Seed data created successfully!'

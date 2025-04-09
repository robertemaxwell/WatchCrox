class CreateListingImages < ActiveRecord::Migration[8.0]
  def change
    create_table :listing_images do |t|
      t.string :ipfs_uri
      t.references :listing, null: false, foreign_key: true

      t.timestamps
    end
  end
end

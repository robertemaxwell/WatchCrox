class CreateListings < ActiveRecord::Migration[8.0]
  def change
    create_table :listings do |t|
      t.string :title
      t.text :description
      t.decimal :price
      t.string :condition
      t.string :brand
      t.string :model
      t.string :currency
      t.references :seller, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end

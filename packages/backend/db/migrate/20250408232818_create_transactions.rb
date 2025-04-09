class CreateTransactions < ActiveRecord::Migration[8.0]
  def change
    create_table :transactions do |t|
      t.string :escrow_id
      t.references :listing, null: false, foreign_key: true
      t.references :buyer, null: false, foreign_key: { to_table: :users }
      t.references :seller, null: false, foreign_key: { to_table: :users }
      t.string :status
      t.string :asset_type
      t.decimal :amount

      t.timestamps
    end
  end
end

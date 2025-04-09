class CreateDisputes < ActiveRecord::Migration[8.0]
  def change
    create_table :disputes do |t|
      t.references :tx, null: false, foreign_key: { to_table: :transactions }
      t.text :reason
      t.string :status
      t.string :resolution
      t.text :resolution_notes

      t.timestamps
    end
  end
end

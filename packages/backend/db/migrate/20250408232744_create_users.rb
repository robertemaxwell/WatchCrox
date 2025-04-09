class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :ethereum_address
      t.string :username

      t.timestamps
    end
  end
end

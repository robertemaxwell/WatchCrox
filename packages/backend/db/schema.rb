# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_04_08_232828) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "disputes", force: :cascade do |t|
    t.bigint "tx_id", null: false
    t.text "reason"
    t.string "status"
    t.string "resolution"
    t.text "resolution_notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tx_id"], name: "index_disputes_on_tx_id"
  end

  create_table "listing_images", force: :cascade do |t|
    t.string "ipfs_uri"
    t.bigint "listing_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["listing_id"], name: "index_listing_images_on_listing_id"
  end

  create_table "listings", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.decimal "price"
    t.string "condition"
    t.string "brand"
    t.string "model"
    t.string "currency"
    t.bigint "seller_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["seller_id"], name: "index_listings_on_seller_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.string "escrow_id"
    t.bigint "listing_id", null: false
    t.bigint "buyer_id", null: false
    t.bigint "seller_id", null: false
    t.string "status"
    t.string "asset_type"
    t.decimal "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["buyer_id"], name: "index_transactions_on_buyer_id"
    t.index ["listing_id"], name: "index_transactions_on_listing_id"
    t.index ["seller_id"], name: "index_transactions_on_seller_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "ethereum_address"
    t.string "username"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "disputes", "transactions", column: "tx_id"
  add_foreign_key "listing_images", "listings"
  add_foreign_key "listings", "users", column: "seller_id"
  add_foreign_key "transactions", "listings"
  add_foreign_key "transactions", "users", column: "buyer_id"
  add_foreign_key "transactions", "users", column: "seller_id"
end

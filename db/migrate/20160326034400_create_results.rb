class CreateResults < ActiveRecord::Migration
  def change
    create_table :results do |t|
      t.float :correctness
      t.integer :review_id

      t.timestamps null: false
    end
  end
end

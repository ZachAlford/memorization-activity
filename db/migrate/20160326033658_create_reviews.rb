class CreateReviews < ActiveRecord::Migration
  def change
    create_table :reviews do |t|
      t.string :rtype

      t.timestamps null: false
    end
  end
end

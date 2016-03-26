class AddDetailsToReview < ActiveRecord::Migration
  def change
    add_reference :reviews, :result, index: true, foreign_key: true
  end
end

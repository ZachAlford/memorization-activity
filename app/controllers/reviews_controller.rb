class ReviewsController < ApplicationController
  def index
      @review = Review.new
      @review.rtype = 'abc'
      @result = @review.results.build
      @result.correctness = 0.0
  end
end

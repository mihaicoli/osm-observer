import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Review } from '../types/review';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.sass']
})
export class ReviewListComponent implements OnInit, OnChanges {
  @Input()
  id: number;

  reviews: Review[];

  constructor(private reviewService: ReviewService) {
    reviewService.refreshReviews$.subscribe(e => this.getReviews());
  }

  assignReviews(reviews: Review[]) {
    this.reviews = reviews;
  }

  getReviews(): void {
    this.reviewService.getReviews(this.id)
                      .then(reviews => this.assignReviews(reviews))
                      // TODO define onError actions
                      .catch(error => {});
  }

  ngOnChanges(changes: SimpleChanges) {
    this.id = changes['id'].currentValue;
    this.getReviews();
  }

  ngOnInit() {
    this.getReviews();
  }

}

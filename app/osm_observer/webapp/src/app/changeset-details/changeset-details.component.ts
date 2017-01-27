import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {TranslateService} from 'ng2-translate';

import { Changeset } from '../types/changeset';
import { ReviewStatus } from '../types/review';
import { ChangesetService } from '../services/changeset.service';
import { ReviewService } from '../services/review.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'changeset-details',
  templateUrl: './changeset-details.component.html',
  styleUrls: ['./changeset-details.component.sass']
})
export class ChangesetDetailsComponent implements OnInit {
  @Input() id: number;

  prevChangeset: Changeset;
  currentChangeset: Changeset;
  nextChangeset: Changeset;

  reviewStatus = ReviewStatus;

  private endOfListReachedText: string;


  constructor(private changesetService: ChangesetService,
              private reviewService: ReviewService,
              private router: Router,
              private route: ActivatedRoute,
              private messageService: MessageService,
              private translate: TranslateService) { }

  getChangeset(id: number): void {
    this.changesetService.getChangeset(id, true)
                         .then(changeset => this.currentChangeset = changeset)
                         // TODO define onError actions
                         .catch(error => {});
  }

  next() {
    if(this.nextChangeset !== undefined) {
      this.router.navigate(['changesets', this.nextChangeset.osmId, 'details'])
    }
  }

  prev() {
    if(this.prevChangeset !== undefined) {
      this.router.navigate(['changesets', this.prevChangeset.osmId, 'details'])
    }
  }

  ngOnInit() {
    this.translate.get('END OF LIST REACHED').subscribe((res: string) => {
      this.endOfListReachedText = res;
    });
    this.reviewService.refreshReviews$
        .subscribe(e => {
          if(this.nextChangeset !== undefined) {
            this.router.navigate(['changesets', this.nextChangeset.osmId, 'details'])
          } else {
            this.messageService.add(this.endOfListReachedText, 'info');
            this.router.navigate(['/changesets']);
          }
        });
    this.route.data
        .subscribe((data: {changeset: Changeset}) => {
          this.currentChangeset = data.changeset;
          this.prevChangeset = this.changesetService.getPrevChangeset(this.currentChangeset);
          this.nextChangeset = this.changesetService.getNextChangeset(this.currentChangeset);
        });
  }
}

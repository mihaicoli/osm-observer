import { Component, OnInit } from '@angular/core';

import { Coverage } from '../types/coverage';
import { CoverageService } from '../services/coverage.service'

@Component({
  selector: 'coverage-list',
  templateUrl: './coverage-list.component.html',
  styleUrls: ['./coverage-list.component.sass']
})
export class CoverageListComponent implements OnInit {

  coverages: Coverage[];

  constructor(private coverageService: CoverageService) { }

  assignCoverages(coverages: Coverage[]) {
    this.coverages = coverages;
  }

  getCoverages(): void {
    this.coverageService.getCoverages()
                        .then(coverages => this.assignCoverages(coverages))
                        // TODO define onError actions
                        .catch(error => {});
  }

  applyChanges(): void {
    let activeCoverageIds: number[] = [];
    for(let coverage of this.coverages) {
      if(coverage.active) {
        activeCoverageIds.push(coverage.id);
      }
    }
    this.coverageService.setActiveCoverages(activeCoverageIds)
                        .then(v => {
                          this.getCoverages();
                        })
                        // TODO define onError actions
                        .catch(error => {});
  }

  cancelChanges(): void {
    this.getCoverages();
  }

  ngOnInit() {
    this.getCoverages();
  }

}

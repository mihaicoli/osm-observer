import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ChangesetChange } from '../types/changeset-change';
import { ChangesetDetails } from '../types/changeset-details';
import { ChangesetDetailsService } from '../services/changeset-details.service';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';


@Component({
  selector: 'changeset-tags-compare',
  templateUrl: './changeset-map.component.html',
  styleUrls: ['./changeset-map.component.sass']
})
export class ChangesetMapComponent implements OnChanges {

  @Input() changeset: ChangesetDetails;
  @Input() key: string;
  @Input() prevKey: string;
  @Input() type: string;
  combinedTags = {};
  constructor(private changesetDetailsService: ChangesetDetailsService) { }

  assignChangesets(changeset: ChangesetDetails, type: string, key: string, prevKey: string) {
    let tags = changeset.elements[type][key].tags;
    let combinedTags = {};

    for (let tag in tags) {
        combinedTags[tag] = {
          'currentValue': tags[tag],
          'prevValue': ''
        };
    }

    if (prevKey) {
        let prevTags = changeset.elements[type][key].tags;
        for (let tag in prevTags) {
            if (tag in combinedTags) {
                combinedTags[tag]['prevValue'] = prevTags[tag]  
            } else {
                combinedTags[tag] = {
                  'currentValue': '',
                  'prevValue': tags[tag]
                };
            }
        }

    }
    this.combinedTags = combinedTags;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeset = changes['changeset'].currentValue;
    this.key = changes['key'].currentValue;
    this.prevKey = changes['prevKey'].currentValue
    this.type = changes['type'].currentValue
    this.assignChangesets(this.changeset, this.type, this.key, this.prevKey);
  }
}

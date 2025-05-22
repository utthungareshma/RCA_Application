import { TestBed } from '@angular/core/testing';

import { NewFolderService } from './new-folder.service';

describe('NewFolderService', () => {
  let service: NewFolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewFolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

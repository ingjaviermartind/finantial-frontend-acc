import { TestBed } from '@angular/core/testing';

import { ClientsState } from './clients-state.js';

describe('ClientsStateTs', () => {
  let service: ClientsState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientsState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

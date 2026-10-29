import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ItemService } from './item.service';

describe('ItemService', () => {
  let service: ItemService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ItemService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request the item list from the api items endpoint', () => {
    service.getAll().subscribe();

    const req = httpTestingController.expectOne('http://localhost:8080/api/items');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

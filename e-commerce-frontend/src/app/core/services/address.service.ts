import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../constants/api-endpoints';
import { Address, AddressCreate, AddressUpdate } from '../models/address.model';

/** Mirrors app/routers/address_router.py exactly. */
@Injectable({ providedIn: 'root' })
export class AddressService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Address[]> {
    return this.http.get<Address[]>(ApiEndpoints.addresses.list);
  }

  create(payload: AddressCreate): Observable<Address> {
    return this.http.post<Address>(ApiEndpoints.addresses.create, payload);
  }

  update(addressId: number, payload: AddressUpdate): Observable<Address> {
    return this.http.put<Address>(ApiEndpoints.addresses.update(addressId), payload);
  }

  delete(addressId: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.addresses.delete(addressId));
  }
}
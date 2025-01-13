import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminQueue {
  id: number;
  ownerId: number;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminQueueService {
  private readonly apiUrl = 'http://localhost:9090/admin';

  constructor(private http: HttpClient) {}

  getAdminQueues(): Observable<AdminQueue[]> {
    return this.http.get<AdminQueue[]>(this.apiUrl + "/queue");
  }

  addToQueue(id: number | undefined) {
    console.log(`${this.apiUrl}/addToQueue?id=${id}`)
    return this.http.post(`${this.apiUrl}/addToQueue?id=${id}`, JSON.stringify({ }))
  }
  approve(id: number | undefined) {
    console.log(`${this.apiUrl}/addToQueue?id=${id}`)
    return this.http.post(`${this.apiUrl}/set?id=${id}`, JSON.stringify({ }))
  }
  reject(id: number | undefined) {
    console.log(`${this.apiUrl}/addToQueue?id=${id}`)
    return this.http.post(`${this.apiUrl}/reject?id=${id}`, JSON.stringify({ }))
  }
}

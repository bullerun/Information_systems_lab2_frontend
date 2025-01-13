import {Component, OnInit} from '@angular/core';
import {AdminQueue, AdminQueueService} from '../_service/admin.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {IfAuthenticatedDirective} from '../../shared/directives/if-authenticated.directive';
import {UserService} from '../_service/user.service';
import {Observable} from 'rxjs';
import { IfAdminRoleDirective} from '../../shared/directives/if-admin.directive';

@Component({
  selector: 'app-admin-queue',
  templateUrl: './admin-queue.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    IfAuthenticatedDirective,

    IfAdminRoleDirective
  ]
})
export class AdminQueueTableComponent implements OnInit {
  adminQueues: AdminQueue[] = [];
  isLoading = true;
  public isAdmin: Observable<boolean>;

  constructor(private adminQueueService: AdminQueueService, private userService: UserService) {
    this.isAdmin = userService.isAdmin
  }
  fetch(){
    this.adminQueueService.getAdminQueues().subscribe({
      next: (data) => {
        this.adminQueues = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }
  ngOnInit(): void {
    this.fetch()
  }

  wantAdmin() {
    this.adminQueueService.addToQueue(this.userService.user?.id).subscribe({
      next: () => {
        alert("Заявка создана")
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  approve(queue: AdminQueue) {
    this.adminQueueService.approve(queue.ownerId).subscribe({
      next: () => {
        this.fetch()
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  reject(queue: AdminQueue) {
    this.adminQueueService.reject(queue.ownerId).subscribe({
      next: () => {
        this.fetch()
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}

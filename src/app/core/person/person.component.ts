import {Color, Country, Person} from '../models/person.model';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {PersonService} from '../_service/person.service';
import {UserService} from '../_service/user.service';
import {IfAuthenticatedDirective} from '../../shared/directives/if-authenticated.directive';

import {RxStompService} from '@stomp/ng2-stompjs';
import {WebSocketService} from '../_service/websocket.service';
import {ZipUploadComponent} from '../layout/zip-upload/zip-upload.component';

@Component({
  selector: 'app-person-table',
  templateUrl: './person.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    IfAuthenticatedDirective,
    ZipUploadComponent
  ],
  providers: [WebSocketService, RxStompService],
  styleUrls: ["./edit.css"]
})
export class PersonComponent implements OnInit {
  persons: Person[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';
  sortProperty: 'id' | 'name' | 'eyeColor' | 'hairColor' | 'location' | 'weight' | 'nationality' | 'owner_id' = 'id';
  page = 0;
  pageSize: 5 | 10 | 25 = 10;

  isEditModalOpen = false;

  colors = Object.values(Color);
  countries = Object.values(Country);

  personForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    protected userService: UserService,
    private webSocketService: WebSocketService,
  ) {
    this.personForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(1)]],
      eyeColor: ['', Validators.required],
      hairColor: ['', Validators.required],
      weight: [0, [Validators.required, Validators.min(0.1)]],
      location: this.fb.group({
        name: ['', Validators.required],
        x: [0, Validators.required],
        y: [0, Validators.required],
      }),
      nationality: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.webSocketService.subscribeToPersonUpdates().subscribe((update) => {
      console.log(update)
      if (update.name) {
        const index = this.persons.findIndex((person) => person.id === update.id);
        console.log(index)
        console.log(update);
        console.log(update.id);
        if (index !== -1) {
          this.persons[index] = update;
        }
      } else {
        this.persons = this.persons.filter((person) => person.id !== update.id);
      }
    });
    this.fetchPersons();
  }

  fetchPersons(): void {
    this.personService.getPersons(this.sortDirection, this.sortProperty, this.page, this.pageSize)
      .subscribe({
        next: (data) => {
          this.persons = data;
        },
        error: (err) => {
          alert(err["error"]["error"]);
        }
      });
  }

  openEditModal(person: Person): void {
    this.personForm.patchValue(person);
    this.isEditModalOpen = true;
  }

  addPerson(): void {
    this.personForm.reset()
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.personForm.reset();
    this.isEditModalOpen = false;
  }

  saveChanges(): void {
    const personData = this.personForm.value;

    if (personData.id) {
      this.personService.editPerson(personData).subscribe({
        next: () => {
          this.fetchPersons();
        },
        error: (err) => {
          console.error(err);
          alert(err.error.weight);
        },
      });
    } else {
      this.personService.addPerson(personData).subscribe({
        next: () => {
          this.fetchPersons();
        },
        error: (err) => {
          console.error(err);
          alert(err.error.weight);
        },
      });
    }

    this.closeEditModal();
  }

  deletePerson(person: Person): void {
    this.personService.deletePerson(person.id).subscribe({
      next: () => {
        this.fetchPersons();
      },
      error: (err) => {
        alert(err["error"]["error"]);
      }
    });
  }
  decrementPage() {
    this.page -= this.page > 0 ? 1 : 0;
    this.fetchPersons();
  }

  incrementPage() {
    this.page += 1;
    this.fetchPersons();
  }

  debugForm() {
    console.log('Статус формы:', this.personForm.status);
    console.log('Ошибки формы:', this.personForm.errors);
    Object.keys(this.personForm.controls).forEach(controlName => {
      const control = this.personForm.get(controlName);
      console.log(`Поле ${controlName}:`, {
        value: control?.value,
        status: control?.status,
        errors: control?.errors,
      });
    });
  }
}

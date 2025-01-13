import {Component, OnInit} from "@angular/core";
import {UserService} from "../_service/user.service";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {IfAuthenticatedDirective} from "../../shared/directives/if-authenticated.directive";
import {MovieService} from '../_service/movie.service';
import {Person} from '../models/person.model';
import {Movie} from '../models/movie';
import {FormsModule} from '@angular/forms';
import {MovieFormComponent} from './form/movie-form.component';
import {WebSocketService} from '../_service/websocket.service';
import {RxStompService} from '@stomp/ng2-stompjs';
import {ZipUploadComponent} from '../layout/zip-movie-upload/zip-upload.component';


@Component({
  selector: "app-movie",
  templateUrl: "./movie.component.html",
  imports: [
    RouterLinkActive,
    RouterLink,
    AsyncPipe,
    NgIf,
    IfAuthenticatedDirective,
    FormsModule,
    NgForOf,
    MovieFormComponent,
    ZipUploadComponent,
  ],
  providers: [WebSocketService, RxStompService],
  standalone: true,
  styleUrls: ["./edit.css"]
})
export class MovieComponent implements OnInit {
  movies: Movie[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';
  sortProperty: 'id' | 'name' | 'goldenPalmCount' | 'genre' | 'length' | 'coordinates' | 'mpaaRating' | 'owner_id' | 'budget' | 'oscarsCount' | 'director' | 'operator' = 'id';
  page = 0;
  pageSize: 5 | 10 | 25 = 10
  isShow = false;
  personToShow: any = null;
  isOpen = false
  selectedMovie: any | null = null;

  constructor(
    protected readonly userService: UserService,
    private readonly movieService: MovieService,
    private webSocketService: WebSocketService
  ) {
  }

  ngOnInit(): void {
    this.webSocketService.subscribeToMovieUpdates().subscribe((update) => {
      if (update.action === 'deleted') {
        this.movies = this.movies.filter((movie) => movie.id !== update.id);
      } else {
        const index = this.movies.findIndex((movie) => movie.id === update.id);
        if (index !== -1) {
          this.movies[index] = update;
        }
      }
    });
    this.fetchMovie()

  }


  fetchMovie(): void {
    this.movieService.getMovie(this.sortDirection, this.sortProperty, this.page, this.pageSize)
      .subscribe({
        next: (data) => {
          this.movies = data;
        },
        error: (err) => {
          alert(err["error"]["error"]);
        }
      });
  }


  decrementPage() {
    this.page -= this.page > 0 ? 1 : 0;
    this.fetchMovie();
  }

  incrementPage() {
    this.page += 1;
    this.fetchMovie();
  }

  addMovie() {
    this.selectedMovie = null
    this.isOpen = true;
  }

  showPerson(person: Person): void {
    this.isShow = true
    this.personToShow = person
  }

  closeShow() {
    this.isShow = false;
  }

  saveMovie(movie: Movie): void {
    console.log('Сохраненные данные:', movie);

    if (movie.id) {
      this.movieService.editMovie(movie).subscribe({
        next: () => {
          this.fetchMovie()
        }, error: (err) => {
          console.log(err)
          alert(err)
        }
      })
    } else {
      this.movieService.addMovie(movie).subscribe({
        next: () => {
          this.fetchMovie();
        },
        error: (err) => {
          console.error(err);
          alert(err.error.weight);
        },
      });
    }


    this.isOpen = false;
  }

  deletePerson(movie: Movie) {
    this.movieService.deleteMovie(movie).subscribe({
      next: () => {
        this.fetchMovie();
      }, error: (err) => {
        console.error(err);
        alert(err.error.weight);
      },
    })
  }

  openEditModal(movie: any): void {
    this.selectedMovie = movie;
    this.isOpen = true;
  }
}

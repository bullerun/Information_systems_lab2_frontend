import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-zip-movie-upload',
  templateUrl: './zip-upload.component.html',
  styleUrls: ['./zip-upload.component.css'],
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  standalone: true
})
export class ZipUploadComponent {
  zipForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.zipForm = this.fb.group({
      zipFile: [null, Validators.required],
    });
  }

  // Обработка выбора файла
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log(`Selected file: ${file.name}`);
      this.zipForm.patchValue({zipFile: file});
      this.zipForm.get('zipFile')?.updateValueAndValidity();
    }
  }


  onSubmit(): void {
    if (this.zipForm.valid) {
      const formData = new FormData();
      const file = this.zipForm.get('zipFile')?.value;

      if (file) {
        formData.append('file', file);
      }
      this.zipForm.reset();
      this.http.post('http://localhost:9090/movie/upload', formData).subscribe({
        next: () => {
          alert('File uploaded successfully!');
        },
        error: (err) => {
          console.log(err);
          alert(err.error.error);
          console.log(err.error.goldenPalmCount)
        },
      });
    }
  }
}



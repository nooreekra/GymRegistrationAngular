import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { NgToastService } from 'ng-angular-popup';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-create-registration',
  templateUrl: './create-registration.component.html',
  styleUrls: ['./create-registration.component.scss'],
})
export class CreateRegistrationComponent implements OnInit {
  public packages: string[] = ['Monthly', 'Quarterly', 'Yearly'];
  public genders: string[] = ['Male', 'Female'];
  public importantList: string[] = [
    'Toxic Fat reduction',
    'Energy and Endurance',
    'Building Lean Muscle',
    'Healthier Digestive System',
    'Sugar Craving Body',
    'Fitness',
  ];

  public registrationForm!: FormGroup;
  public userIdToUpadte!: number;
  public isUpdateActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastService: NgToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      mobile: [''],
      weight: [''],
      height: [''],
      bmi: [''],
      bmiResult: [''],
      gender: [''],
      requireTrainer: [''],
      package: [''],
      important: [''],
      haveGymBefore: [''],
      enquiryDate: [''],
    });

    this.registrationForm.controls['height'].valueChanges.subscribe((res) => {
      this.calculateBMI(res);
    });

    this.activatedRoute.params.subscribe((val) => {
      this.userIdToUpadte = val['id'];
      if (this.userIdToUpadte) {
        this.isUpdateActive = true;
        this.api.getRegisteredUserId(this.userIdToUpadte).subscribe({
          next: (res) => {
            this.fillFormToUpdate(res);
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    });
  }

  submit() {
    this.api.postRegistration(this.registrationForm.value).subscribe((res) => {
      this.toastService.success({
        detail: 'Success',
        summary: 'Enquiry Added',
        duration: 3000,
      });
      this.registrationForm.reset();
    });
  }

  update() {
    this.api
      .updateRegisterUser(this.registrationForm.value, this.userIdToUpadte)
      .subscribe((res) => {
        this.toastService.success({
          detail: 'Success',
          summary: 'Enquiry Updated',
          duration: 3000,
        });
        this.registrationForm.reset();
        this.router.navigate(['list']);
      });
  }

  calculateBMI(heightValue: number) {
    const weight = this.registrationForm.value.height;
    const height = heightValue;
    const bmi = weight / height ** 2;
    this.registrationForm.controls['bmi'].patchValue(bmi);
    switch (true) {
      case bmi < 10.5:
        this.registrationForm.controls['bmiResult'].patchValue('Underweight');
        break;
      case bmi >= 18.5 && bmi < 25:
        this.registrationForm.controls['bmiResult'].patchValue('Normalweight');
        break;
      case bmi > 25 && bmi < 30:
        this.registrationForm.controls['bmiResult'].patchValue('Overweight');
        break;

      default:
        this.registrationForm.controls['bmiResult'].patchValue('Obese');
        break;
    }
  }

  fillFormToUpdate(user: User) {
    this.registrationForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      weight: user.weight,
      height: user.height,
      bmi: user.bmi,
      bmiResult: user.bmiResult,
      gender: user.gender,
      requireTrainer: user.requireTrainer,
      package: user.package,
      important: user.important,
      haveGymBefore: user.haveGymBefore,
      enquiryDate: user.enquiryDate,
    });
  }
}

import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';
import { Services } from '../../services/services';

@Component({
  selector: 'app-evaluador-financiero',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './evaluador-financiero.html',
  styleUrl: './evaluador-financiero.scss',
})

export class EvaluadorFinanciero implements OnInit {
  form!: FormGroup;
  departments: any[] = [];
  municipalities: any[] = [];
  services: any [] = [];
  loadingServices = false;
  showResults = false;
  loadingCalculation = false;
  selectedMunicipality: any = null;
  
  constructor(
    private fb: FormBuilder,
    private departmentService : Department,
    private municipalityService : Municipality,
    private servicesService : Services,
    private cdr : ChangeDetectorRef
  ){}


  ngOnInit(): void {
    this.form = this.fb.group({
      department: [''],
      municipality: [{ value: '', disabled: true }],
      bandwidth: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      contractTime:[
        null,
        [
          Validators.required,
          Validators.min(1) 
        ]
      ],
      sensitivity: [null]
    });

    this.loadDepartments();

    // this.form.get('municipality')?.valueChanges.subscribe(value => {
    //   console.log('Municipio seleccionado:', value);
    // });

  }

  get canShowResults(): boolean {
    return !!this.selectedMunicipality &&
      this.form.controls['bandwidth'].valid &&
      this.form.controls['contractTime'].valid;
  }

  loadDepartments(){
    this.departmentService.getDepartments()
      .subscribe(data => {
        this.departments = [...data].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        this.cdr.detectChanges();
      });
  }

  onDepartmentChange(event : Event) {
    const deptId = (event.target as HTMLSelectElement).value;
    this.selectedMunicipality = null;
    this.form.patchValue({
      municipality:''
    });
    
    if(!deptId) {
      this.municipalities = [];
      this.form.get('municipality')?.disable();
      return;
    }

    this.municipalityService.getByDepartment(deptId)
      .subscribe(data => {
        this.municipalities = [...data].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        this.form.get('municipality')?.enable();
      });
  }

  onMunicipalityChange(event: Event) {
    const municipalityId =
      (event.target as HTMLSelectElement).value;
    this.selectedMunicipality =
      this.municipalities.find(
        m => m.id === municipalityId
      );
      this.services = []
      this.loadingServices = true;
      this.showResults = false;
      console.log(this.loadingServices);
      this.servicesService.getByMunicipality(municipalityId).subscribe({
        next: data => {
          this.services = [...data];
          this.loadingServices = false;
          this.cdr.detectChanges();
          console.log(this.services);
        },
        error : err => {
          this.loadingServices = false;
          console.error(err)
        }
      });
  }

  calculate() : void {
    this.showResults = true;
  }

}
//
// EOF
//
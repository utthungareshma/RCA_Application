import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
interface CQAsorKPIsData {
  CQAsorKPIs: string;
  LowerBound: string;
  UpperBound: string;
  Target: string;
}
@Component({
  selector: 'app-cqalist',
  templateUrl: './cqalist.component.html',
  styleUrls: ['./cqalist.component.scss'],
})
export class CqalistComponent {
  displayedColumns: string[] = ['CQAsorKPIs', 'LowerBound', 'UpperBound', 'Target', 'Delete'];
  dataSource = new MatTableDataSource<CQAsorKPIsData>([]);
  formattedOption: any;
  @Output() applyClicked = new EventEmitter<MatTableDataSource<CQAsorKPIsData>>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CqalistComponent>) {
    this.dataSource = new MatTableDataSource<CQAsorKPIsData>(this.getDefaultRows(data.someInputData));
    console.log("28", data.cqalist);
    console.log("26", this.dataSource.filteredData);
  }
  ngOnInit() {
    this.getCQAsorKPIsOptions();
  }



  getDefaultRows(cqaData: any[]): CQAsorKPIsData[] {
    return cqaData.map(item => ({
      CQAsorKPIs: item.Cqa_kpi,
      LowerBound: item.Lower_bound || null,
      UpperBound: item.Upper_bound || null,
      Target: item.Target_value || '',
    }));
  }
  calculateDialogHeight(itemCount: number): string {
    const defaultRowHeight = 78;
    const maxHeight = 1000;
    const calculatedHeight = Math.min(itemCount * defaultRowHeight + 160, maxHeight);

    return calculatedHeight + 'px';
  }
  getCQAsorKPIsOptions(): CqaDetails[] {
    const formattedOptions: CqaDetails[] = this.data.cqalist.map((option: any) => ({
      Product: "0",
      Cqa_kpi: option.Cqa_kpi.name,
      Lower_bound: 0,
      Upper_bound: 0,
      Target_value: 0,
      Batch: 0,
      GB: 0
    }));
    this.formattedOption = formattedOptions;
    return this.formattedOption;
  }

  getLowerBoundOptions(selectedCQAsorKPIs: string): string[] {
    switch (selectedCQAsorKPIs) {
      case 'Aeration rate(Fg:L/h)':
        return ['1', '2', '3', '4', '5'];
      case 'Sugar Rate':
        return ['5', '10', '15', '20', '25'];
      case 'Acid Rate':
        return ['3', '5', '7', '9', '10'];
      default:
        return [];
    }
  }

  getUpperBoundOptions(selectedCQAsorKPIs: string): string[] {
    switch (selectedCQAsorKPIs) {
      case 'Aeration rate(Fg:L/h)':
        return ['6', '7', '8', '9', '10'];
      case 'Sugar Rate':
        return ['30', '40', '50', '60', '70'];
      case 'Acid Rate':
        return ['15', '20', '25', '30', '35'];
      default:
        return [];
    }
  }

  getTargetOptions(selectedCQAsorKPIs: string): string[] {
    switch (selectedCQAsorKPIs) {
      case 'Aeration rate(Fg:L/h)':
        return ['10', '20', '30', '40', '50'];
      case 'Sugar Rate':
        return ['60', '70', '80', '90', '100'];
      case 'Acid Rate':
        return ['25', '30', '35', '40', '45'];
      default:
        return [];
    }
  }

  addRow(): void {
    this.dataSource.data.push({ CQAsorKPIs: '', LowerBound: '', UpperBound: '', Target: '' });
    this.dataSource._updateChangeSubscription();
    console.log("98", this.dataSource.data);
  }

  applyChanges(): void {
    console.log("102", this.dataSource);
    this.applyClicked.emit(this.dataSource);
    this.dialogRef.close();
  }
  deleteRow(row: CQAsorKPIsData): void {
    const index = this.dataSource.data.indexOf(row);
    if (index !== -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
    }
  }
  closePopup(): void {
    this.dialogRef.close();
  }
}
interface CqaDetails {
  Product: string;
  Cqa_kpi: string;
  Lower_bound?: number;
  Upper_bound?: number;
  Target_value?: number | string;
  Batch?: number | string;
  GB?: number | string;
}

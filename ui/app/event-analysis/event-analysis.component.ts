import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { EventAnalysisService } from './event-analysis.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CqalistComponent } from '../cqalist/cqalist.component';
import { MatTableDataSource } from '@angular/material/table';
import { DataVaultService } from '../data-vault/data-vault.service';
interface CQAsorKPIsData {
  CQAsorKPIs: string;
  LowerBound: string;
  UpperBound: string;
  Target: string;
}
declare let Plotly: any;
interface Food {
  value: string;
  viewValue: string;
}
interface Data {
  name: string;
  code: string;
}
interface CQA {
  name: string;
  code: string;
}
interface CPP {
  name: string;
  code: string;
}
interface BatchIDColumn {
  name: string;
  code: string;
}
interface BatchID {
  name: string;
  code: string;
}
interface Time {
  name: string;
  code: string;
}
interface ExcludedCPP {
  name: string;
}
interface Batchreference {
  name: string;
}
@Component({
  selector: 'app-event-analysis',
  templateUrl: './event-analysis.component.html',
  styleUrls: ['./event-analysis.component.scss'],
})
export class EventAnalysisComponent implements OnInit {
  myForm: FormGroup;
  token: any;
  selected = 'Bioreactor';
  selectedbatchID = 2;
  Data: any;
  selectedData: Data | any;
  CQA: any;
  CPP: any;
  Recipe: any;
  ProductBatch: any;
  BatchIDColumn: any;
  BatchID: any;
  Time: any;
  private graph: any;
  private myPlot: any;
  httpHeader: any;
  cpp_array: any = [];
  cpp_values: any;
  selectedCPP: any;
  DeviationforGoldenBatch: any;
  selectedBatchID: any;
  selectedTime: any;
  selectedRecipe: any;
  selectedProductBatch: any;
  refresh: Boolean = false;
  cqaval: any = [];
  resultList: any;
  ShowdeviationtoGoldenBatch: any;
  filteredResultList: any;
  selectedBatchReference: any;
  selectedBatchIDvalue: any;
  selectedCQAValue: any;
  selectedCQAThresholdValue: any;
  eventAnalysisData: any;
  selectedBatchIDValue: any;
  selectedBatchColvalue: any;
  selectedCppValue: any;
  CQAThresholdMin: any;
  selectedCQAList: any;
  successResponse = false;
  response: any[] = [];
  fileData: any;
  folderData: any;
  disableModel: boolean = false;
  showCQAandKPITable = false;
  isLoader: boolean = false;
  displayedColumns: string[] = ['CQAsorKPIs', 'LowerBound', 'UpperBound', 'Target'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]); // Initialize with an empty array
  userName: any;
  selectedFolderName: any;
  selectedFileName: string[] = [];
  scrollable: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public eventAnalysisService: EventAnalysisService,
    private dialog: MatDialog,
    public router: Router,
    private dataVaultService: DataVaultService
  ) {
    this.token = JSON.parse(localStorage.getItem('token') || '{}');
    this.userName = JSON.parse(localStorage.getItem('username') || '{}');
    this.httpHeader = { Authorization: `Token ${this.token}` };
    ShowdeviationtoGoldenBatch: 'no';
    this.myForm = this.formBuilder.group({
      folder: ['', Validators.required],
      files: ['', Validators.required],
      cqa: ['', Validators.required],
      cpp_list: ['', Validators.required],
      batch_column: ['', Validators.required],
      batch_id: ['', Validators.required],
      batch_product: ['', Validators.required],
      recipe: ['',],
      time_column: ['', Validators.required],
      DeviationforGoldenBatch: '',
    });
  }
  excludedCPP: ExcludedCPP[] = [
    { name: 'Time (h)' },
    { name: 'Batch reference(Batch_ref:Batch ref)' },
    { name: 'Time' },
  ];
  excludedTime: ExcludedCPP[] = [{ name: 'Time (h)' }, { name: 'Time' }];
  batchReference: Batchreference[] = [
    { name: 'Batch reference(Batch_ref:Batch ref)' },
  ];
  gridsize: number = 30;
  updateSetting(event: any) {
    this.gridsize = event.value;
  }
  sliderValue: number = 0;
  onSliderChange(event: Event) {
    this.sliderValue = (event.target as HTMLInputElement).valueAsNumber;
  }
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
  trace0!: any[];
  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  ngOnInit() {
    this.getFolderList();
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    if (!token || Object.keys(token).length === 0) {
      this.router.navigate(['login']);
    }
    this.eventAnalysisData = JSON.parse(
      localStorage.getItem('eventAnalysisData') || '{}'
    );
    this.selectedFolderName = this.eventAnalysisData.folder_name;
    this.selectedFileName = this.eventAnalysisData.file_names;
    this.getFilesList(this.selectedFolderName);
    this.selectedCQAValue = this.eventAnalysisData.cqa_list;
    this.selectedBatchIDValue = this.eventAnalysisData.batch_id;
    this.selectedCppValue = this.eventAnalysisData.cpp_list;
    this.selectedBatchColvalue = this.eventAnalysisData.batch_column;
    this.selectedTime = this.eventAnalysisData.time_column;
    if (this.eventAnalysisData.file_name == null) {
      this.ShowdeviationtoGoldenBatch = 'no';
    }
    this.myForm.get('batch_product')?.valueChanges.subscribe((batchProduct) => {
      if (batchProduct !== undefined && batchProduct !== null) {
        this.onBatchChange();
      }
    });
  }
  getFiles() {
    const test = this.eventAnalysisService.getFiles(
      this.token,
      (result: any) => {
        let array = [];
        for (const iterator of result.data) {
          if (iterator != 'synres_dataset.csv') {
            let jsonData = {
              name: iterator,
            };
            array.push(jsonData);
          }
        }
        this.Data = array;
      }
    );
  }
  getColumnHeaders(event: any) {
    localStorage.setItem('latestfilename', event);
    const selectedValue = event;
    let body = {
      "username": this.userName,
      "select_folder": this.myForm.get('folder')?.value,
      "files_to_read": this.myForm.get('files')?.value
    }
    const test = this.eventAnalysisService.getColumnHeaders(
      this.token,
      body,
      (result: any) => {
        let array = [];
        for (const iterator of result.unique_headers) {
          let jsonData = {
            name: iterator,
          };
          array.push(jsonData);
        }
        this.resultList = array;
        this.Time = this.filterAndSortCQAandCPP(array);
        const filteredbatch = this.resultList.filter(
          (item1: { name: any }) =>
            !this.excludedTime.some(
              (item2: { name: any }) => item1.name === item2.name
            )
        );
        if (this.myForm.get('folder')?.value.toLowerCase().includes('bio')) {
          this.selectedBatchIDvalue = filteredbatch.find(
            (x: { name: string }) =>
              x.name === 'Batch reference(Batch_ref:Batch ref)'
          ).name;
          this.getColumnValues('Batch reference(Batch_ref:Batch ref)');
        }
        else if (this.myForm.get('folder')?.value.toLowerCase().includes('syn')) {
          this.selectedBatchIDvalue = filteredbatch.find(
            (x: { name: string }) =>
              x.name === 'Batch_reference'
          ).name;
          this.getColumnValues('Batch_reference');
        }
        this.BatchIDColumn = this.filterAndSortCQAandCPP(filteredbatch);
        this.filteredResultList = this.resultList.filter(
          (item1: { name: any }) =>
            !this.excludedCPP.some(
              (item2: { name: any }) => item1.name === item2.name
            )
        );
        this.CQA = this.filterAndSortCQAandCPP(this.filteredResultList);
        this.CPP = this.filterAndSortCQAandCPP(this.filteredResultList);
      }
    );
  }
  filterAndSortCQAandCPP(fields: any[]): any[] {
    const sortedData = fields.sort((a, b) => a.name.localeCompare(b.name));
    return sortedData;
  }
  getColumnValues(value: any) {
    this.selectedData = localStorage.getItem('latestfilename') || '{}';
    let body = {
      "username": this.userName,
      "select_folder": this.myForm.get('folder')?.value,
      "files_to_read": this.myForm.get('files')?.value,
      "column_name": this.myForm.get('batch_column')?.value
    }
    const test = this.eventAnalysisService.getColumnValues(
      this.token,
      body,
      (result: any) => {
        let array = [];
        for (const iterator of result.column_values) {
          let jsonData = {
            name: iterator,
          };
          array.push(jsonData);
        }
        this.BatchID = array;
        this.getColumnValueBatchProduct(this.BatchID)
      }
    );
  }
  getColumnValueBatchProduct(value: any) {
    this.selectedData = localStorage.getItem('latestfilename') || '{}';
    let body = {
      "username": this.userName,
      "select_folder": this.myForm.get('folder')?.value,
      "files_to_read": this.myForm.get('files')?.value,
      "Batch_reference": this.myForm.get('batch_id')?.value
    }
    const test = this.eventAnalysisService.getBatchProduct(
      this.token,
      body,
      (result: any) => {
        let array = [];
        for (const iterator of result) {
          let jsonData = {
            name: iterator,
          };
          array.push(jsonData);
        }
        this.ProductBatch = array;
        if (this.ProductBatch.length > 0) {
          this.myForm.get('batch_product')?.setValue(this.ProductBatch[0].name);
          this.onBatchChange()
        }
      }
    );
  }
  onBatchChange() {
    const batchId = this.myForm.get('batch_id')?.value;
    const batchProduct = this.myForm.get('batch_product')?.value;
    if (batchId || (batchProduct !== undefined && batchProduct !== null)) {
      this.getColumnValueRecipe();
    }
  }
  getColumnValueRecipe() {
    this.selectedData = localStorage.getItem('latestfilename') || '{}';
    const body = {
      "username": this.userName,
      "select_folder": this.myForm.get('folder')?.value,
      "files_to_read": this.myForm.get('files')?.value,
      "Product": this.myForm.get('batch_product')?.value,
      "Batch_reference": this.myForm.get('batch_id')?.value
    };
    const test = this.eventAnalysisService.getRecipeColumnValues(
      this.token,
      body,
      (result: any) => {
        let array = [];
        for (const iterator of result) {
          let jsonData = {
            name: iterator,
          };
          array.push(jsonData);
        }
        this.Recipe = array;
        if (this.Recipe.length > 0) {
          this.myForm.get('recipe')?.setValue(this.Recipe[0].name);
        }
      }
    );
  }
  setCPP(e: any) {
    this.cqaval = [];
    let jsonData = {
      name: e.value,
    };
    this.cqaval.push(jsonData);
    const arr1 = this.filteredResultList;
    this.selectedCQAList = jsonData;
    const result = arr1.filter(
      (item1: { name: any }) =>
        !this.cqaval.some((item2: { name: any }) => item1.name === item2.name)
    );
    this.CPP = this.filterAndSortCQAandCPP(result);
  }
  calculateGoldenBatch() {
    const formData = this.myForm.value;
    const cqaList: string[] = this.myForm.get('cqa')?.value || [];
    this.isLoader = true;
    const df_cqa_threshold = {
      cqa: [] as string[],
      lower_bound: [] as number[],
      upper_bound: [] as (number | null)[],
      target_value: [] as string[],
    };
    this.response.forEach(item => {
      const lowerBound = parseFloat(item.LowerBound);
      const upperBound = item.UpperBound !== null ? parseFloat(item.UpperBound) : null;
      df_cqa_threshold.cqa.push(item.CQAsorKPIs);
      df_cqa_threshold.lower_bound.push(Number.isNaN(lowerBound) ? -99999 : lowerBound);
      df_cqa_threshold.upper_bound.push(upperBound !== null ? upperBound : 99999);
      df_cqa_threshold.target_value.push(item.Target);
    });
    this.myForm.get('cqa')?.setValue(df_cqa_threshold.cqa);
    let body =
    {
      "username": this.userName,
      "folder_name": this.myForm.get('folder')?.value.replace(/\/$/, ''),
      "file_names": this.myForm.get('files')?.value,
      "batch_id": this.myForm.get('batch_id')?.value,
      "cqa_list": df_cqa_threshold.cqa,
      df_cqa_threshold,
      "cpp_list": this.myForm.get('cpp_list')?.value,
      "batch_column": this.myForm.get('batch_column')?.value,
      "time_column": this.myForm.get('time_column')?.value,
    }
    localStorage.setItem('eventAnalysisData', JSON.stringify(body));
    this.selectedBatchID = this.myForm.get('batch_id')?.value;
    localStorage.setItem('selectedBatchID', this.myForm.get('batch_id')?.value);
    localStorage.setItem('selectedFolderName', this.myForm.get('folder')?.value.replace(/\/$/, ''));
    localStorage.setItem('selectedFileName', this.myForm.get('files')?.value);
    this.selectedFolderName = this.myForm.get('folder')?.value.replace(/\/$/, '');
    this.selectedFileName = this.myForm.get('files')?.value;
    this.ShowdeviationtoGoldenBatch = 'yes';
    localStorage.setItem('formValues', this.myForm.value);
    const selectedCqaDetails = this.eventAnalysisService.getdf_CqaDetailsForKpiList(this.myForm.get('cqa')?.value);
    const test = this.eventAnalysisService.compareBatchWithGb(
      this.token,
      body,
      (result: any) => {
        const productId = '40059';
        const formattedChartData = this.transformChartData(result.df_cqa, productId);
        this.isLoader = false;
        this.createBarChart(formattedChartData);
        localStorage.setItem(
          'eventAnalysisServiceresult',
          JSON.stringify(result)
        );
        this.cpp_array = result.df_cpp_drill_down.cpp_name;
        this.cpp_values = this.cpp_array;
        this.refresh = true;
        this.DeviationforGoldenBatch =
          'Deviation to Golden Batch ' + result.cqa_deviation.toFixed(2) + '%';
        let array = [];
        var trace1 = {
          x: result.time_list.map(
            (element: number) => element * result.time_step
          ),
          y: result.batch_list[0],
          customdata: result.index_list,
          name: 'CQA Batch',
          type: 'scatter',
          hovertemplate:
            'Time(h): %{x}<br>CQA Batch: %{y}<br>Record ID: %{customdata}',
          hoverlabel: { bgcolor: 'ffff' },
        };
        var trace2 = {
          x: result.time_list.map(
            (element: number) => element * result.time_step
          ),
          y: result.gb_list[0],
          customdata: result.index_list,
          name: 'CQA GB',
          type: 'scatter',
          hovertemplate:
            'Time(h): %{x}<br>CQA GB: %{y}<br>Record ID: %{customdata}',
          hoverlabel: { bgcolor: 'ffff' },
        };
        var data = [trace1, trace2];
        var layout = {
          paper_bgcolor: 'rgb(199 213 236)', 
          title: 'Deviation Analysis',
          yaxis: {
            title: {
              text: this.myForm.get('cqa')?.value[0],
              standoff: 20,
            },
          },
          tickformat: '.2f',
          xaxis: { title: 'Time (h)', tickformat: '.2f' },
          yaxis2: {
            titlefont: { color: 'rgb(148, 103, 189)' },
            tickfont: { color: 'rgb(148, 103, 189)' },
            tickformat: '.2f',
            overlaying: 'y',
            side: 'left',
          },
          shapes: [
            {
              type: 'line',
              xref: 'paper',
              x0: 0,
              y0: 0,
              x1: 1,
              y1: 0,
              line: {
                color: 'FF664F',
                width: 4,
                dash: 'dash',
              },
            },
          ],
        };
        if (this.myForm.get('folder')?.value.toLowerCase().includes('bio')) {
          this.scrollable = true;
          Plotly.newPlot('plot', data, layout);
        }
      }
    );
  }
  onTabChanged(event: any, e: any) {
    const result = JSON.parse(
      localStorage.getItem('eventAnalysisServiceresult') || '{}'
    );
    const lengthOfDeviationToGb = Object.keys(result.df_cpp_deviation.deviation_to_gb).length;
    if (event.index == 1 && this.myForm.get('batch_id')?.value) {
      let barWidth: any = [];
      for (
        var i = 1;
        i <= Object.keys(result.df_cpp_deviation.deviation_to_gb).length;
        i++
      ) {
        barWidth.push(0.4);
      }
      var data2 = [
        {
          type: 'bar',
          x: Object.values(result.df_cpp_deviation.cpp_cqa_name),
          y: Object.values(result.df_cpp_deviation.deviation_to_gb),
          width: barWidth,
          marker: {
            color: '#0077FF',
          },
          hoverlabel: { bgcolor: 'ffff' },
        },
      ];
      var layout2 = {
        width: 1000,
        margin: {
          b: 300,
        },
        height: 700,
        title: 'Contribution to deviation of golden batch',
        paper_bgcolor: 'rgb(199, 213, 236)',
        xaxis: {
          tickangle: -45,
          tickfont: {
            size: 15,
          },
          margin: {
            b: 300,
          },
        },
      };
      this.graph = {
        data: data2,
        layout: layout2,
      };
      setTimeout(() => {
        Plotly.newPlot('plt', data2, layout2).then((gd: any) => {
          this.myPlot = gd;
          this.myPlot.on('plotly_click', (event: any) => {
            this.refresh = false;
            e.selectedIndex = 2;
            this.selectedCPP = event.points[0].x;
            setTimeout(() => {
              if (this.selectedCPP) {
                this.drilldownplot(this.selectedCPP);
              }
            }, 2000);
          });
        });
      }, 1000);
    }
    if (event.index == 2 && this.myForm.get('batch_id')?.value) {
      this.eventAnalysisData = JSON.parse(
        localStorage.getItem('eventAnalysisData') || '{}'
      );
      this.selectedCppValue = this.eventAnalysisData.cpp_list;
      if (this.selectedCPP === undefined) {
        this.selectedCPP = this.selectedCppValue[0];
        setTimeout(() => {
          this.drilldownplot(this.selectedCPP);
        }, 2000);
      } else if (this.refresh == true) {
        this.selectedCPP = this.selectedCppValue[0];
        setTimeout(() => {
          this.drilldownplot(this.selectedCPP);
        }, 1000);
        this.refresh = false;
      }
    }
  }
  drilldownplot(event: any) {
    if (typeof event === 'string') {
      var x = event;
    } else {
      x = event.value;
    }
    const result1 = JSON.parse(
      localStorage.getItem('eventAnalysisServiceresult') || '{}'
    );
    const cppNameValues = Object.values(result1.df_cpp_drill_down.cpp_name).findIndex(value => value === x);
    const dataDrillDown = [
      {
        x: result1.time_list.map(
          (element: number) => element * result1.time_step
        ),
        y: Object.values(result1.df_cpp_drill_down.cpp_data)[
          cppNameValues
        ],
        type: 'line',
      },
    ];
    var trace1 = {
      x: result1.time_list.map(
        (element: number) => element * result1.time_step
      ),
      y: Object.values(result1.df_cpp_drill_down.cpp_data)[
        cppNameValues
      ],
      name: 'Batch ' + this.myForm.get('batch_id')?.value,
      type: 'scatter',
      hovertemplate: 'Time(h): %{x}<br>Batch: %{y}',
      hoverlabel: { bgcolor: 'ffff' },
      marker: {
        color: '#0077FF',
      },
    };

    var trace2 = {
      x: result1.time_list.map(
        (element: number) => element * result1.time_step
      ),
      y: Object.values(result1.df_cpp_drill_down.cpp_gb_upper_bound)[
        cppNameValues
      ],
      name: 'Upper Bound',
      type: 'scatter',
      hovertemplate: 'Time(h): %{x}<br>Upper Bound: %{y}',
      hoverlabel: { bgcolor: 'ffff' },
      marker: {
        color: '#FF664F',
      },
    };

    var trace3 = {
      x: result1.time_list.map(
        (element: number) => element * result1.time_step
      ),
      y: Object.values(result1.df_cpp_drill_down.cpp_gb_lower_bound)[
        cppNameValues
      ],
      name: 'Lower Bound',
      hovertemplate: 'Time(h): %{x}<br>Lower Bound: %{y}',
      type: 'scatter',
      hoverlabel: { bgcolor: 'ffff' },
      marker: {
        color: '#89E047',
      },
    };

    var trace4 = {
      x: result1.time_list.map(
        (element: number) => element * result1.time_step
      ),
      y: Object.values(result1.df_cpp_drill_down.cpp_gb_data)[
        cppNameValues
      ],
      name: 'Golden Batch',
      hovertemplate: 'Time(h): %{x}<br>Golden: %{y}',
      type: 'scatter',
      hoverlabel: { bgcolor: 'ffff' },
      marker: {
        color: '#FFDA19',
      },
    };

    var data = [trace1, trace2, trace3, trace4];
    var layout = {
      title: 'Event Analysis of Golden Batch',
      paper_bgcolor: 'rgb(199, 213, 236)',
      yaxis: {
        title: {
          text: x,
          standoff: 20,
        },
      },
      xaxis: { title: 'Time (h)' },
      yaxis2: {
        titlefont: { color: 'rgb(148, 103, 189)', size: 40 },
        tickfont: { color: 'rgb(148, 103, 189)' },
        overlaying: 'y',
        side: 'right',
      },
    };

    Plotly.newPlot('drillDownPlot1', data, layout);
  }

  uploadFile(): void {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      width: '50%',
    });
  }
  openPopup(): void {
    const calculatedHeight = this.calculateDialogHeight(this.myForm.get('cqa')?.value.length);
    const selectedCqaDetails: CqaDetails[] = this.myForm.get('cqa')?.value.map((cqa_kpi: string) => ({
      Product: "0",
      Cqa_kpi: cqa_kpi,
      Lower_bound: 0,
      Upper_bound: 0
    }));
    if (this.response) {
      selectedCqaDetails.forEach(selectedCqa => {
        const matchingResponse = this.response.find(responseItem => responseItem.CQAsorKPIs === selectedCqa.Cqa_kpi);
        if (matchingResponse) {
          selectedCqa.Lower_bound = +matchingResponse.LowerBound;
          selectedCqa.Upper_bound = +matchingResponse.UpperBound;
        }
      });
    }
    const allCqaDetails: CqaDetails[] = this.resultList.map((cqa_kpi: string) => ({
      Product: "0",
      Cqa_kpi: cqa_kpi,
      Lower_bound: 0,
      Upper_bound: 0
    }));
    const dialogData = {
      someInputData: selectedCqaDetails,
      cqalist: allCqaDetails
    };
    const dialogRef = this.dialog.open(CqalistComponent, {
      width: '1100px',
      data: dialogData,
    });

    dialogRef.componentInstance.applyClicked.subscribe((updatedDataSource: MatTableDataSource<CQAsorKPIsData>) => {
      this.dataSource = updatedDataSource;
      this.successResponse = true;
      this.response = this.dataSource.data;
      this.onApplyClicked();

      const df_cqa = {
        cqa: [] as string[]
      };
      this.response.forEach(item => {
        df_cqa.cqa.push(item.CQAsorKPIs);
      });
      this.myForm.get('cqa')?.setValue(df_cqa.cqa);
    });
  }
  onApplyClicked() {
    this.showCQAandKPITable = true;
  }
  calculateDialogHeight(itemCount: number): string {
    const defaultRowHeight = 78;
    const maxHeight = 1000;
    const calculatedHeight = Math.min(itemCount * defaultRowHeight + 160, maxHeight);
    return calculatedHeight + 'px';
  }
  getColumnMinMax(e: any) {
    this.selectedData = localStorage.getItem('latestfilename') || '{}';
    let body = {
      project: this.selectedData,
      column_names: [e.value],
    };
    this.eventAnalysisService.ColumnMinMaxValue(
      this.token,
      body,
      (result: any) => {
        Object.keys(result).forEach((key: string) => {
          const columnName = key;
          const minValue = result[key].min;
          const maxValue = result[key].max;
          this.myForm
            .get('cqa_threshold')
            ?.setValidators([
              Validators.min(minValue),
              Validators.max(maxValue),
            ]);
          this.myForm.get('cqa_threshold')?.updateValueAndValidity();
        });
      }
    );
  }
  getFolderList() {
    let body = {
      "username": this.userName
    }
    this.dataVaultService.getFolderList(this.token, body, (result: any) => {
      this.folderData = result.folders.map((folderName: string) => folderName.replace('/', ''));
    })
  }
  getFilesList(folderName: any) {
    let body = {
      username: this.userName,
      select_folder: folderName
    }
    this.dataVaultService.getFileList(this.token, body, (result => {
      this.fileData = result.files;
      this.getColumnHeaders(this.selectedFileName)
    }))
  }
  onFolderSelection() {
    this.selectedFolderName = this.myForm.get('folder')?.value;
    if (this.selectedFolderName) {
      this.getFilesList(this.selectedFolderName);
    }
  }
  createBarChart(chartData: any[]): void {
    chartData.forEach(entry => {
      let divisor = 1;
      let notation = '';
      if (entry.Lower_bound === -99999 || entry.Upper_bound === 99999) {
        entry.Lower_bound = 0;
        entry.Upper_bound = 0;
        entry.Batch = 0;
        entry.GB = 0;
      }
      else {
        if (entry.Lower_bound >= 1000) {
          divisor = 1000;
          notation = ' (divided by 1000)';
        } else if (entry.Lower_bound >= 100) {
          divisor = 100;
          notation = ' (divided by 100)';
        } else if (entry.Lower_bound >= 10) {
          divisor = 10;
          notation = ' (divided by 10)';
        }
        entry.Lower_bound /= divisor;
        entry.Upper_bound /= divisor;
        entry.Batch /= divisor;
        entry.GB /= divisor;
      }
      entry.BatchText = `Batch: ${entry.Batch.toFixed(2)}${notation}`;
      entry.GBText = `GB: ${entry.GB.toFixed(2)}${notation}`;
      entry.LBText = `LB: ${entry.Lower_bound.toFixed(2)}${notation}`;
      entry.UBText = `UB: ${entry.Upper_bound.toFixed(2)}${notation}`;
    });
    const trace1 = {
      x: chartData.map(entry => entry.Cqa_kpi),
      y: chartData.map(entry => entry.Batch),
      type: 'bar',
      name: 'Batch',
      text: chartData.map(entry => entry.BatchText),
      hoverinfo: 'text',
      textposition: 'auto',
      marker: {
        color: '#4473c5',
      },
    };
    const trace2 = {
      x: chartData.map(entry => entry.Cqa_kpi),
      y: chartData.map(entry => entry.GB),
      type: 'bar',
      name: 'GB',
      text: chartData.map(entry => entry.GBText),
      hoverinfo: 'text',
      textposition: 'auto',
      marker: {
        color: '#ec7e31',
      },
    };
    const trace3 = {
      x: chartData.map(entry => entry.Cqa_kpi),
      y: chartData.map(entry => entry.Lower_bound),
      type: 'bar',
      name: 'Lower Bound',
      text: chartData.map(entry => entry.LBText),
      hoverinfo: 'text',
      textposition: 'auto',
      bargap: 0.1,
      marker: {
        color: '#a5a5a5',
      },
    };
    const trace4 = {
      x: chartData.map(entry => entry.Cqa_kpi),
      y: chartData.map(entry => entry.Upper_bound),
      type: 'bar',
      name: 'Upper Bound',
      text: chartData.map(entry => entry.UBText),
      hoverinfo: 'text',
      textposition: 'auto',
      marker: {
        color: '#ffc000',
      },
    };
    const layout = {
      paper_bgcolor: 'rgb(199, 213, 236)',
      background:'#222e3c',
      barmode: 'group',
      title: 'CQA Details',
      xaxis: { title: 'CQA or KPI' },
      yaxis: { title: 'Values' },
      bargap: 0.2,
      annotations: [
        {
          x: 1.15,
          y: 0.6,
          xref: 'paper',
          yref: 'paper',
          text: 'Notations:',
          showarrow: false,
        },
        {
          x: 1.15,
          y: 0.5,
          xref: 'paper',
          yref: 'paper',
          text: 'LB >= 1000: CQA / 1000',
          showarrow: false,
        },
        {
          x: 1.15,
          y: 0.4,
          xref: 'paper',
          yref: 'paper',
          text: 'LB >= 100: CQA / 100',
          showarrow: false,
        },
        {
          x: 1.15,
          y: 0.3,
          xref: 'paper',
          yref: 'paper',
          text: 'LB >= 10: CQA / 10',
          showarrow: false,
        },
      ],
    };
    const data = [trace1, trace2, trace3, trace4];
    const config = {
      responsive: true,
    };
    Plotly.newPlot('barChart', data, layout, config);
  }
  transformChartData(chartData: any, productId: string): ChartDataEntry[] {
    const cqaKeys = Object.keys(chartData.cqa);
    const formattedChartData: ChartDataEntry[] = [];
    cqaKeys.forEach((key) => {
      const entry: ChartDataEntry = {
        Product: productId,
        Cqa_kpi: chartData.cqa[key],
        Lower_bound: chartData.lower_bound[key],
        Upper_bound: chartData.upper_bound[key],
        Batch: chartData.Batch[key],
        GB: chartData.GB[key],
      };
      formattedChartData.push(entry);
    });
    return formattedChartData;
  }
}
interface ChartDataEntry {
  Product: string;
  Cqa_kpi: string;
  Lower_bound: number;
  Upper_bound: number;
  Batch: number;
  GB: number;
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
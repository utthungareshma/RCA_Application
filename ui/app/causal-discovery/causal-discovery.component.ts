import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Data, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { CausalDiscoveryService } from './causal-discovery.service';
import { MatTableDataSource } from '@angular/material/table';
import { DataVaultService } from '../data-vault/data-vault.service';
import { EventAnalysisService } from '../event-analysis/event-analysis.service';

declare let Plotly: any
interface TopFeatues {
  value: string;
  viewValue: string;
}
interface ModalType {
  value: string;
  viewValue: string;
}
interface EstimatedMethods {
  value: string;
  viewValue: string;
}
interface Refute {
  value: string;
  viewValue: string;
}
interface DObject {
  [key: string]: number;
}
interface ExcludedData {
  name: string
}
@Component({
  selector: 'app-causal-discovery',
  templateUrl: './causal-discovery.component.html',
  styleUrls: ['./causal-discovery.component.scss']
})
export class CausalDiscoveryComponent implements OnInit {
  typControl: FormControl = new FormControl('regression');
  base64Image1!: string;
  disabled = false;
  showTicks = false;
  thumbLabel = false;
  myForm: FormGroup;
  causalForm: FormGroup;
  sliderForm: FormGroup;
  PredictedPenicillinConcentrationForm: FormGroup;
  records: any;
  targets: any;
  InputVariables: any;
  imageUrl!: any;
  selectedFileName!: any;
  selectRecord!: any;
  selectedTarget!: any;
  showImage: boolean = false;
  isLoading: boolean = false;
  causalPlotData: boolean = false;
  selectedCommonCause: any = [];
  selectedTreatment: any = [];
  selectedTargetValues: any = [];
  resultlist: any;
  displayedColumns: string[] = ['feature', 'value', 'impact'];
  dataSource!: MatTableDataSource<any>;
  resultSet: any;
  modelType: any;
  setTargetValue: any;
  filteredResultList: any;
  commonFeatures: any[] = [];
  featuresXPredoriginal: any[] = [];
  getrecordsbody: any;
  debounceTimer: any;
  fileData: any;
  folderData: any;
  recordsID: any;
  modals: ModalType[] = [
    { value: 'classification', viewValue: 'Classification' },
    { value: 'regression', viewValue: 'Regression' }
  ];
  topFeatures: TopFeatues[] = [
    { value: '1', viewValue: '1' },
    { value: '2', viewValue: '2' },
    { value: '3', viewValue: '3' },
    { value: '4', viewValue: '4' },
    { value: '5', viewValue: '5' },
    { value: '6', viewValue: '6' },
  ];
  estimatedMethods: EstimatedMethods[] = [
    { value: 'backdoor.linear_regression', viewValue: 'backdoor.linear_regression' },
    { value: 'backdoor.distance_matching', viewValue: 'backdoor.distance_matching' },
    { value: 'backdoor.propensity_score_stratification', viewValue: 'backdoor.propensity_score_stratification' },
    { value: 'backdoor.propensity_score_weighting', viewValue: 'backdoor.propensity_score_weighting' },
  ]
  refute: Refute[] = [
    { value: 'random_common_cause', viewValue: 'random_common_cause' },
    { value: 'bootstrap_refuter', viewValue: 'bootstrap_refuter' },
    { value: 'data_subset_refuter', viewValue: 'data_subset_refuter' },
  ]
  excludedCPP: ExcludedData[] = [
    { name: 'Time (h)' },
    { name: 'Time' },
    { name: 'Batch reference(Batch_ref:Batch ref)' },
  ]
  excludedtargetValues: ExcludedData[] = [
    { name: 'XXA18902' },
    { name: 'KPV18918' },
    { name: 'KPV18942' },
    { name: 'M73701' },
    { name: 'KPV84318' },
  ]
  selectTargetXXA18902: ExcludedData[] = [
    { name: 'XXA18902' },
  ]
  itemsToExclude = ['Time', 'Recipe', 'BatchID', 'FileID', 'Product', 'KPV18933', 'Batch_reference', 'Viscosity', 'Acid_number', 'Hydroxyl_determ_ polyesters',
    'Water_content', 'Appearance', 'Cycle_time', 'Sample_time_point'];
  token: any;
  Data: any;
  Batch: any;
  CPP: any;
  result: any;
  causes: any;
  treatementLists: any;
  targetVar: any;
  causalTargets: any;
  resultSliderDAta: any;
  calculateButtonEnable: boolean = false;
  batchTargetEnable: boolean = true;
  Target: any;
  selectedData: Data | any;
  loader: boolean = false;
  causalData: any;
  finalSliderValues: any[] = [];
  getcolumnranges: any;
  disableModel: boolean = false;
  disableTargetField: boolean = false;
  targetValue: any;
  isLoader: boolean = false;
  scrollable: boolean = false;
  predictedValue: any;
  selectedTargetValueFromCQA: any;
  selectedCppArrayValues: any;
  eventAnalysisData: any;
  selectedBatchIDValue: any;
  previouscausalData: any
  selectedTopFeatures: any;
  selectedRecordIDValue: any
  selectedCausalDataFile: any
  selectedCausalBatchIDValue: any
  selectedCommonCauses: any
  selectedTreatmentValues: any
  selectedCausalTargetValues: any
  selectedCausalTarget: any
  selectedLearningMethod: any
  selectedRobustnessCheck: any
  XAIData: any
  targetdataset: any
  userName: any;
  selectedTargetData: any;
  isBatchFieldPopulated: boolean = false;
  selectedCauseandTreatment: any;
  commonArray: any;
  causalTargetsValue: any;
  selectedFolderName: any;
  selectedTargetTreatment: any;
  targetData: any;
  constructor(private formBuilder: FormBuilder, public router: Router, private dialog: MatDialog, private causalDiscoveryService: CausalDiscoveryService, private dataVaultService: DataVaultService,
    private eventAnalysisService: EventAnalysisService) {
    this.token = JSON.parse(localStorage.getItem("token") || '{}');
    this.userName = JSON.parse(localStorage.getItem('username') || '{}');
    this.myForm = this.formBuilder.group({
      // project:  ['', Validators.required],
      folder: ['', Validators.required],
      files: ['', Validators.required],
      typ: ['', Validators.required],
      batch: ['',],
      index: ['',],
      target: ['', Validators.required],
      ip: ['', Validators.required],
      num_ft: ['', Validators.required],
      refute: '',
      estimated_effect: '',
      new_effect: '',
      p_value: ''
    });
    this.sliderForm = this.formBuilder.group({
      sugarRate: '',
      ph: '',
      temprature: '',
      pressure: '',
      mixingSpeed: '',
    });
    this.causalForm = this.formBuilder.group({
      selected_batch: ['', Validators.required],
      folder: ['', Validators.required],
      files: ['', Validators.required],
      treatment_list: ['', Validators.required],
      common_causes: ['', Validators.required],
      target_var: ['', Validators.required],
      estimate_method: ['', Validators.required],
      causal_target: ['', Validators.required],
      refute_method: ['', Validators.required],
      PredictedPenicillinConcentration: '',
      refute: '',
      estimated_effect: '',
      new_effect: '',
      p_value: ''
    })
    this.PredictedPenicillinConcentrationForm = this.formBuilder.group({
      PredictedPenicillinConcentration: '',
      target1: ''
    })
  }
  ngOnInit(): void {
    this.getFiles();
    this.loadSessionValues();
    this.getFolderList();
  }
  uploadFile(): void {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      width: '50%',
    });
  }
  fileUpload() {
    this.router.navigate(['/fileUpload'])
  }
  getFiles() {
    const test = this.causalDiscoveryService.getFiles(this.token, (result: any) => {
      let array = [];
      for (const iterator of result.data) {
        let jsonData = {
          "name": iterator
        };
        array.push(jsonData)
      }
      this.Data = array;
    });
  }
  getBatches() {
    let body = {
      username: this.userName,
      select_folder: this.myForm.get('folder')?.value,
      files_to_read: this.myForm.get('files')?.value,
      column_name: ''
    };
    if (body.select_folder.toLowerCase().includes('bio')) {
      body.column_name = 'Batch reference(Batch_ref:Batch ref)';
    } else if (body.select_folder.toLowerCase().includes('syn')) {
      body.column_name = 'Batch_reference';
    }
    this.eventAnalysisService.getColumnValues(this.token, body, (result: any) => {
      let array = [];
      for (const iterator of result.column_values
      ) {
        let jsonData = {
          "name": iterator
        }
        array.push(jsonData)
      }
      this.Batch = array;
      this.getrecordsId();
    })
  }
  bar() {
    const data = [{
      type: 'bar',
      x: [20, 14, -23],
      y: ['Suger Rate', 'ph', 'temp'],
      orientation: 'h'
    }];
    Plotly.newPlot('myDiv', data);
  }
  getrecords(event: any) {
    if (this.myForm.get('project')?.value == "synres_dataset.csv") {
      this.getrecordsbody = {
        "file_name": event
      }
    }
    this.causalDiscoveryService.getRecords(this.token, this.getrecordsbody, (result: any) => {
      let array = [];
      for (const iterator of result.data) {
        let jsonData = {
          "name": iterator
        };
        array.push(jsonData)
      }
      this.records = array;
    });
  }
  getbioRecord(event: any) {
    const selectedValue = event;
    if (this.myForm.get('project')?.value == "BioreactorData.csv") {
      this.getrecordsbody = {
        "file_name": this.myForm.get('project')?.value,
        "batch_id": this.myForm.get('batch')?.value
      }
    }
    else {
      this.getrecordsbody = {
        "file_name": this.myForm.get('project')?.value
      }
    }
    this.causalDiscoveryService.getRecords(this.token, this.getrecordsbody, (result: any) => {
      let array = [];
      for (const iterator of result.data) {
        let jsonData = {
          "name": iterator
        };
        array.push(jsonData)
      }
      this.records = array;
    });
  }
  getTargets(event: any) {
    localStorage.setItem('latestfilename', event);
    const selectedValue = event;
    let body = {
      "file_name": selectedValue
    }
    this.causalDiscoveryService.getTarget(this.token, body, (result: any) => {
      let array = [];
      for (const iterator of result.data) {
        let jsonData = {
          "name": iterator
        };
        array.push(jsonData)
      }
      localStorage.setItem('targetDataset', JSON.stringify(array));
      this.resultSet = array;
      this.targets = this.resultSet.filter((item1: { name: any; }) => !this.excludedCPP.some((item2: { name: any; }) => item1.name === item2.name));
      this.InputVariables = this.resultSet.filter((item1: { name: any; }) => !this.excludedCPP.some((item2: { name: any; }) => item1.name === item2.name));
    });
  }
  setInputVariables(e: any) {
    this.setTargetValue = [];
    let jsonData = {
      "name": e
    };
    this.setTargetValue.push(jsonData);
    this.targetdataset = JSON.parse(localStorage.getItem("targetDataset") || '{}');
    const arr1 = this.targetdataset.filter((item1: { name: any; }) => !this.excludedCPP.some((item2: { name: any; }) => item1.name === item2.name)); //arr1 = tratlist
    this.InputVariables = arr1.filter((item1: { name: any; }) => !this.setTargetValue.some((item2: { name: any; }) => item1.name === item2.name));
  }
  onChangeData(event: any) {
    this.selectRecord = "";
    if (event === "BioreactorData.csv") {
      this.modelType = this.modals.find(modal => modal.value === 'regression')?.value;
      if (this.myForm.get('batch')?.value != null) {
        this.getbioRecord(event);
      }
      this.myForm.get('typ')?.disable();
    } else {
      this.myForm.get('typ')?.enable();
      this.modelType = "";
      this.targetValue = "";
    }
  }

  setTargetForModel() {
    if (this.myForm.get('folder')?.value.toLowerCase().includes('syn') && this.myForm.get('typ')?.value === "classification") {
     // this.targets = this.resultSet.filter((item1: { name: any; }) => !this.excludedCPP.some((item2: { name: any; }) => item1.name === item2.name));
     // this.targets = this.resultSet.filter((item1: { name: any; }) => this.selectTargetXXA18902.some((item2: { name: any; }) => item1.name === item2.name));
      this.targetValue = "XXA18902";
      this.setInputVariables(this.targetValue);
    } else if (this.myForm.get('folder')?.value.toLowerCase().includes('syn') && this.myForm.get('typ')?.value === "regression") {
      this.targets = this.resultSet.filter((item1: { name: any; }) => !this.excludedCPP.some((item2: { name: any; }) => item1.name === item2.name));
      this.targets = this.targets.filter((item1: { name: any; }) => !this.excludedtargetValues.some((item2: { name: any; }) => item1.name === item2.name));
      this.InputVariables = this.resultSet.filter((item1: { name: any; }) => !this.excludedCPP.some((item2: { name: any; }) => item1.name === item2.name));
    }
  }
  getCauses(event: any) {
    localStorage.setItem('latestfilename', event);
    const selectedValue = event;
    let body = {
      "username": this.userName,
      "select_folder": this.causalForm.get('folder')?.value,
      "files_to_read": this.causalForm.get('files')?.value
    }
    this.eventAnalysisService.getColumnHeaders(this.token, body, (result: any) => {
      const causalData = result.unique_headers;
      this.resultlist = causalData;
      this.filteredResultList = this.resultlist.filter((item1: { name: any; }) => !this.excludedCPP.some((item2: { name: any; }) => item1.name === item2.name));
      this.selectedTargetData = this.filterAndSortCQAandCPP(this.filteredResultList);
      this.treatementLists = this.filterAndSortCQAandCPP(this.filteredResultList);
      this.targetVar = this.filterAndSortCQAandCPP(this.filteredResultList);
      this.selectedTargetData = this.filterAndSortCQAandCPP(this.filteredResultList);
    });
  }
  filterAndSortCQAandCPP(inputArray: string[]): string[] {
    return inputArray.sort((a, b) => a.localeCompare(b));
  }
  getSelectedTarget() {
    let body = {
      "username": this.userName,
      "select_folder": this.myForm.get('folder')?.value,
      "files_to_read": this.myForm.get('files')?.value
    }
    this.eventAnalysisService.getColumnHeaders(this.token, body, (result) => {
      this.selectedTargetData = result.unique_headers.filter((item: any) => !this.itemsToExclude.includes(item));
      this.selectedTargetData = this.filterAndSortCQAandCPP(this.selectedTargetData);
    })
  }
  setTreatement(e: any) {
    this.selectedCommonCause = e.value.map((item: any) => ({ name: item.trim().replace(/\r/g, '') }));
    const arr1 = this.selectedTargetData.map((item: any) => item.trim().replace(/\r/g, ''));
    const result = arr1.filter((item1: any) => !this.selectedCommonCause.some((item2: any) => item1 === item2.name));
    this.treatementLists = result;
    this.setTarget(e);
  }
  setTarget(e: any) {
    this.targetData = e.value;
    this.selectedTreatment = e.value.map((item: any) => ({ name: item.trim().replace(/\r/g, '') }));
    const target = this.selectedCommonCause;
    this.selectedCauseandTreatment = this.selectedTreatment.concat(target);
    const arr1 = this.selectedTargetData.map((item: any) => item.trim().replace(/\r/g, ''));;
    const result = arr1.filter((item1: any) => !this.selectedCauseandTreatment.some((item2: any) => item1 === item2.name));
    this.targetVar = result;
    this.commonArray = this.selectedCauseandTreatment;
    this.setCausalTarget(e);
  }
  // setCausalTarget(e: any) {
  //   const causalTargetValue = e.value;
  //   this.causalTargetsValue = Object.values(this.selectedTreatment).concat(Object.values(causalTargetValue));
  // }
  setCausalTarget(e:any)
  {
    this.causalTargetsValue = e.value
    this.selectedTargetTreatment = this.causalTargetsValue.concat(this.targetData);
  }
  calculateXAI() {
    this.getColumnValues();
    this.isLoader = true;
    this.scrollable = true;
    const formData = this.myForm.value;
    let body = formData
    this.myForm.get('project')?.value;
    let body1 = {
      "username": this.userName,
      "folder_name": this.myForm.get('folder')?.value,
      "file_names": this.myForm.get('files')?.value,
      "project": '',
      "typ": this.myForm.get('typ')?.value,
      "batch": this.myForm.get('batch')?.value,
      "target": this.myForm.get('target')?.value,
      "ip": this.myForm.get('ip')?.value,
      "index": this.myForm.get('index')?.value ,
      "num_ft": this.myForm.get('num_ft')?.value
    }
    if (body1.folder_name.toLowerCase().includes('bio')) {
      body1.project = "bioreactor";
    } else if (body1.folder_name.toLowerCase().includes('syn')) {
      body1.project = "synres";
    }
    localStorage.setItem('XAIData', JSON.stringify(body));
    this.commonFeatures = [];
    const test = this.causalDiscoveryService.getXAI(this.token, body1, (result: any) => {
      this.predictedValue = this.myForm.get('target')?.value;
      const featuresData = result.data.features;
      const featuresXPred = result.data.X_pred_list;
      this.featuresXPredoriginal = result.data.X_pred_list;
      this.getWhatIfPredictionValue();
      for (let i = 0; i < featuresData.length; i++) {
        for (let j = 0; j < featuresXPred.length; j++) {
          if (featuresData[i].Feature === featuresXPred[j].Feature) {
            const commonFeature = {
              Feature: featuresXPred[j].Feature,
              Value: featuresXPred[j].Value,
              Min: featuresXPred[j].Min,
              Max: featuresXPred[j].Max,
            };
            this.commonFeatures.push(commonFeature);
            break;
          }
        }
      }
      this.resultSliderDAta = result.data.features;
      this.isLoader = false;
      this.scrollable = true;
      this.dataSource = new MatTableDataSource(this.resultSliderDAta);
      let array: any[] = [];
      for (const iterator of result.data.features) {
        array.push(iterator.Value)
      }
      this.loader = true;
      this.calculateButtonEnable = true;
      let array1 = [];
      for (const iterator of result.data.features) {
        array1.push(iterator.Feature)
      }
      let array2: any[] = [];
      for (const iterator of result.data.explanations) {
        array2.push(iterator.impact
        )
      }
      let array6: any[] = [];
      for (const iterator of result.data.explanations) {
        array6.push(iterator.feature
        )
      }
      this.loader = false;
      this.scrollable = true;
      function getColor(value: number) {
        return value >= 0 ? '#89E047' : '#FF664F';
      }
      const colors = array2.map(value => getColor(value));
      const data = [{
        type: 'bar',
        x: array2,
        y: array6,
        orientation: 'h',
        marker: {
          color: colors
        },
      }
      ];
      const layoutFeature = {
        title: 'Feature Impact Plot',
        paper_bgcolor: '#e5ecf6',
        xaxis: {
          title: ""
        },
        yaxis: {
          title: '',
          automargin: true,
        },
        margin: {
          l: 100,
          r: 50,
          b: 100,
          t: 50,
        },
        annotations: [
          {
            x: 0.495,
            y: -0.15,
            xref: 'paper',
            yref: 'paper',
            text: '<span style="color: #89E047; font-size: 25px;">■</span> Positive',
            showarrow: false,
            font: {
              size: 15,
              color: '#1F1717'
            }
          },
          {
            x: 0.52,
            y: -0.2,
            xref: 'paper',
            yref: 'paper',
            text: '<span style="color: #FF664F; font-size: 25px;">■</span>Negative ',
            showarrow: false,
            font: {
              size: 15,
              color: '#1F1717'
            }
          }
        ],
      };

      Plotly.newPlot('impact', data, layoutFeature);
      if (this.myForm.get('project')?.value == "synres_dataset.csv" && this.myForm.get('typ')?.value == "classification" && this.myForm.get('target')?.value == "XXA18902") {
        const data5 = [{
          type: 'bar',
          x: [result.data.Disagree, result.data.Normal],
          y: ['Disagree', 'Normal'],
          orientation: 'h',
          marker: {
            color: ['#89E047', ' #0077FF']
          }
        }];
        var layoutRegular = {
          title: 'Probability chart',
        };
        Plotly.newPlot('regular', data5, layoutRegular);
      } else {
        const data5 = [{
          type: 'bar',
          x: [result.data.actual_value, result.data.prediction],
          y: ['Actual', 'Predicted'],
          orientation: 'h',
          marker: {
            color: ['#89E047', ' #0077FF']
          }
        }];
        const layoutRegular = {
          title: 'Actual vs Prediction Comparison',
          paper_bgcolor: '#e5ecf6',
          yaxis: {
            automargin: true,
            tickmode: 'auto',
            tickvals: ['Actual', 'Predicted'],
            ticktext: ['Actual', 'Predicted'],
            tickangle: 0,
            ticklen: 10,
            tickwidth: 2,
            tickcolor: '#ffff',
          },
        };
        Plotly.newPlot('regular', data5, layoutRegular);
      }
    });
  }
  getCausal() {
    this.loader = true;
    this.clearPlot();
    const formData = this.causalForm.value;
    let body = formData
    localStorage.setItem('causalData', JSON.stringify(body));
    let bodyCausal =
    {
      "username": this.userName,
      "folder_name": this.causalForm.get('folder')?.value,
      "file_names": this.causalForm.get('files')?.value,
      "selected_batch": this.causalForm.get('selected_batch')?.value,
      "treatment_list": this.causalForm.get('treatment_list')?.value,
      "common_causes": this.causalForm.get('common_causes')?.value,
      "target_var": this.causalForm.get('target_var')?.value,
      "causal_target": this.causalForm.get('causal_target')?.value,
      "estimate_method": this.causalForm.get('estimate_method')?.value,
      "refute_method": this.causalForm.get('refute_method')?.value,
    }
    this.isLoading = true;
    this.causalDiscoveryService.getCausalgraph(this.token, bodyCausal, (result: any) => {
      this.isLoading = false;
      this.causalPlotData = true;
      const plotData = result.plot.data
      this.causalData = result;
      this.causalForm.get('refute')?.setValue(result.data.refute);
      this.causalForm.get('estimated_effect')?.setValue(result.data.estimated_effect);
      this.causalForm.get('new_effect')?.setValue(result.data.new_effect);
      this.causalForm.get('p_value')?.setValue(result.data.p_value);
      const plotLayout = result.plot.layout
      plotLayout.xaxis = {
        range: [-2, 2],
        showticklabels: false
      };
      plotLayout.yaxis = {
        range: [-2, 2],
        showticklabels: false
      };
      plotLayout.autosize = true;
      const config = { responsive: true };
      Plotly.newPlot("plotDiv", plotData, plotLayout);
    })
  }
  clearPlot() {
    Plotly.purge("plotDiv");
    this.causalPlotData = false;
  }
  getColumnValues() {
    let body = {
      "file_name": this.selectedData,
      "column_name": this.targetValue,
      "row_index": this.selectRecord
    }
    this.myForm.get('file_name')?.value;
    this.causalDiscoveryService.getColumnValues(this.token, body, (result: any) => {
      const x = this.myForm.get('target1')?.setValue(result.data);
      const y = this.PredictedPenicillinConcentrationForm.get('target1')?.setValue(result.data);
    });
  }
  setselectedFileNameFields(event: any) {
    this.selectedFileName = event;
  }
  setselectedRecordsFields(event: any) {
    this.selectRecord = event.value;;
  }
  setselectedTargetsFields(event: any) {
    this.selectedTarget = event.value;;
  }
  setselectedFileNameFields1(event: any) {
    if (this.myForm.get('project')?.value == "BioreactorData.csv") {
      this.batchTargetEnable = true;
    } else {
      this.batchTargetEnable = false;
    }
  }
  setDefaultValueBasedOnCondition() {
    if (this.myForm.get('project')?.value == "BioreactorData.csv") {
      this.typControl.setValue('your-selected-value');
    }
  }
  getWhatIfPredictionValue() {
    this.finalSliderValues = [];
    for (let result of this.commonFeatures) {
      this.finalSliderValues.push({
        feature: result.Feature,
        value: result.lastValue || result.Value
      });
    }
    let body = {
      "typ": this.myForm.get('typ')?.value,
      "pred": {
      },
      "d": {
      } as DObject
    }
    for (let sliderValue of this.finalSliderValues) {
      body.d[sliderValue.feature] = sliderValue.value;
    }
    const features = this.featuresXPredoriginal;
    for (let feature of features) {
      if (!body.d[feature.Feature]) {
        body.d[feature.Feature] = feature.Value;
      }
    }
    const dField = body.d;
    const featuresXPredoriginal = this.featuresXPredoriginal;
    const sortedDField: { [key: string]: any } = {};
    this.featuresXPredoriginal.forEach(item => {
      const key = item.Feature;
      if (body.d.hasOwnProperty(key)) {
        sortedDField[key] = body.d[key];
      }
    });
    body.d = sortedDField;
    let body1 = {
      "typ": this.myForm.get('typ')?.value,
      "pred": {
      },
      "d": sortedDField
    }
    const test = this.causalDiscoveryService.getWhatIfPrediction(
      this.token,
      body1,
      (result: any) => {
      
        if (
          this.myForm.get('typ')?.value == 'classification' &&
         // this.myForm.get('project')?.value == 'synres_dataset.csv'
         this.myForm.get('folder')?.value.toLowerCase().includes('syn')
        ) {
          if (result.data.prediction.toFixed(2) == 1) {
            this.PredictedPenicillinConcentrationForm.get(
              'PredictedPenicillinConcentration'
            )?.setValue(result.data.prediction.toFixed(2) + '(Normal)');
          } else if (result.data.prediction.toFixed(2) == 0) {
            this.PredictedPenicillinConcentrationForm.get(
              'PredictedPenicillinConcentration'
            )?.setValue(result.data.prediction.toFixed(2) + '(Disagree)');
          }
        } else {
          this.PredictedPenicillinConcentrationForm.get(
            'PredictedPenicillinConcentration'
          )?.setValue(result.data.prediction.toFixed(2));
        }
      }
    );
  }
  onSliderChange(result: any) {
    result.lastValue = result.Value;
    this.debounceFunction();
  }
  setFormValues(formValues: any) {
    this.myForm = formValues;
  }

  getFormValues() {
    return this.myForm;
  }

  ngOnDestroy() {
    this.setFormValues(this.myForm.value);
  }
  onInputChange(result: any) {
    result.lastValue = result.Value;
    this.debounceFunction();
  }
  debounceFunction() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.getWhatIfPredictionValue();
    }, 300);
  }
  loadSessionValues() {
    this.myForm.get('typ')?.enable();
    this.XAIData = JSON.parse(localStorage.getItem("XAIData") || '{}');
    this.previouscausalData = JSON.parse(localStorage.getItem("causalData") || '{}');
    this.selectedLearningMethod = this.estimatedMethods.find(estimatedMethods => estimatedMethods.value === 'backdoor.linear_regression')?.value;
    this.selectedRobustnessCheck = this.refute.find(estimatedMethods => estimatedMethods.value === 'data_subset_refuter')?.value;
    if (this.XAIData.folder != null || this.previouscausalData.file_name != null) {
      this.selectedFolderName = this.XAIData.folder;
      this.myForm.get('folder')?.setValue(this.XAIData.folder);
      this.getFilesList(this.XAIData.folder);
      this.myForm.get('files')?.setValue(this.XAIData.files);
      this.selectedFileName = this.XAIData.files;
      this.myForm.get('batch')?.setValue(this.XAIData.batch);
      this.myForm.get('typ')?.enable();
      if (this.selectedData === 'BioreactorData.csv') {
        this.modelType = this.XAIData.typ;
        this.selectRecord = this.XAIData.index;
        this.modelType = this.modals.find(modal => modal.value === 'regression')?.value;
        this.myForm.get('typ')?.setValue(this.modals.find(modal => modal.value === 'regression')?.value);
        this.myForm.get('typ')?.disable();
      } else if (this.selectedData === 'synres_dataset.csv') {
        this.myForm.get('typ')?.enable();
        this.modelType = this.XAIData.typ;
        this.batchTargetEnable = false;
        this.getrecords(this.selectedData);
        this.selectedTopFeatures = this.XAIData.num_ft;
        this.selectedCppArrayValues = this.XAIData.ip;
      }
      this.getTargets(this.selectedData);
      this.targetValue = this.XAIData.target;
      this.setTargetForModel();
      this.eventAnalysisData = JSON.parse(localStorage.getItem("eventAnalysisData") || '{}');
      this.selectedCausalDataFile = this.eventAnalysisData.file_name;
      this.selectedCausalBatchIDValue = this.eventAnalysisData.batch_id;
      this.selectedCppArrayValues = this.XAIData.ip;
      this.selectedTopFeatures = this.XAIData.num_ft;
      this.selectedBatchIDValue = this.XAIData.batch;
      this.selectRecord = this.XAIData.index;
      this.selectedCausalBatchIDValue = this.previouscausalData.selected_batch;
      this.selectedCausalDataFile = this.previouscausalData.file_name;
      this.getrecords(this.selectedBatchIDValue);
      this.getbioRecord(this.selectedData);
      if (this.selectedCausalBatchIDValue == undefined) {
        this.eventAnalysisData = JSON.parse(localStorage.getItem("eventAnalysisData") || '{}');
        this.selectedCausalDataFile = this.eventAnalysisData.file_name;
        this.selectedCausalBatchIDValue = this.eventAnalysisData.batch_id;
      } else {
        this.selectedCausalBatchIDValue = this.previouscausalData.selected_batch;
        this.selectedCausalDataFile = this.previouscausalData.file_name;
      }
      this.getCauses(this.selectedCausalDataFile);
      this.selectedCommonCauses = this.previouscausalData.common_causes;
      // this.selectedCausalTargetValues = this.previouscausalData.target_var;
      this.selectedCausalTarget = this.previouscausalData.causal_target;
    } else {
      this.eventAnalysisData = JSON.parse(localStorage.getItem("eventAnalysisData") || '{}');
      this.myForm.get('project')?.setValue(this.eventAnalysisData.file_name);
      this.myForm.get('batch')?.setValue(this.eventAnalysisData.batch_id);
      this.selectedCausalBatchIDValue = this.eventAnalysisData.batch_id;
      this.selectedCausalDataFile = this.eventAnalysisData.file_name;
      this.selectedData = this.eventAnalysisData.file_name;
      if (this.selectedData === 'BioreactorData.csv') {
        this.selectRecord = this.XAIData.index;
        this.modelType = this.modals.find(modal => modal.value === 'regression')?.value;
        this.myForm.get('typ')?.setValue(this.modals.find(modal => modal.value === 'regression')?.value);
        this.myForm.get('typ')?.disable();
      } else if (this.selectedData === 'synres_dataset.csv') {
        this.myForm.get('typ')?.enable();
        this.modelType = this.XAIData.typ;
        this.batchTargetEnable = false;
        this.getrecords(this.selectedData);
        this.selectRecord = this.XAIData.index;
        this.selectedTopFeatures = this.XAIData.num_ft;
        this.selectedCppArrayValues = this.XAIData.ip;
      }
      this.selectedBatchIDValue = this.eventAnalysisData.batch_id;
      this.targetValue = this.eventAnalysisData.cqa;
      this.selectedCppArrayValues = this.eventAnalysisData.cpp_list;
      this.getCauses(this.selectedCausalDataFile);
      this.selectedBatchIDValue = this.eventAnalysisData.batch_id;
      this.selectedData = this.eventAnalysisData.file_name;
      this.getrecords(this.selectedBatchIDValue);
      this.getbioRecord(this.selectedData);
      this.getTargets(this.selectedData);
      this.getCauses(this.selectedData);
      this.selectedCommonCauses = this.previouscausalData.common_causes;
      // this.selectedCausalTargetValues = this.previouscausalData.target_var;
      this.selectedCausalTarget = this.previouscausalData.causal_target;
    }
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
      this.getBatches();
      this.getSelectedTarget()
    }))
  }
  onFolderSelection() {
    const selectedFolder = this.myForm.get('folder')?.value;
    if (selectedFolder) {
      this.getFilesList(selectedFolder);
    }
  }
  getFilesListForCausal(folderName: any) {
    let body = {
      username: this.userName,
      select_folder: folderName
    }
    this.dataVaultService.getFileList(this.token, body, (result => {
      this.fileData = result.files;
      this.causalForm.get('files')?.patchValue([]);
    }))
  }
  onFolderSelectionForCausal() {
    const selectedFolder = this.causalForm.get('folder')?.value;
    if (selectedFolder) {
      this.getFilesListForCausal(selectedFolder);
    }
  }
  getBatchesForCausal() {
    let body = {
      username: this.userName,
      select_folder: this.causalForm.get('folder')?.value,
      files_to_read: this.causalForm.get('files')?.value,
      column_name: ''
    };

    if (body.select_folder.toLowerCase().includes('bio')) {
      body.column_name = 'Batch reference(Batch_ref:Batch ref)';
    } else if (body.select_folder.toLowerCase().includes('syn')) {
      body.column_name = 'Batch_reference';
    }
    const test = this.eventAnalysisService.getColumnValues(this.token, body, (result: any) => {
      let array = [];
      for (const iterator of result.column_values
      ) {
        let jsonData = {
          "name": iterator
        }
        array.push(jsonData)
      }
      this.Batch = array;
    })
  }
  getrecordsId() {
    this.getrecordsbody = {
      "username": this.userName,
      "select_folder": this.myForm.get('folder')?.value,
      "files_to_read": this.myForm.get('files')?.value,
      "batch_id": this.myForm.get('batch')?.value
    }

    const test = this.causalDiscoveryService.getRecords(this.token, this.getrecordsbody, (result: any) => {
      let array = [];
      for (const iterator of result.indices) {
        let jsonData = {
          "name": iterator
        };
        array.push(jsonData)
      }
      this.recordsID = array;
    });
  }
}

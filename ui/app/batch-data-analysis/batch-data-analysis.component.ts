import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { BatchDataAnalysisService } from './batch-data-analysis.service';
import { DataVaultService } from '../data-vault/data-vault.service';
import { MatDialog } from '@angular/material/dialog';
import { BatchDataAnalysisConfirmDialogComponent } from '../batch-data-analysis-confirm-dialog/batch-data-analysis-confirm-dialog.component';
import { JsonPipe } from '@angular/common';
declare let Plotly: any;



@Component({
  selector: 'app-batch-data-analysis',
  templateUrl: './batch-data-analysis.component.html',
  styleUrls: ['./batch-data-analysis.component.scss'],
})
export class BatchDataAnalysisComponent implements OnInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  messages: Message[] = [];
  userInput: string = '';
  test: boolean = false;
  lastData: any;
  loader: boolean = false;
  dataArr: any;
  title: any;
  isLastData: boolean = false;
  loadLastData: any;
  loadLastDataq: any;
  isImageDisplayed: boolean = true;
  errorMessage: any;
  isPageDataLoading: boolean = false;
  isLatestSearchInProgress:boolean = false;
  isApiRequestInProgress: boolean = false;
  selectedFolder: string = ''; 
  selectedFiles: string = ''; 
  token: any;
  fileData:any;
  folderData:any;
  disableModel: boolean = false;
  userName: any;
  isDataSource : boolean = false;
  imageURL: any;
  constructor(
    private batchDataAnalysisService: BatchDataAnalysisService,
    private el: ElementRef ,private dataVaultService:DataVaultService,private dialog: MatDialog
  ) { this.token = JSON.parse(localStorage.getItem('token') || '{}');
  this.userName = JSON.parse(localStorage.getItem('username') || '{}');
}
  ngOnInit(): void {
    // this.getLastData();
    // this.onPageRefresh();
    this.getFolderList();
    // this.getPlot();
  }
  sendMessage(): void {
    this.errorMessage = ''
    this.test = false;
    this.isLastData = false;
    this.delete();
    if (this.userInput.trim() === '') return;
    const chartContainer =
      this.el.nativeElement.querySelector('.chart-container');
    chartContainer.innerHTML = '';
    const body = {
      question : this.userInput
    };
    // this.messages = [];
    const questionText = `${this.userInput}`;
    const question: Message = { text: questionText, type: 'question', loader:true};
    this.messages.push(question);
    console.log("---HHHHHHH",this.messages)
    // this.loader = true;
    this.batchDataAnalysisService.sendMessage(body).subscribe((response) => {
      this.errorMessage = null;
      question.loader = false;
      this.isImageDisplayed = false;
      this.getLastData();
      const answerText = `${response.final_answer}`;
      const answer: Message = { text: answerText, type: 'answer' };
      this.dataArr = response.charts;
      this.messages.push(answer);
      console.log("TESTINNGGGG",this.messages)
      this.renderGraph();
      this.userInput = '';
    },
    error=>{
      question.loader = false;
      Swal.fire({
        title: 'Error',
        text: error,
        width: '500px', 
        heightAuto: false,
        confirmButtonColor: "#235D9F",
      } as any);
        });
       }

renderGraph() {
  this.batchDataAnalysisService.movefiles().subscribe(response => {
    console.log("Response from movefiles:", response);
    try {
      if (response && response.moved_files && response.moved_files.length > 0) {
        const pngLocations = response.moved_files;
        console.log('PNG locations list:', pngLocations);
        this.imageURL = pngLocations[0];

        const imageMessage : Message ={type: 'image', imageURL: this.imageURL}
        this.messages.push(imageMessage);
      } else {
        console.log('No image URLs found in the response');
      }
    } catch (error) {
      console.error('Error handling PNG locations response:', error);
    }
  }, error => {
    console.error('Error fetching image URLs:', error);
  });
}


  latestSearch(input: any) {
    if (!this.isApiRequestInProgress) {
      this.isApiRequestInProgress = true;
    this.test = false;
    this.dataArr = '';
    const questionText = `${input}`;
    const body = {
      uuid: "rca_auth_token",
      username : this.userName,
      data_vault : this.selectedFolder,
      csv_file: this.selectedFiles,
      source_type : 'synres',
      user_prompt : input,
      response_data:'',
      is_analyser : false
    };
    this.messages = [];
    const question: Message = { text: questionText, type: 'question' };
    this.messages.push(question);
    this.batchDataAnalysisService.sendMessage(body).subscribe((recentData) => {
      const latestSearchData = JSON.parse(recentData);
      const answerText = `${latestSearchData.text_answer}`;
      const answer: Message = { text: answerText, type: 'answer' };
      this.messages.push(answer);
      this.dataArr = latestSearchData.charts;
      this.renderGraph();
      this.isApiRequestInProgress = false;
    });
  }
  }
  getLastData() {
    this.batchDataAnalysisService.sendLastFiveRecords(this.userName).subscribe((ele) => {
      this.lastData = ele.data;
      if (this.lastData.length == 0) {
        this.isLastData = true;
        this.isImageDisplayed = true;
        this.isPageDataLoading = false;
      } else {
        this.isLastData = false;
        this.isImageDisplayed = false;
      }
    });
  }
  onPageRefresh() {
    this.batchDataAnalysisService.sendLastFiveRecords(this.userName).subscribe((ele) => {
      this.lastData = ele.data;
      this.loadLastData = this.lastData[0];
      const question: Message = {
        text: this.loadLastData.user_prompt,
        type: 'question',
      };
      this.messages.push(question);
      const answer: Message = {
        text: this.loadLastData.response_data.text_answer,
        type: 'answer',
      };
      let codeData = this.loadLastData.response_data.charts
     this.dataArr = codeData;
     this.messages.push(answer);
     this.isPageDataLoading = false;
     this.renderGraph();
    });
  }
  toggleImageDisplay() {
    const leftDiv = document.querySelector('.left-div');
    if (leftDiv) {
      if (this.isImageDisplayed) {
        leftDiv.classList.add('image-displayed');
      } else {
        leftDiv.classList.remove('image-displayed');
      }
    }
  }
  getFolderList() {
    let body ={
      "username":this.userName
    }
    this.dataVaultService.getFolderList(this.token,body, (result: any) => {
      this.folderData = result.folders.map((folderName: string) => folderName.replace('/', ''));
    })
  }
getFilesList(folderName:any)
{
 let body = {
  username:this.userName,
  select_folder: folderName
  }
  this.dataVaultService.getFileList(this.token,body,(result=>{
    this.fileData = result.files;
  }))
}
onFolderSelection(selectedFolder: any) {
  if (selectedFolder) {
      this.getFilesList(selectedFolder);
  }
}
verifyDataSource()
{
  const body = {
    uuid: "rca_auth_token",
    username : this.userName,
    data_vault : this.selectedFolder,
    csv_file: this.selectedFiles,
    source_type : 'synres',
    is_analyser : true,
    user_prompt : ''
  };
  const dialogRef = this.dialog.open(BatchDataAnalysisConfirmDialogComponent,{
    width: '460px',
    height: '152px',
    data: {}
  })
  dialogRef.afterClosed().subscribe(result => {
    if(result == true){
    this.batchDataAnalysisService.sendMessage(body).subscribe(response=>{
      if(response)
      {
        this.isDataSource = true;
      }
    })
  }
  else{
    console.log('The dialog was canceled or closed');
  }
    });
}
// getPlot()
// {
//   this.batchDataAnalysisService.plotImage().subscribe(ele=>{
//   })
// }
delete(){
  this.batchDataAnalysisService.deletePNGFiles().subscribe(
    response => {
        console.log('PNG files deleted:', response);
    },
    error => {
        console.error('Error deleting PNG files:', error);
    }
);

}
}
interface Message {
  text?: string;
  type: 'question' | 'answer' | 'image';
  imageURL?: string;
  loader?:boolean;
}


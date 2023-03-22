import { LightningElement, track } from 'lwc';
import ReadCSVFile from '@salesforce/apex/ImportCSVHandler.ReadCSVFile';
import SaveFile from '@salesforce/apex/ImportCSVHandler.SaveFile';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const columns = [
    {label: 'Name',fieldName: 'Name'}, 
    {label: 'Rating',fieldName: 'Rating'}, 
    {label: 'Type',fieldName: 'Type'},    
    {label: 'Industry',fieldName: 'Industry'},        
]; 

export default class ImportCSV extends LightningElement {   
   @track columns = columns;
   @track data;
   @track fileName = '';   
   @track showLoadingSpinner = false;
   @track isTrue = true;   
   filesUploaded = [];
   file;
   fileContents;
   fileReader;   
   MAX_FILE_SIZE = 1500000;

   handleFilesChange(event) {
        if(event.target.files.length > 0) {
         this.filesUploaded = event.target.files;
         if(this.filesUploaded[0].size > this.MAX_FILE_SIZE){
             this.isTrue = true;
             this.fileName = 'File size is too large!!';
         }
         else{
             this.isTrue = false;			
             this.fileName = event.target.files[0].name;
             this.file = this.filesUploaded[0];			
             this.showLoadingSpinner = true;
             this.fileReader= new FileReader();
             this.fileReader.onloadend = (() => {
                 this.fileContents = this.fileReader.result;
                 this.ReadFile();
             });
             this.fileReader.readAsText(this.file);
            }
        }
        else{
            this.isTrue = true;
            this.fileName = 'Please select a CSV file to upload!!';
        }
    }

    ReadFile() {
        ReadCSVFile({ base64Data: JSON.stringify(this.fileContents)})
        .then(result => {           
            window.console.log(result);
            this.data = result;           
            this.showLoadingSpinner = false;           
        })
        .catch(error => {
            window.console.log(error);
            this.isTrue = true;
            this.showLoadingSpinner = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Invalid data found in file',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
    }

    handleSave(){
        if(!this.isTrue){
            this.showLoadingSpinner = true;
            SaveFile({ jsonString: JSON.stringify(this.data)})
            .then(result => {
                this.showLoadingSpinner = false;
                if(result=='SUCCESS'){
                    this.isTrue = true;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success!!',
                            message: this.file.name + ' - Uploaded Successfully!!',
                            variant: 'success',
                        }),
                    );
                }
                else{
                    this.showLoadingSpinner = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: result,
                            variant: 'error',
                        }),
                    );
                }
            })
            .catch(error=>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
        }       
    } 
}
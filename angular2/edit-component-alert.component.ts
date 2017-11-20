import {Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-wrong-type-alert',
    templateUrl: 'edit-component-alert.component.html',
    styleUrls: ['edit-component-alert.component.css']
})
export class EditComponentAlertComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<EditComponentAlertComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    close(): void {
        this.dialogRef.close({action: 'save', data: this.data});
    }

    ngOnInit() {
    }

}

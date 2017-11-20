import {Component, OnInit, Input, EventEmitter, Output, OnDestroy, ChangeDetectorRef, Inject} from '@angular/core';
import {DraggableNetworkComponent} from "../../../../models/Drag&DropModels/DraggableNetworkComponent";
import {NetworkComponentsService} from "../../../../services/network-components.service";
import {EditComponentAlertComponent} from "./edit-component-alert/edit-component-alert.component";
import {MatDialog} from '@angular/material';

let networkComponentsService: any;

@Component({
    selector: 'network-element',
    templateUrl: './network-element.component.html',
    styleUrls: ['./network-element.component.css']
})
export class NetworkElementComponent implements OnInit, OnDestroy {

    @Input() hierarchyId: number;
    @Input() component: DraggableNetworkComponent;
    @Output() delete: EventEmitter<any> = new EventEmitter();

    constructor(public networkComponentsService: NetworkComponentsService,
                private ref: ChangeDetectorRef,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        networkComponentsService = this.networkComponentsService;
    }

    ngOnDestroy() {
        this.ref.detach();
    }

    childComponentAdded($event) {
        if (typeof $event.dragData == 'string') {
            this.networkComponentsService.addToComponent($event.dragData, this.component);
        } else if ($event.dragData instanceof DraggableNetworkComponent) {
            this.networkComponentsService.relocateComponentTo($event.dragData, this.component, this.hierarchyId);
            this.networkComponentsService.endManualDrag();
        } else if ($event.dragData === null) {
            setTimeout(() => {
                if (this.networkComponentsService.currentDragData !== undefined) {
                    this.networkComponentsService.relocateComponentTo(this.networkComponentsService.currentDragData, this.component, this.hierarchyId);
                    this.networkComponentsService.endManualDrag();
                }
            });
        }

        this.networkComponentsService.clearStyles();
    }

    editComponent() {
        const dialogRef = this.dialog.open(EditComponentAlertComponent, {
            width: '360px',
            data: {
                name: this.component.name,
                fields: this.component.specialFields
            }
        });

        dialogRef.afterClosed()
            .subscribe(result => {
                if (result && result.action && result.action == 'save') {
                    this.component.name = result.data.name;
                    this.component.specialFields = result.data.fields.slice(0)
                }
            });
    }

    removeComponent() {
        this.delete.emit();
    }

    trackSort(event) {
        networkComponentsService.endManualDrag();
    }

}
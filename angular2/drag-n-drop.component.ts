import {Component, OnInit} from '@angular/core';
import {NetworkComponentsService} from "../../../services/network-components.service";
import {DraggableNetworkComponent} from "../../../models/Drag&DropModels/DraggableNetworkComponent";

@Component({
    selector: 'app-drag-n-drop',
    templateUrl: './drag-n-drop.component.html',
    styleUrls: ['./drag-n-drop.component.css']
})
export class DragNDropComponent implements OnInit {

    hierarchyId: number;

    constructor(private networkComponentsService: NetworkComponentsService) {
    }

    ngOnInit() {
        this.hierarchyId = this.networkComponentsService.createNewHierarchy();
    }

    componentDroppedToContainer($event) {
        if (typeof $event.dragData == 'string') {
            this.networkComponentsService.addToHierarchy($event.dragData, this.hierarchyId)
        }

        this.networkComponentsService.clearStyles();
    }

}

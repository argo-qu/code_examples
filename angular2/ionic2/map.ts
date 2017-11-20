import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare let ymaps: any;

@IonicPage()
@Component({
    selector: 'page-map',
    templateUrl: 'map.html'
})
export class MapPage {

    public address: any;
    public electionsSite: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private iab: InAppBrowser) {
    }

    ionViewDidLoad() {
        this.address = this.navParams.data.address;
        this.electionsSite = this.navParams.data.electionsSite;
        this.initMap();
    }

    initMap() {
        let addressCoords = this.address.coords.split(',').reverse();
        let siteCoords = this.electionsSite.site_address.coords.split(',').reverse();

        let map = new ymaps.Map("map", {
            center: addressCoords,
            zoom: 15,
            controls: ['zoomControl']
        });

        let multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: [
                addressCoords,
                siteCoords
            ],
            params: {
                routingMode: 'pedestrian'
            }
        }, {
            boundsAutoApply: true,
            wayPointStartIconColor: "#5051ff",
            wayPointStartIconFillColor: "#ffffff",
            wayPointFinishIconColor: "#ffffff",
            wayPointFinishIconFillColor: "#10ff00",
            //
            // !!! Вот это взял из доки яндекс карт - наслаждайся !!!
            //
            // Задаем собственную картинку для последней путевой точки. (аналогично для первой путевой)
            // wayPointFinishIconLayout: "default#image",
            // wayPointFinishIconImageHref: "images/sokolniki.png",
            // wayPointFinishIconImageSize: [30, 30],
            // wayPointFinishIconImageOffset: [-15, -15],
            //
            // Внешний вид линии пешеходного маршрута.
            // routeActivePedestrianSegmentStrokeStyle: "solid",
            // routeActivePedestrianSegmentStrokeColor: "#00CDCD",
        });
        map.geoObjects.add(multiRoute);
    }

    openYandexMapIframe() {
        let addressCoords = this.address.coords.split(',').reverse().join(',');
        let siteCoords = this.electionsSite.site_address.coords.split(',').reverse().join(',');

        let browser = this.iab.create(
            `https://yandex.by/maps/157/minsk/?rtext=${addressCoords}~${siteCoords}&rtt=auto&mode=routes&z=15`,
            '_system'
        );
    }
}

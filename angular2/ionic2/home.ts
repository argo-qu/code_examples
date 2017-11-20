import {Component, OnInit} from '@angular/core';
import {NavController, LoadingController, AlertController} from 'ionic-angular';
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import {AddressesService} from "../../services/addresses-service/addresses-service";
import {Observable} from "rxjs";
import {MapPage} from "../map/map";
import {SitesListPage} from "../sites-list/sites-list";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage implements OnInit {
    private form: FormGroup;

    constructor(public navCtrl: NavController,
                private formBuilder: FormBuilder,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                private addressesService: AddressesService) {
        this.form = this.formBuilder.group({
            address: ['', Validators.required]
        });
    }

    ngOnInit() {
        if (window.navigator.geolocation)
            window.navigator.geolocation
                .getCurrentPosition(
                    currentPosition => {                        
                        this.addressesService.getCoordinatesAddress(`${currentPosition.coords.longitude},${currentPosition.coords.latitude}`)
                            .catch(error => {
                                console.log(`Can't get current address`);
                                return Observable.throw(error);
                            })
                            .subscribe((res: any) => {
                                if (res.response.GeoObjectCollection.featureMember.length == 0)
                                    return;

                                let geo = res.response.GeoObjectCollection.featureMember[0].GeoObject;
                                let meta = res.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData;
                                let city = "";
                                meta.Address.Components.forEach(component => {
                                    if (component.kind === "locality")
                                        city = component.name;
                                });

                                this.form.get('address').setValue(city.length == 0 ? meta.text : `${city}, ${geo.name}`);
                            });
                    })
    }

    findElectiveDistrict() {        
        if (this.form.invalid) {
            this.form.markAsTouched();

            document.getElementsByClassName('text-input')[0].setAttribute('id', 'address-input');
            document.getElementById('address-input').focus();
            return;
        }

        const loading = this.loadingCtrl.create({ content: "Загрузка..." });
        loading.present();
        
        this.addressesService.getAddressCoordinates(this.form.get('address').value)
            .catch(error => {                
                loading.dismiss();
                this.throwConnectionError();
                return Observable.throw(error);
            })
            .subscribe((res:any) => {                
                loading.dismiss();

                if (res.response.GeoObjectCollection.featureMember.length == 0) {
                    this.throwNotFoundError();
                    return;
                }
                
                let coords = res.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ').join(',');
                let electionsSite = this.addressesService.getElectionsSite(coords);

                if (electionsSite !== null)
                    this.openMapPage(
                        { address: this.form.get('address').value, coords },
                        electionsSite
                    );
                else
                    this.throwNotFoundError();
            });
    };

    throwNotFoundError() {
        let alert = this.alertCtrl.create({
            message: 'Не удалось найти ваш дом. Попробуйте ввести адрес по-другому или найдите участок в списке.',
            buttons: [
                {
                    text: 'Найти участок в списке',
                    cssClass: 'btn-open-list',
                    handler: data => {
                        this.navCtrl.push(SitesListPage);
                    }
                },
                {
                    text: 'Ввести адрес заново',
                    role: 'cancel',
                    cssClass: 'btn-retype-address'
                }
            ]
        });
        alert.present();
    }

    throwConnectionError() {
        let alert = this.alertCtrl.create({
            message: 'Нет интернет-соединения',
            buttons: [
                {
                    text: 'Найти участок в списке',
                    cssClass: 'btn-open-list',
                    handler: data => {
                        this.navCtrl.push(SitesListPage);
                    }
                },
                {
                    text: 'Повторить попытку',
                    cssClass: 'btn-refresh',
                    role: 'cancel',
                    handler: data => {
                        this.findElectiveDistrict();
                    }
                }
            ]
        });
        alert.present();
    }

    openMapPage(address, electionsSite) {
        this.navCtrl.push(MapPage, { address, electionsSite });
    }
}

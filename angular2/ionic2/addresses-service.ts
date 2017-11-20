import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";

declare var window: any;

@Injectable()
export class AddressesService {

    constructor(private http: Http) {
    }

    public getAddressCoordinates(address: string) {
        return this.http.get(`https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${address}&results=1`)
            .map((res: Response) => res.json());
    }

    public getCoordinatesAddress(coordinates: string) {
        return this.http.get(`https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${coordinates}&results=1`)
            .map((res: Response) => res.json());
    }

    public getElectionsSite(coordinates: string) {
        if (!window.sites)
            return null;

        let result: any = null;

        window.sites.forEach(site => {
            site.addresses.forEach(address => {
                if (address.coords == coordinates)
                    result = site;
            });
        });

        return result;
    }
}
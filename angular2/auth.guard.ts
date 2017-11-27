import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {Observable} from 'rxjs/Observable';
import {CanActivate, Router} from '@angular/router';
import {SocialAuth} from "./social-auth";

import 'rxjs/Rx';
import {Broadcaster} from "../broadcaster";
import {UserProfileService} from "../user/user-profile.service";

declare var firebase: any;

@Injectable()
export class AuthGuard implements CanActivate {
    JWT_KEY: string = 'jwt_key';
    JWT: string = '';
    CURRENTUSER = 'currentUser';

    constructor(private api: ApiService,
                private router: Router,
                public socialAuth: SocialAuth,
                private broadcaster: Broadcaster,
                private userProfileService: UserProfileService) {

        const token = window.localStorage.getItem(this.JWT_KEY);
        if (token) {
            this.setJwt(token);
        }

        firebase.initializeApp({
            apiKey: "################################",
            authDomain: "################################",
            databaseURL: "################################",
            projectId: "################################",
            storageBucket: "################################",
            messagingSenderId: "################################"
        });
    }

    canActivate(): boolean {
        const canActivate = this.isAuthorized();
        this.onCanActivate(canActivate);
        return canActivate;
    }

    onCanActivate(canActivate: boolean) {
        if (!canActivate) {
            this.router.navigate(['', 'login']);
        }
    }

    setJwt(jwt: string) {
        window.localStorage.setItem(this.JWT_KEY, jwt);
        this.api.setHeaders({Authorization: `Bearer ${jwt}`});
    }

    setCurrentUser(currentUser: string) {
        window.localStorage.setItem(this.CURRENTUSER, currentUser);
    }

    isAuthorized(): boolean {
        return Boolean(window.localStorage.getItem(this.JWT_KEY));
    }

    authenticateWithSocial(social: string) {
        return this.socialAuth.authenticate(social)
            .then((socialData) => {
                if (socialData instanceof Object)
                    return this.api
                        .post(`/social`, socialData)
                        .toPromise()
                        .catch(error => {
                            let message = 'Error! Can\'t complete authentication.';

                            if (error.status == 404)
                                message = 'Error! User doesn\'t exist.';

                            if (error.status == 400)
                                message = `Error! ${JSON.parse(error._body)}.`;

                            this.broadcaster.broadcast('toast:error', message);
                            return Observable.throw(error);
                        })
                        .then((token) => {
                            this.setJwt(token);
                            this.userProfileService.loadUserProfile();
                            this.router.navigate(['/']);
                            return token;
                        });
            });

    }

    authenticate(path: string, creds: any): Observable<any> {
        return this.api.post(`/${path}`, creds)
            .catch(error => {
                console.log(error);
                let message = 'Error! Can\'t complete authentication.';

                if (error.status == 404)
                    message = 'Error! User doesn\'t exist.';

                if (error.status == 400)
                    message = `Error! ${JSON.parse(error._body)}.`;

                this.broadcaster.broadcast('toast:error', message);
                return Observable.throw(error);
            })
            .do((res: any) => {
                this.setJwt(res);
                this.userProfileService.loadUserProfile();
                this.router.navigate(['/']);

                return res;
            });
    }

    signout() {
        window.localStorage.removeItem(this.JWT_KEY);
        window.localStorage.removeItem(this.CURRENTUSER);
        this.router.navigate(['', 'login']);
    }
}

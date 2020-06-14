import { UserProfile, logStat } from './user.model';
import {Auth} from "./userAuth.model";
import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { IpService } from 'src/app/ip.service';
import { DocumentService } from "../../../homes/body/search/service/document/document.service";
import { QueryServiceService } from '../query-service.service';
@Injectable({
    providedIn: 'root'
})
export class AuthEmailService extends  Auth{

    protected URL = this.ipService.get_FE_DB_ServerIp();

    private EMAIL_REG_URL = this.URL + "/eUser/register"; //mongoDB
    private EMAIL_LOGIN_URL = this.URL + "/eUser/login";
    private EMAIL_VERIFY_TOKEN = this.URL + "/eUser/verify";
    private EMAIL_CHECK_OUR_USER_URL = this.URL + "/eUser/eCheckUser";
    constructor(
        protected ipService: IpService,
        private http: HttpClient,
        private router: Router,
        // private gauth: AuthService,
        private docSvc: DocumentService,
        private db: QueryServiceService
        // private auth : EPAuthService,
    ) {
        super();
        // this.isLogInObs$.next(logStat.unsigned);
    }



    /***
     * @EmailUserLoginFunctinos
     * @description email login functions
     *  functions:
     */

    getProfile(user: any) {
        throw new Error("Method not implemented.");
    }
    
    /**
    * @function getInstance()
    * @returns email auth 인스턴스를 반환. 싱글턴 패턴 사용.
    */
    getInstance() {
        return this;
    }

    //email user : check if this user is already our user
    async isOurUser(user: {}): Promise<any> {
        let isOurUser = await this.http.post<any>(this.EMAIL_CHECK_OUR_USER_URL, user).toPromise();

        return isOurUser;
    }


    //email registration function
    async register(user): Promise<any> {
        //console.log("user reg input : ", user);

        // let isOurUser$ = this.eCheckUser(user);
        // let res = await isOurUser$.toPromise();
        let isOurUser = await this.isOurUser(user);
        //console.log(isOurUser);
        if (isOurUser.succ) {//if this user is one of us, deny registration.
            alert("이미 등록되어 있는 id 입니다. 로그인 페이지로 이동합니다.");
            //비밀번호 찾기 페이지도 만들어야 한다. 
            this.router.navigateByUrl("/membership/login");
        }
        else {
            let res = await this.http.post<any>(this.EMAIL_REG_URL, user).toPromise();

            // //console.log(res)
            alert("환영합니다, " + res.payload.name + "님. 홈 화면으로 이동합니다.");
            return res.succ;
            // this.auth.confirmUser(logStat.email, res);
            // err => console.log(err)
        }

    }

    //email sign in function
    async logIn(user): Promise<any> {
        //console.log("login req user : ", user);

        let isOurUser = await this.isOurUser(user);
        // console.log(isOurUser);
        if (!isOurUser.succ) {//if this user is one of us, deny registration.
            alert("아직 KUBiC 회원이 아니시군요? 회원가입 해주세요! :)");
            //비밀번호 찾기 페이지도 만들어야 한다. 
        }
        else {
            //console.log("user input check : ", user);
            var res = await await this.http.post<any>(this.EMAIL_LOGIN_URL, user).toPromise();
            //console.log("login process result : ", res);
            // login succ
            if (res.succ) {
                alert("돌아오신 걸 환영합니다, " + res.payload.name + "님. 홈 화면으로 이동합니다.");
                return { logStat: logStat.email, token: res.payload.toekn, name: res.payload.name, email: res.payload.email };
            }
            // this.auth.confirmUser(this.auth.logStat.email, res);
            //login fail. maybe wrong password or id?
            if (!res.succ) {
                alert("이메일 혹은 비밀번호가 잘못되었어요.");
                return null;
            }
            err => {
                console.log(err)
            }
        }
    }

    /**
     * @description : return user profile
     * @param user : user = {payload : {
     *                                  name : string, 
     *                                  email : string
     *                                  }
     *                      }
     */
    // getProfile(user) {
    //     return new Profile(user.payload.name, user.payload.email)
    // }

    //email sign out function
    logOut(): void {
        localStorage.removeItem("token");
        // this.router.navigate(["/homes"]);
    }




    //email verify token
    async verifyToken(token): Promise<any> {
        return await this.http.post<any>(this.EMAIL_VERIFY_TOKEN, token).toPromise();
    }


}
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})
export class VisitService {

    private createVistsAction = '/api/visits/create' + `?key=${environment.SERVER_API_KEY}`; // Replace with your backend endpoint

    constructor(private http: HttpClient) { }

    async createVisits(branchId = '') {
        return this.http
            .post<{ success: boolean, message: string }>(
                this.createVistsAction,
                { branchId })
            .toPromise()
            .then((response) => response!);
    }

}

import axios, { AxiosRequestConfig } from 'axios';
import { IServerError, ErrorResponse, SuccessResponse, IServerResponse } from './Response';

export class ApiClient {
    private static logging: boolean = false;
    private static succeed: (success:  SuccessResponse, resolve: any) => void = (s, r) => {}
    private static fail: (success:  ErrorResponse<{}>, r: any) => void = (s, r) => {}
    private static authToken: string | undefined;
    private static xsrfToken: string | undefined;
    private static connectionId: string | undefined;
    private static host: string | undefined;

    public static get AuthenicationToken() { return ApiClient.authToken; }
    public static get XSRFToken() { return ApiClient.xsrfToken; }
    public static get Host() { return ApiClient.host; }
    
    public static setLogging(state: boolean) {
        this.logging = state;
    }

    public static onSuccess(callback: (success:  SuccessResponse, resolve?: any) => void) {
        this.succeed = callback;
    }

    public static onFail(callback: (error: ErrorResponse<{}>, reject?: any) => void) {
        this.fail = callback;
    }

    public static addAuthentication(authToken: string | undefined) {
        this.authToken = authToken;

        if (authToken == "")
            this.authToken = undefined;
    }

    public static defineHost(host: string | undefined) {
        // this.host = host; 
    }

    public static addXSRF(xsrfToken: string) {
        this.xsrfToken = xsrfToken;

        if (xsrfToken == "")
            this.xsrfToken = undefined;
    }

    public static websocketConnection(id: string | null | undefined) {
        if (!!id)
            this.connectionId = id;
        else
            this.connectionId = "";
    }

    private static configureHeaders(config: AxiosRequestConfig) {    
        if (!config.headers)
            config.headers = {};

        if (!config.headers['Content-Type'])
            config.headers['Content-Type'] = 'application/json';

        if (this.authToken && !config.headers['Authorization'])
            config.headers['Authorization'] = "Bearer " + this.authToken;

        if (this.xsrfToken)
            config.headers['RequestVerificationToken'] = this.xsrfToken;

        config.headers['Connection-Id'] = this.connectionId ?? "";
    }

    public static request(config: AxiosRequestConfig): Promise<SuccessResponse> {
        this.configureHeaders(config);

        if (config.hasOwnProperty('data') && 
            config.data.constructor.name != 'FormData') 
            config.data = JSON.stringify(config.data);  
    
        return new Promise((resolve, reject) => {
            axios(config)
                .then((success:  IServerResponse) =>{  
                    let response = new SuccessResponse(success);
    
                    if (this.logging)
                        console.log(response);                   
    
                    this.succeed(response, resolve);                    
                    resolve(response);
                })
                .catch((error: IServerError)=>{
                    let response = new ErrorResponse(error);
                    
                    if (this.logging)
                        console.log(response);     
                    
                    this.fail(response, reject);
                    reject(response);
                })
        })
    }
}

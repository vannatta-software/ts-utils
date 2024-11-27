import { AxiosRequestConfig } from "axios";


export type ModelErrors = {
    [property: string]: string[];
};

export interface IServerResponse<T ={}> {
    config: AxiosRequestConfig | null;
    request?: XMLHttpRequest;
    data?: T
}


export type Response<T> = SuccessResponse<T> | ErrorResponse<T>

export interface IServerError<T = {}> extends IServerResponse<T> {
    response: {
        data: {
            errors: ModelErrors,
            feedback: string
        },
        status?: number,
        statusText?: string,
    },
    message?: string 
}

const defaultResponse: IServerResponse = {
    config: null
}

const defaultError: IServerError = {
    config: null,
    response: {
        data: {            
            errors: {},
            feedback: "string"
        }
    }
}

export class ServerResponse<T = {}> {
    public formId?: string;
    public config: AxiosRequestConfig | null;
    public data: T;
    public request: XMLHttpRequest | undefined;

    constructor(response: IServerResponse<T>) {
        this.config = response.config;
        this.request = response.request;
        this.data = response.data ?? this.data;
    }        

    public get isError(): boolean {
        if (this.data == "")
            return true

        return this instanceof ErrorResponse ? true : false
    }
}

export class ErrorResponse<T> extends ServerResponse<T> {
    public errors: ModelErrors;
    public feedback: string | undefined;

    constructor(error: IServerError<T>) {        
        super(error);        
        
        this.errors = {};
        this.feedback = undefined;
        if (!error.response || !error.response.data)
            return;

        if (typeof(error.response.data) == 'string') {
            this.feedback = error.response.data;
            return;
        }

        if (!error.response.data.errors)
            return;

        for (let prop in error.response.data.errors) {
            let outProp = prop[0].toLowerCase() + prop.slice(1);

            if (!this.errors[outProp])
                this.errors[outProp] = [];

            const errors =  error.response.data.errors[prop];
            errors.forEach(error => this.errors[outProp].push(error));            
        }
    }    

    public get isValidFormat(): boolean {
        const responseCode = this.request?.status ?? 200;

        return (
            responseCode < 500 &&
            responseCode != 404 &&
            responseCode != 0 
        )
    }

    public hasErrors(field?: string) {
        if (field)
            return this.errors.hasOwnProperty(field);
        else 
            return Object.keys(this.errors).length > 0;
    }

    public addErrors(field: string, errors: string[]) {
        if (!this.errors[field])
            this.errors[field] = errors;
        else
            this.errors[field].push(...errors);
    }

    public static Build(errors: ModelErrors, feedback: string | undefined = undefined) {
        let error = new ErrorResponse(defaultError);
        error.errors = errors;
        if (feedback)
            error.feedback = feedback;

        return error;
    }
}

export class SuccessResponse<T = {}> extends ServerResponse<T> {
    constructor(success: IServerResponse<T> ){
        super(success);
    }
}
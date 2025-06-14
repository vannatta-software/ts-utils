import { AxiosRequestConfig } from "axios";

export type ModelErrors = {
    [property: string]: string[];
};

export interface IServerResponse<T = {}> {
    config: AxiosRequestConfig | null;
    request?: XMLHttpRequest;
    data?: T;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse<T>;

export class ApiResponse<T> {
    [key: string]: any;
    
    constructor(entity: T, omit: string[] = []) {
        if (!entity) return;
    
        if (Array.isArray(entity)) {
            const result = entity.map(item => new ApiResponse(item, omit));
            
            Object.assign(this, result);
            Object.setPrototypeOf(this, Array.prototype);
            
            return;
        }
        
        // Handle single entity
        Object.entries(entity).forEach(([key, value]) => {
            if (omit.includes(key)) return;
            
            this[key] = value;
        });
    }
}

export interface IServerError<T = {}> extends IServerResponse<T> {
    response: {
        data: {
            errors: ModelErrors;
            feedback: string;
        };
        status?: number;
        statusText?: string;
    };
    message?: string;
}

const defaultResponse: IServerResponse = {
    config: null
};

const defaultError: IServerError = {
    config: null,
    response: {
        data: {
            errors: {},
            feedback: "string"
        }
    }
};

export class ServerResponse<T = {}> {
    public formId?: string;
    public config: AxiosRequestConfig | null;
    public data: T;
    public request: XMLHttpRequest | undefined;

    constructor(response: IServerResponse<T>) {
        this.config = response.config;
        this.request = response.request;
        this.data = (response.data ?? {} as T);
    }

    public getData(): T {
        return this.data;
    }

    public get isError(): boolean {
        return this instanceof ErrorResponse;
    }
}

export class ErrorResponse<T> extends ServerResponse<T> {
    public errors: ModelErrors;
    public feedback: string | undefined;

    constructor(error: IServerError<T>) {
        super(error);

        this.errors = {};
        this.feedback = undefined;

        // Check if the error response and its data are present
        if (error.response && error.response.data) {
            // Check if the response data is a string (simple feedback case)
            if (typeof error.response.data === 'string') {
                this.feedback = error.response.data;
                return; // Exit after setting feedback if only a string is present
            }

            // If errors exist, process them
            if (error.response.data.errors) {
                for (let prop in error.response.data.errors) {
                    const outProp = prop[0].toLowerCase() + prop.slice(1);
                    if (!this.errors[outProp]) this.errors[outProp] = [];
                    const errors = error.response.data.errors[prop];
                    errors.forEach((error) => this.errors[outProp].push(error));
                }
            }

            // If feedback exists in the response data, assign it
            if (error.response.data.feedback) {
                this.feedback = error.response.data.feedback;
            }
        }
    }

    public getFeedback(): string | undefined {
        return this.feedback;
    }

    public get isValidFormat(): boolean {
        const responseCode = this.request?.status ?? 200;
        return responseCode < 500 && responseCode !== 404 && responseCode !== 0;
    }

    public hasErrors(field?: string): boolean {
        if (field) return this.errors.hasOwnProperty(field);
        return Object.keys(this.errors).length > 0;
    }

    public addErrors(field: string, errors: string[]): void {
        if (!this.errors[field]) {
            this.errors[field] = errors;
        } else {
            this.errors[field].push(...errors);
        }
    }

    public removeError(field: string): void {
        if (this.errors[field]) {
            delete this.errors[field];
        }
    }

    public static Build(errors: ModelErrors, feedback: string | undefined = undefined) {
        let error = new ErrorResponse(defaultError);
        error.errors = errors;
        if (feedback) error.feedback = feedback;
        return error;
    }
}

export class SuccessResponse<T = {}> extends ServerResponse<T> {
    constructor(success: IServerResponse<T>) {
        super(success);
    }

    public getData(): T {
        return this.data;
    }
}

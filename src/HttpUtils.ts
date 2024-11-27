
import axios from 'axios';
import { ErrorResponse, SuccessResponse, Response, IServerError } from './Response';

export class HttpUtils {
    public static replaceUrlPlaceholders(url: string, params: Record<string, any>): string {
        return Object.keys(params).reduce((accUrl, key) => {
            return accUrl.replace(`{${key}}`, encodeURIComponent(params[key]));
        }, url);
    }

    public static async handleRequest<T>(request: Promise<any>): Promise<T> {
        try {
            const response = await request;

            return new SuccessResponse<T>(response).data as T
        } catch (error: any) {
            throw new ErrorResponse<T>(error as IServerError<T>);
        }
    }
}

class Get<T> {
    constructor(private url: string) {}

    async execute<Q = any>(query: Q): Promise<T> {
        const url = HttpUtils.replaceUrlPlaceholders(this.url, query);

        return HttpUtils.handleRequest<T>(axios.get(url, { params: { ...query } }));
    }
}

class Post<T> {
    constructor(private url: string) {}

    async execute<C>(command: C): Promise<T> {
        const url = HttpUtils.replaceUrlPlaceholders(this.url, command);

        return HttpUtils.handleRequest<T>(axios.post(url, command));
    }
}

class Put<T> {
    constructor(private url: string) {}

    async execute<C>(command: C): Promise<T> {
        const url = HttpUtils.replaceUrlPlaceholders(this.url, command);

        return HttpUtils.handleRequest<T>(axios.put(url, command));
    }
}

class Patch<T> {
    constructor(private url: string) {}

    async execute<C>(command: C): Promise<T> {
        const url = HttpUtils.replaceUrlPlaceholders(this.url, command);
        return HttpUtils.handleRequest<T>(axios.patch(url, command));
    }
}

class Delete<T> {
    constructor(private url: string) {}

    async execute<C>(command: C): Promise<T> {
        const url = HttpUtils.replaceUrlPlaceholders(this.url, command);
        return HttpUtils.handleRequest<T>(axios.delete(url, command));
    }
}

export const http = {
    post: <T>(u: string) => new Post<T>(u),
    patch: <T>(url: string) => new Patch<T>(url),
    delete: <T>(url: string) => new Delete<T>(url),
    get: <T>(url: string) => new Get<T>(url),
    put: <T>(url: string) => new Put<T>(url),
};

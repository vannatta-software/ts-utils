export class ApiException extends Error {
    public readonly errors?: Record<string, string[]>;

    constructor(message: string, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiException';
        this.errors = errors;
    }
}

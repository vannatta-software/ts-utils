import { ApiException } from '../api.exception';

describe('ApiException', () => {
    it('should be an instance of Error', () => {
        const exception = new ApiException('Test message');
        expect(exception).toBeInstanceOf(Error);
    });

    it('should be an instance of ApiException', () => {
        const exception = new ApiException('Test message');
        expect(exception).toBeInstanceOf(ApiException);
    });

    it('should set the message correctly', () => {
        const message = 'Something went wrong';
        const exception = new ApiException(message);
        expect(exception.message).toBe(message);
    });

    it('should set the errors correctly when provided', () => {
        const message = 'Validation failed';
        const errors = {
            field1: ['Error 1 for field1', 'Error 2 for field1'],
            field2: ['Error 1 for field2'],
        };
        const exception = new ApiException(message, errors);
        expect(exception.message).toBe(message);
        expect(exception.errors).toEqual(errors);
    });

    it('should have undefined errors if not provided', () => {
        const message = 'Generic error';
        const exception = new ApiException(message);
        expect(exception.message).toBe(message);
        expect(exception.errors).toBeUndefined();
    });

    it('should allow errors to be null or undefined', () => {
        const message = 'Error with null errors';
        const exceptionNull = new ApiException(message, null);
        expect(exceptionNull.errors).toBeNull();

        const messageUndefined = 'Error with undefined errors';
        const exceptionUndefined = new ApiException(messageUndefined, undefined);
        expect(exceptionUndefined.errors).toBeUndefined();
    });
});

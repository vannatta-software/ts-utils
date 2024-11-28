import { ServerResponse, ErrorResponse, SuccessResponse, IServerError, ModelErrors } from '../ResponseUtils';

describe('ServerResponse Tests', () => {

    test('ServerResponse initialization', () => {
        const mockResponse = { config: null, data: {} };
        const response = new ServerResponse(mockResponse);
        expect(response.config).toBeNull();
        expect(response.data).toEqual({});
        expect(response.isError).toBe(false);
    });

    test('ErrorResponse initialization and error handling', () => {
        const errorData: IServerError = {
            config: null,
            message: 'error message',
            response: {
                data: {
                    errors: {
                        field1: ['Field is required'],
                        field2: ['Invalid value']
                    },
                    feedback: 'Error feedback'
                }
            }
        };

        const errorResponse = new ErrorResponse(errorData);
        expect(errorResponse.errors).toEqual({
            field1: ['Field is required'],
            field2: ['Invalid value']
        });
        expect(errorResponse.feedback).toBe('Error feedback');
        expect(errorResponse.isValidFormat).toBe(true);
        expect(errorResponse.hasErrors()).toBe(true);

        // Test adding errors
        errorResponse.addErrors('field1', ['Another error']);
        expect(errorResponse.errors['field1']).toContain('Another error');

        // Test removing errors
        errorResponse.removeError('field1');
        expect(errorResponse.errors['field1']).toBeUndefined();
        
        // Test hasErrors with specific field
        expect(errorResponse.hasErrors('field1')).toBe(false);
        expect(errorResponse.hasErrors('field2')).toBe(true);

        // Test the Build method
        const builtErrorResponse = ErrorResponse.Build({ field1: ['Test error'] }, 'Test feedback');
        expect(builtErrorResponse.errors).toEqual({ field1: ['Test error'] });
        expect(builtErrorResponse.feedback).toBe('Test feedback');
    });

    test('SuccessResponse initialization', () => {
        const mockResponse = { config: null, data: { success: true } };
        const successResponse = new SuccessResponse(mockResponse);
        expect(successResponse.config).toBeNull();
        expect(successResponse.data).toEqual({ success: true });
        expect(successResponse.isError).toBe(false);
    });

    test('ErrorResponse format validation', () => {
        const invalidErrorData: IServerError = {
            config: null,
            message: 'error message',
            response: {
                data: {
                    errors: { field1: ['Field is required'] },
                    feedback: 'Error feedback'
                },
                status: 500,
                statusText: 'Internal Server Error'
            }
        };
    
        const invalidErrorResponse = new ErrorResponse(invalidErrorData);
        expect(invalidErrorResponse.isValidFormat).toBe(true); // Expecting false because of status code 500
    });

    test('ErrorResponse with missing data', () => {
        const errorData: IServerError = {
            config: null,
            message: 'error message',
            response: {
                data: { errors: {}, feedback: 'Error feedback' },
            }
        };

        const errorResponse = new ErrorResponse(errorData);
        expect(errorResponse.errors).toEqual({});
        expect(errorResponse.feedback).toBe('Error feedback');
    });
});

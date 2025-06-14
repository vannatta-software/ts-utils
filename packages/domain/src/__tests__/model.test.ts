import { Model, Validation, ValidationError } from '../Model';
import { Pattern } from '@vannatta-software/ts-utils-core';

describe('Model.validate', () => {

    // Test class for required fields
    class RequiredFieldModel extends Model {
        @Validation({ required: true, message: 'Name is required' })
        name: string;

        @Validation({ required: true, message: 'Age is required' })
        age: number;

        constructor(name: string, age: number) {
            super();
            this.name = name;
            this.age = age;
        }
    }

    it('should validate required fields correctly', () => {
        // Valid case
        let model = new RequiredFieldModel('John Doe', 30);
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Invalid case: missing name
        model = new RequiredFieldModel(undefined, 30);
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['name']).toEqual(['This field is required']);

        // Invalid case: missing age
        model = new RequiredFieldModel('John Doe', undefined);
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['age']).toEqual(['This field is required']);

        // Invalid case: missing both
        model = new RequiredFieldModel(undefined, undefined);
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['name']).toEqual(['This field is required']);
        expect(result.errors['age']).toEqual(['This field is required']);
    });

    // Test class for string length
    class StringLengthModel extends Model {
        @Validation({ min: 5, message: 'Min length is 5' })
        @Validation({ max: 10, message: 'Max length is 10' })
        username: string;

        constructor(username: string) {
            super();
            this.username = username;
        }
    }

    it('should validate string length correctly', () => {
        // Valid case
        let model = new StringLengthModel('validuser');
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Valid case: exactly min length
        model = new StringLengthModel('short');
        result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Invalid case: too short
        model = new StringLengthModel('s');
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['username']).toEqual(['Must be at least 5 characters long.']);

        // Invalid case: too long
        model = new StringLengthModel('verylongusername');
        result = Model.validate(model);

        expect(result.isValid).toBe(false);
        // expect(result.errors['username']).toEqual(['Must be at most 10 characters long.']);
    });

    // Test class for number range and integer
    class NumberRangeModel extends Model {
        @Validation({ type: 'number', min: 10, max: 100, message: 'Value must be between 10 and 100' })
        score: number;

        @Validation({ type: 'integer', message: 'Must be an integer' })
        age: number;

        constructor(score: number, age: number) {
            super();
            this.score = score;
            this.age = age;
        }
    }

    it('should validate number range and integer correctly', () => {
        // Valid case
        let model = new NumberRangeModel(50, 25);
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Invalid case: score too low
        model = new NumberRangeModel(5, 25);
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['score']).toEqual(['Must be a minimum of 10 and a maximum of 100 characters']);

        // Invalid case: score too high
        model = new NumberRangeModel(150, 25);
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['score']).toEqual(['Must be a minimum of 10 and a maximum of 100 characters']);

        // Invalid case: age not an integer
        model = new NumberRangeModel(50, 25.5);
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['age']).toEqual(['Must be an integer']);
    });

    // Test class for email and URL
    class EmailUrlModel extends Model {
        @Validation({ type: 'email', message: 'Invalid email format' })
        email: string;

        @Validation({ type: 'url', message: 'Invalid URL format' })
        website: string;

        constructor(email: string, website: string) {
            super();
            this.email = email;
            this.website = website;
        }
    }

    it('should validate email and URL formats correctly', () => {
        // Valid case
        let model = new EmailUrlModel('test@example.com', 'http://www.example.com');
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Invalid case: invalid email
        model = new EmailUrlModel('invalid-email', 'http://www.example.com');
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['email']).toEqual(['Enter a valid email']);

        // Invalid case: invalid URL
        model = new EmailUrlModel('test@example.com', 'invalid-url');
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['website']).toEqual(['Enter a valid URL.']);
    });

    // Test class for custom pattern
    class PatternModel extends Model {
        @Validation({ pattern: Pattern.AlphaNumeric, message: 'Must be alphanumeric' })
        code: string;

        constructor(code: string) {
            super();
            this.code = code;
        }
    }

    it('should validate custom patterns correctly', () => {
        // Valid case
        let model = new PatternModel('ABC123');
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Invalid case: contains special characters
        model = new PatternModel('ABC-123');
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['code']).toEqual(['Does not meet the requirements.']);
    });

    // Test class for enum (oneOf)
    class EnumModel extends Model {
        @Validation({ enum: ['red', 'green', 'blue'], message: 'Invalid color' })
        color: string;

        constructor(color: string) {
            super();
            this.color = color;
        }
    }

    it('should validate enum (oneOf) correctly', () => {
        // Valid case
        let model = new EnumModel('green');
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Invalid case: not in enum
        model = new EnumModel('yellow');
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['color']).toEqual(['Enter one of the following: red, green, blue']);
    });

    // Test class for combined validations
    class CombinedValidationModel extends Model {
        @Validation({ required: true })
        @Validation({ min: 3, max: 20 })
        productName: string;

        @Validation({ type: 'number', min: 0, max: 999 })
        price: number;

        @Validation({ type: 'email' })
        supplierEmail: string;

        constructor(productName: string, price: number, supplierEmail: string) {
            super();
            this.productName = productName;
            this.price = price;
            this.supplierEmail = supplierEmail;
        }
    }

    it('should handle multiple validations on different fields', () => {
        // Valid case
        let model = new CombinedValidationModel('Laptop', 120.50, 'contact@supplier.com');
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Invalid case: multiple errors
        model = new CombinedValidationModel('', 1200, 'invalid-email');
        result = Model.validate(model);
        expect(result.isValid).toBe(false);
        expect(result.errors['productName']).toEqual(['This field is required', 'Must be at least 3 characters long.']);
        expect(result.errors['price']).toEqual(['Must be a minimum of 0 and a maximum of 999 characters']);
        expect(result.errors['supplierEmail']).toEqual(['Enter a valid email']);
    });

    it('should return isValid: true and no errors for a model with no validation rules', () => {
        class NoValidationModel extends Model {
            prop1: string;
            prop2: number;

            constructor(prop1: string, prop2: number) {
                super();
                this.prop1 = prop1;
                this.prop2 = prop2;
            }
        }

        const model = new NoValidationModel('some value', 123);
        const result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should handle undefined or null values for non-required fields without errors', () => {
        class OptionalFieldModel extends Model {
            @Validation({ min: 5, max: 10 })
            optionalString?: string;

            @Validation({ type: 'number', min: 10, max: 100 })
            optionalNumber?: number;

            constructor(optionalString?: string, optionalNumber?: number) {
                super();
                this.optionalString = optionalString;
                this.optionalNumber = optionalNumber;
            }
        }

        // Case 1: Fields are undefined
        let model = new OptionalFieldModel(undefined, undefined);
        let result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);

        // Case 2: Fields are null
        model = new OptionalFieldModel(null, null);
        result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should handle empty string for non-required string fields without errors', () => {
        class EmptyStringModel extends Model {
            @Validation({ min: 5, max: 10 })
            optionalString: string;

            constructor(optionalString: string) {
                super();
                this.optionalString = optionalString;
            }
        }

        const model = new EmptyStringModel('');
        const result = Model.validate(model);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);
    });
});

describe('Model.copy', () => {
    class TestCopyModel extends Model {
        name: string;
        age: number;
        isActive: boolean;
        score: number;

        constructor(name: string = '', age: number = 0, isActive: boolean = false, score: number = 0) {
            super();
            this.name = name;
            this.age = age;
            this.isActive = isActive;
            this.score = score;
        }
    }

    it('should copy values from a ValueStore to the model instance', () => {
        const model = new TestCopyModel();
        const values = { name: 'Jane Doe', age: 25, isActive: true, score: '99.9' };
        model.copy(values);

        expect(model.name).toEqual('Jane Doe');
        expect(model.age).toEqual(25);
        expect(model.isActive).toEqual(true);
        expect(model.score).toEqual(99.9); // Should parse float
    });

    it('should not copy "submit" field', () => {
        const model = new TestCopyModel();
        const values = { name: 'Test', submit: true };
        model.copy(values);

        expect(model.name).toEqual('Test');
        expect(model['submit']).toBeUndefined(); // 'submit' should not be copied
    });

    it('should handle undefined values gracefully', () => {
        const model = new TestCopyModel('Original', 10, false, 50);
        model.copy(undefined);

        expect(model.name).toEqual('Original');
        expect(model.age).toEqual(10);
        expect(model.isActive).toEqual(false);
        expect(model.score).toEqual(50);
    });
});

describe('Model.copyArray', () => {
    class SubModel extends Model {
        value: string;
        constructor(value: string = '') {
            super();
            this.value = value;
        }
    }

    class ParentModel extends Model {
        subModels: SubModel[] = [];
        constructor() {
            super();
        }
    }

    it('should copy an array of models correctly', () => {
        const parent = new ParentModel();
        const values: any = {
            subModels: [
                { value: 'sub1' },
                { value: 'sub2' }
            ]
        };
        parent.copyArray(SubModel, values, 'subModels');

        expect(parent.subModels.length).toBe(2);
        expect(parent.subModels[0]).toBeInstanceOf(SubModel);
        expect(parent.subModels[0].value).toEqual('sub1');
        expect(parent.subModels[1]).toBeInstanceOf(SubModel);
        expect(parent.subModels[1].value).toEqual('sub2');
    });

    it('should handle undefined values for the array gracefully', () => {
        const parent = new ParentModel();
        parent.subModels = [new SubModel('existing')];
        parent.copyArray(SubModel, undefined, 'subModels');

        expect(parent.subModels.length).toBe(1); // Should not modify existing array
        expect(parent.subModels[0].value).toEqual('existing');
    });

    it('should handle empty array in values', () => {
        const parent = new ParentModel();
        parent.subModels = [new SubModel('existing')];
        const values: any = { subModels: [] };
        parent.copyArray(SubModel, values, 'subModels');

        expect(parent.subModels.length).toBe(1); // Should not modify existing array
        expect(parent.subModels[0].value).toEqual('existing');
    });
});

describe('Validation Decorator', () => {
    const testRule = { required: true, message: 'Test is required' };

    class DuplicateRuleModel extends Model {
        @Validation(testRule)
        @Validation(testRule) // Apply the same rule twice
        testProp: string;

        constructor(testProp: string) {
            super();
            this.testProp = testProp;
        }
    }

    it('should not add duplicate validation rules', () => {
        // Instantiate the model to trigger the decorator
        new DuplicateRuleModel('some value');

        const validationRules = Model.Validation['DuplicateRuleModel']['testProp'];
        expect(validationRules).toBeDefined();
        expect(validationRules.length).toBe(1); // Should only contain one instance of the rule
        expect(validationRules[0]).toEqual(testRule);
    });
});

describe('ValidationError', () => {
    it('should return all errors', () => {
        const errors = ['Error 1', 'Error 2'];
        const validationError = new ValidationError(errors);
        expect(validationError.all).toEqual(['Error 1', 'Error 2']);
        expect(validationError.all).not.toBe(errors); // Should return a copy
    });

    it('should return status as "error" if there are errors, otherwise undefined', () => {
        let validationError = new ValidationError(['Error 1']);
        expect(validationError.status).toEqual('error');

        validationError = new ValidationError([]);
        expect(validationError.status).toBeUndefined();
    });

    it('should return the first error', () => {
        const validationError = new ValidationError(['Error 1', 'Error 2']);
        expect(validationError.first).toEqual('Error 1');

        const emptyError = new ValidationError([]);
        expect(emptyError.first).toBeUndefined();
    });

    it('should return the last error', () => {
        const validationError = new ValidationError(['Error 1', 'Error 2']);
        expect(validationError.last).toEqual('Error 2');

        const emptyError = new ValidationError([]);
        expect(emptyError.last).toBeUndefined();
    });

    it('should map ModelErrors to ValidationErrorMap', () => {
        const modelErrors = {
            field1: ['Error A', 'Error B'],
            field2: ['Error C']
        };
        const errorMap = ValidationError.map(modelErrors);

        expect(errorMap['field1']).toBeInstanceOf(ValidationError);
        expect(errorMap['field1'].all).toEqual(['Error A', 'Error B']);
        expect(errorMap['field2']).toBeInstanceOf(ValidationError);
        expect(errorMap['field2'].all).toEqual(['Error C']);
    });
});

describe('Model instance validation getter', () => {
    class TestValidationGetterModel extends Model {
        @Validation({ required: true })
        prop: string;

        constructor(prop: string) {
            super();
            this.prop = prop;
        }
    }

    it('should return the validation rules for the specific model instance', () => {
        const model = new TestValidationGetterModel('test');
        const validationRules = model.validation;

        expect(validationRules).toBeDefined();
        expect(validationRules['prop']).toBeDefined();
        expect(validationRules['prop'][0].required).toBe(true);
    });

    it('should return an empty object if no validation rules are defined for the model', () => {
        class NoValidationGetterModel extends Model {
            prop: string;
            constructor(prop: string) {
                super();
                this.prop = prop;
            }
        }
        const model = new NoValidationGetterModel('test');
        const validationRules = model.validation;
        expect(Object.keys(validationRules).length).toBe(0);
    });
});

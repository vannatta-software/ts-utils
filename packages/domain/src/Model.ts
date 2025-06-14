import { ModelErrors, Validator } from "@vannatta-software/ts-utils-core"; 

type StoreValue = any;
type ValidateAction = (rule: RuleObject, value: StoreValue, callback: (error?: string) => void) => Promise<void | any> | void;
type ValidationState = { isValid: boolean; errors: { [key: string]: string[] } }
type RuleType = 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email';
interface Rule {
    warningOnly?: boolean;
    enum?: StoreValue[];
    len?: number;
    max?: number;
    message?: string | object;
    min?: number;
    pattern?: RegExp;
    required?: boolean;
    transform?: (value: StoreValue) => StoreValue;
    type?: RuleType;
    whitespace?: boolean;
    validateTrigger?: string | string[];
}

interface ArrayRule extends Omit<AggregationRule, 'type'> {
    type: 'array';
    defaultField?: RuleObject;
}

export type RuleObject = AggregationRule | ArrayRule;

export interface ValidatorRule {
    warningOnly?: boolean;
    message?: string | object;
    validator: ValidateAction;
}

type AggregationRule = Rule & Partial<ValidatorRule>;

export type ValueStore<T = any> = {
    [P in keyof T]?: any;
}

type ValidateStatus = "success" | "warning" | "error" | "validating" | "";

export function Validation(rule: RuleObject) {    
    return function (target: Model, propertyKey: string) {        
        let model = Model.Validation[target.constructor.name];

        if (model == undefined) {
            Model.Validation[target.constructor.name] = {};
            model = Model.Validation[target.constructor.name];
        }

        if (model[propertyKey] == undefined)
            model[propertyKey] = [];

        if (model[propertyKey].includes(rule))
            return;
        
        model[propertyKey].push(rule);
    }
}

type ModelValidation = { [property: string]: RuleObject[] };

export class ValidationError {
    constructor(private _errors: string[]) { }    

    public get all(): string[] {
        return this._errors.slice();
    }
    
    public get status(): ValidateStatus | undefined {
        return this.first != undefined ? "error" : undefined;
    }

    public get first(): string | undefined {
        return this._errors[0];
    }

    public get last(): string | undefined {
        return this._errors[this._errors.length -1];
    }

    public static map(errors: ModelErrors): ValidationErrorMap {
        let errorMap = {};

        Object.keys(errors).forEach(field => 
            errorMap[field] = new ValidationError(errors[field]));

        return errorMap;
    }
}

export type ValidationErrorMap = {
    [error: string]: ValidationError
}

export class Model {    
    public static Validation: { [model: string]: ModelValidation } = {};

    public get validation() {
        return Model.Validation[this.constructor.name] ?? {};
    }

    public copy(values: ValueStore | undefined) {
        if (!values)
            return this;

        if (!!values.submit)
            delete values["submit"]
            
        Object.keys(values).forEach(key => { 
            if (typeof this[key] == "number")
                this[key] = parseFloat(values[key]);
            else 
                this[key] = values[key];           
        });

        return this;
    }

    public copyArray<T extends Model>(type: { new(): T; }, values: ValueStore<T> | undefined, list: string) {
        values?.[list]?.forEach(model => this[list]?.push(new type().copy(model)))
    }

    public static validate(model: Model): ValidationState {
        const validation = model.validation;

        const modelErrors: { [key: string]: string[] } = {};
        const validator = new Validator();

        if (!validation) {
            return {
                isValid: true,
                errors: {}
            };
        }

        Object.entries(validation).forEach(([field, rules]) => {
            try {
                const value = model[field];
                const isRequiredField = rules.some(rule => rule.required);
                const validationRules: any = {};

                if (isRequiredField) {
                    validationRules.required = true;
                }

                // Apply other rules only if value is present OR if the field is required
                if (value !== undefined && value !== null && value !== '' || isRequiredField) {
                    rules.forEach(rule => {
                        if (rule.pattern) validationRules.format = rule.pattern;
                        if (rule.type === 'email') validationRules.email = true;
                        if (rule.type === 'url') validationRules.url = true;
                        if (rule.enum) validationRules.oneOf = rule.enum;

                        if (rule.type === 'integer') validationRules.integer = true;

                        if (rule.min !== undefined || rule.max !== undefined) {
                            if (rule.type === 'number') {
                                validationRules.range = { min: rule.min, max: rule.max };
                            } else {
                                // For string min/max
                                if (rule.min !== undefined) validationRules.min = rule.min;
                                if (rule.max !== undefined) validationRules.max = rule.max;
                            }
                        }
                    });
                }
    
                validator.validate(value, validationRules);

                if (validator.errors.length > 0) {
                    modelErrors[field] = validator.errors;
                }
            } catch (error) {
                modelErrors[field] = error.toString();
            }
        });

        return {
            isValid: Object.keys(modelErrors).length === 0,
            errors: modelErrors,
        };
    }
}

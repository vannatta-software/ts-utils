import { RuleObject } from "rc-field-form/lib/interface";
import { ModelErrors, Pattern } from "@vannatta-software/ts-core";

export type ValueStore<T = any> = {
    [P in keyof T]?: any;
}

type ValidateStatus = "success" | "warning" | "error" | "validating" | "";

export function Validation(rule: RuleObject) {    
    return function (target: FormModel, propertyKey: string) {        
        let model = FormModel.Validation[target.constructor.name];

        if (model == undefined) {
            FormModel.Validation[target.constructor.name] = {};
            model = FormModel.Validation[target.constructor.name];
        }

        if (model[propertyKey] == undefined)
            model[propertyKey] = [];

        if (model[propertyKey].includes(rule))
            return;
        
        model[propertyKey].push(rule);
    }
}

type ModelValidation = { [property: string]: RuleObject[] };

export class FormError {
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

    public static map(errors: ModelErrors): FormErrors {
        let errorMap = {};

        Object.keys(errors).forEach(field => 
            errorMap[field] = new FormError(errors[field]));

        return errorMap;
    }
}

export type FormErrors = {
    [error: string]: FormError
}

export interface FormModelProviderProps<T extends FormModel> {
    model: FormModel,
    onSubmit: (values: T) => Promise<any>
}

export interface FormModelItemProviderProps  {
    field: string
}

export class FormModel {    
    public static Validation: { [model: string]: ModelValidation } = {};

    public get validation() {
        return FormModel.Validation[this.constructor.name] ?? {};
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

    public copyArray<T extends FormModel>(type: { new(): T; }, values: ValueStore<T> | undefined, list: string) {
        values?.[list]?.forEach(model => this[list]?.push(new type().copy(model)))
    }
}
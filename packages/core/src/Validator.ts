export class Pattern {
    public static Alpha : RegExp = /^[A-Za-z]+$/;
    public static AlphaNumeric : RegExp = /^[A-Za-z0-9]+$/i;
    public static Numeric : RegExp = /^-?[0-9]+$/;
    public static Decimal : RegExp  = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
    public static Currency: RegExp = /^\s*(\+|-)?([€$£¥]?\d+(\.\d{2})?)\s*$/;
    public static Time : RegExp = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;
    public static DateYMD : RegExp = /^(?:\2)(?:[0-9]{2})?[0-9]{2}([\/-])(1[0-2]|0?[1-9])([\/-])(3[01]|[12][0-9]|0?[1-9])$/;
    public static DateDMY : RegExp = /^(3[01]|[12][0-9]|0?[1-9])([\/-])(1[0-2]|0?[1-9])([\/-])(?:[0-9]{2})?[0-9]{2}$/;
    public static Email : RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    public static URL: RegExp = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;  // URL format
    public static PhoneNumber: RegExp = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;  // Phone format: 123-456-7890
    public static CreditCard: RegExp = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})$/;  // Simple credit card regex
}

export class Validator {
    public errors: string[] = [];

    private alphaNumeric(value: any) {
        if (!Pattern.AlphaNumeric.test(value)) 
            this.errors.push('Must contain letters and numbers');
    }

    private numeric(value: any) {
        if (!Pattern.Numeric.test(value)) 
            this.errors.push('Must be a number.');
    }

    private alpha(value: any) {
        if (!Pattern.Alpha.test(value)) 
            this.errors.push('Must contain only letters.');
    }

    private decimal(value: any) {
        if (!Pattern.Decimal.test(value)) 
            this.errors.push('Must be a valid decimal number.');
    }

    private currency(value: any) {
        if (!Pattern.Currency.test(value)) 
            this.errors.push('Must be a valid currency value.');
    }

    private range(value: any, pars: any) {
        let valid = false;
        if (typeof value === 'string')
            valid = value.length >= pars.min && value.length <= pars.max;
        else if (typeof value === 'number')
            valid = value >= pars.min && value <= pars.max;
        if (!valid) 
            this.errors.push(`Must be a minimum of ${pars.min} and a maximum of ${pars.max} characters`);
    }

    private equal(value: any, compare: any) {
        if ('' + value !== '' + compare)
            this.errors.push(`Must be equal to ${compare}`);
    }

    private format(value: any, regex: any) {
        if (!regex.test(value))
            this.errors.push(`Does not meet the requirements.`);
    }

    private time(value: any) {
        if (!Pattern.Time.test(value))
            this.errors.push('Enter a valid time.');
    }

    private date(value: any, format: "ymd" | "dmy") {
        let formats = {
            ymd: Pattern.DateYMD,
            dmy: Pattern.DateDMY
        }
        if (!formats[format].test(value)) 
            this.errors.push('Enter a valid date.');
    }

    private required(value: any) {
        if (value === undefined || value === null || value === '') 
            this.errors.push('This field is required');
    }

    private min(value: any, length: any) {
        const valueStr = value + ""; // Ensure it's treated as a string
        if (valueStr.length < length) 
            this.errors.push(`Must be at least ${length} characters long.`);
    }    

    private email(value: any) {
        if ( !Pattern.Email.test(value))
            this.errors.push('Enter a valid email');
    }

    private max(value: any, length: any) {
        if (value.length > length) 
            this.errors.push('Must be at least ' + length + ' characters long.');
    }

    private integer(value: any) {
        if (!Number.isInteger(Number(value))) {
            this.errors.push('Must be an integer');
        }
    }

    private oneOf(value: any, enumeration: any) {
        if (!~enumeration.indexOf(value)) {
            this.errors.push(`Enter one of the following: ${enumeration.join(', ')}`);
        }
    }

    private match(value: any, pairedEl: any) {        
        const el: any = document.getElementById(pairedEl);
        if (value !== el.value) {
            this.errors.push('Must be the same as ' + el.name);
        };
    }

    private strength(value: any, strength: any) {
        let result = { 
            hasLower: /[a-z]/.test(value),
            hasUpper: /[A-Z]/.test(value),
            hasNumber: /\d/.test(value),
            hasSpecial: /[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/.test(value)
        };
    
        if (strength >= 0 && !result.hasLower) 
            this.errors.push('Must have at least 1 lower case character');
        if (strength >= 1 && !result.hasUpper)             
            this.errors.push('Must have at least 1 upper case character');
        if (strength >= 2 && !result.hasNumber) 
            this.errors.push('Must have at least 1 number');
        if (strength >= 3 && !result.hasSpecial) 
            this.errors.push('Must have at least 1 special character');
    }
    

    private url(value: any) {
        if (!Pattern.URL.test(value)) 
            this.errors.push('Enter a valid URL.');
    }

    private phone(value: any) {
        if (!Pattern.PhoneNumber.test(value)) 
            this.errors.push('Enter a valid phone number (e.g., 123-456-7890).');
    }

    private creditCard(value: any) {
        if (!Pattern.CreditCard.test(value)) 
            this.errors.push('Enter a valid credit card number.');
    }

    public validate(value: any, rules: any) {
        this.errors = [];
        for (const key in rules) {
            if (rules.hasOwnProperty(key)) {
                const props = rules[key];
                
                switch(key) {
                    case 'required': this.required(value); break;
                    case 'alphaNumeric': this.alphaNumeric(value); break;
                    case 'numeric': this.numeric(value); break;
                    case 'alpha': this.alpha(value); break;
                    case 'decimal': this.decimal(value); break;
                    case 'currency': this.currency(value); break;
                    case 'range': this.range(value, props); break;
                    case 'equal': this.equal(value, props); break;
                    case 'format': this.format(value, props); break;
                    case 'time': this.time(value); break;
                    case 'date': this.date(value, props); break;
                    case 'min': this.min(value, props); break;
                    case 'max': this.max(value, props); break;
                    case 'integer': this.integer(value); break;
                    case 'oneOf': this.oneOf(value, props); break;
                    case 'match': this.match(value, props); break;
                    case 'email': this.email(value); break;
                    case 'strength': this.strength(value, props); break;
                    case 'url': this.url(value); break;
                    case 'phone': this.phone(value); break;
                    case 'creditCard': this.creditCard(value); break;
                }
            }
        }

        return this.errors.length == 0;
    }
}

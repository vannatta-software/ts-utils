import { pluralize } from "./helpers/pluralize";
import * as LoremIpsum from "./helpers/loremIpsum";

export type ClassType<T> = (new (...args: any[]) => T) | string;

export class StringUtils {    
    public static className<T>(e: ClassType<T>) {
        return typeof e == "string" ? e : e.name;
    }
    
    public static camelCase(value: string): string {
        if (!value)
            return "";
        return value.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            if (+match === 0) return "";
            return index == 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

    public static sort(left: string, right: string) {
        return (left < right) ? -1 : (left > right) ? 1 : 0;
    }

    public static capitalize(value: string) {
        if (!value)
            return "";
        return value.charAt(0).toUpperCase() + value.substr(1).toLocaleLowerCase()
    }   

    public static combine(strings: string[], slug: string = " ") {
        return strings.join(slug);
    }
    
    public static endsWith(value: string, comparitor: string): boolean {
        if (!value)
            return false;
        return value.indexOf(comparitor) === value.length - comparitor.length;
    }    
    
    public static finish(value: string, finish: string): string {
        if (!value)
            return "";
        if (value.endsWith(finish))
        return value;
        
        return value + finish;
    }

    public static lorem(length: number) {
        let lorem = "";
        while (lorem.length <= length) {
            lorem += LoremIpsum.generate();
        }
        if (lorem.length > length) {
            lorem = lorem.substr(0, length);
            if (lorem[lorem.length -1] != '.')
                lorem += '.';
        }
        return lorem;
    }

    public static kebabCase(value: string): string {
        if (!value)
            return "";
        return value.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
    }

    public static limit(value: string, limit: number, append?: string) {
        if (!value)
            return "";
        if (value.length < limit)
            return value;

        append = append ? append : "";

        return value.substr(0, limit) + append;
    }

    public static plural(value: string): string {
        if (!value)
            return "";
        return pluralize(value);
    }

    public static random(length: number): string {
        let str = '';
        for (let i = 0; i < length / 10; i++ ) {
            str += Math.random().toString(36).substring(2)
        }
        
        return str.substr(0, length);
    }

    public static replaceArray(char: string, replacements: string[], value: string): string {
        if (!value)
            return "";
        replacements.forEach(replace => {
            value = StringUtils.replaceFirst(char, replace, value);
        });
        return value;
    }

    public static replaceFirst(char: string, replace: string, value: string): string {
        if (!value)
            return "";
        return value.replace(new RegExp(char, 'g'), replace);
    }

    public static replaceLast(char: string, replace: string, value: string): string {
        if (!value)
            return "";
        return value.replace(new RegExp(`${char}([^${char}]*)$`), replace);
    }

    public static removeSlug(value: string, slug: string = '-') {
        if (!value)
            return "";
        return StringUtils.titleCase(value.replace(new RegExp(slug, 'gi'), ' '));
    }

    public static singular(value: string): string {
        if (!value)
            return "";
        return pluralize(value, true);
    }
    
    public static slug(value: string, slug: string = '-'): string {
        if (!value)
            return "";
        return value.toLowerCase().replace(/ /g, slug);
    }

    public static snake(value: string): string {
        if (!value)
            return "";
        return StringUtils.kebabCase(value).replace(/-/g, '_');
    }

    public static studly(value: string): string {
        if (!value)
            return "";

        let out = "";

        value.split(/ |-|_/g).forEach(sub => {
            out += StringUtils.titleCase(sub);
        });

        return out;
    }

    public static startsWith(value: string, comparitor: string): boolean {
        if (!value)
            return false;

        return value.indexOf(comparitor) === 0;
    }
    
    public static start(value: string, start: string): string {
        if (!value)
            return "";

        if (value.startsWith(start))
        return start;
        
        return start + value;
    }    
    
    public static titleCase(value: string): string {
        if (!value)
            return "";

        return value.replace(/\w\S*/g, (val) => {
            return StringUtils.capitalize(val);
        });
    }

    public static urlSafe(value: string) {
        if (!value)
            return "";

        return encodeURIComponent(value.replace(/ /g, "_")).toLowerCase();
    }

    public static fromUrl(value: string) {
        if (!value)
            return "";
            
        return decodeURIComponent(value.replace(/\_/g, " "));
    }
    
    public static UUID(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }
    
}
const plural = {
    '(quiz)$'               : "$1zes",
    '^(ox)$'                : "$1en",
    '([m|l])ouse$'          : "$1ice",
    '(matr|vert|ind)ix|ex$' : "$1ices",
    '(x|ch|ss|sh)$'         : "$1es",
    '([^aeiouy]|qu)y$'      : "$1ies",
    '(hive)$'               : "$1s",
    '(?:([^f])fe|([lr])f)$' : "$1$2ves",
    '(shea|lea|loa|thie)f$' : "$1ves",
    'sis$'                  : "ses",
    '([ti])um$'             : "$1a",
    '(tomat|potat|ech|her|vet)o$': "$1oes",
    '(bu)s$'                : "$1ses",
    '(alias)$'              : "$1es",
    '(octop)us$'            : "$1i",
    '(ax|test)is$'          : "$1es",
    '(us)$'                 : "$1es",
    '([^s]+)$'              : "$1s"
};

const singular = {
    '(quiz)zes$'             : "$1",
    '(matr)ices$'            : "$1ix",
    '(vert|ind)ices$'        : "$1ex",
    '^(ox)en$'               : "$1",
    '(alias)es$'             : "$1",
    '(octop|vir)i$'          : "$1us",
    '(cris|ax|test)es$'      : "$1is",
    '(shoe)s$'               : "$1",
    '(o)es$'                 : "$1",
    '(bus)es$'               : "$1",
    '([m|l])ice$'            : "$1ouse",
    '(x|ch|ss|sh)es$'        : "$1",
    '(m)ovies$'              : "$1ovie",
    '(s)eries$'              : "$1eries",
    '([^aeiouy]|qu)ies$'     : "$1y",
    '([lr])ves$'             : "$1f",
    '(tive)s$'               : "$1",
    '(hive)s$'               : "$1",
    '(li|wi|kni)ves$'        : "$1fe",
    '(shea|loa|lea|thie)ves$': "$1f",
    '(^analy)ses$'           : "$1sis",
    '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': "$1$2sis",        
    '([ti])a$'               : "$1um",
    '(n)ews$'                : "$1ews",
    '(h|bl)ouses$'           : "$1ouse",
    '(corpse)s$'             : "$1",
    '(us)es$'                : "$1",
    's$'                     : ""
};

const irregular: any = {
    'move'   : 'moves',
    'foot'   : 'feet',
    'goose'  : 'geese',
    'sex'    : 'sexes',
    'child'  : 'children',
    'man'    : 'men',
    'tooth'  : 'teeth',
    'person' : 'people'
};

const uncountable = [
    'sheep', 
    'fish',
    'deer',
    'moose',
    'series',
    'species',
    'money',
    'rice',
    'information',
    'equipment'
];

export function pluralize(value: string, revert?: boolean) {
  if (uncountable.indexOf(value.toLowerCase()) >= 0)
    return value;

  for(let word in irregular){
    let pattern, replace;

    if (revert) {
      pattern = new RegExp(irregular[word]+'$', 'i');
      replace = word;
    } else { 
      pattern = new RegExp(word+'$', 'i');
      replace = irregular[word];
    }
    if(pattern.test(value))
      return value.replace(pattern, replace);
  }

  let array: any = plural;
  if (revert)
    array = singular;

  for(let reg in array){

    let pattern = new RegExp(reg, 'i');

    if(pattern.test(value))
      return value.replace(pattern, array[reg]);
  }

  return value;
}

export const wordList = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", 
    "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", 
    "incididunt", "ut", "labore", "et", "dolore", "magna", 
    "aliqua", "viverra", "tellus", "in", "hac", "habitasse", 
    "platea", "dictumst", "iaculis", "urna", "id", "volutpat", 
    "lacus", "nisl", "nisi", "scelerisque", "eu", "ultrices", 
    "porttitor", "rhoncus", "purus", "non", "enim", "praesent", 
    "elementum", "facilisis", "leo", "velit", "dignissim", "sodales", 
    "sem", "integer", "vitae", "justo", "eget", "cursus", "congue", 
    "mauris", "aenean", "vel", "elit", "scelerisque", "accumsan",
    "ultrices", "vitae", "neque", "ac", "tincidunt", "semper",
    "quis", "nunc", "arcu", "pellentesque", "pulvinar",
    "habitant", "morbi", "metus", "vulputate", "felis", "imperdiet", 
    "proin", "mi", "bibendum", "egestas", "congue", "phasellus",
    "rutrum", "eu", "cras", "mattis", "blandit", "libero", "faucibus", 
    "turpis", "in", "justo", "auctor", "augue", "lectus",
    "in", "tellus", "integer", "feugiat", "scelerisque", "augue",
    "neque", "gravida", "fermentum", "et", "sollicitudin", "ac",
    "orci", "ut", "placerat", "orci", "nulla", "pellentesque",
    "dignissim", "enim", "tortor", "convallis", "aenean", "at",
    "risus", "viverra", "adipiscing", "mauris", "pharetra", 
    "ultrices", "ornare", "aenean", "pretium", "suspendisse", 
    "potenti", "nullam", "vitae", "purus", "pulvinar", 
    "habitant", "morbi", "tristique", "senectus", "et", 
    "vivamus", "arcu", "felis", "bibendum", "tristique", 
    "tempor", "dapibus", "iaculis", "purus", "faucibus",
    "sed", "nisi", "quam", "lacus", "interdum", 
    "posuere", "lorem", "ipsum", "blandit", "turpis", "cursus", 
    "hac", "habitasse", "sagittis", "leo", "duis", "diam", "mi", 
    "ipsum", "aliquet", "nec", "ullamcorper", "sit", "posuere", 
    "sit", "amet", "facilisi", "morbi", "volutpat", "consequat", 
    "nunc", "congue", "odio", "eu", "nibh", "nisl", "massa", "ultricies", 
    "tincidunt", "id", "aliquet", "est", "ante", "nibh", "aliquam"
]

export class LoremIpsum {

    public static randomBetween(min: number, max: number) {
        return min + Math.floor(Math.random() * max - min);
    }
    
    public static generate() {
        let sentence = "",
            length = this.randomBetween(7, 15),
            comma = 0,
            nextComma = this.randomBetween(5, 10);
    
        for (let i = 0; i <= length; i++) {
            sentence += wordList[this.randomBetween(0, wordList.length)];
            if (i > 5 && comma >= nextComma && i != length) {
                sentence += ',';
                comma = 0;
                nextComma = this.randomBetween(5, 10);
            }         
            comma++;        
            sentence += i != length ? ' ' : '';
        }   
    
        sentence += '. ';
        return StringUtils.capitalize(sentence);
    }
}


export type ClassType<T> = (new (...args: any[]) => T) | string;

export class StringUtils {
    public static className<T>(e: ClassType<T>): string {
        return typeof e === "string" ? e : e.name;
    }

    public static camelCase(value: string): string {
        if (!value) return "";
        return value
            .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
                if (+match === 0) return "";
                return index === 0 ? match.toLowerCase() : match.toUpperCase();
            });
    }

    public static sort(left: string, right: string): number {
        return left.localeCompare(right);
    }

    public static capitalize(value: string): string {
        if (!value) return "";
        return value.charAt(0).toUpperCase() + value.slice(1).toLocaleLowerCase();
    }

    public static combine(strings: string[], slug: string = " "): string {
        return strings.join(slug);
    }

    public static endsWith(value: string, comparator: string): boolean {
        return value?.endsWith(comparator) ?? false;
    }

    public static finish(value: string, finish: string): string {
        if (!value) return "";
        return value.endsWith(finish) ? value : value + finish;
    }

    public static lorem(length: number): string {
        let lorem = "";
        while (lorem.length <= length) {
            lorem += LoremIpsum.generate();
        }
        lorem = lorem.slice(0, length);
        if (lorem[lorem.length - 1] !== ".") lorem += ".";
        return lorem;
    }

    public static kebabCase(value: string): string {
        return value?.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase() ?? "";
    }

    public static limit(value: string, limit: number, append: string = ""): string {
        return value?.length > limit ? value.slice(0, limit) + append : value ?? "";
    }

    public static plural(value: string): string {
        return pluralize(value || "");
    }

    public static random(length: number): string {
        let str = "";
        while (str.length < length) {
            str += Math.random().toString(36).slice(2);
        }
        return str.slice(0, length);
    }

    public static replaceArray(char: string, replacements: string[], value: string): string {
        return replacements.reduce((val, replace) => StringUtils.replaceFirst(char, replace, val), value || "");
    }

    public static replaceFirst(char: string, replace: string, value: string): string {
        return value?.replace(new RegExp(char), replace) ?? "";
    }

    public static replaceLast(char: string, replace: string, value: string): string {
        return value?.replace(new RegExp(`${char}([^${char}]*)$`), replace) ?? "";
    }

    public static removeSlug(value: string, slug: string = "-"): string {
        return StringUtils.titleCase(value?.replace(new RegExp(slug, "gi"), " ") ?? "");
    }

    public static singular(value: string): string {
        return pluralize(value || "", true);
    }

    public static slug(value: string, slug: string = "-"): string {
        return value?.toLowerCase().replace(/\s+/g, slug) ?? "";
    }

    public static snake(value: string): string {
        return StringUtils.kebabCase(value).replace(/-/g, "_");
    }

    public static studly(value: string): string {
        return value
            ?.split(/ |-|_/g)
            .map(StringUtils.capitalize)
            .join("") ?? "";
    }

    public static startsWith(value: string, comparator: string): boolean {
        return value?.startsWith(comparator) ?? false;
    }

    public static start(value: string, start: string): string {
        return value?.startsWith(start) ? value : start + value;
    }

    public static titleCase(value: string): string {
        return value?.replace(/\w\S*/g, (word) => StringUtils.capitalize(word)) ?? "";
    }

    public static urlSafe(value: string): string {
        return encodeURIComponent(value?.replace(/\s+/g, "_") || "").toLowerCase();
    }

    public static fromUrl(value: string): string {
        return decodeURIComponent(value?.replace(/_/g, " ") || "");
    }

    public static UUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    public static reverse(value: string): string {
        return value?.split("").reverse().join("") ?? "";
    }

    public static isPalindrome(value: string): boolean {
        const cleaned = value?.toLowerCase().replace(/\W/g, "");
        return cleaned === StringUtils.reverse(cleaned);
    }
}

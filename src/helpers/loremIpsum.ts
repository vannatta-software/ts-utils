import { StringUtils } from "../StringUtils";

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

function randomBetween(min: number, max: number) {
    return min + Math.floor(Math.random() * max - min);
}

export function generate() {
    let sentence = "",
        length = randomBetween(7, 15),
        comma = 0,
        nextComma = randomBetween(5, 10);

    for (let i = 0; i <= length; i++) {
        sentence += wordList[randomBetween(0, wordList.length)];
        if (i > 5 && comma >= nextComma && i != length) {
            sentence += ',';
            comma = 0;
            nextComma = randomBetween(5, 10);
        }         
        comma++;        
        sentence += i != length ? ' ' : '';
    }   

    sentence += '. ';
    return StringUtils.capitalize(sentence);
}
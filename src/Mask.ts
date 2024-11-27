let DIGIT = "9",
    ALPHA = "A",
    ALPHANUM = "S";

export function customMask(value, opts) {    
    let pattern = (typeof opts === 'object' ? opts.pattern : opts),
        patternChars = pattern.replace(/\W/g, ''),
        output = pattern.split(""),
        values = value.toString().replace(/\W/g, ""),
        charsValues = values.replace(/\W/g, ''),
        index = 0,
        i,
        outputLength = output.length
    ;

    for (i = 0; i < outputLength; i++) {
        // Reached the end of input
        if (index >= values.length) {
            if (patternChars.length == charsValues.length) {
                return output.join("");
            }
            else {
                break;
            }
        }
        // Remaining chars in input
        else{
            if ((output[i] === DIGIT && values[index].match(/[0-9]/)) ||
                (output[i] === ALPHA && values[index].match(/[a-zA-Z]/)) ||
                (output[i] === ALPHANUM && values[index].match(/[0-9a-zA-Z]/))) {
                output[i] = values[index++];
            } else if (output[i] === DIGIT || output[i] === ALPHA || output[i] === ALPHANUM) {                
                return output.slice(0, i).join("");
            // exact match for a non-magic character
            } else if (output[i] === values[index]) {
                index++;
            }

        }
    }
    return output.join("").substr(0, i);
};

export function moneyMask(number, symbol) {
    let places = 2;
    symbol = symbol !== undefined ? symbol : "$";
    let thousand = ",";
    let decimal = ".";
    var negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;

    var value = parseInt(i);
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + 
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + 
        (places ? decimal + Math.abs(number - value).toFixed(places).slice(2) : "");
};
    

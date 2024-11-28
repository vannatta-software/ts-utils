export abstract class ValueObject {
    protected abstract getAtomicValues(): IterableIterator<any>;

    equals(obj?: ValueObject): boolean {
        if (!obj || this.constructor !== obj.constructor) 
            return false;

        const thisValues = Array.from(this.getAtomicValues()).sort((a, b) => a - b);
        const otherValues = Array.from(obj.getAtomicValues()).sort((a, b) => a - b);

        if (thisValues.length !== otherValues.length)
            return false;

        for (let i = 0; i < thisValues.length; i++) {
            if (!thisValues[i] === otherValues[i])
                return false
        }

        return true;
    }

    getCopy(): ValueObject {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
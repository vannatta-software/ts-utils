import { ValueObject } from "../ValueObject";

class S extends ValueObject {
    constructor(public a: number, public b: string) {
        super();
    }

    protected *getAtomicValues(): IterableIterator<any> {
        yield this.a;
        yield this.b;
    }
}

class T extends ValueObject {
    constructor(public c: number) {
        super();
    }

    protected *getAtomicValues(): IterableIterator<any> {
        yield this.c;
    }
}

describe('ValueObject', () => {
    it('should compare two ValueObjects for equality', () => {
        const obj1 = new S(1, 'test');
        const obj2 = new S(1, 'test');
        const obj3 = new S(2, 'test');
        const obj4 = new T(1); // Different constructor

        expect(obj1.equals(obj2)).toBe(true);
        expect(obj1.equals(obj3)).toBe(false);
        expect(obj1.equals(null)).toBe(false);
        expect(obj1.equals(undefined)).toBe(false);
        expect(obj1.equals(obj4)).toBe(false); // Different constructor
    });

    it('should return a copy of the ValueObject', () => {
        const obj1 = new S(1, 'test');
        const copy = obj1.getCopy();

        expect(copy).toEqual(obj1);
        expect(copy).not.toBe(obj1); // Ensure it's a new instance
        expect(copy.constructor).toBe(obj1.constructor);
    });

    it('should return the correct string representation', () => {
        const obj1 = new S(1, 'test');
        expect(obj1.toString()).toEqual('S(1, test)');
    });
});

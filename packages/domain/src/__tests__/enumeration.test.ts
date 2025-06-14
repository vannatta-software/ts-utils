import { Enumeration } from "../Enumeration";

describe('Enumeration', () => {
    class Color extends Enumeration {
        static Red = new Color({ id: 1, name: 'Red' });
        static Green = new Color({ id: 2, name: 'Green' });
        static Blue = new Color({ id: 3, name: 'Blue' });
    
        constructor(en?: Partial<Color>) {
            super(en);
        }
    }

    it('should return all names of the enumeration', () => {
        const color = new Color();
        const names = color.getNames();

        expect(names).toContain('Red');
        expect(names).toContain('Green');
        expect(names).toContain('Blue');
        expect(names.length).toEqual(3);
    });

    it('should create an instance with the correct id and name', () => {
        const red = Color.Red;
        expect(red.id).toEqual(1);
        expect(red.name).toEqual('Red');
    });

    it('should return the correct instance from name', () => {
        const green = new Color().fromName('Green');
        expect(green).toBeInstanceOf(Color);
        expect(green).toEqual(Color.Green);
    });

    it('should return the correct instance from id', () => {
        const blue = new Color().from(3);
        expect(blue).toBeInstanceOf(Color);
        expect(blue).toEqual(Color.Blue);
    });

    it('should throw an error for a name that does not exist', () => {
        expect(() => new Color().fromName('Yellow')).toThrow();
    });

    it('should throw an error for an id that does not exist', () => {
        expect(() => new Color().from(4)).toThrow();
    });

    it('should return true for matching enumerations', () => {
        expect(Color.Red.equals(Color.Red)).toBeTruthy();
    });

    it('should return false for non-matching enumerations', () => {
        expect(Color.Red.equals(Color.Green)).toBeFalsy();
    });

    it('should return all instances', () => {
        const colors = new Color().getAllInstances();
        expect(colors).toContain(Color.Red);
        expect(colors).toContain(Color.Green);
        expect(colors).toContain(Color.Blue);
        expect(colors.length).toEqual(3);
    });

    it('should calculate the correct difference between two values (instance method)', () => {
        const colorInstance = new Color();
        const diff = colorInstance.difference(Color.Red, Color.Blue);
        expect(diff).toEqual(2);
    });

    it('should correctly compare two values (instance method)', () => {
        expect(Color.Red.compareTo(Color.Green)).toBe(1);
        expect(Color.Green.compareTo(Color.Red)).toBe(1);
        expect(Color.Red.compareTo(Color.Red)).toBe(0);
    });

    it('should initialize with default id and name if not provided in constructor', () => {
        class DefaultEnum extends Enumeration {
            static Default = new DefaultEnum();
            constructor(en?: Partial<DefaultEnum>) {
                super(en);
            }
        }
        const defaultInstance = DefaultEnum.Default;
        expect(defaultInstance.id).toEqual(0);
        expect(defaultInstance.name).toEqual('');
    });

    it('should return false when comparing with null or undefined enumeration', () => {
        expect(Color.Red.equals(null as any)).toBeFalsy();
        expect(Color.Red.equals(undefined as any)).toBeFalsy();
    });

    it('should return false when comparing with an enumeration of a different class', () => {
        class Shape extends Enumeration {
            static Circle = new Shape({ id: 1, name: 'Circle' });
            constructor(en?: Partial<Shape>) {
                super(en);
            }
        }
        expect(Color.Red.equals(Shape.Circle)).toBeFalsy();
    });

    it('should return false when comparing enumerations with same type but different id/name', () => {
        class TestColor extends Enumeration {
            static Red1 = new TestColor({ id: 1, name: 'Red' });
            static Red2 = new TestColor({ id: 2, name: 'Red' }); // Same name, different id
            static Blue1 = new TestColor({ id: 1, name: 'Blue' }); // Same id, different name
            constructor(en?: Partial<TestColor>) {
                super(en);
            }
        }
        expect(TestColor.Red1.equals(TestColor.Red2)).toBeFalsy();
        expect(TestColor.Red1.equals(TestColor.Blue1)).toBeFalsy();
    });

    it('static fromName should throw error if name is empty or null', () => {
        expect(() => Enumeration.fromName(Color, '')).toThrow('No value was provided for the enum');
        expect(() => Enumeration.fromName(Color, null as any)).toThrow('No value was provided for the enum');
    });

    it('static fromName should throw error if instance not found', () => {
        expect(() => Enumeration.fromName(Color, 'Yellow')).toThrow('No instance found with name: Yellow. Available: Red, Green, Blue');
    });

    it('static from should throw error if id is empty or null', () => {
        expect(() => Enumeration.from(Color, null as any)).toThrow('No value was provided for the enum');
    });

    it('static from should return instance for id 0 if registered', () => {
        class ZeroIdEnum extends Enumeration {
            static Zero = new ZeroIdEnum({ id: 0, name: 'Zero' });
            constructor(en?: Partial<ZeroIdEnum>) {
                super(en);
            }
        }
        expect(Enumeration.from(ZeroIdEnum, 0)).toEqual(ZeroIdEnum.Zero);
    });

    it('static from should throw error if instance not found', () => {
        expect(() => Enumeration.from(Color, 4)).toThrow('Possible values for Color: 1, 2, 3');
    });

    it('instance fromName should throw error if name is empty or null', () => {
        const colorInstance = new Color();
        expect(() => colorInstance.fromName('')).toThrow('No value was provided for the enum');
        expect(() => colorInstance.fromName(null as any)).toThrow('No value was provided for the enum');
    });

    it('instance fromName should throw error if instance not found', () => {
        const colorInstance = new Color();
        expect(() => colorInstance.fromName('Yellow')).toThrow('Possible values for Color: Red, Green, Blue');
    });

    it('instance from should throw error if id is empty or null', () => {
        const colorInstance = new Color();
        expect(() => colorInstance.from(null as any)).toThrow('Possible values for Color: 1, 2, 3'); // The error message is different for instance from
    });

    it('instance from should throw error if instance not found', () => {
        const colorInstance = new Color();
        expect(() => colorInstance.from(4)).toThrow('Possible values for Color: 1, 2, 3');
    });

    it('static names should return all names of the enumeration', () => {
        const names = Enumeration.names(Color);
        expect(names).toContain('Red');
        expect(names).toContain('Green');
        expect(names).toContain('Blue');
        expect(names.length).toEqual(3);
    });

    it('static difference should calculate the correct difference between two values', () => {
        const diff = Enumeration.difference(Color.Red, Color.Blue);
        expect(diff).toEqual(2);
    });

    it('should return 0 when comparing with null or undefined enumeration in compareTo', () => {
        expect(Color.Red.compareTo(null as any)).toBe(0);
        expect(Color.Red.compareTo(undefined as any)).toBe(0);
    });

    it('should return the name when toString() is called', () => {
        expect(Color.Red.toString()).toEqual('Red');
    });
});

import { UniqueIdentifier } from "../UniqueIdentifier";

describe('UniqueIdentifier', () => {
    it('should create a new UniqueIdentifier with a UUID', () => {
        const identifier = UniqueIdentifier.generate();
        expect(identifier.value).toMatch(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    });

    it('should recognize an equal UniqueIdentifier', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const identifier1 = new UniqueIdentifier(uuid);
        const identifier2 = new UniqueIdentifier(uuid);
        expect(identifier1.equals(identifier2)).toBeTruthy();
    });

    it('should correctly parse a valid UUID string', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const identifier = UniqueIdentifier.parse(uuid);
        expect(identifier.value).toEqual(uuid);
    });

    it('should throw an error for invalid UUID format', () => {
        const invalidUUID = 'invalid-uuid';
        expect(() => UniqueIdentifier.parse(invalidUUID)).toThrow();
    });

    it('should return the correct string representation when used in string context (Symbol.toPrimitive)', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const identifier = new UniqueIdentifier(uuid);
        expect(String(identifier)).toEqual(uuid);
        expect(`${identifier}`).toEqual(uuid);
        // The Number() conversion of a UUID string results in NaN, which is expected behavior.
        // This line ensures the 'number' hint path in Symbol.toPrimitive is covered.
        Number(identifier);
    });

    it('should return the correct string representation when toString() is called', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const identifier = new UniqueIdentifier(uuid);
        expect(identifier.toString()).toEqual(uuid);
    });

    it('should return the correct string representation when valueOf() is called', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const identifier = new UniqueIdentifier(uuid);
        expect(identifier.valueOf()).toEqual(uuid);
    });

    it('should recognize an unequal UniqueIdentifier', () => {
        const uuid1 = '123e4567-e89b-12d3-a456-426614174000';
        const uuid2 = '00000000-0000-0000-0000-000000000000';
        const identifier1 = new UniqueIdentifier(uuid1);
        const identifier2 = new UniqueIdentifier(uuid2);
        expect(identifier1.equals(identifier2)).toBeFalsy();
    });

    it('should return the empty UniqueIdentifier', () => {
        const emptyIdentifier = UniqueIdentifier.Empty;
        expect(emptyIdentifier.value).toEqual('00000000-0000-0000-0000-000000000000');
    });
});

import {Validator} from '../Validator'; // Assuming the Validator class is in this file

describe('Validator Tests', () => {
    let validator: Validator;

    beforeEach(() => {
        validator = new Validator();
    });

    test('URL validation', () => {
        expect(validator.validate('https://example.com', { url: true })).toBe(true);
        expect(validator.validate('invalid-url', { url: true })).toBe(false);
    });

    test('Phone number validation', () => {
        expect(validator.validate('123-456-7890', { phone: true })).toBe(true);
        expect(validator.validate('1234567890', { phone: true })).toBe(false);
        expect(validator.validate('123-456-789', { phone: true })).toBe(false);
    });

    test('Credit Card validation', () => {
        expect(validator.validate('4111111111111111', { creditCard: true })).toBe(true);
        expect(validator.validate('1234567812345678', { creditCard: true })).toBe(false);
        expect(validator.validate('5555555555554444', { creditCard: true })).toBe(true);
        expect(validator.validate('1234-5678-9101-1121', { creditCard: true })).toBe(false);
    });

    test('Required validation', () => {
        expect(validator.validate('Test value', { required: true })).toBe(true);
        expect(validator.validate('', { required: true })).toBe(false);
        expect(validator.validate(null, { required: true })).toBe(false);
        expect(validator.validate(undefined, { required: true })).toBe(false);
    });

    test('AlphaNumeric validation', () => {
        expect(validator.validate('Test123', { alphaNumeric: true })).toBe(true);
        expect(validator.validate('Test-123', { alphaNumeric: true })).toBe(false);
        expect(validator.validate('1234', { alphaNumeric: true })).toBe(true);
        expect(validator.validate('1234@#$', { alphaNumeric: true })).toBe(false);
    });

    test('Numeric validation', () => {
        expect(validator.validate('12345', { numeric: true })).toBe(true);
        expect(validator.validate('-12345', { numeric: true })).toBe(true);
        expect(validator.validate('123.45', { numeric: true })).toBe(false);
        expect(validator.validate('Test123', { numeric: true })).toBe(false);
    });

    test('Alpha validation', () => {
        expect(validator.validate('Test', { alpha: true })).toBe(true);
        expect(validator.validate('Test123', { alpha: true })).toBe(false);
        expect(validator.validate('12345', { alpha: true })).toBe(false);
    });

    test('Decimal validation', () => {
        expect(validator.validate('123.45', { decimal: true })).toBe(true);
        expect(validator.validate('123', { decimal: true })).toBe(true);
        expect(validator.validate('Test123', { decimal: true })).toBe(false);
        expect(validator.validate('123.456', { decimal: true })).toBe(true);
    });

    test('Currency validation', () => {
        expect(validator.validate('123.45', { currency: true })).toBe(true);
        expect(validator.validate('$123.45', { currency: true })).toBe(true);
        expect(validator.validate('123.4', { currency: true })).toBe(false);
        expect(validator.validate('123.456', { currency: true })).toBe(false);
    });

    test('Min validation', () => {
        expect(validator.validate('Hello', { min: 3 })).toBe(true);
        expect(validator.validate('Hi', { min: 3 })).toBe(false);
        expect(validator.validate('12345', { min: 4 })).toBe(true);
        expect(validator.validate('123', { min: 4 })).toBe(false);
    });

    test('Max validation', () => {
        expect(validator.validate('Hello', { max: 10 })).toBe(true);
        expect(validator.validate('Hello', { max: 4 })).toBe(false);
        expect(validator.validate('12345', { max: 6 })).toBe(true);
        expect(validator.validate('1234567', { max: 6 })).toBe(false);
    });

    test('Strength validation', () => {
        expect(validator.validate('Password123!', { strength: 4 })).toBe(true);
        expect(validator.validate('Password', { strength: 1 })).toBe(true);
        expect(validator.validate('password', { strength: 1 })).toBe(false);
        expect(validator.validate('1234', { strength: 2 })).toBe(false);
    });

    test('OneOf validation', () => {
        expect(validator.validate('apple', { oneOf: ['apple', 'banana', 'cherry'] })).toBe(true);
        expect(validator.validate('orange', { oneOf: ['apple', 'banana', 'cherry'] })).toBe(false);
    });

    test('Email validation', () => {
        expect(validator.validate('test@example.com', { email: true })).toBe(true);
        expect(validator.validate('invalid-email', { email: true })).toBe(false);
    });

    test('Integer validation', () => {
        expect(validator.validate('12345', { integer: true })).toBe(true);
        expect(validator.validate('123.45', { integer: true })).toBe(false);
        expect(validator.validate('Test123', { integer: true })).toBe(false);
    });

    test('UUID validation', () => {
        expect(validator.validate('123e4567-e89b-12d3-a456-426614174000', { uuid: true })).toBe(true);
        expect(validator.validate('invalid-uuid', { uuid: true })).toBe(false);
        expect(validator.validate('123e4567-e89b-12d3-a456-42661417400', { uuid: true })).toBe(false); // Too short
        expect(validator.validate('123e4567-e89b-12d3-a456-4266141740000', { uuid: true })).toBe(false); // Too long
        expect(validator.validate('g23e4567-e89b-12d3-a456-426614174000', { uuid: true })).toBe(false); // Invalid character
    });
});

import { v4 as uuid } from "uuid";

export class UniqueIdentifier {
    public value: string;

    constructor(value: string) {
        this.value = value
    }

    static generate(): UniqueIdentifier {
        return new UniqueIdentifier(uuid());
    }

    static parse(value: string | UniqueIdentifier): UniqueIdentifier {
        if (value instanceof UniqueIdentifier) {
            return value;
        }
        if (typeof value !== 'string') {
            throw new Error("Value must be a string or UniqueIdentifier instance.");
        }
        value = value.trim();
        if (value === '') {
            throw new Error("Value cannot be an empty string.");
        }
        // Validate UUID format (version 4)
        if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) {
            return new UniqueIdentifier(value);
        }
        throw new Error("Invalid UniqueIdentifier format.");
    }

    static get Empty(): UniqueIdentifier {
        return new UniqueIdentifier('00000000-0000-0000-0000-000000000000');
    }

    /**
     * Defines how UniqueIdentifier instances are converted to primitive values.
     * This is crucial for implicit string conversions (e.g., console.log, string concatenation).
     */
    [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string {
        if (hint === 'string' || hint === 'default') {
            return this.value;
        }
        return this.value;
    }

    /**
     * Overrides the default toString method to return the underlying UUID string.
     * Useful for explicit string conversions.
     */
    toString(): string {
        return this.value;
    }

    /**
     * Overrides the default valueOf method to return the underlying UUID string.
     * Important for some implicit conversions and comparisons.
     */
    valueOf(): string {
        return this.value;
    }

    equals(other: UniqueIdentifier): boolean {
        return this.value === other.value;
    }
}

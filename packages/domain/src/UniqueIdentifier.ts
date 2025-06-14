 import { v4 as uuid } from "uuid";
import { Schema } from "@vannatta-software/ts-utils-core";

export class UniqueIdentifier {
    @Schema({ type: String, default: function genUUID() {
        return uuid()
    }})
    public value: string;

    constructor(value: string) {
        this.value = value
    }

    static generate(): UniqueIdentifier {
        return new UniqueIdentifier(uuid());
    }

    static parse(value: string): UniqueIdentifier {
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

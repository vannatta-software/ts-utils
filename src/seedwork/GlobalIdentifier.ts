import { v4 as uuid } from "uuid";
import { Schema } from "../ReflectionUtils";

export class GlobalIdentifier {
    @Schema({ type: String, default: function genUUID() {
        return uuid()
    }})
    public value: string;

    constructor(value: string) {
        this.value = value
    }

    static newGlobalIdentifier(): GlobalIdentifier {
        return new GlobalIdentifier(uuid());
    }

    static parse(value: string): GlobalIdentifier {
        if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) {
            return new GlobalIdentifier(value);
        }
        throw new Error("Invalid GlobalIdentifier format.");
    }

    static get Empty(): GlobalIdentifier {
        return new GlobalIdentifier('00000000-0000-0000-0000-000000000000');
    }

    toString(): string {
        return this.value;
    }

    equals(other: GlobalIdentifier): boolean {
        return this.value === other.value;
    }
}
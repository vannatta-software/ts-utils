import { Schema } from "../ReflectionUtils";

export abstract class Enumeration {
    @Schema({ type: Number })
    public id: number
    @Schema({ type: String })
    public name: string
    private static registry: Enumeration[] = [];

    protected constructor(en?: Partial<Enumeration>) {
        this.id = en?.id ?? 0;
        this.name = en?.name ?? "";
        Enumeration.register(this); 
    }
    
    private static register(instance: Enumeration): void {
        Enumeration.registry.push(instance);
    }

    toString(): string {
        return this.name;
    }

    equals(other: Enumeration): boolean {
        if (!other) return false;

        const typeMatches = this.constructor === other.constructor;
        const idMatches = this.id === other.id;
        const nameMatches = this.name === other.name;

        return typeMatches && idMatches && nameMatches;
    }

    difference(firstValue: Enumeration, secondValue: Enumeration): number {
        return Math.abs(firstValue.id - secondValue.id);
    }

    fromName<T extends Enumeration>(name?: string): T {
        const list = this.getAllInstances<T>();
        const formattedName = name ? name.toLowerCase() : "";
        const state = list.find(s => s.name.toLowerCase() === formattedName);

        if (!state) {
            throw new Error(`Possible values for ${this.name}: ${list.map(s => s.name).join(", ")}`);
        }

        return state as T;
    }

    from<T extends Enumeration>(id: number): T {
        const list = this.getAllInstances<T>();
        const state = list.find(s => s.id === id);

        if (!state) {
            throw new Error(`Possible values for ${this.name}: ${list.map(s => s.name).join(", ")}`);
        }

        return state as T;
    }

    getAllInstances<T extends Enumeration>(): T[] {
        return Enumeration.registry.filter(e => e instanceof this.constructor) as T[];
    }

    static difference(firstValue: Enumeration, secondValue: Enumeration): number {
        return Math.abs(firstValue.id - secondValue.id);
    }

    compareTo(other: Enumeration): number {
        if (!other) return 0;

        if (this.id === other.id || this.name === other.name) return 0;

        return 1;
    }
}

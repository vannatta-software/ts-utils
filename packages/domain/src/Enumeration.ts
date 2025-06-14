import { Schema } from "@vannatta-software/ts-utils-core";

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

    getNames(): string[] {
        return this.getAllInstances().map((instance) => instance.name);
    }

    static getAllInstances<T>(enumClass: new (...args: any[]) => T): T[] {
        const instances: T[] = [];
        const keys = Object.getOwnPropertyNames(enumClass);

        keys.forEach((key) => {
            const value = (enumClass as any)[key];
            if (value instanceof enumClass) {
                instances.push(value);
            }
        });

        return instances;
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

    /**
     * Finds an enumeration instance by name.
     * @param enumClass The enumeration class to search.
     * @param name The name of the instance to find.
     * @returns The matching instance or throws an error if not found.
     */
    static fromName<T extends { name: string }>(
        enumClass: new (...args: any[]) => T,
        name: string
    ): T {
        if (!name) {
            throw new Error("No value was provided for the enum")
        }

        const allInstances = this.getAllInstances(enumClass);
        const instance = allInstances.find(
            (instance) => instance.name.toLowerCase() === name.toLowerCase()
        );

        if (!instance) {
            throw new Error(
                `No instance found with name: ${name}. Available: ${allInstances
                    .map((i) => i.name)
                    .join(", ")}`
            );
        }

        return instance;
    }
    
    static from<T extends { id: string }>(
        enumClass: new (...args: any[]) => T,
        id: string
    ): T {
        if (!id) {
            throw new Error("No value was provided for the enum")
        }

        const allInstances = this.getAllInstances(enumClass);
        const state = allInstances.find(s => s.id === id);

        if (!state) {
            throw new Error(`Possible values for ${this.name}: ${allInstances.map(s => s.id).join(", ")}`);
        }

        return state as T;
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
    
    /**
     * Retrieves the names of all static instances of an enumeration class.
     * @param enumClass The enumeration class to extract names from.
     * @returns An array of names of all static instances.
     */
       static names<T extends { name: string }>(enumClass: new (...args: any[]) => T): string[] {
        return this.getAllInstances(enumClass).map((instance) => instance.name);
    }

    from<T extends Enumeration>(id: number): T {
        const list = this.getAllInstances<T>();
        const state = list.find(s => s.id === id);

        if (!state) {
            throw new Error(`Possible values for ${this.name}: ${list.map(s => s.name).join(", ")}`);
        }

        return state as T;
    }

    static difference(firstValue: Enumeration, secondValue: Enumeration): number {
        return Math.abs(firstValue.id - secondValue.id);
    }

    getAllInstances<T extends Enumeration>(): T[] {
        return Enumeration.registry.filter(e => e instanceof this.constructor && e.name != "") as T[];
    }

    compareTo(other: Enumeration): number {
        if (!other) return 0;

        if (this.id === other.id || this.name === other.name) return 0;

        return 1;
    }
}

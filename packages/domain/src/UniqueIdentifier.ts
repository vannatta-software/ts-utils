import { Schema } from "@vannatta-software/ts-utils-core";
import { ValueObject } from "./ValueObject";

export class UniqueIdentifier extends ValueObject  {
    @Schema({ type: String  })
    public value: string;
    
    @Schema({ type: String  })
    public context: string;

    constructor(id?: Partial<UniqueIdentifier>) {
        super();
        this.value = id?.value ?? "";
        this.context = id?.context ?? "";
    }

    rename(name: string): void {
        this.value = name;
    }

    get scriptFormat(): string {
        return this.value.replace(/ /g, '_').replace(/-/g, '_');
    }

    get fileFormat(): string {
        return this.value.toLowerCase().replace(/ /g, '-').replace(/_/g, '-');
    }

    setContext(identifier: UniqueIdentifier | string): void {
        this.context = typeof identifier === 'string' ? identifier : identifier.nameInContext;
    }

    hasContext(identifier: UniqueIdentifier | string): boolean {
        const scope = typeof identifier === 'string' ? identifier : identifier.nameInContext;
        return this.context.includes(scope);
    }

    get nameInContext(): string {
        return this.context && this.context !== "" ? `${this.context}-${this.value}` : this.value;
    }

    toString(): string {
        return this.value;
    }

    protected *getAtomicValues(): IterableIterator<any> {
        yield this.value;
    }
}

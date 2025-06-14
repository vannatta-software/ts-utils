import { AggregateRoot } from "../AggregateRoot";
import { Entity } from "../Entity";

describe('AggregateRoot', () => {
    class TestAggregate extends AggregateRoot {
        create(): void {}
        delete(): void {}
    }

    it('should instantiate correctly as an aggregate root', () => {
        const aggregate = new TestAggregate();
        expect(aggregate).toBeInstanceOf(AggregateRoot);
        expect(aggregate).toBeInstanceOf(Entity);
    });
});

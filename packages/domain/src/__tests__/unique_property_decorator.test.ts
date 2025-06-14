import { Entity, UniqueIdentifier, UniqueProperty, getUniqueProperties, ValueObject, Enumeration } from '../index';
import { v4 as uuid } from "uuid"; // Import uuid for direct generation

// Mock ValueObject and Enumeration for testing complex types
class MockValueObject extends ValueObject {
    constructor(public val: string) {
        super();
    }
    protected *getAtomicValues(): IterableIterator<any> {
        yield this.val;
    }
    toString(): string {
        return `MockVO:${this.val}`;
    }
}

class MockEnumeration { // No longer extends Enumeration to avoid constructor issues
    constructor(public value: string, public displayName: string) {
        // No super call needed as it doesn't extend Enumeration
    }
    // Define static factory methods to mimic Enumeration behavior for test setup
    static OptionA = new MockEnumeration('A', 'Option A');
    static OptionB = new MockEnumeration('B', 'Option B');

    toString(): string {
        return `MockEnum:${this.value}`;
    }
}

// Define a mock Entity class to test the decorator
class MockProduct extends Entity {
    @UniqueProperty()
    sku: string;

    @UniqueProperty()
    color: string;

    name: string; // Not a unique property

    constructor(id: UniqueIdentifier, sku: string, color: string, name: string) {
        super();
        this.id = id;
        this.sku = sku;
        this.color = color;
        this.name = name;
    }

    create(): void { /* no-op */ }
    delete(): void { /* no-op */ }
}

class SimpleEntity extends Entity {
    data: string;
    constructor(id: UniqueIdentifier, data: string) {
        super();
        this.id = id;
        this.data = data;
    }
    create(): void { /* no-op */ }
    delete(): void { /* no-op */ }
}

// Define a mock Entity class with complex unique properties
class MockEntityWithComplexProps extends Entity {
    @UniqueProperty()
    voProp: MockValueObject;

    @UniqueProperty()
    enumProp: MockEnumeration;

    @UniqueProperty()
    relatedEntity: MockProduct; // Using MockProduct as a related entity

    description: string;

    constructor(
        id: UniqueIdentifier,
        voProp: MockValueObject,
        enumProp: MockEnumeration,
        relatedEntity: MockProduct,
        description: string
    ) {
        super();
        this.id = id;
        this.voProp = voProp;
        this.enumProp = enumProp;
        this.relatedEntity = relatedEntity;
        this.description = description;
    }

    create(): void { /* no-op */ }
    delete(): void { /* no-op */ }
}


describe('UniqueProperty Decorator', () => {
    it('should collect decorated property names correctly', () => {
        const uniqueProps = getUniqueProperties(MockProduct);
        expect(uniqueProps).toEqual(['sku', 'color']);
    });

    it('should generate a correct composite unique key for an instance', () => {
        const product1 = new MockProduct(
            new UniqueIdentifier(uuid()), // Changed to new UniqueIdentifier(uuid())
            'SKU001',
            'Red',
            'Red T-Shirt'
        );
        const product2 = new MockProduct(
            new UniqueIdentifier(uuid()), // Changed to new UniqueIdentifier(uuid())
            'SKU002',
            'Blue',
            'Blue Jeans'
        );
        const product3 = new MockProduct(
            new UniqueIdentifier(uuid()), // Changed to new UniqueIdentifier(uuid())
            'SKU001',
            'Red',
            'Another Red T-Shirt' // Same SKU and Color as product1, should have same composite key
        );

        expect(product1.compositeUniqueKey).toEqual('SKU001::Red');
        expect(product2.compositeUniqueKey).toEqual('SKU002::Blue');
        expect(product3.compositeUniqueKey).toEqual('SKU001::Red');

        // Demonstrate in-memory uniqueness check
        const products: MockProduct[] = [product1, product2];
        const isDuplicate = products.some(p => p.compositeUniqueKey === product3.compositeUniqueKey);
        expect(isDuplicate).toBe(true);
    });

    it('should handle classes with no unique properties', () => {
        const uniqueProps = getUniqueProperties(SimpleEntity);
        expect(uniqueProps).toEqual([]);

        const entity = new SimpleEntity(new UniqueIdentifier(uuid()), 'some data'); // Changed to new UniqueIdentifier(uuid())
        expect(entity.compositeUniqueKey).toEqual(''); // Empty string if no unique properties
    });

    it('should correctly identify conflicting unique properties in a collection', () => {
        const products: MockProduct[] = [];
        const product1 = new MockProduct(new UniqueIdentifier(uuid()), 'SKU001', 'Red', 'Red T-Shirt');
        const product2 = new MockProduct(new UniqueIdentifier(uuid()), 'SKU002', 'Blue', 'Blue Jeans');
        const product3_duplicate = new MockProduct(new UniqueIdentifier(uuid()), 'SKU001', 'Red', 'Another Red T-Shirt'); // Conflicting SKU and Color

        // Add unique products
        products.push(product1);
        products.push(product2);

        // Attempt to add a duplicate product
        const isDuplicate = Entity.hasConflicts(products.concat(product3_duplicate));
        expect(isDuplicate).toBe(true);

        // Verify the collection size remains unchanged if we were to prevent adding duplicates
        const initialSize = products.length;
        if (!isDuplicate) {
            products.push(product3_duplicate);
        }
        expect(products.length).toEqual(initialSize); // Should not add the duplicate
    });

    it('should generate correct composite unique key for entities with complex properties', () => {
        const relatedProduct = new MockProduct(new UniqueIdentifier(uuid()), 'REL_SKU', 'REL_Color', 'Related Item');
        const entity1 = new MockEntityWithComplexProps(
            new UniqueIdentifier(uuid()),
            new MockValueObject('val1'),
            MockEnumeration.OptionA,
            relatedProduct,
            'Complex Entity 1'
        );

        const expectedKey = `MockVO:val1::MockEnum:A::${relatedProduct.id.value}`; // Corrected expected key
        expect(entity1.compositeUniqueKey).toEqual(expectedKey);
    });

    it('should detect conflicts in a collection with complex unique properties', () => {
        const entities: MockEntityWithComplexProps[] = [];

        const relatedProduct1 = new MockProduct(new UniqueIdentifier(uuid()), 'REL_SKU1', 'REL_Color1', 'Related Item 1');
        const relatedProduct2 = new MockProduct(new UniqueIdentifier(uuid()), 'REL_SKU2', 'REL_Color2', 'Related Item 2');

        const entity1 = new MockEntityWithComplexProps(
            new UniqueIdentifier(uuid()),
            new MockValueObject('complexVal1'),
            MockEnumeration.OptionA,
            relatedProduct1,
            'First unique entity'
        );
        const entity2 = new MockEntityWithComplexProps(
            new UniqueIdentifier(uuid()),
            new MockValueObject('complexVal2'),
            MockEnumeration.OptionB,
            relatedProduct2,
            'Second unique entity'
        );
        const entity3_duplicate = new MockEntityWithComplexProps(
            new UniqueIdentifier(uuid()),
            new MockValueObject('complexVal1'), // Same as entity1
            MockEnumeration.OptionA,            // Same as entity1
            relatedProduct1,                    // Same as entity1
            'Duplicate complex entity'
        );

        entities.push(entity1);
        entities.push(entity2);

        // Check for conflict using the static method
        const hasConflict = Entity.hasConflicts(entities.concat(entity3_duplicate));
        expect(hasConflict).toBe(true);

        // Verify no conflict if all are unique
        const uniqueEntities = [entity1, entity2];
        expect(Entity.hasConflicts(uniqueEntities)).toBe(false);
    });
});

import 'reflect-metadata'; // Ensure reflect-metadata is loaded
import { UniqueIdentifier } from './src/UniqueIdentifier';
import { ReflectionUtils, SchemaMetadataKey, SchemaMetadata } from '@vannatta-software/ts-utils-core';

console.log('--- Running Schema Decorator Test (Outside Jest) ---');

try {
    // Attempt to retrieve schema metadata for UniqueIdentifier's 'value' property
    const schemaMetadata = ReflectionUtils.getMetadataForProperty<SchemaMetadata>(
        SchemaMetadataKey,
        UniqueIdentifier,
        'value'
    );

    if (schemaMetadata) {
        console.log('Schema metadata found for UniqueIdentifier.value:');
        console.log(JSON.stringify(schemaMetadata, null, 2));

        // Further check: ensure the 'type' and 'default' properties are as expected
        if (schemaMetadata.type === String && typeof schemaMetadata.default === 'function') {
            console.log('Schema metadata looks correct (type is String, default is a function).');
            console.log('Test PASSED: Schema decorator works correctly outside Jest.');
        } else {
            console.error('Test FAILED: Schema metadata found, but properties are not as expected.');
        }
    } else {
        console.error('Test FAILED: No schema metadata found for UniqueIdentifier.value.');
    }
} catch (error) {
    console.error('An error occurred during the test:');
    console.error(error);
    console.error('Test FAILED: An unexpected error prevented the test from completing.');
}

console.log('--- Test Complete ---');

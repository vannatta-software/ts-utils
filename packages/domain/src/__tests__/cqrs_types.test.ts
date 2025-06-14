import { UniqueIdentifier } from '../UniqueIdentifier'; // Corrected import path
import { Integration } from '../CqrsTypes';

// Mock UniqueIdentifier to control UUID generation for consistent testing
jest.mock('../UniqueIdentifier'); // Mock the module

describe('Integration', () => {
    let mockCallCount = 0;
    beforeEach(() => {
        jest.clearAllMocks();
        mockCallCount = 0; // Reset for each test
        (UniqueIdentifier.generate as jest.Mock).mockImplementation(() => { // Use generate()
            mockCallCount++;
            return { value: `mock-uuid-${mockCallCount}` };
        });
    });

    class MockDataType {
        prop1: string;
        constructor(prop1: string) {
            this.prop1 = prop1;
        }
    }

    it('should correctly initialize with data and type', () => {
        const testData = { message: 'Hello' };
        const integration = new Integration(testData, Object);

        expect(integration.name).toEqual('Object');
        expect(integration.data).toEqual(testData);
        expect(integration.eventId).toEqual('mock-uuid-1');
        expect(UniqueIdentifier.generate).toHaveBeenCalled(); // Expect generate() to be called
    });

    it('should use the provided string for "name" property if a string type is provided', () => {
        const testData = { status: 'completed' };
        const integration = new Integration(testData, 'OrderStatusUpdated');

        expect(integration.name).toEqual('OrderStatusUpdated');
        expect(integration.data).toEqual(testData);
        expect(integration.eventId).toEqual('mock-uuid-1');
    });

    it('should use the class name for "name" property if a class type is provided', () => {
        const testData = new MockDataType('test');
        const integration = new Integration(testData, MockDataType);

        expect(integration.name).toEqual('MockDataType');
        expect(integration.data).toEqual(testData);
        expect(integration.eventId).toEqual('mock-uuid-1');
    });

    it('should generate a new UniqueIdentifier for eventId', () => { // Updated description
        const testData = { value: 123 };
        const integration1 = new Integration(testData, Object);
        const integration2 = new Integration(testData, Object);

        // Ensure UniqueIdentifier.generate is called for each instance
        expect(UniqueIdentifier.generate).toHaveBeenCalledTimes(2); // Expect generate() to be called
        expect(integration1.eventId).not.toEqual(integration2.eventId); // Even with mock, it should be called again
    });
});

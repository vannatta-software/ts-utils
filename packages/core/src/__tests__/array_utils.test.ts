import { ArrayUtils } from '../ArrayUtils';

describe('ArrayUtils', () => {
  test('flatten should correctly flatten nested arrays', () => {
    const input = [1, [2, 3], 4, [5]];
    const expected = [1, 2, 3, 4, 5];
    expect(ArrayUtils.flatten(input)).toEqual(expected);
  });

  test('unique should filter out duplicate elements', () => {
    const input = [1, 2, 2, 3, 4, 4, 5];
    const expected = [1, 2, 3, 4, 5];
    expect(ArrayUtils.unique(input)).toEqual(expected);
  });

  test('combine should merge two sets', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([3, 4, 5]);
    ArrayUtils.combine(set1, set2);
    expect(set1).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  test('forEachRandom should visit each element exactly once', () => {
    const input = [1, 2, 3, 4, 5];
    const visited = new Set<number>();
    ArrayUtils.forEachRandom(input, (item) => {
      visited.add(item);
    });
    expect(visited.size).toBe(input.length);
  });

  test('arrayToMap should group elements by the specified property', () => {
    const input = [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
      { id: 'a', value: 3 },
    ];
    const expected = new Map([
      ['a', [{ id: 'a', value: 1 }, { id: 'a', value: 3 }]],
      ['b', [{ id: 'b', value: 2 }]],
    ]);
    expect(ArrayUtils.arrayToMap(input, 'id')).toEqual(expected);
  });

  test('chunk should split an array into chunks of specified size', () => {
    const input = [1, 2, 3, 4, 5];
    expect(ArrayUtils.chunk(input, 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('difference should return elements not in the other array', () => {
    const input = [1, 2, 3, 4];
    const other = [3, 4, 5];
    expect(ArrayUtils.difference(input, other)).toEqual([1, 2]);
  });

  test('intersection should return common elements between two arrays', () => {
    const input = [1, 2, 3, 4];
    const other = [3, 4, 5];
    expect(ArrayUtils.intersection(input, other)).toEqual([3, 4]);
  });

  test('shuffle should return an array of the same elements in random order', () => {
    const input = [1, 2, 3, 4];
    const shuffled = ArrayUtils.shuffle(input);
    expect(shuffled.sort()).toEqual(input.sort());
  });

  test('compact should remove null and undefined values', () => {
    const input = [1, null, 2, undefined, 3];
    expect(ArrayUtils.compact(input)).toEqual([1, 2, 3]);
  });

  test('groupBy should group elements based on callback', () => {
    const input = [1.1, 2.2, 3.3];
    const grouped = ArrayUtils.groupBy(input, (item) => Math.floor(item).toString());
    expect(grouped).toEqual({
      '1': [1.1],
      '2': [2.2],
      '3': [3.3],
    });
  });
});

export class ArrayUtils {
    public static flatten<T extends any>(connections: (T | T[])[]): T[] {
        let out: T[] = [];

        connections.forEach(conn => {
            if (Array.isArray(conn))
                out.push(...conn);
            else
                out.push(conn);
        });

        return out;
    }

    public static unique(array: any[]) {        
        const isUnique = (edge, index, self) => 
            self.indexOf(edge) === index;

        return array.filter(isUnique);
    }

    public static combine(set: Set<any>, other: Set<any>) {
        other.forEach(item => {
            if (!set.has(item))
                set.add(item);
        });
    }

    public static forEachRandom<T>(array: Array<T>, callback: (item: T, index: number ) => void) {
        let indices: number [] = [];

        while (indices.length != array.length) {
            let next = Math.floor(Math.random() * array.length);

            if (indices.includes(next))
                continue;

            callback(array[next], next);
            indices.push(next);
        }
    }

    public static arrayToMap<T>(array: T[], keyProperty: keyof T): Map<string, T[]> {
        const map = new Map<string, T[]>();
        array.forEach((item) => {
            // Assume the keyProperty of the item is not null or undefined
            const key = String(item[keyProperty]); // Convert the key to a string to satisfy Map's requirements
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)?.push(item);
        });
        return map;
    }
}
export interface IDatabaseModel<T> {
    find(query: any): { exec(): Promise<T[]> };
    findById(id: string): { exec(): Promise<T | null> };
    findByIdAndUpdate(id: string, doc: any, options: any): { exec(): Promise<any> };
    findByIdAndDelete(id: string): { exec(): Promise<any> };
    aggregate(pipeline: any[]): { exec(): Promise<T[]> };
}

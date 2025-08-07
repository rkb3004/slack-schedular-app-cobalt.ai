declare class Container {
    private instances;
    register<T>(type: any, instance: T): void;
    resolve<T>(type: any): T;
}
export declare const container: Container;
export declare function resolveInstance<T>(type: new (...args: any[]) => T): T;
export {};

export default class FastQueue<T> {
    private head;
    private tail;
    private items;
    private size;
    enqueue(item: T): void;
    dequeue(): T | undefined;
    peek(): T | undefined;
    isEmpty(): boolean;
    getLength(): number;
    private getCapacity;
    private resize;
}

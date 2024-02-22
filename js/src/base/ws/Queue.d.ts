declare class Queue {
    items: any;
    frontIndex: number;
    backIndex: number;
    constructor();
    enqueue(item: any): void;
    dequeue(): any;
    peek(): any;
    get printQueue(): any;
    isEmpty(): boolean;
}
export default Queue;

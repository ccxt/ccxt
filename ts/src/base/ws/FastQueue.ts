// Fast O(1) queue implementation
export default class FastQueue<T> {
    private head: number = 0;

    private tail: number = 0;

    private items: T[] = [];

    private size: number = 0;

    enqueue (item: T): void {
        this.items[this.tail] = item;
        this.tail = (this.tail + 1) % this.getCapacity ();
        this.size++;

        // Resize if needed
        if (this.size === this.getCapacity ()) {
            this.resize ();
        }
    }

    dequeue (): T | undefined {
        if (this.isEmpty ()) {
            return undefined;
        }

        const item = this.items[this.head];
        this.items[this.head] = undefined as any; // Clear reference
        this.head = (this.head + 1) % this.getCapacity ();
        this.size--;

        return item;
    }

    peek (): T | undefined {
        if (this.isEmpty ()) {
            return undefined;
        }
        return this.items[this.head];
    }

    isEmpty (): boolean {
        return this.size === 0;
    }

    getLength (): number {
        return this.size;
    }

    private getCapacity (): number {
        return this.items.length;
    }

    private resize (): void {
        const newCapacity = Math.max (1, this.getCapacity () * 2);
        const newItems: T[] = new Array (newCapacity);

        for (let i = 0; i < this.size; i++) {
            newItems[i] = this.items[(this.head + i) % this.getCapacity ()];
        }

        this.items = newItems;
        this.head = 0;
        this.tail = this.size;
    }
}

import { debug, log } from "./Utility";

export class MinHeap<Type> {
    private heap: Type[];
    private sortBy;

    constructor(sortBy: ((t:Type | null) => number | null), array?: Type[]) {
        this.sortBy = sortBy;
        this.heap = array || [];
        if (array) {
            this.update();
        }
    }

    public print() {
        for (let i = 0; i < this.heap.length; i++) {
            if (this.sortBy(this.heap[i]) === null) break;
            console.log(`${this.sortBy(this.heap[i])} => ${this.sortBy(this.getLC(i))}
            ||=> ${this.sortBy(this.getRC(i))}`);
        }
        log("==========================");

    }

    public getMin() {
        return this.heap[0]
    }

    public insert(x: Type) {
        this.heap.push(x);
        if (this.heap.length > 1) {
            this.bubbleUp(this.heap.length - 1);
        }

        const min = this.sortBy(this.getMin());
        const smallest = this.sortBy(this.heap.reduce((s, c) => this.sortBy(c)! < this.sortBy(s)! ? c : s, this.heap[0]));
        if (min !== smallest) {
            this.print();
            throw Error();
        }
    }

    public remove() {
        this.update();
        if (this.heap.length > 1) {
            const smallestItem = this.heap.reduce((s, c) => this.sortBy(c)! < this.sortBy(s)! ? c : s, this.heap[0]);

            this.swapIndex(0, this.heap.length - 1);
            // debug("beforePop", this.heap.map(v => this.sortBy(v)));
            let min = this.heap.pop()!;
            // debug("min", this.sortBy(min));
            
            if (min === undefined) {
                debug("heap", this.heap);
                throw Error(`min is undefined`);
            }
            else if (min !== smallestItem) {
                // this.print();
                const index = this.heap.indexOf(smallestItem);
                this.heap[index] = min;
                min = smallestItem as NonNullable<Type>;
                // debug("swapped", this.sortBy(min));
            }

            this.bubbleDown(0);
            // debug("afterBubble", this.heap.map(v => this.sortBy(v)));
            // log("--------------------");

            return min;
        }
        return null;
    }

    public update() {
        for (let i = (this.heap.length - 2) / 2; i >= 0; i--) {
            this.bubbleDown(i);
        }
    }

    private bubbleDown(index: number) {
        if (index >= 0 && index < this.heap.length) {
            const parent = this.sortBy(this.heap[index])!;
            const leftChild = this.sortBy(this.getLC(index));
            const rightChild = this.sortBy(this.getRC(index));

            // left child < parent
            if (leftChild !== null) {
                // right child is smallest
                if (rightChild !== null && rightChild < leftChild && rightChild < parent) {
                    this.swapIndex(index, 2 * index + 2);
                    this.bubbleDown(2 * index + 2);
                }
                else if (parent > leftChild) {
                    // left child is smallest
                    this.swapIndex(index, 2 * index + 1);
                    this.bubbleDown(2 * index + 1);
                }
                else if (leftChild === rightChild) {
                    this.bubbleDown(2 * index + 1);
                    this.bubbleDown(2 * index + 2);
                }
                this.bubbleUp(index);
            }
        }

    }

    private bubbleUp(index: number) {
        const parent = this.sortBy(this.getPrnt(index));
        if (index >= 0 && index < this.heap.length && parent) {
            const child = this.sortBy(this.heap[index])!;

            if (parent >= child) {
                const prntIndex = this.getPrntIndex(index);
                if (parent !== child) this.swapIndex(index, prntIndex);
                this.bubbleUp(prntIndex);
            }
        }
    }

    private swapIndex(a: number, b: number) {
        const vb = this.heap[b];
        const v = this.heap[a];
        if (vb !== undefined && v !== undefined) {
            this.heap[a] = vb;
            this.heap[b] = v;
        }
    }

    private getRC(i: number) {
        return this.heap[2 * i + 2] || null;
    }
    private getLC(i: number) {
        return this.heap[2 * i + 1] || null;
    }
    private getPrnt(i: number) {
        return this.heap[Math.floor((i - 1)/2)] || null;
    }

    private getPrntIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }
}
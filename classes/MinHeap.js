"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinHeap = void 0;
var Utility_1 = require("./Utility");
var MinHeap = /** @class */ (function () {
    function MinHeap(sortBy, array) {
        this.sortBy = sortBy;
        this.heap = array || [];
        if (array) {
            this.update();
        }
    }
    MinHeap.prototype.print = function () {
        for (var i = 0; i < this.heap.length; i++) {
            if (this.sortBy(this.heap[i]) === null)
                break;
            console.log(this.sortBy(this.heap[i]) + " => " + this.sortBy(this.getLC(i)) + "\n            ||=> " + this.sortBy(this.getRC(i)));
        }
        (0, Utility_1.log)("==========================");
    };
    MinHeap.prototype.getMin = function () {
        return this.heap[0];
    };
    MinHeap.prototype.insert = function (x) {
        var _this = this;
        this.heap.push(x);
        if (this.heap.length > 1) {
            this.bubbleUp(this.heap.length - 1);
        }
        var min = this.sortBy(this.getMin());
        var smallest = this.sortBy(this.heap.reduce(function (s, c) { return _this.sortBy(c) < _this.sortBy(s) ? c : s; }, this.heap[0]));
        if (min !== smallest) {
            this.print();
            throw Error();
        }
    };
    MinHeap.prototype.remove = function () {
        var _this = this;
        this.update();
        if (this.heap.length > 1) {
            var smallestItem = this.heap.reduce(function (s, c) { return _this.sortBy(c) < _this.sortBy(s) ? c : s; }, this.heap[0]);
            this.swapIndex(0, this.heap.length - 1);
            // debug("beforePop", this.heap.map(v => this.sortBy(v)));
            var min = this.heap.pop();
            // debug("min", this.sortBy(min));
            if (min === undefined) {
                (0, Utility_1.debug)("heap", this.heap);
                throw Error("min is undefined");
            }
            else if (min !== smallestItem) {
                // this.print();
                var index = this.heap.indexOf(smallestItem);
                this.heap[index] = min;
                min = smallestItem;
                // debug("swapped", this.sortBy(min));
            }
            this.bubbleDown(0);
            // debug("afterBubble", this.heap.map(v => this.sortBy(v)));
            // log("--------------------");
            return min;
        }
        return null;
    };
    MinHeap.prototype.update = function () {
        for (var i = (this.heap.length - 2) / 2; i >= 0; i--) {
            this.bubbleDown(i);
        }
    };
    MinHeap.prototype.bubbleDown = function (index) {
        if (index >= 0 && index < this.heap.length) {
            var parent_1 = this.sortBy(this.heap[index]);
            var leftChild = this.sortBy(this.getLC(index));
            var rightChild = this.sortBy(this.getRC(index));
            // left child < parent
            if (leftChild !== null) {
                // right child is smallest
                if (rightChild !== null && rightChild < leftChild && rightChild < parent_1) {
                    this.swapIndex(index, 2 * index + 2);
                    this.bubbleDown(2 * index + 2);
                }
                else if (parent_1 > leftChild) {
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
    };
    MinHeap.prototype.bubbleUp = function (index) {
        var parent = this.sortBy(this.getPrnt(index));
        if (index >= 0 && index < this.heap.length && parent) {
            var child = this.sortBy(this.heap[index]);
            if (parent >= child) {
                var prntIndex = this.getPrntIndex(index);
                if (parent !== child)
                    this.swapIndex(index, prntIndex);
                this.bubbleUp(prntIndex);
            }
        }
    };
    MinHeap.prototype.swapIndex = function (a, b) {
        var vb = this.heap[b];
        var v = this.heap[a];
        if (vb !== undefined && v !== undefined) {
            this.heap[a] = vb;
            this.heap[b] = v;
        }
    };
    MinHeap.prototype.getRC = function (i) {
        return this.heap[2 * i + 2] || null;
    };
    MinHeap.prototype.getLC = function (i) {
        return this.heap[2 * i + 1] || null;
    };
    MinHeap.prototype.getPrnt = function (i) {
        return this.heap[Math.floor((i - 1) / 2)] || null;
    };
    MinHeap.prototype.getPrntIndex = function (index) {
        return Math.floor((index - 1) / 2);
    };
    return MinHeap;
}());
exports.MinHeap = MinHeap;

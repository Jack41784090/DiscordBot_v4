"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hGraph = exports.hEdge = exports.hNode = void 0;
var Utility_1 = require("./Utility");
var hNode = /** @class */ (function () {
    function hNode(_pos, _data) {
        this.data = _data;
        this.id = "" + (0, Utility_1.random)(0.0, 100000.5);
        // debug("Created node with id", `${this.id} @ (${_pos.x}, ${_pos.y})`);
        this.position = {
            x: _pos.x, y: _pos.y
        };
    }
    return hNode;
}());
exports.hNode = hNode;
var hEdge = /** @class */ (function () {
    function hEdge(_from, _to, _weight) {
        this.from = _from;
        this.to = _to;
        this.weight = _weight;
    }
    hEdge.prototype.print = function (stringPlus) {
        // console.log(this.weight);
        console.log((stringPlus || "") + ("(" + this.from.position.x + "," + this.from.position.y + ")[" + this.from.id + "]=>(" + this.to.position.x + "," + this.to.position.y + ")[" + this.to.id + "]"));
    };
    return hEdge;
}());
exports.hEdge = hEdge;
var hGraph = /** @class */ (function () {
    function hGraph(_directedGraph) {
        this.adjGraph = new Map();
        this.nodeList = [];
        this.directedGraph = _directedGraph;
    }
    hGraph.prototype.addNode = function (_arg1, _arg2) {
        var pos = _arg2 ?
            (_arg2) : // arg2 is provided
            _arg1.x ?
                _arg1 : // arg2 is not provided and arg1 is a Coord
                _arg1.position; // arg2 is not provided and arg1 is a node
        var data = _arg2 ?
            _arg1 :
            undefined;
        // decide if input is a Node or a type of data for the node
        var inputNode = _arg1.position ?
            _arg1 :
            data === undefined ?
                new hNode(pos) : // no data
                new hNode(pos, data); // data is node
        // find out if there is already data for the node
        var existingNode = this.nodeList.find(function (_n) { return (_n.position.x === inputNode.position.x && _n.position.y === inputNode.position.y); });
        var node;
        if (existingNode === undefined) {
            // use inputNode as a new node
            this.adjGraph.set(inputNode.id, []);
            this.nodeList.push(inputNode);
            node = inputNode;
        }
        else {
            node = existingNode;
        }
        return node;
    };
    hGraph.prototype.connectNodes = function (_from, _to, _weight) {
        var fromNode = _from.position ?
            this.addNode(_from) :
            this.addNode(_from);
        var toNode = _to.position ?
            this.addNode(_to) :
            this.addNode(_to);
        var edge = new hEdge(fromNode, toNode, _weight);
        var from_edgeArray = this.adjGraph.get(fromNode.id);
        var to_edgeArray = this.adjGraph.get(toNode.id);
        if (from_edgeArray === undefined) {
            throw Error("FromNode should already have an array initialised.");
        }
        else if (to_edgeArray !== undefined && to_edgeArray.length > 0) {
            to_edgeArray.push(edge);
        }
        else {
            from_edgeArray.push(edge);
        }
    };
    return hGraph;
}());
exports.hGraph = hGraph;

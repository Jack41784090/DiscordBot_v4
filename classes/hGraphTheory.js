"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hGraph = exports.hEdge = exports.hNode = void 0;
var Utility_1 = require("./Utility");
var hNode = /** @class */ (function () {
    function hNode(_pos, _data) {
        this.data = _data;
        this.id = "" + (0, Utility_1.random)(0.0, 100000.5);
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
        console.log((stringPlus || "") + ("(" + this.from.position.x + "," + this.from.position.y + ")=>(" + this.to.position.x + "," + this.to.position.x + ")"));
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
    hGraph.prototype.addNode = function (_data, _pos) {
        var pos = _pos ?
            _pos :
            _data;
        var data = _pos ?
            _data :
            undefined;
        // decide if input is a Node or a type of data for the node
        var inputNode = data !== undefined && data.data === undefined ? // not node, is data
            new hNode(pos, data) :
            data === undefined ?
                new hNode(pos) : // no data
                data; // data is node
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
        var fromNode = this.addNode(_from);
        var toNode = this.addNode(_to);
        var edge = new hEdge(fromNode, toNode, _weight);
        var edgeArray = this.adjGraph.get(fromNode.id);
        if (edgeArray === undefined) {
            throw Error("FromNode should already have an array initialised.");
        }
        else {
            edgeArray.push(edge);
        }
    };
    return hGraph;
}());
exports.hGraph = hGraph;

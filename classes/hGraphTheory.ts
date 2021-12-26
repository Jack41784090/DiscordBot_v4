import { Coordinate } from "../typedef";
import { random } from "./Utility";

export class hNode<dataType> {
    data?: dataType;
    id: string;
    position: Coordinate;
    constructor(_pos: Coordinate, _data?: dataType) {
        this.data = _data;
        this.id = `${random(0.0, 100000.5)}`;

        this.position = {
            x: _pos.x, y: _pos.y
        };
    }
}

export class hEdge<nodeDataType, weightType> {
    from: hNode<nodeDataType>;
    to: hNode<nodeDataType>;
    weight: weightType;

    constructor(_from: hNode<nodeDataType>, _to: hNode<nodeDataType>, _weight: weightType) {
        this.from = _from;
        this.to = _to;
        this.weight = _weight;
    }

    print(stringPlus?: string) {
        // console.log(this.weight);
        console.log((stringPlus||"") + `(${this.from.position.x},${this.from.position.y})=>(${this.to.position.x},${this.to.position.x})`);
    }
}

export class hGraph<nodeDataType, weightType> {
    nodeList: Array<hNode<nodeDataType>>;
    adjGraph: Map<string, Array<hEdge<nodeDataType, weightType>>>;
    directedGraph: boolean;
    
    constructor(_directedGraph: boolean) {
        this.adjGraph = new Map<
            string,
            Array<hEdge<nodeDataType, weightType>>
        >();
        this.nodeList = [];
        this.directedGraph = _directedGraph;
    }

    addNode(_pos: Coordinate, _?: undefined): hNode<nodeDataType>;
    addNode(_data: nodeDataType, _pos: Coordinate): hNode<nodeDataType>;
    addNode(_node: hNode<nodeDataType>, _pos: Coordinate): hNode<nodeDataType>;
    addNode(_data: Coordinate | nodeDataType | hNode<nodeDataType>, _pos: Coordinate | undefined) {
        const pos = _pos?
            _pos:
            _data as Coordinate;
        const data = _pos?
            _data as (nodeDataType | hNode<nodeDataType>):
            undefined;

        // decide if input is a Node or a type of data for the node
        const inputNode: hNode<nodeDataType> =
        data !== undefined && (data as hNode<nodeDataType>).data === undefined? // not node, is data
            new hNode<nodeDataType>(pos, data as nodeDataType):
            data === undefined?
                new hNode<nodeDataType>(pos): // no data
                data as hNode<nodeDataType>; // data is node

        // find out if there is already data for the node
        const existingNode = this.nodeList.find(_n => (
            _n.position.x === inputNode.position.x && _n.position.y === inputNode.position.y
        ));
        
        let node;
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
    }

    connectNodes(_from: Coordinate, _to: Coordinate, _weight: weightType) {
        const fromNode = this.addNode(_from);
        const toNode = this.addNode(_to);
        const edge = new hEdge<nodeDataType, weightType>(fromNode, toNode, _weight);
        const edgeArray = this.adjGraph.get(fromNode.id);
        if (edgeArray === undefined) {
            throw Error("FromNode should already have an array initialised.");
        }
        else {
            edgeArray.push(edge);
        }
    }
}
import { Coordinate } from "../typedef";
import { debug, uniformRandom } from "./Utility";

export class hNode<dataType> {
    data?: dataType;
    id: string;
    position: Coordinate;
    constructor(_pos: Coordinate, _data?: dataType) {
        this.data = _data;
        
        this.id = `${uniformRandom(0.0, 100000.5)}`;
        // debug("Created node with id", `${this.id} @ (${_pos.x}, ${_pos.y})`);

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
        console.log((stringPlus||"") + `(${this.from.position.x},${this.from.position.y})[${this.from.id}]=>(${this.to.position.x},${this.to.position.y})[${this.to.id}]`);
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
    addNode(_node: hNode<nodeDataType>, _?: undefined): hNode<nodeDataType>;
    addNode(_arg1: Coordinate | nodeDataType | hNode<nodeDataType>, _arg2: Coordinate | undefined) {
        const pos: Coordinate = _arg2?
            (_arg2) as Coordinate: // arg2 is provided
            (_arg1 as Coordinate).x?
                (_arg1 as Coordinate): // arg2 is not provided and arg1 is a Coord
                (_arg1 as hNode<nodeDataType>).position; // arg2 is not provided and arg1 is a node

        const data: nodeDataType | undefined = _arg2?
            _arg1 as nodeDataType:
            undefined;

        // decide if input is a Node or a type of data for the node
        const inputNode: hNode<nodeDataType> =
            (_arg1 as hNode<nodeDataType>).position?
                _arg1 as hNode<nodeDataType>:
                data === undefined ?
                    new hNode<nodeDataType>(pos) : // no data
                    new hNode<nodeDataType>(pos, data); // data is node

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

    connectNodes(_fromNode: hNode<nodeDataType>, _toNode: hNode<nodeDataType>, _weight: weightType): void;
    connectNodes(_fromCoord: Coordinate, _toCoord: Coordinate, _weight: weightType): void;
    connectNodes(_from: hNode<nodeDataType> | Coordinate, _to: hNode<nodeDataType> | Coordinate, _weight: weightType) {
        const fromNode =
            (_from as hNode<nodeDataType>).position?
                this.addNode(_from as hNode<nodeDataType>):
                this.addNode(_from as Coordinate);
        const toNode =
            (_to as hNode<nodeDataType>).position ?
                this.addNode(_to as hNode<nodeDataType>) :
                this.addNode(_to as Coordinate);
        const edge = new hEdge<nodeDataType, weightType>(fromNode, toNode, _weight);
        const from_edgeArray = this.adjGraph.get(fromNode.id);
        const to_edgeArray = this.adjGraph.get(toNode.id);
        if (from_edgeArray === undefined) {
            throw Error("FromNode should already have an array initialised.");
        }
        else if (to_edgeArray !== undefined && to_edgeArray.length > 0) {
            to_edgeArray.push(edge);
        }
        else {
            from_edgeArray.push(edge);
        }
    }
}

// Holds a bunch of nodes and calls functions on them. Maybe one day will implement a cool data structure to hold them.
class Graph{
    constructor()
    {
        this.nodes = new Array();
        this.edges = new Array();
        this.selected = null;
    }

    
    // Add a node to the graph at a given position unless position is already a node, then join to selected
    addNode(position){
        let nodeNearPosition = this.getNodeNearPosition(position, 8);
        
        // If adding a node near existing node, connect it to selected node
        if(nodeNearPosition){
            if(nodeNearPosition != this.selected){
                this.addEdge(nodeNearPosition, this.selected);
            }
            this.selected = nodeNearPosition;
        }
        else{
            let newNode = new Node(position, 10);
            this.nodes.push(newNode);
            if(this.selected){
                this.addEdge(this.selected, newNode);
            }
            this.selected = newNode;
        }
    }


    // Add an edge between nodes at the given indices
    addEdgeFromIndices(indexA, indexB){
        this.edges.push([indexA, indexB]);
    }


    // <!> Does not check to make sure nodes are actually part of the graph
    addEdge(a, b){
        let defaultEdgeRigidity = 1;
        this.edges.push(new Edge(a, b, defaultEdgeRigidity));
    }


    //
    tick(deltaTime){
        // Update nodes
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].tick(deltaTime);
        }

        // Update edges
        for(let i = 0; i < this.edges.length; i++){
            this.edges[i].tick(deltaTime);
        }
    }


    // Draw the graph to the screen
    render(originOffset){
        noStroke();

        // Render nodes
        for(let i = 0; i < this.nodes.length; i++){
            this.nodes[i].render(originOffset, 0);
        }

        // Re-render selected node and neighbors with highlights
        if(this.selected){
            let selectedNeighbors = this.getNeighbors(this.getIndexOf(this.selected));
            for(let i = 0; i < selectedNeighbors.length; i++){
                selectedNeighbors[i].render(originOffset, color(170, 0, 10));
            }
            this.selected.render(originOffset,color(230, 0, 38));
        }

        // Render edges
        for(let i = 0; i < this.edges.length; i++){
            this.edges[i].render(originOffset);
        }
    }


    // Naive implementation
    getNodeNearPosition(position, maxDistance){
        for(let i = 0; i < this.nodes.length; i++){
            if(position.dist(this.nodes[i].position) <= maxDistance){
                return this.nodes[i];
            }
        }
        return 0;
    }


    // Naively returns the index of the given node or -1 if node is not in the graph
    getIndexOf(node){
        for(let i = 0; i < this.nodes.length; i++){
            if(node === this.nodes[i]){
                return i;
            }
        }
        return -1;
    }


    // Return all nodes sharing an edge with the node at the given index
    getNeighbors(index){
        let neighbors = new Array();
        for(let i = 0; i < this.edges.length; i++){
            if(this.edges[i][0] === index){
                neighbors.push(this.nodes[this.edges[i][1]]);
            }
            else if(this.edges[i][1] === index){
                neighbors.push(this.nodes[this.edges[i][0]]);
            }
        }
        return neighbors;
    }


    // Update the selected node given a click position
    updateSelected(position){
        this.selected = this.getNodeNearPosition(position, 8)
    }
}
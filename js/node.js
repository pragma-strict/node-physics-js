
/*
    All information about a node but nothing about graphs and no actual physics calculations.

    TODO: 
        - Fix the bug where inspector says current edge angles are NaN when making a triangle
        - Combine edge data into a dictionary so the properties of this class aren't so cluttered
        - Prevent explosions by capping forces applied
        - Add some kind of damping or prevent infinite gliders or mimic conservation of energy in some other way
            - Backwards acceleration?
        - Implement a more standarized unit and scale to help calibrate calculations to realistic levels?
        - Make angular force calculations relative to local node rotation rather than global reference angle.
            - Just make an updated version of the ref angle function that calculates relative to a parameter rather than
              the new (0, 1) vector!
        - Remove the gridOrigin arg from render()
*/
class Node{
    constructor(position){
        this.edges = [];

        this.position = position;
        this.rotation = 0.0;
        this.radius = 25;

        this.renderSize = 10;
    }


    // 
    render(gridOrigin, color){
        // Render collision bubble
        stroke(200);
        strokeWeight(0.3);
        noFill();
        ellipse(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y, this.radius*2, this.radius*2);

        // Render node
        noStroke();
        fill(color);
        ellipse(gridOrigin.x + this.position.x, gridOrigin.y + this.position.y, this.renderSize, this.renderSize);
    }


    tick(deltaTime){
        //
    }

    
    // Add an existing edge
    addEdge(edge){
        this.edges.push(edge);
    }


    // Return the angle between the horizontal, this node, and the given edge
    getAngleToEdge(edgeIndex){
        return this.getReferenceAngle(this.position, edgeIndex.getIncidentNode(this).position);
    }


    // Return angle between horizontal and the given node
    getReferenceAngleToNode(node){
        return Geometry.getReferenceAngle(this.position, node.position);
    }


    // Return the angle between this node's rotation and the given node
    getRelativeAngleToNode(node){
        let rotVector = p5.Vector.fromAngle(this.rotation, 1);  // A point that the rotation aims at
        rotVector.add(this.position);
        return Geometry.getAngleBetween(this.position, rotVector, node.position);
    }


    getEdgeCount(){
        return this.edges.length;
    }
}
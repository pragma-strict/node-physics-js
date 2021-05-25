
// Should hold all information about a node but nothing about graphs and no actual physics calculations
class Node{
    constructor(position, mass){
        this.position = position;
        this.mass = mass;
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
    }


    // Calculate a physics step
    tick(){
        this.position.add(this.velocity);
    }


    render(positionOffset, color){
        fill(color);
        ellipse(positionOffset.x + this.position.x, positionOffset.y + this.position.y, 5, 5)
    }


    // Apply an instantaneous force. i.e. change the velocity directly w/o changing acceleration
    applyImpulse(force){
        this.velocity.add(force.divide(this.mass));
    }
}
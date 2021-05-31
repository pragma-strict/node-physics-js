/*
    The physics algorithm should go like this:
    - Every node updates its velocity and position
    - Every node checks their position relative to neighbors and if the correct edge length is not preserved they must exert forces on each other
    - The force that will be exerted on each node is the force required to accelerate its neighbor somewhat
    - I think if we want to implement edges with perfectly fixed length then we should just update the positions of the nodes in some hacky way
    - If we want to simulate the edges properly then they must not always maintain a fixed length. Remember, everything is kind of like jello. 
*/


// Should hold all information about a node but nothing about graphs and no actual physics calculations
class Node{
    constructor(position, mass){
        this.position = position;
        this.mass = mass;
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.rotation = 0.0;
        this.angularAcceleration = 0.0;
        this.angularVelocity = 0.0;
        this.bounciness = 0.4;
    }


    // Calculate a physics step
    tick(deltaTime, neighbors){
        // Settle forces & accelerations from last tick
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.angularVelocity += this.angularAcceleration;
        this.rotation += this.angularVelocity;
        

        // Apply boundaries
        if(this.position.x < -width/2){
            this.position.x = -width/2;
            this.velocity.x *= -this.bounciness;
            this.acceleration.x = 0;
        }

        if(this.position.x > width/2){
            this.position.x = width/2;
            this.velocity.x *= -this.bounciness;
            this.acceleration.x = 0;
        }

        if(this.position.y < -height/2){
            this.position.y = -height/2;
            this.velocity.y *= -this.bounciness;
            this.acceleration.y = 0;
        }

        if(this.position.y > height/2){
            this.position.y = height/2;
            this.velocity.y *= -this.bounciness;
            this.acceleration.y = 0;
        }

        let fGravity = createVector(0, 9.8);

        // Apply gravity
        this.applyForce(fGravity);
    }


    render(positionOffset, color){
        noStroke();
        fill(color);
        ellipse(positionOffset.x + this.position.x, positionOffset.y + this.position.y, 15, 15);
        drawVector(this.velocity, p5.Vector.add(gridOrigin, this.position), BLUE);
    }


    // Infer net force acting on node based on its acceleration
    calculateNetForce(){
        return p5.Vector.mult(this.acceleration, this.mass);
    }


    // Apply an instantaneous force. i.e. change the velocity directly w/o changing acceleration
    applyImpulse(force){
        this.velocity.add(force.div(this.mass));
    }


    // Updates acceleration
    applyForce(force){
        this.acceleration.add(force.div(this.mass));
    }


    // Updates angular acceleration
    applyTorque(force, relativePosition){
        let torqueForce = relativePosition.cross(force);
        this.angularAcceleration += torqueForce.z / this.mass;
    }
}
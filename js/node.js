


// Should hold all information about a node but nothing about graphs and no actual physics calculations
class Node{
    constructor(position, mass){
        this.position = position;
        this.mass = mass;
        this.radius = 25;
        this.velocity = createVector(0, 0);
        this.netForce = createVector(0, 0);
        this.rotation = 0.0;
        this.angularAcceleration = 0.0;
        this.angularVelocity = 0.0;
        this.bounciness = 0.4;
    }


    // Calculate a physics step
    tick(deltaTime){
        // Apply acceleration and position
        let acceleration = this.netForce.div(this.mass);
        this.velocity.add(p5.Vector.mult(acceleration, deltaTime));
        this.position.add(p5.Vector.mult(this.velocity, deltaTime));

        this.netForce = createVector(); // Force does not accumulate. It is recalculated every tick.

        // Apply bottom boundary
        if(this.position.y > 0){
            this.position.y = 0;
            this.velocity.y *= -this.bounciness;
            this.netForce.y = 0;
        }

        let fGravity = createVector(0, 9.8 * this.mass);

        // Apply gravity
        this.applyForce(fGravity);
    }


    render(positionOffset, color){
        noStroke();
        fill(color);
        ellipse(positionOffset.x + this.position.x, positionOffset.y + this.position.y, 15, 15);
        drawVector(this.velocity, p5.Vector.add(gridOrigin, this.position), BLUE);

        stroke(200);
        strokeWeight(0.3);
        noFill();
        ellipse(positionOffset.x + this.position.x, positionOffset.y + this.position.y, this.radius*2, this.radius*2);
    }


    // 
    applyForce(force){
        this.netForce.add(force);
    }


    // Updates angular acceleration
    applyTorque(force, relativePosition){
        let torqueForce = relativePosition.cross(force);
        this.angularAcceleration += torqueForce.z / this.mass;
    }
}
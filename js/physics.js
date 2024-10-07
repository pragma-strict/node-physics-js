
/*

*/
class Physics{
	static GRAVITATIONAL_CONSTANT = 9.8;

	static calculateGravitationalTorque(armLength, mass, angleToHorizontal) {
		// var downwardForce = Physics.GRAVITATIONAL_CONSTANT * mass;
		// var perpendicularForceComponent = downwardForce * sin(HALF_PI - angleToHorizontal);
		// var torque = perpendicularForceComponent * armLength /GRID_TILE_SIZE;
		// return torque;
	}


	// Return the torque exerted on the origin by the force exerted on a moment arm at a point
	static calculateTorque2D(origin, force, point){
		let r = p5.Vector.sub(point, origin);
		console.log("Calculating torque -------- ");
		console.log("Origin: " + origin);
		console.log("Force: " + force);
		console.log("Point: " + point);
		console.log("R: " + r);
		console.log("Torque: " + r.cross(force).z);
		return r.cross(force);
	}


	// Return the force exerted on an arm by torque force on a point. Essentially the inverse of torque calculation
	static calculateForceOnArm(torqueMag, distance){
		if(distance == 0){
			return 99999999999;
		}
		return torqueMag / distance;
	}
}
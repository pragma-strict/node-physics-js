
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


	// Return the torque exerted by an arm on a point
	static calculateTorque2D(force, point){

	}


	// Return the force exerted on an arm by torque force on a point. Essentially the inverse of torque calculation
	static calculateForceFromTorque(torque, distance){
		return torque / distance;
	}
}

var GRAVITATIONAL_CONSTANT = 9.8;

function calculateGravitationalTorque(armLength, mass, angleToHorizontal) {
	/*
	console.log("armLength: " + armLength / GRID_TILE_SIZE);
	console.log("mass: " + mass);
	console.log("angleToHorizontal: " + angleToHorizontal);
	*/
	var downwardForce = GRAVITATIONAL_CONSTANT * mass;
	var perpendicularForceComponent = downwardForce * sin(HALF_PI - angleToHorizontal);
	var torque = perpendicularForceComponent * armLength /GRID_TILE_SIZE;
	return torque;
}
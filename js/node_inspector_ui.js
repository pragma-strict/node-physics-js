
var leftScreenBuffer = 30;	// distance from left of screen to text box in px
var topScreenBuffer = 50;	// distance from top of screen to text box in px
var headerGap = 30;
var inspectorWidth = 250;

function renderNodeInspector(node)
{
	if(node)
	{
		textAlign(LEFT);
		var bodyToTextDistance = 0;
		var leading = textAscent() * 1.5;
		
		strokeWeight(0);
		fill(0);
		textSize(24);
		text("Selected Node", leftScreenBuffer, topScreenBuffer);
		strokeWeight(2);
		line(leftScreenBuffer, topScreenBuffer + (headerGap/3), leftScreenBuffer + inspectorWidth, topScreenBuffer + (headerGap/3));
		strokeWeight(0);
		textSize(16);
		
		// Position text
		text("World position: " + round(node.position.x) + ", " + round(node.position.y), leftScreenBuffer, topScreenBuffer + headerGap);

		// Mass text
		bodyToTextDistance += leading;
		text("Mass: " + round(node.mass), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		
		// Torque
		bodyToTextDistance += leading;
		text("Velocity: " + node.velocity, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		
		// Tension
		bodyToTextDistance += leading;
		text("Accleration: " + node.acceleration, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Original Angle
		bodyToTextDistance += leading;
		text("Angular Velocity: " + node.angularVelocity, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Current Angle
		bodyToTextDistance += leading;
		text("Angular Acceleration: " + node.angularAcceleration, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Deflection of child
		bodyToTextDistance += leading;
		text("Rotation: " + node.rotation, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
	}
	else
	{
		//text("None selected", leftScreenBuffer, topScreenBuffer + headerGap);
	}
}
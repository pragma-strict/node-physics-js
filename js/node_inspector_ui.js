
var leftScreenBuffer = 30;	// distance from left of screen to text box in px
var topScreenBuffer = 50;	// distance from top of screen to text box in px
var headerGap = 30;
var inspectorWidth = 250;

function renderNodeInspector(node)
{
	if(node != null)
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
		text("World position: " + round(node.pos[X]) + ", " + round(node.pos[Y]), leftScreenBuffer, topScreenBuffer + headerGap);

		// Mass text
		bodyToTextDistance += leading;
		text("Mass: " + round(node.mass), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		
		// Torque
		bodyToTextDistance += leading;
		text("Torque: " + node.torque, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		
		// Tension
		bodyToTextDistance += leading;
		text("Tension: " + node.tension, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Original Angle
		bodyToTextDistance += leading;
		text("Original Angle (of child): " + node.originalAngles, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Current Angle
		bodyToTextDistance += leading;
		text("Angle (of child): " + node.angles, leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Deflection of child
		bodyToTextDistance += leading;
		text("Child Deflection: " + (node.originalAngles - node.angles), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
	}
	else
	{
		//text("None selected", leftScreenBuffer, topScreenBuffer + headerGap);
	}
}
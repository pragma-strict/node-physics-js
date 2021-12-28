
class NodeInspectorUI{
	constructor(elementId){
		this.node;
		this.isVisible = false;
		this.title = "Node Inspector";
		this.DOMElement = document.getElementById(elementId);
		this.nodeProperties = [];
		this.initDOM();
	}


	// 
	setNode(node){
		if(node instanceof Node){
			this.node = node;
			this.addProperty('World Position', node.position);
			this.show();
		}
		else{
			this.hide();
		}
	}


	// 
	initDOM(){
		// this.propertyElements['pos'] = document.createElement('p');
		// this.propertyElements['pos'].innerHTML = "this is the fafusu";
		// this.DOMElement.appendChild(this.propertyElements['pos']);
	}


	// Add a new node property. Properties are dictionaries that include a title, DOM element ref, and property ref.
	addProperty(title, ref){
		let newElement = document.createElement('p');
		this.DOMElement.appendChild(newElement);
		let property = {
			element: newElement,
			title: title,
			ref: ref
		};
		this.nodeProperties.push(property);
	}


	// 
	update(){
		if(this.node){
			this.nodeProperties.forEach((property) => {
				property.element.innerHTML = property.title + ": " + property.ref;
			});
		}
	}
	

	// Remove all properties
	clearProperties(){
		
	}

	
	//
	show(){
		this.DOMElement.style.display = 'block';
		this.isVisible = true;
	}
	
	
	//
	hide(){
		this.DOMElement.style.display = 'none';
		this.isVisible = false;
	}
}

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
		text("World position: " + node.position.x.toFixed(2) + ", " + node.position.y.toFixed(2), leftScreenBuffer, topScreenBuffer + headerGap);

		// Mass text
		bodyToTextDistance += leading;
		text("Mass: " + node.mass.toFixed(2), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		
		// Torque
		bodyToTextDistance += leading;
		text("Velocity: " + node.velocity.x.toFixed(2) + ", " + node.velocity.y.toFixed(2), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
		
		// Tension
		// bodyToTextDistance += leading;
		// text("Accleration: " + node.acceleration.x.toFixed(2) + ", " + node.acceleration.y.toFixed(2), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Original Angle
		bodyToTextDistance += leading;
		text("Angular Velocity: " + node.angularVelocity.toFixed(2), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Current Angle
		bodyToTextDistance += leading;
		text("Net Torque: " + node.netTorque.toFixed(2), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);

		// Deflection of child
		bodyToTextDistance += leading;
		text("Rotation: " + node.rotation.toFixed(2), leftScreenBuffer, topScreenBuffer + headerGap + bodyToTextDistance);
	}
	else
	{
		//text("None selected", leftScreenBuffer, topScreenBuffer + headerGap);
	}
}
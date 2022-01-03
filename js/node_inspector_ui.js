/*
	Maintains an HTML element to display the values of nodes

	TODO: Don't even store the value ref in the properties, just retrieve them directly from the node when you need them.
	I think this would be better because I don't think references to single numbers are actually stored so retrieving them when needed may be the only way.
*/
class NodeInspectorUI{
	constructor(elementId){
		this.node;
		this.isVisible = false;
		this.wrapperElement = document.getElementById(elementId);
		this.properties = {};	// Properties contain a title and a DOM element
		
		this.initDOM();
	}
	
	
	// 
	initDOM(){
		let titleElement = document.createElement('p');
		titleElement.innerHTML = "Selected Node Properties";
		titleElement.style.fontWeight = 'bold';
		titleElement.style.color = RED;
		this.wrapperElement.appendChild(titleElement);
		this.createProperty('position', 'World Position');
		this.createProperty('velocity', 'Velocity');
		this.createProperty('rotation', 'Rotation');
		this.createProperty('edgeTargetAngles', 'Edge Target Angles');
		this.createProperty('edgeCurrentAngles', 'Current Edge Angles');
		this.createProperty('incidentNodeForces', 'Incident Node Forces');
	}


	// 
	setNode(node){
		if(node instanceof Node){
			this.node = node;
			Object.keys(this.properties).forEach((key) => {	// Update references to node values for each property
				this.properties[key].valueRef = node[key];
			})
			this.show();
		}
		else{
			this.hide();
		}
	}
	
	
	// Key is a single word for backend use, title is for display
	createProperty(key, title){
		this.properties[key] = {
			title: title,
			element: document.createElement('p'),
		};
		this.wrapperElement.appendChild(this.properties[key].element);
	}


	// Update the HTML values in the node inspector
	updateDOM(){
		if(this.node){
			Object.keys(this.properties).forEach((key) => {
				let property = this.properties[key];
				let innerHTML = property.title + ": ";	// Start output string
				let newValue = this.node[key];	// Grab updated value directly from node

				// Generate nicely formatted strings depending on value type
				if(newValue instanceof p5.Vector){
					innerHTML += this.getVector2DString(newValue);
				}
				else if(newValue instanceof Array){
					innerHTML += this.getArrayString(newValue);
				}
				else{
					innerHTML += newValue;
				}

				// Update innerHTML in DOM
				property.element.innerHTML = innerHTML;
			})
		}
	}


	// Return a nicely formatted string for vectors
	getVector2DString(vec){
		return "[ " + vec.x.toFixed(1) + ", " + vec.y.toFixed(1) + " ]";
	}


	// Return a nicely formatted string for arrays
	getArrayString(arr){
		let str = "[ ";
		if(arr.length >= 1){
			arr.forEach((value) => {
				if(value instanceof p5.Vector){
					str += this.getVector2DString(value);
				}
				else{
					str += value.toFixed(1);
				}
				str += ", ";
			})
			str = str.slice(0, -2);	// Remove the last comma
		}
		str += " ]";
		return str;
	}


	// 
	setPropertyRef(key, valueRef){
		this.properties[key].valueRef = valueRef;
	}
	

	// Remove all properties
	clearProperties(){
		this.properties = [];
	}

	
	//
	show(){
		this.wrapperElement.style.display = 'block';
		this.isVisible = true;
	}
	
	
	//
	hide(){
		this.wrapperElement.style.display = 'none';
		this.isVisible = false;
	}
}
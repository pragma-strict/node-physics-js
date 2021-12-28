
class NodeInspectorUI{
	constructor(elementId){
		this.node;
		this.isVisible = false;
		this.wrapperElement = document.getElementById(elementId);
		this.properties = {};	// Properties contain a title, element, and reference to the value to display
		
		this.initDOM();
	}
	
	
	// 
	initDOM(){
		let titleElement = document.createElement('p');
		titleElement.innerHTML = "Selected Node Properties";
		titleElement.style.fontWeight = 'bold';
		// titleElement.style.color = ;
		this.wrapperElement.appendChild(titleElement);
		this.createProperty('mass', 'Mass');
		this.createProperty('pos', 'World Position');
		this.createProperty('vel', 'Velocity');
	}


	// 
	setNode(node){
		if(node instanceof Node){
			this.node = node;
			this.setPropertyRef('mass', node.mass);
			this.setPropertyRef('pos', node.position);
			this.setPropertyRef('vel', node.velocity);
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
			valueRef: null
		};
		this.wrapperElement.appendChild(this.properties[key].element);
	}


	// 
	update(){
		if(this.node){
			Object.keys(this.properties).forEach((key) => {
				let property = this.properties[key];
				property.element.innerHTML = this.generateInnerHTMLForProperty(this.properties[key]);
			})
		}
	}


	// Return the HTML string to display for a given property
	generateInnerHTMLForProperty(property){
		let innerHTML = property.title + ": ";
		if(property.valueRef instanceof p5.Vector){	// Generate nicely formatted output for vectors
			innerHTML += "[ " + property.valueRef.x.toFixed(1) + ", " + property.valueRef.y.toFixed(1) + " ]";
		}
		else{
			innerHTML += property.valueRef;	// If not a vector, assume a number
		}
		return innerHTML;
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

function button_create(x, y, w, h, text)
{
	var newButton = 
	{
		x: x,
		y: y, 
		w: w,
		h: h,
		text: text
	};

	return newButton;
}


function button_updatePosition(button, new_x, new_y)
{
	if(button == null)
	{
		console.log("<!> button_updatePosition: button is null!");
		return 1;
	}

	button.x = new_x;
	button.y = new_y;
}


function button_draw(button)
{
	if(button == null)
	{
		console.log("<!> button_draw: button is null!");
		return 1;
	}

	if(button_checkMouseOver(button))
	{
		fill(0, 0, 0, 25);
	}
	else
	{
		fill(0, 0, 0, 15);
	}
	stroke(0);
	rect(button.x, button.y, button.w, button.h);
	textAlign(CENTER);
	noStroke();
	fill(0);
	text(button.text, button.x + button.w/2, button.y + button.h/2 + textAscent()/2);
}


function button_checkMouseOver(button)
{
	if(button == null)
	{
		console.log("<!> button_checkMouseOver: button is null!");
		return 1;
	}

	if(mouseX >= button.x && mouseX < button.x + button.w)
	{
		if(mouseY >= button.y && mouseY < button.y + button.h)
		{
			return true;
		}
	}
	return false;
}
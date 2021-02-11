

var dataStore;
var dragHoldX;
var dragHoldY;


var progObj = [["F", 138000],
			   ["O", 138000], 
			   ["H", 41000],
			   ["Ag", 41000], 
			   ["A", 41000],
			   ["G", 11000], 
			   ["FM", 4000],
			   ["P", 4000],
			   ["M", 4000],
			   ["E", 4000],
			   ["K", 4000],
			   ["FT", 4000],
			   ];

var progName = {"F": "Demonstration Farm",
				"O": "Open Space / Hayfield / Meadow",
				"H": "Habitat / Wetland",
				"Ag": "Incubator / Agricultural Plot",
				"A": "Apple Orchard",
				"G": "Community Gardens",
				"FM": "Farmer's Market",
				"P": "Natural Play",
				"M": "Interactive Museum / Artifacts",
				"E": "Event Space",
				"K": "Demonstration Kitchen",
				"FT": "Farm to Table / Restaurant"};

var parkingRect = [100, 30];


var parkingObj = ["PK", 14000];

function canvasSupport() {
	return Modernizr.canvas;
}

function windowLoadHandler() {
	canvasApp();
}

function canvasApp(){

	var canvasWidth = 900;
	var canvasHeight = 600;
	var canvasAspect = 1;
	var exportOK = false;
	var sidebar = 230;

	var Bounds;
	var resize;
	var numShapes = progObj.length;
	var shapes;
	var dragIndex;
	var dragging;
	var mouseX;
	var mouseY;
	var csvData;
	var textX = [];
	var textY = [];

	var bkgCanvas = document.getElementById("bkgCanvas");
	var bkgctx = bkgCanvas.getContext("2d");
	bkgCanvas.width = canvasWidth;
	bkgCanvas.height = canvasWidth*canvasAspect;


	var theCanvas = document.getElementById("canvas");
	var ctx =theCanvas.getContext("2d");
	theCanvas.width = canvasWidth;
	theCanvas.height = canvasHeight;

	var background = new Image();
	var key = new Image();

	background.src = "img/park_bubble_scale.jpg";
	key.src = "img/key.png";



	background.onload = function(){		
		
		resize = scaleAR(background.width, 
						 background.height, 
						 theCanvas.width-sidebar, 
						 theCanvas.height);

		
		bkgCanvas.height = resize[1];

		bkgctx.drawImage(background, 0, 0, background.width, background.height, sidebar, 0, resize[0], resize[1]); 

		Bounds = scaleBound(parkBound, parkScaleRef, resize[0]);
		for (var i = Bounds.length - 1; i >= 0; i--) {
			Bounds[i][0] = Bounds[i][0]+sidebar;
		}

		$(".canvas_container").width(resize[0]+sidebar);
		$(".canvas_container").height(canvasHeight);
		drawKey();
		init();
	};

	function drawKey(){
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(key, sidebar, resize[1]);
		}
	

	function init() {

		// change CSS visibility for body after all elements have been loaded
		$("body").show();

		numShapes = progObj.length;
		shapes = [];
		makeShapes();
		drawScreen();
		theCanvas.addEventListener("mousedown", mouseDownListener, false);
		theCanvas.addEventListener("mousemove", mouseOverListener, false);
	}

	function mouseOverListener(evt) {
		var i;
		var highestIndex = -1;
		//getting mouse position correctly, being mindful of resizing that may have occured in the browser:
		var bRect = theCanvas.getBoundingClientRect();
		mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
		mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
		//find which shape the mouse is over

		for (i=0; i < numShapes; i++) {
			if	(hitTest(shapes[i], mouseX, mouseY)) {
				if (i > highestIndex) {
					//We will pay attention to the point o
					highestIndex = i;
				}
			}

		}
	
		if(highestIndex > -1){
			// console.log(shapes[highestIndex].name);
			// shapes[highestIndex].color = "red";
			popUpBubble(shapes[highestIndex]);
		}else{
			drawScreen();

		}

	}

	function mouseDownListener(evt) {
		var i;
		//We are going to pay attention to the layering order of the objects so that if a mouse down occurs over more than object,
		//only the topmost one will be dragged.
		var highestIndex = -1;
		
		//getting mouse position correctly, being mindful of resizing that may have occured in the browser:
		var bRect = theCanvas.getBoundingClientRect();
		mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
		mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
				
		//find which shape was clicked
		for (i=0; i < numShapes; i++) {
			if	(hitTest(shapes[i], mouseX, mouseY)) {
				dragging = true;
				if (i > highestIndex) {
					//We will pay attention to the point on the object where the mouse is "holding" the object:
					dragHoldX = mouseX - shapes[i].x;
					dragHoldY = mouseY - shapes[i].y;
					highestIndex = i;
					dragIndex = i;
				}
			}
		}


		if (dragging) {
			window.addEventListener("mousemove", mouseMoveListener, false);
		}
		theCanvas.removeEventListener("mousedown", mouseDownListener, false);
		window.addEventListener("mouseup", mouseUpListener, false);
		
		//code below prevents the mouse down from having an effect on the main browser window:
		if (evt.preventDefault) {
			evt.preventDefault();
		} //standard
		else if (evt.returnValue) {
			evt.returnValue = false;
		} //older IE
		return false;
		

	}
	
	function mouseUpListener(evt) {
		theCanvas.addEventListener("mousedown", mouseDownListener, false);
		window.removeEventListener("mouseup", mouseUpListener, false);
		if (dragging) {
			dragging = false;
			window.removeEventListener("mousemove", mouseMoveListener, false);
		}
		dataStore = [];
		for (i=0; i < numShapes; i++) {
			dataStore.push([shapes[i].name, shapes[i].x, shapes[i].y, shapes[i].area]);
			// console.log("Shape "+shapes[i].name+": X Coord: "+shapes[i].x+", Y Coord: "+shapes[i].y);
		}
		checkBounds();
		drawScreen();
	}

	function mouseMoveListener(evt) {
		var posX;
		var posY;
		var shapeRad = shapes[dragIndex].rad;
		var minX = shapeRad;
		var maxX = theCanvas.width - shapeRad;
		var minY = shapeRad;
		var maxY = theCanvas.height - shapeRad;
		//getting mouse position correctly 
		var bRect = theCanvas.getBoundingClientRect();
		mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
		mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
		
		//clamp x and y positions to prevent object from dragging outside of canvas
		posX = mouseX - dragHoldX;
		posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
		posY = mouseY - dragHoldY;
		posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);
		
		shapes[dragIndex].x = posX;
		shapes[dragIndex].y = posY;
		drawScreen();
	}

	function popUpBubble(shape){

		var text = progName[shape.name];
		var x = shape.x;
		var y = shape.y;
		drawScreen();
		var bubblePadding = 10;
		var bubbleOff = 10;
		var fontHeight = 20;
		var arrowOff = 5;

		ctx.strokeStyle = "black";
		ctx.fillStyle = "white";
		ctx.lineWidth = 1;
		ctx.font = 20+"px Arial";
		var textDims = ctx.measureText(text);

		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(x+arrowOff, y-arrowOff);
		ctx.lineTo(x+(textDims.width/2)+bubblePadding, y-arrowOff);
		ctx.lineTo(x+(textDims.width/2)+bubblePadding, y-(fontHeight)-bubbleOff);
		ctx.lineTo(x-(textDims.width/2)-bubblePadding, y-(fontHeight)-bubbleOff);
		ctx.lineTo(x-(textDims.width/2)-bubblePadding, y-arrowOff);
		ctx.lineTo(x-arrowOff, y-arrowOff);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();

	
		ctx.fillStyle = "Black";
		// console.log(text, x, y);
		ctx.fillText(text, (x-(textDims.width/2)), y-(bubbleOff));

	}

	
	function makeShapes() {
		
		var margin = 6;
		var sizes = [];

		for (var i = 0; i < progObj.length; i++) {
			progObj[i][1] = Math.floor(3*resize[2]*(Math.sqrt(progObj[i][1]/Math.PI)));
			sizes.push(progObj[i][1]);
		};


		var rows = [];
		var rowWidth = [];
		var sums = 0;
		rowIndex = 0;
		for (var i = 0; i < sizes.length; i++) {
			if (sums + ((sizes[i]*2) +( margin*2)) < sidebar){
				if (!rows[rowIndex]) {
					rows.push([]);
				}
				rows[rowIndex].push(progObj[i])
				sums += sizes[i]*2 + margin;
			}else{
				rowWidth.push(sums);
				sums = 0;
				rowIndex += 1;
				i -= 1;
			}

		}
		rowWidth.push(sums);

		console.log(rows);
		console.log(sizes);
		console.log(rowWidth);
		var i;
		var tempX;
		var xPos = 0;
		// console.log(spacing);
		var tempY = 0;
		var sumY = 0;
		var tempRad;
		var tempR;
		var tempG;
		var tempB;
		var tempColor;
		var startPt = 0;
		var sideX;
		var sideY;


		for (var i = 0; i < rows.length; i++) {
			var midPt = (sidebar/2) - (Math.round(rowWidth[i]/2));
			tempY = (rows[i][0][1]) + margin/2; // Get the first object for Y offset
			sumY += tempY;
			xPos = midPt;
			for (var t = 0; t < rows[i].length; t++) {
				tempRad = rows[i][t][1];
				tempX = xPos + tempRad;
				tempR = Math.floor(Math.random()*255);
				tempG = Math.floor(Math.random()*255);
				tempB = Math.floor(Math.random()*255);
				tempColor = "rgba(" + tempR + "," + tempG + "," + tempB +", 0.75)";
				shapeId = rows[i][t][0];
				tempShape =  new shapeObject(tempX, sumY, tempRad, shapeId, tempColor);
				shapes.push(tempShape);
				xPos = tempX + tempRad + margin;
			}
			sumY += tempY;
		}

		// addPark();
	}

	// function addPark() {
	// 	ctx.beginPath();
	// 	ctx.rect(0,0,parkingRect[0],parkingRect[1]);
	// 	ctx.

	// }
	
	function hitTest(shape,mx,my) {
		
		var dx;
		var dy;
		dx = mx - shape.x;
		dy = my - shape.y;
		
		//a "hit" will be registered if the distance away from the center is less than the radius of the circular object		
		return (dx*dx + dy*dy < shape.rad*shape.rad);
	}

	function checkBounds(){
		// ray-casting algorithm based on
	    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	    var checkArray = [];
	    var vs = Bounds;
	    var t;
	    for (t = shapes.length - 1; t >= 0; t--) {

		    var x = shapes[t].x, y = shapes[t].y;

		    var inside = false;
		    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		        var xi = vs[i][0], yi = vs[i][1];
		        var xj = vs[j][0], yj = vs[j][1];

		        var intersect = ((yi > y) != (yj > y))
		            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		        if (intersect) inside = !inside;
		    }

		    checkArray[t] = inside;
	    }
	    console.log(checkArray);
		sum = checkArray.indexOf(false);
		if (sum == -1){
			exportOK = true;
		}else{
			exportOK = false;
		}
	}


	function drawScreen(){
		ctx.clearRect(0,0, theCanvas.width, theCanvas.height);
		drawBounds();
		drawShapes();
		drawLabels();
		drawKey();
	}
	
	function drawShapes() {
		var i;
		for (i=0; i < numShapes; i++) {
			ctx.fillStyle = shapes[i].color;
			ctx.beginPath();
			ctx.arc(shapes[i].x, shapes[i].y, shapes[i].rad, 0, 2*Math.PI, false);
			ctx.closePath();
			ctx.fill();
		}
		// console.log(shapes);
	}

	function drawLabels(){

		//set text locations
		for (var t = 0; t <= shapes.length - 1; t++) {
			textX.push(shapes[t].x);
			textY.push(shapes[t].y);
		}

		for (var i = shapes.length - 1; i >= 0; i--) {
			
			var text = shapes[i].name;
			var textOffset = 16;
			var x = shapes[i].x;
			var y = shapes[i].y;
			var fontHeight = 20;
			var offset = 75;

			ctx.strokeStyle = "white";
			ctx.fillStyle = "transparent";
			ctx.lineWidth = 1;
			var fontheight = 14;
			ctx.font = fontheight+"px Arial";
			var textDims = ctx.measureText(text);
		

			ctx.fillStyle = "White";
			tx = x - (textDims.width/2);
			ty = y + (fontheight/2)-2;
			// console.log(ty);
			ctx.fillText(text, tx, ty);
		}


	}

	function drawBounds(){

		boundTemp = [].concat(Bounds);
		if (exportOK){
			ctx.strokeStyle = "white";
		}else{
			ctx.strokeStyle = "red";
		}
		ctx.lineWidth = 3;
		ctx.beginPath();
		var start = boundTemp.pop();
		ctx.moveTo(start[0], start[1]);
		for (var i = Bounds.length - 1; i >= 0; i--) {
			ctx.lineTo(Bounds[i][0], Bounds[i][1]);
		}
		ctx.closePath();
		ctx.stroke();
		flipButton();

	}


	function scaleAR(srcW, srcH, destW, destH){
		var returnx = 0;
		var returny = 0;
		var scale = 0;
		var srcAR = srcW/srcH;
		var destAR = destW/destH;
		if (destAR > srcAR ){
			scale = destH/srcH; 
			returnx = srcW*scale;
			returny = destH;
		} else {
			scale = destW/srcW;
			returnx = destW;
			returny = srcH*scale;
		}
		return [returnx, returny, scale];

	}

	function shapeObject(x, y, rad, name, color){
		// this.init = function(x, y, rad, name, color){

			this.x = x;
			this.y = y;
			this.rad = rad;
			this.name = name;
			this.color = color;
			this.area = Math.PI*(rad*rad);
		// }
	}
	function flipButton(){
		var button = document.getElementById("report_button");
		var csvOutput = document.getElementById("csvOutput");
		if (exportOK){
			button.disabled = false;
			csvOutput.innerHTML = "Click REPORT to submit the data!";
			csvArray = [["Name", "x", "y", "area"]];
			dataStore.forEach(function(infoArray, index){
				var line = infoArray.join(",");
				csvArray.push(line);
			});
			surveydata = csvArray.join("\n");

		}else{
			csvOutput.innerHTML = "You must place all the program elements within the park boundary to submit.";
			button.disabled = true;
		}
	}



	$("#report_button").click(function(){
	    $.ajax({
	        url: "writeData.php",
	        type: "POST",
	        data: {surveydata: surveydata},
	        success: function()
	        {
	            window.location = "confirm.html";
	        }               
	    });
	});

}

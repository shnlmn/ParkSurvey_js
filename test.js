
function Report() {
		alert(dataStore);
		// console.log(dataStore);
}

function test(){
	alert("IT LOADED");
}

var Debugger = function() { };
Debugger.log = function(message) {
	try {
		console.log(message);
	}
	catch (exception) {
		return;
	}
}

function windowLoadHandler() {
	canvasApp();
}
function canvasSupport() {
	return Modernizr.canvas;
}
function canvasApp(){

	var bkgCanvas = document.getElementById("bkgCanvas");
	var bkgctx = bkgCanvas.getContext("2d");
	

	var background = new Image();
	background.onload = function(){
		drawBackground();
	};
	background.src = "img/park.jpg";

	function drawBackground(){
	
		bkgctx.drawImage(background, 0, 0, bkgCanvas.width, bkgCanvas.height);
	}

}
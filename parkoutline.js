var parkBound = [
[189.757536,211.326282], [1959.113255,211.326282], [1959.113255,1135], [189.757536,1135]
// [189.757536,211.326282], [1959.113255,211.326282], [1959.113255,907.053024], [1476.184152,907.053024], [1476.184152,1135.682907], [189.757536,1135.682907], [189.757536,211.326282]

];
var parkScaleRef = 2192.774109;
var parkBoundsRef = 1769.36;

function scaleBound(parkBound, parkScaleRef, imgW){
	scale = imgW/parkScaleRef;
	var returnBound = [];
	for (var i = parkBound.length - 1; i >= 0; i--) {
		returnBound[i] = [parkBound[i][0]*scale,parkBound[i][1]*scale]
	}
	return(returnBound);
}
	
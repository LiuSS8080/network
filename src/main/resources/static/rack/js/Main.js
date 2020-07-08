function init() {
	var box = new twaver.ElementBox();
	var network = new RackNetwork(box);
	document.body.appendChild(network.getView());
	network.adjustBounds({
		x: 0,
		y: 0,
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight
	});

	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	String.prototype.colorRgb = function(a) {
		var sColor = this.toLowerCase();
		if(sColor && reg.test(sColor)) {
			if(sColor.length === 4) {
				var sColorNew = "#";
				for(var i = 1; i < 4; i += 1) {
					sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
				}
				sColor = sColorNew;
			}
			var sColorChange = [];
			for(var i = 1; i < 7; i += 2) {
				sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
			}
			if(a) {
				return "rgba(" + sColorChange.join(",") + "," + a + ")";
			} else {
				return "rgb(" + sColorChange.join(",") + ")";
			}
		} else {
			return sColor;
		}
	};

	var racks = ['rackbin1', 'rackbin2', 'rackbin3'];
	var racksData = Api.getRacksData(racks, network.renderScene, network);

}
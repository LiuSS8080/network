DeviceNode = function(data, rack) {
	this._data = data;
	this._rack = rack;
	this._network = rack._network;
	DeviceNode.superClass.constructor.call(this, data.id);
	this.init();
}

twaver.Util.ext(DeviceNode, twaver.ShapeNode, {
	_uStart: 0,
	_uCount: 0,
	_powerPortAmount: 0,
	_networkPortAmount: 0,
	_connectedPorts: [],
	_connectedPowerPorts: [],
	_connectedNetworkPorts: [],

	init: function() {
		this._rack.layupElement(this);
		this._uStart = this._data.uStart || this._uStart;
		this._uCount = this._data.uCount || this._uCount;
		this._powerPortAmount = this._data.powerPortAmount || this._powerPortAmount;
		this._networkPortAmount = this._data.networkPortAmount || this._networkPortAmount;
		this._connectData = this._data.connectData || this._connectData;
		this._connectedPorts = this._data.connectedPorts || this._connectedPorts;
		this._connectedPowerPorts = this._data.connectedPowerPorts || this._connectedPowerPorts;
		this._connectedNetworkPorts = this._data.connectedNetworkPorts || this._connectedNetworkPorts;
	},

	onMouseMove: function(e) {
		var eLoc = this._network.zoomManager._getLogicalPoint(e);
		this._UI.setFocusPort(eLoc);
	},

	onMouseEnter: function(e) {
		//		DeviceNode.superClass.onMouseOver.call(this, e);
		//鼠标样式 button
		this._isFocus = true;
		this.setLayerId('focusLayer');
	},
	onMouseLeave: function(e) {
		this._isFocus = false;
		this.setLayerId('deviceLayer');
	},

	onClick: function(e) {
		console.log(this._UI._focusPort, this._UI._focusPort && this._UI._portsData[this._UI._focusPort]);
	},



	getPortData: function(port) {
		return this._UI._portsData[port];
	},

	renderAlarm: function() {
		DeviceNode.superClass.renderAlarm.call(this);
	},

	filterElement: function(view2D, parent) {
		var isLayout = this.c(ExtendAttrConst.ATTR_NAME_ISLAYOUTED);
		if(isLayout != null && isLayout == "0") {
			return true;
		}
		DeviceNode.superClass.filterElement.call(this, view2D, parent);
	},
	show2D: function(network) {
		DeviceNode.superClass.show2D.call(this, network);
		if(this.getImage() == "" || this.getImage() == null) {
			this.s('body.type', 'vector').
			s('vector.fill', true).
			s('vector.fill.color', '#999999').
			s('vector.outline.width', 2).
			s('vector.outline.color', '#333333');
		} else {
			// var image = './images/2Dimage/UPS5000E_vfront.png';
			// image = network && network.registerNormalImage(image);
			// this.setImage(image);
		}
	},
	refresh: function(view2D, network) {
		DeviceNode.superClass.refresh.call(this, view2D, network);
	},
	getVectorUIClass: function() {
		if(!this._isShapeNode) {
			return DeviceNodeUI;
		}
		DeviceNode.superClass.getVectorUIClass.call(this);
	},
	getRack: function() {
		return this._rack;
	},
});

DeviceNodeUI = function(network, element) {
	DeviceNodeUI.superClass.constructor.call(this, network, element);
	this.init();
}

twaver.Util.ext(DeviceNodeUI, twaver.vector.NodeUI, {
	_borderWidth: 2,
	_borderColor: '#111111',
	_borderFocusColor: '#EEEEEE',
	_outlineWidth: 2,
	_outlineColor: '#0000FF',
	_centerPanelColor: '#BBBBBB',//'#555555',
	_sidePaneColor: '#555555',//'#BBBBBB',
	_centerPanelFocusColor: '#BBBBBB',
	_sidePaneFocusColor: '#555555',
	_powerPortColor: '#BBBBBB',
	_networkPortColor: '#555555',
	_powerPortConnectedColor: '#FFFF00',
	_networkPortConnectedColor: '#00FFFF',
	_powerPortFocusColor: '#FF0000',
	_networkPortFocusColor: '#FF0000',
	_sidePaneScale: 0.1,
	_networkPortRows: 24,
	_focusPort: null,
	_font: '12px Microsoft YaHei',
	_nodeAttachment: null, //ConnectStatusAttachment,

	init: function() {
		this._element._UI = this;
		this.initUIdatas();
	},

	initUIdatas: function() {
		this._panelData = {};
		this._portsData = {};
		this.initPanel();
		this.initPowerPorts();
		this.initNetworkPorts();
	},

	initPanel: function() {
		var uData = this._element.c('uData');
		uw = uData && uData.w || 132;
		uh = uData && uData.h || 12;
		var x = 0;
		var y = 0;
		var w = uw;
		var h = uh * this._element._uCount;
		var b = this._borderWidth;
		var s = this._sidePaneScale;
		this._panelData.x0 = x;
		this._panelData.y0 = y;
		this._panelData.w0 = w;
		this._panelData.h0 = h;
		this._panelData.center = {
			x0: w * s,
			y0: b,
			w0: w * (1 - s * 2),
			h0: h - b * 2
		};
		this._panelData.left = {
			x0: b,
			y0: b,
			w0: w * s - b * 2,
			h0: h - b * 2
		};
		this._panelData.right = {
			x0: w * (1 - s) + b,
			y0: b,
			w0: w * s - b * 2,
			h0: h - b * 2
		};
		refreshPanel(this._panelData);
		refreshPanel(this._panelData.center);
		refreshPanel(this._panelData.left);
		refreshPanel(this._panelData.right);

		function refreshPanel(panel) {
			panel.x = panel.x0;
			panel.y = panel.y0;
			panel.w = panel.w0;
			panel.h = panel.h0;
		}
	},

	initPowerPorts: function() {
		var self = this;
		var count = this._element._powerPortAmount;
		var lCount = count && Math.ceil(count / 2);
		if(lCount) {
			for(i = 0; i < lCount; i++) {
				var number = i * 2 + 1;
				initPowerPort(this._panelData.left, lCount, number, i);
			}
		}
		var rCount = count && Math.floor(count / 2);
		if(rCount) {
			for(i = 0; i < rCount; i++) {
				var number = (i + 1) * 2;
				initPowerPort(this._panelData.right, rCount, number, i);
			}
		}

		function initPowerPort(panel, count, number, i) {
			var ph = 4;
			var gap = (panel.h0 - ph * count) / (count + 1);
			var start = gap + ph / 2;
			var offset = (panel.h0 - gap) / count;
			var port = 'p' + number;
			var data = {
				x0: panel.x0 + panel.w0 / 2,
				y0: panel.y0 + start + offset * i,
				number: number,
				id: self._element._id + port,
				device: self._element,
				connected: self._element._connectedPorts.indexOf(port) >= 0
			}
			self._portsData[port] = data;
			self.refreshPortLoc(port);
		}
	},

	initNetworkPorts: function() {
		var self = this;
		var cx0 = this._panelData.center.x0;
		var cy0 = this._panelData.center.y0;
		var cw0 = this._panelData.center.w0;
		var ch0 = this._panelData.center.h0;
		var xCount = this._networkPortRows;
		var xPh = 3;
		var xGap = (cw0 - xPh * xCount) / (xCount + 1);
		var xStart = xGap + xPh / 2;
		var xOffset = (cw0 - xGap) / xCount;
		var yCount = this._element._uCount;
		var yPh = 7;
		var yGap = (ch0 - yPh * yCount) / (yCount + 1);
		var yStart = yGap + yPh / 2;
		var yOffset = (ch0 - yGap) / yCount;
		for(j = 0; j < yCount; j++) {
			for(i = 0; i < xCount; i++) {
				var number1 = (xCount * j + i) * 2 + 1;
				initNetworkPort(number1, i, j, -2);
				var number2 = (xCount * j + i) * 2 + 2;
				initNetworkPort(number2, i, j, 2);
			}
		}

		function initNetworkPort(number, i, j, offset) {
			var port = 'n' + number;
			var data = {
				x0: cx0 + xStart + xOffset * i,
				y0: cy0 + yStart + yOffset * j + offset,
				number: number,
				id: self._element._id + port,
				device: self._element,
				connected: self._element._connectedPorts.indexOf(port) >= 0,
				usable: number <= self._element._networkPortAmount
			}
			self._portsData[port] = data;
			self.refreshPortLoc(port);
		}
	},

	refreshPortLoc: function(port, loc) {
		this._portsData[port].x = loc && loc.x || this._portsData[port].x0;
		this._portsData[port].y = loc && loc.y || this._portsData[port].y0;
	},

	drawDefaultBody: function(ctx) {
		//		if(this._network._debug) console.time('startDraw');
		this.refreshUIdatas();
		this.drawPane(ctx);
		if (this._element._network._connectModle || this._element._isFocus) {
			this.drawPorts(ctx);
		}
		//		if(this._network._debug) console.timeEnd('startDraw');
	},

	refreshUIdatas: function() {
		var loc = this._element.getLocation();
		var size = this._element.getSize();
		if(this._panelData.x != loc.x || this._panelData.y != loc.y || this._panelData.w != size.width || this._panelData.h != size.height) {
			var offset = {
				x: loc.x - this._panelData.x,
				y: loc.y - this._panelData.y
			}
			var scale = {
				x: size.width / this._panelData.w,
				y: size.height / this._panelData.h
			}
			this._panelData.x = loc.x;
			this._panelData.y = loc.y;
			this._panelData.w = size.width;
			this._panelData.h = size.height;
			this.refreshPanel(loc, offset, scale);
			this.refreshPorts(loc, offset, scale);
		}
	},

	refreshPanel: function(loc, offset, scale) {
		if(offset.x || scale.x != 1) {
			refreshX(this._panelData.center, offset.x, scale.x);
			refreshX(this._panelData.left, offset.x, scale.x);
			refreshX(this._panelData.right, offset.x, scale.x);
		}
		if(offset.y || scale.y != 1) {
			refreshY(this._panelData.center, offset.y, scale.y);
			refreshY(this._panelData.left, offset.y, scale.y);
			refreshY(this._panelData.right, offset.y, scale.y);
		}

		function refreshX(panel, o, s) {
			if(o || s != 1) {
				panel.x = loc.x + panel.x0 * s;
			}
			if(s != 1) {
				panel.w = panel.w0 * s;
			}
		}

		function refreshY(panel, o, s) {
			if(o || s != 1) {
				panel.y = loc.y + panel.y0 * s;
			}
			if(s != 1) {
				panel.h = panel.h0 * s;
			}
		}
	},

	refreshPorts: function(loc, offset, scale) {
		if(offset.x || scale.x != 1 || offset.y || scale.y != 1) {
			for(var port in this._portsData) {
				var data = this._portsData[port];
				if(offset.x || scale.x != 1) {
					data.x = loc.x + data.x0 * scale.x;
				}
				if(offset.y || scale.y != 1) {
					data.y = loc.y + data.y0 * scale.y;
				}
			}
		}
	},

	drawPane: function(ctx) {
		ctx.fillStyle = this._element._isFocus ? this._borderFocusColor : this._borderColor;
		ctx.fillRect(
			this._panelData.x,
			this._panelData.y,
			this._panelData.w,
			this._panelData.h);
		ctx.fillStyle = this._element._isFocus ? this._centerPanelFocusColor : this._centerPanelColor;
		ctx.fillRect(
			this._panelData.center.x,
			this._panelData.center.y,
			this._panelData.center.w,
			this._panelData.center.h);
		ctx.fillStyle = this._element._isFocus ? this._sidePaneFocusColor : this._sidePaneColor;
		ctx.fillRect(
			this._panelData.left.x,
			this._panelData.left.y,
			this._panelData.left.w,
			this._panelData.left.h);
		ctx.fillRect(
			this._panelData.right.x,
			this._panelData.right.y,
			this._panelData.right.w,
			this._panelData.right.h);
		if(this._element._isFocus) {
			ctx.lineWidth = this._outlineWidth;
			ctx.strokeStyle = this._outlineColor;
			ctx.strokeRect(
				this._panelData.x - this._outlineWidth / 2,
				this._panelData.y - this._outlineWidth / 2,
				this._panelData.w + this._outlineWidth,
				this._panelData.h + this._outlineWidth);
		}
	},

	drawPorts: function(ctx) {
		for(var port in this._portsData) {
			var data = port && this._portsData[port];
			if(data && port.charAt(0) == 'p') {
				ctx.strokeStyle = data.connected ? this._powerPortColor : this._powerPortConnectedColor;
				ctx.lineWidth = 0.1;
				ctx.fillStyle = data.connected ? this._powerPortConnectedColor : this._powerPortColor;
				if(port == this._focusPort) {
					ctx.fillStyle = this._powerPortFocusColor;
				}
				this.drawPowerPort(ctx, data);
			}
			if(data && port.charAt(0) == 'n') {
				ctx.strokeStyle = data.connected ? this._networkPortConnectedColor : this._networkPortColor;
				ctx.lineWidth = 0.2;
				ctx.fillStyle = data.connected ? this._networkPortConnectedColor : this._networkPortColor;
				if(port == this._focusPort) {
					ctx.fillStyle = this._networkPortFocusColor;
				}
				this.drawNetworkPort(ctx, data);
			}
		}
	},

	drawPowerPort: function(ctx, data) {
		ctx.beginPath();
		ctx.moveTo(
			data.x - 3,
			data.y - 2);
		ctx.lineTo(
			data.x + 3,
			data.y - 2);
		ctx.lineTo(
			data.x + 3,
			data.y + 0.5);
		ctx.lineTo(
			data.x + 1.5,
			data.y + 2);
		ctx.lineTo(
			data.x - 1.5,
			data.y + 2);
		ctx.lineTo(
			data.x - 3,
			data.y + 0.5);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	},

	drawNetworkPort: function(ctx, data) {
		ctx.beginPath();
		if(data.number % 2) {
			ctx.moveTo(
				data.x - 1.5,
				data.y + 1.5);
			ctx.lineTo(
				data.x + 1.5,
				data.y + 1.5);
			ctx.lineTo(
				data.x + 1.5,
				data.y - 0.5);
			ctx.lineTo(
				data.x + 0.5,
				data.y - 1.5);
			ctx.lineTo(
				data.x - 0.5,
				data.y - 1.5);
			ctx.lineTo(
				data.x - 1.5,
				data.y - 0.5);
		} else {
			ctx.moveTo(
				data.x - 1.5,
				data.y - 1.5);
			ctx.lineTo(
				data.x + 1.5,
				data.y - 1.5);
			ctx.lineTo(
				data.x + 1.5,
				data.y + 0.5);
			ctx.lineTo(
				data.x + 0.5,
				data.y + 1.5);
			ctx.lineTo(
				data.x - 0.5,
				data.y + 1.5);
			ctx.lineTo(
				data.x - 1.5,
				data.y + 0.5);
		}
		ctx.closePath();
		ctx.stroke();
		if(data.usable) ctx.fill();
	},

	getFocusPortByLoc: function(eLoc) {
		for(var port in this._portsData) {
			var data = this._portsData[port];
			var xDistance = Math.abs(data.x - eLoc.x);
			var yDistance = Math.abs(data.y - eLoc.y);
			if(port.charAt(0) == 'p' && xDistance < 3 && yDistance < 2) {
				return port;
			}
			if(port.charAt(0) == 'n' && xDistance < 1.5 && yDistance < 1.5) {
				return port;
			}
		}
		return null;
	},

	setFocusPort: function(eLoc) {
		this._focusPort = this.getFocusPortByLoc(eLoc);
	},

	getFocusPort: function() {
		return this._focusPort;
	},

	getPortData: function(port) {
		return this._portsData[port];
	},

	setPortData: function(port, data) {
		if(data && this._portsData[port]) {
			for(var key in data) {
				this._portsData[port][key] = loc[key];
			}
		}
	},

	checkAttachments: function() {
		DeviceNodeUI.superClass.checkAttachments.call(this);
		// this.checkNodeAttachment();
	},
	// checkNodeAttachment: function() {
	// 	var node = this._element;
	// 	if (this._network.isVisible(node)  && node._connectStatus != Constants.CONNECTED_STATUS_VALUE)
	// 	{
	// 		if(this._nodeAttachment == null) {
	// 			this._nodeAttachment = new ConnectStatusAttachment(this);
	// 			this.addAttachment(this._nodeAttachment);
	// 		}
	// 	} else {
	// 		if (this._nodeAttachment != null) {
	// 			this.removeAttachment(this._nodeAttachment);
	// 			this._nodeAttachment = null;
	// 		}
	// 	}
	// }
});
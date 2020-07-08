RackNode = function(data, network) {
	this._data = data;
	this._network = network;
	RackNode.superClass.constructor.call(this, data.id);
	this.init();
}

twaver.Util.ext(RackNode, twaver.ShapeNode, {
	init: function() {
		this.setMovable(false);
		this.s('select.style', 'border');
		this.s('select.padding', 0);
		this.s('select.width', 3);
		this.s('select.color', 'rgba(255,215,0,0.7)');
	},
	onMouseMove: function(e, notTop) {
		var eLoc = this._network.zoomManager._getLogicalPoint(e);
		this.setFocusUnum(eLoc, notTop);
	},
	onMouseEnter: function(e) {
		this._isFocus = true;
		this._network.invalidateElementUIs();
	},
	onMouseLeave: function(e) {
		this._isFocus = false;
		this._network.invalidateElementUIs();
	},
	filterElement: function(parent) {
		var isLayout = this.c(ExtendAttrConst.ATTR_NAME_ISLAYOUTED);
		if(isLayout != null && isLayout == "0") {
			return true;
		}
		RackNode.superClass.filterElement.call(this, parent);
	},
	refresh: function(network) {
		RackNode.superClass.refresh.call(this, network);
	},
	getVectorUIClass: function() {
		return RackNodeUI;
	},
	layupElement: function(device) {
		var deviceData = device._data;
		var typeName = deviceData['Device Typename']; //"Custom",
		var mocName = deviceData.MOC_NAME; //"辅件",
		var airflowType = deviceData.airflowType; //"3",
		var alignBase = deviceData.alignBase; //"",
		var column = deviceData.column; //"",
		var deviceCategory = deviceData.deviceCategory; //"辅件",
		var installationMode = deviceData.installationMode; //"0",
		var location = deviceData.location; //"x=312.0, y=124.0, z=0.0",
		var manufacture = deviceData.manufacture; //"CUSTOM",
		var model = deviceData.model; //"Custom",
		var name = deviceData.name; //"自定义_Custom",
		var nodeimage = deviceData.nodeimage; //"",
		var pselocation = deviceData.pselocation; //"",
		var ratedPowerComsumption = deviceData.ratedPowerComsumption; //"1.2",
		var uStart = deviceData.uStart; //"36",
		var serialNumber = deviceData.serialNumber; //"",
		var sn = deviceData.sn; //"",
		var status = deviceData.status; //"0",
		var temperatureRange = deviceData.temperatureRange; //"-10~45",
		var uCount = deviceData.uCount; //"3",
		var weight = deviceData.weight; //"2",
		var zCoordinate = deviceData.zCoordinate; //"",
		if(uStart && uCount) {
			var uData = this.getUdata(uStart, uCount);
			device.c('uData', uData);
			device.setSize(uData.w, uData.h * uCount);
			device.setLocation(uData.x, uData.y);
			device.setHost(this);
		}
	},
	getUdata: function(uStart, uCount) {
		return this._UI._rackUdatas[uStart + uCount - 1];
	},
	getUnum: function(eLoc) {
		var x = eLoc.x;
		var y = eLoc.y;
		var rackUdatas = this._UI._rackUdatas;
		var uAmount = this._UI._uAmount;
		var ux = rackUdatas[1].x;
		var uy = rackUdatas[uAmount].y;
		var uw = rackUdatas[1].w;
		var uh = rackUdatas[1].h;
		var uH = rackUdatas[1].h * uAmount;
		if(!x || x < ux || y < uy || x > ux + uw || y > uy + uH) {
			return null;
		}
		return(uAmount - Math.floor((y - uy) / uh));
	},
	setFocusUnum: function(eLoc, notTop) {
		var uNum = this.getUnum(eLoc);
		this._UI._focusUnum = uNum ? uNum : null;
		this._UI._focusUistop = uNum && !notTop ? true : false;
		this._UI.checkRackUAttachment();
	},

});

RackNodeUI = function(network, element) {
	RackNodeUI.superClass.constructor.call(this, network, element);
	this.init();
};

twaver.Util.ext(RackNodeUI, twaver.vector.NodeUI, {
	_uWidth: 132,
	_uHeight: 12,
	_rackGapLR: 12,
	_rackGapTB: 12,
	_rackInnerGapLR: 3,
	_rackInnerGapTB: 0,
	_font: '12px Microsoft YaHei',
	_focusFont: '16px Microsoft YaHei',//Arial',
	_textColor: '#111111',
	_focusTextColor: '#FF9900',
	_lineWidth: 1,
	_lineColor: '#333333',
	_fill: true,
	_fillColor: 'rgba(255,255,255,0.3)',

	init: function() {
		this._ctx = this._network.getRootCanvas().getContext('2d');
		this._element._UI = this;
		this._data = this._element._data;
		this._uAmount = this._data.uAmount;
		this._rackWidth = this._uWidth;
		this._rackHeight = this._uHeight * this._uAmount;
		this._rackInnerWidth = this._uWidth - this._rackInnerGapLR * 2;
		this._rackInnerHeight = this._rackHeight - this._rackInnerGapTB * 2;
		this._rackOuterWidth = this._rackGapLR * 2 + this._rackWidth;
		this._rackOuterHeight = this._rackGapTB * 2 + this._rackHeight;
		this._rackSize = {
			width: this._rackOuterWidth,
			height: this._rackOuterHeight
		};
		this._element.setSize(this._rackSize);
		this._rackUs = {};
		this._rackUdatas = {};
		this.refreshDatas();
	},

	refreshDatas: function() {
		this._rackLoc = this._element.getLocation();
		this._rackX = this._rackLoc.x;
		this._rackY = this._rackLoc.y;
		var uAmount = this._uAmount;
		while(uAmount--) {
			var data = {
				id: this._uAmount - uAmount,
				x: this._rackX + this._rackGapLR,
				y: this._rackY + this._rackGapTB + this._uHeight * uAmount,
				w: this._uWidth,
				h: this._uHeight,
			};
			this._rackUdatas[String(data.id)] = data;
		}
		this._gradient = this._ctx.createLinearGradient(
			this._rackX,
			this._rackY,
			this._rackX + this._rackOuterWidth,
			this._rackY);
		this._gradient.addColorStop(0, '#888888');
		this._gradient.addColorStop(0.05, '#555555');
		this._gradient.addColorStop(0.2, '#999999');
		this._gradient.addColorStop(0.5, '#333333');
		this._gradient.addColorStop(0.8, '#999999');
		this._gradient.addColorStop(0.95, '#555555');
		this._gradient.addColorStop(1, '#888888');
	},

	drawDefaultBody: function(ctx) {
		if(this._network._debug) console.time('startDraw');

		this._rackLoc = this._element.getLocation();
		this._rackX = this._rackLoc.x;
		this._rackY = this._rackLoc.y;

		this.refreshDatas();

		this.drawBorder(ctx);

		this._element._isFocus && this.drawGarnish(ctx);

		this.drawUspace(ctx);

		if(this._network._debug) console.timeEnd('startDraw');
	},

	drawBorder: function(ctx) {
		ctx.fillStyle = this._gradient;
		ctx.fillRect(
			this._rackX,
			this._rackY,
			this._rackOuterWidth,
			this._rackOuterHeight);
		ctx.clearRect(
			this._rackX + this._rackGapLR + this._rackInnerGapLR,
			this._rackY + this._rackGapTB + this._rackInnerGapTB,
			this._rackInnerWidth,
			this._rackInnerHeight);
		ctx.fillStyle = this._fillColor
		ctx.fillRect(
			this._rackX + this._rackGapLR,
			this._rackY + this._rackGapTB,
			this._uWidth,
			this._uHeight * this._uAmount);
	},

	drawGarnish: function(ctx) {
		var signCount = this._uAmount * 3;
		while(signCount--) {
			ctx.fillStyle = '#333333';
			ctx.fillRect(
				this._rackX + this._rackGapLR - this._uHeight / 2,
				this._rackY + this._rackGapTB + 0.5 + this._uHeight / 3 * signCount,
				this._uHeight / 3 - 1,
				this._uHeight / 3 - 1);
			ctx.fillRect(
				this._rackX + this._rackGapLR + this._uWidth + this._uHeight / 6 + 1,
				this._rackY + this._rackGapTB + 0.5 + this._uHeight / 3 * signCount,
				this._uHeight / 3 - 1,
				this._uHeight / 3 - 1);
			ctx.beginPath();
			ctx.strokeStyle = '#FFFFFF';
			ctx.lineWidth = 1;
			ctx.moveTo(
				this._rackX + this._rackGapLR + 2,
				this._rackY + this._rackGapTB + ((this._uHeight / 3 - 1) / 2 + 0.5) + this._uHeight / 3 * signCount)
			ctx.lineTo(
				this._rackX + this._rackGapLR + this._uWidth - 2,
				this._rackY + this._rackGapTB + ((this._uHeight / 3 - 1) / 2 + 0.5) + this._uHeight / 3 * signCount)
			ctx.stroke();
		}
	},

	drawUspace: function(ctx) {
		ctx.lineWidth = 0.5;
		ctx.textBaseline = 'middle';
		var uAmount = this._uAmount;
		while(uAmount--) {
			ctx.strokeStyle = this._lineColor;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(
				this._rackX + this._rackGapLR,
				this._rackY + this._rackGapTB + this._uHeight * uAmount);
			ctx.lineTo(
				this._rackX + this._rackGapLR + this._uWidth,
				this._rackY + this._rackGapTB + this._uHeight * uAmount);
			ctx.stroke();
			ctx.fillStyle = this._textColor;
			if(this._element._isFocus) {
				ctx.fillRect(
					this._rackX + this._rackGapLR - this._uHeight / 3 + 0.5,
					this._rackY + this._rackGapTB + this._uHeight * uAmount + this._uHeight / 2 - 0.5,
					1,
					1);
				ctx.fillRect(
					this._rackX + this._rackGapLR + this._uWidth + this._uHeight / 6 + 0.5,
					this._rackY + this._rackGapTB + this._uHeight * uAmount + this._uHeight / 2 - 0.5,
					1,
					1);
			}
			if(this._element._isFocus) {
				ctx.font = this._font;
				if(this._uAmount - uAmount == this._focusUnum) {
					ctx.font = this._focusFont;
					ctx.fillStyle = this._focusTextColor;
				}
				ctx.textAlign = 'right';
				ctx.fillText(
					this._uAmount - uAmount,
					this._rackX - 2,
					this._rackY + this._rackGapTB + this._uHeight * uAmount + this._uHeight / 2);
				ctx.textAlign = 'left';
				ctx.fillText(
					this._uAmount - uAmount,
					this._rackX + this._rackOuterWidth + 2,
					this._rackY + this._rackGapTB + this._uHeight * uAmount + this._uHeight / 2);

			}
		}
		ctx.lineWidth = this._lineWidth;
		ctx.strokeStyle = this._lineColor;
		ctx.strokeRect(
			this._rackX + this._rackGapLR,
			this._rackY + this._rackGapTB,
			this._uWidth,
			this._uHeight * this._uAmount);
	},

	checkAttachments: function() {
		RackNodeUI.superClass.checkAttachments.call(this);
		this.checkRackUAttachment();
	},
	checkRackUAttachment: function() {
		if(this._focusUnum) {
			var data = this._rackUdatas[this._focusUnum];
			if(data) {
				if(this._rackUAttachment) {
					if(this._rackUAttachment._id != data.id) {
						this._rackUAttachment.setData(data);
					}
				} else {
					this._rackUAttachment = new RackUAttachment(this, true, data);
					this.addAttachment(this._rackUAttachment);

				}
			}
		} else {
			if(this._rackUAttachment) {
				this.removeAttachment(this._rackUAttachment, true);
				this._rackUAttachment = null;
			}
		}
		this._network.invalidateElementUI(this._element, true);
	}

});

RackUAttachment = function(elementUI, showInAttachmentDiv, data) {
	this._elementUI = elementUI;
	this._element = elementUI._element;
	this._id = data.id;
	this._name = 'U' + data.id;
	this._x = data.x;
	this._y = data.y;
	this._w = data.w || data.width;
	this._h = data.h || data.height;
	RackUAttachment.superClass.constructor.call(this, elementUI, showInAttachmentDiv);
};

twaver.Util.ext(RackUAttachment, twaver.vector.BasicAttachment, {

	_lineWidth: 1,
	_lineColor: '#FF9900',
	_fillColor: 'rgba(200,100,0,0.2)',

	paint: function(ctx) {
		RackUAttachment.superClass.paint.apply(this, arguments);
		this._elementUI._focusUistop && this.drawCurrentU(ctx);
//		this.drawCurrentUnum(ctx);
	},
	drawCurrentU: function(ctx) {
		ctx.lineWidth = this._lineWidth;
		ctx.strokeStyle = this._lineColor;
		ctx.strokeRect(
			this._x,
			this._y,
			this._w,
			this._h);
		ctx.fillStyle = this._fillColor;
		ctx.fillRect(
			this._x + this._lineWidth / 2,
			this._y + this._lineWidth / 2,
			this._w - this._lineWidth,
			this._h - this._lineWidth);
	},
	drawCurrentUnum: function(ctx) {
		ctx.fillStyle = this._lineColor;
		ctx.font = 'bold ' + this._elementUI._font;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'right';
		ctx.fillText(
			this._id,
			this._elementUI._rackX - 2,
			this._y + this._h / 2);
		ctx.textAlign = 'left';
		ctx.fillText(
			this._id,
			this._x + this._w + this._elementUI._rackGapLR + 2,
			this._y + this._h / 2);
	},
	validate: function() {
		RackUAttachment.superClass.validate.call(this);
		this._viewRect = this.getViewRect();
	},
	setData: function(data) {
		this._id = data.id || this._id;
		this._name = 'U' + data.id || this._name;
		this._x = data.x || this._x;
		this._y = data.y || this._y;
		this._w = data.w || data.width || this._w;
		this._h = data.h || data.height || this._h;
		this._lineWidth = data.lineWidth || this._lineWidth || 1;
		this._lineColor = data.lineColor || this._lineColor || '#FF9900';
		this._fillColor = data.fillColor || this._fillColor || 'rgba(200,100,0,0.2)';
	},
	setId: function(id) {
		this._id = id;
		this._name = 'U' + id;
	},
	getId: function() {
		return this._id;
	},
	setName: function(name) {
		this._name = name;
	},
	getName: function() {
		return this._name;
	},
	setX: function(x) {
		this._x = x;
	},
	getX: function() {
		return this._x;
	},
	setY: function(y) {
		this._y = y;
	},
	getY: function() {
		return this._y;
	},
	setY: function(y) {
		this._y = y;
	},
	getY: function() {
		return this._y;
	},
	setH: function(h) {
		this._h = h;
	},
	getH: function() {
		return this._h;
	},
	setLineWidth: function(lineWidth) {
		this._lineWidth = lineWidth;
	},
	getLineWidth: function() {
		return this._lineWidth;
	},
	setLineColor: function(lineColor) {
		this._lineColor = lineColor;
	},
	getLineColor: function() {
		return this._lineColor;
	},
	setFillColor: function(fillColor) {
		this._fillColor = fillColor;
	},
	getFillColor: function() {
		return this._fillColor;
	},

	getViewRect: function() {
		return {
			x: this._x - 50,
			y: this._y,
			width: this._w + 100,
			height: this._h
		}
	},

	isShadowable: function() {
		return false;
	},
});
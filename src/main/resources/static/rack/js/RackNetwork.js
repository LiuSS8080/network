RackNetwork = function(box) {
	RackNetwork.superClass.constructor.call(this, box);
	this.init(box);
};

twaver.Util.ext(RackNetwork, twaver.vector.Network, {
	_racks: [],
	_links: [],
	init: function(box) {
		var self = this;
		this._box = box;

		this._rackLayer = new twaver.Layer('rackLayer');
		box.getLayerBox().add(this._rackLayer);
		this._deviceLayer = new twaver.Layer('deviceLayer');
		box.getLayerBox().add(this._deviceLayer);
		this._focusLayer = new twaver.Layer('focusLayer');
		box.getLayerBox().add(this._focusLayer);
		this._linkLayer = new twaver.Layer('linkLayer');
		box.getLayerBox().add(this._linkLayer);

		this.getView().addEventListener('mousemove', function(e) {
			var element = self.getElementAt(e);
			element && element.onMouseMove && element.onMouseMove(e);
			if(element && element instanceof DeviceNode) {
				if(element != self._currentDevice) {
					self._currentDevice && self._currentDevice.onMouseLeave(e);
					element.onMouseEnter(e);
					self._currentDevice = element;
				}
			} else if(self._currentDevice) {
				self._currentDevice.onMouseLeave(e);
				self._currentDevice = null;
			}
			var rack = element && (element.getRack && element.getRack() || element);
			if(rack) {
				if(rack != element) {
					rack.onMouseMove(e, true);
				}
				if(rack instanceof RackNode && rack != self._currentRack) {
					self._currentRack && self._currentRack.onMouseLeave(e);
					rack.onMouseEnter(e);
					self._currentRack = rack;
				}
			} else if(self._currentRack) {
				self._currentRack.onMouseLeave(e);
				self._currentRack = null;
			}
		}, this);

		this.getView().addEventListener('click', function(e) {
			var element = self.getElementAt(e);
			if(element && element instanceof DeviceNode) {
				element.onClick(e);
			}
			if(element && element instanceof twaver.Link && element == self.getSelectionModel().getLastData()) {
				self._selectedLink = element;
				self.refreshLinks();
			} else {
				self._selectedLink = null;
				self.refreshLinks();
			}
		}, this);

		this.initPopupMenu();

	},

	renderScene: function(datas) {
		this.clean();
		this.createRacks(datas);
		this.arrangeRacks();
		// this.createNodes(data);
	},

	clean: function() {
		this._box.clear();
		this.setZoom(1);
		this.setViewRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
		this._racks = [];
	},

	/**
	 * 创建机柜
	 */
	createRacks: function(datas) {
		for(var i = 0; i < datas.length; i++) {
			var rack = this.createRack(datas[i]);
			this._racks.push(rack);
		}
	},

	createRack: function(rackData) {
		var rack = new RackNode(rackData, this);
		rack.setName(rackData.name);
		rack.setClient('rackData', rackData);
		rack.setLayerId('rackLayer');
		this._box.add(rack);
		this.refreshBasicSize(rack);
		if(rackData.children && rackData.children.length) {
			for(var i = 0; i < rackData.children.length; i++) {
				this.createDevice(rackData.children[i], rack);
			}
		}
		return rack;
	},

	refreshBasicSize: function(rack) {
		!this._rackWidth && (this._rackWidth = rack.getWidth());
		if(!this._rackHeight || this._rackHeight < rack.getHeight()) {
			this._rackHeight = rack.getHeight();
			if(this._rackHeight > this.getViewRect().height - 40) {
				this._rackHeight = this.getViewRect().height - 40;
			}
		}
	},

	//创建设备
	createDevice: function(deviceData, rack) {
		var self = this;
		this.addConnectData(deviceData, function(data) {
			// var name = data.nodeName, 
			// icon = data.nodeIcon,
			// image = data.nodeImage,
			// type = data.meType,
			// mocId = data.mocId,
			// parentId = data.parentId,
			// info2D = data.planInfo,
			// info3D = data.imageInfo,
			// controlPoint = data.controlPoint,
			// shapePoints = data.shapePoints,
			// row = data.row,
			// column = data.column,
			// sortIndex = data.sortIndex,
			// userProperties = data.userProperties;
			var device = new DeviceNode(data, rack);
			device.setMovable(false);
			device.setLayerId('deviceLayer');
			self._box.add(device);
			return device;
		});
	},

	addConnectData: function(deviceData, callback) {
		var deviceId = deviceData.id;
		Api.getConnectData(deviceId, function(data) {
			deviceData.connectData = data;
			deviceData.connectedPorts = data && Object.keys(data);
			callback && callback(deviceData);
		}, this);
	},

	arrangeRacks: function() {
		var count = this._racks.length;
		if(count) {
			var spacing = this._rackWidth + 40;
			var viewRect = this.getViewRect();
			var startX = viewRect.x + viewRect.width / 2 - this._rackWidth / 2;
			if(count > 1) {
				startX -= spacing * (count - 1) / 2;
			}
			if(startX < viewRect.x) {
				startX = viewRect.x + 20;
			}
			for(var i = 0; i < this._racks.length; i++) {
				var x = startX + spacing * i;
				var y = viewRect.y + viewRect.height / 2 + this._rackHeight / 2 - this._racks[i].getHeight();
				if(y < viewRect.y) {
					y = viewRect.y + 10;
				}
				this._racks[i].setLocation(x, y);
			}
		}
	},

	createLinks: function() {
		var self = this;
		this._connectModle = true;
		this.invalidate();
		this._linksCount = {
			'extend.left': 0,
			'extend.right': 0,
			'extend.top': 0,
			'orthogonal.vertical': 0
		};
		this._box.forEach(function(element) {
			if(element && element instanceof DeviceNode) {
				var connectData = element._connectData;
				if(connectData && Object.keys(connectData).length) {
					for(var fromPort in connectData) {
						var toArr = connectData[fromPort].split(':');
						var toDevice = self._box.getDataById(toArr[0]);
						if(toDevice) {
							self.createLink(element, fromPort, toDevice, toArr[1]);
						}
					}
				}
			}
		});
	},

	createLink: function(fromDevice, fromPort, toDevice, toPort) {
		var portType;
		if(fromPort.charAt(0) == 'n' && toPort.charAt(0) == 'n') {
			portType = 'network';
		} else if(fromPort.charAt(0) == 'p' && toPort.charAt(0) == 'p') {
			portType = 'power';
		}
		if(!portType) {
			console.log('the port ' + fromPort + ' and ' + toPort + ' is unmatched!');
			return;
		}
		var self = this;
		var fromData = fromDevice.getPortData(fromPort);
		var toData = toDevice.getPortData(toPort);
		var fromPortPoint = createPortPoint(fromData, 'from');
		var toPortPoint = createPortPoint(toData, 'to');
		var link = new twaver.Link(fromPortPoint, toPortPoint);
		link.setLayerId('linkLayer');
		link.c('portType', portType);
		this.setLinkStyle(link, 'common');
		var linkType = 'extend.top';
		// same rack
		// todo card还有一层
		//		if(fromPort.getHost().getHost() === toPort.getHost().getHost()) {
		//			if(portType == 'network') {
		//				linkType = 'orthogonal.vertical';
		//			} else {
		//				var location = fromPort.getHost().getClient('location') || toPort.getHost().getClient('location');
		//				if(location === 'left') {
		//					linkType = 'extend.left';
		//				} else {
		//					linkType = 'extend.right';
		//				}
		//			}
		//		}
		var count = this._linksCount[linkType]++;
		link.setStyle('link.type', linkType);
		if(linkType === 'orthogonal.vertical') {
			var offset = 0;
			/*if (count !== 0) {
			  if (count % 2 === 0) {
			    offset = count / 2 * 0.1;
			  } else {
			    offset = -(count + 1) / 2 * 0.1;
			  }
			}*/
			link.setStyle('link.split.percent', 0.5 + offset);
		} else {
			link.setStyle('link.extend', 10 + 5 * count);
		}
		this._links.push(link);
		this._box.add(link);

		function createPortPoint(portData, type) {
			var portPoint = new twaver.Follower(portData.id);
			portPoint.setLocation(portData.x, portData.y);
			portPoint.setLayerId('deviceLayer');
			portPoint.c('isPort', true);
			portPoint.setSize(0, 0);
			portPoint.setHost(portData.device);
			self._box.add(portPoint);
			return portPoint;
		}
	},

	setLinkStyle(link, styleType) {
		var lineColor;
		var portType = link.c('portType');
		if(portType == 'network') {
			lineColor = '#00FFFF';
		} else if(portType == 'power') {
			lineColor = '#FFFF00';
		}
		var width = 1;
		var arrowWidth = 4;
		var arrowHeight = 3;
		var radius = 6;
		if(styleType == 'focus') {
			width = 2;
			arrowWidth = 6;
			arrowHeight = 4;
		} else if(styleType == 'unfocused') {
			lineColor = lineColor.colorRgb(0.3);
		}
		link.setStyle('link.width', width);
		link.setStyle('link.color', lineColor);
		link.setStyle('arrow.from', true);
		link.setStyle('arrow.from.width', arrowWidth);
		link.setStyle('arrow.from.height', arrowHeight);
		link.setStyle('arrow.from.color', lineColor);
		link.setStyle('arrow.to', true);
		link.setStyle('arrow.to.width', arrowWidth);
		link.setStyle('arrow.to.height', arrowHeight);
		link.setStyle('arrow.to.color', lineColor);
		link.setStyle('link.xradius', radius);
		link.setStyle('link.yradius', radius);

	},

	refreshLinks: function() {
		if(this._links.length) {
			for(var i = 0; i < this._links.length; i++) {
				var link = this._links[i];
				var styleType = 'common';
				if(this._selectedLink) {
					styleType = 'unfocused';
					if(link == this._selectedLink) {
						styleType = 'focus';
					}
				}
				this.setLinkStyle(link, styleType);
			}
		}
	},

	deleteLinks: function() {
		var self = this;
		this._connectModle = false;
		this.invalidate();
		this._box.toDatas().forEach(function(element) {
			if(element && element instanceof twaver.Link) {
				self._box.remove(element);
			} else if(element && element.c('isPort')) {
				self._box.remove(element);
			}
		});
	},

	initPopupMenu: function() {
		var self = this;
		var backgroundColor = 'white';
		var borderColor = 'gray';
		var ruleColor = 'LightBlue';
		var textColor = 'black';
		var font = '12px Arial';
		var lineHeight = 25;
		var borderRadius = 4;
		var lastData, lastPoint;
		var popupMenu = this._popupMenu = this._popupMenu || new twaver.controls.PopupMenu(this);
		var menuItemsMap = {
			'rack': ['连线模式', '视图模式'],
			'device': ['连线模式', '视图模式', '删除设备'],
			'none': ['连线模式', '视图模式'],
		};
		var menuItems = function(menuItemsMap) {
			var menuItems = [];
			for(var group in menuItemsMap) {
				var items = menuItemsMap[group];
				for(var i = 0; i < items.length; i++) {
					var menuItem = {};
					menuItem.group = group;
					menuItem.label = items[i];
					menuItems.push(menuItem);
				}
			}
			return menuItems;
		};
		var visibleGroup = function(node) {
			if(node instanceof RackNode) {
				return 'rack';
			} else if(node instanceof DeviceNode) {
				return 'device';
			} else {
				return 'none';
			}
		};
		var setPopupWidth = function(items) {
			var maxTextLen = 60;
			if(items && items.length) {
				for(var i = 0; i < items.length; i++) {
					var textLen = _twaver.g.getTextSize(font, items[i]).width;
					if(textLen > maxTextLen) {
						maxTextLen = textLen;
					}
				}
			}
			popupMenu.setWidth(maxTextLen + 40);
		};

		popupMenu.onMenuShowing = function(e) {
			lastData = self.getSelectionModel().getLastData();
			lastPoint = self.getLogicalPoint(e);
			var group = visibleGroup(lastData);
			var items = menuItemsMap[group];
			setPopupWidth(items);
			return true;
		};
		popupMenu.onMenuItemRendered = function(div, menuItem) {
			var top = (lineHeight - parseInt(font)) / 4;
			div.style.height = lineHeight - top + 'px';
			div.style.padding = top + 'px 0px 0px 0px';
			div.style.borderRadius = borderRadius + 'px';
			div.parentElement.style.borderRadius = borderRadius + 'px';
			div.childNodes[1].style.font = font;
		};

		popupMenu.setMenuItems(menuItems(menuItemsMap));
		popupMenu.isVisible = function(menuItem) {
			var item = visibleGroup(lastData);
			var visible = menuItem.group === item;
			if(visible) {
				if(menuItem.label === '连线模式') {
					visible = !self._connectModle;
				} else if(menuItem.label === '视图模式') {
					visible = self._connectModle;
				}
			}
			return visible;
		};
		popupMenu.onAction = function(menuItem) {
			if(menuItem.label === '连线模式') {
				self.createLinks();
			} else if(menuItem.label === '视图模式') {
				self.deleteLinks();
			} else if(menuItem.label === '删除设备') {
				self._box().remove(lastData);
			}
		};
		popupMenu.isEnabled = function(menuItem) {
			//			if (menuItem.group === 'device') {
			//				return false;
			//			}
			return true;
		};

	},

});
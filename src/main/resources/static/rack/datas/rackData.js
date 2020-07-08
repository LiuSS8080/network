var rackData = {
	'rackbin1': {
		id: 'rackbin1',
		name: '机柜1',
		uAmount: 30,
		children: [{
			id: 'device11',
			name: '设备1',
			uStart: 2,
			uCount: 2,
			powerPortAmount: 3,
			networkPortAmount: 48,
			connectedPowerPorts: ['p1'],
			connectedNetworkPorts: ['n2', 'n4', 'n6']
		}, {
			id: 'device12',
			name: '设备2',
			uStart: 10,
			uCount: 3,
			powerPortAmount: 4,
			networkPortAmount: 51,
			connectedPowerPorts: ['p2', 'p3'],
			connectedNetworkPorts: ['n10', 'n11', 'n12', 'n13', 'n14']
		}, {
			id: 'device13',
			name: '设备3',
			uStart: 20,
			uCount: 4,
			powerPortAmount: 5,
			networkPortAmount: 51,
			connectedPowerPorts: ['p2', 'p3', 'p4'],
			connectedNetworkPorts: ['n10', 'n11', 'n12', 'n13', 'n14']
		}]
	},
	'rackbin2': {
		id: 'rackbin2',
		name: '机柜2',
		uAmount: 36,
		children: [{
			id: 'device21',
			name: '设备1',
			uStart: 1,
			uCount: 1,
			powerPortAmount: 2,
			networkPortAmount: 48,
			connectedPowerPorts: ['p1'],
			connectedNetworkPorts: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15', 'n16', 'n17', 'n18', 'n19', 'n20', 'n21', 'n22', 'n23', 'n24', 'n25', 'n26', 'n27', 'n28', 'n29', 'n30', 'n31', 'n32', 'n33', 'n34', 'n35', 'n36', 'n37', 'n38', 'n39', 'n40', 'n41', 'n42', 'n43', 'n44', 'n45', 'n46', 'n47', 'n48']
		}, {
			id: 'device22',
			name: '设备2',
			uStart: 2,
			uCount: 2,
			powerPortAmount: 2,
			networkPortAmount: 96,
			connectedPowerPorts: ['p1'],
			connectedNetworkPorts: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15', 'n16', 'n17', 'n18', 'n19', 'n20', 'n21', 'n22', 'n23', 'n24', 'n25', 'n26', 'n27', 'n28', 'n29', 'n30', 'n31', 'n32', 'n33', 'n34', 'n35', 'n36', 'n37', 'n38', 'n39', 'n40', 'n41', 'n42', 'n43', 'n44', 'n45', 'n46', 'n47', 'n48']
		}, {
			id: 'device23',
			name: '设备3',
			uStart: 4,
			uCount: 3,
			powerPortAmount: 6,
			networkPortAmount: 144,
			connectedPowerPorts: ['p1'],
			connectedNetworkPorts: []
		}, {
			id: 'device24',
			name: '设备4',
			uStart: 7,
			uCount: 4,
			powerPortAmount: 6,
			networkPortAmount: 144,
			connectedPowerPorts: ['p2', 'p3', 'p4'],
			connectedNetworkPorts: ['n1', 'n3', 'n5', 'n7', 'n9', 'n11', 'n13', 'n15', 'n17', 'n19', 'n21', 'n23', 'n25', 'n27', 'n29', 'n31', 'n33', 'n35', 'n37', 'n39', 'n41', 'n43', 'n45', 'n47']
		}, {
			id: 'device25',
			name: '设备5',
			uStart: 11,
			uCount: 5,
			powerPortAmount: 10,
			networkPortAmount: 144,
			connectedPowerPorts: ['p2', 'p3', 'p4'],
			connectedNetworkPorts: ['n2', 'n4', 'n6', 'n8', 'n10', 'n12', 'n14', 'n16', 'n18', 'n20', 'n22', 'n24', 'n26', 'n28', 'n30', 'n32', 'n34', 'n36', 'n38', 'n40', 'n42', 'n44', 'n46', 'n48']
		}]
	},
	'rackbin3': {
		id: 'rackbin3',
		name: '机柜3',
		uAmount: 46,
		children: [{
			id: 'device31',
			name: '设备1',
			uStart: 2,
			uCount: 2,
			powerPortAmount: 2,
			networkPortAmount: 7,
			connectedPowerPorts: ['p1'],
			connectedNetworkPorts: ['n2', 'n4', 'n6']
		}, {
			id: 'device32',
			name: '设备2',
			uStart: 10,
			uCount: 10,
			powerPortAmount: 5,
			networkPortAmount: 81,
			connectedPowerPorts: ['p2', 'p3', 'p4'],
			connectedNetworkPorts: ['n10', 'n11', 'n12', 'n13', 'n14']
		}, {
			id: 'device33',
			name: '设备3',
			uStart: 26,
			uCount: 16,
			powerPortAmount: 10,
			networkPortAmount: 100,
			connectedPowerPorts: ['p2', 'p3', 'p4'],
			connectedNetworkPorts: ['n10', 'n11', 'n12', 'n13', 'n14']
		}]
	}
};

var connectData = {
	device11: {
		n2: 'device12:n12',
		n4: 'device22:n12',
		n6: 'device22:n47',
		n7: 'device25:n48',
		n8: 'device22:n24',
		n10: 'device22:n95',
		n12: 'device22:n96',
		p1: 'device25:p2',
		p3: 'device25:p4',
	},
};
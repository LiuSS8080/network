Api = {
	/**
	 * 获取拓扑图数据
	 * @param  {String}   id       左树节点的elementId
	 * @param  {Function} callback 回掉函数
	 * @param  {Object}   scope    作用域
	 * @return {Object}            返回值
	 */
	getTopoData: function(id, callback, scope) {
		var datas = DataMap[id];
		if(callback) {
			callback.call(scope, datas);
		}
	},

	/**
	 * 获取机柜数据
	 * @param  {Array}   ids       机柜id
	 * @param  {Function} callback 回掉函数
	 * @param  {Object}   scope    作用域
	 * @return {Object}            返回值
	 */
	getRacksData: function(ids, callback, scope) {
		var datas = [];
		for(var i = 0; i < ids.length; i++) {
			datas.push(rackData[ids[i]]);
		}
		if(callback) {
			callback.call(scope, datas);
		}
	},

	/**
	 * 获取设备连接数据
	 * @param  {String}   id       设备id
	 * @param  {Function} callback 回掉函数
	 * @param  {Object}   scope    作用域
	 * @return {Object}            返回值
	 */
	getConnectData: function(id, callback, scope) {
		var data = connectData[id] || [];
		if(callback) {
			callback.call(scope, data);
		}
	},
};
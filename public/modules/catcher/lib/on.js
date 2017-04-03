'use strict';

module.exports = function(){

	var pro = typeof HTMLElement !== "undefined" ? HTMLElement.prototype : Element.prototype;

	if(!!window.addEventListener){
		window.onEvent = pro.onEvent = function(name, cb){
			this.addEventListener(name, cb);
		}
	}
	if(!!window.attachEvent){
		window.onEvent = pro.onEvent = function(name, cb){
			this.attachEvent('on' + name, cb);
		}
	}

}();
'use strict';
/*

*/ 

var ErrorObj = require('./errorobj.js');


module.exports = function(errorEvent, cb){

	var errorObj = new ErrorObj(errorEvent);

	/*直接先排除掉Script error.  日后需要放开*/ 
	if( /Script error(\.*)$/.test(errorObj.scriptErrorMsg) ){
		return false;
	}

	/*先排除掉分享的错误*/ 
	if( /(tcshareimg|tcshareurl|tcDesc|tcsharetext)/.test(errorObj.scriptErrorMsg) ){
		return false;
	}

	/*筛选*/ 
	if( errorObj.errorType != 'scriptError' || FILTER_ERRORS(errorObj) ){

		/*回调*/ 
		cb && cb(errorObj)
	}

}


/*关于处理缓存script error*/
var FILTER_ERRORS = function (){

	/**
	*	对比用的缓存
	*
	*	结构:
	* 
	*	[
	*   	{
	*			errorLine ,
	*			errorFile ,
	*			errorMsg ,
	*			TIME
	*    	}
	*	]
	*
	*
	*/
	/*用来筛选script error是不是发生在这个时间内的同一个错误  单位是为秒*/ 
	var MAX_FILTER_TIME  = 2;
	
	/*最多 用来存储多少个script error*/
	var MAX_CACHE_LENGTH = 100; 

	var caches           = []; 

	return function(scriptError){
		
		var errorTime = scriptError.scriptErrorTime;
		var errorLine = scriptError.scriptErrorLine;
		var errorFile = scriptError.scriptErrorFile;
		var errorMsg  = scriptError.scriptErrorMsg;

		/*循环遍历下*/
		for(var i=0;i<caches.length;i++){

			var t     = caches[i];

			var tTime = t.scriptErrorTime; 
			var tLine = t.scriptErrorLine;
			var tFile = t.scriptErrorFile;
			var tMsg  = t.scriptErrorMsg;

			/*如果信息一致*/ 
			if( errorLine == tLine && errorFile == tFile && errorMsg ==  tMsg ){
				/*并且时间小于规定值*/
				if(errorTime - tTime < MAX_FILTER_TIME){
					/*不能发送*/ 
					return false;
				}
			}

		}
	
		/*如果超过时限了，我们就可以缓存并且发送，缓存是为了给后面的数据有对比的参照*/	
		if(caches.length >= MAX_CACHE_LENGTH){
			caches.shift();
		}
		caches.push(scriptError);
		
		return true;
	}

}();

















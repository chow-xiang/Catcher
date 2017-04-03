'use strict';

/*
*要解决跨域的问题
*
*
*/ 


var reportError = require('./lib/reporterror.js');

module.exports = function (cb) {

	/*捕获error事件*/ 
	window.onEvent('error', function(){

		/*不去妨碍其他模块*/ 
		try{

			reportError( arguments, cb );

		}catch(e){
			
		}

	});

}











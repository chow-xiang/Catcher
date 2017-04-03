'use strict';

/*绑定事件的处理*/ 
require('./lib/on.js');
var config  = require('./lib/configer.js');
var sendMsg = require('./lib/sender.js');

module.exports = function(){

	/*绝对不能影响其他的代码运行*/ 
	try{ 
		
		/*鹰眼搜索的字段*/
		var pageName       = config.pageName;
		/*平台*/ 
		var platform       = config.platform || '未知';
		
		/*传加载错误的地址*/ 
		var loadErrorUrl   = config.loadErrorUrl;
		/*脚本错误的传入地址*/
		var scriptErrorUrl = config.scriptErrorUrl;
		/*uaser-agent信息的传入地址*/
		var uaUrl          = config.uaUrl;
		/*time-line的传入地址*/
		var timelineUrl    = config.timelineUrl;
		/*接口监听的地址*/
		var interfaceUrl   = config.interfaceUrl;

		/*先覆盖掉这个 ajax*/
		// var AjaxStatus = require('./interface.js')(function(ajaxStatus){

		// 	/*判断url是不是ajaxStatus写入鹰眼的接口，防止死循环。*/ 
		// 	if(    ajaxStatus.url.indexOf('WriteInterfaceError') != -1 
		// 		|| ajaxStatus.url.indexOf('WriteLoadError') != -1
		// 		|| ajaxStatus.url.indexOf('WriteScriptError') != -1
		// 		|| ajaxStatus.url.indexOf('WriteUA') != -1
		// 		|| ajaxStatus.url.indexOf('WriteTimeline') != -1
		// 	){
		// 		return;
		// 	}
			
		// 	ajaxStatus.platform = platform;
		// 	sendMsg(pageName, ajaxStatus, interfaceUrl);

		// });

		/*未知平台不执行*/ 
		if( !!platform && platform != '' ){

			/*ua*/ 
			var Ua       = require('./ua.js')(function(ua){

				ua.platform = platform;

				sendMsg(pageName, ua, uaUrl);

			});
			
			
			/*timeline*/ 
			var TimelineStatus = require('./timeline.js')(function(timeline){

				sendMsg(pageName, timeline, timelineUrl);

			});


			/*error*/   
			var ErrorStatus = require('./error.js')(function(errorObj){

				/*分平台*/ 
				errorObj.platform  = platform;
				/*把ua也带过去*/
				errorObj.userAgent = (window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : '';


				/*如果是load error  暂时先不上*/ 
				if( errorObj.errorType == 'loadError' ) {

					sendMsg(pageName, errorObj, loadErrorUrl);

				}
				
				/*如果是script error*/ 
				if( errorObj.errorType == 'scriptError' ) {

					sendMsg(pageName, errorObj, scriptErrorUrl);

				}

			});

		}


	}catch(e){
		/*发送下错误*/ 
	}

}();





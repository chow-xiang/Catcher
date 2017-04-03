'use strict';

function ErrorObj(errorEvent){

	var error;
	/*fuck ie*/
	if(errorEvent.length > 1){
		error = this.proEvent(errorEvent);
	}else{
		error = errorEvent[0];
	} 

	/*fuck ie8*/
		/*script error*/ 
	if( this.isScriptError(error) ){
		return new ScriptError(error);
	}else{
		/*load error暂时先不上*/ 
		// return new LoadError(error);
	}

	return {};

} 


ErrorObj.prototype = {
	/*profill ie8 errror event*/
	proEvent : function(arg){
		return {
			message  : arg[0],
			filename : arg[1],
			lineno   : arg[2],
			errStack : arg[4]
		}
	}, 
	/*判断是不是script error*/ 
	isScriptError : function(e) {

	    // var toString = Object.prototype.toString.call(e);
	    return e.message != void 0 || e.lineno != void 0;

	    // if(e.srcElement == '[object HTMLScriptElement]' && e.target == '[object HTMLScriptElement]'){
	    //     msg = 'Error loading script';
	    // }
	    
	}
}

/*load error*/
function LoadError(e){

	var _target    = e.target;

	/*属性对照表*/
	var URL_KEY_MAP = {
		img    : 'src',
		script : 'src',
		link   : 'href'
	}
	
	this.errorType     = 'loadError';
	
	this.errorUrl      = window.location.href            || _target.baseURI;
	this.loadErrorType = _target.tagName.toLowerCase()   || '';
	this.loadErrorUrl  = _target[ URL_KEY_MAP[this.loadErrorType] ] || '';

	return this;
} 


/*script error*/
function ScriptError(e){

	this.errorType       = 'scriptError';
	this.errorUrl        = window.location.href || '';
	this.scriptErrorLine = e.lineno     || 0;
	this.scriptErrorFile = e.filename   || '';
	this.scriptErrorMsg  = e.message    || '';
	/*用来筛选的*/ 
	this.scriptErrorTime = new Date().getTime() / 1000;

	return this;
} 



module.exports = ErrorObj;

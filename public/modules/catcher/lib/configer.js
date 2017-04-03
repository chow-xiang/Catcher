'use strict';

/**
*当前的各种配置
*/ 
var config = new function(){
		/*当前具体的url*/
		this.nowUrl   = window.location.href;
		/*页面的名称*/ 
		this.name     = window.pageName || window.location.href;
		/*站点的类型*/ 
		this.platform = window.platform;
		/*环境*/ 
		this.env      = getEnv(window.catcherEnvironment);
		/*鹰眼搜索的字段*/
		this.pageName = this.name + '_' + this.platform + '_' + this.env;

		/*传加载错误的地址*/ 
		this.loadErrorUrl   = this.env == 'dev' || this.env == 'test' ? '//gny.t.ly.com/common/WriteLoadError' : '//gny.ly.com/common/WriteLoadError';
		/*脚本错误的传入地址*/
		this.scriptErrorUrl = this.env == 'dev' || this.env == 'test' ? '//gny.t.ly.com/common/WriteScriptError' : '//gny.ly.com/common/WriteScriptError';
		/*uaser-agent信息的传入地址*/
		this.uaUrl          = this.env == 'dev' || this.env == 'test' ? '//gny.t.ly.com/common/WriteUA' : '//gny.ly.com/common/WriteUA';
		/*time-line的传入地址*/
		this.timelineUrl    = this.env == 'dev' || this.env == 'test' ? '//gny.t.ly.com/common/WriteTimeline' : '//gny.ly.com/common/WriteTimeline';
		/*接口监听的地址*/
		this.interfaceUrl   = this.env == 'dev' || this.env == 'test' ? '//gny.t.ly.com/common/WriteInterfaceError' : '//gny.ly.com/common/WriteInterfaceError'
}



/*判断当前的环境*/
function getEnv(environment){
	/*默认值*/ 
	environment = environment || 'dev';
	/*统一成小写*/ 
	return environment.replace(/\//g, '').toLowerCase();
} 



module.exports = config;



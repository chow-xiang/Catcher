'use strict';

module.exports = function(cb){

	window.onEvent('load', function(){

        /*不去妨碍其他模块*/ 
        try{

	       times && times(cb);

        }catch(error){

        }

	}, true);
}

/*暂时不能兼容ie8*/ 
function times(cb){

    var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;

    if ( !performance ) {
        return false;
    }
     

    var timing = performance.timing;
    var timeOut;


    /*延时是因为loadEventEnd在load事件中可能会是0*/ 
    if( timing.loadEventEnd <= 0 ){
        timeOut = setTimeout( function(){
        	times(cb);
        }, 0)
    }
    else{
        clearTimeout(timeOut);
        /*默认值 为了排斥不正常的数据*/ 
        var api    = {
            /*真正解析dom文档的时间*/ 
            firstPaintTime   : -1,
            loadTime         : -1,
            domReadyTime     : -1,
            readyStartTime   : -1,
            redirectTime     : -1,
            appcacheTime     : -1,
            unloadEventTime  : -1,
            lookupDomainTime : -1,
            connectTime      : -1,
            requestTime      : -1,
            initDomTreeTime  : -1,
            loadEventTime    : -1
        };


        if (timing) { 

            /*首屏的时间*/ 
            api.firstPaintTime   = getFirstPaint(timing);
            // load事件总耗时 也就是圈圈停止转的时间
            api.loadTime         = timing.loadEventEnd - timing.fetchStart;
            // dom树解析耗时   页面可见时间
            api.domReadyTime     = timing.domComplete - timing.domInteractive;
            // 浏览器准备新页面时间耗时
            api.readyStartTime   = timing.fetchStart - timing.navigationStart;
            // 重定向耗时
            api.redirectTime     = timing.redirectEnd - timing.redirectStart;
            // 缓存耗时
            api.appcacheTime     = timing.domainLookupStart - timing.fetchStart;
            // 卸载前一个document耗时
            api.unloadEventTime  = timing.unloadEventEnd - timing.unloadEventStart; 
            // DNS 查询耗时
            api.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
            // TCP连接耗时
            api.connectTime      = timing.connectEnd - timing.connectStart;
            // request请求耗时
            api.requestTime      = timing.responseEnd - timing.requestStart;
            // dom树成型的时间   包括资源加载时间
            api.initDomTreeTime  = timing.domInteractive - timing.responseEnd;
            // 加载document总耗时
            api.loadEventTime    = timing.loadEventEnd - timing.loadEventStart;
            
        }

        /*cb*/ 
        FILTER_VALUE(api) && cb && cb(api);        
        
        /*阅后即焚法则*/
        times = void 0;
    }
}

/*firstPaintTime*/
function getFirstPaint(timeline) {

    var firstPaint = 0;
    var firstPaintTime = -1;

    // Chrome
    if (window.chrome && window.chrome.loadTimes) {
        firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;
        firstPaintTime = firstPaint - (window.chrome.loadTimes().startLoadTime*1000);
    }
    // IE
    else if (typeof timing.msFirstPaint === 'number') {
        firstPaint = timing.msFirstPaint;
        firstPaintTime = firstPaint - timing.navigationStart;
    }
    // Firefox
    // This will use the first times after MozAfterPaint fires
    //else if (timing.navigationStart && typeof InstallTrigger !== 'undefined') {
    //    api.firstPaint = timing.navigationStart;
    //    firstPaintTime = mozFirstPaintTime - timing.navigationStart;
    //}

    //other
    /*因为大部分移动端浏览器不兼容firstPaintTime，所以，我们就权且把当时减去fetchstart当做首屏时间*/ 
    else{
        firstPaint = Date.now();
        firstPaintTime = firstPaint - window.performance.timing.navigationStart;
    }

    return firstPaintTime;
} 

/*排斥异常的数据*/ 
var MAX_TIME_VALUE = 1 * 60 * 60 * 1000;

/*排斥异常数据的方法*/ 
var FILTER_VALUE   = function(timeline){

    for(var key in timeline){

        var v = timeline[key];

        /*排除负值以及空值*/ 
        if(isNaN(v) || v < 0){
            return false;
        }

        /*排除不健康的值*/ 
        if(v > MAX_TIME_VALUE){

            /*记得报个错过去记一下*/ 
            return false;
        }
    }
    return true;
}



'use strict';
/*
*通过复写ajax，达到检测接口调用的情况
*
*建议以后复写原生的xmlHttpRequest
*/ 


module.exports = function(cb) {

    /*覆盖原先的ajax*/ 
    var _ajax = $.ajax;

    $.ajax = function(opt) {

        /*记录每次接口的状态*/ 
        var interfaceStatus = {
            type : opt.type ? opt.type.toLowerCase() : 'post',
            data : JSON.stringify(opt.data),
            url  : opt.url || '',
        };

        /*提取原来的回调*/ 
        var fn = {
            success: opt.success ? opt.success : function(data, textStatus) {},
            error: opt.error ? opt.error : function(XMLHttpRequest, textStatus, errorThrown) {},
            beforeSend: opt.beforeSend ? opt.beforeSend : function(XMLHttpRequest, settings) {},
            complete: opt.complete ? opt.complete : function(XMLHttpRequest, textStatus) {}
        };

        // opt.dataType = opt.dataType || 'json';
        // opt.type = opt.type || 'POST';

        /*覆盖掉原来的*/ 
        var _opt = $.extend(opt, {
            // success: function(data, textStatus) {
            //     fn.success(data, textStatus);
            // },
            // error: function(xhr, textStatus, errorThrown) {

            //     fn.error(xhr, textStatus, errorThrown);
            // },
            beforeSend: function(xhr, settings) {
                /*发送之前的*/ 
                fn.beforeSend(xhr, settings);
                /*用来对比的时间*/
                interfaceStatus.startTime = new Date().getTime();
            },
            complete: function(xhr, textStatus) {

                /**/ 
                fn.complete(xhr, textStatus);

                /*把数据返回*/ 
                try{
                    /*状态*/
                    interfaceStatus.status = GET_STATUS(xhr, textStatus);
                    /*结束的时间*/
                    var endTime             = new Date();
                    interfaceStatus.endTime = formatDate (endTime);
                    /*总耗时*/
                    interfaceStatus.timing  = endTime.getTime() - interfaceStatus.startTime;

                    /*用户的id*/
                    interfaceStatus.memberid = window.gnyCommon.memberid;

                    /*关于时间的阈值*/ 
                    if ( !FILTER_TIMING(interfaceStatus.timing) ){
                        /*回调*/ 
                        cb && interfaceStatus.url && cb(interfaceStatus);
                    }

                    
                }catch(e){

                }
                
            }
        });

        /*判断参数是否需要监听*/
        return _ajax(_opt);
    }

}
 

/*时间的阈值*/
var FILTER_TIMING_NUM = 10 * 60 * 1000;
/*阈值的排除*/ 
var FILTER_TIMING     = function(timing){
    return timing >= FILTER_TIMING_NUM;
    /*记得发送错误给error处理*/ 
} 

/*获取状态的方法*/
var GET_STATUS = function(xhr, textStatus){
    return textStatus.toLowerCase() || (xhr.readyState == 4 ? 'success' : 'error');
} 

/*时间的格式转换*/
function formatDate(date){

    var Y = date.getFullYear();
    var M = date.getMonth() + 1;
    var D = date.getDate();

    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();

    return Y + '/' + M + '/' + D + ' ' + h + ':' + m + ':' + s;
} 


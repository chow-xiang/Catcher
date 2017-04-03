'use strict';

/*发送数据的方法*/ 

module.exports = function (pageName, data, url){

	if(!!url && !!data){

		/*接口的数据需要这个数据*/ 
		data.pageName = pageName;

		/*发送*/ 
		$.ajax({
			type : 'get',
			dataType : 'jsonp',
			url  : url,
			data : data,
			success : function(res){
				// console.log(res)
			},
			error   : function (res) {
				// console.log(res)
				/*如果出现错误，怎么判断是302或404或500*/

			}
		});

	}

}

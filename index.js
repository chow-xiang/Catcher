'use strict';

let path         = require('path');

/*静态资源的文件*/ 
const publicPath = path.join(__dirname, './public');


let koa          = require('koa');

let serverStatic = require('koa-static');
let logger       = require('koa-logger');

let render       = require('co-views')('./views', {
	map: {
		html: 'jade'
	},
	default: 'jade'
});
let app          = koa();

/*开放静态资源*/ 
app.use(serverStatic(publicPath));
/*logger*/
app.use(logger());

/*to be multi is to cut press for catcher server*/ 
/*to take mmsg be catched */

/*to show msg to user*/ 

	
app.use(function* (next) {

	if(this.path !== '/404'){
		yield next;
	}else{
		this.body = 'this page not found';
	}

});



/*index*/
app.use(function* (next){

	if(this.path !== '/index' && this.path != '/'){
		yield next;
	}else{
		this.body = yield render('index');
		// this.body = 'test';
	}
}); 


app.use(function* (next) {

	if(this.path !== '/500'){
		yield next;
	}else{
		this.body = 'server error';
	}

	
});

	
app.listen(8080);

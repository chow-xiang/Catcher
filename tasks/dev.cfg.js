'use strict';

let path   = require('path');

let rollup = require('rollup');
let buble  = require('rollup-plugin-buble');
let glob   = require('glob');

/*pages文件夹*/
let pageJsPath = path.join(__dirname, '../public/static/pages/*.js');

glob(pageJsPath, function(error, files){

	for(let i=0;i<files.length;i++){

		let file     = files[i];
		let fileName = path.basename(file);

		rollup.rollup({

			entry   : file,
			plugins : [
				buble()
			]

		}).then(function(bundle){

			bundle.write({
				format : 'cjs',
				dest   : 'bundle.js'
			});

		});

	}
	
});



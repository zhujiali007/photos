
const fs = require('fs');  

var fileName = 'app.css';  


fs.watch(fileName,( function () { 

    return function(){  

		var stats = fs.readFileSync(fileName,'utf8');

		fs.writeFile('app.wxss', stats, function (err) {
		      if (err) console.error(err);
		      console.log('保存成功')
		})
    }; 


})());  

console.log("监听启动"+fileName+"完成"); 


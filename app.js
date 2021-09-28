var express = require('express');   //引入express模块
var mysql = require('mysql');     //引入mysql模块
var path = require('path');
var app = express();        //创建express的实例
var fs = require('fs');

//html渲染到前端
app.use(express.static(path.join(__dirname, 'public')));

//数据库连接查询
var connection = mysql.createConnection({      //创建mysql实例
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'mysql',
    database: 'new_schema'
});
connection.connect();
var sql = 'SELECT * FROM news limit 25';
var str = " ";
connection.query(sql, function (err, result) {
    //数据库查询的数据保存在result中
    if (err) {
        console.log('[SELECT ERROR]:', err.message);
    }
    //JSON进行解析result
    str = JSON.stringify(result);

    //将JSON输出
    fs.writeFile(path.join(__dirname, 'public/json/news_25.json'), str, function (err, data) {
        // console.log(err);
        // console.log(data);
    });
});

// app.get('/', function (req, res) {
//     res.send(str);  //服务器响应请求
// });

connection.end();

app.listen(3000, function () {
    console.log('Server running at 3000 port');
});

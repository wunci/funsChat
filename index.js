var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var hljs = require('highlight');
var md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

var users=[]
app.use('/', require('express').static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile('./index.html');
});


io.on('connection', function(socket){
	// 聊天内容
  	socket.on('chat message', function(msg){
  		socket.broadcast.emit('newMsg', socket.nickname, msg);
  	});
  // 登录
	socket.on('login', function(msg){
		if (users.indexOf(msg)>-1) {
			socket.emit('user repeate');
		}
   	else{
   		socket.userIndex=users.length;
   		socket.nickname=msg;
   		users.push(msg)
   		socket.emit('loginSuccess')
   		io.sockets.emit('system', msg, users.length, 'login');
   	}
	});
  //断开连接的事件
	socket.on('disconnect', function() {
	    //将断开连接的用户从users中删除
	    users.splice(socket.userIndex, 1);
	    //通知除自己以外的所有人
	    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});
	// 上传图片
	socket.on('img', function(imgData) {    
	    socket.broadcast.emit('sendImg',socket.nickname,imgData );
	});
	// 发送代码
	 socket.on('code message',(msg)=>{
	    socket.broadcast.emit('codeMsg',socket.nickname, md.render(`\`\`\`\n${msg}\n\`\`\``));
	 })

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
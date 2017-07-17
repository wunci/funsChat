md = window.markdownit({
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
    
  // 初始化表情包
  var picture=$('.picture')
  var _html='';
  for (var i = 1; i < 24; i++) {
    _html+=`<img src="./images/${i}.gif" title="${i}" alt="" />`
  }
  console.log(_html)
  picture.append(_html)
      
$(function () {
    
  // 表情包
  $('.show_picture').click((e)=>{
    $('.picture').toggle()
    e.stopPropagation();
    $(document).click(()=>{
      $('.picture').hide()
    })
  })
  $('.picture img').click(()=>{
     $('.picture').hide()
  })
  $('.picture img').click((e)=>{
    var target=e.target
    $('.send_text').focus()
    $('.send_text').val($('.send_text').val()+`[ali:${target.title}]`)
  })

  function showAli(msg){
    var match, result = msg,
    reg = /\[ali:\d+\]/g,
    aliIndex,
    total = 23;
    console.log(picture.children.length)
    while (match = reg.exec(msg)) {
      console.log(match[0])
        aliIndex = match[0].slice(5, -1);
        if (aliIndex > total) {
            result = result.replace(match[0], '***不存在***');
        } else {
            result = result.replace(match[0], '<img src="./images/' + aliIndex + '.gif" />');
        };
    };
    return result;
  }

  // 增加信息函数
  function message(user,msg,right,bg){
      var li = document.createElement('li');
      var date = new Date().toTimeString().substr(0, 8);
      var msg= showAli(msg)

    if (right) {
      li.innerHTML = `<div class="avator"><img src="./images/3.gif" alt="" /></div><div class="_msg_content right"><p>${user} ${date}</p> <div class="_msg">${msg}</div></div>`;
      li.style.cssText="display:flex;align-items:flex-end;  flex-direction:row-reverse ;"
    }else{
      li.innerHTML = `<div class="avator avator_style"><img src="./images/7.gif" alt="" /></div class="_msg_content"><div><p>${user} ${date}</p> <div class="_msg">${msg}</div></div>`;
      li.style.cssText="display:flex; align-items:flex-start;"
    }

    if (bg) {

       li.innerHTML = `<div class="avator"><img src="./images/3.gif" alt="" /></div><div class="_msg_content"><p>${user} ${date}</p> <div class="_codeMsg">${msg}</div></div>`;
    }
    
    $('#messages').append(li)
    $('#messages').scrollTop($('#messages')[0].scrollHeight)

  }
  // 发送图片函数
   function uploadImg(user,msg,right){

     var li = document.createElement('li');
     var date = new Date().toTimeString().substr(0, 8);
     li.innerHTML = `<div class="avator"><img src="./images/3.gif" alt="" /></div><p><div class="upload_img_content">${user} ${date} </p><div class="upload_img"> <img class="" src="${msg} "/></div> </div>`;
     // 右侧
     if (right) {
      li.style.cssText="display:flex;align-items:flex-end;  flex-direction:row-reverse ;"
      li.innerHTML = `<div class="avator"><img src="./images/3.gif" alt="" /></div><p><div class="upload_img_content ">${user} ${date} </p><div class="upload_img"> <img class="" src="${msg} "/></div> </div>`;
    }else{
     li.style.cssText="display:flex; align-items:flex-start;"
     li.innerHTML = `<div class="avator"><img src="./images/7.gif" alt="" /></div><p><div class="upload_img_content left">${user} ${date} </p><div class="upload_img"> <img class="" src="${msg} "/></div> </div>`;
    }
     $('#messages').append(li)
     setTimeout(()=>{
      $('#messages').scrollTop($('#messages')[0].scrollHeight)
     },0)
  }

  var socket = io();

  // enter键盘事件
  $(document).keydown(e=>{
      // console.log(e.keyCode)
      if (e.keyCode==13) {
          if ($('.send_text').val().trim() === '') {
          $('.send_text').attr('placeholder','请输入内容 ')
      } else{

        socket.emit('chat message', $('.send_text').val());
        message('^_^',$('.send_text').val() ,true )

        $('.send_text').val('');
         $('.send_text').attr('placeholder',' ')
        return false;
      }   
    }
  })

  // 发送信息
  $('.send_msg .send_btn').click(function(){
    if ($('.send_text').val().trim() === '') {
      $('.send_text').attr('placeholder','请输入内容 ')
    } else{
      socket.emit('chat message', $('.send_text').val());
      message('^_^',$('.send_text').val() ,true )

      $('.send_text').val('');
       $('.send_text').attr('placeholder',' ')
      return false;
    }   
  });
  
  // 监听新消息
  socket.on('newMsg', function(user,msg){   
    message(user,msg,false)
  });

  socket.on('connect', function() {
    //连接到服务器后，显示昵称输入框
    $('.dialog').show()
    $('#nickname').focus()

    $(document).keydown(e=>{
      // console.log(e.keyCode)
      if (e.keyCode==13) {
         if ( $('#nickname').val().trim()==='') {
             $('.text').text('请输入用户名')
        }else{
         socket.emit('login', $('#nickname').val());
         $('.text').text('')
         setTimeout(()=>{
            $('.send_text').focus()
         },0)
        }
      }
    })

   $('#ok').click(()=>{
      // $('#hidden').val($('#nickname').val())
      if ( $('#nickname').val().trim()==='') {
           $('.text').text('请输入用户名')
      }else{
        $('.send_text').focus()
         socket.emit('login', $('#nickname').val());
         $('.text').text('')
      }
   })
  
  });
  // 用户名重复
  socket.on('user repeate',()=>{
    $('.text').text('用户名已经存在了，请换一个吧！')
  })
  // 登录成功
  socket.on('loginSuccess',()=>{
    document.title='welcome ^_^ '+$('#nickname').val()
    $('.dialog').hide()
  })

  // 公告
  socket.on('system',(nickName, userCount, type)=>{
   var msg = '<span class="color">'+nickName+'</span>' + (type == 'login' ? ' 加入' : ' 离开');
   
   var div = document.createElement('div');
   var date = new Date().toTimeString().substr(0, 8);
    
   console.log($('.notice_list').children().length)
    $('.notice_list').css({
      transform:`translateY(${($('.notice_list').children().length)*-35}px)`
    })
   
   div.innerHTML = `<p>系统 ${date}</p> <div>${msg}</div>`;
    $('.notice_list').append(div)

    $('.status').text( ' 当前在线 '+userCount+' 人');
  })


    // 上传图片
  var sendImage=$('#sendImage')[0]
  sendImage.addEventListener('change', function() {
    //检查是否有文件被选中
     if (this.files.length != 0) {
        //获取文件并用FileReader进行读取
         var file = this.files[0],
             reader = new FileReader();
         if (!reader) {
             message('系统', '您的浏览器不支持文件上传功能');
             this.value = '';
             return;
         };
         reader.onload = function(e) {
            //读取成功，显示到页面并发送到服务器
             this.value = '';
             socket.emit('img', e.target.result);
             uploadImg('', e.target.result,true);
         };
         reader.readAsDataURL(file);
     };
  }, false);

  socket.on('sendImg',(user,msg)=>{
     uploadImg(user, msg,false);
  })


  // 发送取消代码框
  $('.send_code_cancel').click(()=>{
     $('.code_diaglog').removeClass('table_show')
  })
  $('.code').click((e)=>{
    $('.code_diaglog').addClass('table_show')
    $('.code_text').focus()
    e.stopPropagation();
    $(document).click(()=>{
      $('.code_diaglog').removeClass('table_show')
    })
  })
  $('.code_text').click(e=>{
    e.stopPropagation();
  })

  // 发送代码
  $('.send_code').click(()=>{
    if ($('.code_text').val().trim()==='') {
         $('.code_text').attr('placeholder','请输入代码')
    }else{
      $('.code_text').attr('placeholder','')
     $('.code_diaglog').removeClass('table_show')
     console.log($('.code_text').val())
     socket.emit('code message',$('.code_text').val())
     message('^_^',md.render(`\`\`\`\n${$('.code_text').val()}\n\`\`\``),true,true);

     $('.code_text').val('')
    }
  })

  socket.on('codeMsg',(user,msg)=>{
    message(user,msg,false,true);
  })

  
});
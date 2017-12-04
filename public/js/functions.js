/*========================================================*
 * @Title:			    function.js
 * @Description:		全局自定义函数
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/
//打开调试信息
var debug = true;	

//输出控制台
function log(msg){
	if(debug==true){
		console.log(msg);
	}
}
//验证手机号
var checkPhone = function(phone){
	var me = /^1[34578]\d{9}$/;
    if (me.test(phone) == false || me.test(phone) == undefined) {
        return false;
    }
    return true;
	}
//验证邮箱
var checkEmail = function(email){
	var me = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/ ;
	if (me.test(email) == false || me.test(email) == undefined) {
        return false;
    }
    return true;
	}
//验证IP
var isIp = function(strIP) {
    if (!strIP) return false;
    var re=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g //匹配IP地址的正则表达式
    if(re.test(strIP))
    {
    if( RegExp.$1 <256 && RegExp.$2<256 && RegExp.$3<256 && RegExp.$4<256) return true;
    }
    return false;
}
//验证正整数
var isInteger = function(str){
	var me = /^\+?[1-9][0-9]*$/;
	if (me.test(str) == false || me.test(str) == undefined) {
        return false;
    }
    return true;
}
//验证mac地址
var isMac = function(val){
	if(val=='' || val==undefined){
		return true;
	}
	var mac_rule = /[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}/;
    if(!mac_rule.test(val))
    {
        return false;
    }else{
    	return true;
    }
}

//获取表单数据
var getFormValue = function(formId,flag){
	var jsonResult = {};
    var t = $(formId).serializeArray();
    if(flag!=undefined){
    	var email = [];
    	var phone = [];
    	var list = [];
    	
    	$.each(t,function(index,data){
    		if(data.name=='email'){
    			email.push(data.value);
    		}
    		if(data.name=='phone'){
    			phone.push(data.value);
    		}
    		
    	});
    	$.each(email,function(index,data){console.log(email[index]);
    		list.push({
    			email:email[index],
    			phone:phone[index]
    		});
    	});
    }
    $.each(t, function() {
      jsonResult[this.name] = this.value;
    });
    if(flag!=undefined){
    	jsonResult.list = list;
    	delete jsonResult.email;
    	delete jsonResult.phone;
    }
    return jsonResult;
}

//返回入口信息
var getOrg = function(org){
	if(org!=undefined){
		if(org.error_code==0){
			return org.org_nodes[0];
		}
		return org.error_code;
	}
	return false;
	
}

//自定义ajax
var _ajax = function(url,type,data,func,error){
	$.ajax({
	    url: url,
	    type:type,
	    dataType: "JSON",
	    data:data,
	    async: true,
	    cache: false,
		contentType:'application/json;',
		xhrFields: {
		withCredentials: true,
		},
		crossDomain: true,
		processData:false,
		contentType: false,
	    success: function(resp) {
	        func(resp);
	    },
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
	        console.log(XMLHttpRequest);
	        console.log(textStatus);
	        console.log(errorThrown);
	        error(XMLHttpRequest);
	    }
    });
}

//消息提示
var messager = function(msg,title,showType){
	if(title=='' || title==undefined){
		title="消息提示";
	}
	if(showType=='' || showType==undefined){
		showType='show';
	}
	$.messager.show({
		title:title,
		msg:msg,
		showType:showType
	});
}

//提示信息
var tooltip = function(msg){
}

//获取file文件名
var getFileName = function(id){
	var file = $(id).val();
	var arr=file.split('\\');
	var filename = arr[arr.length-1];
	return filename;
}

//清空FILE文件的值
var clearFileName = function(id){
	var file = $(id);
	file.after(file.clone().val(""));      
	file.remove(); 
}

//时间戳转换成字符串
var toTimeString = function(timeStamp,format){
	if(timeStamp==undefined){
		return;
	}
	var date = new Date();
	date.setTime(timeStamp*1000);
	
	format = 'yyyy-MM-dd hh:mm:ss';
	var dateJson = {
          "M+": date.getMonth() + 1,
          "d+": date.getDate(),
          "h+": date.getHours(),
          "m+": date.getMinutes(),
          "s+": date.getSeconds(),
          "q+": Math.floor((date.getMonth() + 3) / 3),
          "S+": date.getMilliseconds()
   };
   if (/(y+)/i.test(format)) {
          format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
   }
   for (var k in dateJson) {
          if (new RegExp("(" + k + ")").test(format)) {
                 format = format.replace(RegExp.$1, RegExp.$1.length == 1
                        ? dateJson[k] : ("00" + dateJson[k]).substr(("" + dateJson[k]).length));
          }
   }
   
	return format;
}
/*生成随机字符串*/
 var getRandomString = function(len) {  
    len = len || 32;  
    var _chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
    var maxPos = _chars.length;  
    var pwd = '';  
    for (i = 0; i < len; i++) {  
        pwd += _chars.charAt(Math.floor(Math.random() * maxPos));  
    }  
    return pwd;  
}  

/*生成随机数*/
var getRandomInt = function(n){   
	var rnd="";   
	for(var i=0;i<n;i++)   
	rnd+=Math.floor(Math.random()*10);   
	return rnd;   
} 

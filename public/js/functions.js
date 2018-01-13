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

var checkPhone = function(phone,area){
	switch(area){
		case '86':
            var me = /^1[34578]\d{9}$/;
            if (me.test(phone) == false || me.test(phone) == undefined) {
                return false;
            }
			break;
		case '1':
            var matchStr = /^(((1(\s|))|)\([1-9]{3}\)(\s|-|)[1-9]{3}(\s|-|)[1-9]{4})$/;
            var matchStr2 = /^(((1(\s)|)|)[1-9]{3}(\s|-|)[1-9]{3}(\s|-|)[1-9]{4})$/;
            return (phone.match(matchStr) != null||phone.match(matchStr2)!=null);
			break;
	}
    return true;
	}
//验证邮箱
var checkEmail = function(email){
	var me = /^\w[-\w.+]*@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/ ;
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
	//var mac_rule = /[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}-[A-Fa-f0-9]{2}/;
    	var mac_rule = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;
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
    	var country = [];
    	var list = [];
    	
    	$.each(t,function(index,data){
    		if(data.name=='email'){
    			email.push(data.value);
    		}
    		if(data.name=='phone'){
    			phone.push(data.value);
    		}
    		if(data.name=='country_code'){
    			country.push(data.value);
    		}
    		
    	});
    	$.each(email,function(index,data){
    		list.push({
    			email:email[index],
    			country_code:country[index],
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
    	delete jsonResult.country_code;
    }
    return jsonResult;
}
var getApFormValue = function(formId,flag){
	var jsonResult = {};
    var t = $(formId).serializeArray();
    if(flag!=undefined){
    	var mac = [];
    	var device_name = [];
    	var location = [];
    	var list = [];
    	
    	$.each(t,function(index,data){
    		if(data.name=='mac_address'){
    			mac.push(data.value);
    		}
    		if(data.name=='ap_name'){
    			device_name.push(data.value);
    		}
    		if(data.name=='ap_location'){
    			location.push(data.value);
    		}
    		
    	});
    	$.each(mac,function(index,data){
    		list.push({
    			mac:mac[index],
    			device_name:device_name[index],
    			location:location[index]
    		});
    	});
    }
	
    /*$.each(t, function() {
      jsonResult[this.name] = this.value;
      
    });*/
    
    if(flag!=undefined){
    	jsonResult.list = list;
    	delete jsonResult.mac;
    	delete jsonResult.device_name;
    	delete jsonResult.location;
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
var _ajax = function(url,type,data,func,callBack){
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
	        func(XMLHttpRequest);
	    }
    });
}

//生成uuid
var createId = function(){
	function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

    return "UUID-" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
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
var _confirm = function(title, msg, fn){
	$.extend($.messager.defaults,{
        ok:"确定",
        cancel:"取消"
    });
	$.messager.confirm({
        width: 650,
        height: 290,
        title:title,
		msg:msg,
		fn:fn,
	});
}

//弹窗提示
var _alert = function(msg,title,icon,fn){
	$.extend($.messager.defaults,{
        ok:"确定",
        cancel:"取消"
    });
	if(title=='' || title==undefined){
		title="消息提示";
	}
	
	if(icon=='' || icon==undefined){
		icon='info';
	}
	
	$.messager.alert({
		title:title,
		msg:msg,
		icon:icon,
		fn,fn
	});
}

/*获取JSON元素个数-一维数组*/
var getJsonLen = function(json){
	var len = 0;
	for(var i in json){
		len++;
	}
	return len;
}
/*序列化json*/
var serializeJson = function(json){
	var result = '';
	var len = getJsonLen(json);
	if(len>0){
		var i = 0;
		$.each(json, function(index,data) {
			result +=index;
			result +='=';
			result +=data;
			i++;
			if(i<len){
				result +='&';
			}
		});
	}
	return result;
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

//格式手机样式    phone为+86类名
var verification = function(phone){
	if(phone.val() == "86"){

		phone.next().attr('maxlength','13');
		if(event.keyCode==8){
			return;
		};
		var val = '';
		if(phone.next().val().length==3 || phone.next().val().length==8){
			 val += phone.next().val();
			 val+='-'
			 phone.next().val(val);
		}
	}else if(phone.val() == "1"){
		phone.next().attr('maxlength','12');
		if(event.keyCode==8){
			return;
		}
		var val = '';
		if(phone.next().val().length==3 || phone.next().val().length==7){
			 val += phone.next().val();
			 val+='-'
			 phone.next().val(val);
		}
	}
}
//验证提示错误样式问题   
var errorInput = function(className ,message){
	var iptWidth = $(className).width();
	iptWidth = iptWidth - 20
	console.log(iptWidth);
	$(className).css({
		'background':'url(./user/images/error-message.png) no-repeat',
		'background-size':'12px 12px',
		'border': '1px solid red',
		'background-position': iptWidth +'px center',
		'position':'relative'
	});
	/*$(className).parent('div').css({
		'position':'relative'
	})*/
	console.log($(className).position().left);
	console.log($(className).parent('div').position().top);
	var objLeft = $(className).position().left;
	var objTop = $(className).position().top + $(className).height() +2;
	$(className).parent().find('span').remove();
	$(className).parent('div').append(
		'<span class="error">'+'</span>'
	);
	$(className).parent('div').find('span').css({
		'font-size':'12px',
		'position':'absolute',
		'left':  objLeft +'px',
		'top': objTop + 'px',
		'color':'red'
	});
	$(className).parent('div').find('span').position().top
	$(className).parent('div').find('span').text(message);
}
//验证提示正确样式问题   
var trueInput = function(className){
	$(className).css({
		'border':'1px solid #ededed',
		'background':'none'
	});
	$(className).parent().find('span').remove();
}
/* * 名称:关闭当前多余的窗口
 * @param
 * @return
 * */
var onOpenDelete = function (name) {
    if(name == undefined){
        return false;
    }
    if($(name+':eq(1)')){
        $(name+':eq(1)').window('destroy');
    }
};

//插件提示框
var toast = function(title,text,icon,afterHidden){
	$.toast({
	    text: text,
	    heading: title, 
	    icon: icon, 
	    showHideTransition: 'slide',
	    allowToastClose: true, 
	    hideAfter: 3000, 
	    stack: 5, 
	    position: 'top-center', 
	    textAlign: 'left',  
	    loader: false,  
	    loaderBg: '#9ec600',  
	    beforeShow: function () {}, 
	    afterShown: function () {}, 
	    beforeHide: function () {}, 
	    afterHidden: afterHidden  
	});
}

//转换网络树结构
var getNetworkList = function(data,networkName){
	var type = [
		'VLAN Untagged',
		'VLAN',
		'GRE'
	];
	var root = {}
	var treeArr = [];
	root.id = 0;
	root.text = networkName;
	root.children = [];
	//判断vlan是否为全为一状态
	var vlan = true;
	$.each(data.list,function(index,val){
		if(val.vlan!=1){
			return vlan = false;
		}
	});
	var vlan_untagged = {};
		vlan_untagged.id = type[0];
		vlan_untagged.text = type[0];
		vlan_untagged.children = [];
	var vlan_n = [];
	var vlan_gre = {};
		vlan_gre.id = type[2];
		vlan_gre.text = type[2];
		vlan_gre.children = [];
	//解析数据
	$.each(data.list,function(index,val){
		val.text = val.ssid_name;
		delete val.ssid_name;
		if(val.type==0){
			//vlan全为1的情况
			if(vlan==true){
				root.children.push(val);
			}else{
				if(val.vlan==1){
					vlan_untagged.children.push(val);
				}else{
					vlan_n.push(val);
				}
			}
		}else if(val.type==1){
			vlan_gre.children.push(val);
		}
	});
	if(!$.isEmptyObject(vlan_untagged)){
		if(vlan_untagged.children.length){
			root.children.push(vlan_untagged);
		}
	}
	if(vlan_n.length>0){
		var map = {},
		dest = [];
		for(var i = 0; i < vlan_n.length; i++){
		    var ai = vlan_n[i];
		    if(!map[ai.vlan]){
		        dest.push({
		            id: type[1]+ai.vlan,
		            text: type[1]+ai.vlan,
		            children: [ai]
		        });
		        map[ai.vlan] = ai.vlan;
		    }else{
		        for(var j = 0; j < dest.length; j++){
		            var dj = dest[j];
		            if(dj.id == type[1]+ai.vlan){
		                dest[j].children.push(ai);
		                break;
		            }
		        }
		    }
		}
		$.merge(root.children,dest);
	}
	if(!$.isEmptyObject(vlan_gre)){
		if(vlan_gre.children.length){
			root.children.push(vlan_gre);
		}
	}
	return root;
}

//获取站点信息
var getSite = function(){
	var target = $('#page');
	var site = target.data('org');
	if(site!=undefined){
		if(site.error_code==0){
			var node = site.org_nodes;
			return node[0];
		}
	}
	return site;
}
//遮罩层
var MaskUtil = (function(){   
    //定义遮罩层
    var maskWrap = $('<div class="datagrid-mask mymask"></div>');
    //定义信息
    var maskMsg = $('<div class="datagrid-mask-msg mymask">正在处理，请稍待...</div>');
        
    function init(ele){  
        $(ele).after(maskWrap);
        $(ele).after(maskMsg);
        
        //设置样式
        $('.datagrid-mask').css({
        	'height':$(ele).height()+'px',
        	'top':'40px'
        });
        $('.datagrid-mask-msg').css({
        	'left':'50%'
        });
    }    
        
    return {    
        mask:function(ele){    
            init(ele);    
            maskWrap.show();    
            maskMsg.show();    
        },unmask:function(){    
            maskWrap.hide();    
            maskMsg.hide();    
        }    
    }    
        
}());
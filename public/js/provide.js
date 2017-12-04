/*========================================================*
 * @Title:			    provide.js
 * @Description:		预处理执行模块
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/

define(['jquery','functions'],function($,_f){
	log('加载预处理执行模块');
	
	//绑定按钮特效
	$('.btn').unbind().bind('click',function(){alert();
		if($(this).hasClass('open')){
			$(this).removeClass('open');
		}else{
			$(this).addClass('open');
		}
	});
})


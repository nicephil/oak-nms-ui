/*========================================================*
 * @Title:			    user.js
 * @Description:		用户逻辑模块
 * 						在用户管理App中，org_id用的是parent
 * 						其他的App用的是id。
 * 						原因在于：用户管理属于整个Business的，但是其他资源是必须属于某个Site的。
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/
define(['jquery','functions'],function($,_f){
	
	/*运行主程序*/
	var run = function(){
		alert(1);
		//去掉加载条
		MaskUtil.unmask();
	}
	return {
		'run':function(){
			return run();
		}
	}
});


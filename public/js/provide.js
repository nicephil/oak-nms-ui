/*========================================================*
 * @Title:			    provide.js
 * @Description:		预处理执行模块
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/

define(['jquery','functions','zui'],function($,_f,zui){
	log('加载预处理执行模块');
	var setTooltip = function(id,msg){
		$(id).tooltip({
		    position: 'bottom',
		    content: '<span style="color:#fff">'+msg+'</span>',
		    onShow: function(){
				$(this).tooltip('tip').css({
					backgroundColor: '#000',
					borderColor: '#fff'
				});
		    }
		});
	}
	var tips = [
		{'key':'.start','value':'主菜单'},
		{'key':'.icon-task-config','value':'系统设置'},
		{'key':'.refresh','value':'显示桌面'},
		{'key':'.icon-task-user','value':'用户中心'},
		{'key':'.icon-task-country','value':'切换国家'},
		{'key':'.app-user-tip','value':'用户管理'},
		{'key':'.app-network-tip','value':'网络管理'},
		{'key':'.app-ap-tip','value':'AP管理'}
	];
	var run = function(){
		$.each(tips,function(index,data){
			setTooltip(data.key,data.value);
		});
	}
	return {
		run: run
	};
});


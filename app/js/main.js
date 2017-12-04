/*========================================================*
 * @Title:			    main.js
 * @Description:		主程序入口
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/

//定义引导配置文件文件
require.config({
	baseUrl:'./js',
	paths:{
		'jquery':'../public/js/jquery.min',
		'zui':'../public/js/zui',
		'app':'../app/js/app',
		'global':'../public/config/global',
		'functions':'../public/js/functions',
		'provide':'../public/js/provide'
	}
});

//加载应用模块
require(['jquery','app'],function($,app){
	app.desktop.run();
});

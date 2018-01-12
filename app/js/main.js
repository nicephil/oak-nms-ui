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
	shim: {
        'zui':['jquery'],
        'toast':['jquery']
    },
	paths:{
		'jquery':'../public/js/jquery.min',
		'toast':'../public/plug/toast/jquery.toast',
		'zui':'../public/js/zui',
		'app':'../app/js/app',
		'global':'../public/config/global',
		'functions':'../public/js/functions',
		'provide':'../public/js/provide'
	}
});

//加载应用模块
require(['jquery','toast','app'],function($,toast,app){
	app.desktop.run();
});

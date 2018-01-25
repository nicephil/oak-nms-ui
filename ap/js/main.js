/*========================================================*
 * @Title:			    main.js
 * @Description:		入口文件
 *						应用require模块方式开发，定义全局配置参数c
 * @Author:         	corper
 * @Date:           	2017-5-2
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/

require.config({
	shim: {
        'zui':['jquery']
    },
	paths:{
		'jquery':'../public/js/jquery.min',
		'zui':'../public/js/zui',
		'ap':'../ap/js/ap',
		'echarts':'../public/js/echarts',
		'apr':'../ap/js/apr',
		'raty':'../ap/js/jquery.raty.min'
	},
	map:{
		'*': {
        'css': '../public/js/css'
      }
	}
});

require(['jquery','zui','ap','apr','echarts','raty'],function($,zui,ap,apr,echarts,raty){
	//入口程序
    ap.run();
    apr.run();
});
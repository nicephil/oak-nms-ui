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
		'echarts':'../public/js/echarts',
		'network':'../network/js/network'
	},
	map:{
		'*': {
        'css': '../public/js/css'
      }
	}
});

require(['jquery','zui','echarts','network'],function($,zui,echarts,network){
	//入口程序
    network.run();
});
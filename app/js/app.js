/*========================================================*
 * @Title:			    app.js
 * @Description:		应用程序主体模块
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/

define(['jquery','global','functions','provide','zui'],function($,_g,_f,provide,zui){
	//设置全局变量
	var target = $('#page');
	
	//
	
	//初始化布局
	var initLayout = function(){
		log('初始化布局');
		//桌面核心
		var center = $('<div/>').attr({
	            'border': false,
	            'region': 'center'
	        }).addClass('app-wall').appendTo(target);
	    //桌面绑定右键菜单
	    target.bind('contextmenu',function(e){
	    	e.preventDefault();
	    });
	    
	    //任务栏加载
	    var taskBlank = $('<div class="topbar"/>').attr({
	            'border': false,
	            'region': taskBlankPos
	       }); 
        taskBlank.appendTo(target);
        
        //ui布局
    	target.layout();
	       
	}
	//初始化任务栏
	var initTaskBlank = function(){
		log('初始化任务栏');
		
		//获取任务栏Layout面板容器
		var taskBlank = target.layout('panel', taskBlankPos);
		
		//任务条
		var taskBar = $('<div class="container-fluid"/>');
		
		//开始菜单按钮
		var start = $('<div class="start"><i class="icon-menu"></i></div>'); 
		
		//创建任务区域
		var taskList = $('<div class="task-content"/>'); 
	    
	    //创建右测工具条
	    var rightMenu = $('<div class="task-end right"/>'); 
	    
	    //加载右侧工具栏-自定义
	    var customMenu = $('<div class="shortcut"><span class="icon-task-config"></span><span class="icon-task-number">99</span></div>');
		
		//加载右侧工具栏-用户
		var userMenu = $('<div class="shortcut"><span class="icon-task-user"></span><span class="icon-task-downarrow"></span></div>');
		
		//加载右侧工具栏-中英文
		var langMenu = $('<div class="shortcut"><span class="icon-task-country"></span><span class="icon-task-downarrow"></span></div>');
		
		
		//载入任务条-开始菜单
		start.appendTo(taskBar);
		
		//载入任务条-自定义菜单
		customMenu.appendTo(rightMenu);
		
		//载入任务条-用户菜单
		userMenu.appendTo(rightMenu);
		
		//载入任务条-中英文菜单
		langMenu.appendTo(rightMenu);
		
		//载入任务条
		rightMenu.appendTo(taskBar);
		
		//载入工具面板
		taskBar.appendTo(taskBlank);
	
	}
	//初始化桌面
	var initDesktop = function(){
		log('初始化桌面');

        if (loadUrl.app && !loaded) {
            $.ajax({
                url: loadUrl.app,
                dataType: "JSON",
                async: true,
                cache: false,
                success: function(resp) {
                    initApp(resp);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    $.messager.alert("", textStatus || errorThrown, "error");
                }
            });
        }
		
		//切换用户模块事件
		$('.task-end .shortcut:nth-child(2)').click(function(e){
			if( $('.user-menu').hasClass('none') ){
				$('.user-menu').removeClass('none');
			}else{
				$('.user-menu').addClass('none');
			}
			
			$(document).unbind().bind("click",function(e){
				if( !$('.user-menu').hasClass('none') ){
					$('.user-menu').addClass('none');
				}
			});
			e.stopPropagation();
		});
		
		//账号名称
		$('.user-menu li:nth-child(1)').click(function(){
			$.messager.alert('信息提示','此功能暂不开放');
		});
		//软件版本
		$('.user-menu li:nth-child(2)').click(function(){
			$.messager.alert('信息提示','此功能暂不开放');
		});
		//返回云端
		$('.user-menu li:nth-child(3)').click(function(){
			$.messager.alert('信息提示','此功能暂不开放');
		});
		//退出账号
		$('.user-menu li:nth-child(4)').click(function(){
			$('.user-menu').addClass('none');
		});
		
		//加载开始菜单遮罩
		$('.start .icon-menu').click(function(e){
			if( $('.wall-mask').hasClass('none') ){
				$('.wall-mask').removeClass('none');
			}else{
				$('.wall-mask').addClass('none');
			}
			
			$(document).unbind().bind("click",function(e){
				if( !$('.wall-mask').hasClass('none') ){
					$('.wall-mask').addClass('none');
				}
			});
			e.stopPropagation();
			
		});
	}
	//初始化app
	var initApp = function(apps){
		log('初始化app');
		
		//桌面对象
        var wall = target.layout('panel', 'center'); 
        
        //app容器
        var appContainer = $('<ul/>').addClass('app-container'); 
        
        //可显示行数
        var lines = Math.floor((wall.height() - 20) / (iconSize + 45)); 
        
        //可显示列数
        var columns = Math.floor((wall.width() - 20) / (iconSize + 45)); 
        
        //每页显示app最大值
        var wallMax = lines * columns; 
        
        //行间隔高度
        var lineAppBlank = ((wall.height() - 20) - (iconSize + 45) * lines) / lines; 
        
        //列间隔宽度
        var columnAppBlank = ((wall.width() - 20) - (iconSize + 45) * columns) / columns; 
        
        //初始值
        var line = 1,
        col = 1,
        top = 20,
        left = 10;

        var relSize = iconSize + 45;
        for (var i in apps) {
            if (line > lines) {
                line = 1;
                top = 20;
                left += relSize + columnAppBlank;
                col++;
            }

            var app = apps[i];
            var appItem = $('<li/>').css({
                height: relSize,
                width: relSize
            });
            
            //绑定每个app的详细信息到app元素上
            appItem.data('app', app); 
            
            //指定app的唯一标识
            appItem.attr("app_id", UUID()); 

            appItem.css({
                left: left,
                top: top
            });
			
			//设置应用图片宽高
            var icon = $('<img/>').height(iconSize+1).width(iconSize).attr('src', app.icon).appendTo(appItem);
            
            //设置应用标题
            var text = $('<span/>').text(app.title).appendTo(appItem);
           
            //追加到应用容器
            appItem.appendTo(appContainer);
			
			//下一行的top值
            top += relSize + lineAppBlank; 
            line++;
			
			//兼容ie的hover
            if ($.support.msie) { 
                appItem.hover(function() {
                    $(this).addClass('hover');
                },
                function() {
                    $(this).removeClass('hover');
                });
            }

			//绑定App的点击事件（dbClick是否双击）
            if (dbClick) { 
                appItem.on('dblclick',
                function() {
                	//对应li调用打开应用窗口
                	var headIcon = $(this).data('app').headIcon;
                	var	height = $(this).data('app').height;
                	var	width = $(this).data('app').width;
                	var options = {
                		iconCls:$(this).data('app').headIcon
                	}
                	if(height!=undefined && width!=undefined){
                		$.extend(true, options,
                			{
                				width:width,
                				height:height
                			}
                		);
                	}
                    openApp.call(this,options);
                });
            } else {
                appItem.on('click',
                function(e) {
                	//对应li调用打开应用窗口
                	var headIcon = $(this).data('app').headIcon;
                	var	height = $(this).data('app').height;
                	var	width = $(this).data('app').width;
                	var options = {
                		iconCls:$(this).data('app').headIcon
                	}
                	if(height!=undefined && width!=undefined){
                		$.extend(true, options,
                			{
                				width:width,
                				height:height
                			}
                		);
                	}
                    openApp.call(this,options);
                });
            }
        }

        var appItems = appContainer.children('li');
        appItems.mousedown(function() {
            appItems.removeClass("select");
            $(this).addClass("select");
        }).bind('contextmenu',
        function(e) {
            e.preventDefault();
        });
        
        //加载应用到桌面
 		appContainer.appendTo(wall);
 		
        //初始化app的拖拽事件
        initAppDrag(appItems);
	}
	
	//初始化app的拖拽
	var initAppDrag = function(appItem) {
        appItem.draggable({
            revert: true,
            cursor: "pointer",
            onStopDrag:function(e){
            }
        }).droppable({
            onDrop: function(e, source) {
                if ($(source).prev().attr('app_id') == $(this).attr('app_id')) {
                    $(source).insertBefore(this);
                } else {
                    $(source).insertAfter(this);
                }
                setTimeout(function() {
                    //appReset(target);
                },
                0);
                
            },
            accept: '.app-container li'
        });
    };
    
	//初始化开始菜单
	var initStartMenu = function(){
		log('初始化开始菜单');
	}
	//打开app
	var openApp = function(options){
		log('打开app');
		if(target.data('org')==undefined){
			$.messager.alert('消息提示','未获取site访问权限!','error');
			return false;
		}
		
		//获取桌面对象
		var wall = target.layout('panel','center');
		//获取应用ID
		var uuid = $(this).attr('app_id');
		//获取应用信息
		var appOpt = $(this).data('app');
        //当前打开窗口唯一
		var thisAppWindow = $('div[w_id="' + uuid + '"]');
		
        if (thisAppWindow.length) {
            thisAppWindow.window('open');
            thisAppWindow.window('refresh');
            return ;

        }
		
		//创建app窗口
		var appWindow = $('<div/>').attr('w_id',uuid).appendTo(wall);
		
		//定义默认事件
		var defaultRequiredConfig = {
			onClose:function(){
				//$(this).window("destroy");
			}
		}
		
		//合并窗口参数
		$.extend(true, optionsConfig, appOpt,options,defaultRequiredConfig);
		
		//打开窗口
		appWindow.window(optionsConfig);
	}
	//创建窗口
	var createWindow = function(){
		log('创建窗口');
	}
	//生成uuid
	var UUID = function(){
		function S4() {
	            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	        }

	    return "UUID-" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	}
	//设置桌面对象
	var desktop = {
		init:function(){
			//仅初始化一次
			if (loaded) return;
			
			//实例化进度条
	        var progress = $.messager.progress({ 
	            title: lang.progress.title,
	            msg: lang.progress.msg,
	            interval: null
	        });
	        
			//获取进度条实例
	        var progressBar = $.messager.progress('bar'); 
	        $.ajaxSetup({
	            async: false	 //设置同步处理
	        });
	        
	        //执行模块列表
	        var initMethods = [initLayout, initTaskBlank, initStartMenu, initDesktop];
	        for (var i in initMethods) {
	            var step = initMethods[i];
	            progressBar.progressbar({
	                text: lang[step.name]
	            }).progressbar('setValue', ((parseInt(i) + 1) / initMethods.length) * 100);
	            step.call(this, target);
	        }
	        
	        //关闭进度条
	        $.messager.progress('close');
	        $.ajaxSetup({
	            async: true			//设置异步处理
	        });
	        
	        //设置桌面元素已经加载完毕
	        loaded = true;
			
			//禁用全局事件
	        setTimeout(function() {
	            $('body').attr({ 
	                oncontextmenu: 'return false',
	                onselectstart: 'return false',
	                ondragstart: 'return false',
	                onbeforecopy: 'return false'
	            });
	        },
	        500);
	        
	        //初始化接口信息
	        var url = _IFA['permittedorganization'];
           _ajax(url,'get','',function(resp){
           		target.data('org',resp);console.log(resp);
           },function(error){
           	    if(error.readyState<4){
           	    	$.messager.alert('消息提示','获取bussiness信息失败,请登录云端系统！','error');
           	    	window.open(" http://clouddev.oakridge.vip/nms/authority");
           	    	return false;
           	    };
           });
		},
		//主函数
		run:function(){
			log('加载桌面主函数');
			this.init();
		}
	}
	return {
		'desktop':desktop
	};
});
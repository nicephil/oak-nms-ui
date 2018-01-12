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
	
	var taskHeight = 0;
	
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
        $('<div class="taskbar-shadow" />').appendTo(target);
        
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
		var start = $('<div class="refresh"></div><div class="start"></div><div class="start-line"></div>'); 
		
		//创建任务区域
		var taskList = $('<div class="task-content"/>'); 
	    
	    //创建右测工具条
	    var rightMenu = $('<div class="task-end right"/>'); 
	    
	    //加载右侧工具栏-自定义
	    var customMenu = $('<div class="task-end-sep"></div><div class="shortcut"><span class="icon-task-config"></span><span class="icon-task-number">99</span></div>');
		
		//加载右侧工具栏-用户
		var userMenu = $('<div class="shortcut btn-task-user"><span class="icon-task-user"></span><span class="icon-task-downarrow"></span></div>');
		
		//加载右侧工具栏-中英文
		var langMenu = $('<div class="shortcut"><span class="icon-task-country"></span><span class="icon-task-downarrow"></span></div>');
		
		
		//载入任务条-开始菜单
		start.appendTo(taskBar);
		
		//内容区域追加到任务栏，返回追加对象
		var listWrap = taskList.appendTo(taskBar);
		
		//追加应用列表
		var list = $('<ul/>').addClass('app-list-list').appendTo(listWrap);
		
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
	//添加任务栏站位
	var appendToList = function(uuid,text){
		//获取任务栏容器
		var taskList = $('.task-content');
		
		var list = taskList.find('ul.app-list-list');
		
		//追加应用到容器
		var img = '<img src="'+text+'" />';
		
		var item = $('<li/>').attr("l_id", uuid).addClass('selected').html(img).attr('status', 'opened');
		
		if ($('li[l_id="' + uuid + '"]', list).length) {
			$('li[l_id="' + uuid + '"]', list).addClass('selected');
		}else{
			list.append(item);
			item.unbind().bind('click',function() {
				$('div[w_id="' + uuid + '"]').window('open');
			});
		}
		//对容器做事件处理
		//当窗口关闭时，任务栏应用图标也跟着移出
		//当窗口放大时，只占用应用容器而不占用整个桌面
		//当窗口缩小时，改变任务栏的选中状态
		//当前打开的应用关联任务栏的状态
	}
	//删除任务栏站位
	var removeListItem = function(uuid){
		var item = $('li[l_id="' + uuid + '"]');
        var wrap = item.parent().parent();
        item.remove();
	}
	//加载APP
	var loadApp = function(app,uuid){
		var rows = $('.app-rows');
		var element = '<div class="row-element">';
		element += '<img src="'+app.icon+'" />';
    	element += '<div class="app-row-text">'+app.title+'</div>';		
    	element += '</div>';
    	$(element).appendTo(rows).find('img').click(function(){
    		$('li[app_id="' + uuid + '"]').click();
    	});
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
                	$(target).data('apps',resp);
                    initApp(resp);
                    provide.run();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    _alert("", textStatus || errorThrown, "error");
                }
            });
        }
		
		//切换用户模块事件
		$('.btn-task-user .icon-task-user ,.btn-task-user .icon-task-downarrow').click(function(e){
			if( $('.user-menu').hasClass('none') ){
				$('.user-menu').removeClass('none');
			}else{
				$('.user-menu').addClass('none');
			}
			e.stopPropagation();
		});
		
		//账号名称
		$('.user-menu li:nth-child(1)').click(function(){
			_alert('此功能暂不开放');
		});
		//软件版本
		$('.user-menu li:nth-child(2)').click(function(){
			_alert('此功能暂不开放');
		});
		//返回云端
		$('.user-menu li:nth-child(3)').click(function(){
			_alert('此功能暂不开放');
		});
		//退出账号
		$('.user-menu li:nth-child(4)').click(function(){
			$('.user-menu').addClass('none');
		});
		
		//加载开始菜单遮罩
		$('.start').click(function(e){
			if($('.wall-mask').hasClass('none') ){
				$('.wall-mask').removeClass('none');
				$('.row-element').animate({padding:'10px 30px 30px -30px'},'fast','linear');
				e.stopPropagation();
			}else{
				$('.row-element').animate({padding:'0px'},'fast','swing');
				$('.wall-mask').addClass('none');
				e.stopPropagation();
			}
			
		});
		
		//全局处理 other even
		$(document).unbind().bind("click",function(e){
			if( !$('.wall-mask').hasClass('none') ){
				$('.row-element').animate({padding:'0px'},'fast','swing');
				$('.wall-mask').addClass('none');
				e.stopPropagation();
			}
			if($('.start').hasClass('start-pressed')){
				$('.start').removeClass('start-hover');
				$('.start').removeClass('start-pressed');
				e.stopPropagation();
			}
			if( !$('.user-menu').hasClass('none') ){
				$('.user-menu').addClass('none');
				e.stopPropagation();
			}
			
			$('.dropdown-menu').addClass('none');
			$('.btn').removeClass('open');
		});
		
		//开始菜单效果
		$('.start').mouseenter(function(e){
			$(this).addClass('start-hover');
			e.stopPropagation();
		}).mouseleave(function(e){
			$(this).removeClass('start-hover');
			e.stopPropagation();
		}).mousedown(function(e){
			if($(this).hasClass('start-pressed')){
				$(this).removeClass('start-hover');
				$(this).removeClass('start-pressed');
			}else{
				$(this).addClass('start-hover');
				$(this).addClass('start-pressed');
			}
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
            var uuid = UUID();
            appItem.attr("app_id", uuid); 
            loadApp(app,uuid);
            appItem.css({
                left: left,
                top: top
            });
			
			var wrap = $('<span class="'+app.class+'"/>');
			
			//设置应用图片宽高
            var icon = $('<img/>').height(iconSize+1).width(iconSize).attr('src', app.icon);
            wrap.appendTo(appItem).append(icon);
            
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
            onBeforeDrag:function(e){
            	return false;
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
                },0);
            },
            accept: '.app-container li'
        });
    };
    
	//初始化开始菜单
	var initStartMenu = function(){
		log('初始化开始菜单');
	}
	//切换窗口效果
	var switchWindow = function(uuid){
		//打开新窗口把所有的窗口灰掉
		$("div[w_id^='UUID']").prev('.window-header').css({
			'background':'linear-gradient(#e6ebf0,#ffffff)',
			'opacity': '0.6',
			'border-top':'3px solid #8C96A0'
		});
		$("div[w_id^='UUID']").prev('.window-header').find('.panel-title').css({
			'color':'#8C96A0',
			'font-weight':'bold'
		});
		
		//当前窗口
		$("div[w_id="+uuid+"]").prev('.window-header').css({
			'background':'linear-gradient(#d8ecfb,#ffffff)',
			'border-top':'3px solid #0086E5',
			'opacity': '1'
		});
		$("div[w_id="+uuid+"]").prev('.window-header').find('.panel-title').css({
			'color':'#0086E5',
			'font-weight':'bold'
		});
	}
	//绑定窗口点击事件
	var bindClickWindowTitle = function(uuid){
		$("div[w_id="+uuid+"]").panel('header').click(function(){
			//打开新窗口把所有的窗口灰掉
			$("div[w_id^='UUID']").prev('.window-header').css({
				'background':'linear-gradient(#e6ebf0,#ffffff)',
				'opacity': '0.6',
				'border-top':'3px solid #8C96A0'
			});
			$("div[w_id^='UUID']").prev('.window-header').find('.panel-title').css({
				'color':'#8C96A0',
				'font-weight':'bold'
			});
			
			//当前窗口
			$("div[w_id="+uuid+"]").prev('.window-header').css({
				'background':'linear-gradient(#d8ecfb,#ffffff)',
				'border-top':'3px solid #0086E5',
				'opacity': '1'
			});
			$("div[w_id="+uuid+"]").prev('.window-header').find('.panel-title').css({
				'color':'#0086E5',
				'font-weight':'bold'
			});
		});
	}
	//打开app
	var openApp = function(options){
		log('打开app');
		if(target.data('org')==undefined){
			_alert('未获取site访问权限!');
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
           //thisAppWindow.window('close');

        }
		
		//创建app窗口
		var appWindow = $('<div/>').attr('w_id',uuid).appendTo(wall);
		
		//定义默认事件
		var defaultRequiredConfig = {
			loadingMessage:'',
			inline: true,
	        	cache: false,
				onClose:function(){
				removeListItem($(this).attr('w_id'));
			},
			onBeforeOpen:function(){
				MaskUtil.mask($(this).panel('body'));
			},
			onOpen:function(){
				var opts = $.data(this, 'panel').options;
				
				//追加任务栏图标
				appendToList($(this).attr('w_id'), appOpt.taskIcon);
				
				//切换窗口效果
				switchWindow(uuid);
				
				//绑定当前title切换
				bindClickWindowTitle(uuid);
				
			},
			onMinimize: function() {
                if ($(this).prev('.window-header').find('.panel-tool-restore').length == 1) {
                    var opts = $.data(this, 'panel').options;
                    opts.maximized = true;
                }
                //添加任务栏关闭状态
                $('li[l_id="' + $(this).attr('w_id') + '"]').attr('status', 'closed');
                
                //当发生缩小事件时，清除任务栏状态
                $('li[l_id="' + $(this).attr('w_id') + '"]').removeClass('selected');
                
            },
            onMove:function(left,top){
            	var opts = $.data(this, 'panel').options;
            	if(top < taskHeight) {
                    $(this).window("move", {
                        "left": left,
                        "top": 1
                    });
                }else if(opts.maximized) {
                    $(this).window("restore");
                }
                
                //切换窗口效果
				switchWindow(uuid);
				
				//绑定当前title切换
				bindClickWindowTitle(uuid);
            },
            onMaximize:function(){
            	target.layout('panel', 'center').parent('.layout-panel').css('top','40px');
            },
            onResize:function(width,height){
            	if(width<850){
        			$(this).window('resize',{
        				width:850,
        				height:height
        			});
            	}
            	if(height<500){
            		$(this).window('resize',{
            				width:width,
            				height:500
            		});
            	}
            },onClose:function(){
            	$(this).window("destroy");
            	$('li[l_id="' + $(this).attr('w_id') + '"]').remove();
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
	        
	        //加载显示桌面事件
	        var refreshDesktop = $('.refresh').click(function(){
	        	$('div[w_id^="UUID"]').window('minimize');
	        });
	        
	        //初始化接口信息
	        var url = _IFA['permittedorganization'];
           _ajax(url,'get','',function(resp){
           	    if(resp.readyState!=undefined && resp.readyState<4){
           	    	_alert('获取bussiness信息失败,请登录云端系统！','error');
           	    	window.open(" http://clouddev.oakridge.vip/nms/authority");
           	    	return false;
           	    }else{
	           		target.data('org',resp);
           	    }
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
/*========================================================*
 * @Title:			    network.js
 * @Description:		用户逻辑模块
 * 						在用户管理App中，org_id用的是parent
 * 						其他的App用的是id。
 * 						原因在于：用户管理属于整个Business的，但是其他资源是必须属于某个Site的。
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/
define(['echarts','functions','multiple'],function(echarts,_f,_multiple){
	/*******全局变量*******/
	//弹窗容器
	var container = $('body');
	
	
	//无线树的DOM节点
	var tree = "#app-network-layout .group-list";
	
	//AP树DOM节点
	var apTree = '.win-select-ssid-network .aptree';
	
	//用户树DOM节点
	var userTree = '.win-select-user-network .usertree';
	//-----------
	// SSID : 记录对象
	// @baseInfo : 基本信息记录
	// @apInfo : 无线接入点记录
	// @accessInfo : 访问控制记录
	// @optionsInfo : 更多选项记录
	// @portalInfo : Portal信息记录
	// @userInfo : 选择用户记录
	// ------------
	var SSID = {};
	
	//验证结果
	var verifyResult = {};
	
	//节点集合
	var nodes = '';
	
	//左侧面板对象
	var leftPanel = '';
	
	var myChartFlow = '';
	
	var myChartClient = '';

	//aihui
	var table = ".win-times .table-times";
	var pagination = '.win-times #pagination_times';
	var defPageNumber = 1;
	var defPageSize = 10;
	var defPageList = [10,20,50];
	
	//author : ChiLei
	var network_timing_selected_id;
	var timer_access_selected_rowData;//选中一行的数据

	
    /*初始化*/
	var init = function(){
		//初始化流量对象
		myChartFlow = echarts.init(document.getElementById('network-traffic-echarts'));
		
		//初始化客户端对象
		myChartClient = echarts.init(document.getElementById('network-client-echarts'));

		//初始化radio
		initRadio();
		
		//初始化tabs面板
        selectTabs();
	
	}
	
	/*取消事件*/
	var closeWindow = function(win){
		$(win).window('close');
	}
	
	/*初始化radio*/
	var initRadio = function(){
		
		//初始化未选中
		$('.radio-wrap input').parent('span').removeClass('radio-checked');
		$('.radio-wrap input').parent('span').addClass('normal-radio');
		
		//更新已选中
		$('.radio-wrap input:radio:checked').parent('span').addClass('radio-checked');
		$('.radio-wrap input:radio:checked').parent('span').removeClass('normal-radio');
		
		//绑定radio事件
		$('.radio-wrap input:radio').click(function(){
			$('.radio-wrap input:radio').parent('span').addClass('normal-radio');
			$('.radio-wrap input:radio:checked').parent('span').addClass('radio-checked');
			$('.radio-wrap input:radio:checked').parent('span').removeClass('normal-radio');
		});
		
	}
	
	/*初始化checkbox*/
	var initCheckBox = function(){
		
		//初始化未选中
		$('.checkbox-wrap input').parent('span').removeClass('checkbox-checked');
		$('.checkbox-wrap input').parent('span').addClass('normal-checkbox');
		
		//更新已选中
		$('.checkbox-wrap input:checkbox:checked').parent('span').addClass('checkbox-checked');
		$('.checkbox-wrap input:checkbox:checked').parent('span').removeClass('normal-checkbox');
		
		//绑定checkbox事件
		$('.checkbox-wrap input:checkbox').click(function(){
			if($(this).is(':checked')){
				$(this).parent('span').removeClass('normal-checkbox');
				$(this).parent('span').addClass('checkbox-checked');
			}else{
				$(this).parent('span').removeClass('checkbox-checked');
				$(this).parent('span').addClass('normal-checkbox');
			}
		});
	}
	
	/*关闭摘要保存状态*/
	var setCloseAbsBase = function(){
		$('.edit-base').removeClass('btn-save-icon');
		$('.edit-base').addClass('btn-edit-icon');
		$('.abs-row .info-label').removeClass('none');
		$('.abs-row .info-input').addClass('none');
	}
	
	/*编辑摘要基本信息*/
	var switchAbstractBase = function(){
		
		//绑定编辑切换效果
		$('.edit-base').click(function(){
			if($('.edit-base').hasClass('btn-edit-icon')){
				$('.edit-base').removeClass('btn-edit-icon');
				$('.edit-base').addClass('btn-save-icon');
				$('.abs-row .info-label').addClass('none');
				$('.abs-row .info-input').removeClass('none');
				
				//屏蔽密码
				var node = getCache('.network-wireless-clients','node');
				//当有key值时auth=5 cipher=5
				if(node.auth==5 && node.cipher ==5){
					$('.abs-password .info-label').addClass('none');
					$('.abs-password .info-input').removeClass('none');
				}else{
					//当无KEY值时
					$('.abs-password .info-label').removeClass('none');
					$('.abs-password .info-input').val('');
					$('.abs-password .info-input').addClass('none');
				}
			}else{
				$('.edit-base').removeClass('btn-save-icon');
				$('.edit-base').addClass('btn-edit-icon');
				$('.abs-row .info-label').removeClass('none');
				$('.abs-row .info-input').addClass('none');
				
				//保存基本信息数据
				bindAbstractBaseSave();
			}
		});
		
	}
	
	/*
	 * 获取流量统计数据--当树onselect时加载此函数
	 * */
	var getFlow = function(node,func,options){
		if(node!=null){
			var url = _IFA['network_flow_ssids']+node.id+'/flow';
			if(options==undefined){
				options = 'begin_time='+getTimeStamp(-1);
			}
			if(options.length>0){
				url = url+'?'+options;
			}
			var type = 'GET';
			var data = '';
			_ajax(url,type,data,function(newdata){
				func(newdata);
			});
		}
	}
	
	/*
	 * 获取流量统计数据--当树onselect时加载此函数
	 * */
	var getClients = function(node,func,options){
		if(node!=null){
			var url = _IFA['network_client_ssids']+node.id+'/client';
			if(options==undefined){
				options = 'begin_time='+getTimeStamp(-1);
			}
			
			if(options.length>0){
				url = url+'?'+options;
			}
			var type = 'GET';
			var data = '';
			_ajax(url,type,data,function(newdata){
				func(newdata);
			});
		}
	}
	
	/*
	 * 加载选中节点图标
	 * */
	var loadEcharts = function(){
		var node = $(tree).tree('getSelected');
		//加载流量图表
		getFlow(node,function(data){
			chartFlow(data);
		});
		//debugger;
		//加载终端图表
		getClients(node,function(data){
			chartClients(data);
		});
	}
	
	/*选择tab页面*/
    var selectTabs = function(){
        
		$('#network-tabs').tabs({
            onSelect:function(title,index){
            	switch(index){
					case 0:
						loadEcharts();
						break;
					case 1:console.log(1);
					    var tab = $(this).tabs('getTab',1);
					    $(tab).panel({
					    	href:'network/abstract.html',
					    	loadingMessage:'',
					    	onLoad:function(){console.log(2);
					    		//加载基本信息
					    		var node = $(tree).tree('getSelected');
					    		setAbstractInfo(node);
					    		
					    		//切换基本信息
					    		switchAbstractBase();
					    		
					    		//绑定摘要事件组
					    		bindAbstractEven();
					    	}
					    });
						break;
					case 2:
						var tab = $(this).tabs('getTab', 2);
						$(tab).panel({
							href: 'network/times.html',
							loadingMessage:'',
							onLoad: function() {
								//加载基本信息
								var node = $(tree).tree('getSelected');
								//新增定时访问
								bindTimesEven();
								
								//获取定时访问 列表
								//getTimerAccess();
								//获取定时器
								loadTimesList();
								
								//定时访问禁用
								//btnEnableTimerAccess();
								
								//加载表格数据
								loadTable(node.id);
							},
							onOpen: function() {

							}
						});
						break;				
            	}
			}
		});
		
	}
    
    /*
     * 测试-时间戳转换字符串
     * */
   var timeToString = function(timeStamp){
   		var newDate = new Date();
   		newDate.setTime(timeStamp);
   		var year = newDate.getFullYear();
   		var month = newDate.getMonth()+1;
   		var day = newDate.getDate();
   		var hour = newDate.getHours();
   		var minute = newDate.getMinutes();
   		var second = newDate.getSeconds();
   		//return year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;
   		return hour;
   		
   }
   
   /*
    * 获取固定时间坐标
    * */
   var getTimeLabel = function(index){
   		var axisArr = new Array();
			axisArr[0] = 'Noon';
			axisArr[1] = '1PM';
			axisArr[2] = '2PM';
			axisArr[3] = '3PM';
			axisArr[4] = '4PM';
			axisArr[5] = '5PM';
			axisArr[6] = '6PM';
			axisArr[7] = '7PM';
			axisArr[8] = '8PM';
			axisArr[9] = '9PM';
			axisArr[10] = '10PM';
			axisArr[11] = '11PM';
			axisArr[12] = 'Night';
			axisArr[13] = '1AM';
			axisArr[14] = '2AM';
			axisArr[15] = '3AM';
			axisArr[16] = '4AM';
			axisArr[17] = '5AM';
			axisArr[18] = '6AM';
			axisArr[19] = '7AM';
			axisArr[20] = '8AM';
			axisArr[21] = '9AM';
			axisArr[22] = '10AM';
			axisArr[23] = '11AM';
			axisArr[24] = 'Noon';
		return axisArr[index];
   }
	
	//定义总览流量图表
	var chartFlow = function(data){
        var colors = ['#8ec6ad', '#d14a61', '#675bba'];
        var tx = [];
        var rx = [];
        var total = [];
        var dataX = [];
        var result = [];
        var tableWidth = $('.network-charts').width()-78;
        for(var i=0; i<25;i++) {
        	if(i>data.list.length-1){
        		tx=0;
        		rx=0;
        		total=0;
        		timestamp=0;
        	}else{
        		var node = data.list[i];
        		tx=getMB(node.tx_bytes);
        		rx=getMB(node.rx_bytes);
        		total=getMB(node.total_bytes);
        		timestamp=node.timestamp;
        	}
        	dataX.push({
        		'tx':tx,
        		'rx':rx,
        		'total':total,
        		'timestamp':timestamp
        	});
        };
        dataX  = getXdate(dataX,25);
        optionOne = {
            title: {
            	text:'流量',
                left: 25
            },
            color: colors,
            tooltip: {
                trigger: 'axis',
                showTitle:true,
                formatter: function (params, ticket, callback) { 
                	var total_name = params[0].seriesName;
                	var tx_name = params[1].seriesName;
                	var rx_name = params[2].seriesName;
                	
					var total = params[0].value;
					if(total>1024){
						total = getGB(total);
					}else{
						total += 'M';
					}
					var tx = params[1].value;
					if(tx>1024){
						tx = getGB(tx);
					}else{
						tx += 'M';
					}
					var rx = params[2].value;
					if(rx>1024){
						rx = getGB(rx);
					}else{
						rx += 'M';
					}

					var _axisValue = getTimeLabel([params[0].dataIndex])+'<br/>';
					var _total = params[0].marker+total_name+': '+total+'<br/>';
					var _tx = params[1].marker+tx_name+': '+tx+'<br/>';
					var _rx = params[2].marker+rx_name+': '+rx;
					
					//debugger;//调试
					return _axisValue+_total+_tx+_rx;
                }
            },
            legend: {
                data:['Total', 'Tx', 'Rx'],
                right: 12,
            },
            grid: {
                top: 40,
                bottom: 40,
                width:tableWidth,
                left:50
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap : false,
                    axisTick:{
                        alignWithLabel: false,
                    },
                    data: dataX.mark
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    nameGap: 10,
                    axisLabel: {
                        formatter: function(value,index){
                        	return value+'M';
                        }
                    },
                }
            ],
            series: [
                {
                    name:'Total',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 1,
                                color: '#8ec6ad'
                            }])
                        }
                    },
                    connectNulls: true,
                    data: dataX.total
                },
                {
                    name:'Tx',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: dataX.tx
                },
                {
                    name:'Rx',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: dataX.rx
                }
            ]
        };

        myChartFlow.setOption(optionOne, true);
        myChartFlow.resize();
        //定时刷新
        var setMinute = $('.network-auto-refresh').val()*60*1000;
        setInterval(function () {
            myChartFlow.setOption(optionOne, true);
            myChartFlow.resize();
        },setMinute);
        //debugger;
    }
	
	/*
	 * 定义总览终端图表
	 * */
	var chartClients = function(data){
		var colors = ['#8ec6ad', '#d14a61', '#675bba'];
		var client_g24 = 0;
        var client_g5 = 0;
        var client_total = 0;
        var timestamp = 0;
        var dataX = [];
        var maxTotal = [];
        var tableWidth = $('.network-charts').width()-78;

        for(var i=0; i<25;i++) {
        	if(i>data.list.length-1){
        		client_g24=0;
        		client_g5=0;
        		client_total=0;
        		timestamp=0;
        	}else{
        		var node = data.list[i];
        		client_g24=node.client_24g_count;
        		client_g5=node.client_5g_count;
        		client_total=node.client_count;
        		timestamp=node.timestamp;
        	}
        	dataX.push({
        		'client_g24':client_g24,
        		'client_g5':client_g5,
        		'client_total':client_total,
        		'timestamp':timestamp
        	});
        	maxTotal.push(client_total);
        };
        //获取总数的最大数
        var max = getMax(maxTotal);
        
        //格式化数据
        dataX  = getXdate(dataX,25,'client');
        
        //debugger;
        optionTwo = {
            title: {
            	text:'终端',
                left: 25
            },
            color: colors,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function (params, ticket, callback) { 
                	var total_name = params[0].seriesName;
                	var tx_name = params[1].seriesName;
                	var rx_name = params[2].seriesName;
                	
					var total = params[0].value;
						total += '个';
						
					var tx = params[1].value;
						tx += '个';
						
					var rx = params[2].value;
						rx += '个';

					var _axisValue = getTimeLabel([params[0].dataIndex])+'<br/>';
					var _total = params[0].marker+total_name+': '+total+'<br/>';
					var _tx = params[1].marker+tx_name+': '+tx+'<br/>';
					var _rx = params[2].marker+rx_name+': '+rx;
					
					//debugger;//调试
					return _axisValue+_total+_tx+_rx;
                }
            },
           grid: {
                top: 40,
                bottom: 40,
                width:tableWidth,
                left:50
            },
            legend: {
                data:['Total', '2.4G', '5G'],
                right: 12
            },
            xAxis: [
                {
                    type: 'category',
                    data: dataX.mark,
                    axisPointer: {
                        type: 'shadow'
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    min: 0,
                    interval: 1,
                    max:max+5,
                    nameGap: 10,
                    axisLabel: {
                        formatter: '{value} 个'
                    }
                }
            ],
            series: [
                {
                    name:'Total',
                    type:'line',
                    data:dataX.client_total
                },
                {
                    name:'2.4G',
                    type:'bar',
                    data:dataX.client_g24
                },
                {
                    name:'5G',
                    type:'bar',
                    yAxisIndex: 0,
                    symbol: 'none',
                    data:dataX.client_g5
                }
            ]
        };
		
		myChartClient.setOption(optionTwo, true);
		myChartClient.resize();
		//定时刷新
        var setMinute = $('.network-auto-refresh').val()*60*1000;
        setInterval(function () {
            myChartClient.setOption(optionTwo, true);
            myChartClient.resize();
        },setMinute);
	}

	/*设置radio状态*/
	var setRadioStatus = function(key,val){
		$('input[name="'+key+'"]').attr('checked',false);
		$('input[name="'+key+'"][value="'+val+'"]').attr('checked',true);
		initRadio();
	}
	
	/*设置根节点*/
	var setRootName = function(){
		var data = getSite();
		$('.head-title-active').text(data.name);
	}
	
	/*设置选中树节点个数(设备树和用户数)*/
	var setSelectBoxNumber = function(tree){
		var nodes = $(tree).tree('getChecked');
		var number = 0;
		
		$.each(nodes, function(index,data) {
			var dom = $(tree).tree('getParent',data.target);
			//非根节点
			if(dom!=null){
				if(dom.checked==false){
					if(tree==apTree){
						number += data.device_number;
					}else{
						number += data.user_number;
					}
				}
			}else{
				//跟节点
				if(tree==apTree){
					number += data.device_number;
				}else{
					number += data.user_number;
				}
			}
		});
		
		if(tree==apTree){
			SSID.ap_number = number;
		}else{
			SSID.user_number = number;
		}
		
		$('.select-number').text(number);
	}
	
	/*获取树节点的名称*/
	var findNode = function(tree,id){
		return $(tree).tree('find',id);
	}
	
	/*获取所有选中树节点*/
	var getChecked = function(tree){
		return $(tree).tree('getChecked');
	}
	
	/*获取所有树的子节点*/
	var getChildNode = function(tree){
		return $(tree).tree('getChildren');
	}
	
	/*获取父节点*/
	var getParentNode = function(tree,target){
		return $(tree).tree('getParent',target);
	}
	
	/*获取AP树节点*/
	var getTreeChecked = function(tree){
		var nodes = getChecked(tree);
		var result = [];
		if(nodes.length>0){
			$.each(nodes,function(index,data){
				var parentNode = getParentNode(tree,data.target);
				//获取父节点的选中状态，如果选中则PUSH进数组,如果未选中则把子节点PUSH进数组
				if(parentNode!=null){
					if(tree==apTree){
						if(parentNode.checked==false){
							result.push(data.network_policy_id);
						}else{
							if(parentNode.network_policy_id==0){
								result = [0];
								return false;
							}
							result.push(parentNode.network_policy_id);
						}
					}else if(tree==userTree){
						if(parentNode.checked==false){
							result.push(data.id);
						}else{
							if(parentNode.id==0){
								result = [0];
								return false;
							}
							result.push(parentNode.id);
						}
					}
					
				}
			});
		}
		if(result.length==0){
			result=[];
		}
		return $.unique(result);
	};
	
	/*验证树结构名称重复*/
	var checkSsidName = function(ssidName){;
		var nodes = getChildNode(tree);
		var flag = false;
		
		//配置无线暂时不验证
		if(SSID.initStatus==1){
			return false;
		}
		
		$.each(nodes, function(index,data) {
			if(data.text==ssidName){
				flag = true;
				return;
			}
		});
		return flag;
	}
	
	/*获取左侧面板*/
	var setLeftPanel = function(){
		var panel = $('.app-left').layout('panel','center');
		if($(panel).length>0){
			leftPanel = $(panel);
		}else{
			return false;
		}
		
		leftPanel.panel({
			onResize:function(width,height){
				autoHeight();
			}
		});
		
	}
	
	/*调整树的高度*/
	var autoHeight = function(){
		var h1 = $('.left-menu').outerHeight(true);
		var h2 = $('.nav-home-title').outerHeight(true);
		var h3 = $('.nav-segment').outerHeight(true);
		var h = h1+h2+h3;
		var treeHeight = leftPanel.height()-h;
		$('.network-region-west .group-list').css({
			height:treeHeight+'px'
		});
	}
	
	/*切换下拉列表*/
	var switchMenu = function(element){
		var menu = $(element).next('.dropdown-menu');
		if(menu.hasClass('none')){console.log($(menu));
			menu.removeClass('none');
			$('.network-region-west .dropdown-menu').removeClass('none');
		}else{
			menu.addClass('none');
		}
	}
	
	/*设置停用图标*/
	var setDisabled = function(data){
		var nodes = getChildNode(tree);
		$.each(nodes,function(index,data){
			if(data.status!=undefined){
				switch(data.status){
					case 0:
					$(data.target).find('.tree-file').addClass('disabled-network');
					break;
					case 1:
					$(data.target).find('.tree-file').removeClass('disabled-network');
					break;
				}
				
			}
		});
	}
	
	/*
	 * 获取ssid详情信息
	 * */
	var getSsidDetail = function(node,func){
		var url = _IFA['network_detail_ssids']+node.id;
		var type = 'GET';
		var data = '';
		_ajax(url,type,data,function(data){
			func(data);
		});
	}
	
	/*
	 * 设置其他终端label
	 * 需要通过Portal认证:    enable_access = 1 & enable_portal=1  
	 * 拒绝访问:             enable_access=0 & enable_portal=0
	 * 允许访问:             enable_access=1 & enable_portal=0
	 */
	var setOtherclientLabel = function(ele,node){
		//获取ssid详情
		getSsidDetail(node,function(data){
			var tmpText = '---';
			if(data.enable_access==1 && data.enable_portal==1){
				tmpText = '需要通过Portal认证';
			}else if(data.enable_access==0 && data.enable_portal==0){
				tmpText = '拒绝访问';
			}else if(data.enable_access==1 && data.enable_portal==0){
				tmpText = '允许访问';
			}
			$(ele).text(tmpText);
		});
		
	}
	
	/*
	 * 设置portal信息label
	 * 账户密码认证：auth_mode = 4
     * 短信认证：：auth_mode = 2
     * 一键开放认证：auth_mode = 1
     * 微信认证：auth_mode = 128
     * */
	var setPortalLabel = function(ele,node){
		//获取ssid详情
		getSsidDetail(node,function(data){
			var tmpText = '---';console.log(data);
			if(data.portal_profile != undefined){
				switch(data.portal_profile.auth_mode){
					case 4:{
						tmpText = '账户密码认证';
						break;
					}
					case 2:{
						tmpText = '短信认证';
						break;
					}
					case 1:{
						tmpText = '一键开放认证';
						break;
					}
					case 128:{
						tmpText = '微信认证';
						break;
					}
				}
			}
			$(ele).text(tmpText);
		});
	}
	
	/*
	 * 获取AP设备列表
	 */
	var getApList = function(func,ssid){
		var url = _IFA['ap_table_list']+'?org_ids='+getSite().id;
		if(ssid!=undefined){
			url = url+'&ssid_id='+ssid;
		}
		var type = 'GET';
		var data = '';
		_ajax(url,type,data,function(data){
			func(data);
		});
	}
	
	/*获取AP设备数*/
	var getApNumber = function(ids,func){
		getApList(function(data){
			console.log(ids);
			console.log(data);
			func();
		});
	}
	
	/*
	 * 设置摘要AP组
	 * */
	var setAbstractAp = function(ele,node){
		getApList(function(data){
			var tmpText = '无';
			var wireless = getCache('.network-wireless-clients','node');
			if(data.total>0){
				//获取组个数
				var group_number = [];
				var group_name = '';
				$.each(data.list,function(index,ap){
					if(index==0){
						group_name = ap.group_name;
					}
					group_number.push(ap.group_id);
				});
				group_number = $.unique(group_number);
				
				tmpText = group_name.substring(1)+'等共'+group_number.length+'个组，共计'+data.total+'个AP';
			}
			if(wireless != undefined && wireless.network_policy_ids[0]==0){
				if(group_number != undefined){
					tmpText = '所有，共'+group_number.length+'个组，共计'+data.total+'个AP';
				}
			}
			
			$(ele).text(tmpText);
		},node.id);
	}
	
	/*获取用户组选中数据*/
	var getSelectUserGroups = function(groups,data){
		var tmpText = '无';
		if(groups.user_group_ids[0]==0){
			tmpText = '所有，共'+data.children.length+'个组，共计'+data.user_number+'个用户';
		}
		if(groups.user_group_ids.length>0 && groups.user_group_ids[0]!=0){
			tmpText = data.children[0].name+'等,共'+groups.user_group_ids.length+'个组，共计'+data.user_number+'个用户';
		}
		return tmpText;
	}
	/*
	 * 设置摘要用户组
	 * 待验证
	 * */
	var setAbstractUser = function(ele,node){
		getGroups(function(data){
			data = data.list[0];
			getSsidDetail(node,function(detail){
				$(ele).text(getSelectUserGroups(detail,data));
			});
			
		});
	}
	
	/*设置摘要基本信息*/
	var setAbstractInfo = function(node){
		//更新ssid
		$('.ssid_name_label').text(node.profile_name);
		$('input[name="ssid_name"]').val(node.profile_name);
		
		//更新射频
		 $(".selector").find("option[value="+node.band+"]").prop("selected",true);
		 var text = $(".selector").find("option:selected").text();
		 $('.abs_band_label').text(text);
		 
		 
	
		 /*
		  * VPW模式： auth=6, cipher=0
		  * WPA/WPA2模式：auth=5 cipher=5, key为相应输入值
		  * 开放模式： auth=0，cipher=0
		  */
		 if(node.auth==6 && node.cipher==0){
		 	$('.abs_auth_label').text('VPW模式');
		 	//设置密码
			 $('.abs_key_label').text('---');
			 $('input[name="abs_key"]').val('');
		 }else if(node.auth==5 && node.cipher==5){
		 	$('.abs_auth_label').text('WPA/WPA2模式');
		 	//设置密码
			 $('.abs_key_label').text(node.key);
			 $('input[name="abs_key"]').val(node.key);
		 }else if(node.auth==0 && node.cipher==0){
		 	$('.abs_auth_label').text('开放模式');
		 	//设置密码
			 $('.abs_key_label').text('---');
			 $('input[name="abs_key"]').val('');
		 }
		 
		 //更新其他终端
		 setOtherclientLabel('.otherclient-label',node);
		 
		 //更新Portal
		 setPortalLabel('.portal-label',node);
		 
		 //更新无线接入点
		 setAbstractAp('.ap-label',node);
		 
		 //更新用户组
		 setAbstractUser('.user-label',node);
	};
	
	/*绑定网络摘要访问策略事件*/
	var bindAbstractEven = function(){
		$('.win-abstract .edit-access').click(function(){
			var node = $(tree).tree('getSelected');console.log(node);
			//调用访问控制窗口
			openAbsAccessControl(node);
		});
	}
	
	/*设置默认选中节点*/
	var setDefaultNode = function(data){
		var selected = $(tree).tree('getSelected');
		if(selected==null){
			var children = data[0].children;
			if(children.length>0){
				$.each(children,function(index,node){
					//数字节点
					if($.isNumeric(node.id)){
						$(tree).tree('select',node.target);
						return false;
					}else{
						//非数字节点
						if(node.children.length>0){
							$.each(node.children, function(i,n) {
								$(tree).tree('select',n.target);
								return false;
							});
							return false;
						}
					}
					
				});	
			}
		}
	};
	
	  
    /*获取MB*/
   	var getMB = function(k){
   		var mb = k/1024/1024;
   		return mb.toFixed(1);
   	}
   	
   	/*获取GB*/
   	var getGB = function(m){
   		var gb = m/1024;
   		return gb.toFixed(1)+'G';
   	}
   
    /*
     * 设置标记
     */
    var setMark = function(index){
    	var result = '';
    	var arr = [
    		{id:0,mark:'Noon'},
    		{id:3,mark:'3PM'},
    		{id:6,mark:'6PM'},
    		{id:9,mark:'9PM'},
    		{id:12,mark:'Night'},
    		{id:15,mark:'3AM'},
    		{id:18,mark:'6AM'},
    		{id:21,mark:'9AM'},
    		{id:24,mark:'Noon'}
    	];
    	$.each(arr,function(id,data){
    		if(data.id==index){
    			result = data.mark;
    			return false;
    		}
    	});
    	return result;
    }
   	/*
   	 * 获取时间轴节点
   	 * @data 当前时间数组-后端返回值
   	 * @hour 设定时间间隔
   	 * @ff	client =  终端
   	 * */
  	var getXdate = function(data,hour,ff){
	  	var dataX = [];
	  	var res = {};
	  	
	  	//流量数据
	  	res.tx = [];
	  	res.rx = [];
	  	res.total = [];
	  	
	  	//终端数据
	  	res.client_total = [];
	  	res.client_g24 = [];
	  	res.client_g5 = [];
	  	
	  	//时间戳
	  	res.timestamp = [];
	  	res.mark = [];
	    
	    //定义1小时
	  	var time = new Date();
	  	var mHour = 60*60*1000;
	  	
	  	//清空分秒
	  	time.setMinutes(0);
	  	time.setSeconds(0);
	  	time.setMilliseconds(0);
	  	
	  	//获取时间戳
	  	var timeStamp = time.getTime();
	  	var dehour = hour*mHour;
	  	
	  	//前推hour小时
	  	var x = parseInt(timeStamp)-parseInt(dehour);
	  	time.setTime(x);
	  	
	  	//获取时间戳
	  	timeStamp = time.getTime();
	  	
	  	//写入时间戳
	  	for(var i=0;i<hour;i++){
	  	  var tx = timeStamp+ i*mHour;
		  dataX.push(tx);
	  	}

		
		$.each(dataX,function(index,node){
	  		var flag = false;
	  		var result = '';
	  		$.each(data,function(i,n){
	  			if(node==n.timestamp){
	  				flag = true;
	  				result = n;
	  				return false;
	  			}
	  		});
	  		
	  		//写入终端数据
	  		if(ff=='client'){
	  			if(flag==false){
		  			res.client_g24.push(0);
		  			res.client_g5.push(0);
		  			res.client_total.push(0);
		  			res.timestamp.push(0);
		  			res.mark.push(setMark(index));
		  		}else{
		  			res.client_g24.push(result.client_g24);
		  			res.client_g5.push(result.client_g5);
		  			res.client_total.push(result.client_total);
		  			res.timestamp.push(timeToString(result.timestamp));
		  			res.mark.push(setMark(index));
		  		}
	  		}else{
	  			if(flag==false){
		  			res.tx.push(0);
		  			res.rx.push(0);
		  			res.total.push(0);
		  			res.timestamp.push(0);
		  			res.mark.push(setMark(index));
		  		}else{
		  			res.tx.push(result.tx);
		  			res.rx.push(result.rx);
		  			res.total.push(result.total);
		  			res.timestamp.push(timeToString(result.timestamp));
		  			res.mark.push(setMark(index));
		  		}	
	  		}
	  		
	  	});
	  	return res;
  	}
	
	/*
	 * 获取当前时间戳
	 * 取整数
	 * */
	var getTimeStamp = function(day){
		var date = new Date();
		if(day!=undefined){
			date.setDate(date.getDate()+day);
			return date.getTime();
		}
		return date.getTime();
	}
	
	/*时间戳转换日期*/
	var getDate = function(time){
		var date = new Date(time);
		var year = date.getFullYear();
		var month = date.getMonth();
		var day = date.getDay();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var second = date.getSeconds();
		return year;
		
	}
	
	/*选中树节点*/
	var selectNode = function(node,data){
		var findNode = $(tree).tree('find', node.id);
		console.log(findNode);
		if(findNode!=null){
			$(tree).tree('select', findNode.target);
		}else{
			setDefaultNode(data);
		}
	}
	
	/*获取网络详情*/
	var getNetworkDetail = function(node,callback){
		var url = _IFA['network_detail_ssids']+node.id;
		var type = 'GET';
		var data = '';
		_ajax(url,type,data,function(data){
			//绑定树的选中节点信息
			setCache('.network-wireless-clients','node',data);
			//回调
			if(callback!=undefined){
				callback(data);
			}
		});
	}
	
	/*
	 * 绑定图表放大还原事件
	 */
	var bindEchartEven = function(){
		//绑定放大事件
		var network = $('#app-network-layout').parent('div');
		var panel = $('div[w_id="'+network.attr('w_id')+'"]').panel('header');
		panel.find('.panel-tool-max').click(function(){
			loadEcharts();
		});
		
		//绑定拖拽事件
		$('#app-network-layout').resizable({
		   onResize:function(e){
		   	 loadEcharts();
		   }
		});
		
		$('.btn-network-fresh').click(function(){
			loadEcharts();
		});
	}
	
	/*重新加载数据*/
	var loadTree = function(){
		/*载入树结构*/
		var url =  _IFA['network_list_ssids']+'?org_ids='+getSite().id+'&page_size=100';
		_ajax(url,'GET','',function(data){
			if(data.error_code==0){
				var root = getNetworkList(data,'缺省网络');
				var selected = $(tree).tree('getSelected');
				
				$(tree).tree({
					data:[root],
					onLoadSuccess:function(node,data){
						//设置节点名称
						setRootName();
						//设置左侧面板
						setLeftPanel();
						//自适应树的高度
						autoHeight();
						//设置停用图标
						setDisabled(data);
						//选中默认节点
						if(selected!=null){
							selectNode(selected,data);
						}else{
							setDefaultNode(data);
						}
					},
					onBeforeSelect:function(node){
						if(node!=null){
							//屏蔽父节点
							if(isNaN(node.id)){
								return false;
							};
							//屏蔽缺省网络
							if(node.id==0){
								return false;
							}
						}
						
					},
					onSelect:function(node){
						//获取网络详情
						getNetworkDetail(node);
						//获取定时器
						loadTimesList();
						//初始化加载图表
						loadEcharts();
						
						//设置摘要
						if(node!=null){
							setCloseAbsBase();
							//设置摘要信息
							setAbstractInfo(node);console.log(node);
							//重载表格数据
							loadTable(node.id);
						}
						
					},
					onResize:function(){
						alert();
					}
				});
				
			}else{
				toast('错误信息',data.error_message,'error');
			}
		});
	}
	
	/*调整树结构样式*/
	var adjustTreeStyle = function(obj){
		var appLeft = $('#app-network-layout .app-left').layout('panel','center');
		var height = $(appLeft).panel('options').height;
		obj.css({
				'height':height-140+'px',
			    'overflow-y': 'auto',
			    'overflow-x': 'hidden'
		});
		//添加默认组图标
		$('#app-network-layout .group-list>li>ul>li:first-child .tree-icon').addClass('tree-file-default');
		//把根节点干掉
		var treeTitle = '';
		treeTitle = $('.group-list>li:first-child>div:first-child>span.tree-title').text();
		$('#app-network-layout .nav-home-title .head-title-active').html(treeTitle);
		$('#app-network-layout  .group-list>li:first-child>div:first-child').addClass('none');
		
	}
	
	/*加载AP树结构*/
	var loadApTree = function(checked){
		/*载入树结构*/
		var url =  _IFA['ap_groups_list']+getSite().id;
		if(checked!=true){
			checked = false;
		}
		_ajax(url,'GET','',function(data){
			if(data.error_code==0){
				data = data.list[0];
				data.children[0].text = data.children[0].text=='default'?'默认':data.children[0].text;
				$(apTree).tree({
					data:[data],
					checkbox:checked,
					formatter:function(node){
						return node.text+'<span class="tree-number">'+node.device_number+'</span>';
					},
					onLoadSuccess:function(node,data){
						//反选树节点
						setSsidChecked(apTree);
						
						//初始化选中数量
						setSelectBoxNumber(apTree);
					},
					onBeforeSelect:function(node){
						return false;
					},
					onCheck:function(node){
						setSelectBoxNumber(apTree);
					}
				});
			}
		});
	}
	
	/*加载用户树结构*/
	var loadUserTree = function(checked){
		/*载入树结构*/
		var url =  _IFA['groups_list']+getSite().parent;
		if(checked!=true){
			checked = false;
		}
		_ajax(url,'GET','',function(data){
			if(data.error_code==0){
				data = data.list[0];
				data.children[0].text = data.children[0].text=='default'?'默认':data.children[0].text;
				$(userTree).tree({
					data:[data],
					checkbox:checked,
					formatter:function(node){
						return node.text+'<span class="tree-number">'+node.user_number+'</span>';
					},
					onLoadSuccess:function(node,data){
						//反选树节点
						setSsidChecked(userTree);
						
						//初始化选中数量
						setSelectBoxNumber(userTree);
					},
					onBeforeSelect:function(node){
						return false;
					},
					onCheck:function(node){
						setSelectBoxNumber(userTree);
					}
				});
			}
		});
	}
	
	/*处理隧道模式数据*/
	var getTunnelValue = function(type,vlan){
		var result = {};
		switch(type){
			case '1':{
				result.type = 0;
				result.vlan = 1;
				break;
			}
			case '2':{
				result.type=0;
				result.vlan = vlan;
				break;
			}
			case '3':{
				result.type = 1;
				break;
			}
		}
		return result;
	}
	
	/*获取模式数据*/
	var getModeValue = function(auth,key){
		var result = {};
		switch(auth){
			case '1':{
				result.auth = 6;
				result.cipher = 0;
				break;
			}
			case '2':{
				result.auth = 5;
				result.cipher = 5;
				result.key = key;
				break;
			}
			case '3':{
				result.auth = 0;
				result.cipher = 0;
				break;
			}
		}
		result.model = auth;
		
		return result;
	}
	
	/*写入配置预览信息*/
	var setConfigInfo = function(){
		var result = '';
		var tmpData = '';
		
		//ssid名称
		$('.ssid-label').text(SSID.ssid_name);
		
		//射频
		switch(SSID.band){
			case '1':
			$('.frequency-label').text('仅2.4G');
			break;
			case '2':
			$('.frequency-label').text('仅5G');
			break;
			case '3':
			$('.frequency-label').text('双频');
			break;
		}
		//ssid_hide状态
		switch(SSID.baseInfo.ssid_hide){
			case 0:
			$('.hide-ssid-label').text('否');
			break;
			case 1:
			$('.hide-ssid-label').text('是');
			break;
		}
		
		//带宽优先
		switch(SSID.bandwidth_priority){
			case '1':
			$('.bandwidth-label').text('低');
			break;
			case '2':
			$('.bandwidth-label').text('中');
			break;
			case '3':
			$('.bandwidth-label').text('高');
			break;
		}
		console.log(SSID.model);
		//模式
		switch(SSID.model){
			case "1":
			$('.win-config-network .auth-label').text('虚拟私有无线网络(VPW)');
			$('.win-config-network .key-label').text('---');
			break;
			case "2":{
				$('.win-config-network .auth-label').text('WPA/WPA2共享密码');
				$('.win-config-network .key-label').text(SSID.key);console.log('*****');
				break;
			}
			case "3":
			$('.win-config-network .auth-label').text('开放,不加密');
			$('.win-config-network .key-label').text('---');
			break;
		}
		
		//AP组
		var aps = SSID.network_policy_ids;
		if(aps.length>0){
			$.each(aps,function(index,data){
				if(data==0){
					result = '所有，共'+SSID.ap_number+'个AP';
					return false;
				}else{
					//获取第一个AP的名称
					result = SSID.first_ap.text+'等共'+aps.length+'个组，共计'+SSID.ap_number+'个AP';
					return false;
				}
			});
		}else{
			result = '无，共0个AP';
		}
		
		$('.ap-group-label').text(result);
		
		//用户组
		var users = SSID.user_group_ids;
		if(users!=undefined && users.length>0){
			$.each(users,function(index,data){
				if(data==0){
					SSID.user_number=SSID.user_number==undefined?0:SSID.user_number;
					result = '所有，共'+SSID.user_number+'个用户';
					return false;
				}else{
					//获取第一个AP的名称
					result = SSID.first_user.text+'等共'+users.length+'个组，共计'+SSID.user_number+'个用户';
					return false;
				}
			});
			$('.user-group-label').text(result);
		}else{
			result = '无，共0个用户';
			$('.user-group-label').text(result);
		}
	}
	
	/*获取用户组*/
	var getGroups = function(func){
		var url = _IFA['groups_list']+getSite().parent;
		var type = 'GET';
		var data = '';
		_ajax(url,type,data,function(resp){
			if(resp.error_code!=0){
				toast('提示消息',resp.error_message,'error');
				return false;
			}else{
				func(resp);
			};
		});
	}
	
	/*发送邮件给用户*/
	var sendMail = function(data){
		var url = _IFA['network_notify_email']+data.id+'/notify/email';
		var type = 'POST';
		var data = JSON.stringify({
			'subject':'网络部署完成，欢迎使用WiFi',
			'content':data.content
		});
		_ajax(url,type,data,function(data){
			if(data.error_code!=0){
				toast('信息提示',data.error_message,'error');
				return false;
			}
		});
	}
	
	/*验证微信字段*/
	var vertifyWeixin = function(){
		if(SSID.portalType==4){
			var shopId = $('input[name="shop_id"]');
			var appId = $('input[name="app_id"]');
			var secretKey = $('input[name="secret_key"]');
			if(shopId.val()=='' || appId.val()=='' || secretKey.val()==''){
				return false;
			}else{
				SSID.shop_id = shopId.val();
				SSID.app_id = appId.val();
				SSID.secret_key = secretKey.val();
			}
		}
		return true;
	}
	
	/*验证登录有效时间*/
	var vertifyLoginTime = function(){
		var res = $('input[name="loginTime"]:checked');
		switch(res.val()){
			case '1':{
				SSID.timeout_interval = -1;
				break;
			}
			case '2':{
				var D = $('.win-portal-network input[name="day"]').val();
				var H = $('.win-portal-network input[name="hour"]').val();
				var M = $('.win-portal-network input[name="minute"]').val();
				var day = D*86400;
				var hour = H*3600;
				var minute = M*60;
				
				time = day+hour+minute;
				
				console.log(D);
				console.log(day);
				console.log(time);
				//未选中的情况下返回错误提示
				if(time==0){
					return false;
				}
				
				SSID.timeout_interval = time;
				break;
			}
			case '3':{
				SSID.timeout_interval = 365*24*60*60;
				break;
			}
		}
		return true;
	}
	
	/*设置配置预览数据-访问策略*/
	var setAccessPolicy = function(){
		var client = '';
		var portal = '';
		if(SSID.model!=1 && SSID.otherclient==1){
			switch(SSID.portalType){
				case '1':
				portal = '账户密码认证';
				break;
				case '2':
				portal = '短信认证';
				break;
				case '3':
				portal = '一键开放认证';
				break;
				case '4':
				portal = '微信认证';
				break;
				default:
				portal = '无';
				
			}
			switch(SSID.otherclient){
				case '1':
				client = '需要Portal认证';
				break;
				case '2':
				client = '拒绝';
				break;
				case '3':
				client = '允许';
				break;
				default:
				client = '无';
			}
			$('.need-portal-label').text(client);
			$('.user-portal-label').text(portal);
		}else{
			
			switch(SSID.otherclient){
				case '1':
				client = '需要Portal认证';
				break;
				case '2':
				client = '拒绝';
				break;
				case '3':
				client = '允许';
				break;
				default:
				client = '无';
			}
			$('.need-portal-label').text(client);
			$('.user-portal-label').text('无');
		}
		
	}
	
	/*获取portal模板ID*/
	var setPortalTemplateId = function(){
		var url = _IFA['network_config_portal'];
		var type = 'GET';
		var data = '';
		_ajax(url,type,data,function(data){console.log(data);
			if(data.error_code==0){
				//写入模板ID
				$.each(data.list, function(index,node) {
					if(node.auth_mode==SSID.auth_mode){
						SSID.portal_template_id = node.id;
						return false;
					}
				});
			}else{
				toast('消息提示',data.error_message,'error');
				return false;
			}
		});
	}
	
	
	
	/*保存部署*/
	var btnSaveSsid = function(flag){
		var win = $(this).parent('.network-footer').parent('form').parent('div');
		var info = {
			org_id:getSite().id,
			profile_name:SSID.ssid_name
		}
		$.extend(SSID,info);
		
		//新增
		var url = _IFA['network_create_ssids'];
		var type = 'POST';
		
		SSID.send_content = $('.options-textarea').val();
		
		//配置
		if(SSID.initStatus==1){
			SSID.ssid_id = SSID.update_id;
		}
		
		//踢出非wpa的key
		if(SSID.model!=2){
			delete SSID.key;
			delete SSID.baseInfo.key;
		}
		
		var data = JSON.stringify(SSID);
		
		_ajax(url,type,data,function(data){
			
			if(data.error_code==0){
				//重载树
				loadTree();
				
				toast('提示信息','操作成功','success');
				
				//给用户发送邮件
				if(flag==true){
					var sendContent = {};
					sendContent.id = data.id;
					
					sendContent.content = SSID.send_content;console.log(SSID);
					sendMail(sendContent);
					destoryWindow();
				}else{
					destoryWindow();
				}
				return false;
			}else{
				toast('提示信息',data.error_message,'error');
				return false;
			}
		});
	};
	
	/*处理更多选项通知用户*/
	var bindNoticeUser = function(){
		$('.win-options-network .email-network').click(function(){
			switch($(this).is(':checked')){
				case true:{
					$('.win-options-network .email-content-network').attr('disabled',false);
					
					$('.win-options-network .email-content-network').click(function(){
						if($(this).is(':checked')){
							$('.options-textarea').attr('disabled',false);
						}else{
							$('.options-textarea').attr('disabled',true);
						}
					});
					break;
				}
				case false:{
					$('.win-options-network .email-content-network').attr('checked',false);
					// initCheckBox();
					$('.win-options-network .email-content-network').attr('disabled',true);
					$('.options-textarea').attr('disabled',true);
					break;
				}
			};
		});
	}
	
	/*更多选项事件*/
	var bindOptionsEven = function(){
		$('.win-options-network .btn-save').click(function(){
			var emlNetwork = $('.win-options-network .email-network');
			var emlContentNetwork = $('.win-options-network .email-content-network');
			//选择发邮件给用户
			if(emlNetwork.is(':checked')){
				//发邮件保存部署
				btnSaveSsid(true);
			}else{
				//不发邮件直接保存部署
				btnSaveSsid();
			}
		});
	}
	
	/*摘要快速保存事件*/
	var bindAbstractBaseSave = function(){
		//获取快速保存数据
		var ssid_name = $('input[name="ssid_name"]').val();
		var abs_band = $('select[name="abs_band"]').val();
		var abs_key = $('input[name="abs_key"]').val();
		var band_text = $(".selector").find("option:selected").text();
		
		var currentNode = getCache('.network-wireless-clients','node');
		var url = _IFA['network_update_ssids'];
		var type = 'POST';
		var data = {
			org_id:getSite().id,
			profile_name:ssid_name,
			ssid_name:ssid_name,
			band:abs_band,
			ssid_id:currentNode.id
		};
		if(abs_key!=''){
			$.extend(currentNode,data,{key:abs_key});
		}else{
			$.extend(currentNode,data);
		}
		currentNode = JSON.stringify(currentNode);
		_ajax(url,type,currentNode,function(data){
			if(data.error_code==0){
				//设置静态数据
				$('.ssid_name_label').text(ssid_name);
				$('.abs_band_label').text(band_text);
				$('.abs_key_label').text(abs_key);
				loadTree();
				toast('提示消息','操作成功','success');
			}else{
				toast('提示消息',data.error_message,'error');
			}
		});
	}
	
	/*返现新增无线数据*/
	var loadSsidInfo = function(init){
		if(init==true){
			$('input[name="ssid_name"]').val(SSID.ssid_name);
			setRadioStatus('band',SSID.band);
		}
	}
	
	
	
	/*上一步新增无线窗口*/
	var preCreateSsid = function(){
		$('.win-create-ssid-network').window('open');
	}
	
	/*设置选择网络数据的信息*/
	var setSelectSsidData = function(){
		//获取AP树节点
		var apChecked = getTreeChecked(apTree);
		
		//校验AP的合法性--------未处理
		
		//存储第一个节点
		var first_ap = findNode(apTree,apChecked[0]);
		
		//合并获取信息
		var result =  {
			first_ap:first_ap,
			network_policy_ids:apChecked
		};
		console.log(result);
		//分类设置无线网络数据
		SSID.apInfo = result;
		
		//合并全部
		$.extend(SSID,result);
	}
	
	/*销毁所有关于创建无线网络的窗口*/
	var destoryWindow = function(){
		$('.win-create-ssid-network').window('destroy');
		$('.win-select-ssid-network').window('destroy');
		$('.win-select-user-network').window('destroy');
		$('.win-config-network').window('destroy');
		$('.win-options-network').window('destroy');
		$('.win-portal-network').window('destroy');
		$('.win-access-control-network').window('destroy');
		//销毁  添加定时访问窗口
		$('.win-create-times-network').window('destroy');
		//销毁  编辑定时访问窗口
		$('.win-mod-times-network').window('destroy');
		SSID = {};
	}
	
	/*隐藏窗口-应用于下一步*/
	var hideWindow = function(win){
		$(win).panel('panel').hide();
		$(win).panel('panel').next('.window-shadow').hide();
		$(win).panel('panel').next('.window-shadow').next('.window-mask').hide();
	}
	/*打开隐藏窗口*/
	var openWindow = function(win){
		$(win).window('open');
	}
	
	/*如果窗口存在则重新打开*/
	var isOpen = function(win){
		if($(win).length>0){
			$(win).window('open');
			return true;
		}else{
			return false;
		}
	}
	
	/*
	 * 创建新增无线窗口
	 * initStatus:0 定义为新增状态
	 * */
	var btnCreateSsid = function(){
		$('.network-region-west .btn-create-network').click(function(){
			openCreateSsid();
		});
	}
	
	/*
	 * 获取用户组白名单
	 * 问题:获取的修改值为空数组,但已经选择上了?
	 * */
	var setWhiteListUserGroup = function(){
		var combo = $('.select-user-combotree').combotree('tree');	
		var res = combo.tree('getChecked');	console.log(res);
   		if(res.length>0){
   			SSID.white_list_user_group_ids = [];
   			$.each(res,function(index,data){
   				SSID.white_list_user_group_ids.push(data.id);
   			});
   		}else{
   			SSID.white_list_user_group_ids = [];
   		}
	}
	
	/*
	 * 反选访问控制-用户组
	 * */
	var setAccessUserGroup = function(){
		var list = SSID.white_list_user_group_ids;console.log(list);
		if(list.length>0){
			 $('.select-user-combotree').combotree('setValues',list);	
		}
	}
	
	/*
	 * 反选其他终端
	 * 需要通过Portal认证:    enable_access = 1 & enable_portal=1  
	 * 拒绝访问:              enable_access=0 & enable_portal=0  //这个状态保存不上
	 * 允许访问:              enable_access=1 & enable_portal=0
	 * */
	var resetOtherClient = function(){
		var access = SSID.enable_access;
		var portal = SSID.enable_portal;
		var name  = 'otherclient';
		
		if(access==1 && portal ==1){
			SSID.otherclient = 1;
			selectRadio(name,1);
		}else if(access==0 && portal==0){
			SSID.otherclient = 2;
			selectRadio(name,2);
		}else if(access=1 && portal==0){
			SSID.otherclient = 3;
			selectRadio(name,3);
		}
	}
	
	/*设置其他终端选项*/
	var setOtherClient = function(){
		var result = getFormValue('#access-network');
		switch(result.otherclient){
			case '1':{
				SSID.enable_access = 1;
				SSID.enable_portal = 1;
				SSID.otherclient = 1;
				break;
			}
			case '2':{
				SSID.enable_access = 0;
				SSID.enable_portal = 0;
				SSID.otherclient = 2;
				break;
			}
			case '3':{
				SSID.enable_access = 1;
				SSID.enable_portal = 0;
				SSID.otherclient = 3;
				break;
			}
		}
	}
	
	/*
	 * 反选PORTAL设置类型
	 * 账户密码认证：auth_mode = 4
     * 短信认证：：auth_mode = 2
     * 一键开放认证：auth_mode = 1
     * 微信认证：auth_mode = 128
	 * */
	var setPortalType = function(){
		var auth = SSID.auth_mode;
		var name = 'portalType';
		switch (auth){
			case 4:{
				SSID.portalType = 1;
				selectRadio(name,1);
				break;
			}
			case 2:{
				SSID.portalType = 2;
				selectRadio(name,2);
				break;
			}
			case 1:{
				SSID.portalType = 3;
				selectRadio(name,3);
				break;
			}
			case 128:{
				SSID.portalType = 4;
				selectRadio(name,4);
				break;
			}
		}
	}
	
	/*设置其他终端选择数据
	 * 需要通过Portal认证:    enable_access = 1 & enable_portal=1  
	 * 拒绝访问:             enable_access=0 & enable_portal=0
	 * 允许访问:             enable_access=1 & enable_portal=0
	 **/
	var bindOtherClient = function(){
		setOtherClient();
		$('input[name="otherclient"]').click(function(){
			setOtherClient();
		});
	}
	
	/*创建User combotree*/
	var loadUserCombotree = function(){
		getGroups(function(data){
			var subGroup = data.list[0].children;console.log(subGroup);
			$('.select-user-combotree').combotree({
			   data:subGroup,
			   multiple:true,
			   onLoadSuccess:function(node,data){
			   	$('.wrap-combotree .textbox .textbox-text').css({
			   		'background':'#fafbfd'
			   	});
			   	//配置
				if(SSID.initStatus==1){
					//反选白名单用户组
					setAccessUserGroup();
				}
			   },
			   onShowPanel:function(){
			   	//移出下拉树列表，隐含面板
			   	$('.win-access-control-network *').not('.select-user-combotree,.combo *').mouseenter(function(){
			   		$('.select-user-combotree').combo('hidePanel');
			   	});
				$('.cont-item *').not('.combotree-network-hiden,.combo *').mouseenter(function(){
			   		$('.combotree-network-hiden').combo('hidePanel');
			   	});
			   },
			   onCheck:function(node,checked){
			   	    //设置用户组白名单
			   		setWhiteListUserGroup();
			   }
			});
		});
	}
	
	/*初始化portal类型*/
	var initPortalType = function(){
		//初始化选中状态
		$('.network-ul .network-li input[name="portalType"]').each(function(index,data){
			//全部隐含
			$(this).parents('.portal-auth').next('.portal-word').addClass('none');
			$(this).parents('.portal-auth').next('.portal-word').next('.portal-voucher').addClass('none');
			
			//单一显示
			if($(this).is(':checked')){
				//删除隐含
				$(this).parents('.portal-auth').next('.portal-word').removeClass('none');
				$(this).parents('.portal-auth').next('.portal-word').next('.portal-voucher').removeClass('none');
				switch($(this).val()){
					case '1':{
						SSID.auth_mode = 4;
						break;
					}
					case '2':{
						SSID.auth_mode = 2;
						break;
					}
					case '3':{
						SSID.auth_mode = 1;
						break;
					}
					case '4':{
						SSID.auth_mode = 128;
						break;
					}
				}
			}
		});
	}
	
	/*绑定选择portal类型事件*/
	var bindSelectPortalType = function(){
		
		initPortalType();
		
		$('.network-ul .network-li input[name="portalType"]').click(function(){
			initPortalType();
		});
	}
	
	/*选中radio组*/
	var selectRadio = function(name,val){
		//初始化Radio
		$('input[name="'+name+'"]').prop('checked',false);
		$('input[name="'+name+'"][value="'+val+'"]').prop('checked',true);
	}
	
	/*选中checkbox*/
	var selectCheckBox = function(name,val){
		if(val==1){
			val = true;
		}else if(val == 0){
			val = false;
		}
		
		$('input[name="'+name+'"]').prop('checked',val);
	}
	
	/*
	 * 反选高级配置
	 * 双频: band=3; 2.4G: band=1; 5G: band=2;
	 * 隐藏SSID选中: ssid_hide=1; 未选中: ssid_hide=0; 默认为未选中。
	 * 带宽优先级: 高(3), 中(2), 低(1) 默认为2
	 * */
	var setBandMore = function(){
		//双频
		var band = SSID.band;
		var name = 'band';
		selectRadio(name,band);
		
		//隐藏ssid选中
		var ssid_hide = SSID.ssid_hide;
		name = 'ssid_hide';
		selectCheckBox(name,ssid_hide);
		
		//带宽优先级
		var bandwidth_priority = SSID.bandwidth_priority;
		name = 'bandwidth_priority';
		selectRadio(name,bandwidth_priority);
	}
	
	/*
	 * 反选隧道模式
	 * type=0 & vlan=1 则选择未启用
	 * type=0 & vlan!=1 则选择VLAN模式，ID设置为vlan值
	 * type=1 则选择GRE
	 * */
	var setTunnelMode = function(){
		//获取数据
		var type = SSID.type;
		var vlan = SSID.vlan;
		var name = 'type';
		if(type==0 && vlan==1){
			selectRadio(name,1);
		}else if(type==0 && vlan !=1){
			selectRadio(name,2);
			$('input[name="vlan"]').val(vlan);
		}else if(type = 1){
			selectRadio(name,3);
		}
	}
	
	/*
	 * 反选模式
	 * VPW模式： auth=6, cipher=0
	 * WPA/WPA2模式：auth=5 cipher=5, key为相应输入值
	 * 开放模式： auth=0，cipher=0
	 * */
	var setNetworkMode = function(){
		var auth = SSID.auth;
		var cipher = SSID.cipher;
		var name = 'auth';
		
		//选择分支
		if(auth==6 && cipher==0){
			SSID.model = 1;
			selectRadio(name,1);
		}else if(auth==5 && cipher==5){
			SSID.model = 2;
			selectRadio(name,2);
			$('.win-create-ssid-network input[name="key"]').val(SSID.key);
		}else if(auth==0 && cipher==0){
			SSID.model = 3;
			selectRadio(name,3);
		}
		console.log(SSID);
	}
	
	/*
	 * 反选无线接入点
	 * */
	var setSsidChecked = function(tree){
		
		var ids = [];
		if(tree==apTree){
			ids = SSID.network_policy_ids;
		}else if(tree==userTree){
			ids = SSID.user_group_ids;
		}
		console.log(ids);
		if(ids!=undefined){
			$.each(ids, function(index,data) {
				if(data == 0){
					//全选树结构
					var root = $(tree).tree('getRoot');
					$(tree).tree('check',root.target);
					return false;
				}else{
					//单一checked
					var node = $(tree).tree('find', data);
					$(tree).tree('check',node.target);
				}
			});
		}
		
	}
	
	/*编辑配置网络收页*/
	var updateSsid = function(){console.log(SSID);
		
		//设置修改状态
		SSID.initStatus = 1;
		
		//设置网络名称
		$('.win-create-ssid-network input[name="ssid_name"]').val(SSID.ssid_name);
		
		//设置高级配置
		setBandMore();
		
		//设置隧道模式
		setTunnelMode();
		
		//设置模式
		setNetworkMode();
	}
	
	/*插入错误信息*/
	var toerror = function(ele,msg){
		var error = $('<div />').addClass('error');
		error.text(msg);
		var inputBoxWidth = $('.input-box').width();
		var leftWidth = $('.input-left').width();
		ele.parent('.input-box').next('.error').remove();
		ele.parent('.input-box').after(error);
		error.css({
			'margin-left':leftWidth,
			'color':'red',
			'margin-top':'2px'
		});
		//设置差号
		ele.css({
			'background':'url(public/images/error-message.png) no-repeat 98% center',
			'background-size':'20px'
		});
	}
	/*写入正确信息*/
	var toright = function(ele,msg){
		var status = {};
		//清除错误类
		ele.parent('.input-box').next('.error').remove();
		//设置差号
		ele.css({
			'background':'url(public/images/true-message.png) no-repeat 98% center',
			'background-size':'20px'
		});
		status.error_code = 0;
		status.error_message = '';
		return status;
	}

	/*验证创建无线窗口表单*/
	var verifyCreateSsid = function(){
		
		//初始聚焦
		$('input[name="ssid_name"]').focus();
		
		//新建网络ssid失交处理
		$('input[name="ssid_name"]').blur(function(){
			
			//验证数据长度
			if($(this).val().length>0 && $(this).val().length<=32){
				//验证重名
				if(checkSsidName($(this).val())){
					verifyResult.error_code = 1;
					verifyResult.error_message = 'SSID名称重复错误！';
					toerror($(this),verifyResult.error_message);
					return false;
				}
				if(!isVerifyName($(this).val())){
					verifyResult.error_code = 2;
					verifyResult.error_message = 'SSID名称格式错误！';
					toerror($(this),verifyResult.error_message);
					return false;
				}
				
				//正确
				verifyResult.error_code = 0;
				verifyResult.error_message = '';
				return toright($(this),'');
			}else{
				verifyResult.error_code = 3;
				verifyResult.error_message = 'SSID名称错误！';
				toerror($(this),verifyResult.error_message);
				return false;
			}
		});
		
		//验证隧道模式
		$('#create-ssid-network input[name="vlan"]').blur(function(){
			
			var parse = $(this).val();
			
			if(isInteger(parse)){
				if(parse<2 || parse>4000){
					$(this).addClass('input-error');
					verifyResult.error_code = 5;
					verifyResult.error_message = '请输入2-4000的数字';
					return false; 
				}else{
					$(this).addClass('input-right');
					verifyResult.error_code = 0;
					verifyResult.error_message = '';
					return false;
				}
			}else{
				$(this).addClass('input-error');
				verifyResult.error_code = 5;
				verifyResult.error_message = '请输入2-4000的数字';
				return false;
			}
		});
		
		//验证隧道模式
		$('#create-ssid-network input[name="key"]').blur(function(){
			
			var parse = $(this).val();
			if(parse.length<8 || parse.length>64){
				$(this).removeClass('input-right');
				$(this).addClass('input-error');
				verifyResult.error_code = 6;
				verifyResult.error_message = '请输入8-63个字符';
				return false; 
			}else{
				$(this).removeClass('input-error');
				$(this).addClass('input-right');
				verifyResult.error_code = 0;
				verifyResult.error_message = '';
				return false;
			}
		});
		
		/*清除模式checkbox验证*/
		$('.tunnel-mode input[type="radio"]').click(function(){
			if($(this).val()!=2){
				$('#create-ssid-network input[name="vlan"]').removeClass('input-right');
				$('#create-ssid-network input[name="vlan"]').removeClass('input-error');
			};
		});
	}
	
	//判断是否打开更多选项
	var selectOpenOptions = function(){
		var model = parseInt(SSID.model);
		var access = parseInt(SSID.otherclient);
		var portal = parseInt(SSID.portalType);
		if((model >1 && access >1) || (model>1 && access ==1 && portal >1)){
			$('.win-config-network .btn-next-network').addClass('none');
			//清除用户数据
			SSID.user_number = 0;
			SSID.user_group_ids = [];
			console.log(SSID);
		}else{
			$('.win-config-network .btn-next-network').removeClass('none');
		}
	};
	
	/*创建新增无线窗口*/
	var openCreateSsid = function(flag){
		if(isOpen('.win-create-ssid-network')){
			return false;
		};
		$('<div class="win-create-ssid-network"/>').appendTo(container);
		$('.win-create-ssid-network').window({
			width:650,
			height:546,
			title:'新建网络',
			href:'network/create-ssid.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){console.log(SSID);
				var self = this;
				//设置新增状态
				if(flag==true){
					$(this).panel('setTitle','配置网络');
					updateSsid();
				}else{
					SSID = {};
					SSID.initStatus = 0;
					SSID.network_policy_ids = [0];
				}
				//切换显示
				$('.win-create-ssid-network .link-position').click(function(){
					if($('.band-content').hasClass('none')){
						$('.band-content').removeClass('none');
						$(this).text('简单设置');
					}else{
						$('.band-content').addClass('none');
						$(this).text('高级设置');
					}
				});
				
				//初始化radio
				initRadio();
				
				//初始化checkbox
				initCheckBox();
				
				//隧道模式  disable
				var form = getFormValue('#create-ssid-network');
				if(form.type!=2){
					$('#create-ssid-network input[name="vlan"]').attr('disabled','disabled');
				}
				
				$('#create-ssid-network input[name="type"]').click(function(){
					var type = $(this).val();
					if(type!=2){
						$('#create-ssid-network input[name="vlan"]').attr('disabled',true);
					}else{
						$('#create-ssid-network input[name="vlan"]').attr('disabled',false);
						$('#create-ssid-network input[name="vlan"]').focus();
					}
				});
				
				//模式  disable
				if(form.auth!=2){
					$('#create-ssid-network .wpa').hide();
				}
				$('#create-ssid-network input[name="auth"]').click(function(){
					var type = $(this).val();
					if(type!=2){
						$('#create-ssid-network .wpa').hide();
					}else{
						$('#create-ssid-network .wpa').show();
					}
				});
				
				//验证表单
				verifyCreateSsid();
				
				//绑定下一步事件
				$('.win-create-ssid-network .btn-next-network').click(function(){
					
					//表单验证
					if(verifyResult.error_code>0){
						return false;
					}
					//获取基本信息数据
					var result = getFormValue('#create-ssid-network');
					
					//单独获取下隐藏SSID状态
					var ssid_hide = $('.ssid_hide').prop('checked');
					if(ssid_hide==false){
						result.ssid_hide = 0;
					}else{
						result.ssid_hide = 1;
					};
					
					//合并基本信息
					var baseInfo = {};
					$.extend(baseInfo,result,getTunnelValue(result.type),getModeValue(result.auth));
					
					//分类数据
					SSID.baseInfo = baseInfo;
					//合并数据
					$.extend(SSID,baseInfo);

					//隐藏当前窗口
					hideWindow('.win-create-ssid-network');
					
					//打开选择网络窗口
					openSelectSsid();	
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				})
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//在修改状态时，加载info数据
				//loadSsidInfo(true);
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*打开选择网络窗口*/
	var openSelectSsid = function(){
		if(isOpen('.win-select-ssid-network')){
			return false;
		};
		$('<div/>').addClass('win-select-ssid-network').appendTo(container);
		$('.win-select-ssid-network').window({
			width:650,
			height:546,
			title:'选择无线接入点',
			href:'network/select-ssid.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){console.log(SSID);
				var self = this;
				
				//加载AP树结构
				loadApTree(true);
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					//隐藏当前窗口
					hideWindow('.win-select-ssid-network');
					
					//打开新建窗口
					preCreateSsid();
				});
				
				//下一步
				$(this).find('.btn-next-network').click(function(){
					
					//设置网络数据
					setSelectSsidData();
					
					//隐藏当前窗口
					hideWindow('.win-select-ssid-network');
					
					//分支选择
					if(SSID.model==1){
						
						//打开用户窗口
						openUserWindow();
						
					}else if(SSID.model==2 || SSID.model==3){
						
						//打开安全控制页面
						openAccessControl();
					}
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*打开选择网络窗口-摘要*/
	var openAbsSelectSsid = function(){
		if(isOpen('.win-select-ssid-network')){
			return false;
		};
		$('<div/>').addClass('win-select-ssid-network').appendTo(container);
		$('.win-select-ssid-network').window({
			width:650,
			height:546,
			title:'选择无线接入点',
			href:'network/select-ssid.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){
				var self = this;
				
				//加载AP树结构
				loadApTree(true);
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*选择访问网络的用户*/
	var openAbsUserWindow = function(){
		if(isOpen('.win-select-user-network')){
			return false;
		};
		var selectUser = $('<div/>').addClass('win-select-user-network').appendTo(container);
		selectUser.window({
			width:650,
			height:546,
			title:'选择访问网络的用户',
			headerCls:'sm-header',
			href:'network/select-user.html',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){console.log(SSID);
				var self = this;
				
				//加载用户树结构
				loadUserTree(true);
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*选择访问网络的用户*/
	var openUserWindow = function(){
		if(isOpen('.win-select-user-network')){
			return false;
		};
		var selectUser = $('<div/>').addClass('win-select-user-network').appendTo(container);
		selectUser.window({
			width:650,
			height:546,
			title:'选择访问网络的用户',
			headerCls:'sm-header',
			href:'network/select-user.html',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){console.log(SSID);
				var self = this;
				
				
				//加载用户树结构
				loadUserTree(true);
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					//隐藏当前窗口
					hideWindow('.win-select-user-network');
					
					//分支选择
					if(SSID.model==1){
						//进选择网络窗口
						openSelectSsid();
					}else{
						//进Portal设置窗口
						openPortal();
					}
				});
					
				//下一步
				$(this).find('.btn-next-network').click(function(){
					
					//获取用户选择的数据
					var userChecked = getTreeChecked(userTree);
					
					//获取第一个节点信息
					var first_user = findNode(userTree,userChecked[0]);

					//合并获取信息
					var result =  {
						first_user:first_user,
						user_group_ids:userChecked
					};
					
					SSID.userInfo = result;
					
					//合并所有
					$.extend(SSID,result);
					
					//隐藏当前窗口
					hideWindow('.win-select-user-network');

					//打开配置预览
					openConfig();
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*配置预览*/
	var openConfig = function(){
		if(isOpen('.win-config-network')){
			return false;
		};
		var selectConfig = $('<div/>').addClass('win-config-network').appendTo(container);
		selectConfig.window({
			width:650,
			height:546,
			title:'配置预览',
			headerCls:'sm-header',
			href:'network/config-network.html',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onOpen:function(){
				//写入获取数据展示
				setConfigInfo();
				
				//设置配置的访问策略
				setAccessPolicy();
				
				//判断是否打开更多选项
				selectOpenOptions();
			},
			onLoad:function(){console.log(SSID);
				var self = this;
				
				//判断是否打开更多选项
				selectOpenOptions();
				
				//写入获取数据展示
				setConfigInfo();
				
				//设置配置的访问策略
				setAccessPolicy();
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					//隐藏当前窗口
					hideWindow('.win-config-network');
					
					//分支选择4条路线
					if(SSID.model==1){
						//进入选择用户
						openUserWindow();
					}else {console.log(SSID);
						//进入访问控制
						openAccessControl();
					}
				});
				
				//下一步
				$(this).find('.btn-next-network').click(function(){
					hideWindow('.win-config-network');
					openOptions();
				});
				
				//绑定保存事件
				var flag = $('.win-config-network .btn-save').bind('click',btnSaveSsid);
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*更多选项*/
	var openOptions = function(){
		if(isOpen('.win-options-network')){
			return false;
		};
		var selectOptions = $('<div/>').addClass('win-options-network').appendTo(container);
		selectOptions.window({
			width:650,
			height:350,
			title:'更多选项',
			headerCls:'sm-header',
			href:'network/more-options.html',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){console.log(SSID);
				var self = this;
				
				//初始化
				initCheckBox();
				
				//重新定义用户通知事件-切换c
				bindNoticeUser();
				
				//绑定更多选项事件
				bindOptionsEven();
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					hideWindow('.win-options-network');
					
					//进入配置预览窗口
					openConfig();
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*portal设置*/
	var openPortal = function(){
		if(isOpen('.win-portal-network')){
			return false;
		};
		var selectPortal = $('<div/>').addClass('win-portal-network').appendTo(container);
		selectPortal.window({
			width:650,
			height:546,
			title:'Portal设置',
			headerCls:'sm-header',
			href:'network/portal.html',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){console.log(SSID);
				var self = this;
				
				//配置
				if(SSID.initStatus == 1){
					setPortalType();
				}
				
				//初始化radio
				initRadio();
				
				//初始化checkbox
				initCheckBox();
				
				//绑定选择portal类型事件
				bindSelectPortalType();
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					hideWindow('.win-portal-network');
					openAccessControl();
				});
				
				//下一步
				$(this).find('.btn-next-network').click(function(){
					//获取基本信息数据
					var result = getFormValue('#portal-network');
					
					//合并数据
					$.extend(SSID,result);
					
					//设置模板ID;
					setPortalTemplateId();
					
					//验证时间
					if(!vertifyLoginTime()){
						toast('提示信息','请输入正确的有效期时间','error');
						return false;
					};
					
					//验证微信
					if(!vertifyWeixin()){
						toast('提示信息','请输入微信凭证','error');
						return false;
					}
					
					console.log(SSID);
					//隐藏窗口
					hideWindow('.win-portal-network');
					
					//选择分支
					if(SSID.portalType==1){
						//进入选择用户
						openUserWindow();
					}else{
						//进入配置预览
						openConfig();
					}
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});	
	}
	
	/*访问控制*/
	var openAccessControl = function(){
		if(isOpen('.win-access-control-network')){
			return false;
		};
		var accessControl = $('<div/>').addClass('win-access-control-network').appendTo(container);
		accessControl.window({
			width:650,
			height:546,
			title:'访问控制',
			headerCls:'sm-header',
			href:'network/access-control.html',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){console.log(SSID);
				var self = this;
				
				//配置
				if(SSID.initStatus==1){
					//反选其他终端
					resetOtherClient();
				}
				
				//初始化radio
				initRadio();
				
				//初始化checkbox
				initCheckBox();
				
				//加载用户combotree
				loadUserCombotree();
				
				//选择其他客户端
				bindOtherClient();
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					//隐藏当前窗口
					hideWindow('.win-access-control-network');
					
					//进入选择AP窗口
					openSelectSsid();
				});
				
				//下一步
				$(this).find('.btn-next-network').click(function(){
					//获取基本信息数据
					var result = getFormValue('#access-network');
					
					console.log(result);
					
					//合并数据
					$.extend(SSID,result);
					
					//隐藏当前窗口
					hideWindow('.win-access-control-network');
					
					if(SSID.otherclient==1){
						//进入portal设置
						openPortal();
					}else{
						//进入配置预览
						openConfig();
					}
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});
	}
	
	/*访问控制-摘要*/
	var openAbsAccessControl = function(node){
		if(isOpen('.win-access-control-network')){
			return false;
		};
		var accessControl = $('<div/>').addClass('win-access-control-network').appendTo(container);
		accessControl.window({
			width:650,
			height:546,
			title:'访问控制',
			headerCls:'sm-header',
			href:'network/abstract-access-control.html',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){
				var self = this;
				
				//获取节点数据
				SSID = node;
				
				//初始化radio
				initRadio();
				
				//初始化checkbox
				initCheckBox();
				
				//加载用户combotree
				loadUserCombotree();
				
				//选择其他客户端
				bindOtherClient();
				
				//保存事件
				$(this).find('.btn-save').click(function(){
					alert();
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
				
				//绑定关闭窗口
				$(this).panel('header').find('.panel-tool-close').click(function(){
					_confirm('提示信息', '您确认此操作吗?', function(r){
						if (r){
							destoryWindow();
						}
					});
				});
			},
			onBeforeClose:function(){
				return false;
			}
		});
	}
	
	/*切换总览摘要*/
	var swichTraffic = function(){
		$('.network-title li').click(function(){
			$('.network-title li').removeClass('selected');
			$(this).addClass('selected');
		});
	}
	
	/*更多下拉列表*/
	var btnMenuMore = function(){
		$('.network-region-west .btn-menu-more').click(function(e){
			$(this).next('ul').mouseleave(function(){
				$(this).addClass('none');
			});
			if($(this).next('ul').hasClass('none')){
				$(this).next('ul').removeClass('none');
				$(this).addClass('open');
				return false;
			}else{
				$(this).next('ul').addClass('none');
				$(this).removeClass('open');
				return false;
			}
		});
	} 
	
	/*
	 * 配置网络
	 * initStatus:1 为修改状态
	 * */
	var btnUpdateSsid = function(){
		 $('.network-region-west .btn-update-network').click(function(){
		 	
			//获取选中节点
			var selected = $(tree).tree('getSelected');
			
			//获取数据
			if(selected!=null && selected !=undefined){
				var type = 'GET';
				var url = _IFA['network_detail_ssids']+selected.id;
				var data = '';
				_ajax(url,type,data,function(data){
					SSID = data;
					SSID.update_id = selected.id;
					openCreateSsid(true);
				});
			}else{
				toast('提示消息','请选择需要编辑的网络','error');
				return false;
			}
			
		});
		
	}
	
	/*停用*/
	var disabledNetwork = function(){
	 $('.network-region-west .btn-disabled-network').click(function(){
			//获取选中节点
			var selected = $(tree).tree('getSelected');
			var type = 'PUT';
			var url = _IFA['network_status_ssids']+selected.id;
			var data = JSON.stringify({status:0});
			_confirm('提示信息', '您确认此操作吗?', function(r){
				if (r){
					_ajax(url,type,data,function(data){
						loadTree();
					});
				}
			});
			
		});
	}
	
	/*启用*/
	var enabledNetwork = function(){
		$('.network-region-west .btn-enabled-network').click(function(){
			//获取选中节点
			var selected = $(tree).tree('getSelected');
			var type = 'PUT';
			var url = _IFA['network_status_ssids']+selected.id;
			var data = JSON.stringify({status:1});
			_confirm('提示信息', '您确认此操作吗?', function(r){
				if (r){
					_ajax(url,type,data,function(data){
						loadTree();
					});
				}
			});
			
		});
	} 
	
	/*删除无线*/
	var btnDeleteWireless = function(){
		$('.network-region-west .btn-delete-network').click(function(){
			//获取选中节点
			var selected = $(tree).tree('getSelected');
			var type = 'DELETE';
			var url = _IFA['network_delete_ssids']+selected.id;
			var data = '';
			_confirm('提示信息', '您确认要删除记录吗?', function(r){
				if (r){
					_ajax(url,type,data,function(data){
						loadTree();
					});
				}
			});
			
		});
	}
	
	/*创建终端select*/
	var loadClientSelect = function(){
		var url = _IFA['client__get_dz_list'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+getSite().id;		
		url = url + args
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				var str = '<option value="">请选择地址簿</option>';
				for(var i=0;i<data.list.length;i++){
					var item = data.list[i];
					str += '<option value="'+item.id+'">'+item.profile_name+'</option>';
				}
				$(".select-client").html(str);
				$('#msClients').change(function() {
		        }).multipleSelect({
		            width: 'auto'
		        });
			}
		});
	}
	/*创建定时器select*/
	var loadTimesList = function(){
		var url = _IFA['network_get_component_times'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+getSite().id;		
		url = url + args
		_ajax(url,type,data,function(data){
			console.log(data);
			if(data.error_code==0){
				setCache('.btn-mod-times','timer',data);
				var str = "<option value='0'>请选择定时器</option>";
				for(var i=0;i<data.list.length;i++){
					var item = data.list[i];
					str += '<option value="'+item.id+'">'+item.profile_name+'</option>';
				}
				$("#select-times").html("").html(str);
				//选择定时器，显示受限时间
				$('.select-times').change(function(){
					console.log($('#select-times option:selected').val())
					var id = $('#select-times option:selected').val();
					var url =  _IFA['network_detail_component_times']+id;
					var type = 'GET';
					_ajax(url,type,'',function(data){
						console.log(data)
						/*for(var i=0; i<data.items.length; i++){
							var limitationTime = data.items[i].day;
							console.log(limitationTime)
							//选择定时器和受限时间联动
						}*/
					})
				})
			}
		});
	}

	
	/*绑定定时访问策略事件*/
	var bindTimesEven = function(){
		$('.btn-create-times').click(function(){
			openCreateTimes();
		});
		$('.btn-mod-times').click(function(){
			if(timer_access_selected_rowData == undefined){
				toast('提示消息', '请选择要编辑的数据', 'error');
				return;
			}
			openModTimes();
		});
		/*定时访问更多下拉列表*/
		$('#btn-times-more').click(function(e){
			var self = this;
			if($(this).next('ul').hasClass('none')){
				$(this).next('ul').removeClass('none');
				$(this).addClass('open');
				e.stopPropagation();
			}else{
				$(this).next('ul').addClass('none');
				$(this).removeClass('open');
				e.stopPropagation();
			}
			$(this).next('ul').mouseleave(function(){
				$(this).addClass('none');
			});
		});
	}
	//
	   /*弹出添加定时器窗口*/
	var openAddTimes = function(flag){
		if(isOpen('.win-add-times-network')){
			return false;
		};
		$('<div class="win-add-times-network"/>').appendTo(container);
		$('.win-add-times-network').window({
			width:800,
			height:646,
			title:'新增定时器',
			href:'network/add-times.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){
				var self = this;					
				var timesbox = new Array();//定时器
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					$(self).window('close');
				});
				$(".table-times td").click(function(){
					var trnum = $(".table-times tr").index($(this).parent()); //当前块所在行数
					var tdnum = $("td", $(".table-times tr").eq(trnum)).index($(this)); //当前块所在列数
					configTimeBox(trnum,tdnum);					
				});
				$(".btn-conserve").click(function(){
					toAddTimes();
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
			}
		});	
	}
	//设定定时器块位置
	function configTimeBox(trnum,tdnum) {
		var startn = (trnum - 1) * 2,
			endn = ((trnum - 1) * 2 + 8);
		var	topn = startn>16?275:((trnum - 1) * 27 + 50),
			leftn = ((tdnum - 1) * 91 + 89);
		if(endn > 24) endn = 24;
		if(tdnum >= 4) {
			$(".config-times-box").removeClass("leftarrow").removeClass("rightarrow").addClass("rightarrow");
		} else {
			$(".config-times-box").removeClass("leftarrow").removeClass("rightarrow").addClass("leftarrow");
		}
		$(".data-times-box").css({
			"top": topn + "px",
			"left": leftn + "px"
		});
		$("#starthour").val(startn + ":00");
		$("#endhour").val(endn + ":00");
		$("#hourstxt").html("").html(startn + ":00 - " + endn + ":00");
		$(".data-times-box").show();
		//点击确认，保存定时器
		$('.timer-ascertain').click(function(){
			toAddTimes();
		})
	}
	
    /*弹出定时器详情(周末定时器)窗口*/
	var openSeeTimes = function(flag){
		if(isOpen('.win-see-times-network')){
			return false;
		};
		$('<div class="win-see-times-network"/>').appendTo(container);
		$('.win-see-times-network').window({
			width:650,
			height:546,
			title:'定时器详情(周末定时器)',
			href:'network/see-times.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){
				var self = this;
				//取消窗口
				$(this).find('.btn-conserve').click(function(){
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
			}
		});	
	}

	/*创建定时访问窗口*/
	var openCreateTimes = function(flag){
		if(isOpen('.win-create-times-network')){
			return false;
		};
		$('<div class="win-create-times-network"/>').appendTo(container);
		$('.win-create-times-network').window({
			width:650,
			height:546,
			title:'定时访问策略',
			href:'network/create-times.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){
				var self = this;	
				//加载用户combotree
				loadUserCombotree();
				//加载MAC
				loadClientSelect();	
				//加载定时器列表
				loadTimesList();
				//查看定时器详情
				$('#btn-see-times').click(function(){
						openSeeTimes();
				});
				//添加定时器
				$('#btn-add-times').click(function(){
						openAddTimes();
				});
				//保存访问策略
				$(".btn-sava").click(function(){
					savaTimeacls();
				});
				//保存&应用访问策略
				$(".network-times-footer .btn-conserve").click(function(){
					//var site = getSite();
					//请求路径
					//var url = _IFA['network_get_component_timeacls']+'?org_ids='+site.id;
					
					savaTimeacls();
					//获取左侧节点id
					var node = $(tree).tree('getSelected');
					getSsidDetail(node,function(data){
						console.log(data)
						
						var timeacl_profile_ids = [];
						//timeacl_profile_ids.push(data.timeacl_profile_ids);
						timeacl_profile_ids.push(node.id);
						var datt = JSON.stringify({
							'timeacl_profile_ids':timeacl_profile_ids
						});
						console.log(datt)
						//绑定时间控制策略
						var url = _IFA['network_bind_time_ssids_id']+node.id+'/timeacls/bind';
						_ajax(url,'POST',datt,function(data){
							console.log(data)
						})
					})
					
				});
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					//$(self).window('close');
					destoryWindow();
				});

			},
			onClose:function(){
				destoryWindow();
				//$('.win-create-times-network').window('destory');
			}
		});	
	}
	/*编辑定时访问窗口*/
	var openModTimes = function(){
		var checked = $(table).datagrid('getChecked');
		if(isOpen('.win-mod-times-network')){
			return false;
		};
		$('<div class="win-mod-times-network"/>').appendTo(container);
		$('.win-mod-times-network').window({
			width:650,
			height:546,
			title:'定时访问策略',
			href:'network/mod-times.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){
				var self = this;	
				//加载用户combotree
				loadUserCombotree();
				//加载MAC
				loadClientSelect();				
				//加载定时器列表
				loadTimesList();
				//查看定时器详情
				$('#btn-see-times').click(function(){
					openSeeTimes();
				});
				//添加定时器
				$('#btn-add-times').click(function(){
					openAddTimes();
				});
				//保存（编辑页面）访问策略
				$(".btn-sava").click(function(){
					//savaTimeacls();
					updateTimeacls(network_timing_selected_id);
					
				});
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					//$(self).window('close');
					destoryWindow();
				});

			},
			onClose:function(){
				destoryWindow();
			}
		});	
	}
	/*编辑更新保存定时访问策略*/
	var updateTimeacls = function(id){
		var client_ids = $("#msClients");
	    var profile_name = $("#create-times-network").find('input[name="profile_name"]');
	    		//验证空值  	
	    		if(!profile_name.val()){
	    			flag = false;
	    			toast('提示信息','定时访问名称为必填项！','warning');
	    			profile_name.focus();
	    			return ;
	    		}
	    	    var profilelen = getByteLen(profile_name.val());
	    		if(profilelen<1||profilelen>64){
	    			flag = false;
	    			toast('提示信息','定时访问名称为1-64个字符！','warning');
	    			profile_name.focus();
	    			return ;
	    		}
	    			//验证MAC地址
	    		if(!client_ids.val()){
	    				flag = false;
	    				toast('提示信息','终端MAC地址为必填项！','error');
	    				return flag;
	    		}
		
			var selected = $(userTree).tree('getSelected');//????? 取不到
			var time_profile_id = $('#select-times option:selected').val();
			
			var timeaclsData = JSON.stringify({
				'org_id':getSite().id,
				'profile_name':profile_name.val(),
				'time_profile_id':time_profile_id,
				'client_profile_ids':client_ids.val(),	
				'user_group_ids':SSID.white_list_user_group_ids
			});

			var type = 'PUT';
			var url = _IFA['network_update_component_timeacls']+id;//"/config/component/timeacls";
			_ajax(url,type,timeaclsData,function(data){
				if(data.error_code==0){
					toast('提示消息','操作成功','success');
					$('.win-mod-times-network').window('close');
					$(table).empty();
					//刷新数据表格
					loadTable();
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
		
	}
	
	/*保存定时访问策略*/
	var savaTimeacls = function(){
		var client_ids = $("#msClients");
	    var profile_name = $("#create-times-network").find('input[name="profile_name"]');
	    		//验证空值  	
	    		if(!profile_name.val()){
	    			flag = false;
	    			toast('提示信息','定时访问名称为必填项！','warning');
	    			profile_name.focus();
	    			return ;
	    		}
	    	    var profilelen = getByteLen(profile_name.val());
	    		if(profilelen<1||profilelen>64){
	    			flag = false;
	    			toast('提示信息','定时访问名称为1-64个字符！','warning');
	    			profile_name.focus();
	    			return ;
	    		}
	    			//验证MAC地址
	    		if(!client_ids.val()){
	    				flag = false;
	    				toast('提示信息','终端MAC地址为必填项！','error');
	    				return flag;
	    		}
		
			var selected = $(userTree).tree('getSelected');//????? 取不到
			var time_profile_id = $('#select-times option:selected').val();
			var timeaclsData = JSON.stringify({
				'org_id':getSite().id,
				'profile_name':profile_name.val(),
				'time_profile_id':time_profile_id,
				'client_profile_ids':client_ids.val(),	
				'user_group_ids':SSID.white_list_user_group_ids
			});
			console.log(timeaclsData);

			var type = 'POST';
			var url = _IFA['network_create_component_timeacls'];//"/config/component/timeacls";
			_ajax(url,type,timeaclsData,function(data){
				if(data.error_code==0){
					toast('提示消息','操作成功','success');
					$('.win-create-times-network').window('close');
					$(table).empty();
					//刷新数据表格
					loadTable();
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
		
	}
	
	/*添加定时器*/
	var toAddTimes = function() {
	    var profile_name = $("#add-times-network").find('input[name="times-profile_name"]');
	    		//验证空值  	
	    		if(!profile_name.val()){
	    			flag = false;
	    			toast('提示信息','定时访问名称为必填项！','warning');
	    			profile_name.focus();
	    			return ;
	    		}
	    	    var profilelen = getByteLen(profile_name.val());
	    		if(profilelen<1||profilelen>64){
	    			flag = false;
	    			toast('提示信息','定时访问名称为1-64个字符！','warning');
	    			profile_name.focus();
	    			return ;
	    		}	
	    	var times = [{
			'day':1,//day,week,1,-7
			'start':0,
			'stop':120
		}]
		var timesData = JSON.stringify({
				'org_id':getSite().id,
				'profile_name':profile_name.val(),
				'items':times
			});
		
		var savaData = JSON.stringify(timesData);
		var type = 'POST';
		var url = _IFA['network_create_component_times'];
		_ajax(url, type, timesData, function(data) {
			if(data.error_code == 0) {
				toast('提示消息', '操作成功', 'success');
			} else {
				toast('提示消息', data.error_message, 'error');
			}
		});
	}
	


	/*获取访问时间控制策略列表*/
	var getTimeacls = function(options,callback){
		var url = _IFA['network_get_component_timeacls'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+getSite().id;
		if(serializeJson(options)){
			args += '&'+serializeJson(options);	
		}
		url = url + args
		console.log(url);
		_ajax(url,type,data,callback);
	};
	

	/*字符长度*/
	function getByteLen(val) {
		var len = 0;
		for(var i = 0; i < val.length; i++) {
			var a = val.charAt(i);
			if(a.match(/[^\x00-\xff]/ig) != null) {
				len += 2;
			} else {
				len += 1;
			}
		}
		return len;
	}

    /*加载表格数据*/
	var loadTable = function(options){
		getTimeacls(options,function(data){
			if(data.error_code==0){
				$(table).datagrid({
					data:data.list,
					columns:columns,
					fit:true,
					fitColumns:true,
					scrollbarSize:0,
					resizable:false,
					striped:false,
					onBeforeLoad:function(param){
						
					},
					onLoadSuccess:function(){
						if(options==undefined){
							options = {};
						}
						options.total = data.total;
						if(data.total==0){
							insertNodata(table);
						}else{
							$('.win-times .nodata').removeClass();
							$('.win-times footer').removeClass('none');
							$(table).datagrid('getPanel').find('.datagrid-header input').removeAttr('disabled');
						}
					},
					onSortColumn:function(sort, order){
					},
					onSelect:function(rowIndex,rowData){
						//选中的一行数据
						timer_access_selected_rowData = rowData;
						network_timing_selected_id = rowData.id;
						$(this).datagrid({
							 rowStyler:function(index,row){
							 	if(row.id == network_timing_selected_id){
							 		return 'background : #0086E5';
							 	}
							 }
						})
					}
				});
			}
		});
	};
	
	/*定义表结构*/
	var columns = [[
        {field:'connected',title:'状态',width:80,sortable:false,align:'center',formatter:function (value,row,index) {
        }},	

        {field:'profile_name ',title:'策略名称',width:120,sortable:false,align:'center',formatter:function(value,row,index){
        	return row.profile_name;
        }},

        {field:'user_group_ids ',title:'受限终端/用户',sortable:false,align:'center',formatter:function(value,row,index){
        }},

        {field:'time_profile_name',title:'定时器',sortable:false,align:'center',formatter:function(value,row,index){
        	var data = getCache('btn-mod-times',data);
        	var id = $('#select-times option').val();
        	return row.time_profile_id;
        }},

    ]]; 

/*定时访问禁用*/
	var btnEnableTimerAccess = function(){
		$('.win-times-nav .btn-delete-network').click(function(){
			var node = $(tree).tree('getSelected');
			getSsidDetail(node,function(data){
				console.log(data)
			})
			//差一步，获取选中的数据，判断它的状态是否为启动，只有启动时，才可以禁用
			var timeacl_profile_ids = [];
			if(timer_access_selected_rowData == undefined || timer_access_selected_rowData == ''){
				toast('提示消息', '请选择要禁用的数据', 'error');
				return;
			};
			
			var url = _IFA['network_unbind_ forbidden_time_ssids']+timer_access_selected_rowData.id+'/timeacls/unbind';
			var type = 'POST';
			_ajax(url,type,timeacl_profile_ids,function(data){
				console.log(data);
			})
			
			
		});
	}
	


	/*插入空信息*/
	var insertNodata =  function(table){
		$(table).datagrid('getPanel').find('.datagrid-body').append($('<div class="nodata"><img src="public/images/nodata.png" /><div>没有可以显示的数据</div></div>'));
		var height = $('.win-times .times-table-detail').height();
		$('.win-times .nodata').css({
			'height':height-50+'px',
			'line-height':height-50+'px'
		});
		$(table).datagrid('getPanel').find('.datagrid-header input').attr('disabled','disabled');
		$('.win-times footer').addClass('none');
	};	
	
	/*监听面板调整*/
	var listPanel = function(){
		//调整左侧树的滚动条
		var center = $('#app-network-layout').layout('panel','center');
		$(center).panel({
			onResize:function(width,height){
				var h = height-225;
				//控制表格
				$('.times-table-detail').css({
					height:h+'px',
					'overflow-y':'auto',
					'overflow-x':'none'
				});
			}
		});
	}
	/*绑定事件*/
	var bindEven = function(){
		
		//加载树
		loadTree();
		
		//新增无线网络
		btnCreateSsid();
		
		//配置网络
		btnUpdateSsid();
		
		//更多下拉列表
		btnMenuMore();
		
		//删除无线
		btnDeleteWireless();
		
		//启用
		enabledNetwork();
		
		//停用
		disabledNetwork();
		
		//切换总览摘要
		swichTraffic();
		
		//绑定图表加载事件
		bindEchartEven();
		
		/*监听面板调整*/
		listPanel();
		
		//去掉加载条
		MaskUtil.unmask();
		
		
	}
	
    
	/*运行主程序*/
	var run = function(){
		
		//初始化
		init();
		
		//绑定事件
		bindEven();
	}
	
	return {
		'run':function(){
			return run();
		}
	}

});


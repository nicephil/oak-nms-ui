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
define(['jquery','echarts','functions'],function($,echarts,_f){
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
	// ssidInfo : 记录对象
	// @baseInfo : 基本信息记录
	// @ssidInfo : 无线接入点记录
	// @accessInfo : 访问控制记录
	// @optionsInfo : 更多选项记录
	// @portalInfo : Portal信息记录
	// @userInfo : 选择用户记录
	// ------------
	var ssidInfo = {};
	
	//节点集合
	var nodes = '';
	
	//左侧面板对象
	var leftPanel = '';
	
    /*初始化*/
	var init = function(){

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
	
	/*编辑摘要基本信息*/
	var switchAbstractBase = function(){
		
		//绑定编辑切换效果
		$('.edit-base').click(function(){
			if($('.edit-base').hasClass('btn-edit-icon')){
				$('.edit-base').removeClass('btn-edit-icon');
				$('.edit-base').addClass('btn-save-icon');
				$('.abs-row .info-label').addClass('none');
				$('.abs-row .info-input').removeClass('none');
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
	var getFlow = function(node,func,options){console.log(node);
		if(node!=null){
			var url = _IFA['ap_get_device_ﬂow_stat']+node.id+'/flow';
			if(options!=undefined){
				if(options.length>0){
					url = url+'?'+options;
				}
				var type = 'GET';
				var data = '';
				_ajax(url,type,data,function(data){
					func(data);
				});
			}
		}
	}
	
	/*选择tab页面*/
    var selectTabs = function(){
        
		$('#network-tabs').tabs({
            onSelect:function(title,index){
            	switch(index){
					case 0:
						var node = $(tree).tree('getSelected');
						var data = getFlow(node,function(data){
							chartOne(data);
						});
						break;
					case 1:
					    var tab = $(this).tabs('getTab',1);
					    $(tab).panel({
					    	href:'network/abstract.html',
					    	onLoad:function(){
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
						break;
				}
			}
		});
	}
	
	//定义总览流量图表
	var chartOne = function(data){
	    console.log(data);
        var myChartOne = echarts.init(document.getElementById('network-traffic-echarts'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionOne = {
            title: {
            	text:'流量',
                left: '0%'
            },
            color: colors,
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data:['Total', 'Tx', 'Rx'],
                right: 12,
            },
            grid: {
                top: 40,
                bottom: 40,
                width:630,
                left:50
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap : false,
                    axisTick:{
                        alignWithLabel: true,
                    },
                    data: [ "Noon", "3PM", "6PM", "9PM", "Ninght", "3AM", "6AM", "9AM","Noon"]
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    nameGap: 10,
                    axisLabel: {
                        formatter: '{value} M'
                    }
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
                    data: [6, 9, 15, 26, 28]
                },
                {
                    name:'Tx',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: [2, 5, 3, 15, 12]
                },
                {
                    name:'Rx',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: [5, 5, 11, 18, 20]
                }

            ]
        };

        setInterval(function () {
            myChartOne.setOption(optionOne, true);
        },500);

        var myChartTwo = echarts.init(document.getElementById('network-client-echarts'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionTwo = {
            title: {
            	text:'终端',
                left: '0%'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
           grid: {
                top: 40,
                bottom: 40,
                width:630,
                left:50
            },
            legend: {
                data:['Total', '2.4G', '5G'],
                right: 12
            },
            xAxis: [
                {
                    type: 'category',
                    data: [ "Noon", "3PM", "6PM", "9PM", "Ninght", "3AM", "6AM", "9AM","Noon"],
                    axisPointer: {
                        type: 'shadow'
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    min: 0,
                    max: 250,
                    interval: 50,
                    nameGap: 10,
                    axisLabel: {
                        formatter: '{value} M'
                    }
                }
            ],
            series: [
                {
                    name:'Total',
                    type:'bar',
                    data:[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2]
                },
                {
                    name:'2.4G',
                    type:'bar',
                    data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2]
                },
                {
                    name:'5G',
                    type:'line',
                    yAxisIndex: 0,
                    symbol: 'none',
                    data:[6.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4]
                }
            ]
        };

        setInterval(function () {
            myChartTwo.setOption(optionTwo, true);
        },500);
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
			if(tree==apTree){
				number += data.device_number;
			}else{
				number += data.user_number;
			}
		});
		
		if(tree==apTree){
			ssidInfo.ap_number = number;
		}else{
			ssidInfo.user_number = number;
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
			result.push(0);
		}
		return $.unique(result);
	};
	
	/*验证树结构名称重复*/
	var checkSsidName = function(ssidName){;
		var nodes = getChildNode(tree);
		var flag = false;
		
		//配置无线暂时不验证
		if(ssidInfo.initStatus==1){
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
			var tmpText = '---';
			switch(data.auth_mode){
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
			$(ele).text(tmpText);
		});
	}
	
	/*
	 * 获取AP列表
	 */
	var getApList = function(func){
		var url = _IFA['ap_groups_list']+getSite().id;
		var type = 'GET';
		var data = '';
		_ajax(url,type,data,function(data){
			func(data);
		});
	}
	
	/*获取AP设备数*/
	var getApNumber = function(ids){
		getApList(function(data){
			if(ids.length){
				$.each(ids,function(index,val){
					if(val==0){
						//全选
						tmpText = '所有，共'+'个AP';
						return false;
					}else{
						'等共'+ids.length+'个组，共计'+'个AP';
						return false;
					}
				});
			};
		});
	}
	
	/*
	 * 设置摘要AP组
	 * */
	var setAbstractAp = function(ele,node){
		getSsidDetail(node,function(data){
			var tmpText = '---';
			if(data.network_policy_ids.length){
				$.each(data.network_policy_ids,function(index,val){
					if(val==0){
						//全选
						tmpText = '所有，共'+data.ap_number+'个AP';
						return false;
					}else{
						'等共'+data.network_policy_ids.length+'个组，共计'+'个AP';
						return false;
					}
				});
			};
			console.log(node);
			console.log(data);
			$(ele).text(tmpText);
		});
	}
	
	/*
	 * 设置摘要用户组
	 * */
	var setAbstractUser = function(ele,node){
		
	}
	
	/*设置摘要基本信息*/
	var setAbstractInfo = function(node){console.log(node);
		//更新ssid
		$('.ssid_name_label').text(node.profile_name);
		$('input[name="ssid_name"]').val(node.profile_name);
		
		//更新射频
		 $(".selector").find("option[value="+node.band+"]").prop("selected",true);
		 var text = $(".selector").find("option:selected").text();
		 $('.abs_band_label').text(text);
		 
		 //设置密码
		 $('.abs_key_label').text(node.key);
		 $('input[name="abs_key"]').val(node.key);
		 
	
		 /*
		  * VPW模式： auth=6, cipher=0
		  * WPA/WPA2模式：auth=5 cipher=5, key为相应输入值
		  * 开放模式： auth=0，cipher=0
		  */
		 if(node.auth==6 && node.cipher==0){
		 	$('.abs_auth_label').text('VPW模式');
		 }else if(node.auth==5 && node.cipher==5){
		 	$('.abs_auth_label').text('WPA/WPA2模式');
		 }else if(node.auth==0 && node.cipher==0){
		 	$('.abs_auth_label').text('开放模式');
		 }
		 
		 //更新其他终端
		 setOtherclientLabel('.otherclient-label',node);
		 
		 //更新Portal
		 setPortalLabel('.auth-label',node);
		 
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
		var selected = $(tree).tree('getSelected');console.log(selected);
		if(selected==null){
			$.each(data[0].children,function(index,data){
				if(data.children.length>0){
					var node = data.children[0];
					$(tree).tree('select',node.target);
					return false;
				}
			});	
		}
	};
	
	/*重新加载数据*/
	var loadTree = function(){
		/*载入树结构*/
		var url =  _IFA['network_list_ssids']+'?org_ids='+getSite().id+'&page_size=100';
		_ajax(url,'GET','',function(data){
			if(data.error_code==0){
				var root = getNetworkList(data,'缺省网络');
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
						setDefaultNode(data);
					},
					onBeforeSelect:function(node){
						//屏蔽父节点
						if(isNaN(node.id)){
							return false;
						};
						//屏蔽缺省网络
						if(node.id==0){
							return false;
						}
					},
					onSelect:function(node){console.log(node);
						//初始化总览
						var timestamp1 = (new Date()).valueOf()-86400000;//获取前一天的时间戳
						console.log(timestamp1);
						var data = getFlow(node,function(data){
							chartOne(data);
						},'begin_time='+1515729600);
						
						//设置摘要信息
						setAbstractInfo(node);
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
		$('.ssid-label').text(ssidInfo.ssid_name);
		
		//射频
		switch(ssidInfo.band){
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
		switch(ssidInfo.ssid_hide){
			case 0:
			$('.hide-ssid-label').text('否');
			break;
			case 1:
			$('.hide-ssid-label').text('是');
			break;
		}
		
		//带宽优先
		switch(ssidInfo.bandwidth_priority){
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
		console.log(ssidInfo.model);
		//模式
		switch(ssidInfo.model){
			case "1":
			$('.auth-label').text('虚拟私有无线网络(VPW)');
			$('.key-label').text('---');
			break;
			case "2":{
				$('.auth-label').text('WPA/WPA2共享密码');
				$('.key-label').text(ssidInfo.key);console.log('*****');
				break;
			}
			case "3":
			$('.auth-label').text('开放,不加密');
			$('.key-label').text('---');
			break;
		}
		
		//AP组
		var aps = ssidInfo.network_policy_ids;
		$.each(aps,function(index,data){
			if(data==0){
				result = '所有，共'+ssidInfo.ap_number+'个AP';
				return false;
			}else{
				//获取第一个AP的名称
				result = ssidInfo.first_ap.text+'等共'+aps.length+'个组，共计'+ssidInfo.ap_number+'个AP';
				return false;
			}
		});
		$('.ap-group-label').text(result);
		
		//用户组
		var users = ssidInfo.user_group_ids;
		if(users!=undefined){
			$.each(users,function(index,data){
				if(data==0){
					ssidInfo.user_number=ssidInfo.user_number==undefined?0:ssidInfo.user_number;
					result = '所有，共'+ssidInfo.user_number+'个用户';
					return false;
				}else{
					//获取第一个AP的名称
					result = ssidInfo.first_user.text+'等共'+users.length+'个组，共计'+ssidInfo.user_number+'个用户';
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
		if(ssidInfo.portalType==4){
			var shopId = $('input[name="shop_id"]');
			var appId = $('input[name="app_id"]');
			var secretKey = $('input[name="secret_key"]');
			if(shopId.val()=='' || appId.val()=='' || secretKey.val()==''){
				return false;
			}else{
				ssidInfo.shop_id = shopId.val();
				ssidInfo.app_id = appId.val();
				ssidInfo.secret_key = secretKey.val();
			}
		}
		return true;
	}
	
	/*验证登录有效时间*/
	var vertifyLoginTime = function(){
		var res = $('input[name="loginTime"]:checked');
		switch(res.val()){
			case '1':{
				ssidInfo.timeout_interval = -1;
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
				
				ssidInfo.timeout_interval = time;
				break;
			}
			case '3':{
				ssidInfo.timeout_interval = 365*24*60*60;
				break;
			}
		}
		return true;
	}
	
	/*设置配置预览数据-访问策略*/
	var setAccessPolicy = function(){
		var client = '';
		var portal = '';
		if(ssidInfo.model!=1 && ssidInfo.otherclient==1){
			switch(ssidInfo.portalType){
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
			switch(ssidInfo.otherclient){
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
			$('.need-portal-label').text('无');
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
					if(node.auth_mode==ssidInfo.auth_mode){
						ssidInfo.portal_template_id = node.id;
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
			profile_name:ssidInfo.ssid_name
		}
		$.extend(ssidInfo,info);
		
		//新增
		var url = _IFA['network_create_ssids'];
		var type = 'POST';
		
		ssidInfo.send_content = $('.options-textarea').val();
		
		//配置
		if(ssidInfo.initStatus==1){
			ssidInfo.ssid_id = ssidInfo.update_id;
		}
		
		var data = JSON.stringify(ssidInfo);
		
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				//重载树
				loadTree();
				
				toast('提示信息','操作成功','success');
				
				//给用户发送邮件
				if(flag==true){
					var sendContent = {};
					sendContent.id = data.id;
					
					sendContent.content = ssidInfo.send_content;console.log(ssidInfo);
					sendMail(sendContent);
				}
				
				//关闭窗口
				if(win.length>0){
					win.window('close');
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
				$('.win-options-network').window('close');
			}else{
				//不发邮件直接保存部署
				btnSaveSsid();
				$('.win-options-network').window('close');
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
		
		var node = $(tree).tree('getSelected');
		var url = _IFA['network_update_ssids'];
		var type = 'POST';
		var data = JSON.stringify({
			org_id:getSite().id,
			ssid_id:+node.id,
			profile_name:ssid_name,
			ssid_name:ssid_name,
			band:abs_band,
			key:abs_key,
			auth:node.auth,
			cipher:node.cipher
		});
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				//设置静态数据
				$('.ssid_name_label').text(ssid_name);
				$('.abs_band_label').text(band_text);
				$('.abs_key_label').text(abs_key);
				toast('提示消息','操作成功','success');
			}else{
				toast('提示消息',data.error_message,'error');
			}
		});
	}
	
	/*返现新增无线数据*/
	var loadSsidInfo = function(init){
		if(init==true){
			$('input[name="ssid_name"]').val(ssidInfo.ssid_name);
			setRadioStatus('band',ssidInfo.band);
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
		$.extend(ssidInfo,result);
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
   			ssidInfo.white_list_user_group_ids = [];
   			$.each(res,function(index,data){
   				ssidInfo.white_list_user_group_ids.push(data.id);
   			});
   		}else{
   			ssidInfo.white_list_user_group_ids = [];
   		}
	}
	
	/*
	 * 反选访问控制-用户组
	 * */
	var setAccessUserGroup = function(){
		var list = ssidInfo.white_list_user_group_ids;console.log(list);
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
		var access = ssidInfo.enable_access;
		var portal = ssidInfo.enable_portal;
		var name  = 'otherclient';
		
		if(access==1 && portal ==1){
			ssidInfo.otherclient = 1;
			selectRadio(name,1);
		}else if(access==0 && portal==0){
			ssidInfo.otherclient = 2;
			selectRadio(name,2);
		}else if(access=1 && portal==0){
			ssidInfo.otherclient = 3;
			selectRadio(name,3);
		}
	}
	
	/*设置其他终端选项*/
	var setOtherClient = function(){
		var result = getFormValue('#access-network');
		switch(result.otherclient){
			case '1':{
				ssidInfo.enable_access = 1;
				ssidInfo.enable_portal = 1;
				break;
			}
			case '2':{
				ssidInfo.enable_access = 0;
				ssidInfo.enable_portal = 0;
				break;
			}
			case '3':{
				ssidInfo.enable_access = 1;
				ssidInfo.enable_portal = 0;
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
		var auth = ssidInfo.auth_mode;
		var name = 'portalType';
		switch (auth){
			case 4:{
				ssidInfo.portalType = 1;
				selectRadio(name,1);
				break;
			}
			case 2:{
				ssidInfo.portalType = 2;
				selectRadio(name,2);
				break;
			}
			case 1:{
				ssidInfo.portalType = 3;
				selectRadio(name,3);
				break;
			}
			case 128:{
				ssidInfo.portalType = 4;
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
				if(ssidInfo.initStatus==1){
					//反选白名单用户组
					setAccessUserGroup();
				}
			   },
			   onShowPanel:function(){
			   	//移出下拉树列表，隐含面板
			   	$('.win-access-control-network *').not('.select-user-combotree,.combo *').mouseenter(function(){
			   		$('.select-user-combotree').combo('hidePanel');
			   	})
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
						ssidInfo.auth_mode = 4;
						break;
					}
					case '2':{
						ssidInfo.auth_mode = 2;
						break;
					}
					case '3':{
						ssidInfo.auth_mode = 1;
						break;
					}
					case '4':{
						ssidInfo.auth_mode = 128;
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
		var band = ssidInfo.band;
		var name = 'band';
		selectRadio(name,band);
		
		//隐藏ssid选中
		var ssid_hide = ssidInfo.ssid_hide;
		name = 'ssid_hide';
		selectCheckBox(name,ssid_hide);
		
		//带宽优先级
		var bandwidth_priority = ssidInfo.bandwidth_priority;
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
		var type = ssidInfo.type;
		var vlan = ssidInfo.vlan;
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
		var auth = ssidInfo.auth;
		var cipher = ssidInfo.cipher;
		var name = 'auth';
		
		//选择分支
		if(auth==6 && cipher==0){
			ssidInfo.model = 1;
			selectRadio(name,1);
		}else if(auth==5 && cipher==5){
			ssidInfo.model = 2;
			selectRadio(name,2);
		}else if(auth==0 && cipher==0){
			ssidInfo.model = 3;
			selectRadio(name,3);
		}
	}
	
	/*
	 * 反选无线接入点
	 * */
	var setSsidChecked = function(tree){
		
		var ids = [];
		if(tree==apTree){
			ids = ssidInfo.network_policy_ids;
		}else if(tree==userTree){
			ids = ssidInfo.user_group_ids;
		}
		
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
	var updateSsid = function(){console.log(ssidInfo);
		
		//设置修改状态
		ssidInfo.initStatus = 1;
		
		//设置网络名称
		$('.win-create-ssid-network input[name="ssid_name"]').val(ssidInfo.ssid_name);
		
		//设置高级配置
		setBandMore();
		
		//设置隧道模式
		setTunnelMode();
		
		//设置模式
		setNetworkMode();
	}
	
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
			onLoad:function(){
				var self = this;
				//设置新增状态
				ssidInfo.initStatus = 0;
				
				if(flag==true){
					$(this).panel('setTitle','配置网络');
					updateSsid();
				}
				//切换显示
				$('.win-create-ssid-network .link-position').click(function(){
					if($('.band-content').hasClass('none')){
						$('.band-content').removeClass('none');
					}else{
						$('.band-content').addClass('none');
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
				
				//绑定下一步事件
				$('.win-create-ssid-network .btn-next-network').click(function(){
					
					//获取基本信息数据
					var result = getFormValue('#create-ssid-network');
					
					//单独获取下隐藏SSID状态
					var ssid_hide = $('.ssid_hide').prop('checked');
					if(ssid_hide==false){
						ssid_hide = 0;
					}else{
						ssid_hide = 1;
					};
					
					//合并基本信息
					var baseInfo = {
						ssid_hide:ssid_hide,
					};
					$.extend(baseInfo,result,getTunnelValue(result.type),getModeValue(result.auth));
					console.log(baseInfo);
					//合并数据
					$.extend(ssidInfo,baseInfo);console.log(ssidInfo);
					ssidInfo.baseInfo = baseInfo;
					console.log(ssidInfo);
					
					//验证数据长度
					if(ssidInfo.ssid_name.length>1 && ssidInfo.ssid_name.length<32){
						//验证重名
						if(checkSsidName(ssidInfo.ssid_name)){
							toast('信息提示','SSID名称重复错误！','error');
							return false;
						}
					}else{
						toast('信息提示','SSID名称错误！','error');
						return false;
					}
					
					//隐藏当前窗口
					hideWindow('.win-create-ssid-network');
					
					//打开选择网络窗口
					openSelectSsid();	
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					$(self).window('close');
				})
				
				//在修改状态时，加载info数据
				//loadSsidInfo(true);
			},
			onClose:function(){
				destoryWindow();
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
			onLoad:function(){console.log(ssidInfo);
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
					if(ssidInfo.model==1){
						
						//打开用户窗口
						openUserWindow();
						
					}else if(ssidInfo.model==2 || ssidInfo.model==3){
						
						//打开安全控制页面
						openAccessControl();
					}
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
			onLoad:function(){console.log(ssidInfo);
				var self = this;
				
				//加载用户树结构
				loadUserTree(true);
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
			onLoad:function(){console.log(ssidInfo);
				var self = this;
				
				
				//加载用户树结构
				loadUserTree(true);
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					//隐藏当前窗口
					hideWindow('.win-select-user-network');
					
					//分支选择
					if(ssidInfo.model==1){
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
					$.extend(ssidInfo,result);
					
					//隐藏当前窗口
					hideWindow('.win-select-user-network');

					//打开配置预览
					openConfig();
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
			},
			onLoad:function(){console.log(ssidInfo);
				var self = this;
				//写入获取数据展示
				setConfigInfo();
				
				//设置配置的访问策略
				setAccessPolicy();
				
				//上一步
				$(this).find('.btn-pre-network').click(function(){
					//隐藏当前窗口
					hideWindow('.win-config-network');
					
					//分支选择4条路线
					if(ssidInfo.model==1){
						//进入选择用户
						openUserWindow();
					}else {console.log(ssidInfo);
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
					$('.win-config-network').window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
			onLoad:function(){console.log(ssidInfo);
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
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
			onLoad:function(){console.log(ssidInfo);
				var self = this;
				
				//配置
				if(ssidInfo.initStatus == 1){
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
					$.extend(ssidInfo,result);
					
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
					
					console.log(ssidInfo);
					//隐藏窗口
					hideWindow('.win-portal-network');
					
					//选择分支
					if(ssidInfo.portalType==1){
						//进入选择用户
						openUserWindow();
					}else{
						//进入配置预览
						openConfig();
					}
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
			onLoad:function(){console.log(ssidInfo);
				var self = this;
				
				//配置
				if(ssidInfo.initStatus==1){
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
					$.extend(ssidInfo,result);
					
					//隐藏当前窗口
					hideWindow('.win-access-control-network');
					
					if(ssidInfo.otherclient==1){
						//进入portal设置
						openPortal();
					}else{
						//进入配置预览
						openConfig();
					}
				});
				
				//取消窗口
				$(this).find('.btn-cancel').click(function(){
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
				ssidInfo = node;
				
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
					$(self).window('close');
				});
			},
			onClose:function(){
				destoryWindow();
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
					ssidInfo = data;
					ssidInfo.update_id = selected.id;
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


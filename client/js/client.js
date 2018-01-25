/*========================================================*
 * @Title:			    client.js
 * @Description:		终端逻辑模块
 * 						在用户管理App中，org_id用的是parent
 * 						其他的App用的是id。
 * 						原因在于：用户管理属于整个Business的，但是其他资源是必须属于某个Site的。
 * @Author:         	corper
 * @Date:           	2018-1-4
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/
define(['jquery','functions'],function($,_f){
	/*全局变量*/
	var target = $('#page');
	var tree = ".client-user .client-div-left .group-list";
	var tree1 = ".client-user .client-div-left .group-list";
	var tree2 = ".client-user .client-div-right .group-list";
	var table = ".client-user .table-client";
	var table3 = "#app-client-particulars-layout .table-log";
	var pagination = '.client-user #pagination_client';
	var pagination1 = '#app-client-particulars-layout #pagination-client-details';
	var defPageNumber = 1;
	var defPageSize = 10;
	var defPageList = [10,20,50];
	var org_ids = '';
	var radios = '';
	var ssid_profile_ids = '';
	var device = '';
	var user_ids = '';
	var search = '';
	//加载类型 1终端过滤列表 2黑名单终端列表 3自定义地址簿终端
	var loadtype = 1;
	//地址簿id
	var dzid = 0;
	/*var result = '';*/
	var setPage = {};
	//最左边选项卡 1过滤页 2用户终端页 3地址簿页
	var clientinfo = '';
	var indexpage = 1;
	
	/*------------------第一页终端管理过滤页开始-----------------------------*/
	/*----------------在线网络终端过滤页右侧------------------------------------*/
	/*绑定事件*/
	var bindEven = function(){
	/*定义表结构*/
	var columns = [[
		{ field: 'id', title: '',checkbox:'true', align: 'center',formatter:
            function(value,row,index){
                var str = '';
                str += '<input type="checkbox" name="" value="'+value+'"/>';
                return str;
            }
        },
        {field:'vendor',title:'类型',align:'center',formatter:
            function(value,row,index){
                if(value==1){
                }else{
                    html="<img class='icon-row-disable' src='client/images/client_table_pc.png' />";
                    html+="<span class='tips easyui-panel'></span>";
                    return html;
                }
            }
        },
        {field:'hostname',title:'主机名',sortable:true,align:'center'},	

        {field:'client_name',title:'无线接入点',sortable:true,align:'center'},

        {field:'rate',title:'当前网速',sortable:true,align:'center',formatter:
            function(value,row,index){
                if(value < 1024){
                	value = value+'Kbps';
                }else{
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'uptime',title:'在线时间',align:'center',formatter:
            function(value,row,index){
                var day = Math.floor(value/86400);    
				var hour = Math.floor(value%86400/3600);    
				var minute = Math.floor(value%86400%3600/60);
				if(day != 0){
					var time = day+'天'+hour+'小时'+minute+'分';
				}
				if(day == 0){
					if(hour != 0){
						var time = hour+'小时'+minute+'分';
					}else{
						var time = minute+'分';
					}
				}
				return time;
            }
        },

        {field:'client_ip',title:'IP',sortable:true,hidden:true,align:'center'},

        {field:'wan_bytes',title:'外网流量',sortable:true,hidden:true,align:'center',formatter:
            function(value,row,index){
                if(value < 1024){
                	value = value+'bps';
                }else if(value >= 1024 && value < 1048576){
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Kbps';
                }else{
                	var zhi = value/1048576;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'local_bytes',title:'本地流量',sortable:true,hidden:true,align:'center',formatter:
            function(value,row,index){
                if(value < 1024){
                	value = value+'bps';
                }else if(value >= 1024 && value < 1048576){
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Kbps';
                }else{
                	var zhi = value/1048576;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'total_bytes',title:'总流量',sortable:true,hidden:true,align:'center',formatter:
            function(value,row,index){
                if(value < 1024){
                	value = value+'bps';
                }else if(value >= 1024 && value < 1048576){
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Kbps';
                }else{
                	var zhi = value/1048576;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'client_number',title:'',sortable:true,align:'center'},
    ]];

    /*加载表格数据*/
	var loadTable = function(options){
//		console.log(options)
		//加载默认配置项
		if(options!=undefined){
			options.page = defPageNumber;
			options.page_size = defPageSize;
			if(options.pageNumber!=undefined && options.pageSize!=undefined){
				options.page = options.pageNumber;
				options.page_size = options.pageSize;
			}
			if(search != ''){
				options.search = search;
			}
		}else{
			var options = {};
			options.page = defPageNumber;
			options.page_size = defPageSize;
			if(search != ''){
				options.search = search;
			}
		}
		setPage = options

		// //测试
		// var testList = {
		//   "list" : [ {
		//     "hostname" : "ChrisHedeMBP",
		//     "vendor" : "Apple, Inc.",
		//     "radio" : 1,
		//     "uptime" : 214511,
		//     "rate" : 57,
		//     "client_mac" : "784F4353C5E3",
		//     "client_name" : "ChrisHedeMBP",
		//     "device_mac" : "FCAD0F07F0B0",
		//     "device_name" : "峥嵘专用",
		//     "ssid_name" : "ZRTec",
		//     "uptime_str" : "3分34秒",
		//     "client_ip" : "172.16.0.114",
		//     "total_bytes" : 546141398,
		//     "local_bytes" : 253008314,
		//     "wan_bytes" : 293133084
		//   } ],
		//   "total" : 1,
		//   "error_code" : 0
		// };

		/*console.log(options);*/
		getClientList(options,function(data){	
			clientinfo = data;		
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
						//隐藏显示列
						// $(table).datagrid('hideColumn', 'uptime');
						// $(table).datagrid('showColumn', 'rate');
						$('.client-user footer').removeClass('none');
						if(options==undefined){
							options = {};
						}
						options.total = data.total;
						if(data.total==0){
							insertNodata(table);
						}else{
							$('.client-client .nodata').removeClass();
							$('.client-client footer').removeClass('none');
							$(table).datagrid('getPanel').find('.datagrid-header input').removeAttr('disabled');
						}
						// 获取终端右面列表鼠标经过事件
						$(".datagrid-row").mouseover(function(value){
							$(this).find('.tips').tooltip({
								position: 'top',
								content: '<div style="padding:10px;color:#4f5358; width:240px; line-height40px;">'
								+'<div class="client_tips_wl" style="margin-bottom:10px">'
								+'<span>本地限速：</span>'
								+'<span>20Mb/s</span>'
								+'<img src="./client/images/wl_sj.png" alt=""/ style="margin:0 10px; vertical-align:middle;">'
								+'<span>20Mb/s</span>'
								+'<img src="./client/images/wl_sj-d.png" alt=""/ style="margin:0 10px;" vertical-align:middle;">'
								+'</div>'
								+'<div class="client_tips_dz" style="margin-bottom:10px">'
								+'<span>IP地址绑定：</span>'
								+'<span>192.18.10.22</span>'
								+'</div>'
								+'</div>',
								onShow: function(){
									$(this).tooltip('tip').css({
										borderColor: '#ddd'
									});
								},
								onPosition: function(){
									$(this).tooltip('tip').css('left', $(this).offset().left);
									$(this).tooltip('arrow').css('left', 20);
								}
							});
						});

						/*右边类型下拉列表*/
						$('#app-client-layout .client-region-center td:last-child .datagrid-sort-icon').click(function(e){
							if($("#app-client-layout .menu_down").hasClass('none')){
								$("#app-client-layout .menu_down").removeClass('none');
								$("#app-client-layout .menu_down").addClass('open');
								e.stopPropagation();
							}else{
								$("#app-client-layout .menu_down").addClass('none');
								$("#app-client-layout .menu_down").removeClass('open');
								e.stopPropagation();
							}
							$("#app-client-layout .menu_down").mouseleave(function(){
								$(this).addClass('none');
							});
						});
						$("#app-client-layout .menu_down ul li").click(function(event) {
							$(this).children('.datagrid-cell-check').toggleClass("cell-checked");
							var lokeList = $(this).children('.datagrid-cell-check').children('input').val();
							if($(this).children('.datagrid-cell-check').hasClass('cell-checked')){
								if(lokeList == 1){
									$(table).datagrid('showColumn', 'vendor');
								}else if(lokeList == 2){
									$(table).datagrid('showColumn', 'hostname');
								}else if(lokeList == 3){
									$(table).datagrid('showColumn', 'rate');
								}else if(lokeList == 4){
									$(table).datagrid('showColumn', 'client_name');
								}else if(lokeList == 5){
									$(table).datagrid('showColumn', 'uptime');
								}else if(lokeList == 6){
									$(table).datagrid('showColumn', 'client_ip');
								}else if(lokeList == 7){
									$(table).datagrid('showColumn', 'wan_bytes');
								}else if(lokeList == 8){
									$(table).datagrid('showColumn', 'local_bytes');
								}else if(lokeList == 9){
									$(table).datagrid('showColumn', 'total_bytes');
								}
							}else{
								if(lokeList == 1){
									$(table).datagrid('hideColumn', 'vendor');
								}else if(lokeList == 2){
									$(table).datagrid('hideColumn', 'hostname');
								}else if(lokeList == 3){
									$(table).datagrid('hideColumn', 'rate');
								}else if(lokeList == 4){
									$(table).datagrid('hideColumn', 'client_name');
								}else if(lokeList == 5){
									$(table).datagrid('hideColumn', 'uptime');
								}else if(lokeList == 6){
									$(table).datagrid('hideColumn', 'client_ip');
								}else if(lokeList == 7){
									$(table).datagrid('hideColumn', 'wan_bytes');
								}else if(lokeList == 8){
									$(table).datagrid('hideColumn', 'local_bytes');
								}else if(lokeList == 9){
									$(table).datagrid('hideColumn', 'total_bytes');
								}
							}
						});

						//分页
						onTableSuccess(data,options);
					},
					onSortColumn:function(sort, order){
					},
					onCheck:function(rowIndex,rowData){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-cell-check').eq(rowIndex).addClass('cell-checked');
						//如果当前页全部被选中，把头也构上
						var checked = $(this).datagrid('getChecked');
						if(checked.length==options.page_size){
							$(panel).find('.datagrid-header-check').addClass('cell-checked');
						}
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked != ''){
							$('.client-region-center .btn-new-client').removeClass('disable-default');
							$('.client-region-center .btn-batch-new-client').removeClass('disable-default');
							$('.client-region-center .control-client').removeClass('disable-default');
							$('.client-region-center .speedlimit-client').removeClass('disable-default');
						}
					},
					onUncheck:function(rowIndex,rowData){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check').removeClass('cell-checked');
						$(panel).find('.datagrid-cell-check').eq(rowIndex).removeClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked == ''){
							$('.client-region-center .btn-new-client').addClass('disable-default');
							$('.client-region-center .btn-batch-new-client').addClass('disable-default');
							$('.client-region-center .control-client').addClass('disable-default');
							$('.client-region-center .speedlimit-client').addClass('disable-default');
						}
					},
					onCheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').addClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked != ''){
							$('.client-region-center .btn-new-client').removeClass('disable-default');
							$('.client-region-center .btn-batch-new-client').removeClass('disable-default');
							$('.client-region-center .control-client').removeClass('disable-default');
							$('.client-region-center .speedlimit-client').removeClass('disable-default');
						}
					},
					onUncheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').removeClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked == ''){
							$('.client-region-center .btn-new-client').addClass('disable-default');
							$('.client-region-center .btn-batch-new-client').addClass('disable-default');
							$('.client-region-center .control-client').addClass('disable-default');
							$('.client-region-center .speedlimit-client').addClass('disable-default');
						}
					}
				});
			}
		});
	};


	//终端黑名单表结构
	var columns2 = [[
		{ field: 'id', title: '',checkbox:'true', align: 'center',formatter:
            function(value,row,index){
                var str = '';
                str += '<input type="checkbox" name="" value="'+value+'"/>';
                return str;
            }
        },
        {field:'type',title:'类型',align:'center',formatter:
            function(value,row,index){
                if(value==1){
                }else{
                    html="<img class='icon-row-disable' src='client/images/client_table_pc.png' />";
                    html+="<span class='tips easyui-panel'></span>";
                    return html;
                }
            }
        },
        {field:'client_name',title:'主机名',sortable:true,align:'center'},

        {field:'client_mac',title:'MAC',sortable:true,align:'center'},	

        {field:'expire_at',title:'剩余冻结时间',align:'center',formatter:
            function(value,row,index){
            	if(value == 0){
            		return '永久';
            	}else{
	            	value = value/1000;
	                var day = Math.floor(value/86400);    
					var hour = Math.floor(value%86400/3600);    
					var minute = Math.floor(value%86400%3600/60);
					if(day != 0){
						var time = day+'天'+hour+'小时'+minute+'分';
					}
					if(day == 0){
						if(hour != 0){
							var time = hour+'小时'+minute+'分';
						}else{
							var time = minute+'分';
						}
					}
					return time;
				}
            }
        },
    ]];

	/*加载黑名单表格数据*/
	var loadTable2 = function(options){
//		console.log(options)
		//加载默认配置项
		if(options!=undefined){
			options.page = defPageNumber;
			options.page_size = defPageSize;
			if(options.pageNumber!=undefined && options.pageSize!=undefined){
				options.page = options.pageNumber;
				options.page_size = options.pageSize;
			}
			if(search != ''){
				options.search = search;
			}
		}else{
			var options = {};
			options.page = defPageNumber;
			options.page_size = defPageSize;
			if(search != ''){
				options.search = search;
			}
		}
		setPage = options

		getClientAclList(options,function(data){	
			clientinfo = data;	
			// console.log(data);	
			if(data.error_code==0){
				$(table).datagrid({
					data:data.list,
					columns:columns2,
					fit:true,
					fitColumns:true,
					scrollbarSize:0,
					resizable:false,
					striped:false,
					onBeforeLoad:function(param){
						
					},
					onLoadSuccess:function(){
						//隐藏显示列
						// $(table).datagrid('hideColumn', 'uptime');
						// $(table).datagrid('showColumn', 'rate');
						$('.client-user footer').removeClass('none');
						if(options==undefined){
							options = {};
						}
						options.total = data.total;
						if(data.total==0){
							insertNodata(table);
						}else{
							$('.client-client .nodata').removeClass();
							$('.client-client footer').removeClass('none');
							$(table).datagrid('getPanel').find('.datagrid-header input').removeAttr('disabled');
						}
						//分页
						onTableSuccess(data,options);
					},
					onSortColumn:function(sort, order){
					},
					onCheck:function(rowIndex,rowData){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-cell-check').eq(rowIndex).addClass('cell-checked');
						//如果当前页全部被选中，把头也构上
						var checked = $(this).datagrid('getChecked');
						if(checked.length==options.page_size){
							$(panel).find('.datagrid-header-check').addClass('cell-checked');
						}
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked != ''){
							$('.client-region-center .edit-client').removeClass('disable-default');
							$('.client-region-center .remove-client').removeClass('disable-default');
						}
					},
					onUncheck:function(rowIndex,rowData){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check').removeClass('cell-checked');
						$(panel).find('.datagrid-cell-check').eq(rowIndex).removeClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked == ''){
							$('.client-region-center .edit-client').addClass('disable-default');
							$('.client-region-center .remove-client').addClass('disable-default');
						}
					},
					onCheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').addClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked != ''){
							$('.client-region-center .edit-client').removeClass('disable-default');
							$('.client-region-center .remove-client').removeClass('disable-default');
						}
					},
					onUncheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').removeClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked == ''){
							$('.client-region-center .edit-client').addClass('disable-default');
							$('.client-region-center .remove-client').addClass('disable-default');
						}
					}
				});
			}
		});
	};


	/*定义地址簿终端列表结构*/
	var columns3 = [[
		{ field: 'id', title: '',checkbox:'true', align: 'center',formatter:
            function(value,row,index){
                var str = '';
                str += '<input type="checkbox" name="" value="'+value+'"/>';
                return str;
            }
        },
        {field:'vendor',title:'类型',align:'center',formatter:
            function(value,row,index){
                if(value==1){
                }else{
                    html="<img class='icon-row-disable' src='client/images/client_table_pc.png' />";
                    html+="<span class='tips easyui-panel'></span>";
                    return html;
                }
            }
        },
        {field:'hostname',title:'主机名',sortable:true,align:'center'},	

        {field:'client_mac',title:'MAC',sortable:true,align:'center'},

        {field:'rate',title:'当前网速',sortable:true,align:'center',formatter:
            function(value,row,index){
            	if(value == undefined){
            		return '--';
            	}
                if(value < 1024){
                	value = value+'Kbps';
                }else{
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'uptime',title:'在线时间',align:'center',formatter:
            function(value,row,index){
            	if(value == undefined){
            		return '--';
            	}
                var day = Math.floor(value/86400);    
				var hour = Math.floor(value%86400/3600);    
				var minute = Math.floor(value%86400%3600/60);
				if(day != 0){
					var time = day+'天'+hour+'小时'+minute+'分';
				}
				if(day == 0){
					if(hour != 0){
						var time = hour+'小时'+minute+'分';
					}else{
						var time = minute+'分';
					}
				}
				return time;
            }
        },

        {field:'wan_bytes',title:'外网流量',sortable:true,hidden:true,align:'center',formatter:
            function(value,row,index){
            	if(value == undefined){
            		return '--';
            	}
                if(value < 1024){
                	value = value+'bps';
                }else if(value >= 1024 && value < 1048576){
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Kbps';
                }else{
                	var zhi = value/1048576;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'local_bytes',title:'本地流量',sortable:true,hidden:true,align:'center',formatter:
            function(value,row,index){
            	if(value == undefined){
            		return '--';
            	}
                if(value < 1024){
                	value = value+'bps';
                }else if(value >= 1024 && value < 1048576){
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Kbps';
                }else{
                	var zhi = value/1048576;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'total_bytes',title:'总流量',sortable:true,hidden:true,align:'center',formatter:
            function(value,row,index){
            	if(value == undefined){
            		return '--';
            	}
                if(value < 1024){
                	value = value+'bps';
                }else if(value >= 1024 && value < 1048576){
                	var zhi = value/1024;
                	value = zhi.toFixed(1);
                	value = value+'Kbps';
                }else{
                	var zhi = value/1048576;
                	value = zhi.toFixed(1);
                	value = value+'Mbps';
                }
                return value;
            }
        },

        {field:'client_number',title:'',sortable:true,align:'center'},
    ]];

    /*加载表格数据*/
	var loadTable3 = function(options){
//		console.log(options)
		//加载默认配置项
		if(options!=undefined){
			options.page = defPageNumber;
			options.page_size = defPageSize;
			if(options.pageNumber!=undefined && options.pageSize!=undefined){
				options.page = options.pageNumber;
				options.page_size = options.pageSize;
			}
			if(search != ''){
				options.search = search;
			}
		}else{
			var options = {};
			options.page = defPageNumber;
			options.page_size = defPageSize;
			if(search != ''){
				options.search = search;
			}
		}
		setPage = options

		/*console.log(options);*/
		getClientProfilesList(options,function(data){	
			clientinfo = data;	
			// console.log(data);	
			if(data.error_code==0){
				$(table).datagrid({
					data:data.list,
					columns:columns3,
					fit:true,
					fitColumns:true,
					scrollbarSize:0,
					resizable:false,
					striped:false,
					onBeforeLoad:function(param){
						
					},
					onLoadSuccess:function(){
						//隐藏显示列
						// $(table).datagrid('hideColumn', 'uptime');
						// $(table).datagrid('showColumn', 'rate');
						$('.client-user footer').removeClass('none');
						if(options==undefined){
							options = {};
						}
						options.total = data.total;
						if(data.total==0){
							insertNodata(table);
						}else{
							$('.client-client .nodata').removeClass();
							$('.client-client footer').removeClass('none');
							$(table).datagrid('getPanel').find('.datagrid-header input').removeAttr('disabled');
						}

						/*右边类型下拉列表*/
						$('#app-client-layout .client-region-center td:last-child .datagrid-sort-icon').click(function(e){
							if($("#app-client-layout .menu_down").hasClass('none')){
								$("#app-client-layout .menu_down").removeClass('none');
								$("#app-client-layout .menu_down").addClass('open');
								e.stopPropagation();
							}else{
								$("#app-client-layout .menu_down").addClass('none');
								$("#app-client-layout .menu_down").removeClass('open');
								e.stopPropagation();
							}
						});
						$("#app-client-layout .menu_down ul li").click(function(event) {
							$(this).children('.datagrid-cell-check').toggleClass("cell-checked");
							var lokeList = $(this).children('.datagrid-cell-check').children('input').val();
							if($(this).children('.datagrid-cell-check').hasClass('cell-checked')){
								if(lokeList == 1){
									$(table).datagrid('showColumn', 'vendor');
								}else if(lokeList == 2){
									$(table).datagrid('showColumn', 'hostname');
								}else if(lokeList == 3){
									$(table).datagrid('showColumn', 'client_mac');
								}else if(lokeList == 4){
									$(table).datagrid('showColumn', 'rate');
								}else if(lokeList == 5){
									$(table).datagrid('showColumn', 'uptime');
								}else if(lokeList == 6){
									$(table).datagrid('showColumn', 'wan_bytes');
								}else if(lokeList == 7){
									$(table).datagrid('showColumn', 'local_bytes');
								}else if(lokeList == 8){
									$(table).datagrid('showColumn', 'total_bytes');
								}
							}else{
								if(lokeList == 1){
									$(table).datagrid('hideColumn', 'vendor');
								}else if(lokeList == 2){
									$(table).datagrid('hideColumn', 'hostname');
								}else if(lokeList == 3){
									$(table).datagrid('hideColumn', 'client_mac');
								}else if(lokeList == 4){
									$(table).datagrid('hideColumn', 'rate');
								}else if(lokeList == 5){
									$(table).datagrid('hideColumn', 'uptime');
								}else if(lokeList == 6){
									$(table).datagrid('hideColumn', 'wan_bytes');
								}else if(lokeList == 7){
									$(table).datagrid('hideColumn', 'local_bytes');
								}else if(lokeList == 8){
									$(table).datagrid('hideColumn', 'total_bytes');
								}
							}
						});
						//分页
						onTableSuccess(data,options);
					},
					onSortColumn:function(sort, order){
					},
					onCheck:function(rowIndex,rowData){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-cell-check').eq(rowIndex).addClass('cell-checked');
						//如果当前页全部被选中，把头也构上
						var checked = $(this).datagrid('getChecked');
						if(checked.length==options.page_size){
							$(panel).find('.datagrid-header-check').addClass('cell-checked');
						}
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked != ''){
							$('.client-region-center .edit-client').removeClass('disable-default');
							$('.client-region-center .remove-client').removeClass('disable-default');
						}
					},
					onUncheck:function(rowIndex,rowData){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check').removeClass('cell-checked');
						$(panel).find('.datagrid-cell-check').eq(rowIndex).removeClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked == ''){
							$('.client-region-center .edit-client').addClass('disable-default');
							$('.client-region-center .remove-client').addClass('disable-default');
						}
					},
					onCheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').addClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked != ''){
							$('.client-region-center .edit-client').removeClass('disable-default');
							$('.client-region-center .remove-client').removeClass('disable-default');
						}
					},
					onUncheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').removeClass('cell-checked');
						//判断右侧按钮
						var clientchecked = getCheckedClinet();
						if(clientchecked == ''){
							$('.client-region-center .edit-client').addClass('disable-default');
							$('.client-region-center .remove-client').addClass('disable-default');
						}
					}
				});
			}
		});
	};

	/*表数据加载成功事件处理*/
	var onTableSuccess = function(data,options){
		//分页处理
		var pageSize = defPageSize;
		if(options != undefined && options.pageSize !=undefined){
			pageSize = options.pageSize;
		}
		var pageNumber = defPageNumber;
		if(options != undefined && options.pageNumber !=undefined){
			pageNumber = options.pageNumber;
		}
		var optPage = {
			paginationId:pagination,
			total:data.total,
			pageNumber:pageNumber,
			pageSize:pageSize,
			pageList:defPageList
		}
		/*console.log(optPage)*/
		loadPagination(optPage);
		//去掉加载条
		MaskUtil.unmask();
	}
	/*加载分页*/
	var loadPagination = function(options){
		//分页ID
		var paginationId = options.paginationId;
		var total = options.total;
		var pageNumber = options.pageNumber;
		var pageSize = options.pageSize;
		var pageList = defPageList;
		$(paginationId).pagination({
		    total:total,
		    pageNumber:pageNumber,
		    pageSize:pageSize,
		    pageList:pageList,
		    displayMsg:'共{total}条记录',
		    layout:['first','prev','links','next','last','sep','list','info','sep','refresh'],
		    onSelectPage:function(pageNumber, pageSize){
		    	$(this).pagination('loading');
		    	var opt = {
					pageNumber:pageNumber,
					pageSize:pageSize,
					payetype:1
				}
				if(loadtype == 1){
					loadTable(opt);
				}else if(loadtype == 2){
					loadTable2(opt);
				}else{
					loadTable3(opt);
				}
				
				$(this).pagination('loaded');
		    },
			onRefresh:function(pageNumber, pageSize){
			},
			onChangePageSize:function(pageSize){
			}
		});
		//插入分页文件
		$('#app-client-layout .pagination-page-list').before('每页显示数');
	}


	/*检索用户*/
	var btnSearchUser = $('.client-region-center .btn-search-client').click(function(){
       	searchVal = $('.client-region-center .input-search').val()==undefined?'':$('.client-region-center .input-search').val();
       	search = searchVal;
       	if(loadtype == 1){
			loadTable();
		}else if(loadtype == 2){
			loadTable2();
		}else{
			loadTable3();
		}
    });
    /*键盘检索*/
	var keySearchUser = $('.client-region-center .input-search').unbind().bind('keydown',function(event){
        event.stopPropagation();
        var self = this;
        if(event.keyCode ==13){
           $('.client-region-center .btn-search-client').click();
        }
    });
    /*失焦检索*/
    $('.client-region-center .input-search').on('input',function(){
    	$('.client-region-center .btn-search-client').click();
    });

	/*添加更多下拉列表*/
	var addmenuclientmore = function(){
		$('.btn-menu-client-more').click(function(e){
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

	/*获取选中记录*/
	var getCheckedClinet = function(){
		return $(table).datagrid('getChecked');
	}

	/*----------------在线网络终端过滤页左侧------------------------------------*/

	//左侧清除按钮点击事件
	$('.nav_title_right').click(function() {
		clearSelect();
		loadTable();
	})

	//加载左侧筛选条件列表
	var loadSelectList = function(){
		//加载网络列表
		loadNetworklist();
		//加载设备列表
		loadAplist();
		//加载用户列表
		loadUserlist();
	}

	//加载网络列表
	var loadNetworklist = function(){
		var org_id = getOrg(target.data('org')).id;
		//加载网络列表
		getNetworklist(org_id,function(data1){
			for (var i in data1['list'])
            {
            	// alert(data1['list'][i]['id']);
            	var htmlwebsite = '<div class="client_group_list client_website_id">';
					htmlwebsite+= '<div style="" class="datagrid-cell-check"><input type="checkbox" name="xz" value="'+data1['list'][i]['id']+'"></div>';
					htmlwebsite+= '<span>'+data1['list'][i]['profile_name']+'</span></div>';				
                $("#client_website").append(htmlwebsite);
            }
			$('.client_website_id').click(function(event) {
				$(this).children('.datagrid-cell-check').toggleClass("cell-checked");
				var client_website_id = $(this).find('input').val();
				ssid_profile_ids = clientParamsSave(ssid_profile_ids,client_website_id,1);
	   			loadTable();
			});
		})
	}

	//加载设备列表
	var loadAplist = function(){
		var org_id = getOrg(target.data('org')).id;
		//加载设备列表
		getAplist(org_id,function(data2){
			for (var i in data2['list'])
            {
            	var htmlap = '<div class="client_group_list client_ap_id">';
					htmlap+= '<div style="" class="datagrid-cell-check"><input type="checkbox" name="xz" value="'+data2['list'][i]['mac']+'"></div>';
					htmlap+= '<span>'+data2['list'][i]['device_name']+'</span></div>';				
                $("#client_ap").append(htmlap);
            }
            $('.client_ap_id').click(function(event) {
				$(this).children('.datagrid-cell-check').toggleClass("cell-checked");
				var client_ap_id = $(this).find('input').val();
				device = clientParamsSave(device,client_ap_id,1);
	   			loadTable();
			});
		})
	}

	//加载用户列表
	var loadUserlist = function(){
		var org_id = getOrg(target.data('org')).id;
		//加载用户列表
		getUserlist(org_id,function(data3){
			for (var i in data3['list'])
            {
            	if(data3['list'][i]['phone'] != ''){
            		data3['list'][i]['username'] = data3['list'][i]['phone'];
            	}else if(data3['list'][i]['email'] != ''){
            		data3['list'][i]['username'] = data3['list'][i]['email'];
            	}else{
            		data3['list'][i]['username'] = data3['list'][i]['first_name'];
            	}
            	var htmluserlist = '<div class="client_group_list client_user_id">';
					htmluserlist+= '<div style="" class="datagrid-cell-check"><input type="checkbox" name="xz" value="'+data3['list'][i]['id']+'"></div>';
					htmluserlist+= '<span>'+data3['list'][i]['username']+'</span></div>';				
                $("#client_user").append(htmluserlist);
            }
            $('.client_user_id').click(function(event) {
				$(this).children('.datagrid-cell-check').toggleClass("cell-checked");
				var client_user_id = $(this).find('input').val();
				user_ids = clientParamsSave(user_ids,client_user_id,1);
	   			loadTable();
			});
		})
	}

	// 左侧射频列表点击选中状态
	var getCheck=function(){
		$('.client_frequency_id').click(function(event) {
			$(this).children('.datagrid-cell-check').toggleClass("cell-checked");
			var client_frequency_id = $(this).find('input').val();
			radios = clientParamsSave(radios,client_frequency_id,1);
			//刷新右侧列表
			loadTable();
		});
	}


	//终端过滤数字参数处理(有时多个逗号，使用时处理)
	//type 1处理成数字类型，2字符串类型
	var clientParamsSave = function(params,value,type){
		var res = params.indexOf(value);
		if(type == 1){
			if(res == -1){
	            params = params + "," + value;
	        }else{
	        	value = "," + value;
	            params = params.replace(value,'');
	        }
	        params = params.trim();
	    }else{
	    	if(res == -1){
	            params = params + "," + "'" +value+ "'";
	        }else{
	        	value = "," + "'" +value+ "'";
	            params = params.replace(value,'');
	        }
	        params = params.trim();
	    }
        return params;
	}

	//终端过滤参数处理(处理逗号)
	var clientParamsSave1 = function(params){
		var first = params.substring(0,1);
        if(first == ','){
        	params = params.substring(1,params.length);
        }
        var last = params.substring(params.length-1,params.length);
        if(last == ','){
        	params = params.substring(0,params.length-1);
        }
        if(params != ''){
        	params1 = ''+params+'';
        }else{
        	params1 = params;
        }
        return params1;
	}
    
    //获取终端列表
	var getClientList = function(options,callback){
		var org_id = getOrg(target.data('org')).id;
		var args = org_id;
		if(serializeJson(options)){
			args += '&'+serializeJson(options);
		}
		//获取射频参数
		radios1 = clientParamsSave1(radios);
		radios2 = radios1.split(",");
		if(radios1 != ''){
			for (var i in radios2)
	        {
	        	args = args + '&radios='+radios2[i];
	        }
		}

		//获取网络参数
		ssid_profile_ids1 = clientParamsSave1(ssid_profile_ids);
		ssid_profile_ids2 = ssid_profile_ids1.split(",");
		if(ssid_profile_ids1 != ''){
			for (var i in ssid_profile_ids2)
	        {
	        	args = args + '&ssid_profile_ids='+ssid_profile_ids2[i];
	        }
		}
		//获取设备参数
		device1 = clientParamsSave1(device);
		device2 = device1.split(",");
		if(device1 != ''){
			for (var i in device2)
	        {
	        	args = args + '&device_macs='+device2[i];
	        }
		}
		//获取用户参数
		user_ids1 = clientParamsSave1(user_ids);
		user_ids2 = user_ids1.split(",");
		if(user_ids1 != ''){
			for (var i in user_ids2)
	        {
	        	args = args + '&user_ids='+user_ids2[i];
	        }
		}

		
		var url = _IFA['client__get_client_list'];
		var type = 'GET';
		var data = '';
		url = url + args;
		_ajax(url,type,data,callback);
	};

	//获取网络列表
	var getNetworklist = function(options,callback){
		var url = _IFA['network_list_ssids'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+options;
		url = url + args;
		_ajax(url,type,data,callback);
	};

	//获取设备列表
	var getAplist = function(options,callback){
		var url = _IFA['ap_get_device_list'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+options;
		url = url + args;
		_ajax(url,type,data,callback);
	};

	//获取用户列表
	var getUserlist = function(options,callback){
		var url = _IFA['user_local'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+options;
		url = url + args;
		_ajax(url,type,data,callback);
	};
	/*----------------在线网络终端过滤页左侧------------------------------------*/

	/*------------------右侧点击弹出弹窗---------------------------------*/
	/*添加到地址簿窗口*/
	var winNewClient = $('.btn-new-client').click(function(){
		var clientchecked = getCheckedClinet();
		if(clientchecked == ''){
			// toast('提示消息','请选择要添加的终端','error');
			return false;
		}
		var org_id = getOrg(target.data('org')).id;
		onOpenDelete('.win-add-client');
		$('.win-add-client').window({
			width:650,
			height:425,
			title:'添加终端到地址簿',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				//载入地址簿列表
				$(".win-add-client #client_dz_list").html('');
				getClientdzList(org_id,function(data){
					for (var i in data['list'])
		            {
		            	var htmlclientdz = '<div class="dz_list" dzid="'+data['list'][i]['id']+'">'
							htmlclientdz+= '<span>'+data['list'][i]['profile_name']+'</span>';
							htmlclientdz+= '</div>';				
		                $(".win-add-client #client_dz_list").append(htmlclientdz);
		            }
		            //设置默认值
		            $('.win-add-client .dz_list:first-child').addClass('current');
		            //选中的地址簿id
		            dzid = $('.win-add-client .dz_list:first-child').attr('dzid');
				});

				//添加输入框终端名称
				var clientchecked = getCheckedClinet();
				var clientcheckednum = clientchecked.length;
				if(clientcheckednum == 1){
					$('.win-add-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']);
				}else{
					$('.win-add-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']+"”等共"+clientcheckednum+"个终端");
				}
				
			},
			onClose:function(){
				clearForm('#create-client');
				// closeDateTimer();
				$('.error-name,.error-email,.error-phone,.error-password').css({
					'display':'none'
				});
				$('.name,.email,.password,.phone').css({
					'border':'1px solid #ededed'
				})
				$('.win-add-client .select-box').val("+86");
				$('.select-time-no').attr("checked",true);
				trueInput($('.phone'));
				trueInput($('.password'));
				trueInput($('.name'));
				trueInput($('.email'));
				$('.select-time-no-box').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
				$('.select-radio-box').addClass('checkRadio-unchecked');
			}
		});		
		$(".name").focus();
	});

	/*获取终端地址簿*/
	var getClientdzList = function(options,callback){
		var url = _IFA['client__get_dz_list'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+options;
		url = url + args;
		_ajax(url,type,data,callback);
	};

	//终端添加地址簿，绑定点击地址簿事件
	$(document).on("click",".win-add-client .dz_list",function(){
		$(this).addClass('current').siblings().removeClass('current');
		//改变选中的地址簿值
		dzid = $(this).attr('dzid');
	})

	//添加终端到地址簿保存
	$('.win-add-client .but-conserve').click(function() {
		//获取选中
		var clientchecked = getCheckedClinet();
		console.log(clientchecked);
		var list = [];
		var param = {};
		$.each(clientchecked,function(index,data){
			list.push({
				'hostname':clientchecked[index].hostname,
				'client_mac':clientchecked[index].client_mac
			});
		});
		param.list = list;
		console.log(param);
		console.log(list);
		// //拼接参数
		var data = JSON.stringify(param);
		var url = _IFA['client__add_client_dz']+'/'+dzid+'/clients';
		
		var type = 'POST';
		_ajax(url,type,data,function(data){
			console.log(data);
			if(data.error_code!=0){
				toast('提示信息',data.error_message,'error');
				flag = false;
			}else{
				toast('提示消息','操作成功','success');
				refresh();
				closeWindow('.win-add-client');
			}
		});
	});

	/*添加到用户窗口*/
	var winBatchNewClient = $('.btn-batch-new-client').click(function(){
		var clientchecked = getCheckedClinet();
		if(clientchecked == ''){
			// toast('提示消息','请选择要添加的终端','error');
			return false;
		}
		var org_id = getOrg(target.data('org')).id;
		onOpenDelete('.win-add-batch-client');
		$('.win-add-batch-client').window({
			width:650,
			height:285,
			title:'添加终端到用户',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				//载入用户列表
				getUserlist(org_id,function(data){
					console.log(data);
					for (var i in data['list'])
		            {
		            	if(data['list'][i]['phone'] != ''){
		            		data['list'][i]['username'] = data['list'][i]['phone'];
		            	}else if(data['list'][i]['email'] != ''){
		            		data['list'][i]['username'] = data['list'][i]['email'];
		            	}else{
		            		data['list'][i]['username'] = data['list'][i]['first_name'];
		            	}
		            	var htmlclientuser = '<li class="client_user_list" userid="'+data['list'][i]['id']+'">'+data['list'][i]['username']+'</li>';		
		                $("#client_add_user_list").append(htmlclientuser);
		                if(i == 0){
		                	//设置默认值
		            		$('.win-add-batch-client .username').val(data['list'][i]['username']);
		            		userid = data['list'][i]['id'];
		            		// alert(userid);
		                }
		            }

		            //添加输入框终端名称
					var clientchecked = getCheckedClinet();
					var clientcheckednum = clientchecked.length;
					if(clientcheckednum == 1){
						$('.win-add-batch-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']);
					}else{
						$('.win-add-batch-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']+"”等共"+clientcheckednum+"个终端");
					}
				});
			},
			onClose:function(){
				// closeDateTimer();
			}
		});		
	});
	
	/*添加用户-选择用户*/
	var btnclientUser = $('.arrow_down').click(function(e){
		if($(this).next('ul').hasClass('none')){
			$(this).next('ul').removeClass('none');
			$(this).addClass('open');
			$(".client_userlist .dropdown-menu li").click(function(event) {
				var text=$(this).text();
				$(".client_userlist .input-text").val(text);
			});
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

	//用户添加终端，点击选中用户
	$(document).on("click",".win-add-batch-client .client_user_list",function(){
		//改变选中的用户id值
		userid = $(this).attr('userid');
		// alert(userid);
	})

	//添加终端到用户保存
	$('.win-add-batch-client .but-conserve').click(function() {
		var org_id = getOrg(target.data('org')).id;
		//获取选中
		var clientchecked = getCheckedClinet();

		var list = [];
		var param = {};
		param.org_id = org_ids;
		$.each(clientchecked,function(index,data){
			list.push({
				'hostname':clientchecked[index].hostname,
				'client_mac':clientchecked[index].client_mac,
				'user_id':userid
			});
		});
		param.list = list;
		console.log(param);
		//拼接参数
		var data = JSON.stringify(param);
		var url = _IFA['client__add_client_user'];
		var type = 'POST';
		_ajax(url,type,data,function(data){
			console.log(data);
			if(data.error_code!=0){
				toast('提示信息',data.error_message,'error');
				flag = false;
			}else{
				toast('提示消息','操作成功','success');
				refresh();
				closeWindow('.win-add-batch-client');
			}
		});
	});

	/*添加到控制窗口*/
	var winNewClient = $('.control-client').click(function(){
		var clientchecked = getCheckedClinet();
		if(clientchecked == ''){
			// toast('提示消息','请选择要添加的终端','error');
			return false;
		}
		onOpenDelete('.win-control-client');
		$('.win-control-client').window({
			width:650,
			height:390,
			title:'终端控制',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				initRadio();
				//添加输入框终端名称
				var clientchecked = getCheckedClinet();
				var clientcheckednum = clientchecked.length;
				if(clientcheckednum == 1){
					$('.win-control-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']);
				}else{
					$('.win-control-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']+"”等共"+clientcheckednum+"个终端");
				}
			},
			onClose:function(){
				clearForm('#create-client');
				// closeDateTimer();
				$('.error-name,.error-email,.error-phone,.error-password').css({
					'display':'none'
				});
				$('.name,.email,.password,.phone').css({
					'border':'1px solid #ededed'
				})
				$('.win-add-client .select-box').val("+86");
				$('.select-time-no').attr("checked",true);
				trueInput($('.phone'));
				trueInput($('.password'));
				trueInput($('.name'));
				trueInput($('.email'));
				$('.select-time-no-box').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
				$('.select-radio-box').addClass('checkRadio-unchecked');
			}
		});		
		$(".name").focus();
	});

	//添加终端访问控制
	$('.win-control-client .but-conserve').click(function() {
		var org_id = getOrg(target.data('org')).id;
		//获取选中
		var clientchecked = getCheckedClinet();
		var client_macs = [];
		$.each(clientchecked,function(index,data){
			client_macs.push(data.client_mac);
		});
		//获取选中类型
		var acltype = $('.win-control-client input:radio[name="type"]:checked').val();
		//终端登陆注销
		if(acltype == 1){
			var data = JSON.stringify({'client_macs':client_macs,'org_id':org_id});
			var url = _IFA['client__add_client_logout'];
			var type = 'POST';
			_ajax(url,type,data,function(data){
				if(data.error_code!=0){
					toast('提示信息',data.error_message,'error');
					flag = false;
				}else{
					toast('提示消息','操作成功','success');
					refresh();
					closeWindow('.win-control-client');
				}
			});
		}

		//终端永久冻结访问
		if(acltype == 3){
			var data = JSON.stringify({
				'client_macs':client_macs,
				'org_id':org_id,
				'type':3,
				'remain_time':0
			});
			var url = _IFA['client__add_client_acl'];
			var type = 'POST';
			_ajax(url,type,data,function(data){
				console.log(data);
				if(data.error_code!=0){
					toast('提示信息',data.error_message,'error');
					flag = false;
				}else{
					toast('提示消息','操作成功','success');
					refresh();
					closeWindow('.win-control-client');
				}
			});
		}

		//终端永久冻结访问
		if(acltype == 4){
			//获取天数
			var day = $('.win-control-client #day').val();
			if(day == ''){
				toast('提示信息',"请填写冻结时间天数",'error');
				return false;
			}
			//验证时间
			var reg = /^\d{1,3}$/;
            var res = reg.test(day);
            if(!res || (day < 0 || day > 365)){
            	toast('提示信息',"冻结天数0-364",'error');
            	return false;
            }
            //获取小时
			var hours = $('.win-control-client #hours').val();
			if(hours == ''){
				toast('提示信息',"请填写冻结时间小时数",'error');
				return false;
			}
			//验证时间
			var reg1 = /^\d{1,2}$/;
            var res1 = reg1.test(hours);
            if(!res1 || (hours < 0 || hours > 23)){
            	toast('提示信息',"冻结小时数0-23",'error');
            	return false;
            }
            //获取分钟
			var min = $('.win-control-client #min').val();
			if(min == ''){
				toast('提示信息',"请填写冻结时间分钟数",'error');
				return false;
			}
			//验证时间
			var reg2 = /^\d{1,2}$/;
            var res2 = reg2.test(min);
            if(!res2 || (min < 0 || min > 59)){
            	toast('提示信息',"冻结分钟数0-59",'error');
            	return false;
            }

            //获取当前utc时间戳
            date = new Date();
			var y =  date.getFullYear();    
			var m = date.getMonth() ;
			var d = date.getDate();
			var h= date.getHours();
			var M = date.getMinutes();
			var s = date.getSeconds();
            var nowtime = Date.UTC(y,m,d,h,M,s);
            var addtime = 86400000*day + 3600000*hours + 60000*min;
            //冻结时间
            // var remain_time = parseInt(nowtime) + parseInt(addtime);
            var remain_time = addtime;

			var data = JSON.stringify({
				'client_macs':client_macs,
				'org_id':org_id,
				'type':4,
				'remain_time':remain_time
			});
			var url = _IFA['client__add_client_acl'];
			var type = 'POST';
			_ajax(url,type,data,function(data){
				console.log(data);
				if(data.error_code!=0){
					toast('提示信息',data.error_message,'error');
					flag = false;
				}else{
					toast('提示消息','操作成功','success');
					refresh();
					closeWindow('.win-control-client');
				}
			});
		}

	});


	/*添加到限速窗口*/
	var winNewClient = $('.speedlimit-client').click(function(){
		var clientchecked = getCheckedClinet();
		if(clientchecked == ''){
			// toast('提示消息','请选择要添加的终端','error');
			return false;
		}
		onOpenDelete('.win-speedlimit-client');
		$('.win-speedlimit-client').window({
			width:650,
			height:455,
			title:'终端限速',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				//载入用户组列表
				getGroups(function(data){
					var subGroup = data.list[0].children;
					subGroup = filterData(subGroup);
					
				});
				initRadio();
				//添加输入框终端名称
				var clientchecked = getCheckedClinet();
				var clientcheckednum = clientchecked.length;
				if(clientcheckednum == 1){
					$('.win-speedlimit-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']);
				}else{
					$('.win-speedlimit-client .clientnameplaceholder').attr('placeholder',clientchecked[0]['client_name']+"”等共"+clientcheckednum+"个终端");
				}

				$(".client-box  .wl_xs ul li").click(function(event) {
					$(this).children('.datagrid-cell-check').toggleClass("cell-checked");
				});
			},
			onClose:function(){
				clearForm('#create-client');
				// closeDateTimer();
				$('.error-name,.error-email,.error-phone,.error-password').css({
					'display':'none'
				});
				$('.name,.email,.password,.phone').css({
					'border':'1px solid #ededed'
				})
				$('.win-add-client .select-box').val("+86");
				$('.select-time-no').attr("checked",true);
				trueInput($('.phone'));
				trueInput($('.password'));
				trueInput($('.name'));
				trueInput($('.email'));
				$('.select-time-no-box').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
				$('.select-radio-box').addClass('checkRadio-unchecked');
			}
		});		
		$(".name").focus();
	});

	//添加终端限速
	$('.win-speedlimit-client .but-conserve').click(function() {
		var org_id = getOrg(target.data('org')).id;
		//获取选中
		var clientchecked = getCheckedClinet();
		var client_macs = [];
		$.each(clientchecked,function(index,data){
			client_macs.push(data.client_mac);
		});

		//判断本地网络限速接收是否勾选
		if($('.win-speedlimit-client #localreceive').hasClass('cell-checked')){
			//勾选，获取值
			var localreceive = $('.win-speedlimit-client #localreceive').next().next('input').val();
			if(localreceive == ''){
				toast('提示信息',"请填写本地网络限制接收数值",'error');
            	return false;
			}
			// //验证本地网络限速接收数值
			// var reg = /^\d{1,4}$/;
   //          var res = reg.test(localreceive);
   //          if(!res || (localreceive < 0 || localreceive > 1025)){
   //          	toast('提示信息',"本地网络限速接收数值0-1024",'error');
   //          	return false;
   //          }
		}else{
			var localreceive = '';
		}

		//判断本地网络限速发送是否勾选
		if($('.win-speedlimit-client #localsend').hasClass('cell-checked')){
			//勾选，获取值
			var localsend = $('.win-speedlimit-client #localsend').next().next('input').val();
			if(localsend == ''){
				toast('提示信息',"请填写本地网络限制发送数值",'error');
            	return false;
			}
			// //验证本地网络限速接收数值
			// var reg = /^\d{1,4}$/;
   //          var res = reg.test(localsend);
   //          if(!res || (localsend < 0 || localsend > 1025)){
   //          	toast('提示信息',"本地网络限速接收数值0-1024",'error');
   //          	return false;
   //          }
		}else{
			var localsend = '';
		}

		//判断本地网络限速发送是否勾选
		if($('.win-speedlimit-client #wideareareceive').hasClass('cell-checked')){
			//勾选，获取值
			var wideareareceive = $('.win-speedlimit-client #wideareareceive').next().next('input').val();
			if(wideareareceive == ''){
				toast('提示信息',"请填写广域网络限制接收数值",'error');
            	return false;
			}
			// //验证本地网络限速接收数值
			// var reg = /^\d{1,4}$/;
   //          var res = reg.test(wideareareceive);
   //          if(!res || (wideareareceive < 0 || wideareareceive > 1025)){
   //          	toast('提示信息',"本地网络限速接收数值0-1024",'error');
   //          	return false;
   //          }
		}else{
			var wideareareceive = '';
		}

		//判断本地网络限速发送是否勾选
		if($('.win-speedlimit-client #wideareasend').hasClass('cell-checked')){
			//勾选，获取值
			var wideareasend = $('.win-speedlimit-client #wideareasend').next().next('input').val();
			if(wideareasend == ''){
				toast('提示信息',"请填写广域网络限制发送数值",'error');
            	return false;
			}
			// //验证本地网络限速接收数值
			// var reg = /^\d{1,4}$/;
   //          var res = reg.test(wideareasend);
   //          if(!res || (wideareasend < 0 || wideareasend > 1025)){
   //          	toast('提示信息',"本地网络限速接收数值0-1024",'error');
   //          	return false;
   //          }
		}else{
			var wideareasend = '';
		}

		//判断是否都没有勾选
		if(localreceive == '' && localsend == '' & wideareasend == '' && wideareasend == ''){
			toast('提示信息',"请选择终端网络限制",'error');
            return false;
		}else{
			if(localreceive == ''){
				localreceive = 0;
			}
			if(localsend == ''){
				localsend = 0;
			}
			if(wideareasend == ''){
				wideareasend = 0;
			}
			if(wideareasend == ''){
				wideareasend = 0;
			}
			var org_id = getOrg(target.data('org')).id;
			//获取选中
			var clientchecked = getCheckedClinet();
			var client_macs = [];
			$.each(clientchecked,function(index,data){
				client_macs.push(data.mac);
			});

			var data = JSON.stringify({
				'client_macs':client_macs,
				'org_id':org_id,
				'rx_rate_limit_local':localreceive,
				'tx_rate_limit_local':localsend,
				'rx_rate_limit_wan':wideareareceive,
				'tx_rate_limit_wan':wideareasend
			});
			var url = _IFA['client__add_client_ratelimit'];
			var type = 'POST';
			_ajax(url,type,data,function(data){
				console.log(data);
				if(data.error_code!=0){
					toast('提示信息',data.error_message,'error');
					flag = false;
				}else{
					toast('提示消息','操作成功','success');
					refresh();
					closeWindow('.win-speedlimit-client');
				}
			});
		}
		

	});

	/*添加到地址簿窗口-退出*/
	var btnBatchUpdateClientExit = $('.win-add-client .but-cancel').click(function(){
		closeWindow('.win-add-client');
	});

	/*添加到用户窗口-退出*/
	var btnAddUserClientExit = $('.win-add-batch-client .but-cancel').click(function(){
		closeWindow('.win-add-batch-client');
	});

	/*添加到控制窗口-退出*/
	var btnControlClientExit = $('.win-control-client .but-cancel').click(function(){
		closeWindow('.win-control-client');
	});

	/*添加到限速窗口-退出*/
	var btnSpeedlimitClientExit = $('.win-speedlimit-client .but-cancel').click(function(){
		closeWindow('.win-speedlimit-client');
	});

	/*------------------右侧点击弹出弹窗---------------------------------*/
	/*------------------第一页终端管理过滤页结束-----------------------------*/



	/*------------------第二页用户终端管理页面----------------------------*/
	/*获取根节点*/
	var getRoot = function(tree){
		return $(tree).tree('getRoot');
	};
	/*选择树节点*/
	var selectNode = function(node){
		$(tree).tree('select',node.target);
	};
	/*获取默认选中节点*/
	var getSelected = function(tree){
		return $(tree).tree('getSelected')==null?getRoot(tree):$(tree).tree('getSelected');
	}
	/*插入空信息*/
	var insertNodata =  function(table){
		$(table).datagrid('getPanel').find('.datagrid-body').append($('<div class="nodata"><img src="public/images/nodata.png" /><div>没有可以显示的数据</div></div>'));
		var height = $('.client-user .app-table-detail').height();
		$('.client-user .nodata').css({
			'height':height-50+'px',
			'line-height':height-50+'px'
		});
		$(table).datagrid('getPanel').find('.datagrid-header input').attr('disabled','disabled');
		$('.client-user footer').addClass('none');
	};

	// /*追加结点*/
	// var appendNode = function(tree,data){
	// 	var selected = $(tree).tree('getSelected');
	// 	if(selected!=null){
	// 		if(selected.is_default==1){
	// 			selected = getRoot(tree);
	// 		}
	// 	}else{
	// 		selected = getRoot(tree);
	// 	}
		
	// 	$(tree).tree('append',{
	// 		parent:selected.target,
	// 		data:[{
	// 			id: data.id,
	// 			text: data.name,
	// 		}]
	// 	});
	// }
	// /*更新结点*/
	// var updateNode = function(tree,data){
	// 	data = filterData(data);
	// 	var selected = $(tree).tree('getSelected');
	// 	$(tree).tree('update',{
	// 		target:selected.target,
	// 		text:data.name,
	// 	});
	// }
	/*调整树结构样式*/
	var adjustTreeStyle = function(obj){
		var appLeft = $('#app-client-layout .app-left').layout('panel','center');
		var height = $(appLeft).panel('options').height;
		obj.css({
				'height':height-140+'px',
			    'overflow-y': 'auto',
			    'overflow-x': 'hidden'
		});
		$('#app-client-layout  .group-list>li:first-child>div:first-child').addClass('none');
		
	}
	/*重新加载数据*/
	var loadTree = function(){
		/*载入树结构*/
		var url_groups =  _IFA['groups_list']+getOrg(target.data('org')).parent;
		_ajax(url_groups,'GET','',function(data){
			if(data.error_code==0){
				data = data.list[0];
				data.children[0].text = data.children[0].text=='default'?'默认组':data.children[0].text;
				$(tree).tree({
					data:[data],
					loadFilter:function(data){
						return data;
					},
					onLoadSuccess:function(node,data){
						$(".tree li ul li:last-child ul li ul li>div").addClass('easyui-panel user_tip');
						$('.user_tip').tooltip({
							position: 'right',
							content: '<div style="padding:10px 10px 5px 10px;color:#4f5358; width:200px; line-height40px;">'
							+'<ul class="client_user_list">'
							+'<li>用户名: Edison Lee</li>'
							+'<li>邮箱地址: lee@oakridge.vip</li>'
							+'<li>手机号码: +8613588899987</li>'
							+'</ul>'
							+'</div>',
							onShow: function(){
								$(this).tooltip('tip').css({
									borderColor: '#ddd',
									// boxShadow: '1px 1px 3px #292929'
								});
								$(this).tooltip('arrow').css({
									borderColor: '#ddd',
									// boxShadow: '1px 1px 3px #292929'
								});
							},
							onPosition: function(){
								$(this).tooltip('tip').css('left', $(this).offset().left+180);
								$(this).tooltip('arrow').css({'left':0});
							}
						});
						//设置滚动条高度
						adjustTreeStyle($(this));
					},
					onSelect:function(node){
						//选中默认时  更多的 hover
						var options = {
							group_ids:node.id
						}
						loadTable(options);

                        $('.input-search').val('');//点击树结构切换，清空查询条件
					}
				});
			}
		});
	}

	/*获取用户组*/
	var getGroups = function(func){
		var url = _IFA['groups_list']+org_ids;
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

	/*获取用户*/
	var getUser = function(options,callback){
		var _group_ids = options.group_ids;
		if(_group_ids == undefined){
			_group_ids = 29
		}
		if(_group_ids == 0){
			_group_ids = 29
		}
		var url = _IFA['ap_table_list'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+getOrg(target.data('org')).id + '&group_subordinate='+1;
		if(serializeJson(options)){
			args += '&'+serializeJson(options);	
		}
		url = url + args
		_ajax(url,type,data,callback);
	};

	/*用户端添加到移除窗口*/
	var winRemoveClient = $('.remove-client').click(function(){
		var clientchecked = getCheckedClinet();
		if(clientchecked == ''){
			// toast('提示消息','请选择要添加的终端','error');
			return false;
		}
		onOpenDelete('.win-client-remove');
		$('.win-client-remove').window({
			width:650,
			height:276,
			title:'移除终端',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				//获取选中
				var clientchecked = getCheckedClinet();
				//获取选中数量
				var clientcheckednum = clientchecked.length;
				$('.win-client-remove .deleteclientname').html(clientchecked[0]['client_name']);
				$('.win-client-remove .deleteclientnum').html(clientcheckednum);
				if(indexpage == 2){
					//如果是第二页

				}else if(indexpage == 3){
					//如果是第三页
					if(dzid == 0){
						//如果从黑名单移除
						$('.win-client-remove .deleteclientfrom').html("黑名单");
					}else{
						$('.win-client-remove .deleteclientfrom').html("地址簿"+dzname);
					}
				}
			},
			onClose:function(){
				clearForm('#create-client');
			}
		});		
		$(".name").focus();
	});

	//终端左侧----用户终端管理页面
	var goClientUser = $('#app-client-layout .client_nav_left .client_user').click(function(){	
		$(setPage).data({
			'type_tree':1,//左侧树还是右侧树
		});
		console.log(setPage[jQuery.expando].data)
		setPage.type_tree = 1;
		console.log(setPage)
		
		closeWindow('.win-client-user');
		$('<div/>').addClass('win-client-user').appendTo($('body'));
		$('.win-client-user').window({
			width:1000,
			height:550,
			title:'用户终端管理',
			href:'client/client-user.html',
			headerCls:'sm-header',
			iconCls:'icon-add',
			collapsible:false,
			minimizable:true,
			maximizable:true,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onBeforeOpen:function(){
				var winAp = $('.app-icon-client').parent('div').next('div');
				winAp.window('close');
				//加载类型
				loadtype = 1;
				indexpage = 2;
			},
			onLoad:function(){
				//获取左侧数据
				// ajaxTree();
				loadTree();
				//AP详情----返回表格
				// returnTable();
				//点击左侧列表获取右侧总览数据
				// leftClick();
				//总览----设备修改
				// apEquipment();
				//总览----设备保存
				// saveEquipment();
				//总览----射频修改
				// amendFrequency();
				//总览---射频保存
				// saveFrequency();
				//刷新
				// refreshLoad();
				//信道分析----扫描按钮
				// analyze();
				
			},
			onClose:function(){
				$(this).window('destroy');
			}
		});	
	});
	//终端左侧----终端页面
	var goClient = $('#app-client-layout .client_nav_left .client_pc').click(function(){
		closeWindow('.win-client-user');
		$('<div/>').addClass('win-client-user').appendTo($('body'));	
		$('.win-client-user').window({
			width:1000,
			height:550,
			title:'终端',
			href:'client/index.html',
			headerCls:'sm-header',
			iconCls:'icon-add',
			collapsible:false,
			minimizable:true,
			maximizable:true,
			resizable:false,
			modal:false,
			loadingMessage:'',
			onBeforeOpen:function(){
				var winAp = $('.app-icon-client').parent('div').next('div');
				winAp.window('close');
				//加载类型
				loadtype = 1;
				indexpage = 1;
			},
			onLoad:function(){
			},
			onClose:function(){
				$(this).window('destroy');
			}
		});	
	});
	/*------------------第二页用户终端管理页面结束----------------------------*/

	/*------------------第三页地址簿终端管理页面开始----------------------------*/
	//终端左侧----地址簿终端管理
	var goClientdz = $('#app-client-layout .client_nav_left .client_rz').click(function(){
		$(setPage).data({
			'type_tree':1,//左侧树还是右侧树
		});
		// console.log(setPage[jQuery.expando].data)
		setPage.type_tree = 1;
		// console.log(setPage)
		
		closeWindow('.win-client-user');
		$('<div/>').addClass('win-client-user').appendTo($('body'));
		$('.win-client-user').window({
			width:1000,
			height:550,
			title:'地址簿终端管理',
			href:'client/client-address.html',
			headerCls:'sm-header',
			iconCls:'icon-add',
			collapsible:false,
			minimizable:true,
			maximizable:true,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onBeforeOpen:function(){
				var winAp = $('.app-icon-client').parent('div').next('div');
				winAp.window('close');
			},
			onLoad:function(){
				//访问控制，黑名单数量
				var org_id = getOrg(target.data('org')).id;
				getClientAclSummary(org_id,function(data){
					var kongzhinum = parseInt(data.deny) + parseInt(data.deny_temporary);
					$('.client_nav_right #kongzhinum').html(kongzhinum);
				});
				//加载类型
				loadtype = 2;
				indexpage = 3;
				loadTable2();
				//添加左侧地址簿列表
				addlLeftAddList();
			},
			onClose:function(){
				$(this).window('destroy');
			}
		});	
	});

	//获取终端访问控制列表
	var getClientAclList = function(options,callback){
		var org_id = getOrg(target.data('org')).id;
		var args = org_id;
		if(serializeJson(options)){
			args += '&'+serializeJson(options);
		}
		
		var url = _IFA['client__get_acl_list'];
		var type = 'GET';
		var data = '';
		url = url + args;
		_ajax(url,type,data,callback);
	};

	//获取用户自定义终端列表
	var getClientProfilesList = function(options,callback){
		var args = '?1=1';
		if(serializeJson(options)){
			args += '&'+serializeJson(options);
		}
		
		var url = _IFA['client__get_profiles_list']+'/'+dzid+'/clients';
		var type = 'GET';
		var data = '';
		url = url + args;
		// alert(url);
		_ajax(url,type,data,callback);
	};

	// 地址簿列表
	$("#app-client-layout .adress_group_list").click(function(event) {
		$("#app-client-layout .adress_group_list").removeClass('cur');
		$(this).addClass('cur').siblings().removeClass('cur');
	});

	//获取终端访问控制概要
	var getClientAclSummary = function(options,callback){
		var url = _IFA['client__get_acl_summary'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+options;
		url = url + args;
		_ajax(url,type,data,callback);
	}

	/*地址簿左边更多下拉列表*/
	var btnLeftMenuMore = $('.client-btn-menu-more').click(function(e){
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

	//获取地址簿列表
	var getAddressList = function(options,callback){
		var url = _IFA['client__get_dz_list'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+options;
		url = url + args;
		_ajax(url,type,data,callback);
	};

	//添加左侧地址簿
	var addlLeftAddList = function(){
		var org_id = getOrg(target.data('org')).id;
		getAddressList(org_id,function(data){
			$("#app-client-layout #usercustomaddress").html('');
			for (var i in data['list'])
            {
            	if(data['list'][i]['client_number'] == undefined){
            		data['list'][i]['client_number'] = 0;
            	}
            	var htmladdress = '<div class="adress_group_list address_list" dzid="'+data['list'][i]['id']+'" dzname="'+data['list'][i]['profile_name']+'">';
					htmladdress+= '<span class="text">'+data['list'][i]['profile_name']+'</span>';
					htmladdress+= '<span class="num">（'+data['list'][i]['client_number']+'）</span></div>';				
                $("#app-client-layout #usercustomaddress").append(htmladdress);
            }
            //设置默认值,默认选中黑名单
            dzid = 0;
            dzname = '';
            // 地址簿列表
			$("#app-client-layout .adress_group_list").click(function(event) {
				$("#app-client-layout .adress_group_list").removeClass('cur');
				$(this).addClass('cur').siblings().removeClass('cur');
				dzid = $(this).attr('dzid');
				dzname = $(this).attr('dzname');
				if(dzid == undefined){
					dzid = 0;
				}
				if(dzname == undefined){
					dzname = '黑名单';
				}
				if(dzid != 0){
					$('.client-region-center .edit-client').removeClass('none');
					loadtype = 3;
					loadTable3();
				}
				
			});
		})
	}

	//点击黑名单，设置选中值
	$('.adress_group .heimingdan').click(function() {
		dzid = 0;
		loadTable2();
		$('.client-region-center .edit-client').addClass('none');
	});

	/*添加到左边新增地址簿窗口*/
	var winSpeedlimitClient = $('.btn-create-add').click(function(){
		onOpenDelete('.win-addressAdd-client');
		$('.win-addressAdd-client').window({
			width:650,
			height:209,
			title:'新增地址薄',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				
			},
			onClose:function(){
				
			}
		});		
	});

	//添加地址簿
	$('#win-addressAdd-client .but-conserve').click(function(event) {
		var org_id = getOrg(target.data('org')).id;
		//获取填写的地址簿名称
		var name = $('#win-addressAdd-client .addaddressname').val();
		if(name == ''){
			toast('提示信息',"请填写地址簿名称",'error');
			return false;
		}
		var url = _IFA['client__add_dz'];
		var type = 'POST';
		var data = JSON.stringify({
			'org_id':org_id,
			'profile_name':name
		});
		_ajax(url,type,data,function(data){
			if(data.error_code!=0){
				toast('提示信息',data.error_message,'error');
				flag = false;
			}else{
				toast('提示消息','操作成功','success');
				refresh();
				//重新添加地址簿
				addlLeftAddList();
				$('.adress_group .heimingdan').parent('div').addClass('cur').siblings().removeClass('cur');
				closeWindow('.win-addressAdd-client');
			}
		});
	});

	/*添加到左边更多编辑地址簿窗口*/
	var winSpeedlimitClient = $('.client-btn-edit-addlist').click(function(){
		//判断是否是选中了黑名单
		if(dzid == 0){
			toast('提示信息',"不能编辑黑名单",'error');
			return false;
		}
		onOpenDelete('.win-editAdd-client');
		$('.win-editAdd-client').window({
			width:650,
			height:209,
			title:'修改地址簿',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				$('#win-editAdd-client .editaddressname').val(dzname);
			},
			onClose:function(){
				
			}
		});		
	});

	//编辑地址簿
	$('#win-editAdd-client .but-conserve').click(function(event) {
		//获取填写的地址簿名称
		var name = $('#win-editAdd-client .editaddressname').val();
		if(name == ''){
			toast('提示信息',"请填写地址簿名称",'error');
			return false;
		}
		var url = _IFA['client__edit_dz']+dzid;
		var type = 'PUT';
		var data = JSON.stringify({
			'profile_name':name
		});
		_ajax(url,type,data,function(data){
			if(data.error_code!=0){
				toast('提示信息',data.error_message,'error');
				flag = false;
			}else{
				toast('提示消息','操作成功','success');
				refresh();
				//重新添加地址簿
				addlLeftAddList();
				$('.adress_group .heimingdan').parent('div').addClass('cur').siblings().removeClass('cur');
				closeWindow('.win-editAdd-client');
			}
		});
	});

	/*地址簿添加到删除窗口*/
	var winRemoveClient = $('.client-btn-del-addlist').click(function(){
		//判断是否是选中了黑名单
		if(dzid == 0){
			toast('提示信息',"不能删除黑名单",'error');
			return false;
		}
		onOpenDelete('.win-client-delete');
		$('.win-client-delete').window({
			width:650,
			height:276,
			title:'删除地址簿',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				//修改删除地址簿名称
				$('#win-client-delete #addressname').html(dzname);
			},
			onClose:function(){
				clearForm('#create-client');
			}
		});		
		$(".name").focus();
	});

	//删除地址簿
	$('#win-client-delete .but-conserve').click(function(event) {
		if(dzid == ''){
			toast('提示信息',"请选择要删除的地址簿",'error');
			return false;
		}
		var url = _IFA['client__delete_dz']+dzid;
		var type = 'DELETE';
		var data = '';
		_confirm('提示信息', '你正在尝试删除地址簿'+'"'+dzname+'",'+'是否继续', function(r){
			if (r){
				_ajax(url,type,data,function(data){
					if(data.error_code!=0){
						toast('提示信息',data.error_message,'error');
						flag = false;
					}else{
						toast('提示消息','操作成功','success');
						refresh();
						//重新添加地址簿
						addlLeftAddList();
						$('.adress_group .heimingdan').parent('div').addClass('cur').siblings().removeClass('cur');
						closeWindow('.win-client-delete');
					}
				});
			}
		});
	});

	//地址簿右侧点击添加
	var winrightadd = $('.btn-menu-address').click(function(){
		if(dzid == 0){
			winBlacklistClient();
		}else{
			winEquipmentClient();
		}
	});

	/*黑名单添加到黑名单窗口*/
	var winBlacklistClient = function(){
		onOpenDelete('.win-add-blacklist');
		$('.win-add-blacklist').window({
			width:650,
			height:580,
			title:'添加黑名单',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				/*clearForm('.update-ap-group #create-ap-group');*/
				getGroups(function(data){
					console.log(data)
					var subGroup = data.list[0].children;
					subGroup = filterData(subGroup);
					$('.win-add-blacklist #select-add-client-group').combotree({
					   required: true,
					   data:subGroup,
					   onLoadSuccess:function(node,data){
					   	  var group_list = $('#app-client-layout .group-list').tree('getSelected');
                           if(!group_list){
							   group_list = {};
                               group_list.id = '默认';
						   }
                           $('.win-add-blacklist #select-add-client-group').combotree('setValue', group_list.id);
					   }
					});
				});	
				initRadio();
				
				//清空用户列表记录
				$('.win-add-blacklist .user-list').empty();
				addapInfo('.win-add-blacklist .user-list');
			
			},
			onClose:function(){

			}
		});
	};

	/*触发批量新增用户事件*/
	var btnBatchAddUser = $('.win-add-blacklist .batch-add').click(function(){
		addapInfo('.win-add-blacklist .user-list');
	});
	/*增加新的黑名单终端记录*/
	var addapInfo = function(classId){
		//验证重复数据
		var html = '<div class="batch-inputBox">';
		html += '<input type="text" name="mac_address" class="batch-input01 mac_address"/>';/*email*/
		html += '<span class="ap_name client_text">--</span>';/*phone*/
		html += '<span class="ap_location client_text">--</span>';
		if($('.win-add-blacklist .batch-inputBox').length>0){
			html += '<div class="batch-delete batch-delete-selected"></div>';
		}else{
			html += '<div class="batch-add batch-add-selected"></div>';
		}
		html += '</div>';
	    var rehtml = $(html).appendTo(classId);
	    
	    $('.win-add-blacklist .batch-add').unbind('click').bind('click',function(){
	    	//标记
	   		var flag = true;
	    	 //点击事件   	 
	    	$('.win-add-blacklist .batch-inputBox').each(function(index,data){
	    		var mac_address = $(this).find('input[name="mac_address"]');
	    		var ap_name = $(this).find('.ap_name');
	    		var ap_location = $(this).find('.ap_location');
	    		//验证空值  	
	    		if(mac_address.val()==''){
	    			flag = false;
	    			toast('提示信息','mac地址为必填项！','warning');
	    			mac_address.focus();
	    			return ;
	    		}
	    			//验证MAC地址
	    		if(mac_address.val()!=''){
	    			if(!isMac(mac_address.val())){
	    				flag = false;
	    				toast('提示信息','mac地址格式错误！','error');
	    				return flag;
	    			};
	    			/*//远端验证
	    			if(!checkUserExist(mac_address.val())){
	    				flag = false;
	    				return;
	    			}*/
	    		}

	    		getClientInfo(mac_address.val(),function(data){
	    			if(data.error_code!=0){
						toast('提示信息',data.error_message,'error');
						flag = false;
						return flag;
					}else{
						ap_name.html(data.hostname);
						ap_location.html(data.username);
	    				addapInfo('.win-add-blacklist .user-list');
					}
	    		})
	    		
	    		
	    });
		    if(flag== true){
	    		addapInfo('.win-add-blacklist .user-list');
	    	}
		    
		    $('.win-add-blacklist .batch-delete').click(function(index){
		    	if($('.win-add-blacklist .user-list .batch-inputBox').length>1){
		    		$(this).parent('.win-add-blacklist .batch-inputBox').remove();
		    	}else{
		    		toast('提示消息','至少存在一条记录','warning');
		    		return false;
		    	};
		    });
		});
	};



	//添加终端到黑名单
	var addClientToblack = $('.win-add-blacklist .but-conserve').click(function(event) {
		var org_id = getOrg(target.data('org')).id;
		//获取填写的mac值
		client_macs = [];
		$('.win-add-blacklist .batch-inputBox').each(function(index,data){
    		var mac_address = $(this).find('input[name="mac_address"]').val();
			client_macs.push(mac_address);
	    });
		//获取选中的访问控制类型
		var balcktype = $('.win-add-blacklist .blacklist_type').find('input:radio[name="type"]:checked').val();
		//终端永久冻结访问
		if(balcktype == 3){
			var data = JSON.stringify({
				'client_macs':client_macs,
				'org_id':org_id,
				'type':3,
				'remain_time':0
			});
			var url = _IFA['client__add_client_acl'];
			var type = 'POST';
			_ajax(url,type,data,function(data){
				console.log(data);
				if(data.error_code!=0){
					toast('提示信息',data.error_message,'error');
					flag = false;
				}else{
					toast('提示消息','操作成功','success');
					refresh();
					closeWindow('.win-add-blacklist');
				}
			});
		}

		//终端暂时冻结访问
		if(balcktype == 4){
			//获取天数
			var day = $('.win-add-blacklist #day').val();
			if(day == ''){
				toast('提示信息',"请填写冻结时间天数",'error');
				return false;
			}
			//验证时间
			var reg = /^\d{1,3}$/;
            var res = reg.test(day);
            if(!res || (day < 0 || day > 365)){
            	toast('提示信息',"冻结天数0-364",'error');
            	return false;
            }
            //获取小时
			var hours = $('.win-add-blacklist #hours').val();
			if(hours == ''){
				toast('提示信息',"请填写冻结时间小时数",'error');
				return false;
			}
			//验证时间
			var reg1 = /^\d{1,2}$/;
            var res1 = reg1.test(hours);
            if(!res1 || (hours < 0 || hours > 23)){
            	toast('提示信息',"冻结小时数0-23",'error');
            	return false;
            }
            //获取分钟
			var min = $('.win-add-blacklist #min').val();
			if(min == ''){
				toast('提示信息',"请填写冻结时间分钟数",'error');
				return false;
			}
			//验证时间
			var reg2 = /^\d{1,2}$/;
            var res2 = reg2.test(min);
            if(!res2 || (min < 0 || min > 59)){
            	toast('提示信息',"冻结分钟数0-59",'error');
            	return false;
            }

            //获取当前utc时间戳
            date = new Date();
			var y =  date.getFullYear();    
			var m = date.getMonth() ;
			var d = date.getDate();
			var h= date.getHours();
			var M = date.getMinutes();
			var s = date.getSeconds();
            var nowtime = Date.UTC(y,m,d,h,M,s);
            var addtime = 86400000*day + 3600000*hours + 60000*min;
            //冻结时间
            // var remain_time = parseInt(nowtime) + parseInt(addtime);
            var remain_time = addtime;

			var data = JSON.stringify({
				'client_macs':client_macs,
				'org_id':org_id,
				'type':4,
				'remain_time':remain_time
			});
			var url = _IFA['client__add_client_acl'];
			var type = 'POST';
			_ajax(url,type,data,function(data){
				if(data.error_code!=0){
					toast('提示信息',data.error_message,'error');
					flag = false;
				}else{
					toast('提示消息','操作成功','success');
					refresh();
					closeWindow('.win-add-blacklist');
				}
			});
		}
	});

	//获取终端详情数据
	var getClientInfo = function(options,callback){
		var org_id = getOrg(target.data('org')).id;
		var url = _IFA['client__get_client_info'];
		var args = '?'+options+'&org_id='+org_id;
		url = url + args
		var type = 'GET';
		var data = '';
		console.log(url);
		_ajax(url,type,data,callback);	
	}

	/*添加终端到办公室设备地址簿*/
	var winEquipmentClient = function(){
		onOpenDelete('.win-equipment-blacklist');
		$('.win-equipment-blacklist').window({
			width:650,
			height:445,
			title:'添加终端到办公室设备地址簿',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				getGroups(function(data){
					console.log(data)
					var subGroup = data.list[0].children;
					subGroup = filterData(subGroup);
					$('.win-add-blacklist #select-add-client-group').combotree({
					   required: true,
					   data:subGroup,
					   onLoadSuccess:function(node,data){
					   	  var group_list = $('#app-client-layout .group-list').tree('getSelected');
                           if(!group_list){
							   group_list = {};
                               group_list.id = '默认';
						   }
                           $('.win-add-blacklist #select-add-client-group').combotree('setValue', group_list.id);
					   }
					});
				});	
				initRadio();
				
				//清空用户列表记录
				$('.win-equipment-blacklist .user-list').empty();
				addequipmentInfo('.win-equipment-blacklist .user-list');
			
			},
			onClose:function(){

			}
		});
	};

	/*增加新的地址簿终端记录*/
	var addequipmentInfo = function(classId){
		//验证重复数据
		var html = '<div class="batch-inputBox">';
		html += '<input type="text" name="mac_address" class="batch-input01 mac_address"/>';/*email*/
		html += '<input type="text" name="ap_name" class="right-input batch-input02 ap_name"/>';/*phone*/
		// html += '<input type="text" name="ap_location" class="right-input batch-input02 ap_location"/>';
		if($('.win-equipment-blacklist .batch-inputBox').length>0){
			html += '<div class="batch-delete batch-delete-selected"></div>';
		}else{
			html += '<div class="batch-add batch-add-selected"></div>';
		}
		html += '</div>';
	    var rehtml = $(html).appendTo(classId);
	    
	    $('.win-equipment-blacklist .batch-add').unbind('click').bind('click',function(){
	    	//标记
	   		var flag = true;
	    	 //点击事件   	 
	    	$('.win-equipment-blacklist .batch-inputBox').each(function(index,data){
	    		var mac_address = $(this).find('input[name="mac_address"]');
	    		var ap_name = $(this).find('input[name="ap_name"]');
	    		//验证空值  	
	    		if(mac_address.val()==''){
	    			flag = false;
	    			toast('提示信息','mac地址为必填项！','warning');
	    			mac_address.focus();
	    			return ;
	    		}
	    			//验证MAC地址
	    		if(mac_address.val()!=''){
	    			if(!isMac(mac_address.val())){
	    				flag = false;
	    				toast('提示信息','mac地址格式错误！','error');
	    				return flag;
	    			};
	    			/*//远端验证
	    			if(!checkUserExist(mac_address.val())){
	    				flag = false;
	    				return;
	    			}*/
	    		}
	    		
	    		
	    });
		    if(flag== true){
	    		addequipmentInfo('.win-equipment-blacklist .user-list');
	    	}
		    
		    $('.win-equipment-blacklist .batch-delete').click(function(index){
		    	if($('.win-equipment-blacklist .user-list .batch-inputBox').length>1){
		    		$(this).parent('.win-equipment-blacklist .batch-inputBox').remove();
		    	}else{
		    		toast('提示消息','至少存在一条记录','warning');
		    		return false;
		    	};
		    });
		});
	};

		//添加终端到地址簿保存
	$('.win-equipment-blacklist .but-conserve').click(function() {
    	var org_id = getOrg(target.data('org')).id;
		//获取填写的mac值
		var list = [];
		var param = {};
		$('.win-equipment-blacklist .batch-inputBox').each(function(index,data){
    		var mac_address = $(this).find('input[name="mac_address"]').val();
    		var ap_name = $(this).find('input[name="ap_name"]').val();
			list.push({
				'hostname':ap_name,
				'client_mac':mac_address
			});
	    });
		param.list = list;
		// //拼接参数
		var data = JSON.stringify(param);
		var url = _IFA['client__add_client_dz']+'/'+dzid+'/clients';
		
		var type = 'POST';
		_ajax(url,type,data,function(data){
			console.log(data);
			if(data.error_code!=0){
				toast('提示信息',data.error_message,'error');
				flag = false;
			}else{
				toast('提示消息','操作成功','success');
				refresh();
				//重新添加地址簿
				addlLeftAddList();
				closeWindow('.win-equipment-blacklist');
			}
		});
	});

	/*终端信息修改*/
	var winEditClient = $('.edit-client').click(function(){
		onOpenDelete('.win-edit-client');
		$('.win-edit-client').window({
			width:650,
			height:445,
			title:'你可以编辑相应终端的主机名信息:',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				getGroups(function(data){
					console.log(data)
					var subGroup = data.list[0].children;
					subGroup = filterData(subGroup);
					$('.win-edit-client #select-add-client-group').combotree({
					   required: true,
					   data:subGroup,
					   onLoadSuccess:function(node,data){
					   	  var group_list = $('#app-client-layout .group-list').tree('getSelected');
                           if(!group_list){
							   group_list = {};
                               group_list.id = '默认';
						   }
                           $('.win-edit-client #select-add-client-group').combotree('setValue', group_list.id);
					   }
					});
				});	
				initRadio();
				
				//清空用户列表记录
				$('.win-edit-client .user-list').empty();
				addeditInfo('.win-edit-client .user-list');
			
			},
			onClose:function(){

			}
		});
	});
	/*终端信息修改页面信息*/
	var addeditInfo = function(classId){
		//获取选中
		var clientchecked = getCheckedClinet();
		for (var i = clientchecked.length - 1; i >= 0; i--) {
			var html = '<div class="batch-inputBox">';
			html += '<span class="mac_address" >'+clientchecked[i]['client_mac']+'</span>';/*email*/
			html += '<input type="text" name="ap_name" class="right-input batch-input02 ap_name"/>';/*phone*/
			// html += '<input type="text" name="ap_location" class="right-input batch-input02 ap_location"/>';
			html += '</div>';
		    var rehtml = $(html).appendTo(classId);
		};
	};

	//修改终端主机名保存
	$('.win-edit-client .but-conserve').click(function(event) {
		//获取填写的mac值
		var list = [];
		var param = {};
		$('.win-edit-client .batch-inputBox').each(function(index,data){
    		var mac_address = $(this).find('.mac_address').html();
    		var ap_name = $(this).find('input[name="ap_name"]').val();
			list.push({
				'hostname':ap_name,
				'client_mac':mac_address
			});
	    });
	    param.list = list;
	    var org_id = getOrg(target.data('org')).id;
		//获取选中
		param.org_id = org_id;
	    //拼接参数
		var data = JSON.stringify(param);
		var url = _IFA['client__edit_client'];
		var type = 'POST';
		_ajax(url,type,data,function(data){
			console.log(data);
			if(data.error_code!=0){
				toast('提示信息',data.error_message,'error');
				flag = false;
			}else{
				toast('提示消息','操作成功','success');
				refresh();
				closeWindow('.win-edit-client');
			}
		});
	});

	//移除地址簿的终端
	$('#win-client-remove .addressremovebtn').click(function(event) {
		var org_id = getOrg(target.data('org')).id;
		//获取选中
		var clientchecked = getCheckedClinet();
		//获取选中数量
		var clientcheckednum = clientchecked.length;
		//黑名单移除
		if(dzid == 0){
			var client_macs = [];
			$.each(clientchecked,function(index,data){
				client_macs.push(data.id);
			});

			var url = _IFA['client__get_acl_delete'];
			var type = 'POST';
			var data = JSON.stringify({
				'ids':client_macs,
				'org_id':org_id
			});
			_confirm('提示信息', '你正在尝试将'+'"'+clientchecked[0]['client_name']+'等'+clientcheckednum+'个终端从黑名单中移除",'+'是否继续', function(r){
				if (r){
					_ajax(url,type,data,function(data){
						if(data.error_code!=0){
							toast('提示信息',data.error_message,'error');
							flag = false;
						}else{
							toast('提示消息','操作成功','success');
							refresh();
							closeWindow('.win-client-remove');
						}
					});
				}
			});
		}else{
			var client_macs = [];
			console.log(clientchecked);
			$.each(clientchecked,function(index,data){
				client_macs.push(data.client_mac);
			});
			var url = _IFA['client__get_profiles_delete']+'/'+dzid+'/clients/delete';
			var type = 'POST';
			var data = JSON.stringify({
				'client_macs':client_macs,
				'org_id':org_id
			});
			_confirm('提示信息', '你正在尝试将'+'"'+clientchecked[0]['client_name']+'等'+clientcheckednum+'个终端从'+dzname+'中移除",'+'是否继续', function(r){
				if (r){
					_ajax(url,type,data,function(data){
						// if(data.error_code!=0){
						// 	toast('提示信息',data.error_message,'error');
						// 	flag = false;
						// }else{
							toast('提示消息','操作成功','success');
							refresh();
							closeWindow('.win-client-remove');
						// }
					});
				}
			});
		}
	});

	/*过滤数据*/
	var filterData = function(data){
		data.text=  data.text=='default'?'默认':data.text;
		return data;
	}

	/*添加到移除窗口-退出*/
	var btnRemoveClientExit = $('.win-client-remove .but-cancel').click(function(){
		closeWindow('.win-client-remove');
	});
	/*添加到左边新增窗口-退出*/
	var btnAddressAddClientExit = $('.win-addressAdd-client .but-cancel').click(function(){
		closeWindow('.win-addressAdd-client');
	});
	/*添加到左边更多编辑地址簿窗口-退出*/
	var btnEditAddClientExit = $('.win-editAdd-client .but-cancel').click(function(){
		closeWindow('.win-editAdd-client');
	});
	/*地址簿添加到删除窗口-退出*/
	var btnDeleteClientExit = $('.win-client-delete .but-cancel').click(function(){
		closeWindow('.win-client-delete');
	});
	/*地址簿添加到黑名单窗口-退出*/
	var btnControlClientExit = $('.win-add-blacklist .but-cancel').click(function(){
		closeWindow('.win-add-blacklist');
	});
	/*地址簿编辑窗口-退出*/
	var btnEditClientExit = $('.win-edit-client .but-cancel').click(function(){
		closeWindow('.win-edit-client');
	});

	/*------------------第三页地址簿终端管理页面结束----------------------------*/

	/*------------------第四页终端详情页面开始------------------------------*/
	//终端右侧箭头----进入详情
	// var goClientInfor = $('#app-client-layout .right-cion').click(function(){
	// 		console.log(clientinfo);
	// 		closeWindow('.win-client-user');
	// 		$('<div/>').addClass('win-client-particulars').appendTo($('body'));
	// 		$('.win-client-particulars').window({
	// 			width:1000,
	// 			height:550,
	// 			// top:76,
	// 			title:'终端详情',
	// 			href:'client/detail.html',
	// 			headerCls:'sm-header',
	// 			collapsible:false,
	// 			minimizable:false,
	// 			maximizable:false,
	// 			resizable:false,
	// 			modal:true,
	// 			loadingMessage:'',
	// 			onBeforeOpen:function(){
	// 				var winAp = $('.app-icon-client').parent('div').next('div');
	// 				winAp.window('close');
	// 			},
	// 			onLoad:function(){
	// 				//获取左侧数据
	// 				ajaxTree();
	// 				//终端详情----返回表格
	// 				returnTable();
	// 				//点击左侧列表获取右侧总览数据
	// 				// leftClick();
	// 				//设备修改
	// 				clientEquipment();
	// 				//QoS修改
	// 				clientQoS();
	// 				//总览----设备保存
	// 				// saveEquipment();
	// 				//总览----射频修改
	// 				// amendFrequency();
	// 				//总览---射频保存
	// 				// saveFrequency();
	// 				//刷新
	// 				refreshLoad();
	// 				//信道分析----扫描按钮
	// 				// analyze();
	// 				//日志导出				
	// 				btnExportClient();
	// 				$('#client-tabs').tabs({
	// 					onSelect:function(title,index){
	// 						switch(index){
	// 							case 0:{
	// 								break
	// 							}
	// 							case 1:{
	// 								flow();
	// 								chartOne('');
									
	// 								break;
	// 							}
	// 							case 2:{
	// 								getLog('',function(data){
	// 									var opt = {
	// 										page_size:defPageSize,
	// 										page:defPageNumber
	// 									}
	// 									loadDetailTable(opt);
	// 								})
	// 								break;
	// 							}
								
								
	// 						}
	// 					}
	// 				});
	// 			},
	// 			onClose:function(){
	// 				$(this).window('destroy');
	// 			}
	// 		});	
	// });

	/*定义详情表----日志表结构*/
	var _columns = [[
		{field:'level',title:'状态',sortable:true,align:'center',formatter:function (value,row,index) {
			if(value == 1){
				return "<span data-id="+value+">信息</span>";
			}else if(value == 2){
                return "<span data-id="+value+">警告</span>";
			}else if(value == 3){
                return "<span data-id="+value+">严重</span>";
			}
        }},
        {field:'timestamp',title:'发生时间',sortable:true,align:'center'},

        {field:'description',title:'日志',sortable:true,align:'center'}

    ]];

    /*获取日志*/
	var getLog = function(options,callback){
		if(!options){
			options = {};
			options.page_size = 10;
			options.page = 1;
		}
		console.log(options)
		var _id = $('.list-select').attr('a')
		var url = _IFA['ap__get_event_log'];
		var _mac = $('.list-select').attr('mac');
		console.log(_mac)
		var args = '?org_ids='+getOrg(target.data('org')).id+'&type='+1+'&search=FCAD0F07F0B0';
		if(serializeJson(options)){
			args += '&'+serializeJson(options);	
		}
		
		url = url + args
		var type = 'GET';
		var data = '';
		//http://clouddev.oakridge.vip/nms/logs/events?org_ids=20&type=1&search=FCAD0F07F0B0&page_size=10&page=1
		console.log(url);
		_ajax(url,type,data,callback);
		
	}
    /*加载终端详情---日志表格数据*/
	var loadDetailTable = function(options){
		//加载默认配置项
		if(options!=undefined){
			options.page = defPageNumber;
			options.page_size = defPageSize;
			if(options.pageNumber!=undefined && options.pageSize!=undefined){
				options.page = options.pageNumber;
				options.page_size = options.pageSize;
			}
		}else{
			var options = {};
			options.page = defPageNumber;
			options.page_size = defPageSize;
		}
		getLog(options,function(data){
			console.log(data);
			if(data.error_code==0){
				$(table3).datagrid({
					data:data.list,
					columns:_columns,
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
							insertNodata(table3);
						}else{
							$('footer').removeClass('none');
							$(table3).datagrid('getPanel').find('.datagrid-header input').removeAttr('disabled');
						}
						onTableSuccess1(data,options);
						
					},
					onSortColumn:function(sort, order){
					},
					onCheck:function(rowIndex,rowData){
					},
					onUncheck:function(rowIndex,rowData){
					},
					onCheckAll:function(rows){
					},
					onUncheckAll:function(rows){
					}
				});
			}
		});
		
	};

	/*终端日志表数据加载成功事件处理*/
	var onTableSuccess1 = function(data,options){
		//分页处理
		var pageSize = defPageSize;
		if(options != undefined && options.pageSize !=undefined){
			pageSize = options.pageSize;
		}
		var pageNumber = defPageNumber;
		if(options != undefined && options.pageNumber !=undefined){
			pageNumber = options.pageNumber;
		}
		var optPage = {
			paginationId:pagination1,
			total:data.total,
			pageNumber:pageNumber,
			pageSize:pageSize,
			pageList:defPageList
		}
		loadPagination1(optPage);
		
		//去掉加载条
		MaskUtil.unmask();
	}
	/*加载日志分页*/
	var loadPagination1 = function(options){
		console.log(options)
		//分页ID
		var paginationId = options.paginationId;
		var total = options.total;
		var pageNumber = options.pageNumber;
		var pageSize = options.pageSize;
		var pageList = options.pageList;
		$(paginationId).pagination({
		    total:total,
		    pageNumber:pageNumber,
		    pageSize:pageSize,
		    links:7,
		    pageList:pageList,
		    displayMsg:'共{total}条记录',
		    layout:['first','prev','links','next','last','sep','list','info','sep','refresh'],
		    onSelectPage:function(pageNumber, pageSize){
		    	$(this).pagination('loading');
		    	var opt = {
					pageSize:pageSize,
					pageNumber:pageNumber
				}
				$(this).pagination('loaded');
				loadDetailTable(opt);
		    },
			onRefresh:function(pageNumber, pageSize){
			},
			onChangePageSize:function(pageSize){
			}
		});
		//插入分页文件
		$('#ap-tabs .pagination-page-list').before('每页显示数');
	}

	/*终端设备保存事件*/
	// var saveEquipment= function(){
		
	// }
	/*终端设备修改*/
	var clientEquipment = function(){
		//绑定编辑切换效果
		$(".equipment").click(function(){
			if($(this).hasClass('btn-edit-icon')){
				$(this).removeClass('btn-edit-icon');
				$(this).addClass('btn-save-icon');
				$(this).parent().next().find('.info-label').addClass('none');
				$(this).parent().next().find('.info-input').removeClass('none');
			}else{
				$(this).removeClass('btn-save-icon');
				$(this).addClass('btn-edit-icon');
				$(this).parent().next().find('.info-label').removeClass('none');
				$(this).parent().next().find('.info-input').addClass('none');
				
				//保存基本信息数据
				// saveEquipment();
			}
		});
	}
	/*终端设备保存事件*/
	// var QosEquipment= function(){
		
	// }
	/*终端设备修改*/
	var clientQoS = function(){
		//绑定编辑切换效果
		$(".QoS").click(function(){
			if($(this).hasClass('btn-edit-icon')){
				$(this).removeClass('btn-edit-icon');
				$(this).addClass('btn-save-icon');
				$(this).parent().next().find('.info-label').addClass('none');
				$(this).parent().next().find('.info-input').removeClass('none');
			}else{
				$(this).removeClass('btn-save-icon');
				$(this).addClass('btn-edit-icon');
				$(this).parent().next().find('.info-label').removeClass('none');
				$(this).parent().next().find('.info-input').addClass('none');
				
				//保存基本信息数据
				// saveEquipment();
			}
		});
	}
	/*初始化时间插件-缺少英文*/
	var initDateTimer = function(timerIds){
		$.fn.datebox.defaults.formatter = function(date){
			var y = date.getFullYear();
			var m = date.getMonth()+1;
			var d = date.getDate();
			return y+'-'+m+'-'+d;
		}
		$.fn.datebox.defaults.parser = function(s){
			var t = Date.parse(s);
			if (!isNaN(t)){
				return new Date(t);
			} else {
				return new Date();
			}
		}
		$.each(timerIds,function(index,val){

			//载入时间插件
			$(val).datetimebox({
			    required: true,
			    value:getNowTimer(),
			    showSeconds: true,
			    okText:'确认',
			    currentText:'今天',
			    closeText:'关闭',
			    height:'28',
			    panelWidth:'218',
			    onShowPanel:function(){
			    	
			    },
/*                onSelect: function(date){
                    var mydate = new Date();
                    var selectDate = date.getTime()/1000;
                    var toDay = new Date(mydate.toLocaleDateString()).getTime()/1000;
                    if(selectDate<toDay){
                        toast('提示消息','所选日期不能小于当前日期','error');
					}
                }*/

            });

			/*调整时间位置*/
			var panel = $(val).datetimebox('panel');
			$(panel).parent('.combo-p').addClass('adjust-timer');
		});
	}
	/*选择tab页面*/
    var selectTabs = function(){
        chartOne();
		$('#network-tabs').tabs({
            onSelect:function(title,index){
            	switch(index){
					case 0:
                        chartOne();
						break;
					case 1:
					    var tab = $(this).tabs('getTab',1);
					    $(tab).panel({
					    	href:'network/abstract.html',
					    	onLoad:function(){
					    		//切换基本信息
					    		clientEquipment();
					    		
					    		//加载基本信息
					    		var node = $(tree).tree('getSelected');
					    		setAbstractInfo(node);
					    	}
					    });
						break;
					case 2:
						break;
				}
			}
		});
	}

	var chartOne = function(){

        var myChartOne = echarts.init(document.getElementById('chart-one'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionOne = {
            title: {
                text: '堆叠区域图',
                left: '8%'
            },
            color: colors,
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data:['Total', 'Tx', 'Rx'],
                right: "10%",
            },
            grid: {
                top: 55,
                bottom: 40,
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap : false,
                    axisTick:{
                        alignWithLabel: true,
                    },
                    data: [ "Noon", "3PM", "6PM", "9PM", "Ninght", "3AM", "6AM", "9AM"]
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '流量',
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

        var myChartTwo = echarts.init(document.getElementById('chart-two'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionTwo = {
            title: {
                text: '折柱混合',
                left: '5%'
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
                top: 55,
                bottom: 30,
            },
            legend: {
                data:['Total', 'Tx', 'Rx'],
                right: "10%",
            },
            xAxis: [
                {
                    type: 'category',
                    data: [ "Noon", "3PM", "6PM", "9PM", "Ninght", "3AM", "6AM", "9AM"],
                    axisPointer: {
                        type: 'shadow'
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '流量',
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
                    name:'Tx',
                    type:'bar',
                    data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2]
                },
                {
                    name:'Rx',
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
	// //终端详情点击
	// var leftClick = function(){
	// 	$('.win-client-particulars .group-list-particulars li').click(function(){
	// 		$(this).addClass('list-select').siblings().removeClass('list-select');
	// 		getList();
	// 		//设备清空数据
		
	// 		console.log($('#client-tabs .equipment-box .left-equipment>div>span:nth-child(2)').text())
	// 		$('#client-tabs .equipment-box .left-equipment>div>span:nth-child(2)').addClass('aaa');
	// 		$('#client-tabs .left-equipment>div>input').addClass('bbb');
	// 		$('#client-tabs .right-equipment>div>span:nth-child(2)').addClass('aaa');
	// 		$('#client-tabs .right-equipment>div>input').addClass('bbb');
	// 		//射频清空数据
	// 		$('#client-tabs .cont-box02-left>div>span:nth-child(2)').addClass('aaa');
	// 		$('#client-tabs .cont-box02-right>div>span:nth-child(2)').addClass('aaa');
	// 		$('.aaa').text('');
	// 		$('.bbb').val('');
	// 		//获取日志记录
	// 		var tab = $('#client-tabs').tabs('getSelected');
	// 		var index = $('#client-tabs').tabs('getTabIndex',tab);
	// 		//关闭保存
	// 		$('#client-tabs .frequency-compile').hide();
	// 		$('#client-tabs .frequency-icon').show();
	// 		$('#client-tabs .client-show').show();
	// 		$('#client-tabs .client-hide').hide();
			
	// 		$('#client-tabs .equipment-box').show();
	// 		$('#client-tabs .equipment-box-none').hide();
	// 		$('#client-tabs .equipment-compile').hide();
	// 		$('#client-tabs .equipment-icon').show();
			
			
	// 		if(index==3){
				
	// 			getLog('',function(data){
	// 				var opt = {
	// 					page_size:defPageSize,
	// 					page:defPageNumber
	// 				}
	// 				loadDetailTable(opt);
	// 			});
	// 		}
	// 		//获取流量数据
	// 		flow();
	// 		chartOne();
	// 	});
	// }
	//获取右侧列表数据
	var getList = function(){
		if(client_mac == undefined){
			client_mac = $('.group-list-particulars').find('li').first().attr('a');
		}
		var client_mac = $('.list-select').attr('a');

		var org_id = getOrg(target.data('org')).id;
		var url = _IFA['client__get_client_info'];
		var args = '?'+client_mac+'&org_id='+org_id;
		url = url + args
		var type = 'GET';
		var data = '';
		alert(url);
		_ajax(url,type,data,function (data) {
            if(data.error_code == 0){
            	//设备
            	$('.client_info_ssid').text(data.ssid_name);
           	 	//射频	
				$('.client_info_shepin').text(data.radio);
				//mac
				var str = data.mac;
				var res = '';
                	for(var i=0,len=str.length;i<len;i++){
				    res += str[i];
				    if(i < len -2 ){
					    if(i % 2 == 1) {
					    		 res = res + '-';
					    };
				    };
				};
				$('.client_info_mac').text(res);

				//在线时间
				var day = Math.floor(data.uptime/86400);    
				var hour = Math.floor(data.uptime%86400/3600);    
				var minute = Math.floor(data.uptime%86400%3600/60);
				if(day != 0){
					var time = day+'天'+hour+'小时'+minute+'分';
				}
				if(day == 0){
					if(hour != 0){
						var time = hour+'小时'+minute+'分';
					}else{
						var time = minute+'分';
					}
				}
				$('.client_info_uptime').text(time);
				//IP
				$('.client_info_ip').text(data.client_ip);
				//网关
				$('.client_info_gateway').text(data.client_gateway);
				//本地网络限速 接收
				$('.client_info_tx_local').text(data.tx_rate_limit_local);
				//本地网络限速 发送
				$('.client_info_rx_local').text(data.rx_rate_limit_local);
				//广域网络限速 接收
				$('.client_info_tx_wan').text(data.tx_rate_limit_wan);
				//广域网络限速 发送
				$('.client_info_rx_wan').text(data.rx_rate_limit_wan);
				//无线接入点
				$('.client_info_device_name').text(data.device_name);
				//频道
				$('.client_info_channel').text(data.channel);
				//传输协议
				$('.client_info_mode').text(data.mode);
				//RSSI
				$('.client_info_rssi').text(data.rssi);
				//本地网速率
				$('.client_info_rx_rate_local').text(data.rx_rate_local);
				$('.client_info_tx_rate_local').text(data.tx_rate_local);
				//广域网速率
				$('.client_info_rx_rate_wan').text(data.rx_rate_wan);
				$('.client_info_tx_rate_wan').text(data.tx_rate_wan);
				//误码率
				$('.client_info_error_rate').text(data.error_rate);
				//重试率
				$('.client_info_retry_rate').text(data.retry_rate);
				//Tx 速率
				$('.client_info_tx_negotiate_rate').text(data.tx_negotiate_rate);

				// //设置缓存
				// setCache('#client-tabs .equipment','ip',data.ipv4);//ipv4
				// setCache('#client-tabs .equipment','netmask',data.netmask);//掩码
				// setCache('#client-tabs .equipment','gateway',data.gateway);//网关
				//2.4G信道
				// console.log(data);
				
				// if(data.radios.length>0){
				// 	$.each(data.radios,function(index,node){
				// 		if(node.id==0){
				// 			if(node.state == 1){
				// 				$('.left-route-value').text(node.channel);
				// 			}else if(node.state == 0){
				// 				$('.left-route-value').text(node.channel);
				// 			};
						
				// 			//2.4G传输功率
				// 			$('.left-transmission-value').text(node.power+'dB');
				// 			//2.4G协议
				// 			if(node.mode == 12){
				// 				node.mode = 'ng';
				// 			}else if(node.mode == 4){
				// 				node.mode = 'b/g/n';
				// 			};
				// 			$('.left-deal-value').text(node.mode);
				// 			//2.4G使用率
				// 			$('.left-usage-value').text(node.channel_utilization+'%');
				// 			//2.4G重试率
				// 			$('.left-tautology-value').text(node.retry_rate+'%');
				// 			//2.4G噪声值:
				// 			$('.left-noise-value').text(node.noise+'dBm');
				// 			//2.4G误码率
				// 			$('.left-error-value').text(node.error_rate+'%');
				// 		}else if(node.id==1){
				// 			//5G传输功率
				// 			$('right-transmission-value').text(node.power+'dB');
				// 			//5G信道
				// 			if(node.state == 1){
				// 				$('.right-route-value').text(node.channel);
				// 			}else if(node.state == 0){
				// 				$('.right-route-value').text(node.channel);
				// 			};
				// 			//5G传输功率
				// 			$('.right-transmission-value').text(node.power+'dB');
				// 			//5G协议
				// 			if(node.mode == 9){
				// 				node.mode = 'na/ac';
				// 			}else if(node.mode == 16){
				// 				node.mode = 'ac';
				// 			};
				// 			$('.right-deal-value').text(node.mode);
				// 			//5G使用率
				// 			$('.right-usage-value').text(node.channel_utilization+'%');
				// 			//5G重试率
				// 			$('.right-tautology-value').text(node.retry_rate+'%');
				// 			//5G噪声值:
				// 			$('.right-noise-value').text(node.noise+'dBm');
				// 			//5G误码率
				// 			$('.right-error-value').text(node.error_rate+'%');
				// 		}
    //         		});
    //       		};
			}
      });
	};    
	//左侧树刷新
	var refreshLoad = function(){
		$('.refresh-icon').click(function(){
			$('.group-list-particulars').empty();
			ajaxTree();
		})
	}
	//获取终端详情数据
	var ajaxTree = function(){
		$('.number-total').text(clientinfo.total);
		//处理返回的数组
        $(clientinfo.list).each(function (index,data) {
         	$('.group-list-particulars').append('<li a="'+data.client_mac+'">'
          		+'<span class="li-left-connected">'
          		+'<img src="./client/images/client_table_pc.png" alt="" />'
          		+'</span>'
                +'<span class="li-left-mac">'+data.hostname+'</span>'
                +'</li>'
                );
            //绑定时机事件
        });
        $('.group-list-particulars').find('li').first().addClass('list-select');
        $('.group-list-particulars li').click(function(event) {
        	$(this).addClass('list-select').siblings().removeClass("list-select")
        });
		//获取默认数据
		getList();
		//点击左侧列表获取右侧总览数据
		// leftClick();
		//获取流量图表默认数据
		flow();
	};
	//点击箭头返回表格
	var returnTable = function(){
		var leftParticulars = $('.win-client-particulars .return-index').click(function(){
			$('.win-client-particulars').window('close');
			$('.app-client-tip').parent('li').trigger('click');
			$(tree).tree({
				onLoadSuccess:function(node, data){
					console.log(node)
					var node = $(tree).tree('find',setPage.group_ids);
					$(tree).tree('select',node.target);
					console.log(node);
				}
			});
		});
	};
	//获取流量数据
	var flow = function(){
		var timestamp1 = (new Date()).valueOf()-86400000;//获取前一天的时间戳
		console.log(timestamp1);
		var _id = $('.list-select').attr('a');//获取id
		if(_id == undefined){
			_id = $('.group-list-particulars').find('li').first().attr('a');
		};
		console.log(_id);
		var url = _IFA['ap_get_device_ﬂow_stat']+_id+'/flow'+'?begin_time='+timestamp1;
		console.log(url);
		_ajax(url,'GET','',function(data){
			if(data.error_code == 0){
				chartOne(data);
			}
		});
	}
	//流量，终端图表显示
	var chartOne = function(){
		var myChartThree = echarts.init(document.getElementById('chart-three'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionThree = {
            title: {
                text: '堆叠区域图',
                left: '8%'
            },
            color: colors,
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data:['Total', 'Tx', 'Rx'],
                right: "10%",
            },
            grid: {
                top: 55,
                bottom: 40,
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap : false,
                    axisTick:{
                        alignWithLabel: true,
                    },
                    data: [ "Noon", "3PM", "6PM", "9PM", "Ninght", "3AM", "6AM", "9AM"]
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '流量',
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
            myChartThree.setOption(optionThree, true);
        },500);

        var myChartFour = echarts.init(document.getElementById('chart-four'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionFour = {
            title: {
                text: '折柱混合',
                left: '5%'
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
                top: 55,
                bottom: 30,
            },
            legend: {
                data:['Total', 'Tx', 'Rx'],
                right: "10%",
            },
            xAxis: [
                {
                    type: 'category',
                    data: [ "Noon", "3PM", "6PM", "9PM", "Ninght", "3AM", "6AM", "9AM"],
                    axisPointer: {
                        type: 'shadow'
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '流量',
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
                    name:'Tx',
                    type:'bar',
                    data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2]
                },
                {
                    name:'Rx',
                    type:'line',
                    yAxisIndex: 0,
                    symbol: 'none',
                    data:[6.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4]
                }
            ]
        };

        setInterval(function () {
            myChartFour.setOption(optionFour, true);
        },500);
	}
	//选项卡切换
	var checkleft = function(){
		$('.client-region-west .client-tab-left').click(function(){
			//切换左侧
			$('#app-client-layout .client-region-west .client-tab .client-tab-left').css({
				'background':'#eff4fa'
			});
			$('#app-client-layout .client-region-west .client-tab .client-tab-left .client-tab-left-icon').css({
				'background':'url(./client/images/left-blue.png) no-repeat'
			});
			//切换右侧
			$('#app-client-layout .client-region-west .client-tab .client-tab-right').css({
				'background':'#fff'
			});
			$('#app-client-layout .client-region-west .client-tab .client-tab-right .client-tab-right-icon').css({
				'background':'url(./client/images/right-gray.png) no-repeat'
			});
			$('.client-region-west .client-div-left').show();
			$('.client-region-west .client-div-right').hide();
			$('.client-left-more').show();
			$('.btn-notice-client').show();
			loadTable();
		})
	}
	
	/*获取当前时间*/
	var getNowTimer = function(param){
		var date = new Date();
		var yy = date.getFullYear();
		var mm = date.getMonth()+1;
		var dd = date.getDate();
		var hh = date.getHours();
		var mm = date.getMinutes();
		var ss = date.getSeconds();
		return yy+'-'+mm+'-'+dd+' '+hh+':'+mm+':'+ss;
	}
	/*日志导出获取时间*/
	var getLogTimer = function(){
		var date = new Date();
		var str = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
		return str;
	}
	/*打开日志导出窗口*/
	var btnExportClient = function(){
		$('.export-record').click(function(){
		$('<div/>').addClass('win-export-client-abc').appendTo($('body'));
		
		$('.win-export-client-abc').window({
			width:650,
			height:300,
			title:'日志导出',
			href:'client/record.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onLoad:function(){
				//console.log($('.win-export-ap #ap-start-timer'));
				//console.log(getNowTimer());
				initDateTimer(['.client-start-timer']);
				initDateTimer(['.client-end-timer']);
				$('.win-export-client-abc .client-start-timer').datebox('setValue', getLogTimer());
				$('.win-export-client-abc .client-end-timer').datebox('setValue', getLogTimer());
				btnSubmitExportClient();
				btnConcelClient();
			},
			onClose:function(){
				$(this).window('destroy');
			}
		});
		
		$('.dropdown-menu-left').addClass('none');
      });
	}
    /*导出日志提交*/
   var btnSubmitExportClient = function(){
	   $('.win-export-client-abc .but-conserve').click(function(){
	       	var begin_time = $('.win-export-client-abc .client-start-timer').val();
	       	var begin_time_long = Date.parse(new Date(begin_time));
	       	begin_time_long = begin_time_long / 1000;
	       	
	       	var end_time = $('.win-export-client-abc .client-end-timer').val();
	       	var end_time_long = Date.parse(new Date(end_time));
	       	end_time_long = end_time_long / 1000;
	       	
            if(end_time_long<begin_time_long){
                toast('提示消息','所选日期不能小于当前日期','error');
			}else{
				var url = _IFA['ap__export_log']+'?org_ids='+19+'&begin_time='+begin_time_long;
		       	window.open(url);
		   		closeWindow('.win-export-client-abc');
			}
	   });
   }
	/*取消日志导出*/
	var btnConcelClient = function(){
		$('.win-export-client-abc .but-cancel').click(function(){
			closeWindow('.win-export-client-abc');
		});
	}


	/*------------------第四页终端详情页面结束------------------------------*/


	/*关闭窗口*/
	var closeWindow = function(winId){
		$(winId).window('close');
	};
	/*销毁窗口*/
	var destroyWindow = function(winId){
		$(winId).window('destroy',true);
	}
	/*清空form表单*/
    var clearForm = function(formId){
   		$(formId).form('clear');
    };
    /*刷新当前页*/
	var refresh = function(){
		$('.pagination-load').trigger('click');
	}

    //清除参数
	var clearSelect = function(){
		var options = {};
		$('.client-region-west .datagrid-cell-check').removeClass('cell-checked');
		//清楚筛选条件
		radios = '';
		ssid_profile_ids = '';
		device = '';
		user_ids = '';
		search = '';
		defPageNumber = 1;
		defPageSize = 10;
		userid = '';
		dzid = '';
		indexpage1 = $('#app-client-layout #indexpage').val();
		if(indexpage1 == 1){
			indexpage = 1;
			loadtype = 1;
		}
	}

		//过滤页加载列表
		if(loadtype == 1){
			//加载左侧数据
			loadTable();
		}
    	//清除参数
		clearSelect();
		/*加载树*/
		// loadTree();
		//添加更多下拉列表
		addmenuclientmore();
		//加载左侧网络，用户，设备过滤条件
		loadSelectList();
		//左侧多选框点击事件
		getCheck();
		//去掉加载条
		MaskUtil.unmask();
	}//绑定结束

	/*初始化*/
	var init = function(){
		//获取公司ID
		org_ids = getOrg(target.data('org')).parent;
	};
	/*初始化radio*/
	var initRadio = function(){
		//初始化未选中
		$('.radio-wrap input').parent('span').removeClass('radio-checked');
		$('.radio-wrap input').parent('span').addClass('normal-radio');
		
		//更新已选中
		$('.radio-wrap input:radio:checked').parent('span').addClass('radio-checked');
		$('.radio-wrap input:radio:checked').parent('span').removeClass('normal-radio');
		
		$('.radio-wrap input:radio').click(function(){
			$('.radio-wrap input:radio').parent('span').addClass('normal-radio');
			$('.radio-wrap input:radio:checked').parent('span').addClass('radio-checked');
			$('.radio-wrap input:radio:checked').parent('span').removeClass('normal-radio');
		});
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


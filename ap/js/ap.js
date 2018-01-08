/*========================================================*
 * @Title:			    user.js
 * @Description:		用户逻辑模块
 * 						在用户管理App中，org_id用的是parent
 * 						其他的App用的是id。
 * 						原因在于：用户管理属于整个Business的，但是其他资源是必须属于某个Site的。
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/
define(['jquery','functions'],function($,_f){
	/*全局变量*/
	var target = $('#page');
	var tree = ".ap-user .ap-div-left .group-list";
	var tree1 = ".ap-user .ap-div-left .group-list";
	var tree2 = ".ap-user .ap-div-right .group-list";
	var table = ".ap-user .table-ap";
	var table3 = "#app-ap-particulars-layout .table-log";
	var pagination = '.ap-user #pagination_ap';
	var pagination1 = '#app-ap-particulars-layout #pagination-ap-details';
	var defPageNumber = 1;
	var defPageSize = 10;
	var defPageList = [10,20,50];
	var org_ids = '';
	var groupSubordinate = 1;
	var _id = '';
	var _groupid = '';
	/*var result = '';*/
	
	
	
	
	
	/*定义表结构*/
	var columns = [[
		{ field: 'id', title: '',checkbox:'true', align: 'center',width:80,formatter:
            function(value,row,index){
                var str = '';
                str += '<input type="checkbox" name="" value="'+value+'"/>';
                return str;
            }
        },
        {field:'active',title:'',width:30,align:'left',formatter:
            function(value,row,index){
                if(value==1){
                }else{
                    return "<img class='icon-row-disable' src='user/images/icon-row-disable.png' />"
                }
            }
        },
        {field:'connected',title:'状态',sortable:true,align:'center',formatter:function (value,row,index) {
			if(value == 1){
				return "<span data-id="+value+">正常</span>";
			}else if(value == 0){
                return "<span data-id="+value+">断开连接</span>";
			}else if(value == 2){
                return "<span data-id="+value+">警告,负载过重</span>";
			}else{
                return "<span data-id="+value+">新增</span>";
			}
        }},	

        {field:'mac',title:'无线接入点',sortable:true,align:'center'},

        {field:'location',title:'位置',sortable:true,align:'center'},

        {field:'flow',title:'总流量',sortable:true,align:'center'},

        {field:'client_number',title:'终端',sortable:true,align:'center'},
    ]];
    
    
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
    /*加载ap详情---日志表格数据*/
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
		console.log(options)
		getLog(options,function(data){
			console.log(data)
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
    /*初始化*/
	var init = function(){
		//获取公司ID
		org_ids = getOrg(target.data('org')).parent;
	};
    /*获取用户组ID*/
	var getGid = function(){
		var node = $(tree).tree('getSelected');
		if(node !=undefined){
			return node.id;
		}
	};
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
	/*刷新当前页*/
	var refresh = function(){
		$('.pagination-load').trigger('click');
	};
	/*清空form表单*/
    var clearForm = function(formId){
   		$(formId).form('clear');
    };
    /*获取用户组*/
	var getGroups = function(func){
		var url = _IFA['ap_groups_list']+org_ids;
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
	};
	/*插入空信息*/
	var insertNodata =  function(table){
		$(table).datagrid('getPanel').find('.datagrid-body').append($('<div class="nodata"><img src="public/images/nodata.png" /><div>没有可以显示的数据</div></div>'));
		var height = $('.ap-user .app-table-detail').height();
		$('.ap-user .nodata').css({
			'height':height-50+'px',
			'line-height':height-50+'px'
		});
		$(table).datagrid('getPanel').find('.datagrid-header input').attr('disabled','disabled');
		$('.ap-user footer').addClass('none');
	};

	/*过滤数据*/
    var filterData = function(data){
		data.text=  data.text=='default'?'默认':data.text;
		return data;
    };
    /*获取选中记录*/
	var getChecked = function(){
	  	return $(table).datagrid('getChecked');
	};
	/*返回跟节点首页*/
	  var goHome = $('.ap-user .ap-region-west .nav-title').click(function(){
	  	 var root = getRoot(tree);
	  	 selectNode(root);
	  	$('.ap-user .ap-region-west .win-nav .nav-title').addClass('home-selected');
		$('.ap-user .ap-region-west .head-title-img').html('<img src="./ap/images/root-location-blue.png" />');
		
	  });
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
		var args = '?org_ids='+getOrg(target.data('org')).id + '&group_subordinate='+1 +'&group_ids='+ _group_ids;
		if(serializeJson(options)){
			args += '&'+serializeJson(options);	
		}
		url = url + args
		
		_ajax(url,type,data,callback);
	};
	/*获取日志*/
	var getLog = function(options,callback){
		
		var _id = $('.list-select').attr('a')
		var url = _IFA['ap__get_event_log'];
		var args = '?org_ids='+getOrg(target.data('org')).id+'&page_size='+1+'&type='+1;
		if(serializeJson(options)){
			args += '&'+serializeJson(options);	
		}
		
		url = url + args
		
		var type = 'GET';
		var data = '';
		console.log(url);
		_ajax(url,type,data,callback);
		
	}
	/*关闭窗口*/
	var closeWindow = function(winId){
		$(winId).window('close');
	};
	/*转换时间戳*/
	var toTimeStamp = function(timer){
		var stamp = Date.parse(new Date(timer));
		return stamp/1000;
	};
	/*验证用户是否存在*/
	/*var checkUserExist = function(name){
		var flag = true;
		var url = _IFA['user_exist'];
		var type = 'POST';
		var data = JSON.stringify({
			'org_id':org_ids,
			'name':name
		});
		_ajax(url,type,data,function(data){console.log(data);
			if(data.error_code!=0){
				toast('提示信息',data.error_message,'error');
				flag = false;
			}
		});
		return flag;
	}*/
	/*重新加载数据*/
	var loadTree = function(){
		/*载入树结构*/
		var url_groups =  _IFA['ap_groups_list']+getOrg(target.data('org')).id;/*config_devices_groups*/
		
		_ajax(url_groups,'GET','',function(data){
			if(data.error_code==0){
				
				data = data.list[0];
				
				data.children[0].text = data.children[0].text=='default'?'默认':data.children[0].text;
				$(tree).tree({
					data:[data],
					onLoadSuccess:function(node,data){
//						if($(this).tree('getSelected').id == _groupid){
//							
//						}
						if($(this).tree('getSelected')==null){
							$('.ap-region-west .win-nav .nav-title').addClass('home-selected');
							$('.ap-region-west .head-title-img').html('<img src="./ap/images/root-location-blue.png" />');
						};
						//设置滚动条高度
						adjustTreeStyle($(this));
						/*goHome.click();*/
					},
					onSelect:function(node){
						var row = $(tree).tree('getSelected');
						_groupid = node.id;
						console.log(_groupid)
						//移除树背景
						$('.ap-region-west .win-nav .nav-title').removeClass('home-selected');
						$('.ap-region-west .head-title-img').html('<img src="./ap/images/root-location.png" />');
						var options = {
							group_ids:node.id
						}
						loadTable(options);
					}
				});
			}
		});
	};
    /*加载表格数据*/
	var loadTable = function(options){
		
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
		
		
		var gid = getGid();
		if(gid!=undefined){
			options.group_ids = gid;
		}
		/*console.log(options);*/
		getUser(options,function(data){
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
							$('.ap-user .nodata').removeClass();
							$('.ap-user footer').removeClass('none');
							$(table).datagrid('getPanel').find('.datagrid-header input').removeAttr('disabled');
						}
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
					},
					onUncheck:function(rowIndex,rowData){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check').removeClass('cell-checked');
						$(panel).find('.datagrid-cell-check').eq(rowIndex).removeClass('cell-checked');
					},
					onCheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').addClass('cell-checked');
					},
					onUncheckAll:function(rows){
						var panel = $(this).datagrid('getPanel');
						$(panel).find('.datagrid-header-check,.datagrid-cell-check').removeClass('cell-checked');
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
	/*ap日志表数据加载成功事件处理*/
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
		/*console.log(optPage)*/
		loadPagination(optPage);
		
		//去掉加载条
		MaskUtil.unmask();
	}
	/*调整树结构样式*/
	var adjustTreeStyle = function(obj){
		var appLeft = $('#app-ap-layout .app-left').layout('panel','center');
		var height = $(appLeft).panel('options').height;
		obj.css({
				'height':height-140+'px',
			    'overflow-y': 'auto',
			    'overflow-x': 'hidden'
		});
		//添加默认组图标
		$('#app-ap-layout .group-list>li>ul>li:first-child .tree-icon').addClass('tree-file-default');
		//把根节点干掉
		var treeTitle = '';
		treeTitle = $('#app-ap-layout .group-list>li:first-child>div:first-child>span.tree-title').text();
		$('#app-ap-layout .nav-title .head-title-active').html(treeTitle);
		$('#app-ap-layout  .group-list>li:first-child>div:first-child').addClass('none');
		
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
					pageSize:pageSize
				}
				loadTable(opt);
				$(this).pagination('loaded');
		    },
			onRefresh:function(pageNumber, pageSize){
			},
			onChangePageSize:function(pageSize){
			}
		});
		//插入分页文件
		$('#app-ap-layout .pagination-page-list').before('每页显示数');
	}
	
	/*加载绑定*/
	var bindEven = function(){
		//切换
		checkleft();
	/*检索用户*/
	var btnSearchUser = $('.ap-region-center .btn-search-ap').click(function(){
       	searchVal = $('.ap-region-center .input-search').val()==undefined?'':$('.ap-region-center .input-search').val();
       	var options = {
       		search:searchVal
       	}
       	loadTable(options);
    });
    /*键盘检索*/
	var keySearchUser = $('.ap-region-center .input-search').unbind().bind('keydown',function(event){
        event.stopPropagation();
        var self = this;
        if(event.keyCode ==13){
           $('.ap-region-center .btn-search-ap').click();
        }
    });
    /*失焦检索*/
    $('.ap-region-center .input-search').on('input',function(){
   
    	$('.ap-region-center .btn-search-ap').click();
    });
    
	
	
	/*更多下拉列表*/
	var btnMenuMore = $('.ap-btn-menu-more').click(function(e){
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
	/*用户更多下拉列表*/
	var btnMenuUserMore = $('.btn-menu-ap-more').click(function(e){
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
	/*打开创建组窗口*/
	var btnCreateGroup = $('#app-ap-layout .btn-create-group').click(function(e){
		//验证是否是默认组
		var row = $(tree).tree('getSelected');
        onOpenDelete('.win-ap-group');
		$('.win-ap-group').window({
			width:650,
			height:366,
			title:'创建群组',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				clearForm('#create-ap-group');
				/*$(this).removeClass('save');*/
				getGroups(function(data){
						var subGroup = data.list[0].children;
						subGroup[0].text = subGroup[0].text=='default'?'默认':subGroup[0].text;
						subGroup = filterData(subGroup);
						$('.win-ap-group #select-ap-group').combotree({
						   required: true,
						   data:subGroup,
						   onLoadSuccess:function(node,data){
						   	  var group_list = $('#app-ap-layout .group-list').tree('getSelected');
                               if(!group_list){
			           			   group_list = {};
                                   group_list.id = 1;
							   };
                               if(group_list.id == 0){
                               		group_list.id = 29
                               };
                              /* console.log(group_list.id)*/
                               $('#select-ap-group').combotree('setValue',group_list.id);
						   }
						});
					});
					/*$(this).removeClass('save');*/
			},
			onClose:function(){
				
			}
		});
	});
	/*左边栏创建工作组*/
	var leftToolCreateUserGroup = $('.btn-add-group img').click(function(){
		$('#app-ap-layout .btn-create-group').click();
	});
	
	/*打开创建组窗口-取消*/
	var btnConcelUser = $('.win-ap-group .but-cancel').click(function(){
		closeWindow('.win-ap-group');			
		$('.win-ap-next-group').removeClass('save');
	});
	/*打开创建组窗口-下一步*/
	var btnSubmitConfirm = $('.win-ap-group .submit-confirm').click(function(){
		onOpenDelete('.win-ap-next-group');
		closeWindow('.win-ap-group');
		$('.win-ap-next-group').window({
			width:650,
			height:420,
			title:'设置群组默认参数',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				//2.4G协议带宽联动
				$('.win-ap-next-group .left-agreement-select').change(function(){
					if($('.win-ap-next-group .left-agreement-select').val() == 12){
						$('.win-ap-next-group .left-bandwidth-select-bottom').show();
						$('.win-ap-next-group .left-bandwidth-select').hide();
					}else{
						$('.win-ap-next-group .left-bandwidth-select-bottom').hide();
						$('.win-ap-next-group .left-bandwidth-select').show();
					}
				});
				//5G协议带宽联动
				$('.win-ap-next-group .right-agreement-select').change(function(){
					if($('.win-ap-next-group .right-agreement-select').val() == 16){
						$('.win-ap-next-group .right-bandwidth-select-bottom').show();
						$('.win-ap-next-group .right-bandwidth-select').hide();
					}else{
						$('.win-ap-next-group .right-bandwidth-select-bottom').hide();
						$('.win-ap-next-group .right-bandwidth-select').show();
					}
				});
			},
			onClose:function(){
				
			}
		});
	});
	
	/*打开创建组窗口-下一步---保存*/
	var btnCaneclConfirm = $('.win-ap-next-group .submit-confirm').click(function(){
		/*if($('.win-ap-next-group .text-checkbox').prop('checked') == true){*/
			var site = getSite();
			//创建组数据
			var result = getFormValue('.win-ap-group #create-ap-group');
			console.log(site);
			if(result.group_id == 29){
				result.group_id = 0;
			}
			console.log(result);
			//信道value
			var r24_status = $('.win-ap-next-group .left-channel-select').val();
			var r5_status = $('.win-ap-next-group .right-channel-select').val();
			
			//协议value
			var r24_mode = $('.win-ap-next-group .left-agreement-select').val();
			var r5_mode = $('.win-ap-next-group .left-agreement-select').val();
			
			//功率value
			var r24_power = $('.win-ap-next-group .left-power-select').val();
			var r5_power = $('.win-ap-next-group .right-power-select').val();
			
			//最大终端数value
			var r24_maxclients = $('.win-ap-next-group .left-terminal-selectl').val();
			var r5_maxclients = $('.win-ap-next-group .right-terminal-selectl').val();
			
			var url = _IFA['ap_create_able_list'];
			var type = 'POST';
			var r2 = getFormValue('.win-ap-next-group #create-ap-next-group');
			console.log(r2)
			var data = JSON.stringify({
				'org_id':site.id,
				'name':result.name,
				'description':result.describe,
				
				'parent':result.group_id,
				
				'r24_status':r2.r24_status,
				'r24_channel':0,
				
				'r24_mode':r2.r24_mode,
				
				'r24_bandwidth':r2.r24_bandwidth,
				
				'r24_power':r2.r24_power,
				
				'r24_maxclient':r2.r24_maxclients,
				
				'r5_status':r2.r5_status,
				'r5_channel':0,
				
				'r5_mode':r2.r5_mode,
				
				'r5_bandwidth':r2.r5_bandwidth,
				
				'r5_power':r2.r5_power,
				
				'r5_maxclient':r2.r5_maxclients,
			});
			console.log(data)
			_ajax(url,type,data,function(data){
				if(data.error_code==0){
					toast('提示消息','操作成功','success');
					closeWindow('.win-ap-next-group');
					loadTree();
				
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
		
	});
	/*打开创建组窗口-下一步---取消*/
	var btnCaneclConfirm = $('.win-ap-next-group .submit-cancel').click(function(){
		closeWindow('.win-ap-next-group');	
	});
	/*左侧树---更多---删除群组*/
	var btnDeleteGroups = $('#app-ap-layout .ap-btn-delete-group').click(function(){
		var row = $(tree).tree('getSelected');
		

		if(row==null){
			toast('提示消息','不能删除','warning');
			return false;
		};
		if(row.id == 29){
			toast('提示消息','默认组不能删除','warning');
			return false;
		};
		if(row.id == 0){
			toast('提示消息','不能删除','warning');
			return false;
		};
		if(row != undefined){
			if(row.text=='默认'){
				// toast("提示消息","默认组不可删除","error");
				return false;
		   }
		}
		var node = $(tree).tree('getSelected');
		console.log(node)
		if(node==null){
			toast('提示消息','请选择要删除的用户组','warning');
			
			return false;
		}
		console.log(node.text)
		_confirm('删除群组', '你正在尝试删除群组'+'"'+node.path+'",'+'是否继续', function(r){
			if (r){
				var url_groups = _IFA['ap_delete_able_list']+node.id;
				_ajax(url_groups,'DELETE','',function(data){
					if(data.error_code==0){
						toast('提示消息','操作成功','success');
						$(tree).tree('remove',node.target);
					}else{
						toast('提示消息',data.error_message,'error');
					}
				});
			}
		});
	});
	/*左侧树---更多---编辑群组*/
	var btnUpdateGroups = $('#app-ap-layout .ap-btn-update-group').click(function(){
		var row = $(tree).tree('getSelected');
		if(row==null){
			toast('提示消息','不能编辑','warning');
			return false;
		}
		if(row.id == 29){
			toast('提示消息','默认组不能编辑','warning');
			return false;
		}
		if(row.id == 0){
			toast('提示消息','不能编辑','warning');
			return false;
		};
	
		if(row != undefined){
			if(row.text=='默认'){
				return false;
		  };
		 	
		}
        /*onOpenDelete('.win-ap-group');*/
		$('.update-ap-group').window({
			width:650,
			height:366,
			title:'编辑群组',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				/*alert(22)*/
				clearForm('.update-ap-group #create-ap-group-form');
				/*获取数据*/
				
				var url = _IFA['ap_update_able_list']+row.id;
				_ajax(url,'GET','',function(data){
					if(data.error_code==0){
						/*console.log(data);*/
						$("input[name='name']").val(data.name);
						$("input[name='describe']").val(data.description);
						getGroups(function(data){
							var subGroup = data.list[0].children;
							subGroup = filterData(subGroup);
							$('.update-ap-group #select-ap-update-group').combotree({
							   required: true,
							   data:subGroup,
							   onLoadSuccess:function(node,data){
							   	  var group_list = $('#app-ap-layout .group-list').tree('getSelected');
	                               if(!group_list){
									   group_list = {};
	                                   group_list.id = '默认';
								   }
	                               $('.update-ap-group #select-ap-update-group').combotree('setValue', group_list.id);
							   }
							});
						});
					}else{
						toast('提示消息',data.error_message,'error');
					}
				});				
			},
			onClose:function(){
				/*$('.win-ap-next-group').removeClass('save');*/
			}
		});
	})
	
	/*打开编辑组窗口----取消*/
	var btnCaneclConfirm = $('.update-ap-group .submit-cancel').click(function(){
		closeWindow('.update-ap-group');	
	});
	/*左侧树---更多---编辑群组---下一步*/
	var btnSubmitConfirm = $('.update-ap-group .submit-confirm').click(function(){
		
		var row = $(tree).tree('getSelected');
		onOpenDelete('.update-ap-next-group');

		closeWindow('.update-ap-group');

		$('.update-ap-next-group').window({
			width:650,
			height:420,
			title:'编辑群组默认参数',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onOpen:function(){
				
				var url = _IFA['ap_update_able_list']+row.id;
				console
				_ajax(url,'GET','',function(data){
					$('.save .text-checkbox').prop('checked',true);
					console.log(data)

					if(data.error_code==0){

						//信道value
						$('.update-ap-next-group .left-channel-select option').each(function (index,value) {

							if($(value).val() == data.rf_config.r24_status){

								$(this).attr('selected','selected');
							}
                        });

						$('.update-ap-next-group .right-channel-select option').each(function (index,value) {

							if($(value).val() == data.rf_config.r5_status){

                                $(this).attr('selected','selected');
                            }

                        });
						
						//协议value
						$('.update-ap-next-group .left-agreement-select option').each(function (index,value) {
                            if($(value).val() == data.rf_config.r24_mode){

                                $(this).attr('selected','selected');
                            }
                        });

						$('.right-agreement-select option').each(function (index,value) {

							if($(value).val() == data.rf_config.r5_mode){

                                $(this).attr('selected','selected');
                            }
                        })
						
						//功率value
						$('.update-ap-next-group .left-power-select option').each(function (index,value) {
                            if($(value).val() == data.rf_config.r24_power){

                                $(this).attr('selected','selected');
                            }
                        });
						$('.update-ap-next-group .right-power-select option').each(function (index,value) {

                            if($(value).val() == data.rf_config.r5_power){

                                $(this).attr('selected','selected');
                            }
                        });

						//带宽
						$('.update-ap-next-group .left-bandwidth-select option').each(function (index,value) {

                            if($(value).val() == data.rf_config.r24_bandwidth){

                                $(this).attr('selected','selected');
                            }
                        });

						$('.update-ap-next-group .right-bandwidth-select option').each(function (index,value) {
                            if($(value).val() == data.rf_config.r5_bandwidth){

                                $(this).attr('selected','selected');
                            }
                        })
						
						//最大终端数value
						$('.update-ap-next-group .left-terminal input[name="r24_maxclients"]').val(data.rf_config.r24_maxclient);
						$('.update-ap-next-group .right-terminal input[name="r5_maxclients"]').val(data.rf_config.r5_maxclient);

					}else{
						toast('提示消息',data.error_message,'error');
						
					}
				});
				//2.4G协议带宽联动
				$('.update-ap-next-group .left-agreement-select').change(function(){
					if($('.update-ap-next-group .left-agreement-select').val() == 12){
						$('.update-ap-next-group .left-bandwidth-select-bottom').show();
						$('.update-ap-next-group .left-bandwidth-select').hide();
					}else{
						$('.update-ap-next-group .left-bandwidth-select-bottom').hide();
						$('.update-ap-next-group .left-bandwidth-select').show();
					}
				});
				//5G协议带宽联动
				$('.update-ap-next-group .right-agreement-select').change(function(){
					if($('.update-ap-next-group .right-agreement-select').val() == 16){
						$('.update-ap-next-group .right-bandwidth-select-bottom').show();
						$('.update-ap-next-group .right-bandwidth-select').hide();
					}else{
						$('.update-ap-next-group .right-bandwidth-select-bottom').hide();
						$('.update-ap-next-group .right-bandwidth-select').show();
					}
				});

				//更新数据保存
			},
			onClose:function(){
			}
		});
	});
	/*打开编辑组窗口-下一步---保存*/
	var btnCaneclConfirm = $('.update-ap-next-group .submit-confirm').click(function(){
			if($('.update-ap-next-group .text-checkbox').prop('checked') == true){
				_type = "1"
			}else{
				_type = "0"
			}
			var site = getSite();
			var row = $(tree).tree('getSelected');
			/*console.log(row.id)*/
			//创建组数据
			var result = getFormValue('.update-ap-group #create-ap-group-form');
			console.log(result)
			/*console.log(site);*/
			if(result.group_id == 29){
				result.group_id = 0;
			}
			console.log(result);
			//信道value
			var r24_status = $('.update-ap-next-group .left-channel-select').val();
			var r5_status = $('.update-ap-next-group .right-channel-select').val();
			
			//协议value
			var r24_mode = $('.update-ap-next-group .left-agreement-select').val();
			var r5_mode = $('.update-ap-next-group .left-agreement-select').val();
			
			//功率value
			var r24_power = $('.update-ap-next-group .left-power-select').val();
			var r5_power = $('.update-ap-next-group .right-power-select').val();
			
			//最大终端数value
			var r24_maxclients = $('.update-ap-next-group .left-terminal-selectl').val();
			var r5_maxclients = $('.update-ap-next-group .right-terminal-selectl').val();
			
			var url = _IFA['ap_update_able_list']+row.id;
			var type = 'PUT';
			var r2 = getFormValue('.update-ap-next-group #create-ap-next-group');
			console.log(r2)
			var data = JSON.stringify({
				'org_id':site.id,
				'name':result.name,
				'description':result.describe,
				'parent':result.group_id,
				'type':_type,
				'rf_config':{
					'r24_status':r2.r24_status,
					'r24_channel':0,
					'r24_mode':r2.r24_mode,
					'r24_bandwidth':r2.r24_bandwidth,
					'r24_power':r2.r24_power,
					'r24_maxclient':r2.r24_maxclients,
					'r5_status':r2.r5_status,
					'r5_channel':0,
					'r5_mode':r2.r5_mode,
					'r5_bandwidth':r2.r5_bandwidth,
					'r5_power':r2.r5_power,
					'r5_maxclient':r2.r5_maxclients
				}
			});
			console.log(data)
			_ajax(url,type,data,function(data){
				if(data.error_code==0){
					toast('提示消息','操作成功','success');
					closeWindow('.update-ap-next-group');
					loadTree();
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
		
	});
	/*打开编辑组窗口-下一步---取消*/
	var btnCaneclConfirm = $('.update-ap-next-group .submit-cancel').click(function(){
		closeWindow('.update-ap-next-group');	
	});
	/*添加AP设备*/
	var addApEquipment = $('#app-ap-layout .btn-menu-ap-create').click(function(){
		$('.ap-add-batch-equipment').window({
			width:650,
			height:520,
			title:'添加无线接入点',
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
					$('.ap-add-batch-equipment #select-add-ap-group').combotree({
					   required: true,
					   data:subGroup,
					   onLoadSuccess:function(node,data){
					   	  var group_list = $('#app-ap-layout .group-list').tree('getSelected');
                           if(!group_list){
							   group_list = {};
                               group_list.id = 1;
						   }
                           $('.ap-add-batch-equipment #select-add-ap-group').combotree('setValue', group_list.id);
					   }
					});
				});	
				
				//清空用户列表记录
				$('.ap-add-batch-equipment .user-list').empty();
				addapInfo('.ap-add-batch-equipment .user-list');
			
			},
			onClose:function(){

			}
		});
	});
	
	/*增加新的用户记录*/
	var addapInfo = function(classId){
		//验证重复数据
		var html = '<div class="batch-inputBox">';
		html += '<input type="text" name="mac_address" class="batch-input01 mac_address"/>';/*email*/
		html += '<input type="text" name="ap_name" class="right-input batch-input02 ap_name"/>';/*phone*/
		html += '<input type="text" name="ap_location" class="right-input batch-input02 ap_location"/>';
		if($('.ap-add-batch-equipment .batch-inputBox').length>0){
			html += '<div class="batch-delete batch-delete-selected"></div>';
		}else{
			html += '<div class="batch-add batch-add-selected"></div>';
		}
		html += '</div>';
	    var rehtml = $(html).appendTo(classId);
	    
	    $('.ap-add-batch-equipment .batch-add').unbind('click').bind('click',function(){
	    	//标记
	   		var flag = true;
	    	 //点击事件   	 
	    	$('.ap-add-batch-equipment .batch-inputBox').each(function(index,data){
	    		var mac_address = $(this).find('input[name="mac_address"]');
	    		var ap_name = $(this).find('input[name="ap_name"]');
	    		var ap_location = $(this).find('input[name="ap_location"]');
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
	    		addapInfo('.ap-add-batch-equipment .user-list');
	    	}
		    
		    $('.ap-add-batch-equipment .batch-delete').click(function(index){
		    	if($('.ap-add-batch-equipment .user-list .batch-inputBox').length>1){
		    		$(this).parent('.ap-add-batch-equipment .batch-inputBox').remove();
		    	}else{
		    		toast('提示消息','至少存在一条记录','warning');
		    		return false;
		    	};
		    });
		});
	};
	/*触发批量新增用户事件*/
	var btnBatchAddUser = $('.ap-add-batch-equipment .batch-add').click(function(){
		addapInfo('.ap-add-batch-equipment .user-list');
	});
	/*添加无线接入点-----保存*/
	var btnBatchAddAp = $('.ap-add-batch-equipment .but-conserve').click(function(){
		var result = getApFormValue('#create-ap-batch',true);
		var row = $(tree).tree('getSelected');
		result.group_id = row.id;
		console.log(row)
		console.log(result)
		var selected = getSelected(tree);
		result.org_id = getOrg(target.data('org')).id;
		if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}
		var url = _IFA['ap_add_device'];
		var type = 'POST';
		var data = JSON.stringify(result);
		
		console.log(data)
	    /*if(!checkRepeatUser()){
	    	toast('提示消息','数据重复','error');
	    	return;
	    }*/
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				toast('提示消息','操作成功','success');
				refresh();
				closeWindow('.ap-add-batch-equipment');					
			}else{
				toast('提示消息',data.error_message,'error');
			}
		});
	});
	/*添加无线节点----取消*/
	var btnBatchCancelApDev = $('.ap-add-batch-equipment .but-cancel').click(function(){
		closeWindow('.ap-add-batch-equipment');
	});
	/*AP移除功能*/
	 var btnApEnable = $('.ap-region-center .btn-enable-ap').click(function(){
	 	//获取选中的记录
		var checked = getChecked();
		console.log(checked)
		if(checked.length==0){
			toast('提示消息','请选择要删除的记录','warning');
			return ;
		}else if(checked.length==1){
			var url = _IFA['ap_delete_device']+checked[0].id;
			var type = 'DELETE';
			var data = '';
		}else if(checked.length>1){
			var url = _IFA['ap_batch_delete_device'];
			var type = 'POST';
			var ids = [];
			$.each(checked,function(index,data){
				ids.push(data.id);
			});
			data = JSON.stringify({'ids':ids});
		}
		_confirm('提示信息', '您确认要删除记录吗?', function(r){
			if (r){
				_ajax(url,type,data,function(data){
					
					if(data.error_code==0){
						toast('提示消息','操作成功','success');
						
						refresh();
					}else{
						toast('提示消息',data.error_message,'error');
					}
				});
			}
		});
	 });
	 /*AP重启功能*/
	 var btnApNotice = $('.ap-region-center .btn-notice-ap').click(function(){
	 	//获取选中的记录
	 	var row = $(tree).tree('getSelected');
	 	console.log(row)
		var checked = getChecked();
		if(checked.length==0){
			toast('提示消息','请选择要重启的设备','warning');
			return ;
		}else if(checked.length==1){
			var url = _IFA['ap_reboot_device']+checked[0].id+'/reboot';
			var type = 'POST';
			var data = '';
		}else if(checked.length>1){
			var url = _IFA['ap__batch_reboot_device']+'?group_id='+row.id;
			var type = 'POST';
			var ids = [];
			$.each(checked,function(index,data){
				ids.push(data.id);
			});
			data = JSON.stringify({'ids':ids});
		}
		_confirm('提示信息', '您确认要重启么?', function(r){
			if (r){
				_ajax(url,type,data,function(data){
					if(data.error_code==0){
						toast('提示消息','操作成功','success');
						refresh();
					}else{
						toast('提示消息',data.error_message,'error');
					}
				});
			}
		});
	 });
	 
	/*AP迁移功能*/
	var btnApMigration = $('.ap-region-center .btn-disable-ap').click(function(){
			/*var row = $(tree).tree('getSelected');*/
			var checked = getChecked();
			if(checked.length==0){
				toast('提示消息','请选择要迁移的设备','warning');
				return ;
			}/*else */
			onOpenDelete('.win-export-ap');
			$('.win-export-ap').window({
				width:650,
				height:422,
				title:'导出用户',
				headerCls:'sm-header',
				collapsible:false,
				minimizable:false,
				maximizable:false,
				resizable:false,
				modal:true,
				onOpen:function(){
					//加载树结构
					var url_groups =  _IFA['ap_groups_list']+getOrg(target.data('org')).id;
					_ajax(url_groups,'GET','',function(data){
						if(data.error_code==0){
							data = data.list[0];
							$('#tree-export-ap').tree({
								data:[data],
								checkbox:true,
								lines:false,
								onLoadSuccess:function(node,data){
									/*$('#tree-export-ap>li>ul>li:first-child .tree-icon').addClass('tree-file-default');*/
								}
							});
						}
					});
				}
			});		
			/*$('.dropdown-menu-left').addClass('none');*/
	});
	
	/*AP迁移功能---保存*/
	var saveApMigration = $('.win-export-ap .but-conserve').click(function(){
		var row = $('#tree-export-ap').tree('getSelected');
		var checked = getChecked();
		if(checked.length>0){
			var url = _IFA['ap_bulk_update_device_conﬁg'];
			var type = 'PUT';
			var ids = [];
			$.each(checked,function(index,data){
				ids.push(data.id);
			});
			data = JSON.stringify({
				'ids':ids,
				'group_id':row.id
			});
		
		}
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				toast('提示消息','操作成功','success');
				refresh();
				closeWindow('.win-export-ap');
				loadTable()
			}else{
				toast('提示消息',data.error_message,'error');
				closeWindow('.win-export-ap');
			}
		});
	});
	/*AP迁移功能---保存*/
	var saveApMigration = $('.win-export-ap .but-conserve').click(function(){
		closeWindow('.win-export-ap');
	});
	
	
	//AP右侧箭头----进入详情
	var rightParticulars = $('#app-ap-layout .right-cion').click(function(){
			$('<div/>').addClass('win-ap-particulars').appendTo($('body'));
			$('.win-ap-particulars').window({
				width:1000,
				height:550,
				title:'ap详情',
				href:'ap/detail.html',
				headerCls:'sm-header',
				collapsible:false,
				minimizable:false,
				maximizable:false,
				resizable:false,
				modal:true,
				loadingMessage:'',
				onBeforeOpen:function(){
					var winAp = $('.app-icon-ap').parent('div').next('div');
					winAp.window('close');
				},
				onLoad:function(){
					//获取左侧数据
					ajaxTree();
					//AP详情----返回表格
					returnTable();
					//点击左侧列表获取右侧总览数据
					leftClick();
					//总览----设备修改
					apEquipment();
					//总览----设备保存
					saveEquipment();
					//总览----射频修改
					amendFrequency();
					//总览---射频保存
					saveFrequency();
					//刷新
					refreshLoad();
					//信道分析----扫描按钮
					analyze();
					$('#ap-tabs').tabs({
						onSelect:function(title,index){
//							alert(index)
							switch(index){
								case 1:{
									chartOne();
									break;
								}
								case 2:{
									chartTwo();
									break;
								}
								case 3:{
									break;
								}
								case 4:{
									loadDetailTable('');
									break;
								}
								
								
							}
						}
					});
					
				},
				onClose:function(){
					$(this).window('destroy');
				}
			});	
	});
	};
	
	
	//获取ap详情数据
	var ajaxTree = function(){
		
		var url = _IFA['ap_get_device_list']+'?org_ids='+getOrg(target.data('org')).id;
//			console.log(url)
			_ajax(url,'GET','',function (data) {
//	            console.log(data);
				$('.number-total').text(data.total)
	            if(data.error_code == 0){
					
	                //处理返回的数组
	                $(data.list).each(function (index,data) {
	                	console.log(data)
	                	if(data.connected == -1){//新增
	                		data.connected = '<span class="add-status"></span>';
	                	}else if(data.connected == 0){//断开
	                		data.connected = '<span class="interrupt-status"></span>';
	                	}else if(data.connected == 1){//正常
	                		data.connected = '<span class="normal-status"></span>';
	                		
	                	}else if(data.connected == 2){//警告,严重负载
	                		data.connected = '<span class="error-status"></span>';
	                	}
	                    $('.group-list-particulars').append('<li a="'+data.id+'">'
	                      		+'<span class="li-left-connected">'+data.connected+'</span>'
	                            +'<span class="li-left-mac">'+data.display_name+'</span>'+
	                        '</li>');
	                    //绑定时机事件
	                });
	                $('.group-list-particulars').find('li').first().addClass('list-select');
					//获取默认数据
					getList();
					//点击左侧列表获取右侧总览数据
					leftClick();
					
					
	            };
	
	        });
	};
	//点击箭头返回表格
	var returnTable = function(){
		var leftParticulars = $('.win-ap-particulars .return-index').click(function(){
			$('.win-ap-particulars').window('close');
			console.log(_groupid)
			$('.app-ap-tip').parent('li').trigger('click');
			
		});
	};
	//设备修改
	var apEquipment = function(){
		$('#ap-tabs .equipment-icon').click(function(){
			$('#ap-tabs .equipment-box').hide();
			$('#ap-tabs .equipment-box-none').show();
			$('#ap-tabs .equipment-compile').show();
			$('#ap-tabs .equipment-icon').hide();
			
		});
	};
	
	//设备保存
	var saveEquipment = function(){
		$('#ap-tabs .equipment-compile').click(function(){
			//控制图标和样式的显示和隐藏
			$('#ap-tabs .equipment-box').show();
			$('#ap-tabs .equipment-box-none').hide();
			$('#ap-tabs .equipment-compile').hide();
			$('#ap-tabs .equipment-icon').show();
			//获取设备信息
			var name = $('#ap-input-none').val();
			//获取位置信息
			var location  = $('#ap-location-label-none').val();
			//获取dhcp信息
			var dhcp = $('.ap-dhcp-label').val();
			//获取ip信息
			var ip = $('.ap-ip-label-none').text();
			//获取掩码信息
			var mark = $('.ap-mark-label').text();
			//获取网关信息
			var getways = $('.ap-gateway-label').text();
			//获取dns1信息
			var dns1 = $('#ap-dns1-label').val();
			//获取dns2信息
			var dns2 = $('#ap-dns2-label').val();
			var _id = $('.list-select').attr('a')
			console.log(_id)
			var url =_IFA['ap_update_device_config']+_id;
			var type = 'PUT';
			var data = JSON.stringify({
			'radios':{
				'r24_status':name,
				'r24_channel':location,
				'r24_mode':dhcp,
				'r24_bandwidth':ip,
				'r24_power':mark,
				'r24_maxclient':getways,
				'r5_status':dns1,
				'r5_channel':dns2
				}
			});
			console.log(data);
//			_ajax(url,type,data,function(data){
//				if(data.error_code==0){
//					toast('提示消息','操作成功','success');
//					loadTree();
//				}else{
//					toast('提示消息',data.error_message,'error');
//				}
//			});
		});
	};
	//总览---射频修改
	var amendFrequency = function(){
		$('#ap-tabs .frequency-icon').click(function(){
			$('#ap-tabs .frequency-compile').show();
			$('#ap-tabs .frequency-icon').hide();
			$('#ap-tabs .ap-show').hide();
			$('#ap-tabs .ap-hide').show();
		});
	};
	//总览---射频保存
	var saveFrequency = function(){
		$('#ap-tabs .frequency-compile').click(function(){
			$('#ap-tabs .frequency-compile').hide();
			$('#ap-tabs .frequency-icon').show();
			$('#ap-tabs .ap-show').show();
			$('#ap-tabs .ap-hide').hide();
			//信道value
		var r24_status = $('#ap-tabs .left-channel-select').val();
		var r5_status = $('#ap-tabs .right-channel-select').val();
		
		//协议value
		var r24_mode = $('#ap-tabs .left-agreement-select').val();
		var r5_mode = $('#ap-tabs .left-agreement-select').val();
		
		//功率value
		var r24_power = $('#ap-tabs .left-power-select').val();
		var r5_power = $('#ap-tabs .right-power-select').val();
		
		//最大终端数value
		var r24_maxclients = $('#ap-tabs .left-terminal-selectl').val();
		var r5_maxclients = $('#ap-tabs .right-terminal-selectl').val();
		
		var _id = $('.list-select').attr('a')
		console.log(_id)
		var url =_IFA['ap_update_device_config']+_id;
		var type = 'PUT';
		var r2 = getFormValue('#ap-tabs #equipment-form');
		console.log(url)
		var data = JSON.stringify({
			'rf_config':{
				'r24_status':r2.r24_status,
				'r24_channel':0,
				'r24_mode':r2.r24_mode,
				'r24_bandwidth':r2.r24_bandwidth,
				'r24_power':r2.r24_power,
				'r24_maxclient':r2.r24_maxclients,
				'r5_status':r2.r5_status,
				'r5_channel':0,
				'r5_mode':r2.r5_mode,
				'r5_bandwidth':r2.r5_bandwidth,
				'r5_power':r2.r5_power,
				'r5_maxclient':r2.r5_maxclients
			}
		});
		console.log(data);
		_ajax(url,type,data,function(data){
				if(data.error_code==0){
					toast('提示消息','操作成功','success');
					loadTree();
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
		});
	};
	//ap详情点击
	var leftClick = function(){
		$('.win-ap-particulars .group-list-particulars li').click(function(){
			$(this).addClass('list-select').siblings().removeClass('list-select');
			getList();
			//获取日志记录
			getLog('',function(data){
				console.log(data)
			});
		});
	}
	//获取右侧列表数据
	var getList = function(){
		if(_id == undefined){
			_id = $('.group-list-particulars').find('li').first().attr('a');
		}
		console.log(_id);
		var _id = $('.list-select').attr('a');
		var url = _IFA['ap_get_device_detail']+_id;
		console.log(url)
		_ajax(url,'GET','',function (data) {
	            console.log(data);
	            if(data.error_code == 0){
	           	 	//名称	
					$('#ap-input').val(data.device_name);
					//位置	
					$('#ap-location-label').val(data.location);
					//mac
					$('.ap-mac-label').text(data.mac);
					//ip
					$('.ap-ip-label').text(data.controller_address);
					//序列号
					$('.ap-serial-label').text(data.sn);
					//软件版本号
					$('.ap-prodect-label').text(data.software_version);
					//供应商
					$('.ap-provider-label').text(data.vendor);
					//产品型号
					$('.ap-version-label').text(data.product_name);
					//cpu
					$('.ap-cpu-label').text(data.cpu_load);
					//内存
					$('.ap-internal-label').text(data.mem_load);
					//隐藏内容   名称
					$('#ap-input-none').val(data.device_name);
					//隐藏内容   位置
					$('#ap-location-label-none').val(data.location);
					//隐藏内容   ip
					$('.ap-ip-label-none').text(data.controller_address);
					
	            };
	
	      });
	};
	//信道分析--扫描按钮
	var analyze = function(){
		$('#ap-tabs .analyze').click(function(){
			$('#ap-tabs .result-analyze').show();
			
			var _id = $('.list-select').attr('a');
			var url = _IFA['ap_get_channel_analyse_result']+_id+'/channel/analyse';
			console.log(url);
			_ajax(url,'POST','',function(data){
				if(data.error_code == 0){
					console.log(data)
				}
			})
		})
	}
	//左侧树刷新
	var refreshLoad = function(){
		$('.refresh-icon').click(function(){
			
		})
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
	
	//流量，终端图表显示
	var chartTwo = function(){
		var myChartFive = echarts.init(document.getElementById('chart-five'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionFive = {
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
            myChartFive.setOption(optionFive, true);
        },500);

        var myChartSix = echarts.init(document.getElementById('chart-six'));

        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionSix = {
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
            myChartSix.setOption(optionSix, true);
        },500);
	};
	
	//选项卡切换
	var checkleft = function(){
		$('.ap-region-west .ap-tab-left').click(function(){
			//切换左侧
			$('#app-ap-layout .ap-region-west .ap-tab .ap-tab-left').css({
				'background':'#eff4fa'
			});
			$('#app-ap-layout .ap-region-west .ap-tab .ap-tab-left .ap-tab-left-icon').css({
				'background':'url(./ap/images/left-blue.png) no-repeat'
			});
			//切换右侧
			$('#app-ap-layout .ap-region-west .ap-tab .ap-tab-right').css({
				'background':'#fff'
			});
			$('#app-ap-layout .ap-region-west .ap-tab .ap-tab-right .ap-tab-right-icon').css({
				'background':'url(./ap/images/right-gray.png) no-repeat'
			});
			$('.ap-region-west .ap-div-left').show();
			$('.ap-region-west .ap-div-right').hide();
			$('.ap-left-more').show();
			$('.btn-notice-ap').show();
		})
	}
	
	/*运行主程序*/
	var run = function(){
		/*初始化*/
		init();
		/*加载树*/
		loadTree();
		/*加载表*/
		loadTable();
		/*加载绑定事件*/
		bindEven();
		//去掉加载条
		MaskUtil.unmask();
		//切换
		checkleft();
		
	}
	return {
		'run':function(){
			return run();
		}
	}
});

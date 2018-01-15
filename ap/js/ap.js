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
	var setPage = {};
	
	
	
	
	/*定义表结构*/
	var columns = [[
		{ field: 'id', title: '',checkbox:'true', align: 'center',width:80,formatter:
            function(value,row,index){
                var str = '';
                str += '<input type="checkbox" name="" value="'+value+'"/>';
                return str;
            }
       },
        {field:'connected',title:'状态',sortable:true,align:'center',formatter:function (value,row,index) {
      	
			if(value == 1){
				return "<span data-id="+value+" class='normal-status'></span>";
			}else if(value == 0){
                return "<span data-id="+value+" class='interrupt-status'></span>";
			}else if(value == 2){
                return "<span data-id="+value+" class='error-status'></span>";
			}else if(value == -1){
                return "<span data-id="+value+" class='add-status'></span>";
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
        {field:'timestamp',title:'发生时间',sortable:true,align:'center',formatter:function (value,row,index){
        	var timestamp = value;
			var newDate = new Date();
			timestamp = newDate.toLocaleDateString();
			return timestamp;
        }},

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
		getLog(options,function(data){
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
		//$(table).datagrid('getPanel').find('.datagrid-body').find('.nodata').remove();
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
		var args = '?org_ids='+getOrg(target.data('org')).id+'&type='+1+'&search='+_mac;
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
	/*隐藏窗口-应用于下一步*/
	var hideWindow = function(win){
		$(win).panel('panel').hide();
		$(win).panel('panel').next('.window-shadow').hide();
		$(win).panel('panel').next('.window-shadow').next('.window-mask').hide();
	}
	/*打开隐藏窗口*/
	var openWindow = function(win){
		$(win).panel('panel').show();
		$(win).panel('panel').next('.window-shadow').show();
		$(win).panel('panel').next('.window-shadow').next('.window-mask').show();
	}
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
		
		getUser(options,function(data){
			$(data.list).each(function (index,data){
				var str = data.mac;
				var res = '';
                	for(var i=0,len=str.length;i<len;i++){
				    res += str[i];
				    if(i < len -2 ){
					    if(i % 2 == 1) {
					    		 res = res + ':';
					    };
				    };
				};
				data.mac = res;
			})
			
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
						console.log(checked);
						if(options.total < options.page_size){
							if(checked.length == options.total){
								$(panel).find('.datagrid-header-check').addClass('cell-checked');
							}
						}else if(options.total >= options.page_size){
							if(checked.length==options.page_size){
								$(panel).find('.datagrid-header-check').addClass('cell-checked');
							}
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
		loadPagination1(optPage);
		
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
	
	
	/*加载绑定*/
	var bindEven = function(){
		/*返回跟节点首页*/
	  var goHome = $('.ap-user .ap-region-west .nav-title').click(function(){
	  	 var root = getRoot(tree);
	  	 selectNode(root);
	  	$('.ap-user .ap-region-west .win-nav .nav-title').addClass('home-selected');
		$('.ap-user .ap-region-west .head-title-img').html('<img src="./ap/images/root-location-blue.png" />');
		
	  });
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
		var row = $(tree).tree('getSelected');
		if(!row){
			row = {};
			row.id = 0;
		}
		if(row.id == 29){
			toast('提示消息','默认组不能新增','warning');
			return false;
		}
		if(row.id == '/'){
			row.id = 0;
		}
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
						
						subGroup = filterData(data.list[0]);
						console.log(subGroup);
						$('.win-ap-group #select-ap-group').combotree({
						   required: true,
						   data:[subGroup],
						   onLoadSuccess:function(node,data){
						   	  var group_list = $('#app-ap-layout .group-list').tree('getSelected');
                               if(!group_list){
			           			   group_list = {};
                                   group_list.id = 0;
							   };
//                             if(group_list.id == 0){
//                             		group_list._id = 0
//                             };
                              /* console.log(group_list.id)*/
                               $('#select-ap-group').combotree('setValue',group_list.id);
						  },
						  onShowPanel:function(){
						   	//移出下拉树列表，隐含面板
						   	$('.win-ap-group *').not('#select-ap-group,.combo *').mouseenter(function(){
						   		$('#select-ap-group').combo('hidePanel');
						   	})
						   }
						});
					});
					/*$(this).removeClass('save');*/
			},
			onClose:function(){
				$(this).window('destroy');
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
				$(this).window('destroy');
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
			if(result.group_id == '/'){
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
			//带宽value
			var r24_bandwidth = '';
			var r5_bandwidth = '';
			
			if($('.right-bandwidth-select-bottom').hasClass('none')){
				r5_bandwidth = $('.right-bandwidth-select').val(); 
			}else{
				r5_bandwidth = $('.right-bandwidth-select-bottom').val();
			}
			if($('.left-bandwidth-select-bottom').hasClass('none')){
				r24_bandwidth = $('.left-bandwidth-select').val();
			}else{
				r24_bandwidth = $('.left-bandwidth-select-bottom').val();
			}
			console.log(r24_bandwidth);
			console.log(r5_bandwidth);
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
							subGroup[0].text = subGroup[0].text=='default'?'默认':subGroup[0].text;
							subGroup = filterData(data.list[0]);
							
							$('.update-ap-group #select-ap-update-group').combotree({
							   required: true,
							   data:[subGroup],
							   onLoadSuccess:function(node,data){
							   	  var group_list = $('#app-ap-layout .group-list').tree('getSelected');
	                               if(!group_list){
									   group_list = {};
	                                   group_list.id = '默认';
								   };
	                               var getParent = $('#app-ap-layout .group-list').tree('getParent',group_list.target);
	                               console.log(getParent)
//	                               if(getParent.id == 0){
//	                               		getParent.id = '/';
//	                               };
	                               $('.update-ap-group #select-ap-update-group').combotree('setValue', getParent.id);
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
				$(this).window('destroy');
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
				$(this).window('destroy');
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
			if(result.group_id == '/'){
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
			
			//带宽value
			var r24_bandwidth = '';
			var r5_bandwidth = '';
			if($('.right-bandwidth-select-bottom').hasClass('none')){
				r5_bandwidth = $('.right-bandwidth-select').val();
			}else{
				r5_bandwidth = $('.right-bandwidth-select-bottom').val();
			}
			if($('.left-bandwidth-select-bottom').hasClass('none')){
				r24_bandwidth = $('.left-bandwidth-select').val();
			}else{
				r24_bandwidth = $('.left-bandwidth-select-bottom').val();
			}
			console.log(r24_bandwidth);
			console.log(r5_bandwidth);
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
		$('<div/>').addClass('win-create-ap').appendTo($('body'));
		$('.win-create-ap').window({
			width:650,
			height:520,
			title:'添加无线接入点',
			href:'ap/win-create-ap.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			loadingMessage:'',
			onLoad:function(){
				/*clearForm('.update-ap-group #create-ap-group');*/
				getGroups(function(data){
					console.log(data)
					var subGroup = data.list[0].children;
					subGroup[0].text = subGroup[0].text=='default'?'默认':subGroup[0].text;
//					subGroup = filterData(data.list[0]);
					
					$('.win-create-ap #select-add-ap-group').combotree({
					   required: true,
					   data:subGroup,
					   onLoadSuccess:function(node,data){
					   	  var group_list = $('#app-ap-layout .group-list').tree('getSelected');
					   	  console.log(group_list)
                           if(!group_list){
							   group_list = {};
                               group_list.id = 29;
						   }
                           if(group_list.id == 0){
                           		group_list.id = 29;
                           }
                        
                           $('.win-create-ap #select-add-ap-group').combotree('setValue',group_list.id);
					   },
					   onShowPanel:function(){
					   	//移出下拉树列表，隐含面板
					   	$('.win-create-ap *').not('#select-add-ap-group,.combo *').mouseenter(function(){
					   		$('#select-add-ap-group').combo('hidePanel');
					   	})
					   }
					});
				});	
				
				//清空用户列表记录
				$('.ap-add-batch-equipment .user-list').empty();
				addapInfo('.ap-add-batch-equipment .user-list');
				//退出
				closeCreatAp();
				//保存
				createApMac();
			},
			onClose:function(){
				$(this).window('destroy');
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
	    			
	    		}else if(mac_address.val()!=''){//验证MAC地址
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
	/*mac地址输入格式*/
	var onKeydownMac = $(document).on('keydown','.ap-add-batch-equipment .mac_address',function(){
		verificationMac($(this));
	});
	/*添加无线接入点-----保存*/
	var createApMac = function(){
		$('.ap-add-batch-equipment .but-conserve').click(function(){
			var result = getApFormValue('#create-ap-batch',true);
			console.log(result.list.length);
			console.log(result.list[0].mac);
			var length = result.list.length;
			if(result.list.length ==1){
				if(!result.list[0].mac){
					toast('提示消息','请填写mac地址','warning');
					return
				}
			}else{
				if(!isMac(result.list[length-1].mac)){
					toast('提示消息','请填写正确mac地址','warning');
					return
				}else{
					if(!result.list[length-1].mac){
						toast('提示消息','请填写mac地址','warning');
						return
					}
				}
			}
			var row = $(tree).tree('getSelected');
			if(!row){
				row = {};
				row.id = 0;
			}
			if(row.id == 0){
				row.id = 29;
			}
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
					closeWindow('.win-create-ap');					
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
		});
	}
	/*添加无线节点----取消*/
	var closeCreatAp = function(){
		$('.ap-add-batch-equipment .but-cancel').click(function(){
			$('.win-create-ap').window('destroy');
		});
	}

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
			};
			$('<div/>').addClass('win-export-migration-window').appendTo($('body'));
			$('.win-export-migration-window').window({
				width:650,
				height:422,
				title:'导出用户',
				href:'ap/win-export-migration.html',
				headerCls:'sm-header',
				collapsible:false,
				minimizable:false,
				maximizable:false,
				resizable:false,
				modal:true,
				loadingMessage:'',
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
									$('#tree-export-ap>li>ul>li:first-child .tree-icon').addClass('tree-file-default');
								}
							});
						}
					});
				},
				onClose:function(){
					$(this).window('destroy')
				}
				
			});		
			/*$('.dropdown-menu-left').addClass('none');*/
	});
	
	/*AP迁移功能---保存*/
	var saveApMigration = $('.win-export-migration .but-conserve').click(function(){
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
	
	//关闭桌面AP应用
	var closeApWindow = function(appclass){
		var app_id = $(appclass).parent('li').attr('app_id');
		$('div[w_id="'+app_id+'"]').window('close');
	}
	
	//AP右侧箭头----进入详情
	var rightParticulars = $('#app-ap-layout .right-cion').click(function(){
			
			var app_id = $('.app-ap-tip').parent('li').attr('app_id');
			
			hideWindow($('div[w_id="'+app_id+'"]'));
			
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
					//日志导出				
					btnExportAp();
					$('#ap-tabs').tabs({
						onSelect:function(title,index){
							switch(index){
								case 1:{
									//flow();
									//临时chartOne();
									getLog('',function(data){
										var opt = {
											page_size:defPageSize,
											page:defPageNumber
										}
										loadDetailTable(opt);
									})
									break;
								}
								case 2:{
									channel()
									
									
									//chartTwo();
									break;
								}
								case 3:{
									break;
								}
								case 4:{
									
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
		if(setPage.page==undefined){
			setPage.page =1;
		}
		var url = _IFA['ap_get_device_list']+'?org_ids='+getOrg(target.data('org')).id+'&group_ids='+_groupid+'&page='+setPage.page;
			_ajax(url,'GET','',function (data) {
	            console.log(data);
				$('.number-total').text(data.total)
	            if(data.error_code == 0){
	                //处理返回的数组
	                $(data.list).each(function (index,data) {
	                	if(data.connected == -1){//新增
	                		data.connected = '<span class="add-status"></span>';
	                	}else if(data.connected == 0){//断开
	                		data.connected = '<span class="interrupt-status"></span>';
	                	}else if(data.connected == 1){//正常
	                		data.connected = '<span class="normal-status"></span>';
	                		
	                	}else if(data.connected == 2){//警告,严重负载
	                		data.connected = '<span class="error-status"></span>';
	                	}
	                	var str = data.display_name;

	                    $('.group-list-particulars').append('<li a="'+data.id+'" mac="'+data.mac+'">'
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
					//获取流量图表默认数据
					flow();
					//
					channel();
	            };
	
	        });
	};
	//点击箭头返回表格
	var returnTable = function(){
		var leftParticulars = $('.win-ap-particulars .return-index').click(function(){
			$('.win-ap-particulars').window('close');
			var app_id = $('.app-ap-tip').parent('li').attr('app_id');
			openWindow($('div[w_id="'+app_id+'"]'));
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
			var tab = $('#ap-tabs').tabs('getSelected');
			var index = $('#ap-tabs').tabs('getTabIndex',tab);
			if(index==1){
				getLog('',function(data){
					var opt = {
						page_size:defPageSize,
						page:defPageNumber
					}
					loadDetailTable(opt);
				});
			}
			//获取流量数据
			flow();
//			//渲染流量
//			chartOne();
		});
	}
	//获取右侧列表数据
	var getList = function(){
		if(_id == undefined){
			_id = $('.group-list-particulars').find('li').first().attr('a');
		}
		var _id = $('.list-select').attr('a');
		var url = _IFA['ap_get_device_detail']+_id;
		_ajax(url,'GET','',function (data) {
	            if(data.error_code == 0){
	           	 	//名称	
					$('#ap-input').val(data.device_name);
					//位置	
					$('#ap-location-label').val(data.location);
					//mac
					var str = data.mac;
					var res = '';
	                	for(var i=0,len=str.length;i<len;i++){
					    res += str[i];
					    if(i < len -2 ){
						    if(i % 2 == 1) {
						    		 res = res + ':';
						    };
					    };
					};
					$('.ap-mac-label').text(res);
					//ip
					$('.ap-ip-label').text(data.ipv4);
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
					$('.ap-ip-label-none').text(data.ipv4);
					//2.4G信道
					console.log(data);
					
					if(data.radios.length>0){
						$.each(data.radios,function(index,node){
							if(node.id==0){
								if(node.state == 1){
									$('.left-route-value').text(node.channel);
								}else if(node.state == 0){
									$('.left-route-value').text(node.channel);
								};
							
								//2.4G传输功率
								$('.left-transmission-value').text(node.power+'dB');
								//2.4G协议
								if(node.mode == 12){
									node.mode = 'ng';
								}else if(node.mode == 4){
									node.mode = 'b/g/n';
								};
								$('.left-deal-value').text(node.mode);
								//2.4G使用率
								$('.left-usage-value').text(node.channel_utilization+'%');
								//2.4G重试率
								$('.left-tautology-value').text(node.retry_rate+'%');
								//2.4G噪声值:
								$('.left-noise-value').text(node.noise+'dBm');
								//2.4G误码率
								$('.left-error-value').text(node.error_rate+'%');
							}else if(node.id==1){
								//5G传输功率
								$('right-transmission-value').text(node.power+'dB');
								//5G信道
								if(node.state == 1){
									$('.right-route-value').text(node.channel);
								}else if(node.state == 0){
									$('.right-route-value').text(node.channel);
								};
								//5G传输功率
								$('.right-transmission-value').text(node.power+'dB');
								//5G协议
								if(node.mode == 9){
									node.mode = 'na/ac';
								}else if(node.mode == 16){
									node.mode = 'ac';
								};
								$('.right-deal-value').text(node.mode);
								//5G使用率
								$('.right-usage-value').text(node.channel_utilization+'%');
								//5G重试率
								$('.right-tautology-value').text(node.retry_rate+'%');
								//5G噪声值:
								$('.right-noise-value').text(node.noise+'dBm');
								//5G误码率
								$('.right-error-value').text(node.error_rate+'%');
							}
	            		});
	          		};
				}
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
				//临时chartOne(data);
			}
		});
	}
	//流量，终端图表显示
	var chartOne = function(data){
		var myChartThree = echarts.init(document.getElementById('chart-three'));
		var Total_data = [];
		var Tx_data = [];
		var Rx_data = [];
		$(data.list).each(function(index,value){
			Total_data.push(data.list[index].total_bytes/1024/1024);
			Tx_data.push(data.list[index].tx_bytes/1024/1024);
			Rx_data.push(data.list[index].rx_bytes/1024/1024);
		});
        var colors = ['#8ec6ad', '#d14a61', '#675bba'];

        optionThree = {
            title: {
                text: '流量',
                left: '5%'
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
                    data: Total_data
                },
                {
                    name:'Tx',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: Tx_data
                },
                {
                    name:'Rx',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: Rx_data
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
                text: '终端',
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
	//获取信道利用率数据
	var channel = function(){
		var timestamp1 = (new Date()).valueOf()-86400000;//获取前一天的时间戳
		var _id = $('.list-select').attr('a');//获取id
		if(_id == undefined){
			_id = $('.group-list-particulars').find('li').first().attr('a');
		};
		var url = _IFA['ap_get_device_RF_utilization_stat']+_id+'/rf'+'?begin_time='+timestamp1;
		_ajax(url,'GET','',function(data){
			if(data.error_code == 0){
				//chartOne(data);
				console.log(data)
				//临时chartTwo(data)
			};
		});
	};
	//射频图表显示
	var chartTwo = function(data){
		
		var myChartFive = echarts.init(document.getElementById('chart-five'));
		var Total_data = [];
		var utilization_24g_data = [];//2.4G信道
		var utilization_5g_data = [];//5G信道
		var noise_5g_data = [];//5G声燥值
		var noise_24g_data = [];//2.4G声燥值
		$(data.list).each(function(index,value){
			utilization_24g_data.push(data.list[index].utilization_24g);
			utilization_5g_data.push(data.list[index].utilization_5g);
			noise_24g_data.push(data.list[index].noise_24g*-1);
			noise_5g_data.push(data.list[index].noise_5g*-1)
		});
		console.log(noise_24g_data)
        var colors = ['#8ec6ad', '#d14a61', '#675bba'];
		
        optionFive = {
            title: {
                text: '信道利用率',
                left: '5%'
            },
            color: colors,
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data:['Total', '2.4G', '5G'],
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
                    name: '信道利用率',
                    nameGap: 8,
                    axisLabel: {
                        formatter: '{value}'
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
                    data: Total_data
                },
                {
                    name:'2.4G',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: utilization_24g_data
                },
                {
                    name:'5G',
                    type:'line',
                    xAxisIndex: 0,
                    smooth: true,
                    symbol: 'none',
                    data: utilization_5g_data
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
                text: '声燥值',
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
                data:['Total', '2.4G', '5G'],
                right: "10%",
            },
            xAxis: [
                {
                    type: 'category',
                    data: [ "Noon",'1PM','2PM', "3PM",'4PM','5PM', "6PM",'7PM','8PM', "9PM", '10PM','11PM',"Ninght",'1AM','2AM', "3AM",'4AM','5AM', "6AM", "7AM", "8AM", "9AM", "10AM", "11AM"],
                    axisPointer: {
                        type: 'shadow'
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '声燥值',
//                  min: 0,
//                  max: 250,
//                  interval: 50,
                    nameGap: 10,
                    axisLabel: {
                        formatter: '{value} '
                    }
                }
            ],
            dataZoom: [
            {
                show: true,
                start: 0,
                end: 50
            },
            {
                type: 'inside',
                start: 94,
                end: 100
            }
//          {
//              show: true,
//              yAxisIndex: 0,
//              filterMode: 'empty',
//              width: 30,
//              height: '80%',
//              showDataShadow: false,
//              left: '93%'
//          }
        ],
            series: [
                {
                    name:'5G',
                    type:'bar',
                    data:noise_5g_data
                },
                {
                    name:'2.4G',
                    type:'bar',
                    data:noise_24g_data
                },
                {
                    name:'Total',
                    type:'line',
                    yAxisIndex: 0,
                    symbol: 'none',
                    //data:[6.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4]
                }
            ]
        };
		 myChartSix.setOption(optionSix, true);
        setInterval(function () {
           
        },5000);
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
	/*打开日志导出窗口*/
	var btnExportAp = function(){
		$('.export-record').click(function(){
		$('<div/>').addClass('win-export-ap-abc').appendTo($('body'));
		
		$('.win-export-ap-abc').window({
			width:650,
			height:300,
			title:'日志导出',
			href:'ap/record.html',
			headerCls:'sm-header',
			collapsible:false,
			minimizable:false,
			maximizable:false,
			resizable:false,
			modal:true,
			onLoad:function(){
				//console.log($('.win-export-ap #ap-start-timer'));
				//console.log(getNowTimer());
				initDateTimer(['.ap-start-timer']);
				initDateTimer(['.ap-end-timer']);
				$('.win-export-ap-abc .ap-start-timer').datetimebox('setValue', getNowTimer());
				$('.win-export-ap-abc .ap-end-timer').datetimebox('setValue', getNowTimer());
				btnSubmitExportAp();
				btnConcelAp();
			},
			onClose:function(){
				$(this).window('destroy');
			}
		});
		
		$('.dropdown-menu-left').addClass('none');
      });
	}
    /*导出日志提交*/
   var btnSubmitExportAp = function(){
	   $('.win-export-ap-abc .but-conserve').click(function(){
	       	var begin_time = $('.win-export-ap-abc .ap-start-timer').val();
	       	var begin_time_long = Date.parse(new Date(begin_time));
	       	begin_time_long = begin_time_long / 1000;
	       	
	       	var end_time = $('.win-export-ap-abc .ap-end-timer').val();
	       	var end_time_long = Date.parse(new Date(end_time));
	       	end_time_long = end_time_long / 1000;
	       	
            if(end_time_long<begin_time_long){
                toast('提示消息','所选日期不能小于当前日期','error');
			}else{
				var url = _IFA['ap__export_log']+'?org_ids='+19+'&begin_time='+begin_time_long;
		       	window.open(url);
		   		closeWindow('.win-export-ap-abc');
			}
	   });
   }
	/*取消日志导出*/
	var btnConcelAp = function(){
		$('.win-export-ap-abc .but-cancel').click(function(){
			closeWindow('.win-export-ap-abc');
		});
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


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
	var tree = ".group-list";
	var table = ".table-user";
	var pagination = '#pagination_user';
	var defPageNumber = 1;
	var defPageSize = 10;
	var defPageList = [10,20,50];
	var org_ids = '';
	var groupSubordinate = 1;
	
	/*定义表结构*/
	var columns = [[
		{ field: 'id', title: '',checkbox:'true', align: 'center',width:50,formatter:
            function(value,row,index){
                var str = '';
                str += '<input type="checkbox" name="" value="'+value+'"/>';
                return str;
            }
        },
        {field:'active',title:'',width:30,align:'left',formatter:
        	function(value,row,index){
        		if(value==1){
        			return "<img src='user/images/icon-row-enable.png' />";
        		}else{
        			return "<img src='user/images/icon-row-disable.png' />"
        		}
        	}
        },
		{field:'email',title:'邮箱',width:140,sortable:true,align:'center'},
		{field:'phone',title:'电话',width:140,sortable:true,align:'center'},
		{field:'first_name',title:'姓名',width:160,sortable:true,align:'center'},
		{field:'expire_at',title:'过期',sortable:true,align:'center',formatter:
			function(value,row,index){
				if(value>0){
					return toTimeString(value);
				}else if(value==0){
					return '从不过期';
				}else if(value==-1){
					return '过期';
				}
			}
		}
    ]];
    
    /*过滤数据*/
   var filterData = function(data){
   		data = JSON.stringify(data);
		data = $.parseJSON(data.replace(/name/g,'text'));
		return data;
   }
   
   /*获取选中记录*/
  var getChecked = function(){
  	return $(table).datagrid('getChecked');
  }
   
   /*清空form表单*/
   var clearForm = function(formId){
   		$(formId).form('clear');
   }
	
	
	/*追加结点*/
	var appendNode = function(tree,data){
		data = JSON.stringify(data);
		data = $.parseJSON(data.replace(/name/g,'text'));
		var selected = $(tree).tree('getSelected');
		console.log(selected);
		if(selected!=null){
			if(selected.is_default==1){
				selected = getRoot(tree);
			}
		}else{
			selected = getRoot(tree);
		}
		
		$(tree).tree('append',{
			parent:selected.target,
			data:[data]
		});
	}
	/*更新结点*/
	var updateNode = function(tree,data){
		data = filterData(data);
		var selected = $(tree).tree('getSelected');
		$(tree).tree('update',{
			target:selected.target,
			text:data.text
		});
	}
	/*调整树结构样式*/
	var adjustTreeStyle = function(obj){
		obj.css({
			    'height': '70%',
			    'overflow-y': 'auto',
			    'overflow-x': 'hidden'
		});
		//添加默认组图标
		$('.group-list>li>ul>li:first-child .tree-icon').addClass('tree-file-default');
		//把根节点干掉
		var treeTitle = '';
		treeTitle = $('.group-list>li:first-child>div:first-child>span.tree-title').text();
		$('.nav-home-title').text(treeTitle);
		$('.group-list>li:first-child>div:first-child').addClass('none');
	}
	/*重新加载数据*/
	var loadTree = function(){
		/*载入树结构*/
		var url_groups =  _IFA['groups_list']+getOrg(target.data('org')).parent;
		_ajax(url_groups,'GET','',function(data){
			if(data.error_code==0){
				data = JSON.stringify(data);
				data = $.parseJSON(data.replace(/name/g,'text'));
				data = data.list[0];
				$(tree).tree({
					data:[data],
					loadFilter:function(data){
						return data;
					},
					onLoadSuccess:function(node,data){
						//设置滚动条高度
						adjustTreeStyle($(this));
					},
					onSelect:function(node){
						var options = {
							group_ids:node.id
						}
						loadTable(options);
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
				messager(resp.error_message);
				return false;
			}else{
				func(resp);
			};
		});
	}
	
	/*获取用户组ID*/
	var getGid = function(){
		var node = $(tree).tree('getSelected');
		if(node !=undefined){
			return node.id;
		}
	}
	
	/*选择树节点*/
	var selectNode = function(node){
		$(tree).tree(node.target);
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
		
		getUser(options,function(data){console.log(data);
			if(data.error_code==0){
				$(table).datagrid({
					data:data.list,
					columns:columns,
					fitColumns:true,
					onBeforeLoad:function(param){
						
					},
					onLoadSuccess:function(){
						if(options==undefined){
							options = {};
						}
						options.total = data.total;
						onTableSuccess(data,options);
					},
					onSortColumn:function(sort, order){
						var opt ={
							sort:sort,
							page:options.page,
							page_size:options.page_size
						}
						loadTable(opt);
					}
				});
			}
		});
	}
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
			total:options.total,
			pageNumber:pageNumber,
			pageSize:pageSize,
			pageList:defPageList
		}
		loadPagination(optPage);
		
		
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
		    beforePageText: '跳至',//页数文本框前显示的汉字 
		    afterPageText: '页',//页数文本框后显示的汉字 
		    layout:['prev','links','next','list','manual','info','sep','refresh'],
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
				//reloadTable();
			}
		});
		/*分页汉化*/
		$('.pagination-page-list option').each(function(){
			$(this).val($(this).text());
			$(this).text($(this).text()+'条/页');
		});
	}
	/*重新加载数据-no*/
	var reloadTable = function(){
		var url = _IFA['user_local']+'?org_ids='+org_ids;
		var type = 'GET';
		_ajax(url,type,'',function(data){
			if(data.error_code==0){
				$(table).datagrid('reload',JSON.stringify(data.list));
			}
		});
	}
	/*获取JSON元素个数-一维数组*/
	var getJsonLen = function(json){
		var len = 0;
		for(var i in json){
			len++;
		}
		return len;
	}
	/*序列化json*/
	var serializeJson = function(json){
		var result = '';
		var len = getJsonLen(json);
		if(len>0){
			var i = 0;
			$.each(json, function(index,data) {
				result +=index;
				result +='=';
				result +=data;
				i++;
				if(i<len){
					result +='&';
				}
			});
		}
		return result;
	}
	
	/*获取用户*/
	var getUser = function(options,callback){
		var url = _IFA['user_local'];
		var type = 'GET';
		var data = '';
		var args = '?org_ids='+org_ids+'&group_subordinate='+groupSubordinate;
		if(serializeJson(options)){
			args += '&'+serializeJson(options);	
		}
		url += args;
		
		_ajax(url,type,data,callback);
	}
	
	/*检索用户*/
	var findUser = function(){
		var searchVal = $('.input-search').val()==undefined?'':$('.input-search').val();
		var options = {
			search:searchVal
		}
		loadTable(options);
	}
	
	/*获取根节点*/
	var getRoot = function(tree){
			return $(tree).tree('getRoot');
		}
	
	/*获取树节点*/
	var findNode = function(groupId){
		return $(tree).tree(groupId);
	}
		
	/*获取默认或选中结点*/
	var getSelected = function(tree){
		return $(tree).tree('getSelected')==null?getRoot(tree):$(tree).tree('getSelected');
	}
	
	/*关闭窗口*/
	var closeWindow = function(winId){
		$(winId).window('close');
	}
	/*销毁窗口*/
	var destroyWindow = function(winId){
		$(winId).window('destroy',true);
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
			    	
			    }
			});
			
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
			    	
			    }
			});
			
			/*调整时间位置*/
			var panel = $(val).datetimebox('panel');
			$(panel).parent('.combo-p').addClass('adjust-timer');
		});
		
		
	}
	/*转换时间戳*/
	var toTimeStamp = function(timer){
		var stamp = Date.parse(new Date(timer));
		return stamp/1000;
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
	 /*更新行数据*/
	  var updateRow = function(index,row){
		var url = _IFA['user_update']+row.id;
		var type = 'PUT';
		var data = JSON.stringify({
			group_id:row.group_id,
			active:row.active
		});
		_ajax(url,type,data,function(data){
			$(table).datagrid('updateRow',{
		  		index:index,
		  		active:row.active
		  	});	
		  	$(table).datagrid('refreshRow',index);
		});
	  }
	/*获取所有和更新过的用户数*/
	var getUserAmount = function(callback){
		var url = _IFA["user_brief"]+'?org_ids='+org_ids;
		var type = "GET";
		var data = '';
		_ajax(url,type,data,callback);
	}
	
	
	/*初始化*/
	var init = function(){
		//获取公司ID
		org_ids = getOrg(target.data('org')).parent;
		
		//初始化时间格式
		initDateTimer(['#user-timer','#user-batch-timer','#user-resetpassword-timer']);
	}
	
	/*增加新的用户记录*/
	var addUserInfo = function(classId){
		var html = '<div class="batch-inputBox">';
		html += '<input type="text" name="email" class="batch-input01"/>';
		html += '<input type="text" name="phone" class="batch-input02"/>';
		html += '<div class="batch-delete batch-delete-selected"></div>';
		html += '</div>';
	    var rehtml = $(html).appendTo(classId);
	    rehtml.find('.batch-delete').click(function(index){
	    	if($('.user-list .batch-inputBox').length>1){
	    		$(this).parent('.batch-inputBox').remove();
	    	}else{
	    		messager('至少存在一条记录');
	    		return false;
	    	};
	    });
	}
	
	/*绑定事件*/
	var bindEven = function(){
		
		/*收缩*/
		var btnToCollect = $('.btn-to-collect img').click(function(){
			$('.win-nav').css('display','none');
			$('.win-nav-small').css('display','table-cell');
		});
		/*展开*/
		var btnToExpand = $('.btn-to-expand img').click(function(){
			$('.win-nav-small').css('display','none');
			$('.win-nav').css('display','table-cell');
		});
		/*更多下拉列表*/
		var btnMenuMore = $('.btn-menu-more').click(function(e){
			var self = this;
			if($(this).next('ul').hasClass('none')){
				$(this).next('ul').removeClass('none');
				$(this).addClass('open');
			}else{
				$(this).next('ul').addClass('none');
				$(this).removeClass('open');
			}
			
			$(document).unbind().bind("click",function(e){
				$('.dropdown-menu').addClass('none');
				$('.btn').removeClass('open');
			});
			e.stopPropagation();
		});
		
		/*用户新增下拉列表*/
		var btnMenuUserCreate = $('.btn-menu-user-create').click(function(e){
			var self = this;
			if($(this).next('ul').hasClass('none')){
				$(this).next('ul').removeClass('none');
				$(this).addClass('open');
			}else{
				$(this).next('ul').addClass('none');
				$(this).removeClass('open');
			}
			
			$(document).unbind().bind("click",function(e){
				$('.dropdown-menu').addClass('none');
				$('.btn').removeClass('open');
			});
			e.stopPropagation();
		});
		
		/*用户更多下拉列表*/
		var btnMenuUserMore = $('.btn-menu-user-more').click(function(e){
			var self = this;
			if($(this).next('ul').hasClass('none')){
				$(this).next('ul').removeClass('none');
				$(this).addClass('open');
			}else{
				$(this).next('ul').addClass('none');
				$(this).removeClass('open');
			}
			$(document).unbind().bind("click",function(e){
				$('.dropdown-menu').addClass('none');
				$('.btn').removeClass('open');
			});
			e.stopPropagation();
		});
		
		/*创建用户组提交*/
		var btnSubmitConfirm = $('.submit-confirm').click(function(){
			var result = getFormValue('#create-user-group');
			var org = getOrg(target.data('org'));
			result['org_id'] = org.parent;
			var node = getSelected(tree);
			if(node.is_default==1){
				result['parent'] = node.parent;
			}else{
				result['parent'] = node.id;
			}
			if(result['parent']==-1){
				result['parent'] = node.id;
			}console.log(node);
			if(!$('#win-create-group').hasClass('save')){
				var url = _IFA['groups_create'];
				var type = 'POST';
			}else{
				var url = _IFA['groups_update']+getSelected(tree).id;
				var type = 'PUT';
			};
			
			if(!result.name){
				messager('用户组名称不能为空！');
				return false;
			}
			var data = JSON.stringify(result);
			_ajax(url,type,data,function(resp){console.log(resp);
				if(resp.error_code!=0){
					messager(resp.error_message);
					return false;
				}else{
					messager('操作成功');
					$('#create-user-group').form('clear');
					$('#win-create-group').window('close');
					if(!$('#win-create-group').hasClass('save')){
						appendNode(tree,resp);
					}else{
						updateNode(tree,resp);
					}
					return true;
				};
			});
		});
		
		/*取消用户组提交*/
		var btnSubmitCancel = $('.submit-cancel').click(function(){
			$('#win-create-group').window('close');
			$('#create-user-group').form('clear');
		});
		
		/*修改用户组*/
		var btnUpdateGroup = $('.btn-update-group').click(function(){
			var node = $(tree).tree('getSelected');
			if(node==null){
				messager('请选择要修改的用户组');
				return false;
			}
			$('#win-create-group').window({
				width:650,
				height:366,
				title:'修改用户组',
				headerCls:'sm-header',
				collapsible:false,
				minimizable:false,
				maximizable:false,
				resizable:false,
				modal:true,
				onOpen:function(){
					$('#create-user-group').form('clear');
					$("input[name='name']").val(node.text);
					if(node.memo!=undefined){
						$("input[name='memo']").val(node.memo);
					}
					$(this).addClass('save');
				}
			});
		});
		
		/*删除用户组*/
		var btnDeleteGroup = $('.btn-delete-group').click(function(){
			var node = $(tree).tree('getSelected');
			if(node==null){
				messager('请选择要删除的用户组');
				return false;
			}
			$.messager.confirm('提示信息', '您确认要删除记录吗?', function(r){
				if (r){
					var url_groups = _IFA['groups_delete']+node.id;
					_ajax(url_groups,'DELETE','',function(data){
						if(data.error_code==0){
							messager('操作成功');
							$(tree).tree('remove',node.target);
						}else{
							messager(data.error_message);
						}
					});
				}
			});
			
		});
		
		/*逐条新增用户-保存*/
		var btnConserveUser = $('#win-add-user .but-conserve').click(function(){
			var result = getFormValue('#create-user');
			result.org_id = org_ids;
			//获取用户组
			//result.group_id = getSelected(tree).id;
			if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}
			if(!$('#win-add-user').hasClass('save')){
				var url = _IFA['user_create'];
				var type = 'POST';
				var data = JSON.stringify(result);
				
			}else{
				var checked = getChecked();console.log(checked);
				var url = _IFA['user_update']+checked[0].id;
				var type = 'PUT';
				var data = JSON.stringify(result);
			};
			_ajax(url,type,data,function(data){
				if(data.error_code==0){
					messager('操作成功');
					clearForm('#create-user');
					$('#win-add-user').window('close');
					loadTable();
				}else{
					messager(data.error_message);
				}
			});
			
		});
		
		/*逐条新增用户-保存&新增*/
		var btnConserveNewUser = $('#win-add-user .but-update').click(function(){
			var result = getFormValue('#create-user');
			result.org_id = org_ids;
			//result.group_id = getSelected(tree).id;
			if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}
			if(!$('#win-add-user').hasClass('save')){
				var url = _IFA['user_create'];
				var type = 'POST';
				var data = JSON.stringify(result);
				
			}else{
				var checked = getChecked();
				var url = _IFA['user_update']+checked[0].id;
				var type = 'PUT';
				var data = JSON.stringify(result);
			};
			_ajax(url,type,data,function(data){
				if(data.error_code==0){
					messager('操作成功');
					clearForm('#create-user');
					loadTable();
				}else{
					messager(data.error_message);
				}
			});
		});
		
		/*逐条新增用户-取消*/
		var btnConcelUser = $('#win-add-user .but-cancel').click(function(){
			clearForm('#create-user');
			closeWindow('#win-add-user');
		});
		
		/*更新用户窗口*/
		var btnEditUser = $('.btn-edit-user').click(function(){
			var checked = getChecked();
			var len = getJsonLen(checked);
			if(len==0){
				messager('请选择要编辑的用户');
				return false;
			}else if(len==1){
				$('#win-add-user').window({
					width:650,
					height:579,
					title:'修改用户',
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
							$('#select-user-group').combotree({
							   required: true,
							   data:subGroup,
							   onLoadSuccess:function(node,data){
							   	    console.log(data);
							   	  	//设置记录的信息
									var node = checked[0];
									var group = findNode(node.group_id);
									node.group_name = group.text;
									$("input[name='first_name']").val(node.first_name);
									$("input[name='email']").val(node.email);
									$("input[name='phone']").val(node.phone);
									$("input[name='password']").val(node.password);
									$('#select-user-group').combotree('setValue', { id: node.group_id, text:node.group_name});
									$(".select-box").find("option[value='"+node.country_code+"']").prop("selected",true);
									var active = node.expire_at;
									if(active>0){
										active = 1;
										node.expire_at=toTimeString(node.expire_at);
									}else{
										node.expire_at=getNowTimer();
									}console.log(active);
									$('#user-timer').datetimebox('setValue', node.expire_at);
									$("input[name='select_expire'][value='"+active+"']").prop("checked",true); 
							   }
							});
						});
						
						$(this).addClass('save');
					},
					onClose:function(){
						clearForm('#create-user');
					}
				});	
			}else if(len>1){
				$('#win-update-batch-user').window({
					width:650,
					height:490,
					title:'批量修改用户',
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
							$('#select-batch-user').combotree({
							   required: true,
							   data:subGroup,
							   onLoadSuccess:function(node,data){
							   	  	//设置记录的信息
									var node = checked[0];
									var group = findNode(node.group_id);
									node.group_name = group.text;
									$('#select-batch-user').combotree('setValue', { id: node.group_id, text:node.group_name});
							   }
							});
						});
						
						//获取所选的用户数量
						var selections = $(table).datagrid('getSelections');
						var firstName = selections[0].email;
						var len = selections.length;
						//加载数量
						$('#win-update-batch-user .people').text(firstName);
						$('#win-update-batch-user .amount').text(len);
						
					}
				});	
			}
		});
		
		
		
		/*删除用户*/
		var btnDeleteUser = $('.btn-delete-user').click(function(){
			//获取选中的记录
			var checked = getChecked();
			
			if(checked.length==0){
				messager('请选择要删除的记录');
				return ;
			}else if(checked.length==1){
				var url = _IFA['user_delete']+checked[0].id;
				var type = 'DELETE';
				var data = '';
			}else if(checked.length>1){
				var url = _IFA['user_delete_bulk'];
				var type = 'POST';
				var ids = [];
				$.each(checked,function(index,data){
					ids.push(data.id);
				});
				data = JSON.stringify({'ids':ids});
			}
			$.messager.confirm('提示信息', '您确认要删除记录吗?', function(r){
				if (r){
					_ajax(url,type,data,function(data){
						if(data.error_code==0){
							messager('操作成功');
							loadTable();
						}else{
							messager(data.error_message);
						}
					});
				}
			});
			
			
		});
		
		/*检索用户*/
		var btnSearchUser = $('.btn-search-user').click(function(){
           	var searchVal = $('.input-search').val()==undefined?'':$('.input-search').val();
           	var options = {
           		search:searchVal
           	}
           	loadTable(options);
        });
        
        /*键盘检索*/
		var keySearchUser = $('.input-search').unbind().bind('keydown',function(event){
            event.stopPropagation();
            var self = this;
            if(event.keyCode ==13){
               $('.btn-search-user').click();
            }
        });
        
        /*导入用户提交*/
       var btnImportUser = $('#win-import-user .but-conserve').click(function(){
       		var data=new FormData($("#import-user-form")[0]);
       		var url = _IFA['user_import'];
       		var type = 'POST';
       		var override = $("input[name='importUser']:checked").val();
       		data.append('org_id',org_ids);
       		_ajax(url,type,data,function(data){
       			//调用导入结果
       			winImportUserResult(data);
       		});
			
       });
        
        /*导出用户提交*/
       var btnExportUser = $('#win-export-user .but-conserve').click(function(){
       		var nodes = $('#tree-export-user').tree('getChecked');
       		var groupIds = '';
       		$.each(nodes, function(index,data) {
       			if(nodes.length>1){
       				groupIds +='&group_ids[]='+data.id;
       			}else{
	       			
	       			groupIds +='&group_ids='+data.id;
       			}
       		});
       		
       		var url = _IFA['user_export']+'?org_id='+org_ids+groupIds+'&group_subordinate=0';
            window.open(url);
       		closeWindow('#win-export-user');
       });
       
       /*取消导出用户提交*/
       var btnCancelExportUser = $('#win-export-user .but-cancel').click(function(){
       		closeWindow('#win-export-user');
       });
       
       /*关闭导入结果*/
       var btnCancelImportResult = $('#win-import-user-result .but-conserve').click(function(){
       		closeWindow('#win-import-user-result');
       });
       
       /*导入文件提示处理*/
       var btnChangeFilePrompt = $('#rel-file').change(function(){
       		var filename = getFileName('#rel-file');
       		$('.file-prompt').text(filename);
       });
       
	   /*下载实例文件*/
	   var downloadUserTemplate = $('.but-sample').click(function(){
	   	   var url = './public/templates/user-demo.csv';
	   	   window.open(url);
	   });
	   /*下载用户导入结果*/
	   var downloadUserImportResult = $('#win-import-user-result .but-download').click(function(){
	   	var url = _IFA['user_export_result']+'?org_id='+org_ids;
	   	   window.open(url);
	   });
	   /*返回跟节点首页*/
	  var goHome = $('.nav-home-title').click(function(){
	  	 var root = getRoot(tree);
	  	 selectNode(root);
	  	 loadTable();
	  });
	 
	  
	  /*用户启用*/
	 var btnUserEnable = $('.btn-enable-user').click(function(){
	 	var checked = getChecked();
	 	if(checked.length==1){
	 		checked = checked[0];
	 		checked.active = 1;
	 		var rowIndex=$(table).datagrid('getRowIndex',checked);
	 		updateRow(rowIndex,checked);
	 	}else if(checked.length>1){
	 		//获取所有记录
	 		var result = {};
	 		var selected = $(table).datagrid('getSelections');
	 		var ids = [];
	 		$.each(selected,function(index,data){
	 			ids.push(data.id);
	 		});
	 		result.ids = ids;
	 		result.active = 1;
	 		//提交批量更新状态
	 		var url = _IFA['user_update_bulk'];
			var type = 'PUT';
			var data = JSON.stringify(result);
			
			_ajax(url,type,data,function(data){
				console.log(data);
				if(data.error_code==0){
					messager('操作成功');
					loadTable();
				}else{
					messager(data.error_message);
				}
			});
	 	}else{
	 		messager('请选择用户');
	 		return false;
	 	}
	 });
	 /*用户禁用*/
	 var btnUserDisable = $('.btn-disable-user').click(function(){
	 	var checked = getChecked();
	 	if(checked.length==1){
	 		checked = checked[0];
	 		checked.active = 0;
	 		var rowIndex=$(table).datagrid('getRowIndex',checked);
	 		updateRow(rowIndex,checked);
	 	}else if(checked.length>1){
	 		//获取所有记录
	 		var result = {};
	 		var selected = $(table).datagrid('getSelections');
	 		var ids = [];
	 		$.each(selected,function(index,data){
	 			ids.push(data.id);
	 		});
	 		result.ids = ids;
	 		result.active = 0;
	 		//提交批量更新状态
	 		var url = _IFA['user_update_bulk'];
			var type = 'PUT';
			var data = JSON.stringify(result);
			
			_ajax(url,type,data,function(data){
				console.log(data);
				if(data.error_code==0){
					messager('操作成功');
					loadTable();
				}else{
					messager(data.error_message);
				}
			});
	 	}else{
	 		messager('请选择用户');
	 		return false;
	 	}
	 });
	/*批量新增用户退出*/
	var btnCancelBatchUser = $('#win-add-batch-user .but-cancel').click(function(){
		closeWindow('#win-add-batch-user');
	});
	/*批量新增用户保存*/
	var btnAddBatchUser = $('#win-add-batch-user .but-conserve').click(function(){
		var result = getFormValue('#create-user-batch',true);
		var selected = getSelected(tree);
		result.org_id = org_ids;
		if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}
		var url = _IFA['user_create_bulk'];
		var type = 'POST';
		var data = JSON.stringify(result);
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				messager('操作成功');
				loadTable();
				closeWindow('#win-add-batch-user');					
			}else{
				messager(data.error_message);
			}
		});
	});
	/*批量修改用户-退出*/
	var btnBatchUpdateUserExit = $('#win-update-batch-user .but-cancel').click(function(){
		closeWindow('#win-update-batch-user');
	});
	/*批量修改用户-保存并退出*/
	var btnBatchUpdateUserSave = $('#win-update-batch-user .but-conserve01').click(function(){
		//获取数据
		var result = getFormValue('#form-batch-update-user');
		//获取所选的用户
		result.ids = [];
		var selections = $(table).datagrid('getSelections');
		$.each(selections, function(index,data) {
			result.ids.push(data.id);
		});
		if(result.select_expire<=0){
			result.expire_at = result.select_expire;
		}else{
			result.expire_at = toTimeStamp(result.expire_at);
		}
		//当密码为指定密码时，取value值
		if(result.select_reset_password==1){
			result.password = result.reset_password_value;
			if(result.password.length<8 && result.password.length>0){
				messager('密码不小于8位');
				return false;
			}
		}
		if(result.select_reset_password==2){
			result.random_password =1;
		}
		delete result.reset_password_value;
		delete result.select_expire;
		delete result.select_reset_password;
		
		var url = _IFA['user_update_bulk'];
		var type = 'PUT';
		var data = JSON.stringify(result);
		
		_ajax(url,type,data,function(data){
			console.log(data);
			if(data.error_code==0){
				messager('操作成功');
				loadTable();
				closeWindow('#win-update-batch-user');
			}else{
				messager(data.error_message);
			}
		});
	});
	/*发送通知*/
	var sendNotice = $('#win-notice-user .but-conserve').click(function(){
		var result = getFormValue('#form-notice-user');
		var url = _IFA['user_notify_email'];
		var type = 'POST';
		result.org_id = org_ids;
		result.subject = '发送通知';
		
		if(result.notice_range==undefined){
			messager('请选择通知范围');
			return false;
		}
		if(result.content<1){
			result.content = '欢迎使用Oakridge网络！您的wifi登录账号是#email#，您的初始密码是#password#。你可以在连接网络后，通过登录“http：//pwd.me”，来更改您的密码。';
		}else{
			if(result.content.indexOf('#email#')<0 || result.content.indexOf('#password#')<0){
				messager('您的内容缺少#email#和#password#标识符！');
				return false;
			}
		}
		switch(result.notice_range){
			case 1:{
				//获取被选中的用户ID
				result.ids = [];
				var node = $(table).datagrid('getSelections');
				$.each(node,function(index,data){
					result.ids.push(data.id);
				});
				break;
			}
			case 2:{
				result.update = 1;
				break;
			}
			case 3:{
				break;
			}
		}
		if(result.notice_type==2){
			messager('暂不支持短信方式');
			return false;
		}
		var data = JSON.stringify(result);
		
		//获取数据
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				messager('发送成功');
				closeWindow('#win-notice-user');
			}else{
				messager(data.error_message);
			}
		});
	});
	/*触发批量新增用户事件*/
	var btnBatchAddUser = $('#win-add-batch-user .batch-add').click(function(){
		addUserInfo('.user-list');
	});
	  /*打开创建组窗口*/
		var btnCreateGroup = $('.btn-create-group').click(function(){
			$('#win-create-group').window({
				width:650,
				height:366,
				title:'新增用户组',
				headerCls:'sm-header',
				collapsible:false,
				minimizable:false,
				maximizable:false,
				resizable:false,
				modal:true,
				onOpen:function(){
					clearForm('#create-user-group');
					$(this).removeClass('save');
				}
			});
		});
		
		/*打开导入用户窗口*/
		var winInportUser = $('.btn-import-user').click(function(){
			$('#win-import-user').window({
				width:650,
				height:355,
				title:'导入用户',
				headerCls:'sm-header',
				collapsible:false,
				minimizable:false,
				maximizable:false,
				resizable:false,
				modal:true,
				onOpen:function(){
					//初始化文件
					$('#rel-file').val('');
					$('.file-prompt').text('未选取任何文件');
				}
			});		
		});
		
		
		
		/*打开导出用户窗口*/
		var winExportUser = $('.btn-export-user').click(function(){
			$('#win-export-user').window({
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
					var url_groups =  _IFA['groups_list']+getOrg(target.data('org')).parent;
					_ajax(url_groups,'GET','',function(data){
						if(data.error_code==0){
							data = JSON.stringify(data);
							data = $.parseJSON(data.replace(/name/g,'text'));
							data = data.list[0];
							$('#tree-export-user').tree({
								data:[data],
								checkbox:true,
								lines:true,
								onLoadSuccess:function(node,data){
									$("#tree-export-user span[class^='tree-icon tree-file']").remove();
								}
							});
						}
					});
				}
			});		
		});
		
		/*打开逐条新增用户窗口*/
		var winNewUser = $('.btn-new-user').click(function(){
			$('#win-add-user').window({
				width:650,
				height:579,
				title:'新增用户',
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
						$('#select-user-group').combotree({
						   required: true,
						   data:subGroup,
						   onLoadSuccess:function(node,data){console.log(data);
						   	  //设置默认值
						   	  $('#select-user-group').combotree('setValue', { id: data[0].id, text:data[0].text}); 
						   	  $('#select-box-mobile').find("option[value='1']").prop("selected",true);
						   	  $('#user-timer').datetimebox('setValue', getNowTimer());
						   }
						});
					});
					$(this).removeClass('save');
				},
				onClose:function(){
					clearForm('#create-user');
				}
			});		
		});
		
		/*打开批量新增用户窗口*/
		var winBatchNewUser = $('.btn-batch-new-user').click(function(){
			$('#win-add-batch-user').window({
				width:650,
				height:639,
				title:'批量新增用户',
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
						$('#select-batch-user-group').combotree({
						   required: true,
						   data:subGroup,
						   onLoadSuccess:function(node,data){console.log(data);
						   	  //设置默认值
						   	  $('#select-batch-user-group').combotree('setValue', { id: data[0].id, text:data[0].text}); 
						   	  console.log(getNowTimer());
						   	  $('#user-batch-timer').datetimebox('setValue', getNowTimer());
						   }
						});
					});
					//清空用户列表记录
					$('#win-add-batch-user .user-list').empty();
					addUserInfo('.user-list');
					$(this).removeClass('save');
				}
			});		
		});
		
		
		/*打开用户通知窗口*/
		var winNoticeUser = $('.btn-notice-user').click(function(){
			$('#win-notice-user').window({
				width:650,
				height:523,
				title:'通知',
				headerCls:'sm-header',
				collapsible:false,
				minimizable:false,
				maximizable:false,
				resizable:false,
				modal:true,
				onOpen:function(){
					//查看通知是否被选中
					var checked = getChecked();
					if(checked.length==0){
						$('.notice-choice-selected').hide();
						$('input:radio[name="notice_range"]').eq(0).prop('checked',false);
					}else{
						$('.notice-choice-selected').show();
						$('input:radio[name="notice_range"]').eq(0).prop('checked',true);
						$(".selected-user-notice").text(checked.length);
					}
					//获取更新过的用户数
					getUserAmount(function(data){console.log(data);
						$(".update-user-notice").text(data.update);
						$(".all-user-notice").text(data.total);
					});
				}
			});		
		});
		/*打开导入结果页面*/
		var winImportUserResult = function(data){
			if(data.error_code==0){
				$('#win-import-user-result').window({
					width:650,
					height:387,
					title:'导入结果',
					headerCls:'sm-header',
					collapsible:false,
					minimizable:false,
					maximizable:false,
					resizable:false,
					modal:true,
					onOpen:function(){
						closeWindow('#win-import-user');
						//写入导入结果信息
						$('#win-import-user-result .user-import-total').text(data.total);
						$('#win-import-user-result .user-import-error').text(data.error);
						$('#win-import-user-result .user-import-ignore').text(data.ignore);
						$('#win-import-user-result .user-import-success').text(data.success);
					}
				});
			}else{
				messager(data.error_message);
			}
		};
		
	}
	
	/*运行主程序*/
	var run = function(){
		/*初始化*/
		init();
		
		/*加载表*/
		loadTree();
		
		/*加载表*/
		loadTable();
		
		/*绑定事件*/
		bindEven();
	}
	
	return {
		'run':function(){
			return run();
		}
	}
	
});


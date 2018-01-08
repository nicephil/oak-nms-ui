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
	var tree = "#app-user-layout .group-list";
	var table = "#app-user-layout .table-user";
	var pagination = '#app-user-layout #pagination_user';
	var defPageNumber = 1;
	var defPageSize = 10;
	var defPageList = [10,20,50];
	var org_ids = '';
	var groupSubordinate = 1;
    var searchVal = '';//查询条件
    var sortOrder = '';//排序条件

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
        			//return "<img src='user/images/icon-row-enable.png' />";
        		}else{
        			return "<img class='icon-row-disable' src='user/images/icon-row-disable.png' />"
        		}
        	}
        },
		{field:'email',title:'邮箱',sortable:true,align:'center'},
		{field:'phone',title:'电话',sortable:true,align:'center',formatter:
            function(value,row,index){
			console.log(row)
				if(row.country_code==undefined){
                    return value;
				}else{
                    return '+'+row.country_code+' '+value;
				}

            }},
		{field:'first_name',title:'姓名',sortable:true,align:'center'},
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
		data.text=  data.text=='default'?'默认':data.text;
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
		var selected = $(tree).tree('getSelected');
		if(selected!=null){
			if(selected.is_default==1){
				selected = getRoot(tree);
			}
		}else{
			selected = getRoot(tree);
		}
		
		$(tree).tree('append',{
			parent:selected.target,
			data:[{
				id: data.id,
				text: data.name,
			}]
		});
	}
	/*更新结点*/
	var updateNode = function(tree,data){
		data = filterData(data);
		var selected = $(tree).tree('getSelected');
		$(tree).tree('update',{
			target:selected.target,
			text:data.name,
		});
	}
	/*调整树结构样式*/
	var adjustTreeStyle = function(obj){
		var appLeft = $('#app-user-layout .app-left').layout('panel','center');
		var height = $(appLeft).panel('options').height;
		obj.css({
				'height':height-140+'px',
			    'overflow-y': 'auto',
			    'overflow-x': 'hidden'
		});
		//添加默认组图标
		$('#app-user-layout .group-list>li>ul>li:first-child .tree-icon').addClass('tree-file-default');
		//把根节点干掉
		var treeTitle = '';
		treeTitle = $('#app-user-layout .group-list>li:first-child>div:first-child>span.tree-title').text();
		$('#app-user-layout .nav-home-title .head-title-active').html(treeTitle);
		$('#app-user-layout  .group-list>li:first-child>div:first-child').addClass('none');
		
	}
	/*刷新当前页*/
	var refresh = function(){
		$('.pagination-load').trigger('click');
	}
	/*重新加载数据*/
	var loadTree = function(){
		/*载入树结构*/
		var url_groups =  _IFA['groups_list']+getOrg(target.data('org')).parent;
		_ajax(url_groups,'GET','',function(data){
			if(data.error_code==0){
				data = data.list[0];
				data.children[0].text = data.children[0].text=='default'?'默认':data.children[0].text;
				$(tree).tree({
					data:[data],
					loadFilter:function(data){
						return data;
					},
					onLoadSuccess:function(node,data){
						if($(this).tree('getSelected')==null){
							$('.user-region-west .win-nav .nav-home-title').addClass('home-selected');
							$('.user-region-west .head-title-img').html('<img src="user/images/icon-home-white.png" />');
						};
						//设置滚动条高度
						adjustTreeStyle($(this));
					},
					onSelect:function(node){
						//选中默认时  更多的 hover
                        $('.btn-menu-more').next('ul.dropdown-menu').find('li').not('.btn-export-user').removeClass('disable-default');
                        $('.btn-create-group').removeClass('disable-default');

						if($(this).tree('getSelected').text=="默认"){
							$('.btn-menu-more').next('ul.dropdown-menu').find('li').not('.btn-export-user').addClass('disable-default');
							$('.btn-create-group').addClass('disable-default');
							$('.btn-menu-more').next('ul.dropdown-menu').find('li.btn-export-user').mouseenter(function(){
								$(this).removeClass('li-hover');
								$(this).addClass('li-normal');
							});
							//针对导出效果
							$('.btn-menu-more').next('ul.dropdown-menu').find('li.btn-export-user').mouseenter(function(){
								$(this).addClass('li-hover');
							}).mouseleave(function(){
								$(this).removeClass('li-hover');
								$(this).addClass('li-normal');
							});
						}else{
							$('.btn-menu-more').next('ul.dropdown-menu').find('li').mouseenter(function(){
								$(this).addClass('li-hover');
							}).mouseleave(function(){
								$(this).removeClass('li-hover');
							});
						}
						//移除树背景
						$('.user-region-west .win-nav .nav-home-title').removeClass('home-selected');
						$('.user-region-west .head-title-img').html('<img src="user/images/icon-home.png" />');
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
	
	/*插入空信息*/
	var insertNodata =  function(){
		$(table).datagrid('getPanel').find('.datagrid-body').append($('<div class="nodata"><img src="public/images/nodata.png" /><div>没有可以显示的数据</div></div>'));
		var height = $('.app-table').height();
		$('.nodata').css({
			'height':height-50+'px',
			'line-height':height-50+'px'
		});
		$(table).datagrid('getPanel').find('.datagrid-header input').attr('disabled','disabled');
		$('footer').addClass('none');
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
							insertNodata();
						}else{
							$('.user-user footer').removeClass('none');
							$(table).datagrid('getPanel').find('.datagrid-header input').removeAttr('disabled');
						}
						onTableSuccess(data,options);
					},
					onSortColumn:function(sort, order){
                        sortOrder = sort+' '+order;
						var opt ={
                            search:searchVal,
							sort:sortOrder,
							page:options.page,
							page_size:options.page_size
						}
						loadTable(opt);
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
                    search:searchVal,
                    sort:sortOrder,
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
		$('#app-user-layout .pagination-page-list').before('每页显示数');
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
		searchVal = $('.input-search').val()==undefined?'':$('.input-search').val();
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
		return $(tree).tree('find',groupId);
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
			    	
			    },
                onSelect: function(date){
                    var mydate = new Date();
                    var selectDate = date.getTime()/1000;
                    var toDay = new Date(mydate.toLocaleDateString()).getTime()/1000;
                    if(selectDate<toDay){
                        toast('提示消息','所选日期不能小于当前日期','error');
					}
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
		  	if(data.error_code==0){
				toast('提示消息','操作成功','success');
				refresh();
			}else{
				toast('提示消息',data.error_message,'error');
			}
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
		initDateTimer(['#user-timer','#user-update-timer','#user-batch-timer','#user-resetpassword-timer']);
	}
	/*验证用户是否存在*/
	var checkUserExist = function(name){
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
	}
	var isRepeat = function (arr) {
	   var hash = {};
	   for(var i in arr) {
	       if(hash[arr[i]])
	       {
	           return true;
	       }
	       hash[arr[i]] = true;
	    }
	   return false;
	}
	//验证重复数据
	var checkRepeatUser = function(){
		var flag = true;
		var emailArray = [];
		var phoneArray = [];
		$('.batch-inputBox').each(function(index,data){
			var email = $(this).find('input[name="email"]');
			var phone = $(this).find('input[name="phone"]');
			emailArray.push(email);
			phoneArray.push(phone);
		});
		
		if(isRepeat(emailArray)||isRepeat(phoneArray)){
			return true;
		};
		return false;
	};
	/*增加新的用户记录*/
	var addUserInfo = function(classId){
		//验证重复数据

		var country = '<select class="country select-box-mobile" name="country_code" >';
	
		country += '<option value="86">+86</option>';
		country += '<option value="1">+1</option>';

		country += '</select>';
		
		var html = '<div class="batch-inputBox">';
		html += '<input type="text" name="email" class="batch-input01 email"/>';
		html += country;
		html += '<input type="text" name="phone" class="right-input batch-input02 phone"/>';
		if($('.batch-inputBox').length>0){
			html += '<div class="batch-delete batch-delete-selected"></div>';
		}else{
			html += '<div class="batch-add batch-add-selected"></div>';
		}
		html += '</div>';
	    var rehtml = $(html).appendTo(classId);
	    
	    $('.win-add-batch-user .batch-add').unbind('click').bind('click',function(){
	    	//标记
	   		var flag = true;
	    	 //点击事件
	    	$('.win-add-batch-user .batch-inputBox').each(function(index,data){
	    		var email = $(this).find('input[name="email"]');
	    		var phone = $(this).find('input[name="phone"]');
	    		
	    		//验证空值
	    		if(email.val()==''&&phone.val()==''){
	    			flag = false;
	    			toast('提示信息','邮箱和手机不能全为空值！','warning');
	    			email.focus();
	    			return;
	    		}
	    		
	    		//验证邮箱
	    		if(email.val()!=''){
	    			if(!checkEmail(email.val())){
	    				flag = false;
	    				toast('提示信息','邮箱格式错误！','error');
	    				return;
	    			};
	    			//远端验证
	    			if(!checkUserExist(email.val())){
	    				flag = false;
	    				return;
	    			}
	    		}
	    		//验证电话
	    		if(phone.val()!=''){
	    			if(!checkPhone(phone.val(),phone.prev('#select-box-mobile').val())){
	    				flag = false;
	    				toast('提示信息','电话格式错误！','error');
	    				phone.focus();
	    				return;
	    			};
	    			//远端验证
	    			if(!checkUserExist(phone.val())){
	    				flag = false;
	    				return;
	    			}
	    		}
	    	});
	    	if(flag==true){
	    		addUserInfo('.win-add-batch-user .user-list');
	    	}
	    });
	    
	    $('.win-add-batch-user .batch-delete').click(function(index){
	    	if($('.win-add-batch-user .user-list .batch-inputBox').length>1){
	    		$(this).parent('.win-add-batch-user .batch-inputBox').remove();
	    	}else{
	    		toast('提示消息','至少存在一条记录','warning');
	    		return false;
	    	};
	    });
	}
	
	/*监听面板调整*/
	var listPanel = function(){
		//调整左侧树的滚动条
		var center = $('#app-user-layout').layout('panel','center');
		$(center).panel({
			onResize:function(width,height){
				var h = height-125;
				//控制表格
				$('.app-table').css({
					height:h+'px',
					'overflow-y':'auto',
					'overflow-x':'none'
				});
				
				$('.user-region-west .win-nav .group-list').css({
					height:h-10+'px'
				});
			}
		});
	}
	
	/*关闭时间组件*/
	var closeDateTimer = function(){
		var timers = ['#user-timer','#user-batch-timer','#user-resetpassword-timer'];
		$.each(timers,function(index,data){
			$(data).datetimebox('hidePanel');
		});
	}
		
	/*移除时间时触发*/
	var moveDateTimer = function(){
		var timers = ['#user-timer','#user-batch-timer','#user-resetpassword-timer'];
		$.each(timers,function(index,data){
			var combo = $(data).datetimebox('panel');
			$(combo).mouseleave(function(){
				$(data).datetimebox('hidePanel');
			});
		});
	}
	/*更新form表单信息*/
	var updateUserForm = function(data){
		var checked = $(table).datagrid('getChecked');
		var node = checked[0];
		var group = findNode(node.group_id);
		node.group_name = group.text;
		$(".win-update-user input[name='first_name']").val(node.first_name);
		$(".win-update-user input[name='email']").val(node.email);
		$(".win-update-user input[name='phone']").val(node.phone);
		$(".win-update-user input[name='password']").val(node.password);
		$('#select-update-user-group').combotree('setValue', { id: node.group_id, text:node.group_name});
		$(".win-update-user .select-box").find("option[value='"+node.country_code+"']").prop("selected",true);
		var active = node.expire_at;
		if(active>0){
			active = 1;
			node.expire_at=toTimeString(node.expire_at);
		}else{
			node.expire_at=getNowTimer();
		}
		$('#user-update-timer').datetimebox('setValue', node.expire_at);
		$(".win-update-user input[name='select_expire'][value='"+active+"']").prop("checked",true); 
	}
	
	/*打开导入结果页面*/
	var winImportUserResult = function(data){
		onOpenDelete('.win-import-user-result');
		if(data.error_code==0){
			$('.win-import-user-result').window({
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
					$('.win-import-user-result .user-import-total').text(data.total);
					$('.win-import-user-result .user-import-error').text(data.error);
					$('.win-import-user-result .user-import-ignore').text(data.ignore);
					$('.win-import-user-result .user-import-success').text(data.success);
				}
			});
		}else{
			toast('提示消息',data.error_message,'error');
		}
	};
	
	/*屏蔽日期*/
	var readonlyTimer = function(win,timerId){
	  //屏蔽日期输入
   	  $(win+' '+timerId).datetimebox('readonly',true);
   	  //去掉默认事件
   	  $(win+' .combo-arrow').click(function(e){
   	  	 return false;
   	  });
   	  //去掉默认事件-从不过期
   	  $(win+' input[name="select_expire"][value="0"]').click(function(){
   	  		$(win+' '+timerId).datetimebox('readonly',true);
   	  		$(win+' .combo-arrow').unbind().bind('click',function(e){
   	  			return false;
	   	  	});
   	  });
   	  //绑定事件
   	  $(win+' input[name="select_expire"][value="1"]').click(function(){
   	  		$('.combo-arrow').unbind().bind('click',function(){
   	  			$(win+' '+timerId).datetimebox('readonly',false);
   	  		});
   	  });
	}
	
	/*绑定事件*/
	var bindEven = function(){
		/*更多下拉列表*/
		var btnMenuMore = $('.user-region-west .btn-menu-more').click(function(e){
			var self = this;
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
		
		/*用户新增下拉列表*/
		var btnMenuUserCreate = $('.btn-menu-user-create').click(function(e){
			var self = this;
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
		
		/*用户更多下拉列表*/
		var btnMenuUserMore = $('.btn-menu-user-more').click(function(e){
			var self = this;
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
			}
			if(!$('.win-create-group').hasClass('save')){
				var url = _IFA['groups_create'];
				var type = 'POST';
			}else{
				var url = _IFA['groups_update']+getSelected(tree).id;
				var type = 'PUT';
			};
			
			if(!result.name){
				toast('提示消息','用户组名称不能为空','warning');
				return false;
			}
			var data = JSON.stringify(result);
			_ajax(url,type,data,function(resp){
				if(resp.error_code!=0){
					toast('提示消息',resp.error_message,'success');
					return false;
				}else{
					toast('提示消息','操作成功','success');
					$('#create-user-group').form('clear');
					$('.win-create-group').window('close');
					if(!$('.win-create-group').hasClass('save')){
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
			$('.win-create-group').window('close');
			$('#create-user-group').form('clear');
		});
		
		/*修改用户组*/
		var btnUpdateGroup = $('.btn-update-group').click(function(){
			var row = $(tree).tree('getSelected');
			if(row != undefined){
				if(row.text=='默认'){
					return false;
			   }
			}
			onOpenDelete('.win-create-group');
			var node = $(tree).tree('getSelected');
			if(node==null){
				toast('提示消息','请选择要修改的用户组','warning');
				return false;
			}
			$('.win-create-group').window({
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
					if(node.memo!=""){
						$("textarea[name='memo']").val(node.memo);
					}
					$(this).addClass('save');
					
				}
			});
		});
		
		/*删除用户组*/
		var btnDeleteGroup = $('.btn-delete-group').click(function(){
			var row = $(tree).tree('getSelected');
			if(row != undefined){
				if(row.text=='默认'){
					// toast("提示消息","默认组不可删除","error");
					return false;
			   }
			}
			var node = $(tree).tree('getSelected');
			if(node==null){
				toast('提示消息','请选择要删除的用户组','warning');
				return false;
			}
			_confirm('提示信息', '您确认要删除记录吗?', function(r){
				if (r){
					var url_groups = _IFA['groups_delete']+node.id;
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
		
		/*左边栏创建工作组*/
		var leftToolCreateUserGroup = $('.btn-add-group img').click(function(){
			$('#app-user-layout .btn-create-group').click();
		});
		
		/*逐条新增用户-保存*/
		var btnConserveUser = $('.win-add-user .but-conserve').click(function(){
			var result = getFormValue('#create-user');
			result.org_id = org_ids;
			//获取用户组
			if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}
			
			var url = _IFA['user_create'];
			var type = 'POST';
			var data = JSON.stringify(result);
			if($('#create-user').find('span').hasClass('error') == false){
				if($('#create-user input[name="email"]').val()=='' && $('#create-user input[name="phone"]').val()==''){
					toast('提示消息','手机号和邮箱至少添一项','error');
					return false;
				}else{
					_ajax(url,type,data,function(data){
						if(data.error_code==0){
							toast('提示消息','操作成功','success');
							
							clearForm('#create-user');
							$('.win-add-user').window('close');
							refresh();
						}else{
							toast('提示消息',data.error_message,'error');
						}
					});
				}
				}else{
				var errorMessage = $('#create-user').find('span.error').eq(0).text();
				console.log(errorMessage)
				toast('提示消息',errorMessage,'error');
			}
			
		});
		
		/*逐条新增用户-保存&新增*/
		var btnConserveNewUser = $('.win-add-user .but-update').click(function(){
			var result = getFormValue('#create-user');
			result.org_id = org_ids;
			if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}
			if(!$('.win-add-user').hasClass('save')){
				var url = _IFA['user_create'];
				var type = 'POST';
				var data = JSON.stringify(result);
				
			}else{
				var checked = getChecked();
				var url = _IFA['user_update']+checked[0].id;
				var type = 'PUT';
				var data = JSON.stringify(result);
			};
			if($('#create-user').find('span').hasClass('error') == false){
				if($('#create-user input[name="email"]').val()=='' && $('#create-user input[name="phone"]').val()==''){
					toast('提示消息','手机号和邮箱至少添一项','error');
					return false;
				}else{
					_ajax(url,type,data,function(data){
						if(data.error_code==0){
							toast('提示消息','操作成功','success');
							clearForm('#create-user');
							refresh();
						}else{
							toast('提示消息',data.error_message,'error');
						}
					});
				}
			}else{
				var errorMessage = $('#create-user').find('span.error').eq(0).text();
				console.log(errorMessage)
				toast('提示消息',errorMessage,'error');
			}
		});
		
		/*逐条新增用户-取消*/
		var btnConcelUser = $('.win-add-user .but-cancel').click(function(){
			closeWindow('.win-add-user');
			
			/*clearForm('#create-user');
			
			$('.error-name,.error-email,.error-phone,.error-password').css({
				'display':'none'
			});
			$('.name,.email,.password,.phone').css({
				'border':'1px solid #ededed'
			})
			$('.win-add-user .select-box').val("+86");
			$('.select-time-no').attr("checked",true);
			trueInput($('.phone'));
			trueInput($('.password'));
			trueInput($('.name'));
			trueInput($('.email'));
			$('.select-time-no-box').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
			$('.select-radio-box').addClass('checkRadio-unchecked');*/
			
		});
		
		
		//逐条增加-随机密码
		var checkRefreshPassWord = $('.refresh').click(function(){
			trueInput('.win-add-user .password');
			
		});
		/*逐条增加-随机密码生成*/
		var refreshPassWord = $('.refresh').click(function(){
			$('.password').val(getRandomInt(8))
		});
		/*逐条新增-radio样式*/
		var checkAddRadioPassword = $('.win-add-user .select-box-radio input[type="radio"]').click(function(){
		
			$('.select-time-no-box').addClass('checkRadio-unchecked');
			$('.select-radio-box').addClass('checkRadio-unchecked');
			$(this).parent('span').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
		});
		/*逐条修改用户*/
		var btnUpdateUser = $('.win-update-user .but-conserve').click(function(){
			var result = getFormValue('#update-user');
			result.org_id = org_ids;
			//获取用户组
			if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}
			var checked = getChecked();
			var url = _IFA['user_update']+checked[0].id;
			var type = 'PUT';
			var data = JSON.stringify(result);
			_ajax(url,type,data,function(data){
				if(data.error_code==0){
					toast('提示消息','操作成功','success');
					clearForm('#update-user');
					$('.win-update-user').window('close');
					refresh();
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
			
		});
		
		/*逐条修改用户-取消*/
		var btnConcelUpdateUser = $('.win-update-user .window-close').click(function(){
			clearForm('#update-user');
			closeWindow('.win-update-user');
		});
		
		/*更新用户窗口*/
		var btnEditUser = $('.btn-edit-user').click(function(){			
			onOpenDelete('.win-update-user');
			var checked = getChecked();
			var len = getJsonLen(checked);
			if(len==0){
				toast('提示消息','请选择要编辑的用户','warning');
				return false;
			}else if(len==1){
				$('.win-update-user').window({
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
							$('#select-update-user-group').combotree({
							   required: true,
							   data:subGroup,
							   onLoadSuccess:function(node,data){
									//更新表单
									updateUserForm(data);
									readonlyTimer('.win-update-user','#user-update-timer');
							   }
							});
						});
					},
					onClose:function(){
						clearForm('#update-user');
						closeDateTimer();
					}
				});	
			}else if(len>1){
				onOpenDelete('.win-update-batch-user');
				$('.win-update-batch-user').window({
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
							console.log(subGroup);
							subGroup[0].text = subGroup[0].text=='default'?'默认':subGroup[0].text;
							$('#select-batch-user').combotree({
							   required: true,
							   data:subGroup,
							   onLoadSuccess:function(node,data){
							   	  	//设置记录的信息
									var node = checked[0];
									var group = findNode(node.group_id);
									node.group_name = group.text;
									if($('.nav-home-title').hasClass('home-selected')){
										data[0].text = data[0].text=='default'?'默认':data[0].text;
										$('#select-batch-user').combotree('setValue', { id: data[0].id, text:data[0].text});
									}else{
										$('#select-batch-user').combotree('setValue', { id: node.group_id, text:node.group_name});
									};
									readonlyTimer('.win-update-batch-user','#user-resetpassword-timer');
								        clearInitUpdateForm();	
							   }
							});
						});
						
						//获取所选的用户数量
						var selections = $(table).datagrid('getSelections');
						var firstName = selections[0].email;
						var len = selections.length;
						//加载数量
						$('.win-update-batch-user .people').text(firstName);
						$('.win-update-batch-user .amount').text(len);
						$('.win-update-batch-user .select_user_group').addClass('checkbox-unchecked');
						$('.win-update-batch-user .select_user_password').addClass('checkbox-unchecked');
						$('.win-update-batch-user .select-user-time').addClass('checkbox-unchecked');
						
					},
					onClose:function(){
						closeDateTimer();
					}
				});	
			}
		});
		
		/*更新上一条记录*/
		var btnEditUserNext = $('.win-update-user .btn-pre').click(function(){
			
			var rows = $(table).datagrid('getRows');
			
			//获取当前被checked的记录
			var checked = $(table).datagrid('getChecked');
			
			//获取当前行的索引
			var index = $(table).datagrid('getRowIndex',checked[0]);

			index--;
			
			if(index<0){
				toast('提示消息','没有下一条记录了','info');
			}else{
				//清除选中的行
				$(table).datagrid('clearChecked');
				//通过索引获取行
				$(table).datagrid('checkRow',index);
				//获取被选中的行
				checked = $(table).datagrid('getChecked');
				//更新表单
				updateUserForm();
			}
		});
		
		/*更新下一条记录*/
		var btnEditUserNext = $('.win-update-user .btn-next').click(function(){
			
			var rows = $(table).datagrid('getRows');
			
			//获取当前被checked的记录
			var checked = $(table).datagrid('getChecked');
			
			//获取当前行的索引
			var index = $(table).datagrid('getRowIndex',checked[0]);

			index++;
			
			if(index>rows.length-1){
				toast('提示消息','没有下一条记录了','info');
			}else{
				//清除选中的行
				$(table).datagrid('clearChecked');
				//通过索引获取行
				$(table).datagrid('checkRow',index);
				//获取被选中的行
				checked = $(table).datagrid('getChecked');
				//更新表单
				updateUserForm();
			}
		});
		
		/*删除用户*/
		var btnDeleteUser = $('.btn-delete-user').click(function(){
			//获取选中的记录
			var checked = getChecked();
			
			if(checked.length==0){
				toast('提示消息','请选择要删除的记录','warning');
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
		
		/*检索用户*/
		var btnSearchUser = $('.user-region-center .btn-search-user').click(function(){
           	searchVal = $('.user-region-center .input-search').val()==undefined?'':$('.user-region-center .input-search').val();
           	var options = {
           		search:searchVal
           	}
           	loadTable(options);
        });
        
        /*键盘检索*/
		var keySearchUser = $('.user-region-center .input-search').unbind().bind('keydown',function(event){
            event.stopPropagation();
            var self = this;
            if(event.keyCode ==13){
               $('.user-region-center .btn-search-user').click();
            }
        });
        /*失焦检索*/
        $('.user-region-center .input-search').on('input',function(){
        	$('.user-region-center .btn-search-user').click();
        });
        
        /*导入用户提交*/
       var btnImportUser = $('.win-import-user .but-conserve').click(function(){
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
       var btnExportUser = $('.win-export-user .but-conserve').click(function(){
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
       		closeWindow('.win-export-user');
       });
       
       /*取消导出用户提交*/
       var btnCancelExportUser = $('.win-export-user .but-cancel').click(function(){
       		closeWindow('.win-export-user');
       });
       
       /*关闭导入结果*/
       var btnCancelImportResult = $('.win-import-user-result .but-conserve').click(function(){
       		closeWindow('.win-import-user-result');
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
	   var downloadUserImportResult = $('.win-import-user-result .but-download').click(function(){
	   	var url = _IFA['user_export_result']+'?org_id='+org_ids;
	   	   window.open(url);
	   });
	   /*返回跟节点首页*/
	  var goHome = $('.user-user .nav-home-title').click(function(){
	  	$('.user-user .user-region-west .win-nav .nav-home-title').addClass('home-selected');
		$('.user-user .user-region-west .head-title-img').html('<img src="user/images/icon-home-white.png" />');
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
				if(data.error_code==0){
					toast('提示消息','操作成功','success');
					refresh();
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
	 	}else{
	 		toast('提示消息','请选择用户','warning');
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
					toast('提示消息','操作成功','success');
					refresh();
				}else{
					toast('提示消息',data.error_message,'error');
				}
			});
	 	}else{
	 		toast('提示消息','请选择用户','warning');
	 		return false;
	 	}
	 });
	/*批量新增用户退出*/
	var btnCancelBatchUser = $('.win-add-batch-user .but-cancel').click(function(){
		closeWindow('.win-add-batch-user');
	});
	/*批量新增用户保存*/
	var btnAddBatchUser = $('.win-add-batch-user .but-conserve').click(function(){
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
	    if(!checkRepeatUser()){
	    	toast('提示消息','数据重复','error');
	    	return;
	    }
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				toast('提示消息','操作成功','success');
				refresh();
				closeWindow('.win-add-batch-user');					
			}else{
				toast('提示消息',data.error_message,'error');
			}
		});
	});
	/*批量新增-radio样式*/
	var checkBatchRadioPassword = $('.win-add-batch-user  .select-add-batch-box input[type="radio"]').click(function(){
		var _val = $(this).val();
		console.log(_val);
		$('.never-radio-box').addClass('checkRadio-unchecked');
		$('.select-radio-box').addClass('checkRadio-unchecked');
		$(this).parent('span').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
	});
	/*批量修改用户-退出*/
	var btnBatchUpdateUserExit = $('.win-update-batch-user .but-cancel').click(function(){
		closeWindow('.win-update-batch-user');
	});
	
	/*批量修改用户-保存并退出*/
	var btnBatchUpdateUserSave = $('.win-update-batch-user .but-conserve01').click(function(){
		//获取数据
		var result = getFormValue('#form-batch-update-user');
		//获取所选的用户
		result.ids = [];
		var selections = $(table).datagrid('getSelections');
		$.each(selections, function(index,data) {
			result.ids.push(data.id);
		});	
		
		if(result.select_user_group!='on'){
			delete result.group_id;
		}
		
		if(result.select_expire_time=='on'){
			if(result.select_expire<=0){
				result.expire_at = result.select_expire;
			}else{
				result.expire_at = toTimeStamp(result.expire_at);
			}	
		}else{
			delete result.expire_at;
		}
		
		//当密码为指定密码时，取value值
		if(result.select_user_password=='on'){
			if(result.select_reset_password==1){
				result.password = result.reset_password_value;
				if(result.password.length<8 && result.password.length>0){
					toast('提示消息','密码不小于8位','warning');
					return false;
				}
			}
			if(result.select_reset_password==2){
				result.random_password =1;
			}
			delete result.password;
			delete result.random_password;
		}
		delete result.reset_password_value;
		delete result.select_expire;
		delete result.select_reset_password;
		
		var url = _IFA['user_update_bulk'];
		var type = 'PUT';
		var data = JSON.stringify(result);
		
		//保存验证
		if($('#form-batch-update-user').find('span.error-update-password').text() == ''){
			var errorMessage = $('#form-batch-update-user').find('span.error-update-password').eq(0).text();
			if(result.select_user_group!='on' && result.select_user_password!='on' && result.select_expire_time!='on'){
				toast('提示消息','请选择更改项！','error');
				return false
			}
		}else{
			return false;
		}
		_ajax(url,type,data,function(data){
			console.log(data);
			if(data.error_code==0){
				toast('提示消息','操作成功','success');
				refresh();
				closeWindow('.win-update-batch-user');
			}else{
				toast('提示消息',data.error_message,'error');
			}
		});
	});
	/*发送通知*/
	var sendNotice = $('.win-notice-user .but-conserve').click(function(){
		var result = getFormValue('#form-notice-user');
		var url = _IFA['user_notify_email'];
		var type = 'POST';
		result.org_id = org_ids;
		result.subject = '发送通知';
		
		if(result.notice_range==undefined){
			toast('提示消息','请选择通知范围','warning');
			return false;
		}
		if(result.content<1){
			result.content = '欢迎使用Oakridge网络！您的wifi登录账号是#email#，您的初始密码是#password#。你可以在连接网络后，通过登录“http：//pwd.me”，来更改您的密码。';
		}else{
			if(result.content.indexOf('#email#')<0 || result.content.indexOf('#password#')<0){
				toast('提示消息','您的内容缺少#email#和#password#标识符！','warning');
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
			toast('提示消息','暂不支持短信方式','warning');
			return false;
		}
		var data = JSON.stringify(result);
		
		//获取数据
		_ajax(url,type,data,function(data){
			if(data.error_code==0){
				toast('提示消息','操作成功','success');
				closeWindow('.win-notice-user');
			}else{
				toast('提示消息',data.error_message,'error');
			}
		});
	});
	/*触发批量新增用户事件*/
	var btnBatchAddUser = $('.win-add-batch-user .batch-add').click(function(){
		addUserInfo('.win-add-batch-user .user-list');
	});
	  /*打开创建组窗口*/
		var btnCreateGroup = $('#app-user-layout .btn-create-group').click(function(e){
			//验证是否是默认组
			var row = $(tree).tree('getSelected');
			if(row!=null){
				if(row.text=='默认'){
					// toast('提示信息','默认组不能创建组','error');
					return false;
				}	
			}
			
            onOpenDelete('.win-create-group');
			$('.win-create-group').window({
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
				},
				onClose:function(){
					
				}
			});
		});
		
		/*打开导入用户窗口*/
		var winInportUser = $('.btn-import-user').click(function(){
			var row = $(tree).tree('getSelected');
			if(row != undefined){
				if(row.text=='默认'){
					// toast("提示消息","默认组不可导入","error");
					return false;
			   }
			}
			onOpenDelete('.win-import-user');
			$('.win-import-user').window({
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
			$('.dropdown-menu-left').addClass('none');
		});
		
		/*打开导出用户窗口*/
		var winExportUser = $('.btn-export-user').click(function(){
			onOpenDelete('.win-export-user');
			$('.win-export-user').window({
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
							data = data.list[0];
							$('#tree-export-user').tree({
								data:[data],
								checkbox:true,
								lines:false,
								onLoadSuccess:function(node,data){
									$('#tree-export-user>li>ul>li:first-child .tree-icon').addClass('tree-file-default');
								}
							});
						}
					});
				}
			});		
			$('.dropdown-menu-left').addClass('none');
		});
		
		/*打开逐条新增用户窗口*/
		var winNewUser = $('.btn-new-user').click(function(){
			onOpenDelete('.win-add-user');
			$('.win-add-user').window({
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
						   onLoadSuccess:function(node,data){
						   	  //设置默认值

				
						   	  $('.win-add-user #select-box-mobile').find("option[value='1']").prop("selected",true);
						   	  $('.win-add-user #user-timer').datetimebox('setValue', getNowTimer());
						   	  var group_list = $('.group-list').tree('getSelected');

                               if(!group_list){
								   group_list = {};
                                   group_list.id = 1;
							   }
                               $('#select-user-group').combotree('setValue', group_list.id);
							   $('.select-time-no').prop('checked',true)
							   $('.win-add-user .select-time-no-box').addClass('checkRadio-checked');
							   $('.win-add-user .select-radio-box').addClass('checkRadio-unchecked');
						   }
						});
					});
					$(this).removeClass('save');
					readonlyTimer('.win-add-user','#user-timer');
				},
				onClose:function(){
					clearForm('#create-user');
					closeDateTimer();
					$('.error-name,.error-email,.error-phone,.error-password').css({
						'display':'none'
					});
					$('.name,.email,.password,.phone').css({
						'border':'1px solid #ededed'
					})
					$('.win-add-user .select-box').val("+86");
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
		
		/*打开批量新增用户窗口*/
		var winBatchNewUser = $('.btn-batch-new-user').click(function(){
			onOpenDelete('.win-add-batch-user');
			$('.win-add-batch-user').window({
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
						   onLoadSuccess:function(node,data){
						   	  //设置默认值
						   	  // $('#select-batch-user-group').combotree('setValue', { id: data[0].id, text:data[0].text});
						   	  console.log(getNowTimer());
						   	  $('#user-batch-timer').datetimebox('setValue', getNowTimer());

                               var group_list = $('.group-list').tree('getSelected');

                               if(!group_list){
                                   group_list = {};
                                   group_list.id = 1;
                               }
                               $('#select-batch-user-group').combotree('setValue', group_list.id);
						   	  
						   	  readonlyTimer('.win-add-batch-user','#user-batch-timer');
						   	  $('.win-add-batch-user .never-radio-box').addClass('checkRadio-checked');
							  $('.win-add-batch-user .select-radio-box').addClass('checkRadio-unchecked');
						   }
						});
					});
					//清空用户列表记录
					$('.win-add-batch-user .user-list').empty();
					addUserInfo('.win-add-batch-user .user-list');
					$(this).removeClass('save');
				},
				onClose:function(){
					closeDateTimer();
				}
			});		
		});
		
		/*打开用户通知窗口*/
		var winNoticeUser = $('.btn-notice-user').click(function(){
			onOpenDelete('.win-notice-user');
			$('.win-notice-user').window({
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
		
		//移除时间时触发
		moveDateTimer();
	}
	/*初始化批量修改默认值*/
	var clearInitUpdateForm = function(){
		/*初始化checkbox*/
		$('.ueser-grop').prop('checked',false);
		$('.ueser-password').prop('checked',false);
		$('.ueser-time').prop('checked',false);
		$('.input-text02').val("");
		$('.assign-password').prop('checked',true);
		
		$('.never-time').prop('checked',true);
		$('.never-time-box').addClass('checkBox-checkRadio-checked');
		$('.data-time-ipt-box').addClass('checkBox-checkRadio-unchecked');
		$('.assign-password-box').addClass('checkBox-checkRadio-checked');
		$('.select-reset-password-box').addClass('checkBox-checkRadio-unchecked');
		$('.error-update-password').hide();
		//加载用户组
		if($('.win-update-batch-user .ueser-grop').prop('checked')){
			$('.user-grop-children #select-batch-user').combo('readonly',false);
			console.log('选中用户组');
		}else{
			$('.user-grop-children #select-batch-user').combo('readonly');
		};
		//加载密码重置
		if($('.ueser-password').prop('checked')){
				$('.assign-password').removeAttr('disabled');
				$('.select_reset_password').removeAttr('disabled');
				$('.win-update-batch-user .input-text02').removeAttr('disabled');
				console.log('选中密码')
		}else{
			$('.assign-password').attr('disabled','disabled');
			console.log('未选中密码')
			$('.select_reset_password').attr('disabled','disabled');
			$('.win-update-batch-user .input-text02').attr('disabled','disabled');
		};
		//加载账户有效期
		if($('.win-update-batch-user .ueser-time').prop('checked')){
			$('.never-time').removeAttr('disabled');
			$('.data-time-ipt').removeAttr('disabled');
			console.log('选有效')
		}else{
			$('.never-time').attr('disabled','disabled');
			$('.data-time-ipt').attr('disabled','disabled');
			console.log('未选有效');
		};
	}
	/*表单验证*/
	var validateForm = function(){
		/*新增用户验证姓名*/
		var checkNameFocus = $('.win-add-user .name').focus(function(){
			$('.win-add-user .error-name').hide()
			$('.win-add-user .name').css({
				'border':'1px solid #ededed'
			});
		}).blur(function(){
			var resName = $('.win-add-user .name').val();
			if(resName==""){
				return false
			};
			if(resName != ""){
				trueInput('.win-add-user .name');
			};
		});
		/*逐条新增手机号输入*/
		var onKeydownPhone = $('.win-add-user .phone').keydown(function(event){
			verification($('#select-box-mobile'));
		});
		/*批量新增手机号输入*/
		var onKeydownPhone = $(document).on('keydown','.win-add-batch-user .phone',function(){
			verification($(this).prev('.select-box-mobile'));
		});

		/*新增用户验证邮件*/
		var checkEmailFocus = $(document).on('focus','.email',function(){
			$('.error-email').show();
			$(this).css({
				'border':'1px solid #9bcce6'
			});
			
		}).on('blur','.email',function(){
			var resEmail = $(this).val();
			if(resEmail==""){
			    trueInput('.win-add-user .email');
				return false
			}
			if( resEmail !="" && checkEmail(resEmail)){
			   trueInput('.win-add-user .email');
			}else{
				errorInput('.win-add-user .email','邮箱格式错误');	
				return false
			}
		});
		/*新增用户验证手机号码*/
		var checkPhoneFocus = $(document).on('focus','.phone',function(){
			$('.error-phone').show();
			$(this).css({
				'border':'1px solid #9bcce6'
			});
			
		}).on('blur','.phone',function(){
			var resphone = $(this).val();
			var resarea = $(this).prev('#select-box-mobile').val();
			if(resphone==""){
			    trueInput('.win-add-user .phone');
				return false
			}
			if( resphone !="" && checkPhone(resphone,resarea)){
				trueInput('.win-add-user .phone');
			}else{
			    errorInput('.win-add-user .phone','手机号格式不对');
			    return false
			}
		});
		/*新增用户验证密码*/
		var checkPasswordFocus = $(document).on('focus','.password',function(){
			$(this).css({
				'border':'1px solid #9bcce6'
			});
		}).on('blur','.password',function(){
			var respassword = $('.win-add-user .password').val();
			if(respassword==""){
			   errorInput('.win-add-user .password','密码不能为空');
			   return false
			}
			if( respassword !="" && respassword.length>=8){
			   trueInput('.win-add-user .password');
			}else{
			   errorInput('.win-add-user .password','密码长度不能少于8位');
			   return false
			}
		});
		/*批量修改用户-密码随机-输入框不可用*/
		var btnRadioRefresh = $('.select_reset_password').click(function(){
			$('.win-update-batch-user .input-text02').attr('disabled','disabled');
			$('.win-update-batch-user .password').val("");
			$('.win-update-batch-user .password').css({
				'background':'none',
				'border':'1px solid #ededed'
			});
			$('.error-update-password').hide();
		});
		
		/*批量修改用户-指定密码-输入框可用*/
		var btnAssignPassWord = $('.assign-password').click(function(){
			$('.win-update-batch-user .input-text02').removeAttr('disabled');
		});
		
		/*批量修改用户-复选框*/
		var checkedBox = $('.win-update-batch-user .ueser-grop').click(function(){
			if($('.ueser-grop').prop('checked')){
				$('.user-grop-children #select-batch-user').combo('readonly', false);
				$('.select_user_group').removeClass('checkbox-unchecked');
				$('.select_user_group').addClass('checkbox-checked');
			}else{
				$('.user-grop-children #select-batch-user').combo('readonly');
				$('.select_user_group').removeClass('checkbox-checked');
				$('.select_user_group').addClass('checkbox-unchecked');
			}
		});
		
		/*批量修改用户-密码重置复选框*/
		var checkBoxPassWord = $('.win-update-batch-user .ueser-password').click(function(){
			if($('.ueser-password').prop('checked')){
				$('.assign-password').removeAttr('disabled');
				$('.select_reset_password').removeAttr('disabled');
				$('.win-update-batch-user .input-text02').removeAttr('disabled');
				$('.win-update-batch-user .password').focus();
				$('.select_user_password').removeClass('checkbox-unchecked');
				$('.select_user_password').addClass('checkbox-checked');
				
				$('.assign-password-box').removeClass('checkBox-checkRadio-checked').addClass('checkRadio-checked');
				$('.select-reset-password-box').removeClass('checkBox-checkRadio-unchecked').addClass('checkRadio-unchecked');
			}else{
				$('.assign-password').attr('disabled','disabled');
				$('.select_reset_password').attr('disabled','disabled');
				$('.win-update-batch-user .input-text02').attr('disabled','disabled');
				$('.select_user_password').removeClass('checkbox-checked');
				$('.select_user_password').addClass('checkbox-unchecked');
	
				$('.assign-password-box').removeClass('checkRadio-checked').addClass('checkBox-checkRadio-checked');
				$('.select-reset-password-box').removeClass('checkRadio-unchecked').addClass('checkBox-checkRadio-unchecked');
			}
			$('.win-update-batch-user .password').css({
				'border':'1px solid #eaebec',
				'background':'none'
			});
			$('.error-update-password').text('');
		});
		/*批量修改用户-密码重置radio*/
		var checkRadioPassword = $('.win-update-batch-user .update-password-div input[type="radio"]').click(function(){
			var _val = $(this).val();
			console.log(_val);
			$('.assign-password-box').addClass('checkRadio-unchecked');
			$('.select-reset-password-box').addClass('checkRadio-unchecked');
			$(this).parent('span').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
		});
		/*批量修改用户-账户有效时间复选框*/
		var checkBoxTime = $('.win-update-batch-user .ueser-time').click(function(){
			if($('.win-update-batch-user .ueser-time').prop('checked')){
				$('.never-time').removeAttr('disabled');
				$('.data-time-ipt').removeAttr('disabled');
				$('.select-user-time').removeClass('checkbox-unchecked');
				$('.select-user-time').addClass('checkbox-checked');
				$('.never-time-box').removeClass('checkBox-checkRadio-checked').addClass('checkRadio-checked');
				$('.data-time-ipt-box').removeClass('checkBox-checkRadio-unchecked').addClass('checkRadio-unchecked');
			}else{
				$('.never-time').attr('disabled','disabled');
				$('.data-time-ipt').attr('disabled','disabled');
				$('.select-user-time').removeClass('checkbox-checked');
				$('.select-user-time').addClass('checkbox-unchecked');
				$('.never-time-box').removeClass('checkRadio-checked').addClass('checkBox-checkRadio-checked');
				$('.data-time-ipt-box').removeClass('checkRadio-unchecked').addClass('checkBox-checkRadio-unchecked');
			};
		});
		/*批量修改用户-账户有效时间radio*/
		var checkRadioTime = $('.win-update-batch-user .update-time-div input[type="radio"]').click(function(){
			var _val = $(this).val();
			console.log(_val);
			$('.never-time-box').addClass('checkRadio-unchecked');
			$('.data-time-ipt-box').addClass('checkRadio-unchecked');
			$(this).parent('span').removeClass('checkRadio-unchecked').addClass('checkRadio-checked');
		});
		
		
		
		//批量修改密码验证
		var checkPasswordFocus = $(document).on('focus','.win-update-batch-user .password',function(){
			$(this).css({
				'border':'1px solid #9bcce6',
				'background':'none'
			});
			$('.error-update-password').text('');
		}).on('blur','.win-update-batch-user .password',function(){
			var respassword = $('.win-update-batch-user .password').val();
			var _width = $(this).width() + 10;
			if(respassword==""){
			   $(this).css({
				'border':'1px solid red',
				'background':'url(./user/images/error-message.png) no-repeat',
				'background-size':'12px 12px',
				'background-position': _width+'px center'
				});
				$('.error-update-password').text('密码不能为空');
				$('.error-update-password').show();
			   return false
			}
			if( respassword !="" && respassword.length>=8){
			    $(this).css({
					'border':'1px solid #ededed',
					'background':'none',
				});
				$('.error-update-password').hide()
			}else{
			    $(this).css({
				'border':'1px solid red',
				'background':'url(./user/images/error-message.png) no-repeat',
				'background-size':'12px 12px',
				'background-position': _width+'px center'
				});
				$('.error-update-password').text('密码格式错误');
				$('.error-update-password').show();
				return false
			}
		});
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
		
		/*监听面板调整*/
		listPanel();
		
		/*表单验证*/
		validateForm();
	}
	
	return {
		'run':function(){
			return run();
		}
	}
	
});


/*========================================================*
 * @Title:			    apr.js
 * @Description:		ap模块
 * 						在用户管理App中，org_id用的是parent
 * 						其他的App用的是id。
 * 						原因在于：用户管理属于整个Business的，但是其他资源是必须属于某个Site的。
 * @Author:         	没蜡笔的小新是坑
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
 *
 *
	 _____ | _____        \     /   /______    |  |     / /_  /
	 ()____)+()____)     -----  /       |       | -+-.  /_.|_|/_.
	 ()____)+()____)      \ /  /___   __|__   | |  | |   / | | /
	 ()____)+()____)     ----- | |    | |     |_| _|_|_ /_\`-'/_\
	 ()____)+()____)     __|__ | |  __|_|____   |  |     ___|___
	 ()____)+()____)      /|\  | |      |       | / \     _/|\_
	 / | \
/*========================================================*/
define(['jquery','functions'],function($,_f) {

    var target = $('#page');

    var tree = "#app-ap-layout .ap-div-left .group-list";

    var tree1 = "#app-ap-layout .ap-div-left .group-list";

    var tree2 = "#app-ap-layout .ap-div-right .group-list"; //ap网络右侧

    var table = "#app-ap-layout .table-ap";

    var pagination = '#app-ap-layout #pagination_ap';

    var ip_defPageNumber = 1;

    var ip_defPageSize = 10;

    var defPageList = [10, 20, 50];

    var org_ids = getOrg(target.data('org')).id;

    var groupSubordinate = 1;

    var ip_sort = '';//排序名称

    var ip_sort_name = '';//排序名称

    var ip_search = '';

    var ip_id = '';//公共节点网络树


    var ip_config_cid = '';//配置表里面的id


    /**
     * 表格头部
     * @param ''
     * @return
     */
    var ip_column = [[
        {
            field: 'id',
            title: '',
            checkbox: 'true',
            align: 'center',
            width: 80,
            formatter: function (value, row, index) {
                var str = '';
                str += '<input type="checkbox" class="ip_id" name="ip_id" value="' + value + '"/>';
                return str;
            }
        },
       
        {
            field: 'connected', title: '状态', sortable: true, align: 'center', formatter: function (value, row, index) {
	            if(value == 1){
					return "<span data-id="+value+" class='normal-status'></span>";
				}else if(value == 0){
	                return "<span data-id="+value+" class='interrupt-status'></span>";
				}else if(value == 2){
	                return "<span data-id="+value+" class='error-status'></span>";
				}else if(value == -1){
	                return "<span data-id="+value+" class='add-status'></span>";
				}
       	 	}
        },

        {field: 'mac', title: '无线接入点', sortable: false, align: 'center'},

        {field: 'organization', title: '位置', sortable: false, align: 'center'},

        {field: 'flow', title: '总流量', sortable: false, align: 'center'},

        {field: 'device_name', title: '终端', sortable: false, align: 'center'},

    ]];


    /**
     * 表格数据生成
     * @param data json 需要展示的数据
     * @return
     */
    var ip_table = function (data) {

        //模拟数据


        if (data == undefined || data == '') {

            return false;
        }

        if (data.error_code != 0) {

            toast('提示消息', data.error_code, 'error');

            return false;
        }


        $(table).datagrid({

            data: data.list,

            columns: ip_column,

            fit: true,

            fitColumns: true,

            scrollbarSize: 0,

            resizable: false,

            striped: false,

            onBeforeLoad: function (param) {

            },
            onLoadSuccess: function () {
                //加载完成,设置分页
                ip_page('', data);

            },
            onSortColumn: function (sort, order) {
                //排序
                ip_sort_number(sort, order);

            },
            onCheck: function (rowIndex, rowData) {

                var panel = $(this).datagrid('getPanel');

                $(panel).find('.datagrid-cell-check').eq(rowIndex).addClass('cell-checked');

                //如果当前页全部被选中，把头也构上
                var checked = $(this).datagrid('getChecked');

                if (checked.length == ip_defPageSize) {

                    $(panel).find('.datagrid-header-check').addClass('cell-checked');

                }


            },
            onUncheck: function (rowIndex, rowData) {

                var panel = $(this).datagrid('getPanel');

                $(panel).find('.datagrid-header-check').removeClass('cell-checked');

                $(panel).find('.datagrid-cell-check').eq(rowIndex).removeClass('cell-checked');
            },
            onCheckAll: function (rows) {

                var panel = $(this).datagrid('getPanel');

                $(panel).find('.datagrid-header-check,.datagrid-cell-check').addClass('cell-checked');
            },
            onUncheckAll: function (rows) {

                var panel = $(this).datagrid('getPanel');

                $(panel).find('.datagrid-header-check,.datagrid-cell-check').removeClass('cell-checked');
            }
        });

    };


    /**
     * 点击切换图标事件,核心
     * @type {*}
     *
     */
    var checkright = function(){
    		$('.ap-region-west .ap-tab-right').click(function () {
	        //切换左侧
	        $('.ap-region-west .ap-tab .ap-tab-left').css({
	            'background': '#fff'
	        });
	
	        $('.ap-region-west .ap-tab .ap-tab-left .ap-tab-left-icon').css({
	            'background': 'url(./ap/images/left-gray.png) no-repeat'
	        });
	
	        //切换右侧
	        $('.ap-region-west .ap-tab .ap-tab-right').css({
	            'background': '#eff4fa'
	        });
	
	        $('.ap-region-west .ap-tab .ap-tab-right .ap-tab-right-icon').css({
	            'background': 'url(./ap/images/right-blue.png) no-repeat'
	        });
	
	        $('.ap-region-west .ap-div-right').show();
	
	        $('.ap-region-west .ap-div-left').hide();
	
	        $('.ap-left-more').hide();
	
	        $('.btn-notice-ap').hide();
	
	        tree = tree2
	
	        //调用机构树
	        ip_tree();
	
	    });
    }
    	    


    /**
     * 名称:网络结构树
     * @param ''
     * @return json tree
     */
    var ip_tree = function () {

        /*载入树结构*/
        var url = _IFA['network_list_ssids'] + '?org_ids=' + getOrg(target.data('org')).id;

        _ajax(url, 'GET', '', function (data) {

            if (data.error_code == 0) {

                var root = getNetworkList(data, '缺省网络');


                $(tree).tree({

                    data: [root],

                    formatter: function (node) {
                        var nid = node.id;
                        nid = $.trim(nid).replace(/\s/g, "");
                        return '<input type="hidden" class="ap-hidden-tree-' + nid + '" name="ap_tree_hidden" value="' + nid + '"/>' + node.text;
                    },

                    onLoadSuccess: function (node, data) {

                        ip_id = data[0]['children'][0]['children'][0]['id'];//默认抓取第一个节点的id

                        setRootName();

                        ip_tree_icon('');//添加图标

                        //表格树样式
                        adjustTreeStyle($(this));

                        //获取第一个节点


                        load_url(ip_id);//发送数据

                        ip_first_select(ip_id);


                    },
                    onBeforeSelect: function (node) {

                        if (node.children != undefined) {
                            return false;
                        }
                    },
                    onSelect: function (node) {
                        //选定事件
                        console.log(node);

                        //当前节点id写入公共的全局变量

                        ip_id = node.id;

                        load_url(node.id);//发送数据


                    }
                });

            } else {

                toast('错误信息', data.error_message, 'error');
            }
        });
    };


    /**
     * 名称:获取更节点
     * @param ''
     * @return
     */
    var setRootName = function () {

        var data_1 = getSite();

        $('.head-title-active').text(data_1.name);
    }


    /**
     * 名称:设置网络模块图标,和静止点击事件
     * @param string 样式类别
     * @return ''
     */
    var ip_tree_icon = function (node) {

        var _self = node;

        $('input[name="ap_tree_hidden"]').each(function (index, value) {

            var tree_v = $(value).val();

            var id = $('.ap-hidden-tree-' + tree_v).parent('').parent('').attr('id');

            //判断是否有兄弟节点
            if ($('#' + id).siblings('ul').length > 0) {

                $('#' + id).attr('disabled', true);

            } else {

                $('#' + id).children('.tree-indent').last().append('<img width="16" src="./ap/images/wireless-icon.png">');
            }

        });


    };

    /**
     * 网络右侧表格
     * @param array
     * @return
     */
    var load_table = function (data) {

        if (data == '' || data == undefined) {

            return false;
        }
    };

    /**
     * 发送网络数据
     * @param id 网络设备id
     * @return
     */
    var load_url = function (id) {

        if (id == undefined) {

            return false;
        }

        var url = _IFA['ap_get_device_list'] + '?org_ids=' + org_ids + '&ssid_id=' + id + '&page=' + ip_defPageNumber + '&page_size=' + ip_defPageSize + '&sort=' + ip_sort + '&search=' + ip_search;


        _ajax(url, 'GET', '', function (data) {

            //调用table
            ip_table(data);
        });
    };


    /*初始化*/
    var init = function () {
        //获取公司ID
        org_ids = getOrg(target.data('org')).parent;


    }


    /**
     * 表格分页
     * @param ''
     * @return
     */
    var ip_page = function (data, options) {
        //分页处理
        var pageSize = ip_defPageSize;

        if (options != undefined && options.pageSize != undefined) {

            pageSize = options.pageSize;
        }

        var pageNumber = ip_defPageNumber;

        if (options != undefined && options.pageNumber != undefined) {

            pageNumber = options.pageNumber;
        }

        var optPage = {

            paginationId: pagination,

            total: options.total,

            pageNumber: pageNumber,

            pageSize: pageSize,

            pageList: defPageList
        }

        ip_load_page(optPage);

        //去掉加载条
        MaskUtil.unmask();
    }


    /**
     * 分页数据处理
     * @param ''
     * @return
     */
    var ip_load_page = function (options) {
        //分页ID
        var paginationId = options.paginationId;

        var total = options.total;

        var pageNumber = options.pageNumber;

        var pageSize = options.pageSize;

        var pageList = defPageList;

        $(paginationId).pagination({

            total: total,

            pageNumber: pageNumber,

            pageSize: pageSize,

            pageList: pageList,

            displayMsg: '共{total}条记录',

            layout: ['first', 'prev', 'links', 'next', 'last', 'sep', 'list', 'info', 'sep', 'refresh'],

            onSelectPage: function (pageNumber, pageSize) {

                //赋值给全局变量分页
                ip_defPageNumber = pageNumber;//当前页码

                ip_defPageSize = pageSize;

                $(this).pagination('loading');

                var opt = {

                    pageNumber: pageNumber,

                    pageSize: pageSize,

                    search: ip_search,

                    sort: ip_sort,
                }
                //分页刷新

                load_url(ip_id);

                $(this).pagination('loaded');
            },

            onRefresh: function (pageNumber, pageSize) {

            },

            onChangePageSize: function (pageSize) {

            }
        });

        //插入分页文件
        $('.pagination-page-list').before('每页显示数');
    };


    /**
     * 名称:表格排序
     * @param name sort
     * @return ''
     */
    var ip_sort_number = function (sort, type) {

        if (sort == undefined || sort == '') {

            return false;
        }

        if (type == undefined || type == '') {

            return false;
        }

        ip_sort = sort + ' ' + type;

        ip_sort_name = type;

        load_url(ip_id);//请求数据


    }


    /**
     * 名称:查询数据
     * @param string
     * @return json
     */
    var ip_click_search = $('.btn-search-ap').click(function () {

        ip_search = $('.input-search').val() == undefined ? '' : $('.input-search').val();
        //更换分页
        ip_defPageNumber = 1;

        load_url(ip_id);//更新表格

    });
    /*键盘检索*/
    var keySearchUser = $('.input-search').unbind().bind('keydown', function (event) {
        event.stopPropagation();
        var self = this;
        if (event.keyCode == 13) {

            $('.btn-search-ap').click();
        }
    });
    /*失焦检索*/
    $('.input-search').on('input', function () {
        $('.btn-search-ap').click();
    });


    /**
     * 名称:网络结构树
     * @param obj
     */
    var adjustTreeStyle = function (obj) {
        var appLeft = $('#app-ap-layout .app-right').layout('panel', 'center');
        var height = $(appLeft).panel('options').height;
        obj.css({
            'height': height - 140 + 'px',
            'overflow-y': 'auto',
            'overflow-x': 'hidden'
        });
        //添加默认组图标
        $('#app-ap-layout .group-list>li>ul>li:first-child .tree-icon').addClass('tree-file-default');
        //把根节点干掉
        /* var treeTitle = '';
         treeTitle = $('#app-ap-layout .group-list>li:first-child>div:first-child>span.tree-title').text();
         $('#app-ap-layout .nav-home-title .head-title-active').html(treeTitle);
         $('#app-ap-layout  .group-list>li:first-child>div:first-child').addClass('none');*/

    }

    /*运行主程序*/
    var run = function () {
        init();

    }


    /**
     * 名称:配置点击事件
     * @param
     * @return
     */
    var ip_config = function(){
	    $('.ap-config-ip').unbind().bind('click', function () {
	        onOpenDelete('#win-ap-config');//删除以前存在的窗口
			//获取树
			var row = $(tree).tree('getSelected');
			var site = getSite();
			if(!row){
				row = {};
				row.name = site.name;
			}
			$('.ip-head-title-text').text(row.name);
	        //获取当前选定的点
	        var checked_list = getChecked();
	
	        if (checked_list.length == 0) {
	
	            toast('提示消息', '请选择配置的AP设备', 'warning');
	
	            return false;
	
	        } else {
	
	            $('#win-ap-config').window({
	                width: 850,
	                height: 630,
	                title: '配置无线接入点',
	                headerCls: '',
	                collapsible: false,
	                minimizable: false,
	                maximizable: false,
	                resizable: false,
	                modal: true,
	                onOpen: function () {
	                    ip_config_list(checked_list);
	                    //配置无线接入点协议--带宽--联动
	                    btnSubmitConfirmWiFi();
	                    //DHCP联动IP,
	                   	//linkage();
	                },
	                onClose: function () {
	                    onOpenDelete('#win-ap-config');//删除以前存在的窗口
	                }
	            });
	        };
	
			addChannel_24();
	    });
	};
	//---配置射频---2.4G信道获取
	var addChannel_24 = function(){
		$('select[name="ip_r24_channel"] option').remove();
		$('select[name="ip_r24_channel"]').append(
			'<option value="-1">'+'关闭'+'</option>'
			+'<option value="0">'+'自动'+'</option>'
		);
		for(var i = 1;i < 14;i++){
			$('select[name="ip_r24_channel"]').append(
				'<option value='+i+'>'+i+'</option>'
			);
		};
	};
	/*配置无线接入点协议--带宽--联动*/
	var btnSubmitConfirmWiFi = function(){
		//2.4G协议带宽联动
		$('.2G-left-info .ip-input').change(function(){
			if($('.2G-left-info .left-agreement-select').val() == 12){
				$('.2G-left-info .left-bandwidth-select-bottom').show();
				$('.2G-left-info .left-bandwidth-select').hide();
			}else{
				$('.2G-left-info .left-bandwidth-select-bottom').hide();
				$('.2G-left-info .left-bandwidth-select').show();
			}
		});
		//5G协议带宽联动
		$('.ip-info-right-5G .5G-right-title').change(function(){
			if($('.ip-info-right-5G .5G-right-title').val() == 16){
				$('.ip-info-right-5G .left-bandwidth-select-bottom').show();
				$('.ip-info-right-5G .left-bandwidth-select').hide();
			}else{
				$('.ip-info-right-5G .left-bandwidth-select-bottom').hide();
				$('.ip-info-right-5G .left-bandwidth-select').show();
			}
		});
	}
    /**
     * 配置获取列表
     * @param array 数组
     * @return json
     */
    var ip_config_list = function (data) {

        if (data == '' || data == undefined) {

            return false;
        }

        $('#ip-config-li').children().remove();//防止再次打开的时候出现报错
        $('#ip-content-2-table').children().remove();//防止再次打开的时候出现报错

        //获取设备列表
        var config_url = _IFA['ap_get_device_list'] + '?org_ids=' + org_ids;

        _ajax(config_url, 'GET', '', function (respanse) {
            console.log(respanse);

            if (respanse.error_code == 0) {

                //处理返回的数组
                $(data).each(function (index, data) {

                    $('#ip-config-li').append('<li>' +
                        ' <input type="checkbox" class="text-checkbox" name="ip_config_id" value=' + data.id + '>' +
                        '<span class="ip-left-li-first">' + data.device_name + '</span>' +
                        '<span class="ip-left-li-last">' + data.mac + '</span>' +
                        '</li>');
                    $('.text-checkbox').attr('checked', true);
                    //绑定时机事件
                    ip_type_config_list(index);
                });
                
                //初始化
                if(data.length==1){
	                //单条编辑
	                var _self = $('input[name="ip_config_id"]:checked');
	
	                var ap_id = $(_self).val();
	
	                ip_config_cid = ap_id;//赋值
	
	                ip_type_config_info(ap_id);//调用接口
	                
	                //ip_config_detail(ip_config_cid);//DHCP联动
	                var opt_val = $('select[name="ip_config_dhcp"] option');

			        //var opt_val = $(opt_val).val();
			
			        if ($(opt_val).val() == 1) {
			
			           	ip_config_device(ip_config_cid);
			           
			        } else {
			        	
			            ip_config_detail(ip_config_cid);
			        }
	                
                }else if(data.length>1){
                	/* 对比射频信息,是否显示‘---’ */
                	ip_type_config_info_mutle();
                	//多条
	                var str = '---';
	                
					
	                $('input[name="ip_config_name"]').val(str);//设备名称
	
	                $('input[name="ip_config_one"]').val(str);//ip
	
	                $('input[name="ip_config_ym"]').val(str);//掩码地址
	
	                $('input[name="ip_config_position"]').val(str);//位置
	
	                $('input[name="ip_config_wg"]').val(str);//网关地址
	                
	                //DHCP
	                $('select[name="ip_config_dhcp"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
					$('select[name="ip_config_dhcp"] option:nth-child(2)').hide();
					
					/*//2.4G 
					//信道
					$('select[name="ip_r24_channel"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
					
					//协议
					$('select[name="ip_r24_xy"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
										
					//带宽
					$('select[name="ip_r24_bandwidth"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
															
					//功率
					$('select[name="ip_r24_power"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
					
					$('input[name="ip_r24_maxclients"]').val(str);//最大终端数
					
					//5G 
					//信道
					$('select[name="ip_r5_status"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
					
					//协议
					$('select[name="ip_r5_mode"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
										
					//带宽
					$('select[name="ip_r5_bandwidth"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
															
					//功率
					$('select[name="ip_r5_power"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
					
					$('input[name="ip_r5_maxclients"]').val(str);//最大终端数*/
                }

            } else {

                toast('提示消息', respanse.error_msg, 'warning');
            }

			
            //加载列表数据
            ip_config_open_list(data);

        });

    };

    /**
     * 名称:配置页面中的input选择事件
     * @param ''
     * @return
     */
    var ip_type_config_list = function (number) {
    	
        $('.text-checkbox').unbind().bind('change', function () {
            var flag = true;
            //判断是否是批量编辑模式
            $('input[name="ip_config_id"]:checked').each(function (index, value) {


                if (index >= 1) {

                    flag = false;
                }
            });

            if (flag) {
            	
                //单条编辑
                var _self = $('input[name="ip_config_id"]:checked');

                var ap_id = $(_self).val();

                ip_config_cid = ap_id;//赋值

                ip_type_config_info(ap_id);//调用接口
                
                $('select[name="ip_config_dhcp"] option:nth-child(2)').show();
                
                $('.three-flagstaff').remove();
                
                	
            } else {
            	$('.three-flagstaff').remove();
            	/* 对比射频信息,是否显示‘---’ */
            	ip_type_config_info_mutle();
                //批量编辑 名称,位置,ip,掩码,网关不可修改
                var str = '---';

                $('input[name="ip_config_name"]').val(str);//设备名称

                $('input[name="ip_config_one"]').val(str);//ip

                $('input[name="ip_config_ym"]').val(str);//掩码地址


                $('input[name="ip_config_position"]').val(str);//位置

                $('input[name="ip_config_wg"]').val(str);//网关地址
				
				//console.log($('select[name="ip_config_dhcp"] option:nth-child(2)').text(str))
				//DHCP
				$('select[name="ip_config_dhcp"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>')
				$('select[name="ip_config_dhcp"] option:nth-child(2)').hide();
				
				
            }

        });
    };
    /*对比信息*/
   var compareAp = function(data){
   		
   		var str = '---';
   		//多条处理、获取到当前checked节点
        var nodeleft = {};//2.4G射频信息
        var noderight = {};//5G射频信息
        nodeleft.channel = true;//2.4G信道
        nodeleft.mode = true;//2.4协议
        nodeleft.bandwidth = true;//2.4带宽
        nodeleft.power = true;//2.4功率
        nodeleft.maxclient = true;//2.4最大终端数
        
        noderight.channel = true;//5G信道
        noderight.mode = true;//5G协议
        noderight.bandwidth = true;//5G带宽
        noderight.power = true;//5G功率
        noderight.maxclient = true;//5G最大终端数
    	
    	//添加 数据状态 compare_xindao.leftnode.xindao true = 多条数据相同  false= 不同处理  2.4
    	//2.4G射频信息
    	var r24_channel = data[0].rf_config.r24_channel;//第一条 信道
    	
    	var r24_mode = data[0].rf_config.r24_mode;//第一条 协议
    	
    	var r24_bandwidth = data[0].rf_config.r24_bandwidth;//第一条 带宽
    	
    	var r24_power = data[0].rf_config.r24_power;//第一条 功率
    	
    	var r24_maxclient = data[0].rf_config.r24_maxclient;//第一条 最大终端数
    	
    	//5G射频信息
    	var r5_channel = data[0].rf_config.r5_channel;//第二条 信道
    	
    	var r5_mode = data[0].rf_config.r5_mode;//第二条 协议
    	
    	var r5_bandwidth = data[0].rf_config.r5_bandwidth;//第二条 带宽
    	
    	var r5_power = data[0].rf_config.r5_power;//第二条 功率
    	
    	var r5_maxclient = data[0].rf_config.r5_maxclient;//第二条 最大终端数
    	
    	var result = [];
    	for(var i=1; i<data.length; i++){
    		console.log(data[i])
    		result.push(data[i].rf_config);
    		//判断勾选 信道，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r24_channel != result[j].r24_channel){
    				nodeleft.channel = false;
    			}
    		}
    		//判断勾选 协议，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r24_mode != result[j].r24_mode){
    				nodeleft.mode = false;
    			}
    		}
    		//判断勾选 带宽，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r24_bandwidth != result[j].r24_bandwidth){
    				nodeleft.bandwidth = false;
    			}
    		}
    		//判断勾选 功率，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r24_power != result[j].r24_power){
    				nodeleft.power = false;
    			}
    		}
    		//判断勾选 最大终端数，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r24_maxclient != result[j].r24_maxclient){
    				nodeleft.maxclient = false;
    			}
    		}
    	}
    	
    	//信道
    	if(nodeleft.channel == false){
			$('select[name="ip_r24_channel"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		//射频参数 2.4g
    		$('select[name="ip_r24_channel"] option').each(function (index, value) {
            if ($(value).val() == data[0].rf_config.r24_channel) {
            	console.log(data)
                $(this).prop('selected', 'selected');
           		}
       	 	});
    	}
        
    	//协议
    	if(nodeleft.mode == false){
			$('select[name="ip_r24_xy"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		$('select[name="ip_r24_xy"] option').each(function (index, value) {
                if ($(value).val() == data[0].rf_config.r24_mode) {
                    $(this).prop('selected', 'selected');
                }
            });
    	}
    	//带宽
    	if(nodeleft.bandwidth == false){
			$('select[name="ip_r24_bandwidth"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		$('select[name="ip_r24_bandwidth"] option').each(function (index, value) {

                if ($(value).val() == data[0].rf_config.r24_bandwidth) {

                    $(this).prop('selected', 'selected');
                }
            });
    	}
    	//功率
    	if(nodeleft.power == false){
			$('select[name="ip_r24_power"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		$('select[name="ip_r24_power"] option').each(function (index, value) {

                if ($(value).val() == data[0].rf_config.r24_power) {

                    $(this).prop('selected', 'selected');
                }
            });
    	}
    	//最大终端数
    	if(nodeleft.maxclient == false){
			$('input[name="ip_r24_maxclients"]').val(str);
    	}else{
    		$('input[name="ip_r24_maxclients"]').val(data.rf_config.r24_maxclient);
    	}
    	
    	
    	//------5G射频信息
    	for(var i=1; i<data.length; i++){
    		result.push(data[i].rf_config);
    		//判断勾选 信道，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r5_channel != result[j].r5_channel){
    				noderight.channel = false;
    			}
    		}
    		//判断勾选 协议，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r5_mode != result[j].r5_mode){
    				noderight.mode = false;
    			}
    		}
    		//判断勾选 带宽，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r5_bandwidth != result[j].r5_bandwidth){
    				noderight.bandwidth = false;
    			}
    		}
    		//判断勾选 功率，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r5_power != result[j].r5_power){
    				alert(result[j].r5_power)
    				noderight.power = false;
    			}
    		}
    		//判断勾选 最大终端数，是否全部相等
    		for(var j=0; j<result.length; j++){
    			if(r5_maxclient != result[j].r5_maxclient){
    				noderight.maxclient = false;
    			}
    		}
    	}
    	console.log(data)
    	console.log(result)
    	console.log($('select[name="ip_r5_channel"] option'))
    	
    	//信道
    	if(noderight.channel == false){
			$('select[name="ip_r5_channel"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		$('select[name="ip_r5_channel"] option').each(function (index, value) {

                if ($(value).val() == data[0].rf_config.r5_channel) {

                    $(this).prop('selected', 'selected');
                }
            });
    	}
    	//协议
    	if(noderight.mode == false){
			$('select[name="ip_r5_mode"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		$('select[name="ip_r5_xy"] option').each(function (index, value) {

                if ($(value).val() == data[0].rf_config.r5_mode) {

                    $(this).prop('selected', 'selected');
                }
            });
    	}
    	//带宽
    	if(noderight.bandwidth == false){
			$('select[name="ip_r5_bandwidth"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		$('select[name="ip_r5_bandwidth"] option').each(function (index, value) {

                if ($(value).val() == data[0].rf_config.r5_bandwidth) {

                    $(this).prop('selected', 'selected');
                }
            });
    	}
    	//功率
    	if(noderight.power == false){
			$('select[name="ip_r5_power"]').append('<option class="three-flagstaff" selected="selected">'+str+'</option>');
    	}else{
    		$('select[name="ip_r5_power"] option').each(function (index, value) {

                if ($(value).val() == data[0].rf_config.r5_power) {

                    $(this).prop('selected', 'selected');
                }
            });
    	}
    	//最大终端数
    	if(noderight.maxclient == false){
			$('input[name="ip_r5_maxclients"]').val(str);
    	}else{
    		$('input[name="ip_r5_maxclients"]').val(data.rf_config.r5_maxclient);
    	}
   }
    /*
     * 多条处理
     */
    var ip_type_config_info_mutle = function(){
        //选择的多条ID
        var ap_ids = [];
        //结果集
        var result = [];	
        //计数
        var j = 0;
        //获取选中点
        $('input[name="ip_config_id"]:checked').each(function (index, value) {
        	var id = $(value).val();
        	ap_ids.push(id);
        	//ip_type_config_info(id);
        });
       
        //获取
        for(var i=0;i<ap_ids.length;i++){
        	getApDetail(ap_ids[i],function(data){
        		result.push(data);
        		j++;
        		if(j==ap_ids.length){
        			compareAp(result);
        		}
        	});
        }
    }
    
    /*获取详情*/
   var getApDetail = function(id,func){
   	 var ip_url = _IFA['ap_get_device_config_detail'] + id;

    _ajax(ip_url, 'GET', '', function (data) {
    	func(data);
    });
   }


    /**
     * 获取配置列表中的详情
     * @param id int
     * @return
     */
    var ip_type_config_info = function (id) {
    
        if (id == '' || id == undefined) {

            return false;
        }

        var ip_url = _IFA['ap_get_device_config_detail'] + id;

        console.log(ip_url);

        _ajax(ip_url, 'GET', '', function (data) {
            console.log(data);
            //数据拼接

            $('input[name="ip_config_name"]').val(data.device_name);//设备名称

            $('input[name="ip_config_one"]').val(data.ipv4);//ip

            $('input[name="ip_config_ym"]').val(data.netmask);//掩码地址

            $('input[name="ip_config_dns1"]').val(data.dns1);//dns1

            $('input[name="ip_config_position"]').val(data.location);//位置


            $('select[name="ip_config_dhcp"] option').each(function (index, value) {

                if ($(value).val() == data.ip_type) {

                    $(this).prop('selected', 'selected');
                    console.log(data.ip_type);
                    console.log(id);
                    ip_dhcp_open(data.ip_type, id);
                }
            });//DHCP
            $('input[name="ip_config_wg"]').val(data.gateway);//网关地址

            $('input[name="ip_config_dns2"]').val(data.dns2);//dns2


            //射频参数 2.4g

            $('select[name="ip_r24_channel"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r24_channel) {
                	console.log(data)
                    $(this).prop('selected', 'selected');
                }
            });//管道

            $('select[name="ip_r24_xy"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r24_mode) {

                    $(this).prop('selected', 'selected');
                }
            });//协议


            $('select[name="ip_r24_bandwidth"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r24_bandwidth) {

                    $(this).prop('selected', 'selected');
                }
            });//带宽

            $('select[name="ip_r24_power"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r24_power) {

                    $(this).prop('selected', 'selected');
                }
            });//功率

            //最多终端数
            $('input[name="ip_r24_maxclients"]').val(data.rf_config.r24_maxclient);


            //射频参数5g


            $('select[name="ip_r5_channel"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r5_channel) {

                    $(this).prop('selected', 'selected');
                }
            });//管道


            $('select[name="ip_r5_xy"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r5_mode) {

                    $(this).prop('selected', 'selected');
                }
            });//协议


            $('select[name="ip_r5_bandwidth"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r5_bandwidth) {

                    $(this).prop('selected', 'selected');
                }
            });//带宽

            $('select[name="ip_r5_power"] option').each(function (index, value) {

                if ($(value).val() == data.rf_config.r5_power) {

                    $(this).prop('selected', 'selected');
                }
            });//功率

            //最多终端数
            $('input[name="ip_r5_maxclients"]').val(data.rf_config.r5_maxclient);


        });

    };


    /**
     * 名称:配置列表形式
     * @param id
     * @return
     */
    var ip_config_right_list = function (id) {

        if (id == undefined || id == '') {

            return false;
        }

    };


    /**
     * 名称:启用DHCP效果
     * @param type int 1启用状态, 0警用状态,id
     * @return
     */

    var ip_dhcp_open = function (type, id) {
        console.log(type);
        if (type === '' || type == undefined) {

            return false;
        }


        if (type == 1) {
            //静态

            //判断ip地址是否为空
            if ($('input[name="ip_config_one"]').val() == '') {
            	
                ip_config_device(id);
            }

        } else {
            //启用状态为0
            ip_config_device(id);

        }

    }


    /**
     * 名称:获取设备详情
     * @param id int
     * @return ''
     */

    var ip_config_device = function (id) {
console.log(id)
        var url = _IFA['ap_get_device_detail'] + id;
        console.log('写入设备详情');
        _ajax(url, 'GET', '', function (data) {
        	
            //写入到ip,掩码,网关中

            $('input[name="ip_config_wg"]').val(data.gateway);//网关地址

            $('input[name="ip_config_one"]').val(data.ipv4);//ip

            $('input[name="ip_config_ym"]').val(data.netmask);//掩码地址

        });
    };


    /**
     * 名称:获取设备配置详情
     * @param ''
     * @return ''
     */

    var ip_config_detail = function (id) {

        var ip_url = _IFA['ap_get_device_config_detail'] + id;
        
        //DHCP 联动IP
		switchDHCP();
		
        _ajax(ip_url, 'GET', '', function (data) {
        	console.log(data)
        	
            $('input[name="ip_config_one"]').val(data.ipv4);//ip

            $('input[name="ip_config_ym"]').val(data.netmask);//掩码地址

            $('input[name="ip_config_wg"]').val(data.gateway);//网关地址


        });


    };


    /**
     * 名称:选中第一个根节点
     * @param
     * @return
     */
    var ip_first_select = function (id) {

        if (id == '' || id == undefined) {

            return false;
        }

        var id = $('.ap-hidden-tree-' + id).parent('').parent('').attr('id');

        $('#' + id).addClass('tree-node-selected');
    }

    /**
     * 名称获取选中记录
     * @param '';
     * @return
     */

    var getChecked = function () {
        return $(table).datagrid('getChecked');
    };


    /**
     * 配置点击事件切换
     * @param ''
     * @return
     */

    var ip_config_type = $('.ip-head-img').unbind().bind('click', function () {

        var type = $(this).attr('data-type');

        if (type == '' || type == undefined) {

            $(this).attr('data-type', '1');

            $('.ip-content-box-last').show();

            $('.ip-content-box-first').hide();

            $('#ip-config-submit').attr('data-type', '1');//用来区分列表页面

        } else {

            $(this).attr('data-type', '');

            $('.ip-content-box-last').hide();

            $('.ip-content-box-first').show();

            $('#ip-config-submit').attr('data-type', '');


        }
    });

    /**
     * 名称:更换列表数据展示
     * @param ''
     * @return
     */
    var ip_config_open_list = function (data) {
        //获取表格数据
        //console.log(data);

        if (data == undefined || data == '') {

            return false;
        }

        $.each(data, function (index, value) {

            var ip_url = _IFA['ap_get_device_config_detail'] + value.id;

            _ajax(ip_url, 'GET', '', function (data) {
                console.log(data);
                
                /*var html = '';
                    if(data.rf_config.r24_channel == 1){
                        html= '<option value="1" selected="selected">默认</option>'+
                            '<option value="0">关闭</option>';
                    }else{
                        html= '<option value="1">默认</option>'+
                            '<option value="0"  selected="selected">关闭</option>';
                    }*/

                    var html_5 = '';

                    if(data.rf_config.r5_channel == 1){
                        html_5= '<option value="1" selected="selected">默认</option>'+
                            '<option value="0">关闭</option>';
                    }else {
                        html_5 = '<option value="1">默认</option>' +
                            '<option value="0"  selected="selected">关闭</option>';
                    }

                    $('#ip-content-2-table').append('<tr>' +

                    '<td><input type="hidden" name="hidden_ip_config_id" value="'+value.id+'">' + value.mac + '</td>' +

                    '<td><input type="text" class="hidden_ip_name_'+value.id+'" name="hidden_ip_config_name" value=' + value.device_name + ' ></td>' +

                    '<td><input type="text" class="hidden_ip_position_'+value.id+'" name="hidden_ip_config_position" value=' + value.location + '></td>' +
                    '<td>' +
                    '<select class="hidden_ip_channel_'+value.id+'" name="hidden_config_list_24_channel">' +
                        '<option value="-1">关闭</option>'+
                        '<option value="0">自动</option>'+
                        '<option value="1">1</option>'+
                        '<option value="2">2</option>'+
                        '<option value="3">3</option>'+
                        '<option value="4">4</option>'+
                        '<option value="5">5</option>'+
                        '<option value="6">6</option>'+
                        '<option value="7">7</option>'+
                        '<option value="8">8</option>'+
                        '<option value="9">9</option>'+
                        '<option value="10">10</option>'+
                        '<option value="11">11</option>'+
                        '<option value="12">12</option>'+
                        '<option value="13">13</option>'+
                    '</select>' +
                    '<select class="hidden_ip_24power_'+value.id+'" id="ip_index24_'+index+'" name="ip_config_list_24">' +
                        '<option value="0">自动</option>'+
                        '<option value="1">1</option>'+
                        '<option value="2">2</option>'+
                        '<option value="3">3</option>'+
                        '<option value="4">4</option>'+
                        '<option value="5">5</option>'+
                        '<option value="6">6</option>'+
                        '<option value="7">7</option>'+
                        '<option value="8">8</option>'+
                        '<option value="9">9</option>'+
                        '<option value="10">10</option>'+
                        '<option value="11">11</option>'+
                        '<option value="12">12</option>'+
                        '<option value="13">13</option>'+
                        '<option value="14">14</option>'+
                        '<option value="15">15</option>'+
                        '<option value="16">16</option>'+
                        '<option value="17">17</option>'+
                        '<option value="18">18</option>'+
                        '<option value="19">19</option>'+
                        '<option value="20">20</option>'+
                        '<option value="21">21</option>'+
                        '<option value="22">22</option>'+
                        '<option value="23">23</option>'+
                        '<option value="24">24</option>'+
                        '<option value="25">25</option>'+
                        '<option value="26">26</option>'+
                        '<option value="27">27</option>'+
                        '<option value="28">28</option>'+
                        '<option value="29">29</option>'+
                        '<option value="30">30</option>'+
                        '<option value="31">31</option>'+
                        '<option value="32">32</option>' +
                    '</select>' +
                    '</td>' +
                    '<td>' +
                    '<select class="hidden_ip_5channel_'+value.id+'" id="ip_index5_channel'+index+'" name="ip_config_channel_5">' +
                            //html_5+
                            '<option value="-1">关闭</option>'+
							'<option value="0">自动</option>'+
							'<option value="36">36</option>'+
							'<option value="40">40</option>'+
							'<option value="48">48</option>'+
							'<option value="44">44</option>'+
							'<option value="149">149</option>'+
							'<option value="153">153</option>'+
							'<option value="157">157</option>'+
							'<option value="161">161</option>'+
							'<option value="165">165</option>'+
                    '</select>' +
                    '<select class="hidden_ip_5power_'+value.id+'" id="ip_index5_'+index+'" name="ip_config_list_5">' +
                        '<option value="0">自动</option>'+
                        '<option value="1">1</option>'+
                        '<option value="2">2</option>'+
                        '<option value="3">3</option>'+
                        '<option value="4">4</option>'+
                        '<option value="5">5</option>'+
                        '<option value="6">6</option>'+
                        '<option value="7">7</option>'+
                        '<option value="8">8</option>'+
                        '<option value="9">9</option>'+
                        '<option value="10">10</option>'+
                        '<option value="11">11</option>'+
                        '<option value="12">12</option>'+
                        '<option value="13">13</option>'+
                        '<option value="14">14</option>'+
                        '<option value="15">15</option>'+
                        '<option value="16">16</option>'+
                        '<option value="17">17</option>'+
                        '<option value="18">18</option>'+
                        '<option value="19">19</option>'+
                        '<option value="20">20</option>'+
                        '<option value="21">21</option>'+
                        '<option value="22">22</option>'+
                        '<option value="23">23</option>'+
                        '<option value="24">24</option>'+
                        '<option value="25">25</option>'+
                        '<option value="26">26</option>'+
                        '<option value="27">27</option>'+
                        '<option value="28">28</option>'+
                        '<option value="29">29</option>'+
                        '<option value="30">30</option>'+
                        '<option value="31">31</option>'+
                        '<option value="32">32</option>' +
                    '</select>' +
                    '</td>' +
                    '</tr>');
                    //2.4信道
                    $('.hidden_ip_channel_'+value.id+' option').each(function (index,value) {

                       if($(value).val() == data.rf_config.r24_channel){

                           $(this).attr('selected','selected');
                       }
                    });
                    //2.4批功率
                    $('#ip_index24_'+index+' option').each(function (index,value) {

                       if($(value).val() == data.rf_config.r24_power){

                           $(this).attr('selected','selected');
                       }
                    });
                    //5g信道
                    $('#ip_index5_channel'+index+' option').each(function (index,value) {

                        if($(value).val() == data.rf_config.r5_channel){

                            $(this).attr('selected','selected');
                        }
                    });
                    //5g功率
                    $('#ip_index5_'+index+' option').each(function (index,value) {

                        if($(value).val() == data.rf_config.r5_power){

                            $(this).attr('selected','selected');
                        }
                    });

            });


        });


    };


    /**
     * 名称:DHCP中的切换事件
     * @param ''
     * @return
     */
    var switchDHCP = function(){
    	
    	var dhcp_val = $('select[name="ip_config_dhcp"] option').val();
    	if(dhcp_val == 0){
    		//IP联动
			$('input[name="ip_config_one"]').prop('readonly','readonly');
			$('input[name="ip_config_one"]').css({
				'border-width':'0px'
			})
			//掩码联动
			$('input[name="ip_config_ym"]').prop('readonly','readonly');
			$('input[name="ip_config_ym"]').css({
				'border-width':'0px'
			})
			//网关联动
			$('input[name="ip_config_wg"]').prop('readonly','readonly');
			$('input[name="ip_config_wg"]').css({
				'border-width':'0px'
			})
    	}else{
    		//IP联动
			$('input[name="ip_config_one"]').removeProp('readonly');
			$('input[name="ip_config_one"]').css({
					'border-width':'2px'
				})
			//掩码联动
			$('input[name="ip_config_ym"]').removeProp('readonly');
			$('input[name="ip_config_ym"]').css({
					'border-width':'2px'
				})
			//网关联动
			$('input[name="ip_config_wg"]').removeProp('readonly');
			$('input[name="ip_config_wg"]').css({
					'border-width':'2px'
				})
    	}
    	
    	
	    $('select[name="ip_config_dhcp"]').change(function () {
	
	        var _self = this;
	
	        var opt_val = $(_self).val();
	
	        if (opt_val == 1) {
	        	//IP联动
				$('input[name="ip_config_one"]').removeProp('readonly');
				$('input[name="ip_config_one"]').css({
						'border-width':'1px'
					})
				//掩码联动
				$('input[name="ip_config_ym"]').removeProp('readonly');
				$('input[name="ip_config_ym"]').css({
						'border-width':'1px'
					})
				//网关联动
				$('input[name="ip_config_wg"]').removeProp('readonly');
				$('input[name="ip_config_wg"]').css({
						'border-width':'1px'
					})
	
	           	ip_config_device(ip_config_cid);
	           
	        } else {
	
	            ip_config_detail(ip_config_cid);
	            
	            //获取左侧节点id
	            var id = $('input[name="ip_config_id"]').val();
	            
	            var url = _IFA['ap_get_device_detail'] + id;
	            
		        _ajax(url, 'GET', '', function (data) {
		        	console.log(data)
		            //写入到ip,掩码,网关中
		
		            $('input[name="ip_config_wg"]').val(data.gateway);//网关地址
		
		            $('input[name="ip_config_one"]').val(data.ipv4);//ip
		
		            $('input[name="ip_config_ym"]').val(data.netmask);//掩码地址
		
		        });
	            
	        }
	        console.log(opt_val);
	
	    });
    }


    /**
     * 名称:保存事件
     * @param ''
     * @return ''
     */
    $('#ip-config-submit').unbind().bind('click', function () {

        //获取是否是更新方式
        var _self = this;

        var type = $(_self).attr('data-type');

        if (type == '' || type == undefined) {

            ip_config_one_update();//更新
			
        } else {

            //第二页列表数据更新
            ip_config_two_update();

        }


    });


    /**
     * 名称:单条数据配置更新
     * @param ''
     * @return ''
     *
     */
    var ip_config_one_update = function () {

        //获取当前选定的列表
        var ids = new Array;

        var rf_config = new Array;

        $('input[name="ip_config_id"]:checked').each(function (index, value) {

            //判断是否单条编辑还是多条编辑
            if(index >= 1){

                ids.push($(this).val());

            }else{
                //单条编辑
                ids.push($(this).val());
            }

        });

        //判断ids是否有值
        if(ids.length == 0){

            toast('提示消息', '请选择要更新的数据', 'warning');

            return false;
        }

        if(ids.length == 1){

            //获取单条数据
            var name = $('input[name="ip_config_name"]').val();

            var position = $('input[name="ip_config_position"]').val();//位置

            var ip = $('input[name="ip_config_one"]').val();//ip

            var dhcp = $('select[name="ip_config_dhcp"]').val();//dhcp的值

            var ym = $('input[name="ip_config_ym"]').val();//掩码

            var wg = $('input[name="ip_config_wg"]').val();//网关

            var dns1 = $('input[name="ip_config_dns1"]').val();//dns1

            var dns2 = $('input[name="ip_config_dns2"]').val();//dns2


            //配置详情

            var ip_r24_channel = $('select[name="ip_r24_channel"]').val();//管道

            var ip_r24_xy = $('select[name="ip_r24_xy"]').val();//协议


            var ip_r24_bandwidth = $('select[name="ip_r24_bandwidth"]').val();//带宽

            var ip_r24_power = $('select[name="ip_r24_power"]').val();//功率

            //最多终端数
            var ip_r24_maxclicents = $('input[name="ip_r24_maxclients"]').val();


            //射频参数5g


            var ip_r5_channel = $('select[name="ip_r5_channel"]').val();//管道
console.log(ip_r5_channel)

            var ip_r5_xy = $('select[name="ip_r5_xy"]:selected').val();//协议


            var ip_r5_bandwidth = $('select[name="ip_r5_bandwidth"]').val();//带宽

            var ip_r5_power = $('select[name="ip_r5_power"]').val()//功率

            //最多终端数
            var ip_r5_maxclients = $('input[name="ip_r5_maxclients"]').val();

           //拼接数据
            rf_config = {
                "r5_channel":ip_r5_channel,
                "r5_power":ip_r5_power,
                "r5_status":"",
                "r5_maxclient":ip_r5_maxclients,
                "r5_bandwidth":ip_r5_bandwidth,
                "r24_status":"",
                "r24_channel":ip_r24_channel,
                "r24_power":ip_r24_power,
                "r24_bandwidth":ip_r24_bandwidth,
                "r24_maxclient":ip_r24_maxclicents,
            };
            console.log(rf_config);
            var json_data = {
                "ids":ids,
                "device_name":name,
                "location":position,
                "ip_type":dhcp,
                "ipv4":ip,
                "netmask":ym,
                "gateway":wg,
                "dns1":dns1,
                "dns2":dns2,
                "rf_config":rf_config,
            };
            ip_config_data_send(JSON.stringify(json_data));
        }else{
        	
            //多条数据
            //配置详情
            var ip_r24_channel = $('select[name="ip_r24_channel"]').val();//管道
          
            var ip_r24_xy = $('select[name="ip_r24_xy"]').val();//协议

            var ip_r24_bandwidth = $('select[name="ip_r24_bandwidth"]').val();//带宽

            var ip_r24_power = $('select[name="ip_r24_power"]').val();//功率

            //最多终端数
            var ip_r24_maxclicents = $('input[name="ip_r24_maxclients"]').val();


            //射频参数5g


            var ip_r5_channel = $('select[name="ip_r5_channel"]').val();//管道


            var ip_r5_xy = $('select[name="ip_r5_xy"]:selected').val();//协议


            var ip_r5_bandwidth = $('select[name="ip_r5_bandwidth"]').val();//带宽

            var ip_r5_power = $('select[name="ip_r5_power"]').val()//功率

            //最多终端数
            var ip_r5_maxclients = $('input[name="ip_r5_maxclients"]').val();
            

            //拼接数据
            rf_config = {
                "r5_channel":ip_r5_channel,
                "r5_power":ip_r5_power,
                "r5_status":"",
                "r5_mode":ip_r5_xy,
                "r5_maxclient":ip_r5_maxclients,
                "r5_bandwidth":ip_r5_bandwidth,
                "r24_status":"",
                "r24_mode":ip_r24_xy,
                "r24_channel":ip_r24_channel,
                "r24_power":ip_r24_power,
                "r24_bandwidth":ip_r24_bandwidth,
                "r24_maxclient":ip_r24_maxclicents,
            };
            
            //判断信道是否  ‘---’
            if(ip_r24_channel == '---'){
            	delete rf_config.r24_channel;
            }
            //判断协议是否   ‘---’
            if(ip_r24_xy == '---'){
            	delete rf_config.r24_mode;
            }
            //判断带宽是否  ‘---’
            if(ip_r24_bandwidth == '---'){
            	delete rf_config.r24_bandwidth;
            }
            //判断功率是否  ‘---’
            if(ip_r24_power == '---'){
            	delete rf_config.r24_power;
            }
            //判断最多终端数是否  ‘---’
            if(ip_r24_maxclicents == '---'){
            	delete rf_config.r24_maxclient;
            }
            
            //----5G
            //判断信道是否  ‘---’
            if(ip_r5_channel == '---'){
            	delete rf_config.r5_channel;
            }
            //判断协议是否   ‘---’
            if(ip_r5_xy == '---'){
            	delete rf_config.r5_mode;
            }
            //判断带宽是否  ‘---’
            if(ip_r5_bandwidth == '---'){
            	delete rf_config.r5_bandwidth;
            }
            //判断功率是否  ‘---’
            if(ip_r5_power == '---'){
            	delete rf_config.r5_power;
            }
            //判断最多终端数是否  ‘---’
            if(ip_r5_maxclients == '---'){
            	delete rf_config.r5_maxclient;
            }

            var json_data = {
                "ids":ids,
                "rf_conﬁg":rf_config,
            };

            ip_config_data_send(JSON.stringify(json_data));


        }




    };


    /**
     * 名称:第二条数据更新
     * @param ''
     * @return
     */
    var ip_config_two_update = function () {

        //获取所有列表
        var id = new Array;

        var list = new Array;

        $('input[name="hidden_ip_config_id"]').each(function (index,value) {

            id.push($(this).val());//代码更新

        });

        $.each(id,function (index,value) {

            //var name = $('');

            var id = value;//主键id

            var name = $('.hidden_ip_name_'+value).val();//用户名称

            var position = $('.hidden_ip_position_'+value).val();//位置

            var r24_channel = $('.hidden_ip_channel_'+value).val();//2.4g的信道

            var r24_power = $('.hidden_ip_24power_'+value).val();//2.4g的功率

            var r5_channel = $('.hidden_ip_5channel_'+value).val();//5g的信道

            var r5_power = $('.hidden_ip_5power_'+value).val();//5g的功率


            var str_data = {"id":id,
                "device_name":name,
                "location":position,
                "rf_config":{
                    "r24_channel":r24_channel,
                    "r24_power":r24_power,
                    "r5_channel":r5_channel,
                    "r5_power":r5_power,

                },
            };

            list.push(str_data);

            console.log(value);
        });
        //拼接数据

      /*  var list = {
            0:{"id":"",
               "device_name":"",
                "location":"",
                "rf_config":{
                "r24_channel":"",
                "r24_power":"",
                "r5_channel":"",
                "r5_power":"",

                },
            },

        };*/



        console.log(id);
        console.log(list);
        var json_list = {"list":list};
        ip_config_one_send(json_list);

    };

    /**
     * 名称:配置窗口关闭事件
     * @param ''
     * @return ''
     */
    $('#ip-config-canche').unbind().bind('click',function () {

        closeWindow('#win-ap-config');

    });


    /*关闭窗口*/
    var closeWindow = function(winId){
        $(winId).window('close');
    };


    /**
     * 名称:批量更新数据
     * @param arr
     * @return
     */
    var ip_config_one_send = function (data) {
        console.log(data);
        if(data == '' || data == undefined){

            return false;
        }

        var url = _IFA['ap_update_device_conﬁg'];
        console.log(url);
        _ajax(url,'POST', JSON.stringify(data),function (response) {
            console.log(response);

           if(response.error_code == 0){

               toast('提示消息', '更新数据成功', 'info');

               $('.ap-config-ip').trigger('click');//重新获取数据

           }else{

               toast('提示消息', response.error_msg, 'waring');
           }
        })



    };


    /**
     * 名称:批量更新数据
     * @param data 带更新数据
     * @return
     */
    var ip_config_data_send = function (data) {
        console.log(data);
        if(data == '' || data == undefined){

            return false;
        }

        var url = _IFA['ap_bulk_update_device_conﬁg'];

        _ajax(url,'PUT',data,function (response) {
            if(response.error_code == 0){

                toast('提示消息', '更新数据成功', 'info');

                $('.ap-config-ip').trigger('click');//重新获取请求
            }else{

                toast('提示消息', response.error_msg, 'waring');
            }
            console.log(response);
        });

    };
    
    /**
     * 勾选id，判断射频数据是否一致
     */
    var RF_config_list = function (data) {

        if (data == '' || data == undefined) {

            return false;
        }
        console.log(data);
       // console.log(data[0].radios)
        var j;
        for(var i=0; i<data.length; i++){
        	j = new Array;
        	console.log(i)
        	console.log(data[i].radios,data[i].id);
        	//for(var n=0; n<data.)
        }
    };
    
    
    var bindEven = function(){
    		checkright();
    }
    var run = function(){
    		bindEven();
    		ip_config();
    }

    return {
		'run':function(){
			//这年头toC都没有我
			return run();
		}
	}
});


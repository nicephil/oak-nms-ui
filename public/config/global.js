/*========================================================*
 * @Title:			    config.js
 * @Description:		全局配置设置
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/

//桌面应用加载状态
var loaded = false;

//是否打开内置框架加载
var iframeOpen = false;

//设置桌面图标大小
var iconSize = 62;

//app打开是否双击
var dbClick = false;

//设置任务栏的位置
var taskBlankPos = 'north';
	        
//远程数据加载路径
var loadUrl = { 
	app: 'public/config/app.js',
   }

//应用于加载进度条
var lang = { 
    initLayout: "初始化布局",
    initTaskBlank: "初始化任务栏",
    initDeskTop: "初始化桌面",
    initStartMenu: "初始化开始菜单",
    initCalendar: "初始化日历",
    initWidget: "初始化小物件",
    progress: {
        title: '请稍等...',
        msg: '正在加载数据...'
    }
}
//窗口的默认参数
var optionsConfig = {
	height: 540,
    width: 960,
    resizable: true,
    maximizable: true,
    minimizable: true,
    shadow: true,
    collapsible:false,
    style:{overflow:'hidden'}
}



//接口地址
var _HOST = 'http://clouddev.oakridge.vip/nms/';

var _IFA = new Array();

//入口信息
_IFA['permittedorganization'] = _HOST+'authority/permittedorganization';

/*---------------------------用户接口--------------------------*/

//获取用户组--get
_IFA['groups_list'] = _HOST+'users/local/groups?org_ids=';

//创建用户组-post
_IFA['groups_create'] = _HOST+'users/local/groups';

//更新用户组-put/{id}
_IFA['groups_update'] = _HOST+'users/local/groups/';

//删除用户组-DELETE/{id}
_IFA['groups_delete'] = _HOST+'users/local/groups/';

//查询用户-GET
_IFA['user_local'] = _HOST+'users/local';

//创建用户-POST
_IFA['user_create'] = _HOST+'users/local';

//批量创建用户-POST
_IFA['user_create_bulk'] = _HOST+'users/local/bulk';

//更新用户-PUT{id}
_IFA['user_update'] = _HOST+'users/local/';

//批量更新用户-PUT{id}
_IFA['user_update_bulk'] = _HOST+'users/local';

//删除用户-DELETE{id}
_IFA['user_delete'] = _HOST+'users/local/';

//批量删除用户-POST
_IFA['user_delete_bulk'] = _HOST+'users/local/delete';

//检查用户是否存在-POST
_IFA['user_exist'] = _HOST+'users/local/exist';

//获取用户摘要-GET
_IFA['user_brief'] = _HOST+'users/local/brief';

//导入用户-POST
_IFA['user_import'] = _HOST+'users/local/import';

//用户导出-GET
_IFA['user_export'] = _HOST+'users/local/export';

//结果导出-GET
_IFA['user_export_result'] = _HOST+'users/local/export/result';

//邮件通知
_IFA['user_notify_email'] = _HOST+'users/local/notify/email';

/*---------------------------网络接口--------------------------*/

//创建SSID-POST
_IFA['network_create_ssids'] = _HOST+'config/network/ssids';

//获取SSID列表-GET
_IFA['network_list_ssids'] = _HOST+'config/network/ssids';

//获取SSID详情-GET
_IFA['network_detail_ssids'] = _HOST+'config/network/ssids/';

//启用状态
_IFA['network_status_ssids'] = _HOST+'config/network/ssids/';

//更新SSID-PUT
_IFA['network_update_ssids'] = _HOST+'config/network/ssids/';//{id}

//删除SSID-DELETE
_IFA['network_delete_ssids'] = _HOST+'config/network/ssids/';//{id}

//检查设备SSID-POST
_IFA['network_check_ssids'] = _HOST+'config/network/ssids/check/devices';

//绑定时间控制策略 -POST  ID在中间做的时候处理下
_IFA['network_bind_time_ssids'] = _HOST+'config/network/ssids/{id}/timeacls/bind';

//解绑时间控制策略-POST  ID在中间做的时候处理下
_IFA['network_unbind_time_ssids'] = _HOST+'config/network/ssids/{id}/timeacls/unbind';

//获取portal配置列表-GET 
_IFA['network_config_portal'] = _HOST+'config/portal/profiles';

//邮件通知-POST 
_IFA['network_notify_email'] = _HOST+'config/network/ssids/';

//创建时间组件-POST 
_IFA['network_create_component_times'] = _HOST+'config/component/times';

//获取时间组件列表-GET 
_IFA['network_get_component_times'] = _HOST+'config/component/times';

//获取时间组件详情-GET 
_IFA['network_detail_component_times'] = _HOST+'config/component/times/';//{id}

//创建时间访问控制策略-POST 
_IFA['network_create_component_timeacls'] = _HOST+'config/component/timeacls';

//获取时间访问控制策略-GET 
_IFA['network_get_component_timeacls'] = _HOST+'config/component/timeacls';

//获取时间访问控制策略-PUT 
_IFA['network_update_component_timeacls'] = _HOST+'config/component/timeacls/';//{id}

/*AP用户接口*/

//获取AP用户组--get
_IFA['ap_groups_list'] = _HOST+'config/devices/groups?org_ids=';

//获取AP列表--get
_IFA['ap_table_list'] = _HOST+'monitor/devices';

//创建AP设备组--post 
_IFA['ap_create_able_list'] = _HOST+'config/devices/groups';

//编辑AP设备组-- put
_IFA['ap_update_able_list'] =  _HOST+'config/devices/groups/';

//删除AP设备组--DELETE 
_IFA['ap_delete_able_list'] = _HOST+'config/devices/groups/';

//获取AP列表组详情 ----GET 
_IFA['ap_list_particulars'] = _HOST+'config/devices/groups/';

//添加设备  ---POST
_IFA['ap_add_device'] = _HOST+'config/devices';

//删除设备  ---DELETE
_IFA['ap_delete_device'] = _HOST+'config/devices/';

//批量删除设备----POST
_IFA['ap_batch_delete_device'] = _HOST+'config/devices/delete';

//更新设备配置---PUT
_IFA['ap_update_device_config'] = _HOST+'config/devices/';

//获取设备配置详情----GET
_IFA['ap_get_device_config_detail'] = _HOST+'config/devices/';

//批量更新设备配置-----PUT
_IFA['ap_bulk_update_device_conﬁg'] = _HOST+'config/devices/';

//更新多个设备配置----POST
_IFA['ap_update_device_conﬁg'] = _HOST+'config/devices/multiple';

//获取设备列列表---GET
_IFA['ap_get_device_list'] = _HOST+'monitor/devices';

//获取设备详情----GET  -----{id	or	mac}
_IFA['ap_get_device_detail'] = _HOST+'monitor/devices/';

//流量统计----GET  stat/devices/{id}/flow
_IFA['ap_get_device_ﬂow_stat'] = _HOST+'stat/devices/';

//终端统计-----GET   stat/devices/{id}/client
_IFA['ap_get_device_clien_stat'] = _HOST+'stat/devices/';

//RF利用率统计----GET   stat/devices/{id}/rf/utilization
_IFA['ap_get_device_RF_utilization_stat'] = _HOST+'stat/devices/';

//RF噪声值统计-----	GET   stat/devices/{id}/rf/noisefloor
_IFA['ap_get_device_rf_noise_stat'] = _HOST+'stat/devices/';

//信道分析 ------post   monitor/devices/{id}/channel/analyse
_IFA['ap_channel_analyse'] = _HOST+'monitor/devices/';

//获取信道分析结果---GET   monitor/devices/{id}/channel/analyse
_IFA['ap_get_channel_analyse_result'] = _HOST+'monitor/devices/';

//配置设备信道-----POST   monitor/devices/{id}/channel
_IFA['ap_conﬁg_channel'] = _HOST+'monitor/devices/';

//设备重启----POST    monitor/devices/{id}/reboot
_IFA['ap_reboot_device'] = _HOST+'monitor/devices/';

//批量设备重启---POST  monitor/devices/reboot
_IFA['ap__batch_reboot_device'] = _HOST+'monitor/devices/reboot';

//获取事件日志
_IFA['ap__get_event_log'] = _HOST+'logs/events';






/*========================================================*
 * @Title:			    config.js
 * @Description:		全局配置设置
 * @Author:         	corper
 * @Date:           	2017-11-21
 * @Version:       		V1.0 
 * @Copyright        	峥嵘时代
/*========================================================*/

console.log('加载配置信息');

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



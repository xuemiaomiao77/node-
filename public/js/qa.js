// 适配样式
var dropflag = false
if (isMobile()) {
    console.log("mobile");
    $('.nav').addClass('mobile')
    $('.container').addClass('mobile')
    $('.main-sidebar').addClass('mobile')
    $('.content').addClass('mobile')
    $('.sidebar-form').addClass('mobile')
    $('.input-group').addClass('mobile')
    dropflag = true
    $('.main-sidebar').animate({ width: 0}, 'fast')
    $('.menu-btn').animate({
        left: isMobile()? 0: '-80px',
        borderTopLeftRadius: 0,
        borderTopRightRadius:'50%',
        borderBottomRightRadius:'50%',
        borderBottomLeftRadius:0
    }, 'fast')
} else {
    dropflag = false
    console.log("pc");
}

function isMobile() {
    let flag = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return flag;
}


var pre_url = 'index 2.html#';
var var_hash_params = [];
var var_menulist = [];
initMenulist();//初始化菜单
getUrlParams();//获取参数
initData();//初始化数据

window.onhashchange = function () {
    getUrlParams();//获取hash参数
    initData();//重新获取数据
};

function getUrlParams() {
    let location = window.location;
    let hash = location.hash;//hash变化
    // console.log(hash, 'hash')
    let query = location.search.substring(1);//跳转后参数变化
    // console.log(query, 'search')
    hash = hash.replace('#?', '');
    let url_params = '';
    let value_params = [];
    let var_params = [];
    if (hash != '' || query != '') {
        url_params = hash;
        if (url_params == '') {
            url_params = query
        }
        url_params = url_params.split("&");

        for (var i = 0; i < url_params.length; i++) {
            var param = url_params[i].split("=");
            var_params.push(param[0]);
            value_params.push(param[1]);
        }
    }
    var_hash_params = [var_params, value_params]
}


function initMenulist() {
    if (var_menulist.length == 0) {
        var_menulist = getMenuList();//获取所有菜单
        setMenuFun(var_menulist);//渲染左侧菜单栏
        // console.log('initmenu')
    }
}

function initData() {
    // console.log(var_hash_params)
    changeMenu();

    if (var_hash_params && var_hash_params[1].length > 0) {
        let var_params = var_hash_params[0];
        let menu_id_index = var_params.indexOf('menu_id');
        let content_id_index = var_params.indexOf('content_id');
        let keyword_index = var_params.indexOf('keyword');

        if (keyword_index == -1) {
            $("#keyword").val('');
        }

        if (menu_id_index > -1 && content_id_index > -1) {

            initMenulist();
            changeMenu(var_hash_params[1][menu_id_index]);//本菜单改为active
            let content_info = getContentDetail(var_hash_params[1][content_id_index]);//获取内容信息
            let menu_info = null;
            if (!content_info) {
                menu_info = findMenuinfo(var_hash_params[1][menu_id_index]);
            }
            setContentDetail(content_info, menu_info)//渲染内容

        } else if (menu_id_index > -1) {//某菜单下所有内容

            initMenulist();
            let menu_id = var_hash_params[1][menu_id_index];
            changeMenu(menu_id);//本菜单改为active

            let contentlist = getContent(menu_id);//获取本菜单下内容信息

            let menu_name = '';
            if (contentlist.length == 0 || !contentlist) {
                let menu_info = findMenuinfo(menu_id);
                menu_name = menu_info.name ? menu_info.name : '';
            } else {
                let content_info = contentlist[0];
                menu_name = content_info.qa_menu.name ? content_info.qa_menu.name : '';
            }
            setContent(contentlist, menu_name, menu_id);//渲染内容信息

        } else if (keyword_index > -1) {//查询关键字

            initMenulist();
            changeMenu();//关键字结果页菜单全部是未激活
            let keyword = decodeURI(var_hash_params[1][keyword_index]);//获取关键词
            $("#keyword").val(keyword)

            let searchContent = getSearchContent(keyword);
            setSearchContent(searchContent, keyword)
        }
        // console.log('initdata-has-params')
    } else {
        //首次访问
        initMenulist();
        let menu_id = null;
        let menu_name = null;

        if (var_menulist && var_menulist.length > 0) {
            let first_child = getFirstMenuChild(var_menulist[0]);
            if(first_child && first_child.id && first_child.name){
                menu_id =  first_child.id;
                menu_name = first_child.name;
            }
            if(menu_id) {
                changeMenu(menu_id);//第一个子菜单改为active
            }
        }
        if (menu_id) {
            let content = getContent(menu_id, menu_name);
            setContent(content, menu_name, menu_id);
        }
        // console.log('initdata-default')
    }
}

function getFirstMenuChild(menu) {
    if(menu.children && menu.children.length > 0){
        return getFirstMenuChild(menu.children[0])
    }else {
        return menu;
    }
}

/**
 * 获取关键字查询结果
 * @param keyword
 */
function getSearchContent(keyword = '') {
    if (!keyword) {
        keyword = $('#keyword').val();
    }
    let params = {
        keyword: keyword
    };
    //分页信息
    let content_list = [];
    $.ajax({
        type: 'get',
        url: '/api/qa/front/search',
        data: params,
        cache: false,
        async: false,
        dataType: 'json',
        success: function (result) {
            if (result.success) {
                content_list = result.data;
            } else {
                console.log('接口异常');
            }
        }
    });
    return content_list;
}


/**
 * 获取所有菜单信息
 */
function getMenuList() {
    let params = {};
    let menulist = []
    $.ajax({
        "rejectUnauthorized": false,
        type: 'get',
        url: '/api/qa/front/menulist',
        data: params,
        cache: false,
        async: false,
        dataType: 'json',
        success: function (result) { 
            if (result.success) {
                menulist = result.data;
            } else {
                console.log('接口异常');
            }
        }
    });
    return menulist;
}


/**
 * 获取某菜单下所有内容
 * @param menu_id
 */
function getContent(menu_id) {
    let contentlist = [];
    if (menu_id) {
        let params = {menu_id: menu_id};
        $.ajax({
            type: 'get',
            url: '/api/qa/front/contentlist',
            data: params,
            cache: false,
            async: false,
            dataType: 'json',
            success: function (result) {
                if (result.success) {
                    contentlist = result.data;
                } else {
                    console.log('调用接口出错');
                }

            }
        });
    }
    return contentlist;
}

/**
 * 获取内容详情
 * @param content_id
 */
function getContentDetail(content_id) {
    let content_info = null;
    if (content_id) {
        let params = {
            id: content_id
        };
        //分页信息
        $.ajax({
            type: 'get',
            url: '/api/qa/front/info',
            data: params,
            cache: false,
            async: false,
            dataType: 'json',
            success: function (result) {
                if (result.success) {
                    content_info = result.data
                } else {
                    console.log('接口异常');
                }

            }
        });
    }
    return content_info
}


//查询菜单信息
function findMenuinfo(menu_id) {
    let menu_info = null;
    if (menu_id) {
        let params = {
            menu_id: menu_id
        };
        //分页信息
        $.ajax({
            type: 'get',
            url: '/api/qa/front/menuinfo',
            data: params,
            cache: false,
            async: false,
            dataType: 'json',
            success: function (result) {
                if (result.success) {
                    menu_info = result.data
                } else {
                    console.log('接口异常');
                }

            }
        });
    }
    return menu_info
}

/**
 * 渲染内容信息
 * @param content_info {}
 */
function setContentDetail(content_info, menu_info = '') {
    let title = '';
    let contentlist = [];
    if (content_info) {
        title = content_info.title;
        contentlist.push(content_info);
    } else if (menu_info) {
        title = menu_info.name;
    }
    if(!title) {
        title = '暂无数据';
    }
    $('#qa-content-header').html(title);
    let html_content = '<div class="qa-content-detail">';
    if (contentlist && contentlist.length > 0) {
        html_content += setSinleContent(contentlist);
    } else {
        html_content += '暂无数据';
    }
    html_content += '</div>';
    $('#qa-content-body').html(html_content);
}

//enter键
$(document).keydown(function (event) {
    if (event.keyCode == 13) {
        searchKeyWord();
    }
});

//查询
function searchKeyWord() {
    let keyword = $('#keyword').val() ? $('#keyword').val() : '';
    if (keyword) {
        window.location.href = pre_url + '?keyword=' + keyword;
    }
}


//渲染查询结果
function setSearchContent(data, keyword) {
    let title = '<span style="font-size: 16px;">搜索 <span class="main-color">"' + keyword + '" </span> , 共有<span class="main-color"> ' + data[0] + ' </span>条结果</span>';
    if(!title){
        title = '暂无数据';
    }
    $('#qa-content-header').html(title);
    let html_content = '';
    let contentlist = data[1];
    if (contentlist && contentlist.length > 0) {
        html_content += setListContent(contentlist);//列表展示
    } else {
        html_content += '暂无数据';
    }
    html_content += '</div>';
    $('#qa-content-body').html(html_content);
}


//渲染菜单栏信息
function setMenuFun(menulist) {
    let html_content = '';
    if (menulist) {
        for (var menu of menulist) {
            if (menu.children && menu.children.length > 0) {
                html_content += '<li class="treeview" data-id="' + menu.id + '">' +
                    '<a href="javascript:;">' +
                    '<img class="nav_icon" src="./img/nav_icon.png" /> <span>' + menu.name + '</span>' +
                    '<span class="pull-right-container">' +
                    '<i class="fa fa-angle-left pull-right"></i>' +
                    '</span>' +
                    '</a>' +
                    '<ul class="treeview-menu">';
                html_content += setMenuChildren(menu.children);
                html_content += '</ul></li>'
            } else {
                html_content += '<li data-id="' + menu.id + '">';
                html_content += '<a href="' + pre_url + '?menu_id=' + menu.id + '">';
                html_content += '<img class="nav_icon" src="./img/nav_icon.png" />' +
                    ' <span>' + menu.name + '</span>' +
                    '</a>' +
                    '</li>'
            }
        }
    }
    $('#menu').html(html_content);
}

//渲染子菜单
function setMenuChildren(menulist) {
    let html_content = '';
    for (var menu of menulist) {
        if (menu.children && menu.children.length > 0) {
            html_content += ' <li class="treeview" data-id="' + menu.id + '">' +
                '<a href="javascript:;">' +
                '<i class="fa fa-circle-o"></i> <span>' + menu.name + '</span>' +
                '<span class="pull-right-container">' +
                '<i class="fa fa-angle-left pull-right"></i>' +
                '</span>' +
                '</a>' +
                '<ul class="treeview-menu">';
            html_content += setMenuChildren(menu.children);
            html_content += '</ul></li>';
        } else {
            html_content += '<li data-id="' + menu.id + '">' +
                '<a href="' + pre_url + '?menu_id=' + menu.id + '">' +
                // '<a href="javascript:;" onclick="changeMenu(\'' + menu.name + '\',' + menu.id + ')">' +
                '<i class="fa fa-circle" style="transform: scale(0.8) ;margin-left: 10px;"></i> <span>' + menu.name + '</span>' +
                '</a>' +
                '</li>';
        }
    }
    return html_content;
}

//改变所选菜单时，样式更新
function changeMenu(menu_id = '') {
    $("#menu li").removeClass("active menu-open");
    $("#menu .treeview  ul").css("display", 'none');

    if (menu_id) {
        let element_li = $("li[data-id=" + menu_id + "]");
        element_li.addClass("active");
        element_li.parents().addClass("active");
        // console.log($("li[data-id=" + menu_id + "]").parent().is('.treeview-menu'));
        // console.log($("li[data-id=" + menu_id + "]").parent().is('.treeview'));
        findTreeview(element_li)
    }
}

function findTreeview(element_li) {

    if (element_li.parent().is('.treeview-menu')) {
        element_li.parent().css("display", 'block');
        findTreeview(element_li.parent())
    } else if (element_li.parent().is('.treeview')) {
        element_li.parent().addClass('menu-open');
        findTreeview(element_li.parent())
    }
}

//某菜单下内容展示
function setContent(contentlist, menu_name, menu_id) {
    if (!contentlist)
        contentlist = [];

    if (!menu_name)
        menu_name = '暂无数据';

    if (!menu_id)
        menu_id = '';

    $('#qa-content-header').html(menu_name);

    let html_content = '<div>';
    if (contentlist && contentlist.length > 0) {
        let display_type = contentlist[0].qa_menu.display_type;
        if (display_type == 1) {//同页展示
            html_content += setSinleContent(contentlist);
        } else {//列表展示
            html_content += setListContent(contentlist, menu_id)
        }

    } else {
        html_content += '暂无数据';
    }
    html_content += '</div>';
    $('#qa-content-body').html(html_content);
}


//查看内容详情页
function showContent(content_id, menu_id) {
    window.location.href = pre_url + "?menu_id=" + menu_id + "&content_id=" + content_id;
}


//列表展示数据
function setListContent(contentlist, menu_id) {
    let html_content = '<div class="qa-content-div-list">'
    if (contentlist && contentlist.length > 0) {
        for (var content of contentlist) {
            html_content +=
                '<div class="qa-content-div" onclick="showContent(' + content.id + ',' + content.menu_id + ')">' +
                '<div class="qa-content-title"><i class="fa fa-circle-o"></i>' + content.title + '</div>' +
                '<div class="qa-content-desc">' + content.desc_show + '</div>' +
                '</div>';
        }
    } else {
        html_content += '暂无数据';
    }
    html_content += '</div>';
    return html_content;
}

//单页展示数据
function setSinleContent(contentlist) {
    let html_content = '<div>';
    if (contentlist && contentlist.length > 0) {
        for (var content of contentlist) {
            $('#qa-content-header').html(content.title);
            html_content +=
                '<div class="qa-content-detail">' + content.content  +
                '</div>';
        }
    } else {
        html_content += '暂无数据';
    }
    html_content += '</div>';
    return html_content;
}
$('#menu-btn').click(function(){
    if(dropflag){
        dropflag = false

        $('.main-sidebar').animate({ width: 260}, 'fast')
        $(this).animate({
            left: '224px',
            right: '8px',
            borderTopLeftRadius: '50%',
            borderTopRightRadius:'50%',
            borderBottomRightRadius:'50%',
            borderBottomLeftRadius:'50%'
        }, 'slow')
        $('.menu-btn-icon').removeClass('active')
    }else{
        dropflag = true

        $('.main-sidebar').animate({ width: 0}, 'fast')
        $(this).animate({
            left: isMobile()? 0: '-80px',
            borderTopLeftRadius: 0,
            borderTopRightRadius:'50%',
            borderBottomRightRadius:'50%',
            borderBottomLeftRadius:0
        }, 'fast')
        $('.menu-btn-icon').addClass('active')
    }
    
})

$(document).on('touchmove', '.content', function (e) {
    if($('body').hasClass('sidebar-open')){
        $('body').removeClass('sidebar-open')
    }
});

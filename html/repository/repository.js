function t(key) {
    try {
        let i18n = window.APP_I18N || (window.APP && window.APP.i18n);
        if (i18n && i18n.t) {
            let args = Array.prototype.slice.call(arguments, 1);
            return i18n.t.apply(i18n, [key].concat(args));
        }
    } catch (e) {}

    let args2 = Array.prototype.slice.call(arguments, 1);
    if (args2 && args2.length) {
        return key + ' ' + args2.join(' ');
    }
    return key;
}

function __repository_applyI18n(root) {
    try {
        let i18n = window.APP_I18N || (window.APP && window.APP.i18n);
        if (i18n && i18n.apply) {
            i18n.apply(root || document);
        }
    } catch (e) {}
}

function __repository_applyRepoFormPrompts(root) {
    let container = root ? $(root) : $(document);
    try {
        container.find("input[name='Name']").textbox({ prompt: t('repository.prompt.name') });
        container.find("input[name='Endpoint']").textbox({ prompt: t('repository.prompt.endpoint') });
        container.find("input[name='Description']").textbox({ prompt: t('repository.prompt.description') });
        container.find("input[name='Username']").textbox({ prompt: t('repository.prompt.username') });
        container.find("input[name='Password']").passwordbox({ prompt: t('repository.prompt.password') });
    } catch (e) {}
}

function __repository_bindLangChangedOnce() {
    if (window.__repositoryI18nBound) return;
    window.__repositoryI18nBound = true;

    $(document).on('app:langChanged', function () {
        try {
            __repository_applyI18n(document);
        } catch (e) {}
        try {
            __repository_applyRepoFormPrompts(document);
        } catch (e) {}
        try {
            reloadDg();
        } catch (e) {}
    });
}

function loadRepository(){
    let node = local_node;

    $(function(){
        $("#reposDg").iDatagrid({
            idField: 'ID',
            sortOrder:'asc',
            sortName:'Id',
            pageSize:50,
            frozenColumns:[[
                {field: 'ID', title: '', checkbox: true},
                {field: 'op', title: '<span data-i18n="common.col.operation">操作</span>', sortable: false, halign:'center',align:'left',
                    width1: 100, formatter:reposOperateFormatter},
                {field: 'Id', title: 'ID', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 220},
                {field: 'Name', title: 'Name', sortable: true,
                    formatter:$.iGrid.buildformatter([$.iGrid.templateformatter('{Name}'), $.iGrid.tooltipformatter()]),
                    width: 140},
            ]],
            onBeforeLoad:function (param){
                refreshRepos(param)
            },
            columns: [[
                {field: 'Endpoint', title: 'REPOS', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 260},
                {field: 'Description', title: 'DESCRIPTION', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 300},
                {field: 'Username', title: 'USERNAME', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'Password', title: 'PASSWORD', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'Createtime', title: 'CREATETIME', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 260}
            ]]
        });

        __repository_applyI18n(document);
        __repository_bindLangChangedOnce();
    });
}

function reposOperateFormatter(value, row, index) {
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-blue layui-btn layui-btn-xs" onclick="updateRepos(\'' + row.ID + '\')">' + t('repository.btn.edit') + '</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeRepos(\'' + row.ID + '\')">' + t('repository.btn.delete') + '</button>';
    return htmlstr;
}


function refreshRepos(param){

    let pageSize = $.docker.utils.getPageRowsFromParam(param);
    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;
    // 仓库的密码基于安全考虑，仅仅只能做本地保存，不能入数据库

    $.docker.request.repos.list(function (response) {

        $.each(response.list, function (idx, v) {
            v.Password = "**********"
        })

        $('#reposDg').datagrid('loadData', {
            total: response.total,
            rows: response.list
        })
    }, node);
}

function createRepos(){
    updateReposDlg({});
}

function removeRepos(id){
    if(id==null){
        let rows = $('#reposDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('repository.msg.onlyOne.remove'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('repository.msg.pickOne.remove'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    $.app.confirm(t('repository.dialog.remove.title'), t('repository.dialog.remove.confirm'),function () {

        let node = local_node;
        $.docker.request.repos.delete(function (data) {
            $.app.show(t('repository.msg.remove.success'));
            reloadDg();
        }, node, id);
    })

}

function updateRepos(id){
    if(id==null){
        let rows = $('#reposDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('repository.msg.onlyOne.edit'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('repository.msg.pickOne.edit'));
            return;
        }else{
            id = rows[0].ID;
        }
    }
    let node = local_node;
    $.docker.request.repos.all(function (data, map) {
        let reposData = map[id];
        if(reposData==null){
            $.app.show(t('repository.msg.notFound'))
            return false;
        }

        updateReposDlg(reposData);

    }, node);
}

function updateReposDlg(reposData){

    let title = '';
    let isAdd = true;
    if(reposData == null || reposData.ID == null){
        reposData = {};
        title = t('repository.dialog.add.title');
    }else{
        title = t('repository.dialog.edit.titleformat', reposData.Name);
        isAdd = false;
    }

    $.iDialog.openDialog({
        title: title,
        minimizable:false,
        id:'pullImgDlg',
        width: 600,
        height: 440,
        href:'./add_repository.html',
        render:function(opts, handler){
            let d = this;
            console.log("Open dialog");
            reposData.Password = '';
            handler.render(reposData);

            __repository_applyI18n(d);
            __repository_applyRepoFormPrompts(d);
        },
        buttonsGroup: [{
            text: t('common.btn.confirm'),
            iconCls: 'fa fa-floppy-o',
            btnCls: 'cubeui-btn-orange',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
                o.ajaxData = $.extends.json.param2json(o.ajaxData);
                let info = o.ajaxData;
                let node = local_node;
                console.log(info);

                if(isAdd){
                    info.id = null;
                }else{
                    info.id = reposData.ID
                }

                $.docker.request.repos.save(function (data) {
                    $.app.show(t('repository.msg.save.success', info.Name))
                    $.iDialog.closeOutterDialog($(t))
                    reloadDg()
                }, node, info);

                return false;
            }
        }]
    });
}

function reloadDg(){
    $('#reposDg').datagrid('reload');
    $('#layout').layout('resize');
}

function onActivated(opts, title, idx){
    console.log('Image onActivated')
    reloadDg();
    //refreshCharts();
}

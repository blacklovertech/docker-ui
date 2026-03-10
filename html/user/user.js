function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) { return key; }
}

function loadUsers(){
    $(function(){
        $("#userDg").iDatagrid({
            idField: 'UserID',
            sortOrder:'desc',
            sortName:'CreateTime',
            pageSize:50,
            frozenColumns:[[
                {field: 'ck', title: '', checkbox: true},
                {field: 'op', title: '<span data-i18n="common.col.operation">操作</span>', sortable: false, halign:'center',align:'left',
                    width1: 120, formatter:userOperateFormatter},
                {field: 'UserName', title: t('users.col.username'), sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 180},
                {field: 'UserID', title: t('users.col.userId'), sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 260},
            ]],
            onBeforeLoad:function (param){
                refreshUsers(param)
            },
            columns: [[
                {field: 'CreateTime', title: t('users.col.createTime'), sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 260}
            ]]
        });

        var i18n = window.APP_I18N || (window.APP && window.APP.i18n);
        if(i18n && i18n.apply){
            i18n.apply(document);
            try { i18n.apply($('#userDg').datagrid('getPanel')); } catch (e) {}
        }
    });
}

function userOperateFormatter(value, row, index) {
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-blue layui-btn layui-btn-xs" onclick="resetUserPwd(\'' + row.UserID + '\')">' + t('users.btn.resetPwd') + '</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeUser(\'' + row.UserID + '\')">' + t('common.btn.delete') + '</button>';
    return htmlstr;
}

function refreshUsers(param){
    $.app.getJson(V3_API_URL + '/user/list', null, function (data) {
        if(data.status !== 0){
            $.app.alert(data.msg || t('users.msg.load.fail'));
            return;
        }

        let rows = data.data || [];
        $('#userDg').datagrid('loadData', {
            total: rows.length,
            rows: rows
        })

    }, true);
}

function createUser(){
    $.iDialog.openDialog({
        title: t('users.dialog.create.title'),
        minimizable:false,
        id:'addUserDlg',
        width: 560,
        height: 300,
        href:'./add_user.html',
        buttonsGroup: [{
            text: t('common.btn.confirm'),
            iconCls: 'fa fa-floppy-o',
            btnCls: 'cubeui-btn-orange',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
				// o.ajaxData is querystring, convert to json
				let params = $.extends.json.param2json(o.ajaxData);

                $.app.post(V3_API_URL + '/user/create', params, function(resp){
                    if(resp.status === 0){
                        $.app.show(t('users.msg.create.success'));
                        $.iDialog.closeOutterDialog($(t))
                        reloadUserDg();
                    }else{
                        $.app.alert(resp.msg || t('users.msg.create.fail'));
                    }
                })

                return false;
            }
        }]
    });
}

function removeUser(userid){
    if(userid==null){
        let rows = $('#userDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('users.msg.onlyOne.remove'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('users.msg.pickOne.remove'));
            return;
        }else{
            userid = rows[0].UserID;
        }
    }

    $.app.confirm(t('users.dialog.remove.title'), t('users.dialog.remove.confirm'),function () {
        $.app.post(V3_API_URL + '/user/delete', {userid: userid}, function (resp) {
            if(resp.status === 0){
                $.app.show(t('users.msg.remove.success'));
                reloadUserDg();
            }else{
                $.app.alert(resp.msg || t('users.msg.remove.fail'));
            }
        })
    })
}

function resetUserPwd(userid){
    if(userid==null){
        let rows = $('#userDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('users.msg.onlyOne.resetPwd'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('users.msg.pickOne.resetPwd'));
            return;
        }else{
            userid = rows[0].UserID;
        }
    }

    $.iDialog.openDialog({
        title: t('users.dialog.resetPwd.title'),
        minimizable:false,
        id:'resetPwdDlg',
        width: 560,
        height: 240,
        href:'./resetpwd.html',
        buttonsGroup: [{
            text: t('common.btn.confirm'),
            iconCls: 'fa fa-floppy-o',
            btnCls: 'cubeui-btn-orange',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
				let params = $.extends.json.param2json(o.ajaxData);
				params.userid = userid;

                $.app.post(V3_API_URL + '/user/resetpwd', params, function(resp){
                    if(resp.status === 0){
                        $.app.show(t('users.msg.resetPwd.success'));
                        $.iDialog.closeOutterDialog($(t))
                        reloadUserDg();
                    }else{
                        $.app.alert(resp.msg || t('users.msg.resetPwd.fail'));
                    }
                })

                return false;
            }
        }]
    });
}

function reloadUserDg(){
    $('#userDg').datagrid('reload');
    $('#layout').layout('resize');
}

function onActivated(opts, title, idx){
    reloadUserDg();
}

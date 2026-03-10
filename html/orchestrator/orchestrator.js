function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) { return key; }
}

function __orchestrator_getI18n(){
    return (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
}

function __orchestrator_applyI18n(root){
    var i18n = __orchestrator_getI18n();
    if(i18n && i18n.apply){
        try { i18n.apply(root || document); } catch (e) {}
    }
}

function __orchestrator_setPlaceholder($el, text){
    if(!$el || !$el.length) return;
    try {
        if($el.textbox){
            $el.textbox('textbox').attr('placeholder', text);
            return;
        }
    } catch (e) {}
    try {
        if($el.combobox){
            $el.combobox('textbox').attr('placeholder', text);
            return;
        }
    } catch (e2) {}
}

function __orchestrator_setButtonText(selector, text){
    var $el = $(selector);
    if(!$el.length) return;

    $el.html(text);

    try { $el.linkbutton({text:text}); } catch (e) {}
    try { $el.menubutton({text:text}); } catch (e2) {}
}

function __orchestrator_applyControlsI18n(){
    var i18n = __orchestrator_getI18n();
    if(!i18n || !i18n.t) return;

    __orchestrator_setButtonText('#orchestratorCreateBtn', i18n.t('orchestrator.toolbar.create'));
    __orchestrator_setButtonText('#orchestratorEditBtn', i18n.t('orchestrator.toolbar.edit'));
    __orchestrator_setButtonText('#orchestratorRemoveBtn', i18n.t('orchestrator.toolbar.remove'));
    __orchestrator_setButtonText('#searchbtn', i18n.t('common.btn.search'));
    __orchestrator_setPlaceholder($("input[name='search_key']"), i18n.t('orchestrator.search.placeholder'));
}

function __orchestrator_applyGridI18n(){
    try { __orchestrator_applyI18n($('#orchestratorsDg').datagrid('getPanel')); } catch (e) {}
}

function loadOrchestrators(){
    let node = local_node;

    $(function(){
        $("#orchestratorsDg").iDatagrid({
            idField: 'ID',
            sortOrder:'asc',
            sortName:'Id',
            pageSize:50,
            frozenColumns:[[
                {field: 'ID', title: '', checkbox: true},
                {field: 'op', title: '<span data-i18n="common.col.operation">操作</span>', sortable: false, halign:'center',align:'left',
                    width1: 100, formatter:orchestratorsOperateFormatter},
                {field: 'Id', title: 'ID', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 220},
                {field: 'Name', title: 'Name', sortable: true,
                    formatter:$.iGrid.buildformatter([$.iGrid.templateformatter('{Name}'), $.iGrid.tooltipformatter()]),
                    width: 140},
            ]],
            onBeforeLoad:function (param){
                refreshOrchestrators(param)
            },
            columns: [[
                {field: 'Description', title: 'DESCRIPTION', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 300},
                {field: 'ServiceCount', title: 'SERVICE COUNT', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'Createtime', title: 'CREATETIME', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 260}
            ]]
        });

        __orchestrator_applyControlsI18n();
        __orchestrator_applyGridI18n();
        __orchestrator_applyI18n(document);

        try {
            $(document).off('app:langChanged.orchestrator').on('app:langChanged.orchestrator', function () {
                __orchestrator_applyControlsI18n();
                __orchestrator_applyGridI18n();
                __orchestrator_applyI18n(document);
                reloadDg();
            });
        } catch (e3) {}
    });
}

function orchestratorsOperateFormatter(value, row, index) {
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-blue layui-btn layui-btn-xs" onclick="updateOrchestrators(\'' + row.ID + '\')">' + t('orchestrator.btn.edit') + '</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeOrchestrators(\'' + row.ID + '\')">' + t('orchestrator.btn.delete') + '</button>';
    return htmlstr;
}


function refreshOrchestrators(param){

    let pageSize = $.docker.utils.getPageRowsFromParam(param);
    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;
    // 仓库的密码基于安全考虑，仅仅只能做本地保存，不能入数据库

    $.docker.request.repos.list(function (response) {
        $('#orchestratorsDg').datagrid('loadData', {
            total: response.total,
            rows: response.list
        })
    }, node);
}

function createOrchestrators(){
    updateOrchestratorsDlg({});
}

function removeOrchestrators(id){
    if(id==null){
        let rows = $('#orchestratorsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('orchestrator.msg.onlyOne.remove'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('orchestrator.msg.pickOne.remove'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    $.app.confirm(t('orchestrator.dialog.remove.title'), t('orchestrator.dialog.remove.confirm'),function () {

        let node = local_node;
        $.docker.request.repos.delete(function (data) {
            $.app.show(t('orchestrator.msg.remove.success'));
            reloadDg();
        }, node, id);
    })

}

function updateOrchestrators(id){
    if(id==null){
        let rows = $('#orchestratorsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('orchestrator.msg.onlyOne.edit'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('orchestrator.msg.pickOne.edit'));
            return;
        }else{
            id = rows[0].ID;
        }
    }
    let node = local_node;
    $.docker.request.repos.all(function (data, map) {
        let orchestratorData = map[id];
        if(orchestratorData==null){
            $.app.show(t('orchestrator.msg.notFound'))
            return false;
        }

        updateOrchestratorsDlg(orchestratorData);

    }, node);
}

function updateOrchestratorsDlg(orchestratorData){

    let showFn = function(row){

        let title = '';
        let isAdd = true;
        if(orchestratorData == null || orchestratorData.ID == null){
            orchestratorData = {};
            title = t('orchestrator.dialog.add.title');
        }else{
            title = t('orchestrator.dialog.edit.titleformat').format(orchestratorData.Name);
            isAdd = false;
        }

        $('#layout').layout('remove', 'east');

        let east_layout_options = {
            region:'east',
            split:false,border:false,width:'100%',collapsed:true,
            fit:true,
            iconCls:'fa fa-info-circle',
            collapsible:false,
            showHeader1:false,
            titleformat:title, title:t('orchestrator.panel.title'),
            headerCls:'border_right',bodyCls:'border_right',
            // footerHtml:$.templates(service_panel_footer_html).render(rowData),
            render:function (panel, option) {

                let html = './add_orchestrator.html';

                if(!orchestratorData.updated)
                    html = './add_orchestrator.html';

                $.docker.getHtml(html, null,function (html) {
                    let cnt = $($.templates(html).render(orchestratorData));
                    panel.append(cnt);
                    $.parser.parse(cnt);
                    __orchestrator_applyI18n(cnt);
                    $('#orchestrator_main_layout').iLayout();

                    if(orchestratorData.updated){
                    }

                    loadTreeDg(orchestratorData);
                })
            }
        }

        $.docker.utils.ui.showSlidePanel($('#layout'), east_layout_options)
        let opts = $.iLayout.getLayoutPanelOptions('#layout',  'east');
        console.log(opts)
    }

    showFn(orchestratorData);
}

function reloadDg(){
    $('#orchestratorsDg').datagrid('reload');
    $('#layout').layout('resize');
}

function onActivated(opts, title, idx){
    console.log('Image onActivated')
    reloadDg();
    //refreshCharts();
}

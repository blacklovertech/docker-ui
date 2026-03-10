function __tasks_getI18n(){
    return (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
}

function __tasks_t(key){
    var i18n = __tasks_getI18n();
    if(i18n && i18n.t) return i18n.t.apply(i18n, arguments);
    return null;
}

function __tasks_applyI18n(root){
    var i18n = __tasks_getI18n();
    if(i18n && i18n.apply){
        try{ i18n.apply(root || document); }catch(e){}
    }
}

function __tasks_setPlaceholder($el, text){
    if(!$el || !$el.length) return;
    try{
        if($el.textbox){
            $el.textbox('textbox').attr('placeholder', text);
            return;
        }
    }catch(e){}
    try{
        if($el.combobox){
            $el.combobox('textbox').attr('placeholder', text);
            return;
        }
    }catch(e){}
    try{
        if($el.combogrid){
            $el.combogrid('textbox').attr('placeholder', text);
            return;
        }
    }catch(e){}
}

function __tasks_applyControlsI18n(){
    var i18n = __tasks_getI18n();
    if(!i18n || !i18n.t) return;

    __tasks_setPlaceholder($('#service_mode'), i18n.t('common.prompt.emptyAll'));
    __tasks_setPlaceholder($('#node_search_role'), i18n.t('common.prompt.emptyAll'));
    __tasks_setPlaceholder($('#node_search_membership'), i18n.t('common.prompt.emptyAll'));
    __tasks_setPlaceholder($('#tasklist-desired-state'), i18n.t('common.prompt.emptyAll'));

    __tasks_setPlaceholder($('#service_search_type'), i18n.t('common.prompt.searchTypeRequired'));
    __tasks_setPlaceholder($('#node_search_type'), i18n.t('common.prompt.searchTypeRequired'));
    __tasks_setPlaceholder($('#tasklist-search_type'), i18n.t('common.prompt.searchTypeRequired'));

    __tasks_setPlaceholder($('#service_search_key'), i18n.t('common.prompt.searchKey'));
    __tasks_setPlaceholder($('#node_search_key'), i18n.t('common.prompt.searchKey'));
    __tasks_setPlaceholder($('#tasklist-search_key'), i18n.t('common.prompt.searchKey'));

    __tasks_setPlaceholder($('#tasklist-service'), i18n.t('tasks.prompt.pickService'));
    __tasks_setPlaceholder($('#tasklist-node'), i18n.t('tasks.prompt.pickNode'));

    try{
        var v1 = $('#service_mode').combobox('getValue');
        $('#service_mode').combobox('loadData', [
            {KEY:'', TEXT:i18n.t('common.option.all')},
            {KEY:'replicated', TEXT:'replicated'},
            {KEY:'global', TEXT:'global'}
        ]).combobox('setValue', v1);
    }catch(e){}

    try{
        var v2 = $('#node_search_role').combobox('getValue');
        $('#node_search_role').combobox('loadData', [
            {KEY:'all', TEXT:i18n.t('common.option.all')},
            {KEY:'manager', TEXT:i18n.t('nodes.role.manager')},
            {KEY:'worker', TEXT:i18n.t('nodes.role.worker')}
        ]).combobox('setValue', v2);
    }catch(e){}

    try{
        var v3 = $('#node_search_membership').combobox('getValue');
        $('#node_search_membership').combobox('loadData', [
            {KEY:'all', TEXT:i18n.t('common.option.all')},
            {KEY:'accepted', TEXT:i18n.t('nodes.membership.accepted')},
            {KEY:'pending', TEXT:i18n.t('nodes.membership.pending')}
        ]).combobox('setValue', v3);
    }catch(e){}

    try{
        var v4 = $('#node_search_type').combobox('getValue');
        $('#node_search_type').combobox('loadData', [
            {KEY:'name', TEXT:'Name'},
            {KEY:'label', TEXT:i18n.t('nodes.search.engineLabel')},
            {KEY:'node.label', TEXT:i18n.t('nodes.search.nodeLabel')},
            {KEY:'id', TEXT:'ID'}
        ]).combobox('setValue', v4);
    }catch(e){}

    try{
        var v5 = $('#tasklist-desired-state').combobox('getValue');
        $('#tasklist-desired-state').combobox('loadData', [
            {KEY:'', TEXT:i18n.t('common.option.all')},
            {KEY:'running', TEXT:'Running'},
            {KEY:'shutdown', TEXT:'Shutdown'},
            {KEY:'accepted', TEXT:'Accepted'}
        ]).combobox('setValue', v5);
    }catch(e){}

    try{
        var g = $('#tasklist-node').combogrid('grid');
        if(g && g.datagrid){
            var opts = g.datagrid('options');
            if(opts && opts.columns && opts.columns.length){
                $.each(opts.columns[0], function(i, col){
                    if(!col || !col.field) return;
                    if(col.field === 'EVersion') col.title = i18n.t('nodes.col.engineVersion');
                    if(col.field === 'MemoryBytes') col.title = i18n.t('nodes.col.memory');
                    if(col.field === 'SVersion') col.title = i18n.t('nodes.col.swarmVersion');
                });
                g.datagrid({columns: opts.columns});
                __tasks_applyI18n(g.datagrid('getPanel'));
            }
        }
    }catch(e){}
}

function __tasks_applyGridI18n(){
    try{
        __tasks_applyI18n($('#tasksDg').datagrid('getPanel'));
    }catch(e){}
}

function __tasks_updateOpenPanelTitle(){
    var i18n = __tasks_getI18n();
    if(!i18n || !i18n.t) return;
    if(!window.__task_inspect_row) return;
    try{
        var p = $('#tasklist-layout').layout('panel','east');
        if(p && p.length){
            p.panel('setTitle', i18n.t('tasks.panel.title', $.extends.isEmpty(window.__task_inspect_row.SlotStr, window.__task_inspect_row.ID)));
            __tasks_applyI18n(p);
        }
    }catch(e){}
}

function __tasks_bindLangChanged(){
    if(window.__tasks_i18n_bound) return;
    window.__tasks_i18n_bound = true;
    $(document).on('app:langChanged', function(){
        __tasks_applyControlsI18n();
        __tasks_applyGridI18n();
        try{ $('#tasksDg').datagrid('reload'); }catch(e){}
        __tasks_updateOpenPanelTitle();
    });
}

function loadLease(){

    $(function(){
        $("#tasksDg").iDatagrid({
            pagination:true,
            showHeader:true,
            showFooter:true,
            remoteSort:true,
            queryParams:{'desired-state':'running'},
            sortName:'SortField',
            sortOrder:'desc',
            pageSize:50,
            onBeforeLoad:function (param){
                refreshTasks(param);
            },
            group:{
                groupField:'SlotStr',
                groupFormatter:function (value, rows) {
                    var rtnStr = value + '({0})'.format(rows?rows.length:0);
                    // rtnStr += '<input type="checkbox" onclick="FGPCkbClick(this)" helpGPVal="' + value + '" name="gpChk" />';
                    // rtnStr += value + ' 单据数量=' + rows.length + '条';
                    return rtnStr;
                }
            },
            frozenColumns:[[
                {field: 'op', title: '<span data-i18n="common.col.operation">操作</span>', sortable: false, halign:'center',align:'left',
                    width1: 300, formatter:leaseOperateFormatter},
                {field: 'ID', title: 'ID', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 250},
                {field: 'SlotStr', title: 'Slot',hidden:true, sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 180},
                {field: 'SortField', title: 'SortField',hidden:true, sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 180},
                {field: 'TaskName', title: 'NAME', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 160},
            ]],
            columns: [[
                {field: 'Image', title: 'Image', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 180},
                {field: 'Hostname', title: 'Node', sortable: false,
                    formatter:$.iGrid.tooltipformatter(),width: 140},
                {field: 'NodeID', title: 'NodeID', sortable: false,
                    formatter:$.iGrid.tooltipformatter(),width: 160},
                {field: 'NodeName', title: 'NodeName', sortable: false,
                    formatter:$.iGrid.tooltipformatter(),width: 160},
                {field: 'DesiredState', title: 'DESIRED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 100},
                {field: 'CurrentState', title: 'CURRENT', sortable: true,
                    formatter:relatedTaskStatusFormatter,
                    width: 250},
                {field: 'NetAddress', title: 'IP', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 200},
                {field: 'SVersion', title: 'Raft', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 80},
                {field: 'Created', title: 'CREATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'Updated', title: 'UPDATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'LabelStr', title: 'Labels', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 280}
            ]]
        })

            __tasks_bindLangChanged();
            __tasks_applyControlsI18n();
            __tasks_applyGridI18n();
    });
}

function relatedTaskStatusFormatter(value, row, index) {
    if(row.Status.State=='running'){
        return '<span class="label cubeui-row-label layui-bg-orange">{0}</span>'.format(value);
    }else{
        return value;
    }
}

function refreshAllServices(param){
    let pageSize = $.docker.utils.getPageRowsFromParam(param);
    let skip = $.docker.utils.getSkipFromParam(param);

    let node = local_node;

    $.docker.request.service.list(function (response) {
        setNetworkMap(function () {

            $('#tasklist-service').combogrid('grid').datagrid('loadData',
                {
                    total: response.total,
                    rows: response.list
                });

        }, node);

    }, node, skip, pageSize, param.mode, param.search_type, param.search_key, param.sort, param.order);
}

function refreshAllNodes(param){
    let pageSize = $.docker.utils.getPageRowsFromParam(param);

    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;

    $.docker.request.node.list(function (response) {
        $('#tasklist-node').combogrid('grid').datagrid('loadData',
            {
                total: response.total,
                rows: response.list
            });
    }, node, skip, pageSize, param.role, param.membership, param.search_type, param.search_key, param.sort, param.order);
}

function refreshTasks(param){
    let pageSize = $.docker.utils.getPageRowsFromParam(param);
    let skip = $.docker.utils.getSkipFromParam(param);
    let node = local_node;

    setNetworkMap(function () {

        $.docker.request.service.all(function(all){

            let allServiceMap = {};
            $.each(all.list, function (idx, v) {
                allServiceMap[v.ID] = v;
            })

            $.docker.request.task.list(function (response) {

                $.each(response.list, function (idx, v) {
                    let service = allServiceMap[v.ServiceID];
                    v.SlotStr = (service?service.Name:"") + '.' + v.Slot;
                    v.TaskName = v.SlotStr;
                })

                $('#tasksDg').datagrid('loadData', {
                    total: response.total,
                    rows: response.list
                })

            }, node, skip, pageSize, param.service, param.nodeid, param['desired-state'], param.search_type, param.search_key, param.sort, param.order);

        }, node);
    }, node)

}

function leaseOperateFormatter(value, row, index) {
    var i18n = __tasks_getI18n();
    let htmlstr = "";
    //superpowers
    if(row.Status.State=='running'){
        htmlstr += '<button class="layui-btn-yellowgreen layui-btn layui-btn-xs" onclick="inspectTask(\''+row.ID+'\', \'' + row.ID + '\')">' + (i18n ? i18n.t('common.btn.view') : '查看') + '</button>';
    }else{
        htmlstr += '<button class="layui-btn-brown layui-btn layui-btn-xs" onclick="inspectTask(\''+row.ID+'\', \'' + row.ID + '\')">' + (i18n ? i18n.t('common.btn.view') : '查看') + '</button>';
    }

    htmlstr += '<button class="layui-btn-orange layui-btn layui-btn-xs" onclick="logTask(\''+row.ID+'\', \'' + row.ID + '\')">' + (i18n ? i18n.t('common.btn.logs') : '日志') + '</button>';

    return htmlstr;
}

function reloadDg(){
    $('#tasksDg').datagrid('reload');
    $('#tasklist-layout').layout('resize');
}

function inspectTask(taskId){
    let node = local_node;
    $.docker.request.task.inspect(function (response) {

        $.docker.request.service.inspect(function (serviceData) {

            response.ServiceData = serviceData;
            response.SlotStr = response.ServiceData.Name + '.' + response.Slot;
            response.TaskName = response.SlotStr;
            showTaskPanel(response);

        }, node, response.ServiceID)

    }, node, taskId);
}


function showTaskPanel(rowData){

    window.__task_inspect_row = rowData;

    let showFn = function(row){
        let rowData =  row;

        rowData.Name = row.Spec.Name;

        $('#tasklist-layout').layout('remove', 'east');

        let east_layout_options = {
            region:'east',
            split:false,border:false,width:'100%',collapsed:true,
            iconCls:'fa fa-info-circle',
            collapsible:false,
            showHeader1:false,
            titleformat:(__tasks_t('tasks.panel.title', $.extends.isEmpty(rowData.SlotStr, rowData.ID)) || '任务信息-{0}'.format($.extends.isEmpty(rowData.SlotStr, rowData.ID))), title:'服务信息',
            headerCls:'border_right',bodyCls:'border_right',collapsible:true,
            footerHtml:`
         <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                    $('#tasklist-layout').layout('collapse', 'east');
            },
            btnCls: 'cubeui-btn-red',
            iconCls: 'fa fa-close'
        }"><span data-i18n="common.btn.close">关闭</span></a>
        `.format(rowData.ID),
            render:function (panel, option) {
                $.docker.getHtml('./inspect-task.html', null, function(html){
                    let cnt = $($.templates(html).render(rowData));
                    panel.append(cnt);
                    $.parser.parse(cnt);
                    __tasks_applyI18n(cnt[0]);
                })
            }
        }

        $.docker.utils.ui.showSlidePanel($('#tasklist-layout'), east_layout_options)
        let opts = $.iLayout.getLayoutPanelOptions('#tasklist-layout',  'east');
        console.log(opts)
    }


    showFn(rowData);

}

function onActivated(opts, title, idx, param){
    console.log('Task Page onActivated')
    console.log(param);
    reloadDg();
}

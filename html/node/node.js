function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) {
        return key;
    }
}

function __nodes_getI18n(){
    return (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
}

function __nodes_applyI18n(root){
    var i18n = __nodes_getI18n();
    if(i18n && i18n.apply){
        try{ i18n.apply(root || document); }catch(e){}
    }
}

function __nodes_setPlaceholder($el, text){
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
}

function __nodes_applyControlsI18n(){
    var i18n = __nodes_getI18n();
    if(!i18n || !i18n.t) return;

    var $role = $('input[name=role]');
    var $membership = $('input[name=membership]');
    var $searchType = $('#search_type');
    var $searchKey = $('#search_key');

    __nodes_setPlaceholder($role, i18n.t('common.prompt.emptyAll'));
    __nodes_setPlaceholder($membership, i18n.t('common.prompt.emptyAll'));
    __nodes_setPlaceholder($searchType, i18n.t('common.prompt.searchTypeRequired'));
    __nodes_setPlaceholder($searchKey, i18n.t('common.prompt.searchKey'));

    try{
        var v1 = $role.combobox('getValue');
        $role.combobox('loadData', [
            {KEY:'all', TEXT:i18n.t('common.option.all')},
            {KEY:'manager', TEXT:i18n.t('nodes.role.manager')},
            {KEY:'worker', TEXT:i18n.t('nodes.role.worker')}
        ]).combobox('setValue', v1);
    }catch(e){}

    try{
        var v2 = $membership.combobox('getValue');
        $membership.combobox('loadData', [
            {KEY:'all', TEXT:i18n.t('common.option.all')},
            {KEY:'accepted', TEXT:i18n.t('nodes.membership.accepted')},
            {KEY:'pending', TEXT:i18n.t('nodes.membership.pending')}
        ]).combobox('setValue', v2);
    }catch(e){}

    try{
        var v3 = $searchType.combobox('getValue');
        $searchType.combobox('loadData', [
            {KEY:'name', TEXT:'Name'},
            {KEY:'label', TEXT:i18n.t('nodes.search.engineLabel')},
            {KEY:'node.label', TEXT:i18n.t('nodes.search.nodeLabel')},
            {KEY:'id', TEXT:'ID'}
        ]).combobox('setValue', v3);
    }catch(e){}
}

function __nodes_applyGridI18n(){
    try{
        __nodes_applyI18n($('#nodesDg').datagrid('getPanel'));
    }catch(e){}
}

function __nodes_bindLangChanged(){
    try{
        $(document).off('app:langChanged.nodes').on('app:langChanged.nodes', function(){
            __nodes_applyControlsI18n();
            try{ $('#nodesDg').datagrid('reload'); }catch(e){}
            __nodes_applyGridI18n();
            try{ __nodes_updateOpenPanelTitle(); }catch(e2){}
        });
    }catch(e3){}
}

function __nodes_updateOpenPanelTitle(){
    var i18n = __nodes_getI18n();
    if(!i18n || !i18n.t) return;
    if(!window.__node_inspect_row) return;
    try{
        var p = $('#layout').layout('panel','east');
        if(p && p.length){
            p.panel('setTitle', i18n.t('nodes.panel.titleformat', $.extends.isEmpty(window.__node_inspect_row.Description && window.__node_inspect_row.Description.Hostname, window.__node_inspect_row.ID)));
            __nodes_applyI18n(p[0]);
        }
    }catch(e){}
}

function loadLease(){

    // let node = $.docker.menu.getCurrentTabAttachNode();
    let node = local_node;

    $(function(){
        $("#nodesDg").iDatagrid({
            idField: 'ID',
            sortOrder:'asc',
            sortName:'Id',
            pageSize:50,
            queryParams:{all1:1},
            frozenColumns:[[
                {field: 'ID', title: '', checkbox: true},
                {field: 'op', title: '<span data-i18n="common.col.operation">操作</span>', sortable: false, halign:'center',align:'left',
                    width1: 300, formatter:leaseOperateFormatter},
                {field: 'Hostname', title: 'NODE', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 140},
                {field: 'Id', title: 'NODE ID', sortable: true,
                    formatter:$.iGrid.buildformatter([$.iGrid.templateformatter('{Id}'), $.iGrid.tooltipformatter()]),
                    width: 220},
                {field: 'Addr', title: 'Addr', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 130},
            ]],
            onBeforeLoad:function (param){
                refreshNodes(param)
            },
            columns: [[
                {field: 'StatuStr', title: 'Status', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 100},
                {field: 'Name', title: 'NAME', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 140},
                {field: 'RoleStr', title: 'Role', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 100},
                {field: 'MAddrStr', title: 'ADVERTISE', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 210},
                {field: 'Created', title: 'CREATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'Updated', title: 'UPDATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'Platform', title: 'OS', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 120},
                {field: 'EVersion', title: '<span data-i18n="nodes.col.engineVersion">版本</span>', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 100},
                {field: 'CPUs', title: 'CPUS', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 60},
                {field: 'MemoryBytes', title: '<span data-i18n="nodes.col.memory">内存</span>', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 80},
                {field: 'SVersion', title: '<span data-i18n="nodes.col.swarmVersion">节点版本</span>', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 80},
                {field: 'LabelStr', title: 'LABELS', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 900}
            ]],
            onLoadSuccess:$.easyui.event.wrap(
                $.fn.iDatagrid.defaults.onLoadSuccess,
                function(data){
                    let dg = this;
                }
            ),
        });

        __nodes_bindLangChanged();
        __nodes_applyControlsI18n();
        __nodes_applyGridI18n();
    });
}

function leaseOperateFormatter(value, row, index) {
    var i18n = __nodes_getI18n();
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-yellowgreen layui-btn layui-btn-xs" onclick="inspectNode(\'' + row.ID + '\')">' + (i18n ? i18n.t('common.btn.view') : '查看') + '</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('common.btn.delete') : '删除') + '</button>';
    htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.promote.title') : '提升为管理节点') + '" class="layui-btn-blue layui-btn layui-btn-xs" onclick="promoteLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.promote') : '提升') + '</button>';
    htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.demote.title') : '降级为工作节点') + '"  class="layui-btn-red layui-btn layui-btn-xs" onclick="demoteLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.demote') : '降级') + '</button>';

    if(row.Status.State == 'ready' && row.LeaderStr != "Leader"){
        if(row.Spec.Availability == 'active'){
            htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.drain.title') : '作为污点节点排空') + '"  class="layui-btn-orange layui-btn layui-btn-xs" onclick="drainLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.drain') : '污点') + '</button>';
            htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.pause.title') : '暂停节点服务') + '"  class="layui-btn-brown layui-btn layui-btn-xs" onclick="pauseLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.pause') : '暂停') + '</button>';
        }else if(row.Spec.Availability == 'pause'){
            htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.drain.title') : '作为污点节点排空') + '"  class="layui-btn-orange layui-btn layui-btn-xs" onclick="drainLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.drain') : '污点') + '</button>';
            htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.active.title') : '激活节点') + '"  class="layui-btn-slateblue layui-btn layui-btn-xs" onclick="activeLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.active') : '激活') + '</button>';
        }else if(row.Spec.Availability == 'drain'){
            htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.pause.title') : '暂停节点服务') + '"  class="layui-btn-brown layui-btn layui-btn-xs" onclick="pauseLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.pause') : '暂停') + '</button>';
            htmlstr += '<button title="' + (i18n ? i18n.t('nodes.action.active.title') : '激活节点') + '"  class="layui-btn-slateblue layui-btn layui-btn-xs" onclick="activeLease(\'' + row.ID + '\')">' + (i18n ? i18n.t('nodes.action.active') : '激活') + '</button>';
        }
    }

    return htmlstr;
}

function drainLease(id, inspect){
    if($.extends.isEmpty(id)){
        let rows = $('#nodesDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('nodes.msg.onlyOne.drain'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('nodes.msg.pickOne.drain'));
            return;
        }else{
            id = rows[0].ID;
        }
    }


    $.app.confirm(t('nodes.dialog.drain.title'), t('nodes.dialog.drain.confirm'), function (){

        let node = local_node;

        $.docker.request.node.drain(function (response) {
            $.app.show(t('nodes.msg.drain.success', response.Info.Description.Hostname));
            $.app.showProgress(t('nodes.msg.reload.progress', response.Info.Description.Hostname));

            $.easyui.thread.sleep(function () {
                reloadDg();
                if(inspect){
                    inspectNode(id)
                }

            }, 1000);
        }, node, id);
    });
}

function pauseLease(id, inspect){

    if($.extends.isEmpty(id)){
        let rows = $('#nodesDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('nodes.msg.onlyOne.pause'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('nodes.msg.pickOne.pause'));
            return;
        }else{
            id = rows[0].ID;
        }
    }


    $.app.confirm(t('nodes.dialog.pause.title'), t('nodes.dialog.pause.confirm'), function (){

        let node = local_node;

        $.docker.request.node.pause(function (response) {
            $.app.show(t('nodes.msg.pause.success', response.Info.Description.Hostname));
            $.app.showProgress(t('nodes.msg.reload.progress', response.Info.Description.Hostname));

            $.easyui.thread.sleep(function () {
                reloadDg();
                if(inspect){
                    inspectNode(id)
                }

            }, 1000);
        }, node, id);
    });
}

function activeLease(id, inspect){

    if($.extends.isEmpty(id)){
        let rows = $('#nodesDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('nodes.msg.onlyOne.active'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('nodes.msg.pickOne.active'));
            return;
        }else{
            id = rows[0].ID;
        }
    }


    $.app.confirm(t('nodes.dialog.active.title'), t('nodes.dialog.active.confirm'), function (){

        let node = local_node;

        $.docker.request.node.active(function (response) {
            $.app.show(t('nodes.msg.active.success', response.Info.Description.Hostname));
            $.app.showProgress(t('nodes.msg.reload.progress', response.Info.Description.Hostname));

            $.easyui.thread.sleep(function () {
                reloadDg();
                if(inspect){
                    inspectNode(id)
                }

            }, 1000);
        }, node, id);
    });
}

function promoteLease(id, inspect){

    if($.extends.isEmpty(id)){
        let rows = $('#nodesDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('nodes.msg.onlyOne.promote'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('nodes.msg.pickOne.promote'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    $.app.confirm(t('nodes.dialog.promote.title'), t('nodes.dialog.promote.confirm'), function (){
        let node = local_node;
        $.docker.request.node.promote(function(response){
            $.app.show(t('nodes.msg.promote.success', response.Info.Description.Hostname));
            $.app.showProgress(t('nodes.msg.reload.progress', response.Info.Description.Hostname));

            $.easyui.thread.sleep(function () {

                reloadDg();
                if(inspect){
                    inspectNode(id)
                }

            }, 1000);

        }, node, id)
    });
}

function demoteLease(id, inspect){

    if($.extends.isEmpty(id)){
        let rows = $('#nodesDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('nodes.msg.onlyOne.demote'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('nodes.msg.pickOne.demote'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    $.app.confirm(t('nodes.dialog.demote.title'), t('nodes.dialog.demote.confirm'), function (){
        let node = local_node;
        $.docker.request.node.demote(function(response){
            $.app.show(t('nodes.msg.demote.success', response.Info.Description.Hostname));

            $.app.showProgress(t('nodes.msg.reload.progress', response.Info.Description.Hostname));
            $.easyui.thread.sleep(function () {

                reloadDg();
                if(inspect){
                        inspectNode(id)
                }
            }, 1000);
        }, node, id)
    });

}

function removePanel(){
    $('#layout').layout('remove', 'east');
}

function refreshNodes(param){

    let pageSize = $.docker.utils.getPageRowsFromParam(param);

    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;

    $.docker.request.node.list(function (response) {
        $('#nodesDg').datagrid('loadData', {
            total: response.total,
            rows: response.list
        })
        
        refreshImageAndContainerInfo();

    }, node, skip, pageSize, param.role, param.membership, param.search_type, param.search_key, param.sort, param.order);
}

function removeLease(id, closePanel) {
    if($.extends.isEmpty(id)){
        let rows = $('#nodesDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('nodes.msg.onlyOne.remove'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('nodes.msg.pickOne.remove'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    let node = local_node;

    $.docker.utils.deleteConfirm(t('nodes.dialog.remove.title'), t('nodes.dialog.remove.confirm'), function (param, closeFn){

        let node = local_node;
        $.docker.request.node.delete(function(response){
            $.app.show(t('nodes.msg.remove.success'));
            reloadDg();
            closeFn();

            if(closePanel){
                removePanel();
            }

        }, node, id, param.force==="1")
    }, null,false)

}

function reloadDg(){
    $('#nodesDg').datagrid('reload');
    $('#layout').layout('resize');
}

function inspectNode(id){
    showNodePanel(id)
}

function showNodePanel(id){

    let node = local_node;

    $.docker.request.node.inspect(function (response){
        let rowData = response;
        rowData.Name = response.Spec.Name;

        window.__node_inspect_row = rowData;

        $('#layout').layout('remove', 'east');

        let east_layout_options = {
            region:'east',
            split:false,border:false,width:'100%',collapsed:true,
            iconCls:'fa fa-info-circle',
            collapsible:false,
            showHeader1:false,
            titleformat:t('nodes.panel.titleformat', $.extends.isEmpty(rowData.Description.Hostname, rowData.ID)), title:t('nodes.panel.title'),
            headerCls:'border_right',bodyCls:'border_right',collapsible:true,
            footerHtml:`
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                updateTags('{0}', true);
            },
            btnCls: 'cubeui-btn-slateblue',
            iconCls: 'fa fa-tags'
        }"><span data-i18n="nodes.toolbar.editMetadata">编辑元数据</span></a>
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                removeLease('{0}', true);
            },
            btnCls: 'cubeui-btn-orange',
            iconCls: 'fa fa-times'
        }"><span data-i18n="common.btn.delete">删除</span></a>
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
                onClick:function(){
                    promoteLease('{0}', true);
                },
                extend: '#nodesDg-toolbar',
                btnCls: 'cubeui-btn-ivory',
                iconCls: 'fa fa-hand-o-up'
            }"><span data-i18n="nodes.toolbar.promoteManager">提升管理节点</span></a>
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){                    
                    demoteLease('{0}', true);
            },
            btnCls: 'cubeui-btn-blue',
            iconCls: 'fa fa-hand-o-down'
        }"><span data-i18n="nodes.toolbar.demoteWorker">降级工作节点</span></a>
         <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                    $('#layout').layout('collapse', 'east');
            },
            btnCls: 'cubeui-btn-red',
            iconCls: 'fa fa-close'
        }"><span data-i18n="common.btn.close">关闭</span></a>
        `.format(rowData.ID),
            render:function (panel, option) {

                let cnt = $($.templates(node_html_template).render(rowData));
                panel.append(cnt);
                $.parser.parse(cnt);

                __nodes_applyI18n(cnt[0]);

                $('#eastTabs').tabs({
                    fit:true,
                    border:false,
                    bodyCls1:'border_right_none,border_bottom_none',
                    tabPosition1:'bottom',
                    narrow:true,
                    pill:true,
                });

                __nodes_applyI18n(panel[0]);

            }
        }

        $.docker.utils.ui.showSlidePanel($('#layout'), east_layout_options)
        let opts = $.iLayout.getLayoutPanelOptions('#layout',  'east');
        console.log(opts)


    }, node, id)
}

let node_html_template = `
        <div data-toggle="cubeui-tabs" id='eastTabs'>
            <div title="节点信息" data-i18n-title="nodes.tab.info"
                 data-options="id:'eastTab0',iconCls:'fa fa-info-circle'">                 
                <div style="margin: 0px;">
                </div>
                
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend data-i18n="nodes.section.basic">基础信息</legend>
                    </fieldset>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Hostname:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" name="Hostname" readonly
                                       value='{{>Description.Hostname}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>                    
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm11">
                            <label class="cubeui-form-label">NAME:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" id="Nodename" name="Name" readonly
                                       value='{{>Spec.Name}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>                                    
                        <div class="cubeui-col-sm1">						
							<a  href="javascript:void(0)" id='update_restart_policy_btn' data-toggle='cubeui-menubutton' data-options="{
								onClick:function(){
										updateName(this, '{{:ID}}');
								},
								btnCls: 'cubeui-btn-blue',
								iconCls: 'fa fa-pencil-square-o'
                            }"><span data-i18n="common.btn.edit">修改</span></a>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">ID:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" name="Name" readonly
                                       value='{{>ID}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Raft:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>SVersion}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Plugins:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>Plugins}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">CreateAt:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="CreateAt" readonly
                                       value='{{>Created}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">UpdateAt:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Updated" readonly
                                       value='{{>Updated}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Role:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="RoleStr" readonly
                                       value='{{>RoleStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Status:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="StatuStr" readonly
                                       value='{{>StatuStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Addr:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Addr" readonly
                                       value='{{>Addr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                   
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Engine:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>Description.Engine.EngineVersion}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Os:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>OS}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Architecture:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>Architecture}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">CPUs:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>CPUs}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                   
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Memory:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>MemoryBytes}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                                        
                    <fieldset>
                        <legend style="margin-bottom: 0px;" data-i18n="nodes.section.labels">标签选项</legend>
                    </fieldset>
                
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <div class="cubeui-row"  style="margin-top: 0px;">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;' data-i18n="common.label.key">标签</span>
                                </div>
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>&nbsp;</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;' data-i18n="common.label.value">值</span>
                                </div>
                            </div>
                            {{props Spec.Labels}}
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{>key}}</span>
                                    
                                </div>                                
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>=</span>
                                </div>
                                <div class="cubeui-col-sm5">
                                    <span style='line-height: 20px;padding-right:0px;'>{{>prop}}</span>
                                </div>
                            </div>
                            {{/props}}
                        </div>
                    </div>
                
                </div>
                
            </div>
            
              <div title="管理节点信息" data-i18n-title="nodes.tab.managerInfo"
                 data-options="id:'eastTab1',iconCls:'fa fa-sitemap',disabled:{{if Role == 'manager'}}false{{else}}true{{/if}}">                 
                <div style="margin: 0px;">
                </div>
                
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend data-i18n="nodes.section.manager">管理信息</legend>
                    </fieldset>             
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Hostname:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" name="Name" readonly
                                       value='{{>Hostname}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">ID:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" name="Name" readonly
                                       value='{{>ID}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Role:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="RoleStr" readonly
                                       value='{{>RoleStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Status:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="StatuStr" readonly
                                       value='{{>StatuStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Addr:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Addr" readonly
                                       value='{{>Addr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" data-i18n="nodes.label.leaderRole">管理节点角色:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="CreateAt" readonly
                                       value='{{>LeaderStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">ADVERTISE:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Updated" readonly
                                       value='{{>MAddrStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                                                  
                </div>          
                 
            </div>
            
        </div>
        
`

function updateTags(id, inspect){


    if($.extends.isEmpty(id)){
        let rows = $('#nodesDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('nodes.msg.onlyOne.editMetadata'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('nodes.msg.pickOne.editMetadata'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    let node = local_node;

    $.docker.request.node.inspect(function (response){

        let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <div style="margin-top:5px">      
                        <div class="cubeui-row" title="${t('nodes.dialog.labels.sectionTitle')}">
                            <fieldset>
                                <legend style="margin-bottom: 0px;">${t('nodes.dialog.labels.sectionTitle')}</legend>
                            </fieldset>
                                            
                            <div class="cubeui-col-sm12 add-opt-div">
                                <div class="cubeui-row">
                                    <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                        <span style='line-height: 20px;padding-right:0px;'>${t('common.label.key')}</span>
                                    </div>
                                    <div class="cubeui-col-sm5" >
                                        <span style='line-height: 20px;padding-right:0px;'>${t('common.label.value')}</span>
                                    </div>
                                    <div class="cubeui-col-sm2" style="text-align: center">
                                        <span style='line-height: 20px;padding-right:0px;'>
                                            <span onClick="$.docker.utils.ui.addNodeOpts(this, 'Labels')"  class="ops-fa-icon fa fa-plus" style="font-size:14px!important;">&nbsp;</span>
                                        </span>
                                    </div>
                                </div>
                                    
                                {{if Spec.Labels}}
                                {{props Spec.Labels}}                        
                                <div class="cubeui-row">
                                    <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                        <input type="text" data-toggle="cubeui-textbox" value="{{>key}}"
                                               name='Labels-name' data-options="required:false,prompt:'${t('nodes.prompt.labelKey')}'">
                                    </div>
                                    <div class="cubeui-col-sm5">
                                        <input type="text" data-toggle="cubeui-textbox" value="{{>prop}}"
                                               name='Labels-value' data-options="required:false,prompt:'${t('nodes.prompt.labelValue')}'">
                                    </div>
                                    <div class="cubeui-col-sm2" style="text-align: center">
                                        <span style='line-height: 30px;padding-right:0px;'><span onClick="$.docker.utils.ui.removeOpt(this)"  class="ops-fa-icon fa fa-close" style="font-size:14px!important;">&nbsp;</span></span>
                                    </div>
                                </div>    
                                {{/props}}
                                {{/if}}
                            
                            </div>
                            
                            
                        </div>
                    </div>
                </div>
        `;

        html = $.templates(html).render(response)

        $.docker.utils.optionConfirm(t('nodes.dialog.labels.title'), null, html,
            function(param, closeFn){
                let labels = $.docker.utils.buildOptsData(param['Labels-name'],param['Labels-value']);

                $.docker.request.node.update_labels(function (response) {
                    $.app.show(t('nodes.msg.labels.updated', response.Info.Description.Hostname));

                    reloadDg();
                    if(inspect){
                        inspectNode(id)
                    }
                    closeFn();
                }, node, id, labels);
            }, null, 450, 800);

    }, node, id);
}


function updateName(btn, id){

    let node = local_node;
    let opts = $(btn).linkbutton('options');

    if(opts.flag==2){

        $.app.confirm(t('nodes.dialog.nodeName.confirm'), function(){

            let name = $('#Nodename').textbox('getValue');

            $.docker.request.node.update_name(function (response) {
                $.app.show(t('nodes.msg.nodeName.updated'));
                opts.flag = 1;
                $(btn).linkbutton({
                    text:t('common.btn.edit'),
                    iconCls: 'fa fa-pencil-square-o'
                });

                $('#Nodename').textbox('readonly', true);

                reloadDg();
                inspectNode(id)
            }, node, id, name)
        })

    }else{
        opts.flag = 2;
        $('#Nodename').textbox('readonly', false);
        $(btn).linkbutton({
            text:t('common.btn.confirm'),
            iconCls: 'fa fa-check-square-o'
        });
    }
}


function onActivated(opts, title, idx){
    console.log('Image onActivated')
    reloadDg();
    //refreshCharts();
}

function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) { return key; }
}

function __network_getI18n(){
    return (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
}

function __network_applyI18n(root){
    var i18n = __network_getI18n();
    if(i18n && i18n.apply){
        try { i18n.apply(root || document); } catch (e) {}
    }
}

function __network_setPlaceholder($el, text){
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

function __network_setButtonText(selector, text){
    var $el = $(selector);
    if(!$el.length) return;

    $el.html(text);

    try { $el.linkbutton({text:text}); } catch (e) {}
    try { $el.menubutton({text:text}); } catch (e2) {}
}

function __network_applyControlsI18n(){
    var i18n = __network_getI18n();
    if(!i18n || !i18n.t) return;

    __network_setButtonText('#networkCreateBtn', i18n.t('network.toolbar.create'));
    __network_setButtonText('#networkCloneBtn', i18n.t('network.toolbar.clone'));
    __network_setButtonText('#networkRemoveBtn', i18n.t('network.toolbar.remove'));
    __network_setButtonText('#networkPruneBtn', i18n.t('network.toolbar.prune'));
    __network_setButtonText('#searchbtn', i18n.t('common.btn.search'));

    __network_setPlaceholder($('#driver_network'), i18n.t('common.prompt.emptyAll'));
    __network_setPlaceholder($("input[name='type']"), i18n.t('common.prompt.emptyAll'));
    __network_setPlaceholder($("input[name='scope']"), i18n.t('common.prompt.emptyAll'));
    __network_setPlaceholder($('#search_type'), i18n.t('common.prompt.searchTypeRequired'));
    __network_setPlaceholder($('#search_key'), i18n.t('common.prompt.searchKey'));

    try {
        var typeValue = $("input[name='type']").combobox('getValue');
        $("input[name='type']").combobox('loadData', [
            {KEY:'', TEXT:i18n.t('common.option.all')},
            {KEY:'custom', TEXT:i18n.t('network.search.type.custom')},
            {KEY:'builtin', TEXT:i18n.t('network.search.type.builtin')}
        ]).combobox('setValue', typeValue || '');
    } catch (e3) {}

    try {
        var scopeValue = $("input[name='scope']").combobox('getValue');
        $("input[name='scope']").combobox('loadData', [
            {KEY:'', TEXT:i18n.t('common.option.all')},
            {KEY:'local', TEXT:'local'},
            {KEY:'swarm', TEXT:'swarm'},
            {KEY:'global', TEXT:'global'}
        ]).combobox('setValue', scopeValue || '');
    } catch (e4) {}
}

function __network_applyGridI18n(){
    try { __network_applyI18n($('#networksDg').datagrid('getPanel')); } catch (e) {}
}

function loadLease(){

    // let node = $.docker.menu.getCurrentTabAttachNode();
    let node = local_node;

    $(function(){
        $("#networksDg").iDatagrid({
            idField: 'ID',
            sortOrder:'asc',
            sortName:'Id',
            pageSize:50,
            queryParams:{all1:1},
            frozenColumns:[[
                {field: 'ID', title: '', checkbox: true},
                {field: 'op', title: '<span data-i18n="common.col.operation">Operation</span>', sortable: false, halign:'center',align:'left',
                    width1: 100, formatter:leaseOperateFormatter},
                {field: 'Id', title: 'ID', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 220},
                {field: 'Name', title: 'Name', sortable: true,
                    formatter:$.iGrid.buildformatter([$.iGrid.templateformatter('{Name}'), $.iGrid.tooltipformatter()]),
                    width: 140},
            ]],
            onBeforeLoad:function (param){
                refreshNetworks(param)
            },
            columns: [[
                {field: 'Driver', title: 'DRIVER', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 80},
                {field: 'Scope', title: 'SCOPE', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 80},
                {field: 'Created', title: 'CREATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'IPAMStr', title: 'IPAM', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 260},
                {field: 'OptionStr', title: 'OPTIONS', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 360},
                {field: 'LabelStr', title: 'LABELS', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 360}
            ]],
            onLoadSuccess:$.easyui.event.wrap(
                $.fn.iDatagrid.defaults.onLoadSuccess,
                function(data){
                    let dg = this;
                }
            ),
        });

        __network_applyControlsI18n();
        __network_applyGridI18n();
        __network_applyI18n(document);

        try {
            $(document).off('app:langChanged.network').on('app:langChanged.network', function () {
                __network_applyControlsI18n();
                __network_applyGridI18n();
                __network_applyI18n(document);
                reloadDg();
            });
        } catch (e5) {}
    });
}

function leaseOperateFormatter(value, row, index) {
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-yellowgreen layui-btn layui-btn-xs" onclick="inspectNetwork(\'' + row.ID + '\')">' + t('common.btn.view') + '</button>';
    htmlstr += '<button class="layui-btn-blue layui-btn layui-btn-xs" onclick="cloneLease(\'' + row.ID + '\')">' + t('network.btn.clone') + '</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeLease(\'' + row.ID + '\')">' + t('network.btn.remove') + '</button>';
    return htmlstr;
}



function createLease(){
    inspectNetwork();
}

function removePanel(){
    $('#layout').layout('remove', 'east');
}

function refreshNetworks(param){

    let pageSize = $.docker.utils.getPageRowsFromParam(param);

    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;

    $.docker.request.network.list(function (response) {
        $('#networksDg').datagrid('loadData', {
            total: response.total,
            rows: response.list
        })

    }, node, skip, pageSize, param.driver, param.type, param.scope, param.search_type, param.search_key, param.sort, param.order);
}

function pruneLease(){

    let node = local_node;

    let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>` + t('network.dialog.prune.options') + `</legend>
                    </fieldset>
                    <div style="margin-top:5px">     
                        <div class="cubeui-row">
                            <span style='line-height: 30px;padding-right:0px'><b>` + t('network.dialog.prune.labelFilter') + `</b>(` + t('network.dialog.prune.defaultAll') + `)</span>
                        </div>
                        <div class="cubeui-row">
                            <span style='line-height: 20px;padding-right:0px;color: red'>` + t('network.dialog.prune.labelFormatHint') + `</span>
                        </div>
                        <div class="cubeui-row">
                            <input type="text" data-toggle="cubeui-textbox" name="labels"
                                   value='' data-options="required:false,prompt:'` + t('network.prompt.labelFilter') + `'">
                        </div>
                    </div>
                    <div style="margin-top:5px">     
                        <div class="cubeui-row">
                            <span style='line-height: 30px;padding-right:0px'><b>` + t('network.dialog.prune.untilFilter') + `</b>(` + t('network.dialog.prune.defaultAll') + `)</span>
                        </div>
                        <div class="cubeui-row">
                            <span style='line-height: 20px;padding-right:0px;color: red'>` + t('network.dialog.prune.untilFormatHint') + `</span>
                        </div>
                        <div class="cubeui-row">
                            <input type="text" data-toggle="cubeui-textbox" name="untils"
                                   value='' data-options="required:false,prompt:'` + t('network.prompt.untilFilter') + `'">
                        </div>
                    </div>
                </div>
        `;

    $.docker.utils.optionConfirm(t('network.dialog.prune.title'), t('network.dialog.prune.warn'), html,
        function(param, closeFn){

            $.docker.request.network.prune(function(response){
                let msg = t('network.msg.prune.success').format(response.Count)

                closeFn();

                $.app.show(msg)
                reloadDg()
            }, node, param.labels, param.untils)
        }, null, 450)
}

function cloneLease(id){

    let node = local_node;

    $.docker.request.network.inspect(function (response){
        let rowData = response;
        rowData.Name = response.Name;
        rowData.updated = false;
        showNetworkPanel(rowData)
    }, node, id)
}

function removeLease(id, closePanel) {
    if($.extends.isEmpty(id)){
        let rows = $('#networksDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('network.msg.onlyOne.remove'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('network.msg.pickOne.remove'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    $.app.confirm(t('network.dialog.remove.confirm'),function (){

        let node = local_node;
        $.docker.request.network.delete(function(response){
            $.app.show(t('network.msg.remove.success').format(""));
            reloadDg();

            if(closePanel){
                removePanel();
            }

        }, node, id)
    });

}

function reloadDg(){
    $('#networksDg').datagrid('reload');
    $('#layout').layout('resize');
}

function inspectNetwork(id){
    let node = local_node;
    if($.extends.isEmpty(id)){
        let rowData = $.docker.request.network.buildNewRowData();
        rowData.updated = false;
        showNetworkPanel(rowData)
    }else{
        $.docker.request.network.inspect(function (response){
            let rowData = response;
            rowData.Name = response.Name;
            rowData.updated = true;
            showNetworkPanel(rowData)
        }, node, id)
    }
}

function showNetworkPanel(rowData){
    $('#layout').layout('remove', 'east');

    let east_layout_options = {
        region:'east',
        split:false,border:false,width:'100%',collapsed:true,
        iconCls:'fa fa-gear',
        collapsible:false,
        showHeader1:false,
        titleformat:t('network.panel.titleformat').format($.extends.isEmpty(rowData.Name, t('common.word.new'))), title:t('network.panel.title'),
        headerCls:'border_right',bodyCls:'border_right',collapsible:true,
        footerHtml:$.templates(footer_html_template).render(rowData),
        render:function (panel, option) {

            let cnt = $($.templates(network_html_template).render(rowData));
            panel.append(cnt);
            $.parser.parse(cnt);

            $('#eastTabs').tabs({
                fit:true,
                border:false,
                bodyCls1:'border_right_none,border_bottom_none',
                narrow:true,
                pill:true,
            });

            if(rowData.updated){
                $('#relatedContainersDg').iDatagrid({
                    pagination:false,
                    showHeader:true,
                    showFooter:true,
                    remoteSort:false,
                    queryParams: {id:rowData.ID},
                    onBeforeLoad:function (param){
                        let id = param.id;
                        let node = local_node;

                        $.docker.request.network.inspect(function (res) {
                            let rowData = res.containersRowData;
                            $('#relatedContainersDg').datagrid('loadData', {
                                total: rowData.total,
                                rows: rowData.list
                            })
                        }, node, id);
                    },
                    frozenColumns:[[
                        {field: 'op', title: '<span data-i18n="common.col.operation">Operation</span>', sortable: false, halign:'center',align:'left',
                            width1: 300, formatter:createRelatedContainerOperateFormatter(rowData.ID)},
                        {field: 'ID', title: 'ID', sortable: true,
                            formatter:$.iGrid.tooltipformatter(),width: 400},
                        {field: 'Name', title: 'NAME', sortable: true,
                            formatter:$.iGrid.tooltipformatter(),
                            width: 180},
                    ]],
                    columns: [[
                        {field: 'EndpointID', title: 'Endpoint', sortable: true,
                            formatter:$.iGrid.tooltipformatter(),width: 400},
                        {field: 'MacAddress', title: 'MacAddress', sortable: true,
                            formatter:$.iGrid.tooltipformatter(),width: 180},
                        {field: 'IPv4Address', title: 'IPv4Address', sortable: false,
                            formatter:$.iGrid.tooltipformatter(),width: 280},
                        {field: 'IPv6Address', title: 'IPv6Address', sortable: true,
                            formatter:$.iGrid.tooltipformatter(),width: 180}
                    ]]
                })
            }

        }
    }

    $.docker.utils.ui.showSlidePanel($('#layout'), east_layout_options)
    let opts = $.iLayout.getLayoutPanelOptions('#layout',  'east');
    console.log(opts)
}

function createRelatedContainerOperateFormatter(id){
    return function (value, row, index) {
        let htmlstr = "";

        //superpowers
        htmlstr += '<button class="layui-btn-brown layui-btn layui-btn-xs" onclick="disConnectContainer(\''+id+'\', \'' + row.ID + '\')">' + t('network.btn.disconnect') + '</button>';
        return htmlstr;
    }
}

function disConnectContainer(id, containerId){

    let node = local_node;

    let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>` + t('network.dialog.prune.options') + `</legend>
                    </fieldset>
                    <div style="margin-top:5px">      
                        <div class="cubeui-row">                              
                            <input data-toggle="cubeui-checkbox" name="force" value="1" label="">
                            <span style='line-height: 30px;padding-right:0px'><b>` + t('network.dialog.disconnect.force') + `</b></span>
                        </div>
                    </div>
                </div>
        `;

    $.docker.utils.optionConfirm(t('network.dialog.disconnect.title'), t('network.dialog.disconnect.warn'), html,
        function(param, closeFn){

            $.docker.request.network.disconnect(function(response){
                let msg = t('network.msg.disconnect.success').format(response.Count, response.Size)
                closeFn();
                $.app.show(msg)
                refreshConnectedContainers();
            }, node, id, containerId, param.force=="1")
        }, null, 300)
}

function connectContainerDlg(id){

    let node = local_node;

    let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <div style="margin-top:15px">
                        <div id='dg_header' style="display1:none;margin-bottom1:15px">
                                <span style='line-height: 30px;padding-right:0px'>${t('network.dialog.connect.allContainers')}</span>
                                <input id='container_search_all' value='1' data-toggle="cubeui-switchbutton" style="width:50px;height1:30px" checked="true"
                                    data-options="
                                    onText:'',offText:'',
                                    onChange: function(checked){
                                        $('#container_searchbtn').trigger('click');
                                    }
                                    ">

                                <span style='line-height: 30px;padding-left:2px;padding-right:10px'></span>

                                <input type="text" id='container_search_type' value="name" data-toggle="cubeui-combobox"
                                       data-options="
                                                width:120,
                                                required:true,prompt:'${t('common.prompt.searchTypeRequired')}',
                                                valueField:'KEY',
                                                textField:'TEXT',
                                                data:[{'KEY':'name','TEXT':'${t('network.dialog.connect.searchTypeName')}'},{'KEY':'label','TEXT':'${t('network.dialog.connect.searchTypeLabel')}'},{'KEY':'before','TEXT':'${t('network.dialog.connect.searchTypeBefore')}'},
                                                {'KEY':'since','TEXT':'${t('network.dialog.connect.searchTypeSince')}'},{'KEY':'reference','TEXT':'${t('network.dialog.connect.searchTypeReference')}'},{'KEY':'ancestor','TEXT':'${t('network.dialog.connect.searchTypeAncestor')}'},
                                                {'KEY':'expose','TEXT':'${t('network.dialog.connect.searchTypeExpose')}'},{'KEY':'publish','TEXT':'${t('network.dialog.connect.searchTypePublish')}'},{'KEY':'volume','TEXT':'${t('network.dialog.connect.searchTypeVolume')}'}]
                                       ">
                                <input type="text" id='container_search_key' data-toggle="cubeui-textbox"
                                       data-options="onClear:function(){
                                            $('#container_searchbtn').trigger('click');
                                       }, prompt:'${t('common.prompt.searchKey')}',width:320">
                                <a href="javascript:void(0)" id="container_searchbtn"
                                   data-toggle="cubeui-menubutton"
                                   data-options="
                                   iconCls:'fa fa-search',
                                   btnCls:'cubeui-btn-blue',
                                   onClick:function(){
                                        let param = {};
                                        if($('#container_search_all').switchbutton('options').checked){
                                            param.all = 1;
                                        }

                                        param.search_type = $('#container_search_type').combobox('getValue');
                                        param.search_key = $('#container_search_key').textbox('getValue');

                                        $('#selectContainerDg').combogrid('grid').datagrid('reload',param)
                                   }
                                   ">${t('common.btn.search')}</a>
                        </div>

                        <div class="cubeui-row">
                            <div class="cubeui-col-sm12">
                                <label class="cubeui-form-label">${t('network.dialog.connect.targetContainer')}</label>
                                <div class="cubeui-input-block">
                                    <input id="selectContainerDg" type="text" data-toggle="cubeui-combogrid" name="Name"
                                           value=''
                                           data-options="
                                           prompt:'${t('network.dialog.connect.targetPrompt')}',
                                           required:true,
                                           reversed:true,
                                           editable:false,
                                           panelHeight:400,
                                           idField:'ID',
                                           textField:'Name',
                                           pagination:true,
                                           queryParams:{all:1},
                                           toolbar:'#dg_header',
                                           onBeforeLoad:function (param){
                                                refreshContainer(param)
                                           },
                                            frozenColumns:[[
                                                {field: 'Id', title: 'CONTAINER ID', sortable: true,
                                                    width: 260},
                                                {field:'Name',title:'NAME',width:160},
                                            ]],
                                           columns:[[
                                               {field: 'Image', title: 'IMAGE', sortable: true,width: 220},
                                               {field: 'Created', title: 'CREATED', sortable: true,width: 220},
                                               {field: 'Status', title: 'STATUS', sortable: true,width: 220},
                                               {field: 'Port', title: 'PORTS', sortable: true,width: 350},
                                               {field: 'LabelStr', title: 'LABELS', sortable: true,width: 900}
                                           ]]"
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <fieldset>
                        <legend>${t('network.dialog.connect.options')}</legend>
                    </fieldset>

                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="Add network-scoped alias for the container">${t('network.dialog.connect.alias')}</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-tagbox" name="Aliases"
                                       value=''
                                       data-options="
                                           prompt:'${t('network.dialog.connect.aliasPrompt')}',
                                            "
                                >
                            </div>
                        </div>
                    </div>

                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="IPv4 address (e.g., 192.168.11.1)">${t('network.dialog.connect.ipv4')}</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" name="IPAddress"
                                       value=''
                                       data-options="
                                           prompt:'${t('network.dialog.connect.ipv4Prompt')}',
                                            "
                                >
                            </div>
                        </div>
                    </div>

                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="Global IPv6 address (e.g., 2001:db8::33)">${t('network.dialog.connect.ipv6')}</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" name="GlobalIPv6Address"
                                       value=''
                                       data-options="
                                           prompt:'${t('network.dialog.connect.ipv6Prompt')}',
                                            "
                                >
                            </div>
                        </div>
                    </div>

                    <fieldset  style="margin-top: 10px;">
                        <legend style="margin-bottom: 0px;">${t('network.dialog.connect.driverOptions')}</legend>
                    </fieldset>

                    <div class="cubeui-row">
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
                                        <span onClick="$.docker.utils.ui.addNodeOpts(this, 'connect-driver-opt')"  class="ops-fa-icon fa fa-plus" style="font-size:14px!important;">&nbsp;</span>
                                    </span>
                                </div>
                            </div>

                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <input type="text" data-toggle="cubeui-textbox" value=""
                                           name='connect-driver-opt-name' data-options="required:false,prompt:'${t('network.form.prompt.key')}'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value=""
                                           name='connect-driver-opt-value' data-options="required:false,prompt:'${t('network.form.prompt.value')}'">
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 30px;padding-right:0px;'><span onClick="$.docker.utils.ui.removeOpt(this)"  class="ops-fa-icon fa fa-close" style="font-size:14px!important;">&nbsp;</span></span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <fieldset style="margin-top:10px">
                        <legend style="margin-bottom: 0px;">${t('network.dialog.connect.links')}</legend>
                    </fieldset>

                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12 add-opt-div">
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>${t('network.dialog.connect.linkTarget')}</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>${t('network.dialog.connect.linkAlias')}</span>
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 20px;padding-right:0px;'>
                                        <span onClick="$.docker.utils.ui.addConnectLinks(this, 'connect-Links')"  class="ops-fa-icon fa fa-plus" style="font-size:14px!important;">&nbsp;</span>
                                    </span>
                                </div>
                            </div>

                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <input type="text" data-toggle="cubeui-textbox" value=""
                                           name='connect-Links-name' data-options="required:false,prompt:'${t('network.dialog.connect.linkTarget')}, e.g. mysql-001'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value=""
                                           name='connect-Links-value' data-options="required:false,prompt:'${t('network.dialog.connect.linkAlias')}, e.g. mysqldb'">
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 30px;padding-right:0px;'><span onClick="$.docker.utils.ui.removeOpt(this)"  class="ops-fa-icon fa fa-close" style="font-size:14px!important;">&nbsp;</span></span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
        `;

    $.docker.utils.optionConfirm(t('network.dialog.connect.title'), null, html,
        function(param, closeFn){

            if($.extends.isEmpty(param.Name)){
                $.app.show(t('network.msg.connect.pickTarget'));
                return false;
            }

            console.log(param);
            param = $.extend({}, param);

            $.app.confirm(t('network.dialog.connect.confirm'), function () {

                let config = {};
                param.Aliases = $.docker.utils.convert2ListParamValue(param.Aliases)
                if(!$.extends.isEmpty(param.Aliases)){
                    config.Aliases = param.Aliases;
                }

                if(!$.extends.isEmpty(param.IPAddress)){
                    config.IPAddress = $.extends.isEmpty(param.IPAddress, "");
                }
                if(!$.extends.isEmpty(param.GlobalIPv6Address)){
                    config.GlobalIPv6Address = $.extends.isEmpty(param.GlobalIPv6Address, "");
                }

                param.DriverOpts = $.docker.utils.buildOptsData(param['connect-driver-opt-name'],param['connect-driver-opt-value']);
                if(!$.extends.isEmpty(param.DriverOpts)){
                    config.DriverOpts = param.DriverOpts;
                }

                param['Links'] = [];
                param['connect-Links-name'] = $.docker.utils.convert2ListParamValue(param['connect-Links-name']);
                param['connect-Links-value'] = $.docker.utils.convert2ListParamValue(param['connect-Links-value']);
                $.each(param['connect-Links-value'], function (idx, v) {
                    if(!$.extends.isEmpty(v) && !$.extends.isEmpty(param['connect-Links-name'][idx])){
                        param['Links'].push(param['connect-Links-name'][idx]+':'+v);
                    }
                });

                if(!$.extends.isEmpty(param.Links)){
                    config.Links = param.Links;
                }

                console.log(config);
                $.docker.request.network.connect(function (response) {
                    $.app.show(t('network.msg.connect.success'));
                    closeFn();
                    refreshConnectedContainers();
                }, node, id, param.Name, config);

            })
        }, null, 550, 900)
}

function refreshContainer(param){
    let pageSize = $.docker.utils.getPageRowsFromParam(param);
    let skip = $.docker.utils.getSkipFromParam(param);

    let node = local_node;

    $.docker.request.container.list(function (response) {
        $('#selectContainerDg').combogrid('grid').datagrid('loadData',
            {
                total: response.total,
                rows: response.list
            });
    }, node, skip, pageSize, param.all==1, param.search_type, param.search_key, param.sort, param.order);
}

function refreshConnectedContainers(){
    $('#relatedContainersDg').datagrid('reload');
}

function saveNetwork(fn){

    let node = local_node;

    if($('#createNetworkForm1').form('validate') && $('#createNetworkForm2').form('validate')) {
        let info = $.extends.json.param2json($('#createNetworkForm1').serialize());

        console.log(info)
        let data = $.docker.request.network.buildNewRowData();
        data.Name = info.Name;

        if($.extends.isEmpty(info.CheckDuplicate, "")==1){
            data.CheckDuplicate = true;
        }

        if($.extends.isEmpty(info.Internal, "")==1){
            data.Internal = true;
        }

        if($.extends.isEmpty(info.Attachable, "")==1){
            data.Attachable = true;
        }

        if($.extends.isEmpty(info.Ingress, "")==1){
            data.Ingress = true;
        }

        if($.extends.isEmpty(info.EnableIPv6, "")==1){
            data.EnableIPv6 = true;
        }

        data.Scope = $.extends.isEmpty(info.Scope, "local");
        data.Driver = $.extends.isEmpty(info.Driver, "bridge");

        let labels = $.docker.utils.buildOptsData(info['Labels-name'],info['Labels-value']);
        data.Labels = labels;

        let driverOpts = $.docker.utils.buildOptsData(info['driver-opt-name'],info['driver-opt-value']);
        data.Options = driverOpts;

        info = $.extends.json.param2json($('#createNetworkForm2').serialize());
        data.IPAM.Driver = "default";

        let ipamOpts = $.docker.utils.buildOptsData(info['ipam-opt-name'],info['ipam-opt-value']);
        data.IPAM.Options = ipamOpts;

        info['network'] = [];
        if (info['network-value'] && !Array.isArray(info['network-value'])) {
            info['network-value'] = [info['network-value']];
            info['network-name'] = [info['network-name']];
        }

        if(info['network-value']){
            $.each(info['network-value'], function (idx, v) {
                info['network'].push({
                    Subnet:info['network-name'][idx],
                    Gateway:info['network-value'][idx],
                });
            });
        }
        data.IPAM.Config = info['network'];

        let doFn = function (row) {
            $.app.confirm(t('network.form.confirmCreate'), function () {
                $.docker.request.network.create(function (response) {
                    if (fn) {
                        fn.call(row, response, row)
                    } else {
                        $.app.show(t('network.msg.create.success', row.Name));
                        reloadDg();
                        removePanel();
                        //$('#layout').layout('collapse', 'east');
                    }
                }, node, row);
            });
        }

        doFn(data);
    }
}

let footer_html_template = `
        {{if updated}}
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                cloneLease('{{:ID}}', true);
            },
            btnCls: 'cubeui-btn-slateblue',
            iconCls: 'fa fa-ticket'
        }">{{:~t('network.btn.clone')}}</a>
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                removeLease('{{:ID}}', true);
            },
            btnCls: 'cubeui-btn-orange',
            iconCls: 'fa fa-times'
        }">{{:~t('common.btn.delete')}}</a>
        {{else}}   
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                saveNetwork();
            },
            btnCls: 'cubeui-btn-blue',
            iconCls: 'fa fa-plus'
        }">{{:~t('common.btn.add')}}</a>
        {{/if}}
         <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                    $('#layout').layout('collapse', 'east');
            },
            btnCls: 'cubeui-btn-red',
            iconCls: 'fa fa-close'
        }">{{:~t('common.btn.close')}}</a>
`;

let network_html_template = `
        <div data-toggle="cubeui-tabs" id='eastTabs'>
            <div title="{{:~t('network.form.tab.basic')}}"
                 data-options="id:'eastTab0',iconCls:'fa fa-info-circle'">                 
                <div style="margin: 0px;">
                </div>
                
                <form id='createNetworkForm1'>
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>{{:~t('network.form.section.basic')}}</legend>
                    </fieldset>
                    
                    {{if updated}}
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
                            <label class="cubeui-form-label">NAME:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" id="NetworkName" name="Name" readonly
                                       value='{{>Name}}'
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
                            <label class="cubeui-form-label">Driver:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="CreateAt" readonly
                                       value='{{>Driver}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">Scope:</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="CreateAt" readonly
                                       value='{{>Scope}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="{{:~t('network.form.enableIPv6Title')}}">{{:~t('network.form.enableIPv6')}}</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="CreateAt" readonly
                                       value='{{>EnableIPv6Str}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="{{:~t('network.form.internalTitle')}}">{{:~t('network.form.internal')}}</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="CreateAt" readonly
                                       value='{{>InternalStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="{{:~t('network.form.attachableTitle')}}">{{:~t('network.form.attachable')}}</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="CreateAt" readonly
                                       value='{{>AttachableStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="{{:~t('network.form.ingressTitle')}}">{{:~t('network.form.ingress')}}</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Ingress" readonly
                                       value='{{>IngressStr}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>
                    
                    {{else}}
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">{{:~t('network.form.name')}}</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" name="Name"
                                       value='{{>Name}}'
                                       data-options="
                                       prompt:'{{:~t("network.form.prompt.name")}}',
                                       required:true,
                                            "
                                >
                            </div>
                        </div>           
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="{{:~t('network.form.driverTitle')}}">{{:~t('network.form.driver')}}</label>
                            <div class="cubeui-input-block">
                                <input type="text" name="Driver" value='{{>Driver}}' 
                                data-toggle="cubeui-combobox"
                                   data-options="
                                            required:false,prompt:'{{:~t("network.form.prompt.driverDefault")}}',
                                            valueField:'KEY',
                                            textField:'TEXT',
                                            data:$.docker.driver.network.getNetworkObjectList()
                                   ">
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="{{:~t('network.form.scopeTitle')}}">{{:~t('network.form.scope')}}</label>
                            <div class="cubeui-input-block">
                                <input type="text" name="Scope" value='{{>Scope}}' 
                                data-toggle="cubeui-combobox"
                                   data-options="
                                            required:false,prompt:'{{:~t("network.form.prompt.scopeDefault")}}',
                                            valueField:'KEY',
                                            textField:'TEXT',
                                            data:[{'KEY':'','TEXT':''},{'KEY':'local','TEXT':'local'},{'KEY':'swarm','TEXT':'swarm'},{'KEY':'global','TEXT':'global'}]
                                   ">                                            
                            </div>
                        </div>
                    </div>
                                        
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label" title="{{:~t('network.form.checkDuplicateTitle')}}">
                            {{:~t('network.form.checkDuplicate')}}</label>
                            <div class="cubeui-input-block">
                                <input data-toggle="cubeui-switchbutton" 
                                {{if CheckDuplicate}}checked{{/if}} 
                                    name="CheckDuplicate" value="1" data-options="onText:'',offText:'',width:60">
                            </div>
                        </div>
                    </div>
                       
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm3">
                            <label class="cubeui-form-label" title="{{:~t('network.form.enableIPv6Title')}}">{{:~t('network.form.enableIPv6')}}</label>
                            <div class="cubeui-input-block">
                                <input data-toggle="cubeui-switchbutton" 
                                {{if EnableIPv6}}checked{{/if}} 
                                    name="EnableIPv6" value="1" data-options="onText:'',offText:'',width:60">
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm3">
                            <label class="cubeui-form-label" title="{{:~t('network.form.internalTitle')}}">{{:~t('network.form.internal')}}</label>
                            <div class="cubeui-input-block">
                                <input data-toggle="cubeui-switchbutton" 
                                {{if Internal}}checked{{/if}} 
                                    name="Internal" value="1" data-options="onText:'',offText:'',width:60">
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm3">
                            <label class="cubeui-form-label" title="{{:~t('network.form.attachableTitle')}}">{{:~t('network.form.attachable')}}</label>
                            <div class="cubeui-input-block">
                                <input data-toggle="cubeui-switchbutton" 
                                {{if Attachable}}checked{{/if}} 
                                    name="Attachable" value="1" data-options="onText:'',offText:'',width:60">
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm3">
                            <label class="cubeui-form-label" title="{{:~t('network.form.ingressTitle')}}">{{:~t('network.form.ingress')}}</label>
                            <div class="cubeui-input-block">
                                <input data-toggle="cubeui-switchbutton" 
                                {{if Ingress}}checked{{/if}} 
                                    name="Ingress" value="1" data-options="onText:'',offText:'',width:60">
                            </div>
                        </div>
                    </div>
                       
                    {{/if}}
                    
                             
                    <fieldset  style="margin-top: 10px;">
                        <legend style="margin-bottom: 0px;">{{:~t('network.form.section.driverOptions')}}</legend>
                    </fieldset>
                    {{if updated}}
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <div class="cubeui-row"  style="margin-top: 0px;">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.key')}}</span>
                                </div>
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>&nbsp;</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.value')}}</span>
                                </div>
                            </div>
                            {{if Options}}
                            {{props Options}}
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
                            {{/if}}
                        </div>
                    </div>
                    {{else}}
                    <div class="cubeui-row">                            
                        <div class="cubeui-col-sm12 add-opt-div">
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.key')}}</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.value')}}</span>
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 20px;padding-right:0px;'>
                                        <span onClick="$.docker.utils.ui.addNodeOpts(this, 'driver-opt')"  class="ops-fa-icon fa fa-plus" style="font-size:14px!important;">&nbsp;</span>
                                    </span>
                                </div>
                            </div>
                                
                            {{if Options}}
                            {{props Options}}                        
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>key}}"
                                           name='driver-opt-name' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.key\")}}'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>prop}}"
                                           name='driver-opt-value' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.value\")}}'">
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 30px;padding-right:0px;'><span onClick="$.docker.utils.ui.removeOpt(this)"  class="ops-fa-icon fa fa-close" style="font-size:14px!important;">&nbsp;</span></span>
                                </div>
                            </div>    
                            {{/props}}
                            {{/if}}
                        
                        </div>
                    </div>
                    {{/if}}
                                    
                    <fieldset  style="margin-top: 20px;">
                        <legend style="margin-bottom: 0px;">{{:~t('network.form.section.labels')}}</legend>
                    </fieldset>
                                
                    {{if updated}}
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <div class="cubeui-row"  style="margin-top: 0px;">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.key')}}</span>
                                </div>
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>&nbsp;</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.value')}}</span>
                                </div>
                            </div>
                            {{if Labels}}
                            {{props Labels}}
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
                            {{/if}}
                        </div>
                    </div>
                    {{else}}
                    <div class="cubeui-row">                            
                        <div class="cubeui-col-sm12 add-opt-div">
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.key')}}</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.value')}}</span>
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 20px;padding-right:0px;'>
                                        <span onClick="$.docker.utils.ui.addNodeOpts(this, 'Labels')"  class="ops-fa-icon fa fa-plus" style="font-size:14px!important;">&nbsp;</span>
                                    </span>
                                </div>
                            </div>
                                
                            {{if Labels}}
                            {{props Labels}}                        
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>key}}"
                                           name='Labels-name' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.key\")}}'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>prop}}"
                                           name='Labels-value' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.value\")}}'">
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 30px;padding-right:0px;'><span onClick="$.docker.utils.ui.removeOpt(this)"  class="ops-fa-icon fa fa-close" style="font-size:14px!important;">&nbsp;</span></span>
                                </div>
                            </div>    
                            {{/props}}
                            {{/if}}
                        
                        </div>
                    </div>
                    {{/if}}                    
                </div>
                </form>  
            </div>
            
            
              <div title="{{:~t('network.form.tab.ipam')}}"
                 data-options="id:'eastTab1',iconCls:'fa fa-usb'">
                <div style="margin: 0px;">
                </div>
                <form id='createNetworkForm2'>
                <div class="cubeui-fluid">
                
                    
                    {{if updated}}
                    
                    <fieldset>
                        <legend>{{:~t('network.form.section.ipam')}}</legend>
                    </fieldset>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">{{:~t('network.form.id')}}</label>
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
                            <label class="cubeui-form-label">{{:~t('network.form.name')}}</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" id="ConfigName" name="Name" readonly
                                       value='{{>Name}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>               
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">{{:~t('network.form.driver')}}</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                                       value='{{>IPAM.Driver}}'
                                       data-options="
                                            "
                                >
                            </div>
                        </div>
                    </div>  
                    {{/if}}
                    
                    
                    <fieldset  style="margin-top: 10px;">
                        <legend style="margin-bottom: 0px;">{{:~t('network.form.section.ipamOptions')}}</legend>
                    </fieldset>
                    
                    {{if updated}}
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <div class="cubeui-row"  style="margin-top: 0px;">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.key')}}</span>
                                </div>
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>&nbsp;</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.value')}}</span>
                                </div>
                            </div>
                            {{if IPAM.Options}}
                            {{props IPAM.Options}}
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
                            {{/if}}
                        </div>
                    </div>
                    {{else}}
                    <div class="cubeui-row">                            
                        <div class="cubeui-col-sm12 add-opt-div">
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.key')}}</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t('common.label.value')}}</span>
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 20px;padding-right:0px;'>
                                        <span onClick="$.docker.utils.ui.addNodeOpts(this, 'ipam-opt')"  class="ops-fa-icon fa fa-plus" style="font-size:14px!important;">&nbsp;</span>
                                    </span>
                                </div>
                            </div>
                                
                            {{if IPAM.Options}}
                            {{props IPAM.Options}}                        
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>key}}"
                                           name='ipam-opt-name' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.key\")}}'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>prop}}"
                                           name='ipam-opt-value' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.value\")}}'">
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 30px;padding-right:0px;'><span onClick="$.docker.utils.ui.removeOpt(this)"  class="ops-fa-icon fa fa-close" style="font-size:14px!important;">&nbsp;</span></span>
                                </div>
                            </div>    
                            {{/props}}
                            {{/if}}
                        
                        </div>
                    </div>
                    {{/if}}
                    
                     
                    <fieldset  style="margin-top: 20px;">
                        <legend style="margin-bottom: 0px;">{{:~t('network.form.section.networkSettings')}}</legend>
                    </fieldset>
                                
                    {{if updated}}
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <div class="cubeui-row"  style="margin-top: 0px;">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>Subnet</span>
                                </div>
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>&nbsp;</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>Gateway</span>
                                </div>
                            </div>
                            {{if IPAM.Config}}
                            {{for IPAM.Config}}
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{>Subnet}}</span>
                                    
                                </div>                                
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>&nbsp;</span>
                                </div>
                                <div class="cubeui-col-sm5">
                                    <span style='line-height: 20px;padding-right:0px;'>{{>Gateway}}</span>
                                </div>
                            </div>
                            {{/for}}
                            {{/if}}
                        </div>
                    </div>
                    {{else}}
                    <div class="cubeui-row">                            
                        <div class="cubeui-col-sm12 add-opt-div">
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>Subnet</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>Gateway</span>
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 20px;padding-right:0px;'>
                                        <span onClick="$.docker.utils.ui.addNetwork(this, 'network')"  class="ops-fa-icon fa fa-plus" style="font-size:14px!important;">&nbsp;</span>
                                    </span>
                                </div>
                            </div>
                                
                            {{if IPAM.Config}}
                            {{for IPAM.Config}}                        
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>Subnet}}"
                                           name='network-name' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.subnet\")}}'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>Gateway}}"
                                           name='network-value' data-options="required:false,prompt:'{{:~t(\"network.form.prompt.gateway\")}}'">
                                </div>
                                <div class="cubeui-col-sm2" style="text-align: center">
                                    <span style='line-height: 30px;padding-right:0px;'><span onClick="$.docker.utils.ui.removeOpt(this)"  class="ops-fa-icon fa fa-close" style="font-size:14px!important;">&nbsp;</span></span>
                                </div>
                            </div>    
                            {{/for}}
                            {{/if}}
                        
                        </div>
                    </div>
                    {{/if}}    
                </div>                
                </form>  
                
            </div>
            
            {{if updated}}
              <div title="{{:~t('network.form.tab.containers')}}"
                 data-options="id:'eastTab1',iconCls:'fa fa-superpowers'">
                <div style="margin: 0px;">
                </div>
                
                <div id="relatedContainersDg-toolbar" class="cubeui-toolbar"
                     data-options="grid:{
                           type:'datagrid',
                           id:'relatedContainersDg'
                       }">
        
                    <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
                            onClick:function(){
                                refreshConnectedContainers();
                            },
                            extend: '#relatedContainersDg-toolbar',
                            btnCls: 'cubeui-btn-orange',
                            iconCls: 'fa fa-refresh'
                        }">{{:~t('common.btn.refresh')}}</a>
        
                    <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
                            onClick:function(){
                                connectContainerDlg('{{>ID}}');
                            },
                            extend: '#relatedContainersDg-toolbar',
                            btnCls: 'cubeui-btn-blue',
                            iconCls: 'fa fa-link'
                        }">{{:~t('network.form.btn.connectContainer')}}</a>
                </div>
                <!-- toolbar end -->
                
                <table id="relatedContainersDg"></table>
                
            </div>
            {{/if}}
            
        </div>
       
`

function onActivated(opts, title, idx){
    console.log('Image onActivated')
    reloadDg();
    //refreshCharts();
}

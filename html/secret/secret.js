function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) {
        return key;
    }
}

function __secrets_getI18n(){
    return (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
}

function __secrets_applyI18n(root){
    var i18n = __secrets_getI18n();
    if(i18n && i18n.apply){
        try{ i18n.apply(root || document); }catch(e){}
    }
}

function __secrets_setPlaceholder($el, text){
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

function __secrets_applyControlsI18n(){
    var i18n = __secrets_getI18n();
    if(!i18n || !i18n.t) return;

    var $searchType = $('#search_type');
    var $searchKey = $('#search_key');

    __secrets_setPlaceholder($searchType, i18n.t('common.prompt.searchTypeRequired'));
    __secrets_setPlaceholder($searchKey, i18n.t('common.prompt.searchKey'));

    try{
        var v = $searchType.combobox('getValue');
        $searchType.combobox('loadData', [
            {KEY:'name', TEXT:i18n.t('secrets.search.type.name')},
            {KEY:'label', TEXT:i18n.t('secrets.search.type.label')},
            {KEY:'names', TEXT:i18n.t('secrets.search.type.names')},
            {KEY:'id', TEXT:i18n.t('secrets.search.type.id')}
        ]).combobox('setValue', v || 'name');
    }catch(e){}
}

function __secrets_applyGridI18n(){
    try{ __secrets_applyI18n($('#secretsDg').datagrid('getPanel')); }catch(e){}
}

function __secrets_bindLangChanged(){
    try{
        $(document).off('app:langChanged.secrets').on('app:langChanged.secrets', function(){
            __secrets_applyControlsI18n();
            try{ $('#secretsDg').datagrid('reload'); }catch(e){}
            __secrets_applyGridI18n();
            try{ __secrets_applyI18n($('#layout')[0]); }catch(e2){}
        });
    }catch(e3){}
}

function loadLease(){

    // let node = $.docker.menu.getCurrentTabAttachNode();
    let node = local_node;

    $(function(){
        $("#secretsDg").iDatagrid({
            idField: 'ID',
            sortOrder:'asc',
            sortName:'Id',
            pageSize:50,
            queryParams:{all1:1},
            frozenColumns:[[
                {field: 'ID', title: '', checkbox: true},
                {field: 'op', title: '<span data-i18n="common.col.operation">操作</span>', sortable: false, halign:'center',align:'left',
                    width1: 100, formatter:leaseOperateFormatter},
                {field: 'Id', title: 'ID', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 220},
                {field: 'Name', title: 'Name', sortable: true,
                    formatter:$.iGrid.buildformatter([$.iGrid.templateformatter('{Name}'), $.iGrid.tooltipformatter()]),
                    width: 140},
            ]],
            onBeforeLoad:function (param){
                refreshSecrets(param)
            },
            columns: [[
                {field: 'Created', title: 'CREATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'Updated', title: 'UPDATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 170},
                {field: 'SVersion', title: 'Raft', sortable: true,
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

        __secrets_bindLangChanged();
        __secrets_applyControlsI18n();
        __secrets_applyGridI18n();
        __secrets_applyI18n(document);
    });
}

function leaseOperateFormatter(value, row, index) {
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-yellowgreen layui-btn layui-btn-xs" onclick="inspectSecret(\'' + row.ID + '\')">' + t('common.btn.view') + '</button>';
    htmlstr += '<button disabled class="layui-btn-blue layui-btn layui-btn-xs" onclick="updateData(\'' + row.ID + '\')">' + t('secrets.toolbar.updateData') + '</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeLease(\'' + row.ID + '\')">' + t('common.btn.delete') + '</button>';
    return htmlstr;
}



function createLease(){
    inspectSecret();
}

function removePanel(){
    $('#layout').layout('remove', 'east');
}

function refreshSecrets(param){

    let pageSize = $.docker.utils.getPageRowsFromParam(param);

    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;

    $.docker.request.secret.list(function (response) {
        $('#secretsDg').datagrid('loadData', {
            total: response.total,
            rows: response.list
        })
        
        refreshImageAndContainerInfo();

    }, node, skip, pageSize, param.search_type, param.search_key, param.sort, param.order);
}

function removeLease(id, closePanel) {
    if($.extends.isEmpty(id)){
        let rows = $('#secretsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('secrets.msg.onlyOne.remove'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('secrets.msg.pickOne.remove'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    let node = local_node;

    $.app.confirm(t('secrets.dialog.remove.confirm'),function (){

        let node = local_node;
        $.docker.request.secret.delete(function(response){
            $.app.show(t('secrets.msg.remove.success'));
            reloadDg();

            if(closePanel){
                removePanel();
            }

        }, node, id)
    });

}

function reloadDg(){
    $('#secretsDg').datagrid('reload');
    $('#layout').layout('resize');
}

function inspectSecret(id){
    let node = local_node;
    if($.extends.isEmpty(id)){
        let rowData = $.docker.request.secret.buildNewRowData();
        rowData.updated = false;
        showSecretPanel(rowData)
    }else{
        $.docker.request.secret.inspect(function (response){
            let rowData = response;
            rowData.Name = response.Spec.Name;
            rowData.updated = true;
            showSecretPanel(rowData)
        }, node, id)
    }
}

function showSecretPanel(rowData){
    $('#layout').layout('remove', 'east');

    let east_layout_options = {
        region:'east',
        split:false,border:false,width:'100%',collapsed:true,
        iconCls:'fa fa-key',
        collapsible:false,
        showHeader1:false,
        titleformat:t('secrets.panel.titleformat', $.extends.isEmpty(rowData.Name, t('common.word.new'))), title:t('secrets.panel.title'),
        headerCls:'border_right',bodyCls:'border_right',collapsible:true,
        footerHtml:$.templates(footer_html_template).render(rowData),
        render:function (panel, option) {

            let cnt = $($.templates(secret_html_template).render(rowData));
            panel.append(cnt);
            $.parser.parse(cnt);

            $('#eastTabs').tabs({
                fit:true,
                border:false,
                bodyCls1:'border_right_none,border_bottom_none',
                tabPosition1:'bottom',
                narrow:true,
                pill:true,
            });

            __secrets_applyI18n(panel[0] || panel);

        }
    }

    $.docker.utils.ui.showSlidePanel($('#layout'), east_layout_options)
    let opts = $.iLayout.getLayoutPanelOptions('#layout',  'east');
    console.log(opts)
}

function saveSecret(fn){

    let node = local_node;

    if($('#createSecretForm').form('validate')) {
        let info = $.extends.json.param2json($('#createSecretForm').serialize());
        console.log(info)
        let data = $.docker.request.secret.buildNewRowData();
        data.Name = info.Name;

        let labels = $.docker.utils.buildOptsData(info['Labels-name'],info['Labels-value']);
        data.Labels = labels;


        let doFn = function (row) {
            $.app.confirm(t('secrets.dialog.create.confirm'), function () {
                $.docker.request.secret.create(function (response) {
                    if (fn) {
                        fn.call(row, response, row)
                    } else {
                        $.app.show(t('secrets.msg.create.success', row.Name));
                        reloadDg();
                        removePanel();
                        //$('#layout').layout('collapse', 'east');
                    }
                }, node, row);
            });
        }

        info.mode = $.extends.isEmpty(info.mode, 'data');

        if(info.mode == 'data'){
            if($.extends.isEmpty(info.data_text)){
                $.app.show(t('secrets.msg.data.required'));
                return false;
            }
            data.Data = info.data_text;
            doFn(data);
        }else{
            let files = $('#data_file').filebox('files');

            if($.extends.isEmpty(files)){
                $.app.show(t('secrets.msg.file.required'));
                return false;
            }

            $.easyui.file.getReader(function(e){
                data.Data = this.result;
                console.log(data.Data);
                doFn(data);
            }).readAsText(files[0], "utf-8")
        }

    }
}

let footer_html_template = `

        {{if updated}}
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                updateTags('{{:ID}}', true);
            },
            btnCls: 'cubeui-btn-slateblue',
            iconCls: 'fa fa-tags'
        }"><span data-i18n="secrets.toolbar.editMetadata">编辑元数据</span></a>        
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                removeLease('{{:ID}}', true);
            },
            btnCls: 'cubeui-btn-orange',
            iconCls: 'fa fa-times'
        }"><span data-i18n="common.btn.delete">删除</span></a>
        {{else}}   
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                saveSecret();
            },
            btnCls: 'cubeui-btn-blue',
            iconCls: 'fa fa-plus'
        }"><span data-i18n="common.btn.add">添加</span></a>
        {{/if}}
         <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                    $('#layout').layout('collapse', 'east');
            },
            btnCls: 'cubeui-btn-red',
            iconCls: 'fa fa-close'
        }"><span data-i18n="common.btn.close">关闭</span></a>
`;

let secret_html_template = `
        <div data-toggle="cubeui-tabs" id='eastTabs'>
            <div title="{{:~t(\"secrets.tab.info\")}}"
                 data-options="id:'eastTab0',iconCls:'fa fa-info-circle'">                 
                <div style="margin: 0px;">
                </div>
                
                
                
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend data-i18n="secrets.section.basic">基础信息</legend>
                    </fieldset>
                    
                    <form id='createSecretForm'>
                    
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
                        <div class="cubeui-col-sm11">
                            <label class="cubeui-form-label">NAME:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" id="SecretName" name="Name" readonly
                                       value='{{>Name}}'
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
                    
                    {{else}}
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">NAME:</label>
                            <div class="cubeui-input-block">
                                <input type="text" data-toggle="cubeui-textbox" id="SecretName" name="Name"
                                       value=''
                                       data-options="
                                       prompt:'{{:~t(\"secrets.prompt.nameRequired\")}}',
                                       required:true,
                                            "
                                >
                            </div>
                        </div>           
                    </div>
                    
                    
                    <style>
                    .radiobutton.inputbox{
                        cursor: pointer;
                    }
                    </style>
                    
                    <div class="cubeui-row">    
                        <div class="cubeui-col-sm12" style="margin-top: 5px">
                            <label class="cubeui-form-label">
                            <input data-toggle="cubeui-radiobutton" checked name="mode" 
                                        data-options="title:'{{:~t(\"secrets.mode.file\")}}',
                                            onChange:function(checked){    
                                                    $('#data_file').filebox('enableValidation');
                                                    $('#data_file').filebox('enable');
                                                    $('#data_file').filebox('resize');
                                                    $('#data_text').textbox('disableValidation'); 
                                                    $('#data_text').textbox('disable');                                            
                                            }
                                            " value="file" >
                                <span data-i18n="secrets.label.chooseFile">选择文件:</span></label>
                            <div class="cubeui-input-block">
                                <input  data-toggle="cubeui-filebox" id="data_file" data-options="
                                    prompt:'{{:~t(\"secrets.prompt.file\")}}',
                                    buttonText: '{{:~t(\"secrets.btn.chooseFile\")}}',
                                    required:true,
                                    accept:'.*',
                                    " style="width:100%">  
                            </div>
                        </div>
                    </div>
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">                            
                            <input data-toggle="cubeui-radiobutton" name="mode" 
                                        data-options="title:'{{:~t(\"secrets.mode.data\")}}',
                                            onChange:function(checked){               
                                                    $('#data_text').textbox('enableValidation');  
                                                    $('#data_text').textbox('enable');   
                                                                                                     
                                                    $('#data_file').filebox('disableValidation');
                                                    $('#data_file').filebox('disable');
                                                    $('#data_file').filebox('resize');         
                                            }
                                            " value="data" >                                            
                                <span data-i18n="secrets.label.data">密码内容:</span></label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="data_text" id="data_text"
                                       value=''
                                       data-options="
                                       disabled:true,
                                        prompt:'{{:~t(\"secrets.prompt.data\")}}',
                                       required:true,
                                       multiline:true,
                                       height:200,
                                            "
                                >
                            </div>
                        </div>
                    </div>                          
                    {{/if}}
                                    
                    <fieldset  style="margin-top: 10px;">
                        <legend style="margin-bottom: 0px;" data-i18n="secrets.section.labels">标签选项</legend>
                    </fieldset>
                                
                    {{if updated}}
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
                            {{if Spec.Labels}}
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
                            {{/if}}
                        </div>
                    </div>
                    {{else}}
                    <div class="cubeui-row">                            
                        <div class="cubeui-col-sm12 add-opt-div">
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;' data-i18n="secrets.label.key">键</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;' data-i18n="common.label.value">值</span>
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
                                         name='Labels-name' data-options="required:false,prompt:'{{:~t(\"nodes.prompt.labelKey\")}}'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>prop}}"
                                         name='Labels-value' data-options="required:false,prompt:'{{:~t(\"nodes.prompt.labelValue\")}}'">
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
                    
                </form>
                </div>
                
            </div>
            
        </div>
        
`

function updateData(id){
    if($.extends.isEmpty(id)){
        let rows = $('#secretsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('secrets.msg.onlyOne.updateData'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('secrets.msg.pickOne.updateData'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    let node = local_node;

    $.docker.request.secret.inspect(function (response){
        let rowData = response;
        rowData.Name = response.Spec.Name;

        let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <div style="margin-top:5px">      
                        <div class="cubeui-row" title="${t('secrets.section.data')}">
                            <fieldset>
                                <legend style="margin-bottom: 0px;">${t('secrets.section.data')}</legend>
                            </fieldset>
                                            
                            <div class="cubeui-col-sm12">
                            
                                <input type="text" data-toggle="cubeui-textbox" name="Data" 
                                       value=''
                                       data-options="
                                        prompt:'${t('secrets.prompt.data')}',
                                       required:true,
                                       multiline:true,
                                       height:260,
                                            "
                                >
                                                                
                            </div>
                            
                        </div>
                    </div>
                </div>
        `;

        html = $.templates(html).render(response)

        $.docker.utils.optionConfirm(t('secrets.dialog.updateData.title'), null, html, function (param, closeFn) {

            if($.extends.isEmpty(param.Data)){
                $.app.show(t('secrets.msg.enterData'));
                return false;
            }

            $.docker.request.secret.update_data(function (response) {
                $.app.show(t('secrets.msg.updateData.success', response.Info.Spec.Name));

                reloadDg();
                if(inspect){
                    inspectSecret(id)
                }
                closeFn();
            }, node, id, param.Data);

        }, null, 400, 600);

    }, node, id)
}

function updateTags(id, inspect){
    if($.extends.isEmpty(id)){
        let rows = $('#secretsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('secrets.msg.onlyOne.editMetadata'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('secrets.msg.pickOne.editMetadata'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    let node = local_node;

    $.docker.request.secret.inspect(function (response){

        let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <div style="margin-top:5px">      
                        <div class="cubeui-row" title="${t('secrets.dialog.labels.sectionTitle')}">
                            <fieldset>
                                <legend style="margin-bottom: 0px;">${t('secrets.dialog.labels.sectionTitle')}</legend>
                            </fieldset>
                                            
                            <div class="cubeui-col-sm12 add-opt-div">
                                <div class="cubeui-row">
                                    <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                        <span style='line-height: 20px;padding-right:0px;'>${t('secrets.label.key')}</span>
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

        $.docker.utils.optionConfirm(t('secrets.dialog.labels.title'), null, html,
            function(param, closeFn){
                let labels = $.docker.utils.buildOptsData(param['Labels-name'],param['Labels-value']);

                $.docker.request.secret.update_labels(function (response) {
                    $.app.show(t('secrets.msg.labels.updated', response.Info.Spec.Name));

                    reloadDg();
                    if(inspect){
                        inspectSecret(id)
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

        $.app.confirm(t('secrets.dialog.name.confirm'), function(){

            let name = $('#SecretName').textbox('getValue');

            if($.extends.isEmpty(name)){
                $.app.show(t('secrets.msg.name.required'));
                return false;
            }

            $.docker.request.secret.update_name(function (response) {
                $.app.show(t('secrets.msg.name.updated'));
                opts.flag = 1;
                $(btn).linkbutton({
                    text:t('common.btn.edit'),
                    iconCls: 'fa fa-pencil-square-o'
                });

                $('#SecretName').textbox('readonly', true);

                reloadDg();
                inspectSecret(id)
            }, node, id, name)
        })

    }else{
        opts.flag = 2;
        $('#SecretName').textbox('readonly', false);
        $('#SecretName').textbox('textbox').focus();
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

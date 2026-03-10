function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) { return key; }
}

function __configs_getI18n(){
    return (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
}

function __configs_applyI18n(root){
    var i18n = __configs_getI18n();
    if(i18n && i18n.apply){
        try { i18n.apply(root || document); } catch (e) {}
    }
}

function __configs_setPlaceholder($el, text){
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

function __configs_setButtonText(selector, text){
    var $el = $(selector);
    if(!$el.length) return;

    $el.html(text);

    try {
        $el.linkbutton({text:text});
    } catch (e) {}

    try {
        $el.menubutton({text:text});
    } catch (e2) {}
}

function __configs_applyControlsI18n(){
    var i18n = __configs_getI18n();
    if(!i18n || !i18n.t) return;

    __configs_setButtonText('#configsCreateBtn', i18n.t('configs.toolbar.create'));
    __configs_setButtonText('#configsEditMetadataBtn', i18n.t('configs.toolbar.editMetadata'));
    __configs_setButtonText('#configsUpdateBtn', i18n.t('configs.toolbar.update'));
    __configs_setButtonText('#configsRemoveBtn', i18n.t('configs.toolbar.remove'));
    __configs_setButtonText('#searchbtn', i18n.t('common.btn.search'));

    __configs_setPlaceholder($('#search_type'), i18n.t('common.prompt.searchTypeRequired'));
    __configs_setPlaceholder($('#search_key'), i18n.t('configs.search.placeholder'));

    try {
        var value = $('#search_type').combobox('getValue');
        $('#search_type').combobox('loadData', [
            {KEY:'name', TEXT:'Name'},
            {KEY:'label', TEXT:'Label'},
            {KEY:'names', TEXT:'Names'},
            {KEY:'id', TEXT:'ID'}
        ]).combobox('setValue', value || 'name');
    } catch (e3) {}
}

function __configs_applyGridI18n(){
    try { __configs_applyI18n($('#configsDg').datagrid('getPanel')); } catch (e) {}
}

function loadLease(){

    function t(key) {
        try {
            var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
            return i18n ? i18n.t.apply(i18n, arguments) : key;
        } catch (e) { return key; }
    }

    // let node = $.docker.menu.getCurrentTabAttachNode();
    let node = local_node;

    $(function(){
        $("#configsDg").iDatagrid({
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
                refreshConfigs(param)
            },
            columns: [[
                {field: 'DataStr', title: 'CONTENT', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 260},
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

        __configs_applyControlsI18n();
        __configs_applyGridI18n();
        __configs_applyI18n(document);

        try {
            $(document).off('app:langChanged.configs').on('app:langChanged.configs', function () {
                __configs_applyControlsI18n();
                __configs_applyGridI18n();
                __configs_applyI18n(document);
                try { reloadDg(); } catch (e) {}
            });
        } catch (e) {}
    });
}

function leaseOperateFormatter(value, row, index) {
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-yellowgreen layui-btn layui-btn-xs" onclick="inspectConfig(\'' + row.ID + '\')">'+t('configs.btn.view')+'</button>';
    htmlstr += '<button class="layui-btn-blue layui-btn layui-btn-xs" onclick="updateData(\'' + row.ID + '\')">'+t('configs.btn.update')+'</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeLease(\'' + row.ID + '\')">'+t('configs.btn.delete')+'</button>';
    return htmlstr;
}



function createLease(){
    inspectConfig();
}

function removePanel(){
    $('#layout').layout('remove', 'east');
}

function refreshConfigs(param){

    let pageSize = $.docker.utils.getPageRowsFromParam(param);

    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;

    $.docker.request.config.list(function (response) {
        $('#configsDg').datagrid('loadData', {
            total: response.total,
            rows: response.list
        })

        refreshImageAndContainerInfo();

    }, node, skip, pageSize, param.search_type, param.search_key, param.sort, param.order);
}

function removeLease(id, closePanel) {
    if($.extends.isEmpty(id)){
        let rows = $('#configsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('configs.msg.onlyOne.remove'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('configs.msg.pickOne.remove'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    $.app.confirm(t('configs.dialog.remove.confirm'),function (){

        let node = local_node;
        $.docker.request.config.delete(function(response){
            $.app.show(t('configs.msg.remove.success'));
            reloadDg();

            if(closePanel){
                removePanel();
            }

        }, node, id)
    });

}

function reloadDg(){
    $('#configsDg').datagrid('reload');
    $('#layout').layout('resize');
}

function inspectConfig(id){
    let node = local_node;
    if($.extends.isEmpty(id)){
        let rowData = $.docker.request.config.buildNewRowData();
        rowData.updated = false;
        showConfigPanel(rowData)
    }else{
        $.docker.request.config.inspect(function (response){
            let rowData = response;
            rowData.Name = response.Spec.Name;
            rowData.updated = true;
            showConfigPanel(rowData)
        }, node, id)
    }
}

function showConfigPanel(rowData){
    $('#layout').layout('remove', 'east');

    let east_layout_options = {
        region:'east',
        split:false,border:false,width:'100%',collapsed:true,
        iconCls:'fa fa-gear',
        collapsible:false,
        showHeader1:false,
        titleformat:t('configs.panel.titleformat').format($.extends.isEmpty(rowData.Name, t('common.word.new'))), title:t('configs.panel.title'),
        headerCls:'border_right',bodyCls:'border_right',collapsible:true,
        footerHtml:$.templates(footer_html_template).render(rowData),
        render:function (panel, option) {

            let cnt = $($.templates(config_html_template).render(rowData));
            panel.append(cnt);
            $.parser.parse(cnt);

            $('#eastTabs').tabs({
                fit:true,
                border:false,
                bodyCls1:'border_right_none,border_bottom_none',
                narrow:true,
                pill:true,
            });

        }
    }

    $.docker.utils.ui.showSlidePanel($('#layout'), east_layout_options)
    let opts = $.iLayout.getLayoutPanelOptions('#layout',  'east');
    console.log(opts)
}

function saveConfig(fn){

    let node = local_node;

    if($('#createConfigForm').form('validate')) {
        let info = $.extends.json.param2json($('#createConfigForm').serialize());
        console.log(info)
        let data = $.docker.request.config.buildNewRowData();
        data.Name = info.Name;

        let labels = $.docker.utils.buildOptsData(info['Labels-name'],info['Labels-value']);
        data.Labels = labels;


        let doFn = function (row) {
            $.app.confirm(t('configs.dialog.create.confirm'), function () {
                $.docker.request.config.create(function (response) {
                    if (fn) {
                        fn.call(row, response, row)
                    } else {
                        $.app.show(t('configs.msg.create.success').format(row.Name));
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
                $.app.show(t('configs.msg.content.required'));
                return false;
            }
            data.Data = info.data_text;
            doFn(data);
        }else{
            let files = $('#data_file').filebox('files');

            if($.extends.isEmpty(files)){
                $.app.show(t('configs.msg.file.required'));
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
        }">{{:~t("configs.toolbar.editMetadata")}}</a>        
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                removeLease('{{:ID}}', true);
            },
            btnCls: 'cubeui-btn-orange',
            iconCls: 'fa fa-times'
        }">{{:~t("common.btn.delete")}}</a>
        {{else}}   
        <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                saveConfig();
            },
            btnCls: 'cubeui-btn-blue',
            iconCls: 'fa fa-plus'
        }">{{:~t("common.btn.add")}}</a>
        {{/if}}
         <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
            onClick:function(){
                    $('#layout').layout('collapse', 'east');
            },
            btnCls: 'cubeui-btn-red',
            iconCls: 'fa fa-close'
        }">{{:~t("common.btn.close")}}</a>
`;

let config_html_template = `
        <div data-toggle="cubeui-tabs" id='eastTabs'>
            <div title="{{:~t('configs.tab.info')}}"
                 data-options="id:'eastTab0',iconCls:'fa fa-info-circle'">                 
                <div style="margin: 0px;">
                </div>
                
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>{{:~t("configs.section.basic")}}</legend>
                    </fieldset>
                    
                    <form id='createConfigForm'>
                    
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
                                <input type="text" data-toggle="cubeui-textbox" id="ConfigName" name="Name" readonly
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
							}">{{:~t("configs.btn.edit")}}</a>
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
                    
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <label class="cubeui-form-label">
                            {{:~t("configs.label.content")}}</label>
                            <div class="cubeui-input-block">                
                                <input readonly type="text" data-toggle="cubeui-textbox" name="data_text" id="data_text"
                                       value='{{>DataStr}}'
                                       data-options="
                                       prompt:'{{:~t(\"configs.prompt.data\")}}',
                                       required:true,
                                       multiline:true,
                                       height:200,
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
                                <input type="text" data-toggle="cubeui-textbox" id="ConfigName" name="Name"
                                       value=''
                                       data-options="
                                       prompt:'{{:~t(\"configs.prompt.nameRequired\")}}',
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
                                            data-options="title:'{{:~t(\"configs.mode.file\")}}',
                                            onChange:function(checked){    
                                                    $('#data_file').filebox('enableValidation');
                                                    $('#data_file').filebox('enable');
                                                    $('#data_file').filebox('resize');
                                                    $('#data_text').textbox('disableValidation'); 
                                                    $('#data_text').textbox('disable');                                            
                                            }
                                            " value="file" >
                            {{:~t("configs.mode.file")}}</label>
                            <div class="cubeui-input-block">
                                <input  data-toggle="cubeui-filebox" id="data_file" data-options="
                                    prompt:'{{:~t(\"configs.prompt.file\")}}',
                                    buttonText: '{{:~t(\"configs.btn.chooseFile\")}}',
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
                                            data-options="title:'{{:~t(\"configs.mode.data\")}}',
                                            onChange:function(checked){               
                                                    $('#data_text').textbox('enableValidation');  
                                                    $('#data_text').textbox('enable');   
                                                                                                     
                                                    $('#data_file').filebox('disableValidation');
                                                    $('#data_file').filebox('disable');
                                                    $('#data_file').filebox('resize');         
                                            }
                                            " value="data" >                                            
                            {{:~t("configs.mode.data")}}</label>
                            <div class="cubeui-input-block">
                
                                <input type="text" data-toggle="cubeui-textbox" name="data_text" id="data_text"
                                       value=''
                                       data-options="
                                       disabled:true,
                                       prompt:'{{:~t(\"configs.prompt.data\")}}',
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
                        <legend style="margin-bottom: 0px;">{{:~t("configs.section.labels")}}</legend>
                    </fieldset>
                                
                    {{if updated}}
                    <div class="cubeui-row">
                        <div class="cubeui-col-sm12">
                            <div class="cubeui-row"  style="margin-top: 0px;">
                                <div class="cubeui-col-sm5 cubeui-col-sm-offset1" style="padding-right: 5px">
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t("configs.label.tag")}}</span>
                                </div>
                                <div class="cubeui-col-sm1">
                                    <span style='line-height: 20px;padding-right:0px;'>&nbsp;</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t("configs.label.value")}}</span>
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
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t("configs.label.key")}}</span>
                                </div>
                                <div class="cubeui-col-sm5" >
                                    <span style='line-height: 20px;padding-right:0px;'>{{:~t("configs.label.value")}}</span>
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
                                           name='Labels-name' data-options="required:false,prompt:'{{:~t(\"configs.prompt.labelKey\")}}'">
                                </div>
                                <div class="cubeui-col-sm5">
                                    <input type="text" data-toggle="cubeui-textbox" value="{{>prop}}"
                                           name='Labels-value' data-options="required:false,prompt:'{{:~t(\"configs.prompt.labelValue\")}}'">
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
        let rows = $('#configsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('configs.msg.onlyOne.update'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('configs.msg.pickOne.update'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    let node = local_node;

    $.docker.request.config.inspect(function (response){
        let rowData = response;
        rowData.Name = response.Spec.Name;

        let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <div style="margin-top:5px">      
                        <div class="cubeui-row" title="${t('configs.dialog.update.title')}">
                            <fieldset>
                                <legend style="margin-bottom: 0px;">${t('configs.dialog.update.title')}</legend>
                            </fieldset>
                        
                        <form id='updateConfigForm'>    
                        <div class="cubeui-row">
                            <div class="cubeui-col-sm12">
                                <label class="cubeui-form-label">NAME:</label>
                                <div class="cubeui-input-block">
                                    <input type="text" data-toggle="cubeui-textbox" name="Name" readonly
                                           value='{{>Name}}'
                                           data-options="
                                           prompt:'${t("configs.prompt.nameRequired")}',
                                           required:true,
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
                        
                        
                        <style>
                        .radiobutton.inputbox{
                            cursor: pointer;
                        }
                        </style>
                        
                        <div class="cubeui-row">    
                            <div class="cubeui-col-sm12" style="margin-top: 5px">
                                <label class="cubeui-form-label">
                                <input data-toggle="cubeui-radiobutton" checked name="mode" 
                                                data-options="title:'${t("configs.mode.file")}',
                                                onChange:function(checked){    
                                                        $('#data_file').filebox('enableValidation');
                                                        $('#data_file').filebox('enable');
                                                        $('#data_file').filebox('resize');
                                                        $('#data_text').textbox('disableValidation'); 
                                                        $('#data_text').textbox('disable');                                            
                                                }
                                                " value="file" >
                                ${t('configs.label.file')}:</label>
                                <div class="cubeui-input-block">
                                    <input  data-toggle="cubeui-filebox" id="data_file" data-options="
                                        prompt:'${t("configs.prompt.file")}',
                                        buttonText: '${t("configs.btn.chooseFile")}',
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
                                                data-options="title:'${t("configs.mode.data")}',
                                                onChange:function(checked){               
                                                        $('#data_text').textbox('enableValidation');  
                                                        $('#data_text').textbox('enable');   
                                                                                                         
                                                        $('#data_file').filebox('disableValidation');
                                                        $('#data_file').filebox('disable');
                                                        $('#data_file').filebox('resize');         
                                                }
                                                " value="data" >                                            
                                ${t('configs.label.data')}:</label>
                                <div class="cubeui-input-block">
                    
                                    <input type="text" data-toggle="cubeui-textbox" name="data_text" id="data_text"
                                           value=''
                                           data-options="
                                           disabled:true,
                                           prompt:'${t("configs.prompt.data")}',
                                           required:true,
                                           multiline:true,
                                           height:240,
                                                "
                                    >
                                </div>
                            </div>
                        </div>     
                            
                        
                        </form>
                    </div>
                </div>
        `;

        html = $.templates(html).render(response)

        $.docker.utils.optionConfirm(t('configs.dialog.update.title'), null, html, function (param, closeFn) {

            if($('#updateConfigForm').form('validate')) {

                let param = $.extends.json.param2json($('#updateConfigForm').serialize());
                console.log(param)

                let doFn = function (param) {

                    if($.extends.isEmpty(param.Data)){
                        $.app.show(t('configs.msg.updateData.emptyCheck'));
                        return false;
                    }

                    $.docker.request.config.update_data(function (response) {
                        $.app.show(t('configs.msg.updateData.success').format(response.Info.Spec.Name));

                        reloadDg();
                        inspectConfig(id)
                        closeFn();
                    }, node, id, param.Data);

                }

                param.mode = $.extends.isEmpty(param.mode, 'data');

                if(param.mode == 'data'){
                    if($.extends.isEmpty(param.data_text)){
                        $.app.show(t('configs.msg.content.required'));
                        return false;
                    }
                    param.Data = param.data_text;
                    doFn(param);
                }else{
                    let files = $('#data_file').filebox('files');

                    if($.extends.isEmpty(files)){
                        $.app.show(t('configs.msg.file.required'));
                        return false;
                    }

                    $.easyui.file.getReader(function(e){
                        param.Data = this.result;
                        console.log(param.Data);
                        doFn(param);
                    }).readAsText(files[0], "utf-8")
                }
            }
        }, null, 540, 900);

    }, node, id)
}

function updateTags(id, inspect){
    if($.extends.isEmpty(id)){
        let rows = $('#configsDg').datagrid('getChecked');

        if(rows.length>1){
            $.app.show(t('configs.msg.onlyOne.editMetadata'));
            return ;
        }

        if(rows.length==0){
            $.app.show(t('configs.msg.pickOne.editMetadata'));
            return;
        }else{
            id = rows[0].ID;
        }
    }

    let node = local_node;

    $.docker.request.config.inspect(function (response){

        let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <div style="margin-top:5px">      
                        <div class="cubeui-row" title="${t('configs.dialog.labels.sectionTitle')}">
                            <fieldset>
                                <legend style="margin-bottom: 0px;">${t('configs.dialog.labels.sectionTitle')}</legend>
                            </fieldset>
                                            
                            <div class="cubeui-col-sm12 add-opt-div">
                                <div class="cubeui-row">
                                    <div class="cubeui-col-sm4 cubeui-col-sm-offset1" style="padding-right: 5px">
                                        <span style='line-height: 20px;padding-right:0px;'>${t('configs.label.key')}</span>
                                    </div>
                                    <div class="cubeui-col-sm5" >
                                        <span style='line-height: 20px;padding-right:0px;'>${t('configs.label.value')}</span>
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
                                               name='Labels-name' data-options="required:false,prompt:'${t("configs.prompt.labelKey")}'">
                                    </div>
                                    <div class="cubeui-col-sm5">
                                        <input type="text" data-toggle="cubeui-textbox" value="{{>prop}}"
                                               name='Labels-value' data-options="required:false,prompt:'${t("configs.prompt.labelValue")}'">
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

        $.docker.utils.optionConfirm(t('configs.dialog.labels.title'), null, html,
            function(param, closeFn){
                let labels = $.docker.utils.buildOptsData(param['Labels-name'],param['Labels-value']);

                $.docker.request.config.update_labels(function (response) {
                    $.app.show(t('configs.msg.labels.updated').format(response.Info.Spec.Name));

                    reloadDg();
                    if(inspect){
                        inspectConfig(id)
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

        $.app.confirm(t('configs.dialog.name.confirm'), function(){

            let name = $('#ConfigName').textbox('getValue');

            if($.extends.isEmpty(name)){
                $.app.show(t('configs.msg.name.required'));
                return false;
            }

            $.docker.request.config.update_name(function (response) {
                $.app.show(t('configs.msg.name.updated'));
                opts.flag = 1;
                $(btn).linkbutton({
                    text:t('configs.btn.edit'),
                    iconCls: 'fa fa-pencil-square-o'
                });

                $('#ConfigName').textbox('readonly', true);

                reloadDg();
                inspectConfig(id)
            }, node, id, name)
        })

    }else{
        opts.flag = 2;
        $('#ConfigName').textbox('readonly', false);
        $('#ConfigName').textbox('textbox').focus();
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



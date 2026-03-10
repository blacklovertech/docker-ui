function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) {
        return key;
    }
}

function __volumes_getI18n(){
    return (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
}

function __volumes_applyI18n(root){
    var i18n = __volumes_getI18n();
    if(i18n && i18n.apply){
        try{ i18n.apply(root || document); }catch(e){}
    }
}

function __volumes_setPlaceholder($el, text){
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

function __volumes_applyControlsI18n(){
    var i18n = __volumes_getI18n();
    if(!i18n || !i18n.t) return;

    var $searchType = $('#search_type');
    var $searchKey = $('#search_key');

    __volumes_setPlaceholder($searchType, i18n.t('common.prompt.searchTypeRequired'));
    __volumes_setPlaceholder($searchKey, i18n.t('common.prompt.searchKey'));

    try{
        var v = $searchType.combobox('getValue');
        $searchType.combobox('loadData', [
            {KEY:'name', TEXT:i18n.t('volumes.search.type.name')},
            {KEY:'label', TEXT:i18n.t('volumes.search.type.label')},
            {KEY:'dangling', TEXT:i18n.t('volumes.search.type.dangling')}
        ]).combobox('setValue', v || 'name');
    }catch(e){}
}

function __volumes_applyGridI18n(){
    try{
        __volumes_applyI18n($('#volumesDg').datagrid('getPanel'));
    }catch(e){}
}

function __volumes_updateOpenPanelTitle(){
    var i18n = __volumes_getI18n();
    if(!i18n || !i18n.t) return;

    try{
        var p = $('#layout').layout('panel','east');
        if(!p || !p.length) return;

        if(window.__volume_panel_mode === 'inspect' && window.__volume_inspect_row){
            p.panel('setTitle', i18n.t('volumes.panel.inspect.titleformat', window.__volume_inspect_row.Name));
        }else if(window.__volume_panel_mode === 'add'){
            p.panel('setTitle', i18n.t('volumes.panel.add.title'));
        }
        __volumes_applyI18n(p[0]);
    }catch(e){}
}

function __volumes_bindLangChanged(){
    try{
        $(document).off('app:langChanged.volumes').on('app:langChanged.volumes', function(){
            __volumes_applyControlsI18n();
            try{ $('#volumesDg').datagrid('reload'); }catch(e){}
            __volumes_applyGridI18n();
            __volumes_updateOpenPanelTitle();
        });
    }catch(e2){}
}

function __volumes_applyAddFormI18n(){
    var i18n = __volumes_getI18n();
    if(!i18n || !i18n.t) return;
    try{
        __volumes_setPlaceholder($('input[name=Name]'), i18n.t('volumes.prompt.nameRequired'));
        __volumes_setPlaceholder($('input[name=Driver]'), i18n.t('volumes.prompt.driverRequired'));
    }catch(e){}
}

function loadLease(){

    // let node = $.docker.menu.getCurrentTabAttachNode();
    let node = local_node;

    $(function(){
        $("#volumesDg").iDatagrid({
            idField: 'ID',
            sortOrder:'asc',
            sortName:'Name',
            pageSize:50,
            frozenColumns:[[
                {field: 'ID', title: '', checkbox: true},
                {field: 'op', title: '<span data-i18n="common.col.operation">操作</span>', sortable: false, halign:'center',align:'center',
                    width: 150, formatter:leaseOperateFormatter},
                {field: 'Name', title: 'VOLUME NAME', sortable: true,
                    formatter:$.iGrid.buildformatter([$.iGrid.templateformatter('{Name}'), $.iGrid.tooltipformatter()]),
                    width: 390},
            ]],
            onBeforeLoad:function (param){
                console.log(param)
                refreshLease(param)
            },
            columns: [[
                {field: 'Driver', title: 'DRIVER', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 90},
                {field: 'Scope', title: 'SCOPE', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 90},
                {field: 'Created', title: 'CREATED', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),
                    width: 220},
                {field: 'Mountpoint', title: 'MOUNT POINT', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 450},
                {field: 'LabelStr', title: 'LABELS', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 900},
                {field: 'OptionStr', title: 'Options', sortable: true,
                    formatter:$.iGrid.tooltipformatter(),width: 900}

            ]],
            onLoadSuccess:$.easyui.event.wrap(
                $.fn.iDatagrid.defaults.onLoadSuccess,
                function(data){
                }
            ),
        });

        __volumes_bindLangChanged();
        __volumes_applyControlsI18n();
        __volumes_applyGridI18n();
        __volumes_applyI18n(document);
    });
}

function leaseOperateFormatter(value, row, index) {
    let htmlstr = "";
    htmlstr += '<button class="layui-btn-yellowgreen layui-btn layui-btn-xs" onclick="inspectLease(\'' + index + '\')">' + t('volumes.btn.view') + '</button>';
    htmlstr += '<button class="layui-btn-gray layui-btn layui-btn-xs" onclick="removeLease(\'' + row.ID + '\')">' + t('volumes.btn.delete') + '</button>';

    return htmlstr;
}

function refreshLease(param){
    let pageSize = $.docker.utils.getPageRowsFromParam(param);
    
    let skip = $.docker.utils.getSkipFromParam(param);

    //let node = $.v3browser.menu.getCurrentTabAttachNode();
    let node = local_node;

    $.docker.request.volume.list(function (response) {
        $('#volumesDg').datagrid('loadData', {
            total: response.total,
            rows: response.list
        })
    }, node, skip, pageSize, true, param.search_type, param.search_key, param.sort, param.order);
}

function removeLease(leaseId) {
    let node = local_node;

    if($.extends.isEmpty(leaseId)){
        let rows = $('#volumesDg').datagrid('getChecked');

        if(rows.length == 0) {
            $.app.alert(t('volumes.msg.remove.pick'))
        }else{
            $.docker.utils.deleteConfirm(t('volumes.dialog.remove.title'), t('volumes.dialog.remove.confirmSelected'), function (param, closeFn){

                let ids = $.extends.collect(rows, function(r){
                    return r.ID;
                });

                $.docker.request.volume.deleteBulk(function(response){
                    let msg = '';
                    if(response.fail.length==0){
                        msg = t('volumes.msg.remove.bulkSuccess', response.ok.length);
                    }else{
                        msg = t('volumes.msg.remove.bulkPartial', response.ok.length, response.fail.length);
                    }

                    reloadDg()
                    closeFn()

                    $.app.show(msg)

                }, node, ids, param.force==="1")
            })
        }

    }else{
        $.docker.utils.deleteConfirm(t('volumes.dialog.remove.title'), t('volumes.dialog.remove.confirmSingle'), function (param, closeFn){
            $.docker.request.volume.delete(function(response){

                let msg = t('volumes.msg.remove.singleSuccess', leaseId);
                $.app.show(msg)

                reloadDg()
                closeFn()
            }, node, leaseId, param.force==="1")
        })
    }
}

function emptyLease(){
    let node = local_node;
    let html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>${t('volumes.dialog.prune.options')}</legend>
                    </fieldset>
                    <div style="margin-top:5px">
                
                        <div class="cubeui-row">
                            <span style='line-height: 30px;padding-right:0px'><b>${t('volumes.dialog.prune.labelFilter')}</b>(${t('volumes.dialog.prune.labelFilterTip')})</span>
                        </div>
                        <div class="cubeui-row">
                            <span style='line-height: 20px;padding-right:0px;color: red'>${t('volumes.dialog.prune.labelFormatHint')}</span>
                        </div>
                        <div class="cubeui-row">
                            <input type="text" data-toggle="cubeui-textbox" name="labels"
                                   value='' data-options="required:false,prompt:'${t('volumes.prompt.prune.labels')}'">
                        </div>
                    </div>
                </div>
        `;

    $.docker.utils.optionConfirm(t('volumes.dialog.prune.title'), t('volumes.dialog.prune.warn'), html,
        function(param, closeFn){

            $.docker.request.volume.prune(function(response){
                let msg = t('volumes.msg.prune.success', response.Count, response.Size)

                closeFn();

                $.app.show(msg)
                reloadDg()
            }, node, param.labels)
        })
}

function reloadDg(){
    $('#volumesDg').datagrid('reload');
    refreshVolumeInfo()
}

function inspectLease(idx){
    showVolumePanel(idx)
}

function addLease(){


    let rowData = {};

    $('#layout').layout('remove', 'east');

    let east_layout_options = {
        region:'east',
        split:false,border:false,width:'100%',collapsed:true,
        iconCls:'fa fa-database',
        titleformat:t('volumes.panel.add.title'), title:t('volumes.panel.title'),
        headerCls:'border_right',bodyCls:'border_right',collapsible:true,
        footerHtml:`
             <a  href="javascript:void(0)" data-toggle="cubeui-menubutton" data-options="{
                onClick:function(){
                    save()
                },
                btnCls: 'cubeui-btn-orange',
                iconCls: 'fa fa-plus-square-o'
            }"><span data-i18n="common.btn.create">创建</span></a>
             <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
                onClick:function(){
                        $('#layout').layout('collapse', 'east');
                },
                btnCls: 'cubeui-btn-red',
                iconCls: 'fa fa-close'
            }"><span data-i18n="common.btn.close">关闭</span></a>
            `,
        render:$('#addVolumeTpl').html()
    }

    $.docker.utils.ui.showSlidePanel($('#layout'), east_layout_options)
    window.__volume_panel_mode = 'add';
    window.__volume_inspect_row = null;
    setTimeout(function(){
        __volumes_applyAddFormI18n();
        try{ __volumes_applyI18n($('#layout').layout('panel','east')[0]); }catch(e){}
    }, 0);
    let opts = $.iLayout.getLayoutPanelOptions('#layout',  'east');
    console.log(opts)

    return ;
}

function save(){

    let node = local_node;

    if($('#addVolumeForm').form('validate')){

        let info = $.extends.json.param2json($('#addVolumeForm').serialize());
        console.log(info)



        let driverOpts = $.docker.utils.buildOptsData(info['driver-opt-name'],info['driver-opt-value']);
        let labels = $.docker.utils.buildOptsData(info['label-name'],info['label-value']);

        $.docker.request.volume.create(function (response) {
            $.app.show(t('volumes.msg.create.success', info.Name))
            reloadDg()
            $('#layout').layout('collapse', 'east');

        }, node, info.Name, info.Driver, driverOpts, labels)

    }
}

function showVolumePanel(index){
    let rowData = $('#volumesDg').datagrid('getRows')[index]
    let id = rowData.ID;
    let node = local_node;
    $.docker.request.volume.inspect(function (response){
        rowData = response;

        $('#layout').layout('remove', 'east');

        let east_layout_options = {
            region:'east',
            split:false,border:false,width:'100%',collapsed:true,
            iconCls:'fa fa-database',
            titleformat:t('volumes.panel.inspect.titleformat', rowData.Name), title:t('volumes.panel.title'),
            headerCls:'border_right',bodyCls:'border_right',collapsible:true,
            footerTpl1:'#footerTpl',
            footerHtml:`
             <a  href="javascript:void(0)" data-toggle='cubeui-menubutton' data-options="{
                onClick:function(){
                        $('#layout').layout('collapse', 'east');
                },
                btnCls: 'cubeui-btn-red',
                iconCls: 'fa fa-close'
            }"><span data-i18n="common.btn.close">关闭</span></a>
            `,
            render:$.templates(html_template).render(rowData)
        }

        $.docker.utils.ui.showSlidePanel($('#layout'), east_layout_options)
        window.__volume_panel_mode = 'inspect';
        window.__volume_inspect_row = rowData;
        __volumes_applyI18n($('#layout').layout('panel','east')[0]);
        let opts = $.iLayout.getLayoutPanelOptions('#layout',  'east');
        console.log(opts)

    }, node, id)
}

let html_template = `    
<div style="margin: 0px;">
</div>

<div class="cubeui-fluid">
    <fieldset>
        <legend data-i18n="volumes.form.legend">数据卷信息</legend>
    </fieldset>
    <div class="cubeui-row">
        <div class="cubeui-col-sm12">
            <label class="cubeui-form-label" data-i18n="volumes.form.name">数据卷:</label>
            <div class="cubeui-input-block">
                <input type="text" data-toggle="cubeui-textbox" name="Name" readonly
                       value='{{>Name}}'
                       data-options="
                            "
                >
            </div>
        </div>
    </div>

    <div class="cubeui-row">
        <div class="cubeui-col-sm12">
            <label class="cubeui-form-label" data-i18n="volumes.form.mountpoint">Mountpoint:</label>
            <div class="cubeui-input-block">

                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                       value='{{>Mountpoint}}'
                       data-options="
                            "
                >
            </div>
        </div>
    </div>

    <div class="cubeui-row">
        <div class="cubeui-col-sm12">
            <label class="cubeui-form-label" data-i18n="volumes.form.scope">Scope:</label>
            <div class="cubeui-input-block">

                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                       value='{{>Scope}}'
                       data-options="
                            "
                >
            </div>
        </div>
    </div>

    <div class="cubeui-row">
        <div class="cubeui-col-sm12">
            <label class="cubeui-form-label" data-i18n="volumes.form.createdAt">CreatedAt:</label>
            <div class="cubeui-input-block">

                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                       value='{{>Created}}'
                       data-options="
                            "
                >
            </div>
        </div>
    </div>

    <div class="cubeui-row">
        <div class="cubeui-col-sm12">
            <label class="cubeui-form-label" data-i18n="volumes.form.driver">数据卷驱动:</label>
            <div class="cubeui-input-block">

                <input type="text" data-toggle="cubeui-textbox" name="Driver" readonly
                       value='{{>Driver}}'
                       data-options="
                            "
                >
            </div>
        </div>
    </div>

    <fieldset>
        <legend style="margin-bottom: 0px;" data-i18n="volumes.section.driverOpts">驱动选项</legend>
    </fieldset>

    <div class="cubeui-row">
        <div class="cubeui-col-sm12">
            <div class="cubeui-row">
                <div class="cubeui-col-sm4 cubeui-col-sm-offset2" style="padding-right: 5px">
                    <span style='line-height: 20px;padding-right:0px;' data-i18n="volumes.label.option">选项</span>
                </div>
                <div class="cubeui-col-sm5" >
                    <span style='line-height: 20px;padding-right:0px;' data-i18n="common.label.value">值</span>
                </div>
            </div>
            {{props Options}}
            <div class="cubeui-row">
                <div class="cubeui-col-sm4 cubeui-col-sm-offset2" style="padding-right: 5px">
                    <input type="text" data-toggle="cubeui-textbox" readonly
                           value='{{>key}}' data-options="required:false,prompt:&quot;{{:~t('volumes.prompt.leaseIdOptional')}}&quot;">
                </div>
                <div class="cubeui-col-sm5">
                    <input type="text" data-toggle="cubeui-textbox" readonly
                           value='{{>prop}}' data-options="required:false,prompt:&quot;{{:~t('volumes.prompt.leaseIdOptional')}}&quot;">
                </div>
            </div>
            {{/props}}
        </div>
    </div>

    <fieldset>
        <legend style="margin-bottom: 0px;" data-i18n="volumes.section.labels">标签选项</legend>
    </fieldset>

    <div class="cubeui-row">
        <div class="cubeui-col-sm12">
            <div class="cubeui-row">
                <div class="cubeui-col-sm4 cubeui-col-sm-offset2" style="padding-right: 5px">
                    <span style='line-height: 20px;padding-right:0px;' data-i18n="common.label.key">标签</span>
                </div>
                <div class="cubeui-col-sm5" >
                    <span style='line-height: 20px;padding-right:0px;' data-i18n="common.label.value">值</span>
                </div>
            </div>
            {{props Labels}}
            <div class="cubeui-row">
                <div class="cubeui-col-sm4 cubeui-col-sm-offset2" style="padding-right: 5px">
                    <input type="text" data-toggle="cubeui-textbox" readonly
                           value='{{>key}}' data-options="required:false,prompt:&quot;{{:~t('volumes.prompt.leaseIdOptional')}}&quot;">
                </div>
                <div class="cubeui-col-sm5">
                    <input type="text" data-toggle="cubeui-textbox" readonly
                           value='{{>prop}}' data-options="required:false,prompt:&quot;{{:~t('volumes.prompt.leaseIdOptional')}}&quot;">
                </div>
            </div>
            {{/props}}
        </div>
    </div>



</div>

`
function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) { return key; }
}

let menuContextRow = null;

function setCurrentMenuRow(row){
    menuContextRow = row;
}

function getCurrentMenuRow(row){
    return menuContextRow;
}

function closeOuterDialog(buttonObj, YES){
    if(YES){
        let did = $.iDialog.findDialogId4Button(buttonObj);
        if(!$.extends.isEmpty(did) && !$.extends.isEmpty($('#'+did))){
            $('#'+did)[0].YES = true;
        }else{
            did = $.iDialog.findOutterDialogJquery(buttonObj);

            if(!$.extends.isEmpty(did)){
                did[0].YES = true;
            }
        }
    }
    $.iDialog.closeDialog4Btn(buttonObj)
}

function createService(){
    let node = local_node;

    $.iDialog.openDialog({
        title: t('orchestrator.dialog.service.add.title'),
        id:'addServiceDlg',
        iconCls:'fa fa-circle-o-notch',
        minimizable:false,
        width: 600,
        height: 440,
        href:'./add-service.html',
        render:function(opts, handler){
            let d = this;
            console.log("Open dialog");
            handler.render({})
        },
        leftButtonsGroup:[{
            text: t('orchestrator.dialog.searchRegistry'),
            iconCls: 'fa fa-search',
            btnCls: 'cubeui-btn-blue',
            handler1:'ajaxForm',
            handler:function(o){

                let dlgObj = $.iDialog.findOutterFormJquery(this)
                let imageName = $(dlgObj).find("input[name='fromImage']").val()

                $.iDialog.openDialog({
                    title: t('orchestrator.dialog.searchImage.title'),
                    minimizable:false,
                    id:'queryForm-search',
                    width: 1200,
                    height: 640,
                    href:'./search-image.html',
                    buttonsGroup: [{
                        text: t('orchestrator.dialog.searchImage.select'),
                        iconCls: 'fa fa-check-square-o',
                        btnCls: 'cubeui-btn-orange',
                        handler:'ajaxForm',
                        beforeAjax:function(o){
                            let rows = $('#searchImagesDg').datagrid('getSelections');

                            if($.extends.isEmpty(rows)){
                                $.app.show(t('orchestrator.msg.searchImage.pickOne'))
                                return false;
                            }

                            if(rows.length > 1){
                                $.app.show(t('orchestrator.msg.searchImage.onlyOne'))
                                return false;
                            }
                            setImageName(rows[0].name);
                            return false;
                        }
                    }],
                    render:function(opts, handler){
                        handler.render({"imageName":imageName})
                        let params = {}

                        if(!$.extends.isEmpty(imageName)){
                            params.search = 1;
                            params.term = imageName;
                        }

                        $(function () {
                            $("#searchImagesDg").iDatagrid({
                                idField: 'name',
                                sortOrder: 'desc',
                                sortName: 'star_count',
                                pageSize: 10,
                                queryParams:params,
                                onBeforeLoad:function (param){
                                    let p = param;

                                    if(!p.search){
                                        return ;
                                    }

                                    if($.extends.isEmpty(p.term)){
                                        $.app.show(t('orchestrator.msg.searchImage.noFilter'));
                                        return false;
                                    }

                                    let pageSize = $.docker.utils.getPageRowsFromParam(p);
                                    let skip = $.docker.utils.getSkipFromParam(p);

                                    let node = local_node;

                                    $.docker.request.image.search(function (response) {
                                            $('#searchImagesDg').datagrid('loadData', {
                                                total: response.total,
                                                rows: response.list
                                            })
                                        }, node, skip, pageSize,
                                        (p.is_official===null||p.is_official==='ALL')?null:p.is_official,
                                        (p.is_automated===null||p.is_automated=='ALL')?null:p.is_automated,
                                        p.stars===null?null:p.stars,
                                        p.term, p.sort, p.order);
                                },
                                onRowContextMenu:function(e, index, row){
                                    menuContextRow = row

                                    $('#searchImageMm').menu('show', {
                                        left: e.pageX,
                                        top: e.pageY
                                    });

                                    $.extends.stopPropagation(e);
                                    return false;
                                },
                                frozenColumns:[[
                                    {field: 'name', title: 'NAME', sortable: true,
                                        formatter:$.iGrid.tooltipformatter(),
                                        width: 300}
                                ]],
                                columns: [[
                                    {field: 'description', title: 'DESCRIPTION', sortable: true,
                                        formatter:$.iGrid.tooltipformatter(),width: 540},
                                    {field: 'star_count', title: 'STARS', sortable: true,
                                        formatter:$.iGrid.tooltipformatter(),width: 100},
                                    {field: 'official', title: 'OFFICIAL', sortable: true,
                                        formatter:$.iGrid.tooltipformatter(),width: 100},
                                    {field: 'automated', title: 'AUTOMATED', sortable: true,
                                        formatter:$.iGrid.tooltipformatter(),width: 120}
                                ]],
                            })
                        })
                    },
                })
            }
        }],
        buttonsGroup: [{
            text: t('common.btn.add'),
            iconCls: 'fa fa-plus-square-o',
            btnCls: 'cubeui-btn-orange',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
                o.ajaxData = $.extends.json.param2json(o.ajaxData);
                let info = o.ajaxData;

                console.log(info);

                let service = newServiceConfig();
                service.Name = info.Name.trim();
                if(addService2Root(service)){
                    showServicePanel(service);
                    closeOuterDialog(t);
                }else{
                    $.app.show(t('orchestrator.dialog.service.exists').format(service.Name));
                }

                return false;
            }
        }]
    });
}

function createNetwork(){
    let node = local_node;

    $.iDialog.openDialog({
        title: t('orchestrator.dialog.network.add.title'),
        iconCls:'fa fa-sitemap',
        id:'addNetworkDlg',
        minimizable:false,
        width: 960,
        height: 640,
        href:'./add-network.html',
        render:function(opts, handler){
            let d = this;
            console.log("Open dialog");
            let networkConfig = newNetworkConfig();
            handler.render(networkConfig)
        },
        buttonsGroup: [{
            text: t('common.btn.add'),
            iconCls: 'fa fa-plus-square-o',
            btnCls: 'cubeui-btn-orange',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
                o.ajaxData = $.extends.json.param2json(o.ajaxData);
                let info = o.ajaxData;

                console.log(info);

                let network = newNetworkConfig();
                network.Name = info.Name.trim();
                if(addNetwork2Root(network)){
                    //showNetworkPanel(service);
                    closeOuterDialog(t);
                }else{
                    $.app.show(t('orchestrator.dialog.network.exists').format(network.Name));
                }

                return false;
            }
        }]
    });
}


function createVolume(){
    let node = local_node;

    $.iDialog.openDialog({
        title: t('orchestrator.dialog.volume.add.title'),
        iconCls:'fa fa-tasks',
        id:'addVolumeDlg',
        minimizable:false,
        width: 960,
        height: 640,
        href:'./add-volume.html',
        render:function(opts, handler){
            let d = this;
            console.log("Open dialog");
            let networkConfig = newNetworkConfig();
            handler.render(networkConfig)
        },
        buttonsGroup: [{
            text: t('common.btn.add'),
            iconCls: 'fa fa-plus-square-o',
            btnCls: 'cubeui-btn-orange',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
                o.ajaxData = $.extends.json.param2json(o.ajaxData);
                let info = o.ajaxData;

                console.log(info);

                let volume = newVolumeConfig();
                volume.Name = info.Name.trim();
                if(addVolume2Root(volume)){
                    //showNetworkPanel(service);
                    closeOuterDialog(t);
                }else{
                    $.app.show(t('orchestrator.dialog.volume.exists').format(network.Name));
                }

                return false;
            }
        }]
    });
}

function setImageName(imageName){
    $('#addServiceDlg').find('#fromImage').textbox('setValue', imageName)
    $.iDialog.closeDialog('queryForm-search')
}

function createContextMenu(e, row){
    setCurrentMenuRow(row);

    if(row.data==null){
        $('#rootMm').menu('show', {
            left: e.pageX,
            top: e.pageY
        });

        $('#rootMm').menu('disableItem', $('#menuitem_service')[0]);
        $('#rootMm').menu('disableItem', $('#menuitem_volume')[0]);
        $('#rootMm').menu('disableItem', $('#menuitem_network')[0]);
        $('#rootMm').menu('disableItem', $('#menuitem_secret')[0]);
        $('#rootMm').menu('disableItem', $('#menuitem_config')[0]);
        $('#rootMm').menu('disableItem', $('#menuitem_extra')[0]);
        $('#rootMm').menu('disableItem', $('#menuitem_rename')[0]);
        $('#rootMm').menu('disableItem', $('#menuitem_empty')[0]);

        if(row.type == 'root'){
            $('#rootMm').menu('enableItem', $('#menuitem_service')[0]);
            $('#rootMm').menu('enableItem', $('#menuitem_volume')[0]);
            $('#rootMm').menu('enableItem', $('#menuitem_network')[0]);
            $('#rootMm').menu('enableItem', $('#menuitem_secret')[0]);
            $('#rootMm').menu('enableItem', $('#menuitem_config')[0]);
            $('#rootMm').menu('enableItem', $('#menuitem_extra')[0]);
            $('#rootMm').menu('enableItem', $('#menuitem_rename')[0]);
            $('#rootMm').menu('enableItem', $('#menuitem_empty')[0]);
        }
        else if(row.type == 'services'){
            $('#rootMm').menu('enableItem', $('#menuitem_service')[0]);
        }else if(row.type == 'volumes'){
            $('#rootMm').menu('enableItem', $('#menuitem_volume')[0]);
        }else if(row.type == 'networks'){
            $('#rootMm').menu('enableItem', $('#menuitem_network')[0]);
        }else if(row.type == 'secrets'){
            $('#rootMm').menu('enableItem', $('#menuitem_secret')[0]);
        }else if(row.type == 'configs'){
            $('#rootMm').menu('enableItem', $('#menuitem_config')[0]);
        }else if(row.type == 'extras'){
            $('#rootMm').menu('enableItem', $('#menuitem_extra')[0]);
        }
    }
}

function closePanel(){
    $('#orchestrator_main_layout').layout('collapse', 'east');
}

function restorePanel(dgId){

    $('#'+dgId).dialog('restore');
    $('#'+dgId).dialog('maximize');

    $('#'+dgId).dialog('restore');
    $('#'+dgId).dialog('maximize');
}

let dgMap = {};

function showServicePanel(serviceConfig){
    getTreeObj().treegrid('select', serviceConfig.id);
    let dgId = serviceConfig.id + "_dg";

    if(dgMap==null || dgMap[dgId] == null || $.extends.isEmpty($('#'+dgId))){

    }else{
        restorePanel(dgId);
        return false;
    }

    let node = local_node;

    $.iDialog.openDialog({
        title: t('orchestrator.dialog.service.edit.title'),
        iconCls:'fa fa-circle-o-notch',
        id: dgId,
        minimizable: true,
        maximized:true,
        width: 960,
        height: 640,
        href: './edit-service.html',
        onBeforeClose:function(){
            let dg = this;
            if(dg.YES){
                delete dg.YES;
                delete dgMap[dgId];
                return true;
            }else{
                $.app.confirm(t('orchestrator.dialog.service.closeConfirm'), function () {
                    dg.YES = true;
                    $(dg).dialog('close');
                })
                return false;
            }

            return false;
        },
        render: function (opts, handler) {
            let d = this;
            console.log("Open dialog");
            handler.render(serviceConfig);
            dgMap[dgId] = true;
        },
        buttonsGroup: [{
            text: t('orchestrator.dialog.service.cache'),
            iconCls: 'fa fa-save',
            btnCls: 'cubeui-btn-blue',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
                o.ajaxData = $.extends.json.param2json(o.ajaxData);
                let info = o.ajaxData;

                console.log(info);
                closeOuterDialog(t, true);

                return false;
            }
        }]
    });

    return false;
/*    let showFn = function(row){

        let title = "修改服务{0}".format(serviceConfig.Name);;
        let isAdd = true;

        $('#orchestrator_main_layout').layout('remove', 'east');

        let east_layout_options = {
            region:'east',
            split:false,border:false,width:'100%',collapsed:true,
            fit:true,
            iconCls:'fa fa-circle-o-notch',
            collapsible:false,
            showHeader1:false,
            titleformat:title,
            headerCls:'border_right',bodyCls:'border_right',
            footerHtml:$.templates(button_html).render(row),
            render:function (panel, option) {
                let html = './edit-service.html';
                $.docker.getHtml(html, null,function (html) {
                    let cnt = $($.templates(html).render(serviceConfig));
                    panel.append(cnt);
                    $.parser.parse(cnt);
                    //$('#orchestrator_main_layout').iLayout();

                    $('#eastTabs').tabs({
                        fit:true,
                        border:false,
                        bodyCls1:'border_right_none,border_bottom_none',
                        tabPosition1:'bottom',
                        narrow:true,
                        pill:true,
                    });

                })
            }
        }

        $.docker.utils.ui.showSlidePanel($('#orchestrator_main_layout'), east_layout_options)
        let opts = $.iLayout.getLayoutPanelOptions('#orchestrator_main_layout',  'east');
        console.log(opts)
    }

    showFn(serviceConfig);*/
}

function showNetworkPanel(networkConfig){
    getTreeObj().treegrid('select', networkConfig.id);
    let dgId = networkConfig.id + "_dg";

    if(dgMap==null || dgMap[dgId] == null || $.extends.isEmpty($('#'+dgId))){

    }else{
        restorePanel(dgId);
        return false;
    }

    let node = local_node;

    $.iDialog.openDialog({
        title: t('orchestrator.dialog.network.edit.title'),
        iconCls:'fa fa-sitemap',
        id: dgId,
        minimizable: true,
        maximized:true,
        width: 960,
        height: 640,
        href: './add-network.html',
        onBeforeClose:function(){
            let dg = this;
            if(dg.YES){
                delete dg.YES;
                delete dgMap[dgId];
                return true;
            }else{
                $.app.confirm(t('orchestrator.dialog.network.closeConfirm'), function () {
                    dg.YES = true;
                    $(dg).dialog('close');
                })
                return false;
            }

            return false;
        },
        render: function (opts, handler) {
            let d = this;
            console.log("Open dialog");
            handler.render(networkConfig);
            dgMap[dgId] = true;
        },
        buttonsGroup: [{
            text: t('orchestrator.dialog.network.cache'),
            iconCls: 'fa fa-save',
            btnCls: 'cubeui-btn-blue',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
                o.ajaxData = $.extends.json.param2json(o.ajaxData);
                let info = o.ajaxData;

                console.log(info);
                closeOuterDialog(t);

                return false;
            }
        }]
    });

    return false;
}

function showVolumePanel(volumeConfig){
    getTreeObj().treegrid('select', volumeConfig.id);
    let dgId = volumeConfig.id + "_dg";

    if(dgMap==null || dgMap[dgId] == null || $.extends.isEmpty($('#'+dgId))){

    }else{
        restorePanel(dgId);
        return false;
    }

    let node = local_node;

    $.iDialog.openDialog({
        title: t('orchestrator.dialog.volume.edit.title'),
        iconCls:'fa fa-tasks',
        id: dgId,
        minimizable: true,
        maximized:true,
        width: 960,
        height: 640,
        href: './add-volume.html',
        onBeforeClose:function(){
            let dg = this;
            if(dg.YES){
                delete dg.YES;
                delete dgMap[dgId];
                return true;
            }else{
                $.app.confirm(t('orchestrator.dialog.volume.closeConfirm'), function () {
                    dg.YES = true;
                    $(dg).dialog('close');
                })
                return false;
            }

            return false;
        },
        render: function (opts, handler) {
            let d = this;
            console.log("Open dialog");
            handler.render(volumeConfig);
            dgMap[dgId] = true;
        },
        buttonsGroup: [{
            text: t('orchestrator.dialog.volume.cache'),
            iconCls: 'fa fa-save',
            btnCls: 'cubeui-btn-blue',
            handler:'ajaxForm',
            beforeAjax:function(o){
                let t = this;
                o.ajaxData = $.extends.json.param2json(o.ajaxData);
                let info = o.ajaxData;

                console.log(info);
                closeOuterDialog(t);

                return false;
            }
        }]
    });

    return false;
}
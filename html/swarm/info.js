function t(key) {
    try {
        var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
        return i18n ? i18n.t.apply(i18n, arguments) : key;
    } catch (e) { return key; }
}

function rendSwarmPage(){
    $.docker.request.info(local_node, function (data) {
        let d = {};

        d.info = $.extend({}, data);
        d.info.swarm = {};
        if(data.Swarm && !$.extends.isEmpty(data.Swarm.NodeID)){
            d.info.swarm.status = 'On';
            d.info.swarm.custerid = d.info.Swarm.Cluster?(d.info.Swarm.Cluster.ID+t('swarmInfo.node.manager')):t('swarmInfo.node.worker');
            d.info.swarm.nodeid = d.info.Swarm.NodeID;
            d.info.swarm.address = d.info.Swarm.NodeAddr;
        }else{
            d.info.swarm.status = 'Off';
        }

        if(d.info.RegistryConfig.Mirrors){
            d.info.Mirrors = d.info.RegistryConfig.Mirrors.join(" ")
        }

        if(d.info.MemTotal && d.info.MemTotal/1000000000>1){
            d.info.MemTotal = (d.info.MemTotal/1000000000.0).toFixed(2) + ' G'
        }else if(d.info.MemTotal){
            d.info.MemTotal = (d.info.MemTotal/1000000.0).toFixed(2) + ' M'
        }

        $.docker.request.version(local_node, function (vdata) {
            d.version = $.extend({}, vdata);

            $.docker.request.info(local_node, function (data) {

                APP.renderBody("#tmpl1", d);
                try {
                    var i18n = (window.APP && window.APP.i18n) ? window.APP.i18n : window.APP_I18N;
                    if (i18n && i18n.apply) { i18n.apply(document); }
                } catch (e) {}

                refreshSwarmData();

                let d1 = {};
                d1.info = $.extend({}, data);
                fillSwarmData(d1)

                $('#refreshBtn').switchbutton({
                    checked: true,
                    onText:'',offText:'',
                    onChange: function(checked){
                        console.log(checked);
                        if(checked){
                            let r = startSwarmInterval();
                            if(r){
                                $.app.show(t('swarmInfo.msg.autoRefresh.on'))
                            }
                        }else{
                            stopSwamInterval();
                            $.app.show(t('swarmInfo.msg.autoRefresh.off'))
                        }
                    }
                })

                startSwarmInterval()

            }, true);

        });
    })

    refreshSwarmInfo();
}

let swarm_handle = null

function stopSwamInterval(){
    if (swarm_handle){
        $.easyui.thread.stopLoop(swarm_handle)
    }
    swarm_handle = null
}

function startSwarmInterval(){
    if (swarm_handle){
        $.easyui.thread.stopLoop(swarm_handle)
    }

    swarm_handle = $.easyui.thread.loop(function (){
        refreshSwarmData();
    }, 5000)

    return swarm_handle
}

function fillSwarmData(data){


    if(data.info.Swarm && !$.extends.isEmpty(data.info.Swarm.Cluster)){
        $('#activeCount').text(data.info.Swarm.Nodes);
        $('#managerCount').text(data.info.Swarm.Managers);


        $('#imageCount').text(data.info.Images);
        $('#startCount').text(data.info.ContainersRunning);
        $('#containerCount').text(data.info.Containers);

    }else{

        if(data.info.Swarm && !$.extends.isEmpty(data.info.Swarm.NodeID)){
            $('#activeCount').text('N/A');
            $('#managerCount').text(t('swarmInfo.status.notManager'));
        }else{
            $('#activeCount').text('N/A');
            $('#managerCount').text(t('swarmInfo.status.noSwarm'));
        }

        $('#imageCount').text('N/A');
        $('#startCount').text('N/A');
        $('#containerCount').text('N/A');
        $('#TaskCount').text('N/A');
        $('#TaskTotal').text('N/A');
    }


    let isChanged = false;
    window.parent.$('.title-summary').hide()

    if(data.info.Images != window.parent.$('.title-image').text()
        || data.info.ContainersRunning != window.parent.$('.title-container').text()
        || data.info.Containers != window.parent.$('.title-container2').text()){
        isChanged = true
    }

    window.parent.$('.title-image').text(data.info.Images)
    window.parent.$('.title-container').text(data.info.ContainersRunning)
    window.parent.$('.title-container2').text(data.info.Containers)


    if(isChanged){
        window.parent.$('.title-summary').show()
    }

}

function refreshSwarmData(){
    $.docker.request.info(local_node, function (data) {
        let d = {};
        d.info = $.extend({}, data);
        fillSwarmData(d)

    }, true);

    refreshUsages();
    refreshConfigCount();
    refreshServiceCount();

    refreshSwarmInfo();
}

function refreshSwarmInfo(){
    $.docker.request.volume.listAll(local_node, function (data) {
        let total = 0;
        let count = 0;

        if(data.Volumes){
            $.each(data.Volumes, function (idx, v) {
                total ++;
                if(v.Driver == 'local'){
                    count ++;
                }
            })
        }

        $('#volumeCount').text(count);
        $('#volumeTotal').text(total);
        //window.parent.$('.title-volume').text(total);
        window.parent.$('.title-volume').text(total);
    }, true);
}

function leaveSwarm(){
    let node = local_node;

    let import_html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>${t('swarmInfo.dialog.leave.legend')}</legend>
                    </fieldset>

                    <div style="margin-top:5px">    
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm3">
                                    <label class="cubeui-form-label" title="${t('swarmInfo.dialog.leave.force')}">${t('swarmInfo.dialog.leave.force')}</label>
                                    <div class="cubeui-input-block">
                                        <input data-toggle="cubeui-switchbutton"
                                            name="force" value="1" data-options="onText:'',offText:'',width:60">
                                    </div>
                                </div>
                            </div> 
                            
                            
                    </div>
                </div>
        `;

    $.docker.utils.optionConfirm(t('swarmInfo.dialog.leave.title'), t('swarmInfo.dialog.leave.confirm'), import_html,
        function(param, closeFn) {
            console.log(param)

            $.docker.request.swarm.leave(function (json, xhr, state) {
                $.app.info(t('swarmInfo.msg.leave.success'), function () {
                    closeFn();
                    window.location.reload()
                })
            }, node, param.force==1);

        }, null, 480, 750)
}

function copyToken(obj){
    let t = $(obj);

    let token = t.parent().find('t').text();

    $.extends.copyToClipBoard(token, function () {
        $.app.show(t('common.msg.copy.success'))
    },function () {
        $.app.show(t('common.msg.copy.fail'))
    })
}

function openTokenDlg(){
    let node = local_node;
    $.docker.request.swarm.inspect(function (response) {

        $.docker.request.info(node, function (res) {

            if($.extends.isEmpty(res.Swarm.RemoteManagers)){
                $.app.show(t('swarmInfo.msg.notManager'));
                return false;
            }

            let advertises = [];
            $.each(res.Swarm.RemoteManagers, function (idx, v) {
                advertises.push(v.Addr)
            })

            advertises = advertises.join(",");

            let import_html = `
                    <div style="margin: 0px;">
                    </div>
                    <div class="cubeui-fluid showtoken">
                        <fieldset>
                            <legend>${t('swarmInfo.dialog.token.title')}</legend>
                        </fieldset>
    
                        <div style="margin-top:5px">
                                <div class="cubeui-row" style="margin-top: 5px">
                                    <div class="cubeui-col-sm12" style="margin-top: 5px">
                                        <label class="cubeui-form-label" title="${t('swarmInfo.dialog.join.advertise')}">
                                        Advertise:
                                        </label>
                                        
                                        <div class="cubeui-input-block">
                                        <span><t class="textspan">{2}</t>
                                           <button type='button' style='float: right;' class="layui-btn-blue layui-btn layui-btn-xs" onclick="copyToken(this);">${t('common.btn.copy')}</button>
                                        </span>
                                        </div>
                                    </div>  
                                    
                                    <div class="cubeui-col-sm12" style="margin-top: 5px">
                                        <label class="cubeui-form-label" title="${t('swarmInfo.dialog.token.worker')}">
                                        ${t('swarmInfo.dialog.token.worker')}
                                        </label>
                                        
                                        <div class="cubeui-input-block">
                                        <span><t>{0}</t>
                                           <button type='button' style='float: right;' class="layui-btn-blue layui-btn layui-btn-xs" onclick="copyToken(this);">${t('common.btn.copy')}</button>
                                        </span>
                                        </div>
                                    </div>  
                                    
                                    
                                    <div class="cubeui-col-sm12" style="margin-top: 15px">
                                        <label class="cubeui-form-label" title="${t('swarmInfo.dialog.token.manager')}">
                                        ${t('swarmInfo.dialog.token.manager')}</label>
                                        <div class="cubeui-input-block">
                                        <span><t>{1}</t>
                                        <button type='button' style='float: right;' class="layui-btn-orange layui-btn layui-btn-xs" onclick="copyToken(this);">${t('common.btn.copy')}</button>
                                        </span>
                                        </div>
                                    </div>
                                </div>
                                
                        </div>
                    </div>
            `.format(response.JoinTokens.Worker, response.JoinTokens.Manager, advertises);

            $.docker.utils.optionConfirm(t('swarmInfo.dialog.token.title'), null, import_html, function(param, closeFn) {
                closeFn();
            }, null, null, 800);
        })

    }, node)
}

function openJoinSwarmDlg(){

    let node = local_node;

    let import_html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>${t('swarmInfo.dialog.join.legend')}</legend>
                    </fieldset>

                    <div style="margin-top:5px">
                            <div class="cubeui-row" style="margin-top: 5px">
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.join.advertise')}</label>
                                    <div class="cubeui-input-block">
                                        <input  data-toggle="cubeui-textbox" name="AdvertiseAddr" data-options="
                                            prompt:'${t('swarmInfo.dialog.join.advertisePrompt')}',                                            
                                            required:true,
                                            " >  
                                    </div>
                                </div>  
                                
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.join.listen')}</label>
                                    <div class="cubeui-input-block">
                                        <input type="text" data-toggle="cubeui-textbox" name="ListenAddr"
                                               value='0.0.0.0:2377'
                                               data-options="
                                                        required:true,prompt:'${t('swarmInfo.dialog.join.listenPrompt')}'
                                                        "
                                        >
                                    </div>
                                </div>
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px;">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.join.dataPath')}</label>
                                    <div class="cubeui-input-block">
                                        <input  data-toggle="cubeui-textbox" name="DataPathAddr" data-options="
                                            prompt:'${t('swarmInfo.dialog.join.dataPathPrompt')}',                                            
                                            required:false,
                                            " >  
                                    </div>
                                </div>  
                                
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px;">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.join.managerAddr')}</label>
                                    <div class="cubeui-input-block">
                                        <input  data-toggle="cubeui-textbox" name="RemoteAddrs" data-options="
                                            prompt:'${t('swarmInfo.dialog.join.managerAddrPrompt')}',                                            
                                            required:true,
                                            " >  
                                    </div>
                                </div>  
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px;">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.join.token')}</label>
                                    <div class="cubeui-input-block">
                                        <input  data-toggle="cubeui-textbox" name="JoinToken" data-options="
                                            prompt:'${t('swarmInfo.dialog.join.tokenPrompt')}',     
                                            multiline:true,                                       
                                            required:true,
                                            height:60,
                                            " >  
                                    </div>
                                </div>  
                                
                            </div>
                            
                    </div>
                </div>
        `;

    $.docker.utils.optionConfirm(t('swarmInfo.dialog.join.title'), t('swarmInfo.dialog.join.confirm'), import_html,
        function(param, closeFn) {
            console.log(param)

            if ($.extends.isEmpty(param.AdvertiseAddr)) {
                $.app.show(t('swarmInfo.msg.join.advertiseRequired'))
                return false;
            }

            if ($.extends.isEmpty(param.JoinToken)) {
                $.app.show(t('swarmInfo.msg.join.tokenRequired'))
                return false;
            }

            if ($.extends.isEmpty(param.RemoteAddrs)) {
                $.app.show(t('swarmInfo.msg.join.managerRequired'))
                return false;
            }

            let values = param.RemoteAddrs.split2(" ")

            if($.extends.isEmpty(values)) {
                $.app.show(t('swarmInfo.msg.join.managerRequired'))
                return false;
            }

            let data = {
                Spec:{

                }
            };

            data.RemoteAddrs = values;

            data.AdvertiseAddr = param.AdvertiseAddr;

            if(!$.extends.isEmpty(param.ListenAddr)){
                data.ListenAddr = param.ListenAddr;
            }

            if(!$.extends.isEmpty(param.DataPathAddr)){
                data.DataPathAddr = param.DataPathAddr;
            }

            data.JoinToken = param.JoinToken;


            $.docker.request.swarm.join(function (json, xhr, state) {
                $.app.info(t('swarmInfo.msg.join.success'), function () {
                    closeFn();
                    window.location.reload()
                })
            }, node, data);

        }, null, 480, 750)
}

function openInitSwarmDlg(){

    let node = local_node;

    let import_html = `
                <div style="margin: 0px;">
                </div>
                <div class="cubeui-fluid">
                    <fieldset>
                        <legend>${t('swarmInfo.dialog.init.legend')}</legend>
                    </fieldset>

                    <div style="margin-top:5px">
                            <div class="cubeui-row" style="margin-top: 5px">
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.init.advertise')}</label>
                                    <div class="cubeui-input-block">
                                        <input  data-toggle="cubeui-textbox" name="AdvertiseAddr" data-options="
                                            prompt:'${t('swarmInfo.dialog.join.advertisePrompt')}',                                            
                                            required:true,
                                            " >  
                                    </div>
                                </div>  
                                
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.init.listen')}</label>
                                    <div class="cubeui-input-block">
                                        <input type="text" data-toggle="cubeui-textbox" name="ListenAddr"
                                               value='0.0.0.0:2377'
                                               data-options="
                                                        required:true,prompt:'${t('swarmInfo.dialog.join.listenPrompt')}'
                                                        "
                                        >
                                    </div>
                                </div>
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px;">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.init.dataPath')}</label>
                                    <div class="cubeui-input-block">
                                        <input  data-toggle="cubeui-textbox" name="DataPathAddr" data-options="
                                            prompt:'${t('swarmInfo.dialog.join.dataPathPrompt')}',                                            
                                            required:false,
                                            " >  
                                    </div>
                                </div>  
                                
                                
                                <div class="cubeui-col-sm12" style="margin-top: 5px;">
                                    <label class="cubeui-form-label">
                                    ${t('swarmInfo.dialog.init.dataPort')}</label>
                                    <div class="cubeui-input-block">
                                        <input  data-toggle="cubeui-numberspinner" name="DataPathPort" data-options="
                                            prompt:'${t('swarmInfo.dialog.init.dataPortPrompt')}',                                            
                                            required:false,
                                            min:1014,
                                            max:49151
                                            " >  
                                    </div>
                                </div>  
                                
                            </div>
                            
                            <div class="cubeui-row">
                                <div class="cubeui-col-sm12" style="margin-top: 5px">
                                    <label class="cubeui-form-label">${t('swarmInfo.dialog.init.labels')}</label>
                                    <div class="cubeui-input-block">
                                        <input type="text" data-toggle="cubeui-textbox" name="Labels"
                                               value=''
                                               data-options="
                                                        required:false,prompt:'${t('swarmInfo.dialog.init.labelsPrompt')}'
                                                        "
                                        >
                                    </div>
                                </div> 
                            </div> 
                            
                            
                    </div>
                </div>
        `;

    $.docker.utils.optionConfirm(t('swarmInfo.dialog.init.title'), t('swarmInfo.dialog.init.confirm'), import_html,
        function(param, closeFn) {
            console.log(param)

            if ($.extends.isEmpty(param.AdvertiseAddr)) {
                $.app.show(t('swarmInfo.msg.init.advertiseRequired'))
                return false;
            }

            let data = {
                Spec:{

                }
            };
            data.AdvertiseAddr = param.AdvertiseAddr;

            if(!$.extends.isEmpty(param.ListenAddr)){
                data.ListenAddr = param.ListenAddr;
            }

            if(!$.extends.isEmpty(param.DataPathAddr)){
                data.DataPathAddr = param.DataPathAddr;
            }

            if(!$.extends.isEmpty(param.DataPathPort)){
                data.DataPathPort = param.DataPathPort;
            }

            if(!$.extends.isEmpty(param.Name)){
                data.Spec.Name = param.Name;
            }

            if(!$.extends.isEmpty(param.Labels)){
                let values = param.Labels.split2(" ")
                if(!$.extends.isEmpty(values)) {
                    data.Spec.labels = $.docker.utils.getKeyValue(values);
                }
            }

            $.docker.request.swarm.init(function (json, xhr, state) {
                $.app.info(t('swarmInfo.msg.init.success'), function () {
                    closeFn();
                    window.location.reload()
                })
            }, node, data);

        }, null, 480, 750)
}

function refreshConfigCount(){
    $.docker.request.config.total(function(response){
        $('#configCount').text(response.total)
    }, local_node, 0, 0);
}

function refreshServiceCount(){
    $.docker.request.service.total(function(response){
        $('#ServiceCount').text(response.total);
        let DesiredTasks = 0;
        let RunningTasks = 0
        $.each(response.list, function (idx, v) {
            DesiredTasks += $.extends.isEmpty(v.ServiceStatus.DesiredTasks, 0);
            RunningTasks += $.extends.isEmpty(v.ServiceStatus.RunningTasks, 0);
        });
        $('#ReplicasCount').text(DesiredTasks);
        $('#TaskCount').text(RunningTasks);


        $.docker.request.task.listTotal(function(response){
            $('#TaskTotal').text(response.total);
        }, local_node);

    }, local_node, 0, 0);
}

function onActivated(opts, title, idx){
    console.log('onActivated')
    refreshSwarmData();
    //refreshCharts();
}

try {
    $(document).off('app:langChanged.swarmInfo').on('app:langChanged.swarmInfo', function() {
        stopSwamInterval();
        rendSwarmPage();
    });
} catch (e) {}
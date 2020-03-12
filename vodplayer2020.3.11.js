/*
*
*/
var vodPlayerVer = "2020.03.11.01";
var vodConvivaClient = null;
var vodConvivaPlayerStateManager = null;
var isUseConvivaMonitor = true;
var isConvivaApiLoaded = false;
var systemFactory = null;

var isUseAliMonitor = true;
var isAliApiLoaded = false;
var isVodControlsLoaded = false;
var vodUrlProtocol = "https://";



var vodPlayerObjs = {};
vodPlayerObjs.fingerprintJsIsStarted = false;




var isFlashPlayer = true;
vodPlayerObjs.isLoadedOldH5Player = false;
vodPlayerObjs.fingerprintJsIsStarted = false;

var html5PlayBtnBottomleft = {};
var playerWidthAndHeight = {};
var flashPlayerList = [];

var currentMessage = "";
var isVodMobileUseBrowerUi = false;

function createVodPlayer(paras) {
    var container = document.getElementById(paras.divId);
    if(location.href.indexOf("https://")!==-1) {
        paras.isHttps = "true";
        vodPlayerObjs.isHttps = "true";
    }

    if(paras.isHttps !== "true") {
        vodUrlProtocol = "http://";
    }


    //移动端是否用浏览器自带UI
    if(isIPad()) {
        isVodMobileUseBrowerUi = true;
    }

    vodPlayerObjs[paras.divId] = paras;

    container.style.width = paras.w + "px";
    container.style.height = paras.h + "px";


    if(paras.isLeftBottom === "true") {
        paras.isLeftBottom = true;
    } else{
        paras.isLeftBottom = false;
    }

    if(paras.isAudio === "true") {
        paras.isAudio = true;
    } else{
        paras.isAudio = false;
    }




    if(isIPad() && paras.isAudio) {
        paras.h = 40;
    }

    if(paras.isLeftBottom) {
        html5PlayBtnBottomleft[paras.divId] = true;
    }

    playerWidthAndHeight[paras.divId] = {};
    playerWidthAndHeight[paras.divId].w = paras.w;
    playerWidthAndHeight[paras.divId].h = paras.h;

    flashPlayerList.push("flashplayer_" + paras.divId);

    //鑾峰彇cookie骞朵紶閫掓寚绾逛俊鎭�
    var Fingerprint = "";
    if(!getCookie_vdn("Fingerprint") && !vodPlayerObjs.fingerprintJsIsStarted){
        //鑾峰彇璁惧鎸囩汗淇℃伅
        getfingerprint2();
    } else{
        Fingerprint = getCookie_vdn("Fingerprint");
    }

    vodPlayerObjs.fingerprintJsIsStarted = true;

    if(!(/(iphone|ipad)/i.test(navigator.userAgent)) && isVodHlsJsSupported()  && paras.isAudio!=="true" && !paras.isAudio&&((navigator.userAgent.indexOf("rv:11")===-1)&&navigator.userAgent.indexOf("MSIE")===-1)) {

        if(vodPlayerObjs[paras.divId]) {
            clearInterval(vodPlayerObjs[paras.divId].vodTimer);
        }

        //若vdn重试超过4次，就给提示信息
        if(paras.vdnRetryNum && paras.vdnRetryNum>4) {
            showVodPlayerErrorMsg(paras);
            return;
        }

        if(vodPlayerObjs[paras.divId] && (vodPlayerObjs[paras.divId].video && vodPlayerObjs[paras.divId].video.hls || vodPlayerObjs[paras.divId].adCallsVideo)) {
            destroyH5VodHls(paras);

        }

        if(vodPlayerObjs[paras.divId] && vodPlayerObjs[paras.divId].video) {
            clearInterval(vodPlayerObjs[paras.divId].video.playedTimer);
        }


        if(typeof goldlog!="undefined" && goldlog["h5player_"+paras.divId] && typeof heartbeatStarted!=="undefined") {
            heartbeatStarted = false;
        }

        if(document.getElementById("h5player_"+paras.divId)) {
            removeH5VodPlayerEvents(paras.divId);
            if(isVodCanvasSupported(paras.divId)) {
                document.body.removeChild(document.getElementById("h5player_"+paras.divId));
                clearInterval(vodPlayerObjs[paras.divId].canvasDrawTimer);
            } else{
                container.removeChild(document.getElementById("h5player_"+paras.divId));
            }

            clearInterval(vodPlayerObjs[paras.divId].canvasDrawTimer);

        }


        container.innerHTML = "";


        vodPlayerObjs[paras.divId] = {};
        vodPlayerObjs[paras.divId] = paras;

        vodPlayerObjs[paras.divId].video = {};
        vodPlayerObjs[paras.divId].adCallsVideo = {};


        if(vodConvivaClient && vodConvivaClient.cleanupSession && vodPlayerObjs[paras.divId].convivaSessionKey!==undefined) {

            vodConvivaClient.cleanupSession(vodPlayerObjs[paras.divId].convivaSessionKey);
        }

        vodPlayerObjs[paras.divId].convivaSessionKey = undefined;

        //设置播放器的背景图片
        var bgImg = "cctv_html5player_bg_16X9.png";
        if(paras.h/paras.w > 1) {
            bgImg = "cctv_html5player_bg_9X16.png";
        }

        var container = document.getElementById(paras.divId);
        container.style.zIndex = "2";
        container.style.overflow = "hidden";
        var convivaJsApi1 = vodUrlProtocol + "js.player.cntv.cn/creator/conviva-core-sdk.min.js";
        var convivaJsApi2 = vodUrlProtocol + "js.player.cntv.cn/creator/conviva-html5native-impl2.js";
        var aliApiUrl = vodUrlProtocol + "js.player.cntv.cn/creator/html5player_analysis_lib.js";
        var workerUrl = vodUrlProtocol + "js.player.cntv.cn/creator/h5.worker?v=200113";
        var containerBgImg = vodUrlProtocol + "player.cntv.cn/html5Player/images/" + bgImg;

        var h5PlayerJs = vodUrlProtocol + "jstest.v.cntv.cn/page/vodplayer_controls.js";
        //var h5PlayerJs = "vodplayer_controls.js";

        vodPlayerObjs[paras.divId].title = "";

        //前贴广告
        vodPlayerObjs[paras.divId].adCalls = "";
        if(typeof ad_Calls === "string" && ad_Calls.length>2) {
            vodPlayerObjs[paras.divId].adCalls = decodeURIComponent(ad_Calls);

            if(vodPlayerObjs[paras.divId].adCalls.indexOf("?") > 0) {
                vodPlayerObjs[paras.divId].adCalls += "&cb=parseVodAdCallsDataFromApi";
            } else{
                vodPlayerObjs[paras.divId].adCalls += "?cb=parseVodAdCallsDataFromApi";
            }

            if(vodPlayerObjs[paras.divId].adCalls.indexOf("op=7")===-1) {
                vodPlayerObjs[paras.divId].adCalls = vodPlayerObjs[paras.divId].adCalls.replace(/(op=[0-9]*)/, "op=7");
            }
        }


        //暂停广告
        vodPlayerObjs[paras.divId].adPause = "";
        if(typeof ad_Pause === "string" && ad_Pause.length>2) {
            vodPlayerObjs[paras.divId].adPause = decodeURIComponent(ad_Pause);

            if(vodPlayerObjs[paras.divId].adPause.indexOf("?") > 0) {
                vodPlayerObjs[paras.divId].adPause += "";
            } else{
                vodPlayerObjs[paras.divId].adPause += "";
            }


            if(vodPlayerObjs[paras.divId].adPause.indexOf("op=7")===-1) {
                vodPlayerObjs[paras.divId].adPause = vodPlayerObjs[paras.divId].adPause.replace(/(op=[0-9]*)/, "op=7");
            }



        }


        //banner广告
        vodPlayerObjs[paras.divId].adBanner = "";
        if(typeof ad_Banner === "string" && ad_Banner.length>2) {
            vodPlayerObjs[paras.divId].adBanner = decodeURIComponent(ad_Banner);

            if(vodPlayerObjs[paras.divId].adBanner.indexOf("?") > 0) {
                vodPlayerObjs[paras.divId].adBanner += "&cb=parseVodAdBannerDataFromApi";
            } else{
                vodPlayerObjs[paras.divId].adBanner += "?cb=parseVodAdBannerDataFromApi";
            }

            if(vodPlayerObjs[paras.divId].adBanner.indexOf("op=7")===-1) {
                vodPlayerObjs[paras.divId].adBanner = vodPlayerObjs[paras.divId].adBanner.replace(/(op=[0-9]*)/, "op=7");
            }
        }


        //后贴广告
        vodPlayerObjs[paras.divId].adAfter = "";
        if(typeof ad_After === "string" && ad_After.length>2) {
            vodPlayerObjs[paras.divId].adAfter = decodeURIComponent(ad_After);

            if(vodPlayerObjs[paras.divId].adAfter.indexOf("?") > 0) {
                vodPlayerObjs[paras.divId].adAfter += "&cb=parseVodAdCallsDataFromApi";
            } else{
                vodPlayerObjs[paras.divId].adAfter += "?cb=parseVodAdCallsDataFromApi";
            }

            if(vodPlayerObjs[paras.divId].adAfter.indexOf("op=7")===-1) {
                vodPlayerObjs[paras.divId].adAfter = vodPlayerObjs[paras.divId].adAfter.replace(/(op=[0-9]*)/, "op=7");
            }
        }

        if(paras.isHttps === "true") {
            if(vodPlayerObjs[paras.divId].adCalls) {
                vodPlayerObjs[paras.divId].adCalls = vodPlayerObjs[paras.divId].adCalls.replace("http://", "https://");
            }

            if(vodPlayerObjs[paras.divId].adPause) {
                vodPlayerObjs[paras.divId].adPause = vodPlayerObjs[paras.divId].adPause.replace("http://", "https://");
            }

            if(vodPlayerObjs[paras.divId].adBanner) {
                vodPlayerObjs[paras.divId].adBanner = vodPlayerObjs[paras.divId].adBanner.replace("http://", "https://");
            }

            if(vodPlayerObjs[paras.divId].adAfter) {
                vodPlayerObjs[paras.divId].adAfter = vodPlayerObjs[paras.divId].adAfter.replace("http://", "https://");
            }
        }

        if(isIPad()) {
            container.style.backgroundImage = "url('" + containerBgImg + "')";
            container.style.backgroundSize = "100% 100%";
            container.style.backgroundRepeat = "no-repeat";
            container.style.backgroundPosition = "0px 0px";
            container.style.margin = "0 auto";
        } else{
            container.style.backgroundColor = "#000";
        }

        createVodVideoLoadingImg(paras);


        var vdnUrl = "";
        //设置播放器的背景图片
        var container = document.getElementById(paras.divId);
        //container.style.position = "relative";
        var bgImg = "cctv_html5player_bg_16X9.png";
        if(paras.h/paras.w > 1) {
            bgImg = "cctv_html5player_bg_9X16.png";
        }

        container.style.backgroundImage = "url('" + vodUrlProtocol + "player.cntv.cn/html5Player/images/" + bgImg + "')";
        vdnUrl = vodUrlProtocol + "vdn.apps.cntv.cn/api/getIpadVideoInfo.do?pid=" + paras.videoCenterId + "&tai=ipad&from=html5";

        container.style.backgroundSize = "100% 100%";
        container.style.backgroundRepeat = "no-repeat";
        container.style.backgroundPosition = "0px 0px";

        vodPlayerObjs[paras.divId].video = {};
        vodPlayerObjs[paras.divId].adCallsVideo = {};




        //对接口文档的新字段进行初始化；
        var vdn_tsp =new Date().getTime().toString().slice(0,10);
        var vdn_vn = "2049";
        var vdn_vc = "";
        var staticCheck = "47899B86370B879139C08EA3B5E88267";
        var vdn_uid = "";
        var vdn_wlan = "";

        //获取cookie
        if(typeof(getCookie_vdn)=="function"){
            if(!getCookie_vdn("Fingerprint")){
                //获取设备指纹信息
                if(typeof(getfingerprint2)=="function" && typeof(getfingerprint2)!="undefined" && !vodPlayerObjs.isFingerprintJsLoading){
                    getfingerprint2();
                }
            } else{
                vdn_uid = getCookie_vdn("Fingerprint");
            }
        }
        //md5加密  动态校验码
        var vdn_vc = md5((vdn_tsp+vdn_vn+staticCheck+vdn_uid)).toUpperCase();

        //添加新字段
        vdnUrl += "&tsp="+vdn_tsp + "&vn="+ vdn_vn + "&vc="+vdn_vc + "&uid="+vdn_uid + "&wlan="+vdn_wlan;

        vodPlayerObjs[paras.divId].isErrorDone = false;


        if(!vodPlayerObjs.isLoadWorker) {
            vodPlayerObjs.isLoadWorker = true;
            loadVodScript(workerUrl, null, null);
        }


        vodPlayerObjs.convivaJsLoaded = false;
        //加载conviva api并初始化
        vodPlayerObjs[paras.divId].vdn = {};
        vodPlayerObjs[paras.divId].vdn.vdnUrl = vdnUrl;

        if(typeof createVodHls !== "undefined") {
            loadVodScript(vdnUrl, parseVodDataFromVdn, paras, parseVodDataFromVdnWhenError, 10000);
            loadH5VodConviva(paras, convivaJsApi1, convivaJsApi2);
        } else{
            LazyLoad.js(h5PlayerJs, function(){
                loadVodScript(vdnUrl, parseVodDataFromVdn, paras, parseVodDataFromVdnWhenError, 10000);
                loadH5VodConviva(paras, convivaJsApi1, convivaJsApi2);
            });

            setTimeout(function () {
                if(typeof createVodHls === "undefined") {
                    loadVodScript(vdnUrl, parseVodDataFromVdn, paras, parseVodDataFromVdnWhenError, 10000);
                    loadH5VodConviva(paras, convivaJsApi1, convivaJsApi2);
                }
            }, 8000);
        }

        vodPlayerObjs.aliJsLoaded = false;

        if(!isAliApiLoaded && isUseAliMonitor) {
            isAliApiLoaded = true;
            LazyLoad.js(aliApiUrl, function(){
                vodPlayerObjs.aliJsLoaded = true;
            });
        }



        try{
            var containerObj = document.getElementById(paras.divId);
            var originalStyle = containerObj.style.cssText;

            if(!originalStyle || originalStyle.length<4) {
                originalStyle = "none";
            }



            if(document.getElementById(paras.divId)) {
                document.getElementById(paras.divId).setAttribute("originalStyle", originalStyle);
            }

        } catch (e) {

        }


    } else if(isIPad() || (paras.isAudio&&((navigator.userAgent.indexOf("rv:11")>0)||navigator.userAgent.indexOf("MSIE")===-1))) {
        var vdnUrl = vodUrlProtocol + "vdn.apps.cntv.cn/api/getIpadVideoInfo.do?pid=" + paras.videoCenterId + "&tai=ipad&from=html5";
        var jsUrl = vodUrlProtocol + "js.player.cntv.cn/creator/html5player_standard_multi.js";

        if(vodPlayerObjs.isHttps === "true") {
            vdnUrl = "https://vdn.apps.cntv.cn/api/getIpadVideoInfo.do?pid=" + paras.videoCenterId + "&tai=ipad&from=html5";
            jsUrl = "https://js.player.cntv.cn/creator/html5player_standard_multi.js";
        }

        if(vodPlayerObjs.isLoadedOldH5Player) {
            var isJsLoadedTimer = setInterval(function () {
                if(typeof commonHtml5Player === "function") {
                    clearInterval(isJsLoadedTimer);
                    commonHtml5Player(paras.divId,paras.w,paras.h,vdnUrl, paras.isAutoPlay, paras.posterImg, paras.isAudio);
                }
            }, 100);

        } else {
            vodPlayerObjs.isLoadedOldH5Player = true;
            var _doc = document.getElementsByTagName("head")[0];
            var jsLoader = createElementByType("script","jsH5PlayerLoader","absolute","0px","0px","0px","0px");
            jsLoader.src = jsUrl;
            _doc.appendChild(jsLoader);

            jsLoader.onload = function() {
                commonHtml5Player(paras.divId,paras.w,paras.h,vdnUrl, paras.isAutoPlay, paras.posterImg, paras.isAudio);
            };
        }



        document.addEventListener('visibilitychange', function() {
            var isHidden = document.hidden;
            var player = document.getElementById("html5Player-" + paras.divId);

            if(isHidden) {
                if(player) {
                    player.pause();
                }
            } else{

                if(player) {
                    //player.play();
                }
            }
        }, false);






    } else {

        if(!paras.isAudio || (navigator.userAgent.indexOf("MSIE")>0)  || (getChromeVersion()>=55&&flashChecker().v<23))
        {
            getFlashVer();
        }

        if(!isFlashPlayer && !isIPad())    {

            showInstallFlashPlayerMsg(paras.divId, paras.w, paras.h);
            return;
        }

        var playerUrl = vodUrlProtocol + "player.cntv.cn/standard/cntvplayerQC20190719.swf";

        if(paras.isAudio) {
            playerUrl = vodUrlProtocol + "player.cntv.cn/standard/cntvTheatreAudioPlayer.swf";

        }
        var version = "2019.07.02";
        var adversion = 'ad0.171.5.8.4.5.4';
        var widgetsConfigPath = vodUrlProtocol + "js.player.cntv.cn/xml/widgetsConfig/common.xml";
        //var languageConfigPath ="";
        var widgetsSwfPath = vodUrlProtocol + "player.cntv.cn/widgets/wg/WidgetButton20150514.swf";
        var widgetsXmlPath = vodUrlProtocol + "js.player.cntv.cn/xml/widgetsPlugXml/chinese.xml";
        var fo = null;

        if(IsMaxthon()) {
            fo = new SWFObject(playerUrl+"?v="+version+"&a="+Math.random(), "flashplayer_" + paras.divId, "100%", "100%", "10.0.0.0", "#000000");
        }else {
            fo = new SWFObject(playerUrl+"?v="+version, "flashplayer_" + paras.divId, "100%", "100%", "10.0.0.0", "#000000");
        }

        fo.addVariable("playerId", "flashplayer_" + paras.divId);
        if(paras.isAudio) {
            fo.addVariable("isAudio", true);
            fo.addVariable("pid",paras.videoCenterId);
        }


        if(typeof(ad_Wenzi)!="undefined") {
            fo.addVariable("adText", ad_Wenzi);
        }
        if(typeof(ad_Banner)!="undefined") {
            fo.addVariable("adBanner", ad_Banner);
        }
        if(typeof(ad_Calls)!="undefined") {
            fo.addVariable("adCalls",ad_Calls);
        }


        fo.addVariable("id", paras.id);
        fo.addVariable("videoId", paras.videoId);  //瑙嗛闆唅d
        fo.addVariable("articleId", paras.articleId);
        fo.addVariable("filePath", paras.filePath);
        fo.addVariable("sysSource", paras.sysSource);//瑙嗛鏉ユ簮
        fo.addVariable("channelId", paras.channelId);
        fo.addVariable("url", paras.url);//瑙嗛椤甸潰url锛屽http://tv.cntv.cn/video/C18472/a28126e5e0424a44af6a9bc4c5a47742
        fo.addVariable("scheduleId", paras.scheduleId);//鍏抽敭瀛�
        fo.addVariable("videoCenterId",paras.videoCenterId); //瑙嗛鐢熶骇涓績guid (蹇呰鍊�)
        fo.addVariable("isLogin", paras.isLogin);//鐢ㄦ埛涓績鐩稿叧
        fo.addVariable("userId", paras.userId);//鐢ㄦ埛涓績鐩稿叧
        fo.addVariable("wideMode", paras.wideMode);

        fo.addVariable("listMode", paras.listMode);
        fo.addVariable("nextTitle", paras.nextTitle);
        fo.addVariable("nextThumbnail", paras.nextThumbnail);
        fo.addVariable("setupOn", paras.setupOn);
        fo.addVariable("hasBarrage", paras.hasBarrage);
        fo.addVariable("barrageApp", paras.barrageApp);
        fo.addVariable("playerType", paras.playerType);
        fo.addVariable("webFullScreenOn", paras.webFullScreenOn);

        if(paras.isLeftBottom) {
            fo.addVariable("isLeftBottom", "true");
        }

        if(paras.posterImg.length > 3) {
            fo.addVariable("preImage", paras.posterImg);
        }


        if(paras.isVod4k === "true") {
            fo.addVariable("isVod4k", "true");
        }

        //鐢╤ttps鏂瑰紡
        if(paras.isHttps === "true") {
            fo.addVariable("https", "true");
        }

        fo.addVariable("adplayerPath", vodUrlProtocol + "player.cntv.cn/adplayer/cntvAdPlayer.swf?v="+adversion);
        fo.addVariable("pauseAdplayerPath", vodUrlProtocol + "player.cntv.cn/adplayer/cntvPauseAdPlayer.swf?v="+adversion);
        fo.addVariable("cornerAdplayerPath", vodUrlProtocol + "player.cntv.cn/adplayer/cntvCornerADPlayer.swf?v="+adversion);
        fo.addVariable("hotmapPath", vodUrlProtocol + "player.cntv.cn/standard/cntvHotmap.swf?v="+adversion);
        fo.addVariable("dynamicDataPath", vodUrlProtocol + "vdn.apps.cntv.cn/api/getHttpVideoInfo.do");
        fo.addVariable("floatLogoURL", vodUrlProtocol + "player.cntv.cn/flashplayer/logo/fhMaskLogo.png");
        fo.addVariable("qmServerPath", vodUrlProtocol + "log.player.cntv.cn/stat.html");


        fo.addVariable("usrOs", clientInfo.os);
        fo.addVariable("usrBroswer", clientInfo.browser+":"+clientInfo.broserVersion);
        fo.addVariable("screenInfo",window.screen.width+"*"+window.screen.height);
        fo.addVariable("platform",navigator.platform);
        fo.addVariable("isTianRun","true");


        fo.addVariable("isShowSmallWindow","true");
        fo.addVariable("widgetsConfig",widgetsConfigPath);
        //fo.addVariable("languageConfig", languageConfigPath);
        fo.addVariable("language", paras.language);
        fo.addVariable("logoImageURL", "");
        fo.addVariable("logoURL", vodUrlProtocol + "www.cntv.cn/");

        fo.addVariable("qmFrequency", "1");

        fo.addVariable("tai", paras.t);
        fo.addVariable("referrer", document.referrer);

        fo.addVariable("isUseDynamicData", "true");
        fo.addVariable("dynamicFrequency", "1.0");
        fo.addVariable("isProtected", "true");
        fo.addVariable("isP2pInstall","false");
        fo.addVariable("floatLogoTrigger", "false");

        fo.addVariable("isAutoPlay", paras.isAutoPlay);
        fo.addVariable("isDefaultPreImage", paras.isDefaultPreImage);


        fo.addVariable("isConviva","true");
        fo.addVariable("isAkamaiAnility","true");

        if(window.location.href.indexOf("cntv.cn")!=-1 || window.location.href.indexOf("cctv.com")!=-1) {
            fo.addVariable("useP2pMode","true");
        } else{
            fo.addVariable("useP2pMode","false");
        }



        //鎶婃寚绾逛俊鎭紶缁欐挱鏀惧櫒
        fo.addVariable("fingerprint",Fingerprint);
        fo.addParam("menu","false");
        fo.addParam("allowFullScreen", "true");
        fo.addParam("allowScriptAccess","always");

        fo.addParam("wmode", paras.wmode);

        writeFlashPlayer(fo, paras.divId);

        //播放器容器的原始样式
        try{
            var contanerObj = document.getElementById(paras.divId);
            var originalStyle = contanerObj.style.cssText;
            if(!originalStyle || originalStyle.length<4) {
                originalStyle = "none";
            }

            document.getElementById("flashplayer_" + paras.divId).setAttribute("originalStyle", originalStyle);
        } catch (e) {

        }

    }
}


function doLoadAliAnalyticsJs() {

    var jsLoader = createElementByType("script","convivaJs237","absolute","0px","0px","0px","0px");
    jsLoader.src = vodUrlProtocol + "js.data.cctv.com/__aplus_plugin_cctv.js,aplus_plugin_aplus_u.js";

    var _doc = document.getElementsByTagName('head')[0];
    _doc.appendChild(jsLoader);
}


function loadVodScript(src, cb, paras, errorCb, timeout, errorTimerout) {
    var _doc = document.getElementsByTagName("head")[0];
    var jsLoader= document.createElement('script');
    jsLoader.type= 'text/javascript';



    jsLoader.onload = function() {

        if(typeof cb === "function") {
            if(timeout && timeout<1000) {
                setTimeout(function () {
                    cb(paras);
                }, timeout);
            } else{
                cb(paras);
            }

        }
    };

    jsLoader.onerror = function() {

        if(typeof errorCb === "function") {
            errorCb(paras);
        }
    };
    jsLoader.src = src;
    _doc.appendChild(jsLoader);

    if(errorCb && (timeout && timeout>=1000 || errorTimerout&&errorTimerout>=1000)) {
        var tout = timeout>=1000 ? timeout : errorTimerout;

        setTimeout(function () {
            errorCb(paras);
        }, tout);
    }


}


function loadH5VodConviva(paras, convivaJsApi1, convivaJsApi2) {
    if(isUseConvivaMonitor) {

        if(!isConvivaApiLoaded && typeof Html5PlayerInterface === "undefined") {
            isConvivaApiLoaded = true;
            LazyLoad.js(convivaJsApi1, function(){
                LazyLoad.js(convivaJsApi2, function(){
                    vodPlayerObjs.convivaJsLoaded = true;
                    initVodConviva(paras);
                });
            });
        } else if(vodPlayerObjs.convivaJsLoaded || typeof Html5PlayerInterface !== "undefined"){
            initVodConviva(paras);
        } else{
            var checkConvivaCount = 0;
            vodPlayerObjs.loadConvivaTimer = setInterval(function () {
                checkConvivaCount++;
                if(checkConvivaCount > 50) {
                    clearInterval(vodPlayerObjs.loadConvivaTimer);
                }
                if(typeof Html5PlayerInterface !== "undefined") {
                    clearInterval(vodPlayerObjs.loadConvivaTimer);
                    initVodConviva(paras);
                }
            }, 200);
        }

    }

}

function isVodCanvasSupported(divId) {
    var isSupported = false;
    var canvas = document.getElementById("h5canvas_"+divId);
    if(canvas && canvas.getContext && isIPad()) {
        isSupported = true;
    }

    var ua = navigator.userAgent.toLowerCase();

    if(ua.indexOf("oppobrowser")>0 || ua.indexOf("firefox")>0 || ua.indexOf("liebao")>0 || ua.indexOf("oneplus")>0) {
        isSupported = false;
    }

    //强制不用canvas
    if(isVodMobileUseBrowerUi) {
        isSupported = false;
    }
    return isSupported;
}

function isVodHlsJsSupported() {
    var mediaSource = window.MediaSource || window.WebKitMediaSource;
    if (!mediaSource) {
        return false;
    }

    if(/(iphone|ipad)/i.test(navigator.userAgent)) {
        return false;
    }

    // var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    // if(isSafari){
    //     return false;
    // }
    var sourceBuffer = SourceBuffer || window.WebKitSourceBuffer;
    var isTypeSupported = mediaSource && typeof mediaSource.isTypeSupported === 'function' && mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"'); // if SourceBuffer is exposed ensure its API is valid
    // safari and old version of Chrome doe not expose SourceBuffer globally so checking SourceBuffer.prototype is impossible
    var sourceBufferValidAPI = !sourceBuffer || sourceBuffer.prototype && typeof sourceBuffer.prototype.appendBuffer === 'function' && typeof sourceBuffer.prototype.remove === 'function';
    return !!isTypeSupported && !!sourceBufferValidAPI;
}


function isWasmSupported() {
    try {
        if (typeof WebAssembly === "object"
            && typeof WebAssembly.instantiate === "function") {
            var module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (module instanceof WebAssembly.Module)
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
    } catch (e) {
    }
    return false;
}


function createVodVideoLoadingImg(paras) {


    var htmls = "";
    htmls = '<div id="loading_' + paras.divId + '" style="position:absolute;top:42%;margin:0 auto;text-align:center;width:100%;height:42px;cursor:pointer;z-index:20;display:none;">';
    htmls += '<img src="' + vodUrlProtocol + 'player.cntv.cn/html5Player/images/cctv_html5player_loading.gif" style="width:120px;height:42px;display:inline-block;">';
    htmls += '</div>';

    document.getElementById(paras.divId).insertAdjacentHTML("afterBegin", htmls);
}



function writeFlashPlayer(fo, divId) {


    if(typeof goldlog === "undefined" && !document.getElementById("convivaJs237")) {
        doLoadAliAnalyticsJs();
    }

    try{
        if(typeof(sns_userid)=="undefined")
        {
            sns_userid = window.parent.sns_userid;
            sns_islogin = window.parent.passport.isLoginedStatus().toString();
        }
        else
        {
            sns_islogin = passport.isLoginedStatus().toString();
        }

        if(sns_userid == null)
        {
            sns_userid = "";
        }

    }
    catch(e){
        sns_userid = "";
        sns_islogin = "false";
    }


    if(sns_islogin=="true" && clientInfo.browser=="Firefox" && sns_islogin=="true") {

        if(window.name!=""&&typeof(window.name)!="undefined"&&window.name.length>0)
        {
            setTimeout(function(){
                document.getElementById("myForm").target ="myFrame";
                document.getElementById("data").value = window.name;
                document.getElementById("myForm").submit();

            },300);

        }
    }


    fo.write(divId);
}


function changeWindowToNormalSceen(playerId) {

    var containerId = playerId.replace("flashplayer_", "");
    var containerObj = document.getElementById(containerId);
    var obj = document.getElementById(playerId);
    var originalStyle = "";

    if(!containerObj || !obj) {
        return "false";
    }


    if(obj.getAttribute("originalStyle") && obj.getAttribute("originalStyle").length>3) {
        originalStyle = obj.getAttribute("originalStyle");
    } else{
        originalStyle = containerObj.getAttribute("style");
        obj.setAttribute("originalStyle", originalStyle);
    }

    containerObj.style.cssText = originalStyle;

    obj.setAttribute("isPageFullsreen", "false");
    document.body.style.overflow = "visible";

    if(typeof tellPageWhenNomalScreen !== "undefined") {
        tellPageWhenNomalScreen(containerId);
    }

    return "true";
}

function changeWindowToWebFullSceen(playerId) {

    var containerId = playerId.replace("flashplayer_", "");
    var containerObj = document.getElementById(containerId);
    var obj = document.getElementById(playerId);
    var originalStyle = "";

    if(!containerObj || !obj) {
        return "false";
    }

    if(obj.getAttribute("originalStyle") && obj.getAttribute("originalStyle").length>3) {
        originalStyle = obj.getAttribute("originalStyle");
        containerObj.style.cssText = "";
    } else{
        originalStyle = containerObj.getAttribute("style");
        obj.setAttribute("originalStyle", originalStyle);
    }

    containerObj.style.position = "fixed";
    containerObj.style.zIndex = "999";
    containerObj.style.top = "0px";
    containerObj.style.left = "0px";
    containerObj.style.bottom = "0px";
    containerObj.style.width = "100%";
    containerObj.style.height = "auto";
    containerObj.style.maxHeight = "100%";

    obj.setAttribute("isPageFullsreen", "true");
    document.body.style.overflow = "hidden";

    if(typeof tellPageWhenFullScreen !== "undefined") {
        tellPageWhenFullScreen(containerId);
    }

    return "true";
}


function flashStartPlaying(playerId) {

    var len = flashPlayerList.length;

    for(var i=0; i<len; i++) {
        if(flashPlayerList[i] === playerId) {
            continue;
        }

        try{
            thisMovie(flashPlayerList[i]).pause();
        } catch (e){
            try{
                document.getElementById("html5Player-"+flashPlayerList[i].substr(12)).pause();
            } catch (e){
            }

        }

    }

}

function givePageUrlToFlash() {
    return window.location.href;
}






function getFlashVer(){//获得flashplayer的版本 google
    var fls=flashChecker();
    var s="";
    if(fls.f&&(fls.v>=10)) isFlashPlayer = true;
    else isFlashPlayer = false;
}

function flashChecker()
{
    var hasFlash=0;         //是否安装了flash
    var flashVersion=0; //flash版本
    var isIE=/*@cc_on!@*/0;      //是否IE浏览器

    if(isIE)
    {
        try{
            var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if(swf) {
                hasFlash=1;
                VSwf=swf.GetVariable("$version");
                flashVersion=parseInt(VSwf.split(" ")[1].split(",")[0]);
            }
        }catch(e)
        {
            //alert(e);
        }
    }else{
        if (navigator.plugins && navigator.plugins.length > 0)
        {
            try{
                var swf=navigator.plugins["Shockwave Flash"];
                if (swf)
                {
                    hasFlash=1;
                    var words = swf.description.split(" ");
                    for (var i = 0; i < words.length; ++i)
                    {
                        if (isNaN(parseInt(words[i]))) continue;
                        flashVersion = parseInt(words[i]);

                        if(!isIPad() && getChromeVersion()>=55 && flashVersion>=23 && swf.filename==="internal-not-yet-present"){
                            flashVersion = 22;
                        }
                    }
                }
            }catch(e){
                //alert(e);
            }
        }
    }
    return {
        f:hasFlash,
        v:flashVersion
    };
}




function  showInstallFlashPlayerMsg(playerId, w, h) {

    var msg = "请点此安装最新flash";
    var str = "<div class=\"flash_install\"><a style='color:#cccccc;font-size:16px;text-decoration:underline;' href=\"https://www.adobe.com/go/getflashplayer_cn\" onfocus=\"this.blur()\"><img style=\"display:inline-block\" src=\"//player.cntv.cn/flashplayer/logo/get_adobe_flash_player.png\"/><p style='margin-top:8px;color:#cccccc'>" + msg + "</p></a></div>";

    if(playerId=== "vplayer" && document.getElementById("myFlash") && !document.getElementById("vplayer"))
    {
        playerId = "myFlash";
    }
    var result_box = document.getElementById(playerId);

    var bg =  document.createElement("img");
    bg.position = "absolute";
    bg.src = "//t.live.cntv.cn/cntvwebplay/cntvplayer/images/plug-in_bg.gif";
    var bgWidth = w;
    var bgHeight = h;
    bg.width = bgWidth;
    bg.height = bgHeight;
    result_box.style.lineHeight = "20px";
    result_box.appendChild(bg);

    var errorPanel = document.createElement("div");
    errorPanel.style.position = "relative";
    errorPanel.style.margin = "0 auto";
    errorPanel.style.left = "0";
    errorPanel.style.width = w + "px";
    errorPanel.style.textAlign = "center";
    errorPanel.style.top = -parseInt(2*bg.height/5) + "px";
    errorPanel.style.color = "#dddddd";
    errorPanel.style.fontSize = "16px";
    errorPanel.style.fontWeight = "bold";
    errorPanel.innerHTML = str;
    errorPanel.align = "center";
    result_box.appendChild(errorPanel);

    return;
}

function getChromeVersion(){
    var ver = "";
    var start = navigator.userAgent.indexOf("Chrome/");
    var cutStr = navigator.userAgent.substr(start + 7);
    ver = parseInt(cutStr);
    return ver;
}

function isIPad() {
    return /(iphone|ipad)/i.test(navigator.userAgent) || /(Android)/i.test(navigator.userAgent);
}


function createElementByType(type,_id,position,_w,_h,_l,_t) {
    var el = document.createElement(type);
    el.setAttribute("id",_id);
    el.style.position = position;
    el.style.width = _w;
    el.style.height = _h;
    el.style.left = _l;
    el.style.top = _t;
    return el;
}


function IsMaxthon() {
    try{
        window.external.max_invoke("GetHotKey");
        return true;
    }catch(ex){
        return false;
    }
}


//鍔ㄦ€佸姞杞芥寚绾筳s鏂囦欢fingerprint2.js
function getfingerprint2(){

    var _doc = document.getElementsByTagName("head")[0];
    var jsLoader = createElementByType("script","jsFingerLoader","absolute","0px","0px","0px","0px");
    jsLoader.src = vodUrlProtocol + "js.player.cntv.cn/creator/fingerprint2.js";

    _doc.appendChild(jsLoader);
    if(typeof jsLoader.onload != "undefined"){

        jsLoader.onload = function() {
            getFingerprint();
        };
    }

    if(typeof jsLoader.onreadystatechange != "undefined"){
        jsLoader.onreadystatechange = function(){
            if (jsLoader.readyState == 'loaded' || jsLoader.readyState == 'complete'){
                getFingerprint();
            }
        };
    }
}


//璁剧疆cookie    2017骞�7鏈�28鏃�16:11:42
function setCookie_vdn(key,value,day){
    if(day){
        var d = new Date();
        d.setTime(d.getTime() + day*24*60*60*1000);
        document.cookie=key + "=" + value + ";expires=" + d.toGMTString();
    }else{
        document.cookie=key + "=" + value;
    }

    try{
        if(window.localStorage) {
            localStorage.setItem(key, value);
        }
    } catch (e) {

    }

}
//鍒犻櫎cookie鏂规硶
function removeCookie_vdn(key) {
    setCookie_vdn(key,"",-1);
}
//鑾峰彇cookie鏂规硶
function getCookie_vdn( key ) {

    var v = "";
    //鍒ゆ柇鏄惁鍚湁cookie 锛屾湁cookie 灏辫幏鍙栧嚭鏉�
    if( document.cookie ){
        var str = document.cookie;//鑾峰彇cookie淇℃伅   閿�1=鍊�1; 閿�2=鍊�1; 閿�3=鍊�3;
        var arr = str.split("; ");//灏哻ookie鏂囦欢鎸夌収 ;   鎷嗘垚鏁扮粍
        for(var i = 0 ; i <arr.length ; i++){
            var  item = arr[i].split("=");// 灏嗘暟缁勪腑鐨勬瘡涓€涓瓧绗︿覆閫氳繃=鎷嗘垚涓€涓皬鏁扮粍 [閿�1,鍊�1]
            //鍒ゆ柇灏忔暟缁勪腑 鏍规嵁宸茬煡鐨勯敭  涓嬫爣涓� [0] 涓哄凡鐭ラ敭锛屾壘鍒板搴旂殑鍊�
            if(item[0] == key){
                v = item[1].toString();//灏唊ey瀵瑰簲鐨勫€艰繑鍥炴澶勮繑鍥炵殑涓哄瓧绗︿覆 灏唕eturn JSON.parse(item[1])
                break;
            }
        }

    }
    v += "";

    try{
        if((!v ||v.length<20) && window.localStorage) {
            v = localStorage[key] ? localStorage[key] : "";
        }
    } catch (e) {
        v = "";
    }

    //濡傛灉娌℃湁cookie 锛岃繑鍥炰竴涓┖鏁扮粍
    return v;
}
//瀹氫箟鎸囩汗淇℃伅鍦╟ookie涓殑key鍊�
function getFingerprint() {
    var fp = new Fingerprint2();
    fp.get(function(result) {
        setCookie_vdn("Fingerprint",result.toUpperCase(),7);
    });
}


if(window.addEventListener) {
    window.addEventListener("beforeunload", function (e) {
        var len = flashPlayerList.length;
        for(var i=0; i<len; i++) {
            try{
                thisMovie(flashPlayerList[i]).ConvivaCleanUp();
            } catch (e){

            }

        }


        if(typeof(_vjVideoTrack)!="undefined") {
            _vjVideoTrack("");
        }
        window.name = currentMessage;
        if(typeof sns_islogin !== "undefined" && sns_islogin=="true") {
            document.getElementById("myForm").target ="myFrame";
            document.getElementById("data").value = currentMessage;
            document.getElementById("myForm").submit();
        }
    });
}


function setCurrentMes(s) {
    currentMessage =s;
}


function getAndroidVersion() {
    var version = 0;
    var clientInfo = navigator.userAgent.toLowerCase();
    var pos = clientInfo.indexOf("android");
    if(pos > 0)
    {
        version = clientInfo.substr(pos+7);
        version = parseInt(version);
    }
    return version;

}

function thisMovie(movieName) {
    if (navigator.appName.indexOf("Microsoft") != -1) {
        return window[movieName];
    } else {
        return document[movieName];
    }
}


var clientInfo={os:null,browser:null,broserVersion:null,osVersion:null};
(function() {

    var BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent)
                || this.searchVersion(navigator.appVersion)
                || "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";
        },
        searchString: function (data) {
            for (var i=0;i<data.length;i++)	{
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            { 	string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {		// for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            { 		// for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS : [
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            },
            {
                string: navigator.userAgent,
                subString: "iPad",
                identity: "iPad"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]
    };
    BrowserDetect.init();
    clientInfo.os = BrowserDetect.OS;
    clientInfo.browser = BrowserDetect.browser;
    clientInfo.broserVersion  = BrowserDetect.version;
})();




//md5加密
!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(this);


LazyLoad=(function(doc){var env,head,pending={},pollCount=0,queue={css:[],js:[]},styleSheets=doc.styleSheets;function createNode(name,attrs){var node=doc.createElement(name),attr;for(attr in attrs){if(attrs.hasOwnProperty(attr)){node.setAttribute(attr,attrs[attr])}}return node}function finish(type){var p=pending[type],callback,urls;if(p){callback=p.callback;urls=p.urls;urls.shift();pollCount=0;if(!urls.length){callback&&callback.call(p.context,p.obj);pending[type]=null;queue[type].length&&load(type)}}}function getEnv(){var ua=navigator.userAgent;env={async:doc.createElement('script').async===true};(env.webkit=/AppleWebKit\//.test(ua))||(env.ie=/MSIE|Trident/.test(ua))||(env.opera=/Opera/.test(ua))||(env.gecko=/Gecko\//.test(ua))||(env.unknown=true)}function load(type,urls,callback,obj,context){var _finish=function(){finish(type)},isCSS=type==='css',nodes=[],i,len,node,p,pendingUrls,url;env||getEnv();if(urls){urls=typeof urls==='string'?[urls]:urls.concat();if(isCSS||env.async||env.gecko||env.opera){queue[type].push({urls:urls,callback:callback,obj:obj,context:context})}else{for(i=0,len=urls.length;i<len;++i){queue[type].push({urls:[urls[i]],callback:i===len-1?callback:null,obj:obj,context:context})}}}if(pending[type]||!(p=pending[type]=queue[type].shift())){return}head||(head=doc.head||doc.getElementsByTagName('head')[0]);pendingUrls=p.urls.concat();for(i=0,len=pendingUrls.length;i<len;++i){url=pendingUrls[i];if(isCSS){node=env.gecko?createNode('style'):createNode('link',{href:url,rel:'stylesheet'})}else{node=createNode('script',{src:url});node.async=false}node.className='lazyload';node.setAttribute('charset','utf-8');if(env.ie&&!isCSS&&'onreadystatechange'in node&&!('draggable'in node)){node.onreadystatechange=function(){if(/loaded|complete/.test(node.readyState)){node.onreadystatechange=null;_finish()}}}else if(isCSS&&(env.gecko||env.webkit)){if(env.webkit){p.urls[i]=node.href;pollWebKit()}else{node.innerHTML='@import "'+url+'";';pollGecko(node)}}else{node.onload=node.onerror=_finish}nodes.push(node)}for(i=0,len=nodes.length;i<len;++i){head.appendChild(nodes[i])}}function pollGecko(node){var hasRules;try{hasRules=!!node.sheet.cssRules}catch(ex){pollCount+=1;if(pollCount<200){setTimeout(function(){pollGecko(node)},50)}else{hasRules&&finish('css')}return}finish('css')}function pollWebKit(){var css=pending.css,i;if(css){i=styleSheets.length;while(--i>=0){if(styleSheets[i].href===css.urls[0]){finish('css');break}}pollCount+=1;if(css){if(pollCount<200){setTimeout(pollWebKit,50)}else{finish('css')}}}}return{css:function(urls,callback,obj,context){load('css',urls,callback,obj,context)},js:function(urls,callback,obj,context){load('js',urls,callback,obj,context)}}})(this.document);



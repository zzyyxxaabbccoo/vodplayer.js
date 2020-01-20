/*
*
*/

var vodPlayerObjs = {};

var isFlashPlayer = true;
vodPlayerObjs.isLoadedOldH5Player = false;
vodPlayerObjs.fingerprintJsIsStarted = false;

var html5PlayBtnBottomleft = {};
var playerWidthAndHeight = {};
var flashPlayerList = [];

var currentMessage = "";

function createVodPlayer(paras) {
    var container = document.getElementById(paras.divId);
    if(location.href.indexOf("https://")!==-1) {
        paras.isHttps = "true";
        vodPlayerObjs.isHttps = "true";
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

    // 获取cookie并传递指纹信
    var Fingerprint = "";
    if(!getCookie_vdn("Fingerprint") && !vodPlayerObjs.fingerprintJsIsStarted) {
        // 获取设备指纹信息
        getfingerprint2();
    } else {
        Fingerprint = getCookie_vdn("Fingerprint");
    }

    vodPlayerObjs.fingerprintJsIsStarted = true;

    if(false && !isIPad() && !paras.isAudio&&((navigator.userAgent.indexOf("rv:11")===-1)&&navigator.userAgent.indexOf("MSIE")===-1)) {
        var vdnUrl = "";
        // 设置播放器的背景图片
        var container = document.getElementById(paras.divId);
        // container.style.position = "relative";
        var bgImg = "cctv_html5player_bg_16X9.png";
        if(paras.h/paras.w > 1) {
            bgImg = "cctv_html5player_bg_9X16.png";
        }
        if(vodPlayerObjs.isHttps === "true") {
            container.style.backgroundImage = "url('https://player.cntv.cn/html5Player/images/" + bgImg + "')";
            // vodPlayerObjs[paras.divId].adCalls = "https://galaxy.bjcathay.com/s?z=cathay&c=1290,1291,1292&op=7&cb=parseVodAdCallsDataFromApi";
            vdnUrl = "https://vdn.apps.cntv.cn/api/getIpadVideoInfo.do?pid=" + paras.videoCenterId + "&tai=ipad&from=html5";
        } else{
            container.style.backgroundImage = "url('http://player.cntv.cn/html5Player/images/" + bgImg + "')";
            // vodPlayerObjs[paras.divId].adCalls = "http://galaxy.bjcathay.com/s?z=cathay&c=1290,1291,1292&op=7&cb=parseVodAdCallsDataFromApi";
            vdnUrl = "http://vdn.apps.cntv.cn/api/getIpadVideoInfo.do?pid=" + paras.videoCenterId + "&tai=ipad&from=html5";
        }
        container.style.backgroundSize = "100% 100%";
        container.style.backgroundRepeat = "no-repeat";
        container.style.backgroundPosition = "0px 0px";

        vodPlayerObjs[paras.divId].video = {};
        vodPlayerObjs[paras.divId].adCallsVideo = {};

        // 对接口文档的新字段进行初始化；
        var vdn_tsp =new Date().getTime().toString().slice(0,10);
        var vdn_vn = "2049";
        var vdn_vc = "";
        var staticCheck = "47899B86370B879139C08EA3B5E88267";
        var vdn_uid = "";
        var vdn_wlan = "";

        // 获取cookie
        if(typeof(getCookie_vdn)=="function"){
            if(!getCookie_vdn("Fingerprint")){
                // 获取设备指纹信息
                if(typeof(getfingerprint2)=="function" && typeof(getfingerprint2)!="undefined" && !vodPlayerObjs.isFingerprintJsLoading){
                    getfingerprint2();
                }
            } else{
                vdn_uid = getCookie_vdn("Fingerprint");
            }
        }
        // md5加密  动态校验码
        var vdn_vc = md5((vdn_tsp+vdn_vn+staticCheck+vdn_uid)).toUpperCase();

        // 添加新字段
        vdnUrl += "&tsp="+vdn_tsp + "&vn="+ vdn_vn + "&vc="+vdn_vc + "&uid="+vdn_uid + "&wlan="+vdn_wlan;
        loadScript(vdnUrl, parseVodDataFromVdn, paras);
        try{
            var contanerObj = document.getElementById(paras.divId);
            var originalStyle = contanerObj.style.cssText;

            if(!originalStyle || originalStyle.length<4) {
                originalStyle = "none";
            }

            if(document.getElementById(paras.divId)) {
                document.getElementById(paras.divId).setAttribute("originalStyle", originalStyle);
            }
        } catch (e) {

        }
    } 
    // 移动端
    else if(isIPad() || (paras.isAudio&&((navigator.userAgent.indexOf("rv:11")>0)||navigator.userAgent.indexOf("MSIE")===-1))) {
        var vdnUrl = "http://vdn.apps.cntv.cn/api/getIpadVideoInfo.do?pid=" + paras.videoCenterId + "&tai=ipad&from=html5";
        var jsUrl = "http://js.player.cntv.cn/creator/html5player_standard_multi.js";

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
                    // player.play();
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

        var playerUrl = "http://player.cntv.cn/standard/cntvplayerQC20190719.swf";

        if(paras.isAudio) {
            playerUrl = "http://player.cntv.cn/standard/cntvTheatreAudioPlayer.swf";
            if(paras.isHttps === "true") {
                playerUrl = "http://player.cntv.cn/standard/cntvTheatreAudioPlayer.swf";
            }
        }
        var version = "2019.07.02";
        var adversion = 'ad0.171.5.8.4.5.4';
        var widgetsConfigPath = "http://js.player.cntv.cn/xml/widgetsConfig/common.xml";
        // var languageConfigPath ="";
        var widgetsSwfPath = "http://player.cntv.cn/widgets/wg/WidgetButton20150514.swf";
        var widgetsXmlPath = "http://js.player.cntv.cn/xml/widgetsPlugXml/chinese.xml";
        var fo = null;
        // 如果是https
        if(paras.isHttps === "true") {
            playerUrl = "https://player.cntv.cn/standard/cntvplayerQC20190719.swf";


            widgetsConfigPath = "https://js.player.cntv.cn/xml/widgetsConfig/common.xml";
            widgetsSwfPath = "https://player.cntv.cn/widgets/wg/WidgetButton20150514.swf";
            widgetsXmlPath = "https://js.player.cntv.cn/xml/widgetsPlugXml/chinese.xml";

        }
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
        fo.addVariable("videoId", paras.videoId);
        fo.addVariable("articleId", paras.articleId);
        fo.addVariable("filePath", paras.filePath);
        fo.addVariable("sysSource", paras.sysSource); // 视频来源
        fo.addVariable("channelId", paras.channelId);
        fo.addVariable("url", paras.url); // 视频页面url http://tv.cntv.cn/video/C18472/a28126e5e0424a44af6a9bc4c5a47742
        fo.addVariable("scheduleId", paras.scheduleId); 
        fo.addVariable("videoCenterId",paras.videoCenterId); // 视频生产中心guid (必要)
        fo.addVariable("isLogin", paras.isLogin); // 用户中心相关
        fo.addVariable("userId", paras.userId); // 用户中心相关
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

        // 用https方式
        if(paras.isHttps === "true") {

            fo.addVariable("https", "true");
            fo.addVariable("adplayerPath", "https://player.cntv.cn/adplayer/cntvAdPlayer.swf?v="+adversion);
            fo.addVariable("pauseAdplayerPath", "https://player.cntv.cn/adplayer/cntvPauseAdPlayer.swf?v="+adversion);
            fo.addVariable("cornerAdplayerPath", "https://player.cntv.cn/adplayer/cntvCornerADPlayer.swf?v="+adversion);
            fo.addVariable("hotmapPath", "https://player.cntv.cn/standard/cntvHotmap.swf?v="+adversion);
            fo.addVariable("dynamicDataPath", "https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do");
            fo.addVariable("floatLogoURL", "https://player.cntv.cn/flashplayer/logo/fhMaskLogo.png");
            fo.addVariable("qmServerPath", "https://log.player.cntv.cn/stat.html");
        } else{
            fo.addVariable("adplayerPath", "http://player.cntv.cn/adplayer/cntvAdPlayer.swf?v="+adversion);
            fo.addVariable("pauseAdplayerPath", "http://player.cntv.cn/adplayer/cntvPauseAdPlayer.swf?v="+adversion);
            fo.addVariable("cornerAdplayerPath", "http://player.cntv.cn/adplayer/cntvCornerADPlayer.swf?v="+adversion);
            fo.addVariable("hotmapPath", "http://player.cntv.cn/standard/cntvHotmap.swf?v="+adversion);
            fo.addVariable("dynamicDataPath", "http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do");
            fo.addVariable("floatLogoURL", "http://player.cntv.cn/flashplayer/logo/fhMaskLogo.png");
            fo.addVariable("qmServerPath", "http://log.player.cntv.cn/stat.html");
        }


        fo.addVariable("usrOs", clientInfo.os);
        fo.addVariable("usrBroswer", clientInfo.browser+":"+clientInfo.broserVersion);
        fo.addVariable("screenInfo",window.screen.width+"*"+window.screen.height);
        fo.addVariable("platform",navigator.platform);
        fo.addVariable("isTianRun","true");


        fo.addVariable("isShowSmallWindow","true");
        fo.addVariable("widgetsConfig",widgetsConfigPath);
        // fo.addVariable("languageConfig", languageConfigPath);
        fo.addVariable("language", paras.language);
        fo.addVariable("logoImageURL", "");
        fo.addVariable("logoURL", "http://www.cntv.cn/");

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

        // 把指纹信息传给播放器
        fo.addVariable("fingerprint",Fingerprint);
        fo.addParam("menu","false");
        fo.addParam("allowFullScreen", "true");
        fo.addParam("allowScriptAccess","always");

        fo.addParam("wmode", paras.wmode);

        writeFlashPlayer(fo, paras.divId);

        // 播放器容器的原始样式
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

function createH5PlayerElement(divId) {
    var container = document.getElementById(divId);
    // container.style.zIndex = 2;
    var player = document.createElement("video");
    player.controls = false;

    player.autoplay = true;
    player.setAttribute("autoplay", "autoplay");
    player.preload = true;
    player.setAttribute("id", "h5player_" + divId);
    // player.setAttribute("webkit-playsinline", "true");
    // player.setAttribute("playsinline", "true");
    // player.setAttribute("x5-playsinline", "true");
    // player.setAttribute("x-webkit-airplay", "true");
    // player.style.zIndex = "2";

    player.style.position = "absolute";
    player.style.width = "100%";
    player.style.height = "100%";
    player.style.left = "0px";
    player.style.top = "0px";
    container.appendChild(player);
    initH5PlayerEvents(divId);
}

function initH5PlayerEvents(divId) {
    var player = document.getElementById("h5player_" + divId);
    player.addEventListener("play", function () {
        // PlayOrPauseBtn.prototype.playOrPause(divId);
    }, false);


}

function getHtml5VideoData() {
    
}

function destroyH5VodHls(paras) {

    if(vodPlayerObjs[paras.divId].adCallsVideo && vodPlayerObjs[paras.divId].adCallsVideo.hls) {
        vodPlayerObjs[paras.divId].adCallsVideo.hls.destroy();
        vodPlayerObjs[paras.divId].adCallsVideo.hls.detachMedia();

        vodPlayerObjs[paras.divId].adCallsVideo.hls = null;

        console.log("destroy ad");
    }

    if(vodPlayerObjs[paras.divId].video && vodPlayerObjs[paras.divId].video.hls) {
        vodPlayerObjs[paras.divId].video.hls.destroy();
        vodPlayerObjs[paras.divId].video.hls.detachMedia();
        vodPlayerObjs[paras.divId].video.hls = null;
        console.log("destroy video");
    }
}

function playVodVideo(paras) {
    if(document.getElementById("adcalls_bar_" + paras.divId)) {
        document.getElementById(paras.divId).removeChild(document.getElementById("adcalls_bar_" + paras.divId));
    }

    if(vodPlayerObjs[paras.divId].adCallsIsPlayed) {
        return;
    }
    vodPlayerObjs[paras.divId].adCallsIsPlayed = true;
    clearInterval(vodPlayerObjs[paras.divId].adCallsRemainingTimer);
    destroyH5VodHls(paras);

    createVodHls(paras);
}

function getVodAdCallsData(data) {
    if(typeof data === "object" && data.divId) {
        vodPlayerObjs.adCallsPlayingNum += 1;
        getVodAdCallsDataFromVdn(data, vodPlayerObjs.adCallsPlayingNum);
    }
}

function getVodAdCallsDataFromVdn(data, adNum) {
    if(!Array.isArray(vodPlayerObjs.adCallsAPI) || vodPlayerObjs.adCallsPlayingNum-vodPlayerObjs.adCallsAPI.length>=0) {
        playVodVideo(data);
        return;
    }

    // 对接口文档的新字段进行初始化；
    var vdn_tsp =new Date().getTime().toString().slice(0,10);
    var vdn_vn = "2049";
    var vdn_vc = "";
    var staticCheck = "47899B86370B879139C08EA3B5E88267";
    var vdn_uid = "";
    var vdn_wlan = "";

    // 获取cookie
    if(typeof(getCookie_vdn)=="function"){
        if(!getCookie_vdn("Fingerprint")){
            // 获取设备指纹信息
            if(typeof(getfingerprint2)=="function" && typeof(getfingerprint2)!="undefined" && !vodPlayerObjs.isFingerprintJsLoading){
                getfingerprint2();
            }
        } else{
            vdn_uid = getCookie_vdn("Fingerprint");
        }
    }
    // md5加密  动态校验码
    var vdn_vc = md5((vdn_tsp+vdn_vn+staticCheck+vdn_uid)).toUpperCase();


    var vdnUrl = "http://vdn.apps.cntv.cn/api/getIpadInfoAd.do?pid=" + vodPlayerObjs.adCallsAPI[adNum].guid + "&tai=ipad&from=html5";
    if(vodPlayerObjs.isHttps === "true") {
        vdnUrl = "http://vdn.apps.cntv.cn/api/getIpadInfoAd.do?pid=" + vodPlayerObjs.adCallsAPI[adNum].guid + "&tai=ipad&from=html5";
    }

    // 添加新字段
    vdnUrl += "&tsp="+vdn_tsp + "&vn="+ vdn_vn + "&vc="+vdn_vc + "&uid="+vdn_uid + "&wlan="+vdn_wlan;
    vdnUrl += "&jsonp=vodAdCallsData";


    loadScript(vdnUrl, parseVodAdCallsDataFromVdn, data, getVodAdCallsData);
}


function parseVodAdCallsDataFromVdn(paras) {

    var title = "";
    var videoUrl = "";
    var defaultStream = "";
    var duration = 15;
    var obj = null;

    try{
        var obj = eval('(' + vodAdCallsData + ')');
        // console.log(obj)
        videoUrl = obj["hls_url"];
        title = obj["title"];
        defaultStream = obj["default_stream"];
        duration = obj["video"]["totalLength"];
    } catch(e){
        title = "error";
    }

    if(title==="error" || videoUrl.length<3 || obj["public"]!=1 || (vodPlayerObjs.adCallsPlayingNum-vodPlayerObjs.adCallsAPI.length>=0)) {

        vodPlayerObjs.adCallsPlayingNum += 1;
        getVodAdCallsDataFromVdn(paras, vodPlayerObjs.adCallsPlayingNum);
    } else {

        vodPlayerObjs.adCallsAPI[vodPlayerObjs.adCallsPlayingNum].title = title;
        vodPlayerObjs.adCallsAPI[vodPlayerObjs.adCallsPlayingNum].hlsUrl = videoUrl;
        vodPlayerObjs.adCallsAPI[vodPlayerObjs.adCallsPlayingNum].defaultStream = defaultStream;
        vodPlayerObjs.adCallsAPI[vodPlayerObjs.adCallsPlayingNum].duration = duration;
        playVodAdCalls(paras);
    }
}


function parseVodAdCallsDataFromApi(data) {

    if(data && !data.divId) {
        var len = 0;
        if(Array.isArray(data)) {
            len = data.length;
        }

        vodPlayerObjs.adCallsAPI = [];
        for(var i=0; i<len; i++){

            if(data[i].guid && data[i].clickUrl) {
                vodPlayerObjs.adCallsAPI[i] = {};
                vodPlayerObjs.adCallsAPI[i].guid = data[i].guid;
                vodPlayerObjs.adCallsAPI[i].clickUrl = data[i].clickUrl;
            }
        }

    } else if(Array.isArray(vodPlayerObjs.adCallsAPI)){
        vodPlayerObjs.adCallsPlayingNum = 0;
        getVodAdCallsDataFromVdn(data, vodPlayerObjs.adCallsPlayingNum);

        // 如果在广告预期的2倍时间内广告没播完，就直接播视频
        vodPlayerObjs[data.divId].adCallsTimer = setTimeout(function () {
            if(!vodPlayerObjs[data.divId].adCallsIsPlayed) {
                playVodVideo(data);
            }
        }, vodPlayerObjs.adCallsAPI.length*2*15000);
    } else{
        playVodVideo(data);
    }
}


function parseVodAdCallsDataFromApiWhenError(paras) {
    playVodVideo(paras);
}


function getStartLevel(levels, defaultStream) {
    var defaultBitrate = 0;
    var len = levels.length;
    var min = 6000000;
    var startLevel = 1;
    switch (defaultStream) {
        case "lowChapters":
            defaultBitrate = 200000;
            break;
        case "chapters":
            defaultBitrate = 450000;
            break;
        case "chapters2":
            defaultBitrate = 850000;
            break;
        case "chapters3":
            defaultBitrate = 1200000;
            break;
        case "chapters4":
            defaultBitrate = 2000000;
            break;
        case "chapters5":
            defaultBitrate = 4000000;
            break;
        case "chapters6":
            defaultBitrate = 6000000;
            break;
    }

    for(var i=0; i<len; i++) {
        if(Math.abs(levels[i].bitrate - defaultBitrate) < min) {
            min = Math.abs(levels[i].bitrate - defaultBitrate);
            startLevel = i;
        }
    }
    return startLevel;
}


function playNextVodAdCalls(paras) {

    // 兼容一进视频还没播就抛出error事件
    if(!vodPlayerObjs[paras.divId].adCallsIsPlayed) {
        if(document.getElementById("h5player_" + paras.divId).currentTime<3 && event.type==="ended") {
            return;
        }
        vodPlayerObjs.adCallsPlayingNum += 1;
        getVodAdCallsDataFromVdn(paras, vodPlayerObjs.adCallsPlayingNum);
    }
}


function playVodAdCalls(paras) {
    // vodPlayerObjs.adCallsAPI[vodPlayerObjs.adCallsPlayingNum].title = title;
    // vodPlayerObjs.adCallsAPI[vodPlayerObjs.adCallsPlayingNum].hlsUrl = videoUrl;
    // vodPlayerObjs.adCallsAPI[vodPlayerObjs.adCallsPlayingNum].defaultStream = defaultStream;
    destroyH5VodHls(paras);

    createAdCallsHls(paras);
}


function initVodH5Player(paras) {
    vodPlayerObjs[paras.divId].video.playing = false;
    vodPlayerObjs[paras.divId].adCallsIsPlayed = false;
    var video = document.getElementById("h5player_" + paras.divId);
    if (Hls.isSupported()) {
        var video = document.getElementById("h5player_" + paras.divId);


        if(vodPlayerObjs[paras.divId].adCalls && vodPlayerObjs[paras.divId].adCalls.length>3) {
            vodPlayerObjs.adCallsPlayingNum = 0;
            video.addEventListener("ended", playNextVodAdCalls.bind(null, paras), false);
            // video.addEventListener("error", playNextVodAdCalls.bind(null, paras), false);
            loadScript(vodPlayerObjs[paras.divId].adCalls, parseVodAdCallsDataFromApi, paras, parseVodAdCallsDataFromApiWhenError, 100);

        } else{
            playVodVideo(paras);
        }
    }
}

function parseVodDataFromVdn(paras) {
    var obj = null;
    try{
        var obj = eval('(' + html5VideoData + ')');
    } catch(e){
        errStr = "数据格式错误";
        return;
    }

    var videoUrl = obj["hls_url"] ? obj["hls_url"] : "";
    vodPlayerObjs[paras.divId].video.duration = obj["video"]["totalLength"];
    vodPlayerObjs[paras.divId].video.defaultStream = obj["default_stream"];

    vodPlayerObjs[paras.divId].video.url = videoUrl;
    createH5PlayerElement(paras.divId);
    document.getElementById("h5player_" + paras.divId).src = vodPlayerObjs[paras.divId].video.url;

    var playerUrl = "vodplayer_controls.js?3";

    loadScript(playerUrl, initVodH5Player, paras);

}


function loadScript(src, cb, paras, errorCb, timeout) {
    var _doc = document.getElementsByTagName("head")[0];
    var jsLoader= document.createElement('script');
    jsLoader.type= 'text/javascript';

    jsLoader.onload = function() {
        if(typeof cb === "function") {
            if(timeout) {
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


function doLoadAliAnalyticsJs() {

    var jsLoader = createElementByType("script","convivaJs237","absolute","0px","0px","0px","0px");
    jsLoader.src = "https://js.data.cctv.com/__aplus_plugin_cctv.js,aplus_plugin_aplus_u.js";

    var _doc = document.getElementsByTagName('head')[0];
    _doc.appendChild(jsLoader);
}



function getFlashVer(){ // 获得flashplayer的版本 google
    var fls=flashChecker();
    var s="";
    if(fls.f&&(fls.v>=10)) isFlashPlayer = true;
    else isFlashPlayer = false;
}

function flashChecker()
{
    var hasFlash=0;         // 是否安装了flash
    var flashVersion=0; // flash版本
    var isIE=/*@cc_on!@*/0;      // 是否IE浏览器

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
            // alert(e);
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
                // alert(e);
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


// 定义指纹信息在cookie中的key?
function getFingerprint() {
    var fp = new Fingerprint2();
    fp.get(function(result) {
        setCookie_vdn("Fingerprint",result.toUpperCase(),7);
    });
}

// 动态加载指纹js文件fingerprint2.js
function getfingerprint2(){

    var _doc = document.getElementsByTagName("head")[0];
    var jsLoader = createElementByType("script","jsFingerLoader","absolute","0px","0px","0px","0px");
    if(vodPlayerObjs.isHttps) {
        jsLoader.src = "https://js.player.cntv.cn/creator/fingerprint2.js";
    } else{
        jsLoader.src = "http://js.player.cntv.cn/creator/fingerprint2.js";
    }

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


// 设置cookie    2017-7-28-16:11:42
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
// 删除cookie方法
function removeCookie_vdn(key) {
    setCookie_vdn(key,"",-1);
}

// 获取cookie方法
function getCookie_vdn( key ) {

    var v = "";
    // 判断是否含有cookie ，有cookie 就获取出
    if( document.cookie ){
        var str = document.cookie; //获取cookie信息
        var arr = str.split("; "); //将cookie文件按照 ;   拆成数组
        for(var i = 0 ; i <arr.length ; i++){
            var  item = arr[i].split("=");// 将数组中的每一个字符串通过=拆成一个小数组 [?1,?1]
            // 判断小数组中 根据已知的键  下标? [0] 为已知键，找到对应的?
            if(item[0] == key){
                v = item[1].toString();//将key对应的值返回此处返回的为字符串 将return JSON.parse(item[1])
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

    // 如果没有cookie ，返回一个空数组
    return v;
}


/* 
是否必要？
*/
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

/* 
是否有用？
*/
function setCurrentMes(s) {
    currentMessage =s;
}

/* 
是否有用？
*/
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

/* 
是否必要？
*/
function thisMovie(movieName) {
    if (navigator.appName.indexOf("Microsoft") != -1) {
        return window[movieName];
    } else {
        return document[movieName];
    }
}

/* 
获取客户端信息，主要用于flash？ #delete  TODO 
*/
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
            {		
                // for newer Netscapes (6+)
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
            { 		
                // for older Netscapes (4-)
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


/* md5 */
!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(this);

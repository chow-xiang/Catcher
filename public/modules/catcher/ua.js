'use strict';

module.exports = function(cb){

    /*不去妨碍其他模块*/ 
    try{

        /*关于用户浏览只需要记录浏览记录*/
        if( FILTER_UA() ){

            /*font*/
            // var fontResult    = new DocFontFilter().getResult();
            /*ua*/ 
            var uaResult      = new UAParser().getResult();
            
            /*浏览器*/
            var browser       = (uaResult.browser.name || '') + (!uaResult.browser.major ? '' : ' ' + uaResult.browser.major);
            /*内核*/ 
            var core          = uaResult.engine.name.toLowerCase();
            /*设备的平台*/ 
            var machineType   = (uaResult.os.name || '') + (!uaResult.os.version ? '' : ' ' + uaResult.os.version);
            /*设备的宽度*/
            var machineWidth  = window.screen.width;
            /*设备的高度*/
            var machineHeight = window.screen.height;
            /*语言*/
            var language      = (window.navigator.language || '').toLowerCase();

        	cb && cb( {
                /*用于区分平台的字段*/ 
                // platform      : config.platform || '未知',
                /**/ 
                font          : ''      || '未知',
        		browser       : browser         || '未知',
        		core          : core            || '未知',
                machineType   : machineType     || '未知',
        		machineWidth  : machineWidth    || '未知',
        		machineHeight : machineHeight   || '未知',
        		language      : language        || '未知',
                resolution    : machineWidth + 'px * ' + machineHeight + 'px'
        	} )
        }

    }catch(error){
        /*传错误*/ 
    }
    
}


/**
*ua
*支持ie8
*/ 

function UAParser(uastring, extensions) {

    if (!(this instanceof UAParser)) {
        return new UAParser(uastring, extensions).getResult();
    }

    /*默认值*/ 
    var 
        EMPTY        = '',
        UNKNOWN      = '?',
        FUNC_TYPE    = 'function',
        UNDEF_TYPE   = 'undefined',
        OBJ_TYPE     = 'object',
        STR_TYPE     = 'string',
        MAJOR        = 'major', // deprecated
        MODEL        = 'model',
        NAME         = 'name',
        TYPE         = 'type',
        VENDOR       = 'vendor',
        VERSION      = 'version',
        ARCHITECTURE = 'architecture',
        CONSOLE      = 'console',
        MOBILE       = 'mobile',
        TABLET       = 'tablet',
        SMARTTV      = 'smarttv',
        WEARABLE     = 'wearable',
        EMBEDDED     = 'embedded';

    /**/ 
    var util = {
        extend : function (regexes, extensions) {
            var margedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    margedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    margedRegexes[i] = regexes[i];
                }
            }
            return margedRegexes;
        },
        has : function (str1, str2) {
          if (typeof str1 === "string") {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
          } else {
            return false;
          }
        },
        lowerize : function (str) {
            return str.toLowerCase();
        },
        major : function (version) {
            return typeof(version) === STR_TYPE ? version.split(".")[0] : undefined;
        }
    };

    /*解析的方法*/ 
    var mapper = {

        rgx : function () {

            var result, i = 0, j, k, p, q, matches, match, args = arguments;

            // loop through all regexes maps
            while (i < args.length && !matches) {

                var regex = args[i],       // even sequence (0,2,4,..)
                    props = args[i + 1];   // odd sequence (1,3,5,..)

                // construct object barebones
                if (typeof result === UNDEF_TYPE) {
                    result = {};
                    for (p in props) {
                        if (props.hasOwnProperty(p)){
                            q = props[p];
                            if (typeof q === OBJ_TYPE) {
                                result[q[0]] = undefined;
                            } else {
                                result[q] = undefined;
                            }
                        }
                    }
                }

                // try matching uastring with regexes
                j = k = 0;
                while (j < regex.length && !matches) {
                    matches = regex[j++].exec(this.getUA());
                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        result[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        result[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                result[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
            return result;
        },

        str : function (str, map) {

            for (var i in map) {
                // check if array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (util.has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
        }

    };

    /*解析的特例*/ 
    var maps = {

        browser : {
            oldsafari : {
                version : {
                    '1.0'   : '/8',
                    '1.2'   : '/1',
                    '1.3'   : '/3',
                    '2.0'   : '/412',
                    '2.0.2' : '/416',
                    '2.0.3' : '/417',
                    '2.0.4' : '/419',
                    '?'     : '/'
                }
            }
        },

        os : {
            windows : {
                version : {
                    'ME'        : '4.90',
                    'NT 3.11'   : 'NT3.51',
                    'NT 4.0'    : 'NT4.0',
                    '2000'      : 'NT 5.0',
                    'XP'        : ['NT 5.1', 'NT 5.2'],
                    'Vista'     : 'NT 6.0',
                    '7'         : 'NT 6.1',
                    '8'         : 'NT 6.2',
                    '8.1'       : 'NT 6.3',
                    '10'        : ['NT 6.4', 'NT 10.0'],
                    'RT'        : 'ARM'
                }
            }
        }

    };

    /*解析的规则*/ 
    var regexes = {

        browser : [
            [
                // Presto based
                /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
                /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
                /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
                /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
            ], [NAME, VERSION], 

            [
                /(OPiOS)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
            ], [[NAME, 'Opera Mini'], VERSION], 

            [
                /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
            ], [[NAME, 'Opera'], VERSION],

            [
                // Mixed
                /(kindle)\/([\w\.]+)/i,                                             // Kindle
                /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
                                                                                    // Lunascape/Maxthon/Netfront/Jasmine/Blazer
                // Trident based
                /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
                                                                                    // Avant/IEMobile/SlimBrowser/Baidu
                /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

                // Webkit/KHTML based
                /(rekonq)\/([\w\.]+)*/i,                                            // Rekonq
                /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i
                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS
            ], [NAME, VERSION], 

            [
                /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
            ], [[NAME, 'IE'], VERSION], 

            [
                /(edge)\/((\d+)?[\w\.]+)/i                                          // Microsoft Edge
            ], [NAME, VERSION], 

            [
                /(yabrowser)\/([\w\.]+)/i                                           // Yandex
            ], [[NAME, 'Yandex'], VERSION],

            [
                /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], 

            [
                /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,     // Chrome/OmniWeb/Arora/Tizen/Nokia
                /(qqbrowser)[\/\s]?([\w\.]+)/i                                      // QQBrowser                                                                  
            ], [NAME, VERSION], 

            [

                /(uc\s?browser)[\/\s]?([\w\.]+)/i,
                /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i,
                /JUC.+(ucweb)[\/\s]?([\w\.]+)/i
                                                                                    // UCBrowser
            ], [[NAME, 'UCBrowser'], VERSION], 

            [
                /(dolfin)\/([\w\.]+)/i                                              // Dolphin
            ], [[NAME, 'Dolphin'], VERSION], 

            [
                /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
            ], [[NAME, 'Chrome'], VERSION], 

            [
                /XiaoMi\/MiuiBrowser\/([\w\.]+)/i                                   // MIUI Browser
            ], [VERSION, [NAME, 'MIUI Browser']], 

            [
                /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i         // Android Browser
            ], [VERSION, [NAME, 'Android Browser']], 

            [
                /FBAV\/([\w\.]+);/i                                                 // Facebook App for iOS
            ], [VERSION, [NAME, 'Facebook']], 

            [
                /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, 'Firefox']], 

            [
                /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], 

            [
                /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
            ], [VERSION, NAME], 

            [
                /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], 

            [
                /(konqueror)\/([\w\.]+)/i,                                          // Konqueror
                /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], 

            [
                // Gecko based
                /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
            ], [[NAME, 'Netscape'], VERSION], 

            [
                /(swiftfox)/i,                                                      // Swiftfox
                /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                                                                                    // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
                /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
                                                                                    // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
                /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

                // Other
                /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                                                                                    // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
                /(links)\s\(([\w\.]+)/i,                                            // Links
                /(gobrowser)\/?([\w\.]+)*/i,                                        // GoBrowser
                /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
                /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
            ], [NAME, VERSION]

        ],

        engine : [[

            /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, 'EdgeHTML']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows based
            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

            // Mobile/Embedded OS
            /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
            /linux;.+(sailfish);/i                                              // Sailfish OS
            ], [NAME, VERSION], [
            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
            ], [[NAME, 'Symbian'], VERSION], [
            /\((series40);/i                                                    // Series 40
            ], [NAME], [
            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

            // Console
            /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

            // GNU/Linux based
            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
            /(gnu)\s?([\w\.]+)*/i                                               // GNU
            ], [NAME, VERSION], [

            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Solaris
            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

            // BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [NAME, VERSION],[

            /(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i              // iOS
            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

            // Other
            /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,                            // Solaris
            /(haiku)\s(\w+)/i,                                                  // Haiku
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
            /(unix)\s?([\w\.]+)*/i                                              // UNIX
            ], [NAME, VERSION]
        ]

    };


    var ua     = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
    var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

    this.getBrowser = function () {

        var browser    = {};
        var _tua       = this.getUA();
        var wechatRxg  = /(micromessenger)[\/\s]\(?([\w\.]+)/i;
        var tcRxg      = /(tctravel)[\/\s]\(?([\w\.]+)/i;

        /*分辨 tc app特制*/
        var tcMsg = tcRxg.exec(_tua);
        if(tcMsg && tcMsg.length > 0){

            browser.name    = 'TcTravel App';
            browser.version = tcMsg[2];
            browser.major   = util.major(browser.version);

            return browser;
        }

        /*为了微信浏览器特制*/
        var browserMsg = wechatRxg.exec(_tua);
        if(browserMsg && browserMsg.length > 0){

            browser.name    = 'WechatBrowser';
            browser.version = browserMsg[2];
            browser.major   = util.major(browser.version);

            return browser;
        }

        /*fuck 360*/
        var is360 = this.is360();
        if( !!is360 ){
            browser.name    = is360;
            browser.version = '';
            
            browser.major   = '';

            return browser;
        }


        /*规则内的浏览器*/ 
        browser       = mapper.rgx.apply(this, rgxmap.browser);
        browser.major = util.major(browser.version);

        return browser;
    };
    this.is360 = function(){
        try {

            var _tua   = this.getUA();
            var qihuee = 'QIHU 360 EE';
            var qihuse = 'QIHU 360 SE';

            if( _tua.indexOf(qihuee) != -1 ){

                return qihuee;

            }else if( _tua.indexOf(qihuse) != -1 ){

                return qihuse;
            }

            return '';
        }catch(e){
            return '';
        }
    };
    this.getEngine = function () {
        return mapper.rgx.apply(this, rgxmap.engine);
    };
    this.getOS = function () {
        return mapper.rgx.apply(this, rgxmap.os);
    };
    this.getUA = function () {
        return ua;
    };
    this.getResult = function() {
        return {
            ua      : this.getUA(),
            browser : this.getBrowser(),
            engine  : this.getEngine(),
            os      : this.getOS()
        };
    };
    
    return this;
}


/*font*/ 
function DocFontFilter(){

    if( !this instanceof UAParser ){
        return new DocFontFilter();
    }

    /*别老是重绘*/
    this._iframe               = document.createElement('iframe');
    this._iframe.src           = 'about:blank';
    this._iframe.style.display = 'none';
    
    this._div                  = document.createElement('div');
    this._div.style.display    = 'inline-block';
    this._div.style.fontSize   = '72px';

    document.body.appendChild(this._iframe);
    this._iframeDocument = this._iframe.contentDocument || this._iframe.contentWindow.document;
    
    /*profill ie8*/ 
    if(!this._iframeDocument.body){
        this._iframeDocument.appendChild(document.createElement('body'));
    }
    
    this._iframeDocument.body.appendChild(this._div);   
}

DocFontFilter.prototype = {
    /*浏览器的默认字体*/ 
    getDefaultFont : function (cb){

        var getStyleFun = this.getStyle.toString();
        var _iframe        = this._iframe;
        
        var _script        = document.createElement('script');
        _script.text       = 'window.top.defaultFont = ' + getStyleFun +  '(window.document.body).fontFamily';
        
        this._iframeDocument.body.appendChild(_script);

        return window.top.defaultFont;
        
    },
    /*获取body设置的字体*/
    getStyle : function (dom){
        if(window.getComputedStyle){
            return window.getComputedStyle(dom);
        }else{
            return dom.currentStyle;
        }
        
    },
    /*根据内容筛选*/
    filterFontIsCheckedInBrowser: function (fontName) {
        
        var testDiv = this._div;
        var text    = "abcdefghijklmnopqrstuvwxyz0123456789";

        /*用来对比下*/ 
        testDiv.style.fontFamily = 'monospace';
        testDiv.innerText        = text;
        var baselineSize = parseFloat( this.getStyle(testDiv).width.replace('px', '') );

        /*测试的字体的大小*/ 
        testDiv.style.fontFamily = fontName + ', monospace';
        testDiv.innerText        = text;
        var newSize = parseFloat( this.getStyle(testDiv).width.replace('px', '') );
        

        if (newSize == baselineSize) {
            return false;
        } else {
            return true;
        }

    },
    /*获取css的设值以及默认肢体*/ 
    filterFonts : function (){

        /*css设置的字体*/ 
        var cssFontLists = this.getStyle(window.document.body).fontFamily.replace(/\"|\'/g, '').split(/\,\s*/);
        /*默认的字体*/ 
        var defaultFont  = this.getDefaultFont();

        for( var i=0;i<cssFontLists.length;i++ ){
            var fontName = cssFontLists[i];

            if( this.filterFontIsCheckedInBrowser(fontName) ){
                return fontName;
            }
        }

        return defaultFont;
    },  
    /*得到font结果*/ 
    getResult: function () {
        
        var result = this.filterFonts().toLowerCase();

        /*去除iframe*/
        this._iframe.parentNode.removeChild(this._iframe);
        // delete _iframe;
        // delete _script;

        return result;
    }
    
}


/*标记的方法*/
function FILTER_UA(){

    var storage = window.sessionStorage;
    var key     = window.platform + '-ua';
    var result;

    /*不存在意味着未记录*/ 
    if( !storage.getItem(key) || storage.getItem(key) != 'true' ){

        storage.setItem(key, 'true');
        result = true;

    }else{
        result = false;
    }

    return result;
} 





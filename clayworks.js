/**
 * Clayworks.js
 * 粘土こねこね
 *
 * Copyright (c) 2012 Ayumu Sato ( http://havelog.ayumusato.com )
 *
 * Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *
 * 実行管理系のメソッド類
 *  ready
 *      よくあるやつ
 *  doll
 *      汎用クラス的なオブジェクト生成器
 *  knead
 *      依存スクリプトをロードするが，すべて非同期ロードするので依存関係に注意
 *  bake
 *      URLで分岐させて処理を適用する
 *  register
 *      モジュールを登録する
 *  fetch
 *      登録済みのモジュールを取得する
 *  depend
 *      モジュールの依存関係を宣言する（registerでラップされている前提）
 *
 *
 * きっとたぶんSupport Browser
 *  InternetExplorer 6, 7, 8, 9
 *  Firefox          3.6, newest
 *  Safari           newest
 *  Google Chrome    newest
 *  Opera            newest
 */
(function(win, doc, loc, nav) {

    "use strict";

    /**
     * Clayコアのマッピング
     *
     * @see ナビ子記法 http://handsout.jp/slide/1883
     */
    // *1 : Array#elとClaylumpのショートハンドに対応
    // *2 : 追加要素にHTMLStringを使用可
    // *3 : テストケースあり
    win.Clay = shake(ClaylumpFactory, {
        ready   : ReadyHandler,
        jsload  : ScriptLoader,

        doll    : DOLL_ClassFactory,
        bake    : BAKE_LocationDispatcher,
        knead   : KNEAD_ModuleResolver,

        register: ModuleRegister,
        fetch   : ModuleFetcher,
        depend  : ModuleDepender,

        env     : EnvironmentDetector(),
        event   : shake(EventDefine,{
            on      : EventOn,          // *1
            off     : EventOff,         // *1
            emit    : EventEmit,        // *1
//            once    : EventOnce,
//            cancel  : EventOnceCancel,
            pub     : EventPublish,
            sub     : EventSubscribe,
            unsub   : EventUnsubscribe
        }),
        element : shake(ElementQuery,{
            clazz   : ElementClass,     // *1    *3
            css     : ElementStyle,     // *1    *3
            attr    : ElementAttribute, // *1    *3
            data    : ElementDataset,   // *1    *3
            html    : ElementHTML,      // *1    *3
            text    : ElementText,      // *1    *3

            last    : ElementInsLast,   // *1 *2 *3
            first   : ElementInsFirst,  // *1 *2 *3
            before  : ElementInsBefore, // *1 *2 *3
            after   : ElementInsAfter,  // *1 *2 *3
            insert  : ElementInsert,    // *1 *2 *3
            replace : ElementReplace,   // *1 *2 *3
            wrap    : ElementWrap,      // *1 *2 *3

            empty   : ElementEmpty,     // *1    *3
            remove  : ElementRemove,    // *1    *3
            swap    : ElementSwap,      // *1    *3
            clone   : ElementClone,     // *1

            absrect : ElementAbsRectPos,// *1
            relrect : ElementRelRectPos,// *1
            center  : ElementSetCenter  // *1
        }),
        find    : {
            parent  : FindParent,       // *1    *3
            children: FindChildren,     // *1    *3
            siblings: FindSiblings,     // *1    *3
            closest : FindClosest,      // *1    *3
            next    : FindNext,         // *1    *3
            prev    : FindPrev          // *1    *3
        },
        http    : shake(NetHttp,{
            get     : NetHttpGet,
            post    : NetHttpPost,
            jsonp   : NetHttpJSONP
        }),
        widget  : {
            tmpl    : WidgetBuildTemplate
        },
        utility : {
            shake   : shake,
            fill    : fill,
            str2dom : stringToDomElement,
            toArray : toArray,
            isConst : isConstructor,
            is      : shake(isType, {
                string   : isString,    // *3
                number   : isNumber,    // *3
                array    : isArray,     // *3
                object   : isObject,    // *3
                regexp   : isRegexp,    // *3
                date     : isDate,      // *3
                nil      : isNull,      // *3
                undef    : isUndefined, // *3
                callable : isFunction,  // *3
                bool     : isBoolean,   // *3
                error    : isError,     // *3
                element  : isElement,   // *3
                numeric  : isNumeric,   // *3
                lump     : isClaylump   // *3
            }),
            size    : {
                viewport : getViewportSize,
                document : getDocumentSize,
                window   : getWindowSize
            },
            pos     : {
                window   : getWindowPosition,
                scroll   : getScrollPosition
            },
            form    : {
                data     : getFormData  // *3
            }
        }
    });

    // alias
    Clay.evt  = Clay.event;
    Clay.elm  = Clay.element;
    Clay.util = Clay.utility;

    /**
     * コアJavaScriptのprototype拡張マップ
     *
     * 前提
     *  Object.prototypeは拡張しない
     *  Arrayをfor inループで探索するならhasOwnPropertyを使うこと
     */
    // *1 : JavaScript 1.6
    // *2 : テストケースあり
    fill(String.prototype, {
        trim      : StringTrim,         // *2
        trimLeft  : StringTrimLeft,     // *2
        trimRight : StringTrimRight,    // *2
        repeat    : StringRepeat,       // *2
        camelize  : StringCamelize,     // *2
        decamelize: StringDecamelize    // *2
    });
    fill(Array.prototype, {
        indexOf     : ArrayIndexOf,     // *1 *2
        lastIndexOf : ArrayLastIndexOf, // *1 *2
        filter      : ArrayFilter,      // *1 *2
        forEach     : ArrayForEach,     // *1 *2
        every       : ArrayEvery,       // *1 *2
        map         : ArrayMap,         // *1 *2
        some        : ArraySome,        // *1 *2
        contains    : ArrayContaitns,   // *2
        el          : ArrayElementLoop  // *2
    });

    /**
     * 内部いろいろ変数
     */
    var HEAD        = doc.getElementsByTagName('head')[0],
        ENV         = Clay.env,
        BASE_URL    = loc.protocol+'//'+loc.host+loc.pathname.replace(/[a-z-_.]+$/i, ''),
        SCRIPT_ROOT = (function() {
            var scripts = HEAD.getElementsByTagName('script'),
                isClay  = /clayworks[-.\w]*js$/,
                i = 0, iz = scripts.length, test;

            for (; i<iz; i++) {
                test = scripts[i].src.replace(isClay, '');
                if (test !== scripts[i].src) {
                    return test;
                }
            }
            return null;
        })(),

        HAYATE = win['Hayate'],

        INCREMENT_JSONP   = 0,
        INCREMENT_DATASET = 0,

        MODULE_LOAD_REMAINING    = 0,
        MODULE_LOAD_DEPENDENCIES = {},

        RESERVED_JSONP_STORE    = '__cw_jsonp__',
        RESERVED_DATASET_STORE  = '__cw_dataset__',
        RESERVED_EVENT_STORE    = '__cw_event__',
        RESERVED_DELEGETE_STORE = '__cw_delegate__',
        RESERVED_STYLE_STORE    = '__cw_style__',

        TYPEOF_STRING    = '[object String]',
        TYPEOF_NUMBER    = '[object Number]',
        TYPEOF_ARRAY     = '[object Array]',
        TYPEOF_OBJECT    = '[object Object]',
        TYPEOF_REGEXP    = '[object RegExp]',
        TYPEOF_DATE      = '[object Date]',
        TYPEOF_NULL      = '[object Null]',
        TYPEOF_UNDEFINED = '[object Undefined]',
        TYPEOF_FUNCTION  = '[object Function]',
        TYPEOF_BOOLEAN   = '[object Boolean]',
        TYPEOF_ERROR     = '[object Error]',

        TYPEOF_CLAYLUMP  = '[object Claylump]'
    ;

    /**
     * 関数エイリアス
     */
    var ALIAS_toString   = Object.prototype.toString,
        ALIAS_mergeArray = Array.prototype.push;

    /**
     * 内部スタック
     */
    var STACK_READY_HANDLERS  = [],
        STACK_PUBSUB_HANDLERS = {},
        STACK_LOAD_CALLBACKS  = [];

    /**
     * 内部キャッシュ
     */
    var CACHE_TEMPLATE  = {},
        CACHE_MODULE    = {};

    /**
     * 内部フラグ
     */
    var FLG_DOM_ALREADY = false;

    /**
     * 内部メモ
     */
    var METADATA_CONTENTS      = '|BASE|COMMAND|LINK|META|NOSCRIPT|SCRIPT|STYLE|TITLE|',
        FLOW_CONTENTS          = '|A|ABBR|ADDRESS|AREA|ARTICLE|ASIDE|AUDIO|B|BDI|BDO|BLOCKQUOTE|BR|BUTTON|CANVAS|CITE|CODE|COMMAND|DATALIST|DEL|DETAILS|DFN|DIV|DL|EM|EMBED|FIELDSET|FIGURE|FOOTER|FORM|H1|H2|H3|H4|H5|H6|HEADER|HGROUP|HR|I|IFRAME|IMG|INPUT|INS|KBD|KEYGEN|LABEL|MAP|MARK|MATH|MENU|METER|NAV|NOSCRIPT|OBJECT|OL|OUTPUT|P|PRE|PROGRESS|Q|RUBY|S|SAMP|SCRIPT|SECTION|SELECT|SMALL|SPAN|STRONG|STYLE|SUB|SUP|SVG|TABLE|TEXTAREA|TIME|U|UL|VAR|VIDEO|WBR|',
        SECTIONING_CONTENTS    = '|ARTICLE|ASIDE|NAV|SECTION|',
        HEADING_CONTENTS       = '|H1|H2|H3|H4|H5|H6|HGROUP|',
        PHRASING_CONTENTS      = '|A|ABBR|AREA||AUDIO|B|BDI|BDO|BR|BUTTON|CANVAS|CITE|CODE|COMMAND|DATALIST|DEL||DFN|EM|EMBED|I|IFRAME|IMG|INPUT|INS||KBD|KEYGEN|LABEL|MAP||MARK|MATH|METER|NOSCRIPT|OBJECT|OUTPUT|PROGRESS|Q|RUBY|S|SAMP|SCRIPT|SELECT|SMALL|SPAN|STRONG|SUB|SUP|SVG|TEXTAREA|TIME|U|VAR|VIDEO|WBR|',
        EMBEDED_CONTENTS       = '|AUDIO|VANCAS|EMBED|IFRAME|IMG|MATH|OBJECT|SVG|VIDEO',
        INTERACTIVE_CONTENTS   = '|A|AUDIO|BUTTON|DETAILS|EMBED|IFRAME|IMG|INPUT|KEYGEN|LABEL|MENU|OBJECT|SELECT|TEXTAREA|VIDEO|',

        EMPTY_TAGS             = '|AREA|BASE|BASEFONT|BR|COL|FRAME|HR|IMG|INOT|ISINDEX|LINK|META|PARAM|WBR|',

        IE_HTML_READ_ONLY_TAGS = '|TABLE|TFOOT|THEAD|TR|STYLE|WBR|SCRIPT|PARAM|';

    /**
     * 内部正規表現
     */
    var RE_SELECTOR_CONCISE = /^([.#]?)[\w\-_]+$/,
        RE_SELECTOR_IDENT = /#[^\s]+$/,
        RE_TRIM_LEFT      = /^[\s　]+/,
        RE_TRIM_RIGHT     = /[\s　]+$/;

    /**
     * 代替@IE属性
     */
    var IE_FIX_ATTR = {
        'class'     : 'className',
        'for'       : 'htmlFor',
        acesskey    : 'accessKey',
        tabindex    : 'tabIndex',
        colspan     : 'colSpan',
        rowspan     : 'rowSpan',
        frameborder : 'frameBorder'
    };

    /**
     * 代替@Node
     */
    var Node = win.Node || {
        ELEMENT_NODE   : 1,
        ATTRIBUTE_NODE : 2,
        TEXT_NODE      : 3,
        COMMENT_NODE   : 8,
        DCOUMENT_NODE  : 9,
        DOCUMENT_FRAGMENT_NODE : 11
    };

    //==================================================================================================================
    // String.prototype

    /**
     * String#trim
     */
    function StringTrim() {
        return this.replace(RE_TRIM_LEFT, '').replace(RE_TRIM_RIGHT, '');
    }

    /**
     * String#trimLeft
     */
    function StringTrimLeft() {
        return this.replace(RE_TRIM_LEFT, '');
    }

    /**
     * String#trimRight
     */
    function StringTrimRight() {
        return this.replace(RE_TRIM_RIGHT, '');
    }

    /**
     * String#repeat
     * 文字列を指定回数繰り返し
     *
     * @param iz
     */
    function StringRepeat(iz) {
        var i = 0, rv = '';
        for (; i<iz; i++) {
            rv += this;
        }
        return rv;
    }

    /**
     * String#camelize
     * -か_でセパレートされた文字列をキャメライズ
     */
    function StringCamelize() {
        var chunks = this.split(/[_-]/),
                 i = 0,
                iz = chunks.length,
                rv = '';
        for (; i<iz; i++) {
            if (i === 0) {
                rv += chunks[i].toLowerCase();
            } else {
                rv += chunks[i].charAt(0).toUpperCase() + chunks[i].substr(1).toLowerCase();
            }
        }
        return rv;
    }

    /**
     * String#decamelize
     * キャメライズされた文字列を，指定されたセパレータ（デフォルトは -）でつなぐ
     *
     * @param [separator]
     */
    function StringDecamelize(separator) {
        separator || (separator = '-');
        return this.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[-_]/g, separator).toLowerCase();
    }

    //==================================================================================================================
    // Array.prototype
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array

    /**
     * Array#filter
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
     * @description
     *   <p>ある配列の要素で、与えられたフィルタリング関数が true を返したものすべてからなる新しい配列を生成します</p>
     *
     * @param {Function} callback
     * @param {Object}   thisArg
     * @return {Array}
     */
    function ArrayFilter(callback, thisArg) {
        if (!isFunction(callback)) {
            throw new TypeError('Argument is not a Function.');
        }

        var O = Object(this), i = 0, iz = O.length >>> 0, rv = [], val;

        while (i < iz) {
            if (i in O) {
                val = O[i]; // callback が this を 変化させた場合に備え
                if (callback.call(thisArg, val, i, O)) {
                    rv.push(val);
                }
            }
            i++;
        }
        return rv;
    }

    /**
     * Array#forEach
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
     * @description
     *   <p>配列中のそれぞれの要素について関数を呼び出します</p>
     *
     * @param {Function} callback
     * @param {Object}   thisArg
     * @return {void}
     */
    function ArrayForEach(callback, thisArg) {
        if (!isFunction(callback)) {
            throw new TypeError('Argument is not a Function.');
        }

        var O = Object(this), i = 0, iz = O.length >>> 0;

        while (i < iz) {
            if (i in O) {
                callback.call(thisArg, O[i], i, O);
            }
            i++;
        }
    }

    /**
     * Array#every
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
     * @description
     *   <p>ある配列の全ての要素が与えられたテスト関数を満たした場合に true を返します</p>
     *
     * @param {Function} callback
     * @param {Object}   thisArg
     * @return {Boolean}
     */
    function ArrayEvery(callback , thisArg) {
        if (!isFunction(callback)) {
            throw new TypeError('Argument is not a Function.');
        }

        var O = Object(this), i = 0, iz = O.length >>> 0;

        while (i < iz) {
            if (i in O && !callback.call(thisArg, O[i], i, O)) {
                return false;
            }
            i++;
        }
        return true;
    }

    /**
     * Array#map
     * @see https://developer.mozilla.org/ja/JavaScript/Reference/Global_Objects/Array/map
     * @description
     *   <p>ある配列の全ての要素について与えられた関数を呼び出した結果からなる新しい配列を生成します</p>
     *
     * @param {Function} callback
     * @param {Object}   thisArg
     * @return {Array}
     */
    function ArrayMap(callback, thisArg) {
        if (!isFunction(callback)) {
            throw new TypeError('Argument is not a Function.');
        }

        var O = Object(this), i = 0, iz = O.length >>> 0, rv = new Array(iz);
        while (i < iz) {
            if (i in O) {
                rv[i] = callback.call(thisArg, O[i], i, O);
            }
            i++;
        }
        return rv;
    }

    /**
     * Array#some
     * @see https://developer.mozilla.org/ja/JavaScript/Reference/Global_Objects/Array/some
     * @description
     *   <p>ある配列の少なくとも 1 つの要素が与えられたテスト関数を満たした場合に true を返します</p>
     *
     * @param {Function} callback
     * @param {Object}   thisArg
     * @return {Boolean}
     */
    function ArraySome(callback, thisArg) {
        if (!isFunction(callback)) {
            throw new TypeError('Argument is not a Function.');
        }

        var O = Object(this), i = 0, iz = O.length >>> 0;
        while (i < iz) {
            if (i in O && callback.call(thisArg, O[i], i, O)) {
                return true;
            }
            i++;
        }
        return false;
    }

    /**
     * Array#indexOf
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
     * @description
     *   <p>指定された値と等しい値を持つ最初の（添字の一番小さい）要素の添字を返します。もし見つからなかったら -1 を返します</p>
     *
     * @param {*}      search
     * @param {Number} [from]
     * @return {Number}
     */
    function ArrayIndexOf(search, from) {
        var O = Object(this), i = 0, iz = O.length >>> 0;
        if (iz === 0) {
            return -1;
        }
        if (arguments.length > 0) {
            i = ~~from;
            if (i !== i) { // shortcut for verifying if it's NaN
                i = 0;
            } else if (i !== 0 && i !== Infinity && i !== -Infinity) { // not Zero & not Infinity
                i = (i > 0 || -1) * Math.floor(Math.abs(i));
            }
        }
        if (i >= iz) {
            return -1;
        }
        var k = i >= 0 ? i : Math.max(iz - Math.abs(i), 0);
        for (; k < iz; k++) {
            if (k in O && O[k] === search) {
                return k;
            }
        }
        return -1;
    }

    /**
     * Array#lastIndexOf
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
     * @description
     *   <p>指定された値と等しい値を持つ最後の （添字の一番大きい）要素の添字を返します。もし見つからなかったら -1 を返します</p>
     *
     * @param {*}      search
     * @param {Number} from
     * @return {Number}
     */
    function ArrayLastIndexOf(search, from) {
        var O = Object(this), iz = O.length >>> 0, i = iz;
        if (iz === 0) {
          return -1;
        }
        if (arguments.length > 1) {
            i = ~~from;
            if (i !== i) {
                i = 0;
            } else if (i !== 0 && i !== Infinity && i !== -Infinity) {
                i = (i > 0 || -1) * Math.floor(Math.abs(i));
            }
        }

        var k = i >= 0 ? Math.min(i, iz - 1) : iz - Math.abs(i);
        for (; k >= 0; k--) {
            if (k in O && O[k] === search) {
                return k;
            }
        }
        return -1;
    }

    /**
     * Array#contains
     *
     * @param {*} needle
     * @return {Boolean}
     */
    function ArrayContaitns(needle) {
        for (var i in this) {
            if (this.hasOwnProperty(i) && this[i] === needle) {
                return true;
            }
        }
        return false;
    }

    /**
     * Array#el
     * Clay.ElemとClay.EventとClay.Findのメソッドの第一引数に，要素を補って実行する
     *
     * @example
     *   var Elem = Clay.Elem, Event = Clay.Event;
     *   [nodeA, nodeB, nodeC].el(Elem.clazz, '+hogehoge');
     *   [nodeA, nodeB, nodeC].el(Event.on, 'click', func);
     *
     * @param {Function} func
     * @return {Array}
     */
    function ArrayElementLoop(func) {
        var i = 0, iz = this.length, item, args = toArray(arguments).slice(1),
            rv, rvAry = [];
        for (; i<iz; i++) {
            item = this[i];
            if (item != null && item.nodeType && item.nodeType === Node.ELEMENT_NODE) {
                item = [item];
                ALIAS_mergeArray.apply(item, args);
                rv = func.apply(this, item);
                rv !== void 0 && rvAry.push(rv);
            }
        }
        return (rvAry.length !== 0) ? rvAry : this;
    }

    //==================================================================================================================
    // Claylump

    /**
     * Claylump生成器
     *
     * @param {String} expr
     */
    function ClaylumpFactory(expr) {
        var elms;
        if (isString(expr)) {
            elms = ElementQuery(expr);
        } else {
            elms = expr;
        }
        return new Claylump(elms);
    }

    /**
     * DOM操作系のショートハンドコレクション
     * Event＆Elem系のメソッドをチェインできる
     *
     * @constructor
     * @param {Node|Array} elms
     */
    function Claylump(elms) {
        if (!isArray(elms)) {
            elms = [elms];
        }
        var i = 0, iz = elms.length, that = this;

        this._elms    = elms;
        this.next     = _lumpNext;
        this.hasNext  = _lumpHasNext;
        this.rewind   = _lumpRewind;
        this.current  = _lumpCurrent;
        this.i        = _lumpIndex;
        this.toString = _lumpToString;

        function _lumpNext() {
            if (!that.hasNext()) {
                return null;
            }
            return that._elms[i++];
        }
        function _lumpHasNext() {
            return i < iz;
        }
        function _lumpRewind() {
            iz = 0;
        }
        function _lumpCurrent() {
            return that._elms[i];
        }
        function _lumpIndex(i) {
            return that._elms[i];
        }
        function _lumpToString() {
            return TYPEOF_CLAYLUMP;
        }
    }

    // ショートハンドを合成
    fill(Claylump.prototype, {
        on      : ClayFinkelize(EventOn),
        off     : ClayFinkelize(EventOff),
        emit    : ClayFinkelize(EventEmit),

        clazz   : ClayFinkelize(ElementClass),
        css     : ClayFinkelize(ElementStyle),
        attr    : ClayFinkelize(ElementAttribute),
        data    : ClayFinkelize(ElementDataset),
        html    : ClayFinkelize(ElementHTML),
        text    : ClayFinkelize(ElementText),

        last    : ClayFinkelize(ElementInsLast),
        first   : ClayFinkelize(ElementInsFirst),
        before  : ClayFinkelize(ElementInsBefore),
        after   : ClayFinkelize(ElementInsAfter),
        insert  : ClayFinkelize(ElementInsert),
        replace : ClayFinkelize(ElementReplace),
        wrap    : ClayFinkelize(ElementWrap),

        empty   : ClayFinkelize(ElementEmpty),
        remove  : ClayFinkelize(ElementRemove),

        swap    : ClayFinkelize(ElementSwap),
        clone   : ClayFinkelize(ElementClone),

        absrect : ClayFinkelize(ElementAbsRectPos),
        relrect : ClayFinkelize(ElementRelRectPos),
        center  : ClayFinkelize(ElementSetCenter),

        parent  : ClayFinkelize(FindParent),
        children: ClayFinkelize(FindChildren),
        siblings: ClayFinkelize(FindSiblings),
        closest : ClayFinkelize(FindClosest),
        next    : ClayFinkelize(FindNext),
        prev    : ClayFinkelize(FindPrev)
    });

    /**
     * 部分適用
     *
     * @this {Claylump}
     * @param func
     */
    function ClayFinkelize(func) {
        function _finkelize() {
            var i = 0, elms = this._elms, elm, rv, rvAry = [];

            while (elm = elms[i++]) {
                elm = [elm];
                ALIAS_mergeArray.apply(elm, toArray(arguments));
                rv = func.apply(this, elm);
                rv !== void 0 && rvAry.push(rv);
            }

            // rvAry.lengthが0でなければ結果をreturnする : 配列の長さが1なら，配列を解除して返す
            // rvAry.lengthが0であれば，thisを返してチェーンを継続する
            return rvAry.length !== 0 ? (rvAry.length === 1 ? rvAry[0] : rvAry)
                                      : this;
        }
        return _finkelize;
    }

    //==================================================================================================================
    // Utility
    /**
     * オブジェクトを積極的に合成
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Object}
     */
    function shake(a, b) {
        var i;
        for (i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }
        return a;
    }

    /**
     * オブジェクトを消極的に合成
     * prototype拡張に利用
     *
     * @param {Object} base
     * @param {Object} pad
     * @return {void}
     */
    function fill(base, pad) {
        var k;
        for (k in pad) {
            if (pad.hasOwnProperty(k)) {
                k in base || (base[k] = pad[k]);
            }
        }
    }

    /**
     * オブジェクトを積極的に合成
     * クラス継承に利用?
     *
     * @param {Object} base
     * @param {Object} over
     * @return {void}
     */
    function override(base, over) {
        var k;
        for (k in over) {
            if (over.hasOwnProperty(k)) {
                base[k] = over[k];
            }
        }
    }

    /**
     * ArrayっぽいObject(NodeList, HTMLCollection)を，Arrayに変換
     *
     * @param {Object} list
     */
    function toArray(list) {
        if (!ENV.IE678) {
            return Array.prototype.slice.call(list);
        } else {
            var rv= new Array(list.length), i = list.length;
            for (; i-->0;)
                if (i in list) {
                    rv[i]= list[i];
                }
            return rv;
        }
    }

    /**
     * 主要な型の判別
     * @description
     *   <p>null, undefinedはブラウザによって[object Null], [object Undefined]と返さない</p>
     *   <ul>
     *     <li>Internet Explorer : [object Object]</li>
     *     <li>Opera             : [object Window]</li>
     *     <li>iOS Mobile Safari : [object DOMWindow]</li>
     *     <li>Android           : [object Android]</li>
     *   </ul>
     *
     *
     * @param {*} mixed
     * @return {String|Boolean}
     */
    // @todo issue: PS3で動いていない？
    function isType(mixed) {
        if (mixed != null) {
            return ALIAS_toString.call(mixed);
        } else {
            return mixed === null ? TYPEOF_NULL : TYPEOF_UNDEFINED;
        }
    }

    /**
     * コンストラクタを調べる
     * 型判別を行うだけであればObject.prototype.toString（のエイリアス）のほうが速そう
     * Operaのみconstructor.nameのほうが速いが，他のモダンブラウザよりどちらの方法も遅い
     *
     * @param mixed
     * @return string
     */
    function isConstructor(mixed) {
        if (mixed == null) {
            return mixed === null ? 'Null' : 'Undefined';
        }
        var base = mixed.constructor;
        return ALIAS_toString.call(mixed) === TYPEOF_FUNCTION
               ? ( 'name' in base ? base.name : (''+base).replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1'))
               : base;
    }

    /**
     * isXXX
     * @param {Object} obj
     * @return {Boolean}
     */
    function isString(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_STRING;
    }
    function isNumber(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_NUMBER;
    }
    function isArray(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_ARRAY;
    }
    function isObject(obj) {
        if (ENV.IE678) {
            if (obj === null || obj === void 0) {
                return false;
            }
        }
        return ALIAS_toString.call(obj) === TYPEOF_OBJECT;
    }
    function isRegexp(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_REGEXP;
    }
    function isDate(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_DATE;
    }
    function isNull(obj) {
        return obj === null;
    }
    function isUndefined(obj) {
        return obj === void 0;
    }
    function isFunction(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_FUNCTION;
    }
    function isBoolean(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_BOOLEAN;
    }
    function isError(obj) {
        return ALIAS_toString.call(obj) === TYPEOF_ERROR;
    }
    function isElement(obj) {
        return obj != null && obj.nodeType !== void 0 && obj.nodeType === Node.ELEMENT_NODE;
    }
    function isNumeric(obj) {
        // Number または String で空文字でなく数値化してNanにならないこと
        return isNumber(obj)   ||
               isString(obj)   &&
               obj !== ''      &&
               !isNaN(obj-0);
    }
    function isClaylump(obj) {
        return ''+obj === TYPEOF_CLAYLUMP;
    }

    /**
     * 文字列からDOM要素を生成する
     *
     * @param {String}   html
     * @param {Document} [root]
     * @return {DocumentFragment}
     */
    function stringToDomElement(html, root) {
        root = root || doc;
        if (ENV.IE6789) {
            var ph = root.createElement('div');
            ph.innerHTML = html;
            return ph.firstChild;
        } else {
            var range = root.createRange();
            range.selectNodeContents(root.body);
            return range.createContextualFragment(html);
        }
    }

    /**
     * ウインドウのサイズを取得する
     * @see http://help.dottoro.com/ljjrmtvx.php
     *
     * @return {Object}
     */
    function getWindowSize() {
        var rv, d, cW, cH, fW, fH, tW, tH;
        if ('outerWidth' in win) {
            rv = {
                width  : win.outerWidth,
                height : win.outerHeight
            };
        } else {
            d = doc.documentElement || doc.body;

            cW = d.clientWidth;
            cH = d.clientHeight;

            win.resizeTo(cW, cH);

            fW = cW - d.clientWidth;
            fH = cH - d.clientHeight;
            tW = cW + fW;
            tH = cH + fH;

            win.resizeTo(tW, tH);

            // repair phase
            if (cW != d.clientWidth || cH != d.clientHeight) {
                fW = tW - d.clientWidth;
                fH = tH - d.clientHeight;
                tW = cW + fW;
                tH = cH + fH;
            }
            rv = {
                width  : tW,
                height : tH
            }
        }
        return rv
    }

    /**
     * 表示領域のサイズを取得する
     *
     * @return {Object}
     */
    function getViewportSize() {
        return {
            width  : win.innerWidth  || doc.documentElement.clientWidth  || doc.body.clientWidth,
            height : win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight
        }
    }

    /**
     * ドキュメント領域のサイズを取得する
     *
     * @return {Object}
     */
    function getDocumentSize() {
        return {
            width  : doc.documentElement.scrollWidth  || doc.body.scrollWidth,
            height : doc.documentElement.scrollHeight || doc.body.scrollHeight
        }
    }

    /**
     * ウインドウ位置を取得する
     *
     * @return {Object}
     */
    function getWindowPosition() {
        return {
            x : win.screenX || win.screenLeft,
            y : win.screenY || win.screenTop
        }
    }

    /**
     * スクロール量を取得する
     *
     * @return {Object}
     */
    function getScrollPosition() {
        return {
            x : win.pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft,
            y : win.pageYOffset || doc.documentElement.scrollTop  || doc.body.scrollTop
        }
    }

    /**
     * フォーム内のvalueをPOST用データとして取得する
     * @see http://havelog.ayumusato.com/develop/javascript/e312-func_form_data2object.html
     *
     * @param {Node} form
     * @return {Object}
     */
    function getFormData(form) {
        if (form.tagName !== 'FORM') {
            throw new TypeError('Argument must be HTMLFormElement.');
        }

        var elms = toArray(form.elements),
            e, i, pos, isAry, name, val, rv = {},
            list = [], li,
            option, j, jz;

        // form.elementsのHTMLCollectionにtype="image"は含まれない
        // innerHTMLにtype="image"らしいのがあれば探索してみる
        // @see http://d.hatena.ne.jp/rikuba/20100916/1284569774
        if (form.innerHTML.indexOf('type="image"') || form.innerHTML.indexOf("type='image'")) {
            list = toArray(form.getElementsByTagName('input'));
            i = 0;
            while (li = list[i++]) {
                if (li.type === 'image') {
                    elms.push(li);
                }
            }
        }

        i = 0;
        while (e = elms[i++]) {
            // 無効・未チェックの項目はスキップ
            // form.elementsに含まれるfieldset要素もスキップ
            if (
                e.disabled === true ||
                e.type === 'radio'    && e.checked === false ||
                e.type === 'checkbox' && e.checked === false ||
                e.tagName === 'FIELDSET' ||
                0
            ) {
                continue;
            }

            pos   = e.name.lastIndexOf('[');
            isAry = pos !== -1;
            name  = isAry ? e.name.substr(0, pos) : e.name;
            val   = e.value;

            // multiple属性のついたSELECT要素
            // nameが[]になっていなければ，multipleであってもデータ送信しない
            if (e.tagName === 'SELECT' && e.multiple === true && isAry) {
                rv[name] || (rv[name] = []);

                j   = 0;
                jz  = e.length;
                for (; j<jz; j++) {
                    option = e[j];
                    if (option.selected === true) {
                        rv[name].push(option.value);
                    }
                }
            } else if (isAry) {
                rv[name] || (rv[name] = []);

                rv[name].push(val);
            } else {
                rv[name] = val;
            }
        }

        return rv;
    }

    //==================================================================================================================
    // Executioner

    /**
     * DOM構築済み判定ゲート
     *
     * @param {Function} handler
     * @return {void}
     */
    function ReadyHandler(handler) {
        if (!!FLG_DOM_ALREADY) {
            handler(Clay);
        } else {
            STACK_READY_HANDLERS.push(handler);
        }
    }

    /**
     * クラスライクなオブジェクトの生成器
     *
     * @param {String} name
     */
    function DOLL_ClassFactory(name) {
        // @todo issue: 実装する
    }

    /**
     * URLからアクションを焼き上げ
     * DOMの構築は待たない
     *
     * @example
     *   Clay.Bake({
     *       '*'           : function() {
     *          // 常に実行
     *      },
     *      'foo/:name'   : function(params) {
     *          // URLの一部を引数として受け取る
     *          // var name = params.name;
     *      },
     *      'hige/moja'   : function() {
     *          Clay.Knead(['anim', 'control'], function() {
     *              // Kneadと併用するときにシンタックスシュガーを入れる？
     *          })
     *      }
     *   }, true, false);
     *
     * @param {Object}   conditions
     * @param {Boolean}  hashchange
     * @param {Boolean}  pushstate
     * @return {void}
     */
    function BAKE_LocationDispatcher(conditions, hashchange, pushstate) {
        // @todo issue: pushstate, hashchangeにも反応するように
        var path = loc.pathname, condition, always,
            evals = {}, params = {};

        // 常時実行型を保持
        if ('*' in conditions) {
            always = conditions['*'];
            delete conditions['*'];
        }

        // 評価器を作成
        // パラメーターは1つのみ保持
        // @todo issue: baseUrlを考慮させる
        // @todo issue: 複数のパラメーターを取れるようにする
        for (condition in conditions) {
            if (conditions.hasOwnProperty(condition)) {
                evals[condition] = condition.replace(/:([a-z-_.+]+)/i, '([\\w.]+)');
                RegExp.$1 && (params[condition] = RegExp.$1);
            }
        }

        function _resolve() {
            var args = {}, needle;
            if (always !== void 0) {
                always(Clay);
            }
            for (needle in evals) {
                if (evals.hasOwnProperty(needle) && path.match(evals[needle])) {
                    RegExp.$1 && (args[params[needle]] = RegExp.$1);
                    conditions[needle](Clay, args);
                }
            }
        }
        _resolve();
    }

    /**
     * 必要なモジュールをModuleListLoaderを通して読み込んでからCALLBACKを実行する
     * DOMの構築を待つ
     *
     * @example
     *   Clay.Knead('modules/control', function() {
     *       // 関係モジュール読み込み後に実行
     *   });
     *
     * @param {String|Array} modules
     * @param {Function}     callback
     * @return {void}
     */
    function KNEAD_ModuleResolver(modules, callback) {
        modules = (typeof modules === 'string') ? [modules] : modules;

        // ここで溜められたcallbackは ModuleListLoader#_junction 内で解決される
        STACK_LOAD_CALLBACKS.push(callback);
        ModuleListLoader(modules);
    }

    /**
     * Knead等で解決済みのモジュールを読み込む
     *
     * @throw {ReferenceError}
     * @param {String} path
     * @return {*}
     */
    function ModuleFetcher(path) {
        if (CACHE_MODULE[path]) {
            return CACHE_MODULE[path](Clay);
        } else {
            throw new ReferenceError('Specified module have not load yet.');
        }
    }

    /**
     * モジュールを追加する
     * 他の依存モジュールが宣言されていれば，ModuleListLoaderを実行する
     *
     * @param {String} path
     * @param {Array} dependencies
     * @param {Object|Function} registerObject
     * @return {void}
     */
    function ModuleRegister(path, dependencies, registerObject) {
        if (arguments.length === 3) {
            ModuleListLoader(dependencies);
        } else {
            registerObject = dependencies;
        }
        CACHE_MODULE[path] = registerObject;
    }

    /**
     * モジュールの依存関係を事前に宣言する
     *
     * @param {Object} dependencies
     * @return {void}
     */
    function ModuleDepender(dependencies) {
        MODULE_LOAD_DEPENDENCIES = shake(MODULE_LOAD_DEPENDENCIES, dependencies);
    }

    /**
     * 与えられたモジュールのリストをロードする
     * スクリプトロードには，_junctionが渡される．
     * _junctionが監視するLOAD_REMAININGが0になった時点でcallbackを実行
     *
     * @param {Array} list
     * @return {void}
     */
    function ModuleListLoader(list) {
        var item, i = 0, depend;

        if (!isArray(list)) {
            list = [list];
        }

        MODULE_LOAD_REMAINING += list.length;

        while (item = list[i++]) {
            if (!CACHE_MODULE[item]) {
                // 事前に宣言された依存関係があればロードする
                if (depend = MODULE_LOAD_DEPENDENCIES[item]) {
                    ModuleListLoader(depend);
                }
                ScriptLoader(SCRIPT_ROOT+item.replace('.', '/')+'.js', _junction, true, false);
            } else {
                _junction();
            }
        }

        /**
         * callbackのスタックを後ろから順に，ReadyHandler越しに実行する
         *
         * @return {void}
         */
        function _junction() {
            MODULE_LOAD_REMAINING--;
            if (0 === MODULE_LOAD_REMAINING) {
                var i, iz = STACK_LOAD_CALLBACKS.length >>> 0;
                for (i = iz; i--;) {
                    ReadyHandler(STACK_LOAD_CALLBACKS[i]);
                }
                STACK_LOAD_CALLBACKS = [];
            }
        }
    }

    /**
     * スクリプトをロードする
     *
     * @param {String}   path
     * @param {Function} callback
     * @param {Boolean}  async
     * @param {Boolean}  defer
     * @return {void}
     */
    function ScriptLoader(path, callback, async, defer) {
        defer  = defer === void 0 ? false : defer;
        async  = async === void 0 ? false : async;

        var script = doc.createElement('script');

        script.src     = path;
        script.type    = 'text/javascript';
        script.charset = 'utf-8';
        script.async   = async;
        script.defer   = defer;

        script.onload = script.onreadystatechange = function() {
            script.onload = script.onreadystatechange = null;
            callback && callback();
        };
        HEAD.appendChild(script);
    }

    //==================================================================================================================
    // Environment

    /**
     * クライアント環境の情報を取得する
     *
     * @return {Object}
     */
    function EnvironmentDetector() {
        // @todo issue: mobile browser判定
        // @todo issue: ゲーム機類の判定
        var ua     = nav.userAgent.toUpperCase(),
            RE_RENDERRING_ENGINE = /(TRIDENT|WEBKIT|GECKO|PRESTO)\/([\d\.]+)/,
            RE_MOBILE_DEVICE     = /(?=ANDROID).+(MOBILE)|(ANDROID|IPAD|IPHONE|IPOD|BLACKBERRY|WINDOWS PHONE|WEBOS)/,
            RE_MOBILE_OS         = /(ANDROID|[IPHONE ]?OS|BLACKBERRY\d+|WINDOWS PHONE OS|WEBOS)[\s\/]([\d\._]+)/,
            RE_DESKTOP_BROWSER   = /(CHROME|OPERA|IE|FIREFOX|VERSION)[\/\s]([\d\.]+)/,
            RE_DESKTOP_OS        = /(WINDOWS|MAC|LINUX)[\sA-Z;]+([\d\._]+)/,
            RE_GAME_DEVICE       = /(PLAYSTATION 3|PSP \(PlayStation Portable\))[;\s]+([\d\.]+)/,
            matches,
            rv    = {
                TRIDENT : false,
                GECKO   : false,
                WEBKIT  : false,
                PRESTO  : false,

                IE      : false,
                IE6     : false,
                IE67    : false,
                IE678   : false,
                IE6789  : false,

                FIREFOX : false,
                CHROME  : false,
                SAFARI  : false,
                OPERA   : false,

                ANDROID : false,
                IOS     : false,
                WINPHONE: false,
                BBERRY  : false,
                WEBOS   : false,

                WINDOWS : false,
                LINUX   : false,
                MAC     : false,

                PS3     : false,
                PSP     : false,

                PC      : false,
                PHONE   : false,
                TABLET  : false,
                GAME    : false,

                WEBAPP  : ('standalone' in window.navigator && window.navigator.standalone) ? true : false,
                SSL     : loc.protocol === 'https:',

                F_ADE   : !!doc.addEventListener
            };

        // rendering engine
        if (matches = ua.match(RE_RENDERRING_ENGINE)) {
            rv[matches[1]] = parseFloat(matches[2]);
        }

        if (matches = ua.match(RE_MOBILE_DEVICE)) {
            // [Mobile device sequence]

            // device type
            if (!matches[1] && matches[2] === 'ANDROID' || matches[2] === 'IPAD') {
                rv.TABLET = true;
            } else {
                rv.PHONE = true;
            }

            // mobile os
            if (matches = ua.match(RE_MOBILE_OS)) {
                matches[2] = parseFloat(matches[2].replace('_', '.'));
                switch (matches[1]) {
                    case ' OS'           : rv.IOS      = matches[2]; break;
                    case 'ANDROID'       : rv.ANDROID  = matches[2]; break;
                    case 'WINDOWS PHONE' : rv.WINPHONE = matches[2]; break;
                    case 'BLACKBERRY'    : rv.BBERRY   = matches[2]; break;
                    case 'WEBOS'         : rv.WEBOS    = matches[2]; break;
                }
            }
        }
        else if (matches = ua.match(RE_GAME_DEVICE)) {
            // [Game device sequence]

            // device type
            rv.GAME = true;

            // device platform
            matches[2] = parseFloat(matches[2]);
            switch (matches[1]) {
                case 'PLAYSTATION 3'              : rv.PS3 = matches[2]; break;
                case 'PSP (PlayStation Portable)' : rv.PSP = matches[2]; break;
            }
        }
        else {
            // [Desktop device sequence]

            // device type
            rv.PC = true;

            // browser type
            if (matches = ua.match(RE_DESKTOP_BROWSER)) {
                rv[(matches[1] === 'VERSION' ? 'SAFARI'
                                             : matches[1])] = parseFloat(matches[2]);
                if (rv.IE) {
                    rv.IE6    = rv.IE < 7;
                    rv.IE67   = rv.IE < 8;
                    rv.IE678  = rv.IE < 9;
                    rv.IE6789 = rv.IE < 10;
                }
            }

            // desktop os
            if (matches = ua.match(RE_DESKTOP_OS)) {
                rv[matches[1]] = parseFloat(matches[2].replace('_', '.'));
            }
        }

        return rv;
    }

    //==================================================================================================================
    // Feature Adaptive

    // @ie6-
    /**
     * IE6を対象にXMLHttpRequestを埋める
     */
    function AdaptiveIE6XHR() {
        var dict = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], i = 0;
        for (; i<4; i++) {
            try {
                return new ActiveXObject(dict[i]);
            } catch (e) {
                /*...*/
            }
        }
        throw new Error('Failed to create ActiveXObject.');
    }
    if ( ENV.IE6 ) {
        win.XMLHttpRequest = AdaptiveIE6XHR;
    }
    // -ie6@

    // @ie67-
    if ( ENV.IE67 ) {
        win.XDomainRequest = AdaptiveIE67XDR;
    }
    /**
     * IE67を対象にXDomainRequestを埋める
     */
    function AdaptiveIE67XDR() {
        // @todo issue: IE67でXDomainRequest風のインターフェースを再現する
    }
    /**
     * IE67を対象にgetElementsByClassNameを埋める
     * @param clazz
     */
    function AdaptiveGetElementsByClassName(clazz) {
        var elms = this.getElementsByTagName('*'),
          evClass = ' '+clazz+' ',
                i = 0,
               rv = [],
                e;

        while (e = elms[i]) {
            if (e.nodeType === Node.ELEMENT_NODE && (' '+e.className+' ').indexOf(evClass) !== -1) {
                rv.push(e);
            }
            i++;
        }
        rv.item = function(i) {
            return this[i];
        };
        return rv;
    }
    // -ie67@

    // @moz-
    /**
     * Mozillaを対象にouterHTMLを埋める
     */
    function AdaptiveOuterHTML() {
        var r = doc.createRange(), tub = doc.createElement('div');
        r.selectNode(this);
        tub.appendChild(r.cloneContents());
        r.detach();
        return tub.innerHTML;
    }
    if ( ENV.FIREFOX && !'outerHTML' in HTMLElement.prototype ) {
        HTMLElement.prototype.__defineGetter__('outerHTML', AdaptiveOuterHTML);
    }
    // -moz@

    //==================================================================================================================
    // Event
    // @todo issue: hover, change, submit の動作をlive含めてクロスブラウザ化
    /**
     * DOMイベントを定義
     *
     * @see Javascript Madness Mouse Events http://unixpapa.com/js/mouse.html
     * @see JavaScript Madness Keyboard Events http://unixpapa.com/js/key.html
     * @see DOM Level 2 Events http://www.w3.org/TR/DOM-Level-2-Events/events.html
     * @see DOM Level 3 Events http://www.w3.org/TR/DOM-Level-3-Events/
     *
     * @param {Node|Array}  target
     * @param {String}   type
     * @param {String}   expr
     * @param {Function} listener
     * @param {Boolean}  bubble
     * @param {Boolean}  remove
     * @return {void}
     */
    function EventDefine(target, type, expr, listener, bubble, remove) {

        /**
         * DOM Level2 Event相当にノーマライズ
         *
         * @param {Event} event
         * @return {void}
         */
        function _normalize(event) {
            var scopes, evtTarget, e, i = 0;

            // for IE678
            if (ENV.IE678) {

                // イベントオブジェクト
                event        = win.event;
                // イベントターゲット
                event.target = (type === 'readystatechange') ? document : event.srcElement;

                if (event.target.nodeType === Node.TEXT_NODE) {
                    event.target = event.target.parentNode;
                }

                // リスナーターゲット
                event.currentTarget = target;

                // リレイテッドターゲット
                if ('mouseover' === type) {
                    event.relatedTarget = event.fromElement;
                }
                else if ('mouseout' === type) {
                    event.relatedTarget = event.toElement;
                }
//                else {
//                    event.relatedTarget = event.fromElement || event.toElement;
//                }

                // button -> which
                event.which = event.button === 1 ? 1 :
                              event.button === 2 ? 3 :
                              event.button === 4 ? 2 : 1;

                // pageX/Yを補填
                // @todo issue: elm.ownerDocument の参照に変える
                event.pageX = event.clientX + doc.documentElement.scrollLeft;
                event.pageY = event.clientY + doc.documentElement.scrollTop;

                event.stopPropagation = function() {
                    event.cancelBubble = true;
                };
                event.preventDefault = function() {
                    event.returnValue  = false;
                }
            }

            // scope指定がなければそのままcall
            if (expr === null) {
                listener.call(target, event);
            // 委譲scopeを探索してイベントターゲットが含まれていればcall
            } else {
                // イベントターゲット
                evtTarget    = event.target;

                scopes = ElementQuery(expr, event.currentTarget);

                if (!isArray(scopes)) {
                    scopes = [scopes];
                }

                while (e = scopes[i++]) {
                    if (e === evtTarget) {
                        listener.call(evtTarget, event);
                        event.stopPropagation();
                        return;
                    }
                }
            }
        }

        var evaluator, listeners, closures, i, iz, recorder;

        recorder = !!expr ? RESERVED_DELEGETE_STORE : RESERVED_EVENT_STORE;

        // 要素のイベント記録領域を初期化
        target[recorder] || (target[recorder] = {
            listener : {},
            closure  : {}
        });
        listeners = target[recorder].listener[type] || (target[recorder].listener[type] = []);
        closures  = target[recorder].closure[type]  || (target[recorder].closure[type]  = []);

        // 評価リスナを決定 & 記録
        if (!remove) {
            evaluator =  _normalize;
            listeners.push(listener);
            closures.push(evaluator);
        } else {
            i  = 0;
            iz = listeners.length;
            for (; i<iz; i++) {
                if ( listeners[i] === listener ) {
                    evaluator = closures[i];
                    listeners.splice(i, 1);
                    closures.splice(i, 1);
                    break;
                }
            }
        }

        if (ENV.F_ADE) {
            // addEventListenerを使えれば使う
            if (remove) {
                target.removeEventListener(type, evaluator, !!bubble);
            } else {
                target.addEventListener(type, evaluator, !!bubble);
            }
        } else {
            // レガシーIE, PS3
            if (remove) {
                target.detachEvent('on'+type,  evaluator);
            } else {
                target.attachEvent('on'+type,  evaluator);
            }
        }
    }

    /**
     * DOMイベントを追加
     *
     * Pattern1 ( bind )
     *   (elm) type, handler
     *
     * Pattern2 ( delegate / live )
     *   (elm) type, expr, handler
     *
     * @return {void}
     */
    function EventOn() {
        var target, type, expr, handler, bubble;

        switch(arguments.length) {
            case 3:
                target = arguments[0];
                type   = arguments[1];
                expr   = null;
                handler= arguments[2];
                bubble = false;
            break;

            case 4:
                target = arguments[0];
                type   = arguments[1];
                expr   = arguments[2];
                handler= arguments[3];
                bubble = true;
            break;

            default:
                throw new Error('Arugments are missing.');
            break;
        }
        EventDefine(target, type, expr, handler, bubble, false);
    }

    /**
     * DOMイベントを破棄
     *
     * Pattern1 ( unbind )
     *   (elm) type, handler
     *
     * Pattern2 ( undelegate / unlive )
     *   (elm) type, expr, handler
     *
     * @return {void}
     */
    function EventOff() {
        var target, type, expr, handler, bubble;

        switch(arguments.length) {
            case 3:
                target = arguments[0];
                type   = arguments[1];
                expr   = null;
                handler= arguments[2];
                bubble = false;
            break;

            case 4:
                target = arguments[0];
                type   = arguments[1];
                expr   = arguments[2];
                handler= arguments[3];
                bubble = true;
            break;

            default:
                throw new Error('arugments are missing.');
            break;
        }
        EventDefine(target, type, expr, handler, bubble, true);
    }

    /**
     * DOMイベントを任意発火
     *
     * @param {Node|Array}    target
     * @param {String|Event}  type
     * @param {Boolean}       bubble
     * @param {Boolean}       cancel
     * @return {void}
     */
    function EventEmit(target, type, bubble, cancel) {
        var event, orgEvent,
            b = bubble || false,
            c = cancel || true;

        if (!isString(type)) {
            orgEvent = type;
            type = orgEvent.type;
        }

        // @todo issue: イベントオブジェクトの引き継ぎが適当＆半端

        if (ENV.IE678) {
            event = doc.createEventObject();
            if (orgEvent) {
                event.detail  = orgEvent.detail;
                event.screenX = orgEvent.screenX;
                event.clientX = orgEvent.clientX;
                event.clientY = orgEvent.clientY;
                event.ctrlKey = orgEvent.ctrlKey;
                event.altKey  = orgEvent.altKey;
                event.shiftKey= orgEvent.shiftKey;
                event.metaKey = orgEvent.metaKey;
                event.button  = orgEvent.button;
                event.target  = orgEvent.target;
                event.keyCode = orgEvent.keyCode;
                event.currentTarget = orgEvent.currentTarget;
                event.relatedTarget = orgEvent.relatedTarget;
            }
            target.fireEvent('on'+type, event);
        } else {
            switch(type) {
                case 'click':
                case 'dbclick':
                case 'mouseover':
                case 'mousemove':
                case 'mouseout':
                case 'mouseup':
                case 'mousedown':
                    event = doc.createEvent('MouseEvents');
                    if (orgEvent) {
                        event.initMouseEvent(
                                type,
                                b,
                                c,
                                win,
                                orgEvent.detail,
                                orgEvent.screenX,
                                orgEvent.screenY,
                                orgEvent.clientX,
                                orgEvent.clientY,
                                orgEvent.ctrlKey,
                                orgEvent.altKey,
                                orgEvent.shiftKey,
                                orgEvent.metaKey,
                                orgEvent.button,
                                orgEvent.relatedTarget
                        );
                    } else {
                        event.initEvent(type, b, c)
                    }
                break;
                case 'keyup':
                case 'keydown':
                case 'keypress':
                    event = doc.createEvent('KeyboardEvent');
                    if (orgEvent) {
                        var modifierList = '';

                        if (!!orgEvent.ctrlKey) {
                            modifierList += 'Control ';
                        }
                        if (!!orgEvent.altKey) {
                            modifierList += 'Alt ';
                        }
                        if (!!orgEvent.shiftKey) {
                            modifierList += 'Shift ';
                        }
                        if (!!orgEvent.metaKey) {
                            modifierList += 'Meta';
                        }

                        event.initKeyboardEvent(
                                type,
                                b,
                                c,
                                win,
                                orgEvent.keyCode,
                                orgEvent.location,
                                modifierList
                        );
                    } else {
                        event.initEvent(type, b, c)
                    }
                break;
                default:
                    event = doc.createEvent('Event');
                    event.initEvent(type, b, c);
                break;
            }
            target.dispatchEvent(event)
        }
    }

    /**
     * DOM非依存の独自イベントを購読
     *
     * @param {String}   type
     * @param {Function} subscriber
     * @return {void}
     */
    function EventSubscribe(type, subscriber) {
        var stack = (STACK_PUBSUB_HANDLERS[type] || (STACK_PUBSUB_HANDLERS[type] = [])), i = 0, tmp;

        while (tmp = stack[i++]) {
            if (tmp === subscriber) {
                return;
            }
        }
        stack.push(subscriber);
    }


    /**
     * DOM非依存の独自イベントを購読解除
     *
     * @param {String}   type
     * @param {Function} [unsubscriber]
     * @return {void}
     */
    function EventUnsubscribe(type, unsubscriber) {
        var stack = (STACK_PUBSUB_HANDLERS[type] || (STACK_PUBSUB_HANDLERS[type] = [])),
            i = -1, tmp;

        if (!unsubscriber) {
            stack = [];
        } else {
            while (tmp = stack[++i]) {
                if (tmp === unsubscriber) {
                    stack.splice(i, 1);
                }
            }
        }
    }

    /**
     * DOM非依存の独自イベントを発行
     *
     * @param {String}       type
     * @param {Array|Object} [args]
     * @return {void}
     */
    function EventPublish(type, args) {
        if (STACK_PUBSUB_HANDLERS[type] !== void 0) {
            var subscribers = STACK_PUBSUB_HANDLERS[type], i = 0, subscriber;
            while (subscriber = subscribers[i++]) {
                subscriber.apply(this, args);
            }
        }
    }

    //==================================================================================================================
    // Selector
    /**
     * セレクタクエリの受け取り
     *
     * @param {String} expr
     * @param {Node}   [contexts]
     * @return {Array|Node}
     */
    function ElementQuery(expr, contexts) {
        var rv = [],
            ctx, i = 0,
            tmp, j, p, e, uid, idx;

        // Claylumpが渡されたときは中身を抽出する
        if (isClaylump(contexts)) {
            contexts = contexts._elms;
        }

        // ※ Hayate.jsを利用するときに配列でコンテキストを与えると，セレクタが複数回走るので低速
        // IE分岐コメントでHayate.jsを読み分けていれば，IE以外でこの低速化は起こらない
        if (!!HAYATE) {
            if (isArray(contexts)) {
                tmp = [];
                j   = 0;
                while (ctx = contexts[i++]) {
                    ALIAS_mergeArray.apply(tmp, HAYATE(expr, ctx));
                }

                p   = 0;
                idx = {};
                while (e = tmp[j++]) {
                    uid = e.uniqueId;
                    if (!idx[uid]) {
                        idx[uid] = true;
                        rv[p++] = e;
                    }
                }
            } else {
                rv = HAYATE(expr, contexts);
            }
        } else {
            rv = ElementSelector(expr, contexts);
        }

        // 最後がIDセレクタで終わるクエリだった場合のみ，arrayを剥がす
        if (rv.length === 1 && !!RE_SELECTOR_IDENT.test(expr.trim())) {
            return rv[0]
        } else {
            return rv;
        }
    }

    /**
     * Selector
     * ブラウザ実装に依存する簡易セレクター
     *
     * @param {String} expr
     * @param {Node|Array} roots
     * @return {Array}
     */
    function ElementSelector(expr, roots) {
        var rv = [], root, i = 0;

        roots = roots || [doc];

        if (!isArray(roots)) {
            roots = [roots];
        }

        if (RE_SELECTOR_CONCISE.test(expr)) {
            switch(RegExp.$1) {
                case '#':
                    while (root = roots[i++]) {
                        if (root.nodeType < 9) {
                            root = root.ownerDocument;
                        }
                        ALIAS_mergeArray.apply(rv, [root.getElementById(expr.substr(1))]);
                    }
                break;
                case '.':
                    if (roots[0].getElementsByClassName) {
                        while (root = roots[i++]) {
                            ALIAS_mergeArray.apply(rv, toArray(root.getElementsByClassName(expr.substr(1))));
                        }
                    } else {
                        while (root = roots[i++]) {
                            ALIAS_mergeArray.apply(rv, toArray(AdaptiveGetElementsByClassName.call(root, expr.substr(1))));
                        }
                    }
                break;
                default:
                    while (root = roots[i++]) {
                        ALIAS_mergeArray.apply(rv, toArray(root.getElementsByTagName(expr)));
                    }
                break;
            }
        } else {
            if (roots[0].querySelectorAll) {
                while (root = roots[i++]) {
                    ALIAS_mergeArray.apply(rv, toArray(root.querySelectorAll(expr)));
                }
            } else {
                throw new Error('This browser could not understand recevieing query.');
            }
        }

        return rv;
    }

    //==================================================================================================================
    // Element
    /**
     * クラス操作
     *
     * @param {Node}   elm
     * @param {String} oClazz 1byte目が制御子+2byte目以降がクラス名
     * @return {Boolean|void}
     */
    function ElementClass(elm, oClazz) { // operator(str1)+className(str*)
        var opr = oClazz.substr(0, 1),
          clazz = oClazz.substr(1),
            has = (' '+elm.className+' ').indexOf(' '+clazz+' ') != -1;

        opr = (opr === '@') ? ( !!has ? '-' : '+' )
                            : opr;

        if (opr === '+') {
            elm.className += !has ? ' '+clazz : '';
            return void 0;
        }
        else if (opr === '-') {
            elm.className = !!has ? (' '+elm.className+' ').replace(' '+clazz+' ', ' ').replace(/\s{2,}/, ' ')
                                  : elm.className;
            return void 0;
        }
        else if (opr === '?') {
            return has;
        }
        else {
            throw new Error('receive illegal operator.');
        }
    }

    /**
     * CSS操作
     *
     * 主にCSSStyleDeclarationに対するアクセス
     * setするときは，elm.style
     * getするときは，elm.ownerDocument.defaultView.getComputedStyle
     *
     * @param {Node}                elm
     * @param {String|Object|Array} key
     * @param {String}              [val]
     * @return {String|Object|void}
     */
    function ElementStyle(elm, key, val) {

        elm[RESERVED_STYLE_STORE] || (elm[RESERVED_STYLE_STORE] = 'defaultView' in elm.ownerDocument
                                                                ? elm.ownerDocument.defaultView.getComputedStyle(elm, null)
                                                                : elm.currentStyle);

        if (arguments.length === 3) {
            // set property
            elm.style[key] = val;
            return void 0;
        }
        else if (arguments.length === 2) {
            var k;
            switch (isType(key)) {
                // get property
                case TYPEOF_STRING:
                    return elm[RESERVED_STYLE_STORE][key];
                break;
                // set properties
                case TYPEOF_OBJECT:
                    for (k in key) {
                        if (key.hasOwnProperty(k)) {
                            elm.style[k] = key[k];
                        }
                    }
                    return void 0;
                break;
                // get properties
                case TYPEOF_ARRAY:
                    var styles = elm[RESERVED_STYLE_STORE],
                        i = 0, rv = {};
                    while (k = key[i++]) {
                        styles[k] && (rv[k] = styles[k]);
                    }
                    return rv;
                break;
            }
        }
        else {
            throw new Error('invalid arguments');
        }
    }

    /**
     * 属性をgetまたはsetする
     *
     * @param {Node}   elm
     * @param {String} key
     * @param {String} [val]
     * @return {String|void}
     */
    function ElementAttribute(elm, key, val) {
        if (ENV.IE67 && key in IE_FIX_ATTR) {
            key = IE_FIX_ATTR[key];
        }
        if (val !== void 0) {
            elm.setAttribute(key, val);
        } else {
            return elm.getAttribute(key);
        }
    }

    /**
     * data-*に値をgetまたはsetする
     *
     * string や number でない値の扱い
     * setするときは，elm._data[ident] に value を，data-{key} には ident を渡す
     * getするときは，data-{key} から ident を取得し，elm._data[ident] を返す
     *
     * @param {Node}     elm
     * @param {String}   key
     * @param {String|*} [val]
     * @return {*|void}
     */
    function ElementDataset(elm, key, val) {
        if ( val !== void 0 ) {
            var type = isType(val), ident;

            if ( type !== TYPEOF_STRING && type !== TYPEOF_NUMBER) {
                elm[RESERVED_DATASET_STORE] || (elm[RESERVED_DATASET_STORE] = {});

                ident = '__ident-'+INCREMENT_DATASET++;

                // _dataに本来のvalを格納
                elm[RESERVED_DATASET_STORE][ident] = val;

                // valをidentに差し替え
                val = ident;
            }
            if ('dataset' in elm) {
                elm.dataset[key] = val;
            } else {
                elm.setAttribute('data-'+key.decamelize(), val);
            }
        } else {
            var rv = 'dataset' in elm ? elm.dataset[key]
                                      : elm.getAttribute('data-'+key.decamelize());

            if (rv !== null && rv !== void 0 && rv.indexOf('__ident-') === 0) {
                rv = elm[RESERVED_DATASET_STORE][rv];
            }
            return rv;
        }
    }

    /**
     * 指定した要素のinnerHTMLをgetまたはsetする
     * get時にFx3.6向けの処理が挟んでいる
     * @see http://stackoverflow.com/questions/3736474/firefox-add-a-xmlns-http-www-w3-org-1999-xhtml
     *
     * @param {Node}   elm
     * @param {String} html
     * @return {String}
     */
    function ElementHTML(elm, html) {
        if (html !== void 0) {
            // @todo issue: readonlyな要素を検知して処理を分岐させる
            return elm.innerHTML = html;
        } else {
            if (ENV.FIREFOX) {
                var tag = elm.tagName, regex = new RegExp('<'+tag+' xmlns=".+?">(.*?)<\/'+tag+'>', 'gi');
                return elm.innerHTML.replace(regex, '$1');
            } else {
                return elm.innerHTML;
            }
        }
    }

    /**
     * 指定した要素のtextContentをgetまたはsetする
     * IE6-8かつSCRIPT要素であれば、innerHTMLを優先して参照する
     * @see http://d.hatena.ne.jp/cou929_la/20110517/1305644081
     * @see http://clubajax.org/plain-text-vs-innertext-vs-textcontent/
     *
     * @param {Node}   elm
     * @param {String} txt
     * @return {String}
     */
    function ElementText(elm, txt) {
        if (txt !== void 0) {
            return ENV.IE678 ? elm.innerText = txt : elm.textContent = txt;
        } else {
            return ENV.IE678 ? (elm.tagName === 'SCRIPT' ? elm.innerHTML : elm.innerText)
                             : elm.textContent;
        }
    }

    /**
     * 要素内の後尾に，他の要素を追加
     *
     * @param {Node}        elm
     * @param {Node|String} addElm
     * @return {void}
     */
    function ElementInsLast(elm, addElm) {
        ElementInsert(elm, addElm, 'beforeEnd');
    }

    /**
     * 要素内の先頭に，他の要素を追加
     *
     * @param {Node}        elm
     * @param {Node|String} addElm
     * @return {void}
     */
    function ElementInsFirst(elm, addElm) {
        ElementInsert(elm, addElm, 'afterBegin');
    }

    /**
     * 要素の前に，他の要素を追加
     *
     * @param {Node}        elm
     * @param {Node|String} addElm
     * @return {void}
     */
    function ElementInsBefore(elm, addElm) {
        ElementInsert(elm, addElm, 'beforeBegin');
    }

    /**
     * 要素の後に，他の要素を追加
     *
     * @param {Node}        elm
     * @param {Node|String} addElm
     * @return {void}
     */
    function ElementInsAfter(elm, addElm) {
        ElementInsert(elm, addElm, 'afterEnd');
    }

    /**
     * 要素を追加する
     *
     * @param {Node}        elm
     * @param {Node|String} addElm
     * @param {String}      where
     * @return {void}
     */
    function ElementInsert(elm, addElm, where) {
        var html, range;
        if (typeof addElm === 'string') {
            if (elm.insertAdjacentHTML) {
                elm.insertAdjacentHTML(where, addElm);
                return;
            } else {
                html = addElm;
            }
        }

        // Claylumpが渡ったときは，最初の要素のみ取り扱う
        if (addElm instanceof Claylump) {
            addElm = addElm._elms[0];
        }

        if (html !== void 0) {
            range = elm.ownerDocument.createRange();
            range['setStart'+(where.indexOf('End') !== -1 ? 'After' : 'Before')](elm);
            addElm = range.createContextualFragment(html);
        }

        switch (where) {
            case 'beforeBegin'  : // before
                elm.parentNode.insertBefore(addElm, elm);
                break;
            case 'afterBegin'   : // first
                elm.insertBefore(addElm, elm.firstChild);
                break;
            case 'beforeEnd'    : // last
                elm.appendChild(addElm);
                break;
            case 'afterEnd'     : // after
                elm.parentNode.insertBefore(addElm, elm.nextSibling);
                break;
        }
    }

    /**
     * 指定した要素を，別の要素で置き換える
     *
     * @param {Node} targetElm
     * @param {Node} replaceElm
     * @return {void}
     */
    function ElementReplace(targetElm, replaceElm) {
        if (typeof replaceElm === 'string') {
            replaceElm = stringToDomElement(replaceElm);
        }
        targetElm.parentNode.replaceChild(replaceElm, targetElm);
    }

    /**
     * 指定した要素を，別の要素で包む
     *
     * @param {Node} targetElm
     * @param {Node} wrapElm
     * @return {void}
     */
    function ElementWrap(targetElm, wrapElm) {
        if (typeof wrapElm === 'string') {
            wrapElm = stringToDomElement(wrapElm);
        }
        ElementInsert(targetElm, wrapElm, 'beforeBegin');
        targetElm.previousSibling.appendChild(targetElm);
    }

    /**
     * 指定した要素の子要素をすべて削除する
     *
     * @param {Node|Array} elm
     * @return {void}
     */
    function ElementEmpty(elm) {
        elm.innerHTML = '';
    }

    /**
     * 指定した要素を削除する
     *
     * @param {Node|Array} elm
     * @return {void}
     */
    function ElementRemove(elm) {
        elm.parentNode.removeChild(elm);
    }

    /**
     * 要素Aと要素Bの位置を入れ替える
     * イベントを引き継ぎたいので，Node#cloneNodeは使用しない
     *
     * @param {Node} elmA
     * @param {Node} elmB
     * @return {void}
     */
    function ElementSwap(elmA, elmB) {
        var parentB = elmB.parentNode, needle = elmB.nextSibling;
        elmA.parentNode.replaceChild(elmB, elmA);
        parentB.insertBefore(elmA, needle);
    }

    /**
     * 指定した要素を複製して返す
     * withEventがtrueのときイベントをクローンするが，delegateイベントはクローンしない
     * 子孫要素のイベント・データ類はクローンしない
     *
     * @see http://d.hatena.ne.jp/uupaa/20100508/1273299874
     *
     * @param {Node}    elm
     * @param {Boolean} [withEvent]
     * @param {Boolean} [withData]
     * @return {Node}
     */
    function ElementClone(elm, withEvent, withData) {

        function _eventCopy(clone, evtrec) {
            var type, i, iz, listeners;
            for (type in evtrec) {
                if (evtrec.hasOwnProperty(type)) {
                    listeners = evtrec[type];
                    i  = 0;
                    iz = listeners.length;
                    for (; i<iz; i++) {
                        EventDefine(clone, type, null, listeners[i], false, false);
                    }
                }
            }
        }

        function _dataCopy(clone, datrec) {
            var key;
            for (key in datrec) {
                if (datrec.hasOwnProperty(key)) {
                    clone[RESERVED_DATASET_STORE][key] = datrec[key];
                }
            }
        }

        var clone, evtrec, datrec;

        evtrec = elm[RESERVED_EVENT_STORE].listener;
        datrec = elm[RESERVED_DATASET_STORE];

        if ( ENV.IE678 ) {
            clone = stringToDomElement(elm.cloneNode(true).outerHTML);
        } else {
            clone = elm.cloneNode(true);
        }

        if (withEvent && evtrec) {
            _eventCopy(clone, evtrec);
        }

        if (withData && datrec) {
            _dataCopy(clone, datrec);
        }

        return clone;
    }

    /**
     * 要素の表示領域内の絶対座標と，矩形の幅と高さを返す ( border-boxモデル )
     * getBoundingClientRectの実装が必要
     *
     * @param {Node} elm
     * @return {Object}
     */
    function ElementAbsRectPos(elm) {
        var rect = elm.getBoundingClientRect(),
            body = elm.ownerDocument.body;

        if ((ENV.IE67 || ENV.IE8 && doc.documentMode < 8)/* && body === elm.parentNode*/) {
            rect.top    -= 2;
            rect.bottom -= 2;
            rect.left   -= 2;
            rect.right  -= 2;
        }

        return {
            top    : rect.top,
            bottom : rect.bottom,
            left   : rect.left,
            right  : rect.right,
            width  : rect.width  || (rect.right  - rect.left),
            height : rect.height || (rect.bottom - rect.top)
        };
    }

    /**
     * 要素の親要素との相対座標と，矩形の幅と高さを返す
     *
     * @param {Node} elm
     * @param {Node} [parent]
     * @return {Object}
     */
    function ElementRelRectPos(elm, parent) {
        var crit = ElementAbsRectPos(parent || elm.parentNode),
            self = ElementAbsRectPos(elm);

        return {
            top    : self.top    - crit.top,
            bottom : crit.bottom - self.bottom,
            left   : self.left   - crit.left,
            right  : crit.right  - self.right
        };
    }

    /**
     * 要素を中央に配置する
     * デフォルトはviewportに対しての中央
     *
     * @param {Node} elm
     * @param {Node} [crit]
     */
    // @todo issue: ロジックの整理が必要
    function ElementSetCenter(elm, crit) {
        var self = ElementAbsRectPos(elm), from, to, xy,
            pos = {}, fix = {}, relbase = false;

        function _isRelative(elm) {
            var e = elm, state;
            while (e = e.parentNode) {
                // documentに突き当たったら終了
                if (e === doc) {
                    return false;
                }
                state = ElementStyle(e, 'position');
                if (state === 'absolute' || state === 'relative') {
                    return e;
                }
            }
            return false;
        }

        // critがあって，スタイルのtop, leftと座標が異なれば相対基準をチェック
        xy = ElementStyle(elm, ['top', 'left']);
        if (crit && self.top !== xy.top && self.left !== xy.left) {
            relbase = _isRelative(elm);
        }

        // 相対基準がいるか？
        if (relbase !== false) {
            // 相対基準とcritは同一か？
            if (crit && crit === relbase) {
                // 1.相対座標でfix
                to = ElementAbsRectPos(crit);

                pos.left = (to.width  - self.width)  / 2 + 'px';
                pos.top  = (to.height - self.height) / 2 + 'px';
            } else {
                // 2.relbaseとcritの座標をあわせて，矩形サイズの比較から中央を算出する -> noteみる
                to   = ElementAbsRectPos(crit);
                from = ElementAbsRectPos(relbase);

                fix.top  = to.top  - from.top;
                fix.left = to.left - from.left;

                pos.left = (to.width  - self.width)  / 2 + fix.left + 'px';
                pos.top  = (to.height - self.height) / 2 + fix.top  + 'px';
            }
        } else {
            // critはあるか？
            if (crit) {
                // 3.単純に絶対座標同士でフィックス
                to = ElementAbsRectPos(crit);

                pos.left = (to.width  - self.width)  / 2 + to.left + 'px';
                pos.top  = (to.height - self.height) / 2 + to.top  + 'px';
            } else {
                // 4.単純にviewportの中央にする
                // @todo issue: スクロール量を加味できるようにする
                to = getViewportSize();

                pos.left = (to.width  - self.width)  / 2  + 'px';
                pos.top  = (to.height - self.height) / 2  + 'px';
            }
        }

        ElementStyle(elm, pos);
    }

    //==================================================================================================================
    // Find
    /**
     * 指定した要素の親要素を返す
     * r オプションで再帰処理 (BODYで止める)
     *
     * @param {Node} elm
     * @param {Boolean} [r]
     * @return {Node}
     */
    function FindParent(elm, r) {
        if (!r) {
            return elm.parentNode;
        } else {
            var e = elm, rv = [];
            while (e = e.parentNode) {
                rv.push(e);
                if (e.tagName === 'BODY') {
                    break;
                }
            }
            return rv;
        }
    }

    /**
     * 指定した要素の子要素を返す
     * r オプションで再帰処理
     *
     * @param {Node} elm
     * @param {Boolean} [r]
     * @return {Array}
     */
    function FindChildren(elm, r) {
        var list = elm.childNodes, i = 0, iz = list.length, rv = [], e;
        for (; i<iz; i++) {
            e = list[i];
            if (e.nodeType === Node.ELEMENT_NODE) {
                rv.push(e);
                if (r && e.childNodes) {
                    ALIAS_mergeArray.apply(rv, FindChildren(e, true));
                }
            }
        }
        return rv;
    }

    /**
     * 指定した要素の兄弟要素を返す
     *
     * @param {Node} elm
     * @param {Boolean} [withSelf]
     * @return {Array}
     */
    function FindSiblings(elm, withSelf) {
        var e, rv = [];

        e = elm;
        while (e = e.previousSibling) {
            if (e.nodeType === Node.ELEMENT_NODE) {
                rv.push(e);
            }
        }

        if (withSelf) {
            rv.push(elm);
        }

        e = elm;
        while (e = e.nextSibling) {
            if (e.nodeType === Node.ELEMENT_NODE) {
                rv.push(e);
            }
        }

        return rv;
    }

    /**
     * 指定した要素名を，直近の先祖要素から返す
     * 見つからなかった場合はnullを返す
     *
     * @param {Node}   elm
     * @param {String} tag
     * @return {Node}
     */
    function FindClosest(elm, tag) {
        var e = elm, t = tag.toUpperCase();

        while (e = e.parentNode) {
            if (e.nodeType === Node.ELEMENT_NODE && e.tagName === t) {
                return e;
            }
        }
        return null;
    }

    /**
     * 指定した要素の，次の要素を返す
     * 見つからなかった場合はnullを返す
     *
     * @param {Node} elm
     * @return {Node}
     */
    function FindNext(elm) {

        if (elm.nextElementSibling !== void 0) {
            return elm.nextElementSibling;
        } else {
            var e = elm;
            while (e = e.nextSibling) {
                if (e.nodeType === Node.ELEMENT_NODE) {
                    return e;
                }
            }
            return null;
        }
    }

    /**
     * 指定した要素の，前の要素を返す
     * 見つからなかった場合はnullを返す
     *
     * @param {Node} elm
     * @return {Node}
     */
    function FindPrev(elm) {
        if (elm.previousElementSibling !== void 0) {
            return elm.previousElementSibling;
        } else {
            var e = elm;
            while (e = e.previousSibling) {
                if (e.nodeType === Node.ELEMENT_NODE) {
                    return e;
                }
            }
            return null;
        }
    }

    //==================================================================================================================
    // Http
    /**
     * HTTPリクエスト
     *
     * @param {String} path      リクエストパス
     * @param {String} method    リクエストメソッド GET|POST
     * @param {Object} callbacks コールバック success|error|complete|200(コード)|2xx(クラス)
     * @param {Object} [options] オプション
     * @return {XMLHttpRequest}
     */
    function NetHttp(path, method, callbacks, options ) {
        options || (options = {});

        var xhr, encoded = [], item, i, iz,
            async     = options.async || true,
            data      = options.data  || null,
            type      = options.type  || null;
            callbacks = typeof callbacks === 'function' ? { complete: callbacks } : callbacks;

        // IE678のみクロスドメインリクエストのときに、XDomainRequestを使用する
        if (ENV.IE678) {
            xhr =  !!path.match(/^https?:\/\//) ? new XDomainRequest() : new XMLHttpRequest();
        } else {
            xhr = new XMLHttpRequest();
        }
        xhr.onreadystatechange = _readyStateChange;

        /**
         * XHRの状態監視
         *
         * return {void}
         */
        function _readyStateChange() {
            if (xhr.readyState === 4) {
                var statusCode  = xhr.status.toString(),
                    statusClass = statusCode.replace(/^([1-5]{1})\d{2}$/, '$1xx'),
                    contentType = xhr.getResponseHeader('Content-Type'),
                    response;

                if (contentType !== null) {
                    switch(contentType.substr(0, contentType.indexOf(';')).trim()) {
                        case 'text/xml' :
                            response = xhr.responseXML;
                        break;
                        case 'text/json':
                        case 'text/javascript':
                        case 'application/json':
                        case 'application/javascript':
                        case 'application/x-javascript':
                            response = JSON.parse(xhr.responseText);
                        break;
                        default:
                            response = xhr.responseText;
                        break;
                    }
                }

                // success or error
                switch(statusClass) {
                    case '2xx':
                        callbacks['success'] && callbacks['success'](response, xhr);
                    break;
                    case '4xx':
                    case '5xx':
                        callbacks['error'] && callbacks['error'](response, xhr);
                    break;
                }

                // 200, 401, 503 etc...
                callbacks[statusCode] && callbacks[statusCode](response, xhr);

                // 2xx, 4xx, 5xx etc...
                callbacks[statusClass] && callbacks[statusClass](response, xhr);

                // completed
                callbacks['complete'] && callbacks['complete'](response, xhr);

                xhr.abort();
            }
        }

        // ajax open
        xhr.open(method.toUpperCase(), path, async);
        //xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest'); // @todo maybe: クロスドメイン時に含まれるとダメ？

        // url encode
        if (method === 'POST' && data !== null) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    item = data[key];
                    if (isArray(item)) {
                        i  = 0;
                        iz = item.length;
                        for (; i<iz; i++) {
                            encoded.push((encodeURIComponent(key+'['+i+']') + '=' + encodeURIComponent(item[i])).replace('%20', '+'));
                        }
                    } else {
                        encoded.push((encodeURIComponent(key) + '=' + encodeURIComponent(item)).replace('%20', '+'));
                    }
                }
            }
            data = encoded.join('&');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }

        // send
        xhr.send(data);

        return xhr;
    }

    /**
     * GETリクエスト
     *
     * @param {String} path      リクエストパス
     * @param {Object} callbacks コールバック success|error|complete|200(コード)|2xx(クラス)
     * @param {Object} [options] オプション
     * @return {XMLHttpRequest}
     */
    function NetHttpGet(path, callbacks, options) {
        return NetHttp(path, 'GET', callbacks, options);
    }

    /**
     * POSTリクエスト
     *
     * @param {String} path      リクエストパス
     * @param {Object} callbacks コールバック success|error|complete|200(コード)|2xx(クラス)
     * @param {Object} [options] オプション
     * @return {XMLHttpRequest}
     */
    function NetHttpPost(path, callbacks, options) {
        return NetHttp(path, 'POST', callbacks, options);
    }

    /**
     * JSONPリクエスト
     *
     * @param {String}   path      リクエストパス
     * @param {String}   specifier コールバック関数名を指定するパラメータ名
     * @param {Function} callback  コールバック
     * @return {void}
     */
    function NetHttpJSONP(path, specifier, callback) {
        var script       = doc.createElement('script'),
            callbackname = RESERVED_JSONP_STORE + INCREMENT_JSONP++;

        script.type = 'text/javascript';
        script.src  = path + '&' + specifier + '=' + callbackname;

        /**
         * JSONP受け取りクロージャ
         *
         * @param json
         * @return {void}
         */
        // @todo issue: onloadとonerrorのコールバックを指定可能にする
        function _jsonpClosure(json) {
            callback(json);
            HEAD.removeChild(script);
            window[callbackname] = null;
        }
        window[callbackname] = _jsonpClosure;

        HEAD.appendChild(script);
    }

    //==================================================================================================================
    // Widget
    /**
     * 文字列からテンプレート評価器を作成
     *
     * @param {String} tmpl
     * @return {Function}
     */
    function WidgetBuildTemplate(tmpl) {
        return CACHE_TEMPLATE[tmpl] || (CACHE_TEMPLATE[tmpl] = new Function('data',
            "var p=[];" +
            "p.push('"+
                tmpl.replace(/[\r\n\t]/g, ' ')
                    .split("'").join("\\'")
                    .split(/\s{2,}/).join(' ')
//                    .replace(/%\{([\s\S]+?)\}%/g, "',($1),'").replace(/\\'/g, "'")
                    .replace(
                        /{([a-zA-Z0-9_\-\[\]\.]+)}/g,
                        "',data.$1,'"
                    )
                    .replace(
                        /<loop:(\w+)>([\s\S]*?)<\/loop:\w+>/g,
                        "');for(var i=0,iz=data.$1.length;i<iz;i++){p.push('$2');}p.push('"
                    )
                +"');"
            +"return p.join('');"
        ));
    }

    //==================================================================================================================
    // Ready
    /**
     * DOMReady
     * @see Dean Edwards: window.onload (again) http://dean.edwards.name/weblog/2006/06/again/#comment367184
     */
    function _readyStackExec() {
        FLG_DOM_ALREADY = true;
        var i = 0, ready;
        while (ready = STACK_READY_HANDLERS[i++]) {
            ready(Clay);
        }
        STACK_READY_HANDLERS = [];
    }

    function _readyStateTest() {
        if (/^(loaded|complete)$/.test(doc.readyState)) {
            _readyStackExec();
            EventOff(doc, 'readystatechange', _readyStateTest);
        }
    }

    // DomContentLoaded利用可能ブラウザ
    if (
        ENV.IOS     ||
        ENV.ANDROID ||
        ENV.CHROME  ||
        ENV.FIREFOX ||
        ENV.IE >= 9 ||
        ENV.SAFARI  ||
        ENV.OPERA
    ) {
        EventOn(doc, 'DOMContentLoaded', _readyStackExec);
    }
    else if (doc.readyState) {
        EventOn(doc, 'readystatechange', _readyStateTest);
    }
    else {
        EventOn(doc, 'load', _readyStackExec);
    }

})(window, document, location, navigator);

/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }

            gap += indent;
            partial = [];

            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== void 0) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

            throw new SyntaxError('JSON.parse');
        };
    }
})();
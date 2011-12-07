/**
 * Clay.module.control
 *
 * Copyright (c) 2011 Ayumu Sato ( http://havelog.ayumusato.com )
 *
 * Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */
(function(c_) {
    c_.register('modules.control', {
        keys: ControlKeys,
        drag: ControlDrag
    });

    /**
     * ショートカットキーを簡略評価
     */
    // @todo issue: 実装する
    function ControlKeys() {
        var elem, scope, keymap;
        // @todo issue: 本当に複数パタンの引数受け入れが必要？
        switch (arguments.length) {
            case 2:
                elem    = arguments[0];
                scope   = null;
                keymap  = arguments[1];
            break;
            case 3:
                elem    = arguments[0];
                scope   = arguments[1];
                keymap  = arguments[2];
            break;
        }
        function _keyDetector(e) {
            var fnc;
            if (fnc = keymap[e.keyCode] && typeof fnc === 'function') {
                fnc.call(elem, e);
            }
        }
        c_.Event.on(elem, scope, 'keypress', _keyDetector);
    }

    /**
     * ドラッグ動作を可能にする
     * 指定される要素は，position:absoluteでなくてはならない
     *
     * @param {Node}   elm
     * @param {Object} handlers
     * @return {void}
     */
    function ControlDrag(elm, handlers) {

        var dragging, dragClosure, initialPosition,
            ownerDoc = elm.ownerDocument;

        handlers = handlers || {};

        // @todo issue: ウインドウ外に出たときにイベント制御が手放されている
        c_.Event.on(elm, 'mousedown', _draggingStart);
        c_.Event.on(ownerDoc, 'mouseup', _draggingEnd);

        // position:absoluteを強制
        c_.Elem.css(elm, 'position', 'absolute');

        function _draggingStart(e) {
            // ドラッグ開始
            dragging = true;

            // 初期位置を保持＆明示
            initialPosition = elm.getBoundingClientRect();
            c_.Elem.css(elm, {
                left     : initialPosition.left,
                top      : initialPosition.top
            });

            var initialOffsetX  = e.offsetX || e.layerX,
                initialOffsetY  = e.offsetY || e.layerY;

            handlers.move && handlers.move.call(elm, e);

            // ドラッグ中のイベント
            dragClosure = function _movingHandler(e) {
                var movingX = e.pageX - initialOffsetX,
                    movingY = e.pageY - initialOffsetY;

                c_.Elem.css(elm, {
                    top     : movingY+'px',
                    left    : movingX+'px'
                });
                handlers.move && handlers.move.call(elm, e, movingX, movingY);

                // mousemoveによる文字列選択を抑止(IE678)
                // @ie678-
                e.preventDefault();
                // -ie678@
            };
            // ドラッグ動作開始
            c_.Event.on(ownerDoc, 'mousemove', dragClosure);

            // mousedownによる文字列選択を抑止
            e.preventDefault();
        }

        function _draggingEnd(e) {
            // ドラッグ終了
            if (!!dragging) {
                dragging = false;

                c_.Event.off(ownerDoc, 'mousemove', dragClosure);
                handlers.end && handlers.end.call(elm, e, initialPosition.left, initialPosition.top);
            }
        }
    }

})(Clay);

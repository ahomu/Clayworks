#Clayworks.js

仕込み中です...

世間のライブラリが当たり前に行っている処理を自分で実装してみるテスト．
黒魔術成分僅少です．

##Usage

とりあえずレベルのメモ書き

Clay.ready(function(c) {
    // into your business

    /**
     * basics
     *
     * c.elemで取得するとピュアなElementを直接返します
     * 今の時点でセレクタエンジンを搭載してないので，セレクタはブラウザ依存しています
     * メソッド群は本体スクリプトの冒頭を読めば大体書いてあります
     */
    var elmMado = c.elem('#mado'),
        elmHomu = c.elem('#homu'),
        elmAry  = c.elem('.qbee');

    c.elem.clazz(elmAry, '+mamiru');

    c.elem.replace(elmMado, elmHomu);


    /**
     * short hands
     *
     * jQuery的に書くとClaylumpオブジェクトが返ってメソッドチェーンします
     * 使い勝手詰め込み途中
     */
    c('#mado').css('display', 'none').clazz('+gainen');

    c('#homu').on('click', function() {
        // click! click!
    });
});


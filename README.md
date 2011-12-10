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
     * メソッド群は本体スクリプトの冒頭を読めば大体書いてあります
     */
    var elmMado = c.Elem('#mado'),
        elmHomu = c.Elem('#homu'),
        elmAry  = c.Elem('.qbee');

    c.Elem.clazz(elmAry, '+mamiru');

    c.Elem.replace(elmMado, elmHomu);


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


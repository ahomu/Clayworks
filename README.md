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
        var elmMado = c.elm('#mado'),
            elmHomu = c.elm('#homu'),
            elmAry  = c.elm('.qbee');

        c.elm.clazz(elmAry, '+mamiru');

        c.elm.replace(elmMado, elmHomu);


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

##Hayate.jsの統合

Clayworks.jsは，セレクタエンジン[Hayate.js](https://github.com/ahomu/Hayate "ahomu/Hayate - GitHub")の統合をサポートしています．

Hayate.jsの統合は，（今のところ）消極的に行うことを推奨しています．querySelectorAllが利用できない，または実装が半端なIE8以前でのみHayate.jsを読み込んで統合します．その他のブラウザではquerySelectorAllが利用されます．

    <!--[if lte IE 9]><script src="/src/js/hayate.js"></script><![endif]-->
    <script src="/src/css/clayworks.js"></script>

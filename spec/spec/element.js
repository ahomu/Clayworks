// @todo issue: HTML文字列の比較系をIE678でもテスト通過できるように考える
describe('Clay.element', function() {
    var testDiv, testList, attrTest, insertTest,
        domId     = function(id){return document.getElementById(id)},
        domCreate = function(elm){return document.createElement(elm)};

    beforeEach(function() {

        loadFixtures('element.html');

        testDiv    = domId('testDiv');

        testList   = domId('testList');

        attrTest   = domId('attrTest');

        insertTest = domId('insertTest');
    });

    it('can get style', function() {
        var getHeight = '200px';

        testDiv.style.height = getHeight;

        expect(Clay.elm.css(testDiv, 'height')).toBe(getHeight);
    });

    it('can get several style', function() {
        var getStyle = {
            height: '200px',
            width : '300px'
        };

        testDiv.style.height = getStyle.height;
        testDiv.style.width  = getStyle.width;

        expect(Clay.elm.css(testDiv, ['height', 'width'])).toEqual(getStyle);
    });

    it('can set style', function() {
        var changeWidth = '300px';
        Clay.elm.css(testDiv, 'width', changeWidth);

        expect(testDiv.style.width).toBe(changeWidth);
    });

    it('can set several style', function() {
        var setStyle = {
            height: '200px',
            width : '300px'
        };
        Clay.elm.css(testDiv, setStyle);

        expect(testDiv.style.height).toBe(setStyle.height);
        expect(testDiv.style.width).toBe(setStyle.width);
    });

    it('can add class', function() {
        var addClassName = 'addTest';
        Clay.elm.clazz(testDiv, '+'+addClassName);

        expect(testDiv.className).toContain(addClassName);
    });

    it('can remove class', function() {
        var removeClassName = 'removeTest';
        testDiv.className = removeClassName;
        Clay.elm.clazz(testDiv, '-'+removeClassName);

        expect(testDiv.className).toNotContain(removeClassName);
    });

    it('can know has class', function() {
        var hasClassName = 'removeTest';
        testDiv.className = hasClassName;

        expect(Clay.elm.clazz(testDiv, '?'+hasClassName)).toBe(true);
        expect(Clay.elm.clazz(testDiv, '?undefined')).toBe(false);
    });

    it('can get attribute', function() {
       expect(Clay.elm.attr(attrTest, 'target')).toBe(attrTest.target);
    });

    it('can set attribute', function() {
        Clay.elm.attr(attrTest, 'target', '_self');
        expect(attrTest.target).toBe('_self');
    });

    it('can get string from custom data-attribute', function() {
        expect(Clay.elm.data(attrTest, 'test')).toBe('hogehoge');
    });

    it('can set string from custom data-attribute', function() {
        Clay.elm.data(attrTest, 'test', 'fugafuga');
        expect(attrTest.getAttribute('data-test')).toBe('fugafuga');
    });

    it('can set & get mixed data to custom data-attribute', function() {
        var obj = {hoge:'fuga'};

        Clay.elm.data(attrTest, 'testObj', obj);
        expect(Clay.elm.data(attrTest, 'testObj')).toEqual(obj);
    });

    it('can set & get HTML strings into Element', function() {
        var html = '<div id="setHTML">foo<span>bar</span></div>';

        Clay.elm.html(attrTest, html);
        expect(Clay.elm.html(attrTest)).toEqual(html);
    });

    it('can set & get TextNode strings into Element', function() {
        var text = 'Lorem ipsum dolor sit amet';

        Clay.elm.text(attrTest, text);
        expect(Clay.elm.text(attrTest)).toEqual(text);
    });

    it('can insert elment as last child', function() {
        var li = domCreate('li'),
            strLi = '<li>INSERT ELEMENT</li>';

        Clay.elm.last(insertTest, li);
        expect(insertTest.lastChild).toEqual(li);

        Clay.elm.last(insertTest, strLi);
        expect(insertTest.lastChild.outerHTML).toEqual(strLi);
    });

    it('can insert elment as first child', function() {
        var li = domCreate('li'),
            strLi = '<li>INSERT ELEMENT</li>';

        Clay.elm.first(insertTest, li);
        expect(insertTest.firstChild).toEqual(li);

        Clay.elm.first(insertTest, strLi);
        expect(insertTest.firstChild.outerHTML).toEqual(strLi);
    });

    it('can insert elment where target before', function() {
        var li = domCreate('li'),
            strLi = '<li>INSERT ELEMENT</li>';

        Clay.elm.before(insertTest, li);
        expect(insertTest.previousSibling).toEqual(li);

        Clay.elm.before(insertTest, strLi);
        expect(insertTest.previousSibling.outerHTML).toEqual(strLi);
    });

    it('can insert elment where target after', function() {
        var li = domCreate('li'),
            strLi = '<li>INSERT ELEMENT</li>';

        Clay.elm.after(insertTest, li);
        expect(insertTest.nextSibling).toEqual(li);

        Clay.elm.after(insertTest, strLi);
        expect(insertTest.nextSibling.outerHTML).toEqual(strLi);
    });

    it('can replace element', function() {
        var hoge      = domId('hoge'),
            fuga      = domId('fuga'),
            hogeChild = domId('hoge-child'),
            fugaChild = domId('fuga-child');

        expect(fugaChild.parentNode).toBe(fuga);
        Clay.elm.replace(hogeChild, fugaChild);
        expect(fugaChild.parentNode).toBe(hoge);
        if (!Clay.env.IE678) {
            expect(hogeChild.parentNode).toBeNull();
        } else {
            expect(hogeChild.parentNode.nodeType).toBe(11);
        }

        // 親子関係を失ったfugaChildとfuga（のouterHTML）を入れ替える
        Clay.elm.replace(fugaChild, fuga.outerHTML);
        fuga = domId('fuga');
        expect(fuga.parentNode).toBe(hoge);
    });

    it('can wrap element', function() {
        var hoge      = domId('hoge'),
            fuga      = domId('fuga'),
            hogeChild = domId('hoge-child'),
            fugaChild = domId('fuga-child');

        expect(fugaChild.parentNode).toBe(fuga);
        Clay.elm.wrap(fugaChild, hoge);
        expect(fugaChild.parentNode).toBe(hoge);

        expect(hogeChild.parentNode).toBe(hoge);
        Clay.elm.wrap(hogeChild, '<div id="fromString"></div>');
        expect(hogeChild.parentNode.id).toBe('fromString');
    });

    it('can element to be empty (delete all childNodes)', function() {
        var hoge = domId('hoge');

        expect(hoge.childNodes.length).toBeGreaterThan(0);
        Clay.elm.empty(hoge);
        expect(hoge.childNodes.length).toBe(0);
    });

    it('can remove element', function() {
        var hoge      = domId('hoge'),
            hogeChild = domId('hoge-child');

        expect(Clay.util.toArray(hoge.childNodes)).toContain(hogeChild);
        Clay.elm.remove(hogeChild);
        expect(Clay.util.toArray(hoge.childNodes)).toNotContain(hogeChild);
    });

    it('can swap element', function() {
        var hoge      = domId('hoge'),
            fuga      = domId('fuga'),
            hogeChild = domId('hoge-child'),
            fugaChild = domId('fuga-child');

        expect(hogeChild.parentNode).toBe(hoge);
        expect(fugaChild.parentNode).toBe(fuga);
        Clay.elm.swap(hogeChild, fugaChild);
        expect(hogeChild.parentNode).toBe(fuga);
        expect(fugaChild.parentNode).toBe(hoge);
    });

    afterEach(function() {

    });
});

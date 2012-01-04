describe('Clay.find', function() {

    var wrap, paragraph, list, childList, haveNotParent,
        domId     = function(id) { return document.getElementById(id); },
        domCreate = function(elm){ return document.createElement(elm); };

    beforeEach(function() {

        loadFixtures('find.html');

        haveNotParent = document.body.parentNode.parentNode;
        wrap      = domId('wrap');
        paragraph = domId('paragraph');
        list      = domId('list');
        childList = domId('child-list');
    });

    it('can find element parent node', function() {
        expect(Clay.find.parent(paragraph)).toBe(wrap);

        // html要素の親はnull
        expect(Clay.find.parent(haveNotParent)).toBeNull();
    });

    it('can find element children nodes', function() {
        var children = Clay.find.children(list), i = 0, iz = children.length;
        expect(iz).toBe(3);
        for (; i<iz; i++) {
            expect(children[i].parentNode).toBe(list);
        }

        // have no result
        expect(Clay.find.children(paragraph)).toEqual([]);
    });

    it('can find element of decendants', function() {
        var descendants = Clay.find.children(list, true),
            e, p, i = 0, iz = descendants.length;

        expect(iz).toBe(5);
        for (; i<iz; i++) {
            e = descendants[i];
            p = false;
            do {
                if (e.parentNode === list) {
                    p = true;
                    break;
                }
            } while ( e = e.parentNode );
            expect(p).toBeTruthy();
        }

        // have no result
        expect(Clay.find.children(paragraph, true)).toEqual([]);
    });

    it('can find element of ancestors', function() {
        var ancestors = Clay.find.parent(childList, true),
            i = 0, iz = ancestors.length;

        for (; i<iz; i++) {
            expect(Clay.find.children(ancestors[i], true)).toContain(childList);
        }

        // have no result
        expect(Clay.find.parent(haveNotParent, true)).toEqual([]);
    });

    it('can find element of siblings', function() {
        var siblings = Clay.find.siblings(list), i = 0, iz = siblings.length;

        expect(siblings).toNotContain(list);
        expect(iz).toBe(3);
        for (; i<iz; i++) {
            expect(siblings[i].parentNode).toBe(list.parentNode);
        }

        // have no result
        expect(Clay.find.siblings(domId('only-child'))).toEqual([]);
    });

    it('can find element of closest', function() {
        expect(Clay.find.closest(list, 'div')).toBe(wrap);
        expect(Clay.find.closest(list, 'form')).toBeNull();
    });

    it('can find element of next', function() {
        expect(Clay.find.next(paragraph)).toBe(list);
        expect(Clay.find.next(wrap)).toBeNull();
    });

    it('can find element of prev', function() {
        expect(Clay.find.prev(list)).toBe(paragraph);
        expect(Clay.find.prev(paragraph)).toBeNull();
    });

    afterEach(function() {

    });

});

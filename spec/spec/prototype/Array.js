describe('Array.prototype', function() {

    beforeEach(function() {

    });

    it('can use indexOf', function() {
        expect(typeof [].indexOf).toBe('function');

        expect([1, 2, 2, 3].indexOf(2)).toBe(1);
        expect([1,  , 2, 3].indexOf(3)).toBe(3);

        expect([1, 2, 2, 3].indexOf(2, 3)).toBe(-1);
        expect([1, 2, 3].indexOf(4)).toBe(-1);
    });

    it('can use lastIndexOf', function() {
        expect(typeof [].lastIndexOf).toBe('function');

        expect([1, 2, 2, 3].lastIndexOf(2)).toBe(2);
        expect([1,  , 2, 3].lastIndexOf(3)).toBe(3);

        expect([1, 2, 2, 3].lastIndexOf(2, 0)).toBe(-1);
        expect([1, 2, 3].lastIndexOf(4)).toBe(-1);
    });

    it('can use filter', function() {
        expect(typeof [].filter).toBe('function');

        expect([1, 3, 6, 8].filter(function(val, i, ary) {
            return !!(val > 5);
        })).toEqual([6, 8]);

        expect(['cat', 'lion', 'dog', 'bird'].filter(function(val, i, ary) {
            return val === 'cat' || val === 'lion';
        })).toEqual(['cat', 'lion']);
    });

    it('car use forEach', function() {
        var n = 0, p = 0, c = 0;

        expect(typeof [].forEach).toBe('function');

        [1, 2, 3].forEach(function(val, i) {
            n += val;

            expect(i).toBe(p);
            p++;
        });
        expect(n).toBe(6);

        [1, , 2].forEach(function() {
            c++;
        });
        expect(c).toBe(2);
    });

    it('can use every', function() {
        expect(typeof [].every).toBe('function');

        expect([1,2,3,4,5].every(function(val) {
            return !!(val < 3);
        })).toBe(false);

        expect([3,4,5,6,7].every(function(val) {
            return !!(val > 2);
        })).toBe(true);
    });

    it('can use map', function() {
        expect(typeof [].map).toBe('function');

        expect([1,2,3,4,5].map(function(val) {
            return (val*val);
        })).toEqual([1,4,9,16,25]);
    });

    it('can use some', function() {
        expect(typeof [].some).toBe('function');

        expect([1,2,3,4,5].some(function(val) {
            return !!(val < 3);
        })).toBe(true);

        expect([3,4,5,6,7].some(function(val) {
            return !!(val < 3);
        })).toBe(false);
    });

    it('can use contatins', function() {
        expect(typeof [].contains).toBe('function');

        expect([1,2,3,4,5].contains(5)).toBe(true);

        expect([3,4, ,6,7].contains(5)).toBe(false);
    });

    it('can be iterate elements in array', function() {
        var elm1 = document.createElement('div'),
            elm2 = document.createElement('div'),
            elm3 = document.createElement('div'),
            elmAry  = [elm1, elm2, elm3],
            notElmAry = [/hoge/, 'fuga', 826],
            mixedAry = [/hoge/, null, elm1],
            count = 0;

        // apply void function to be return 'self'
        expect(elmAry.el(function(elm) {
            count++;
        })).toBe(elmAry);

        // loop ok?
        expect(count).toBe(elmAry.length);

        // apply return some value function to be 'result array'
        count = 0;
        expect(elmAry.el(function() {
            return notElmAry[count++];
        })).toEqual(notElmAry);

        // if not element array using 'el' when not loop.
        count = 0;
        expect(notElmAry.el(function(elm) {
            count++;
        })).toBe(notElmAry);

        // doesnt loop?
        expect(count).toBe(0);

        // case mixed array (contains element & not element)
        // if not element are skip and elements are execute.
        count = 0;
        expect(mixedAry.el(function(elm) {
            count++;
            return elm;
        })).toEqual([elm1]);

        // once?
        expect(count).toBe(1);
    });

    afterEach(function() {

    });
});

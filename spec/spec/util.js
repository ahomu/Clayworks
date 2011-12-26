describe('Clay.util', function() {

    var form,
        domId     = function(id) { return document.getElementById(id); },
        domCreate = function(elm){ return document.createElement(elm); };

    beforeEach(function() {
        loadFixtures('util.html');
        form = domId('form');
    });

    it('can get form input data', function() {
        var data = Clay.util.form.data(form);

        expect(data).toEqual({
            'single'    : 'single',
            'array'     : ['item1', 'item2', 'item3'],
            'image'     : 'imagedata',
            'withvalue' : 'withvalue',
            'multiplevalue'  : ['item2', 'item3']
        });
    });

    afterEach(function() {

    });
});

describe('Clay.util.is', function() {

    beforeEach(function() {

    });

    it('can use is.string', function() {
        expect(Clay.util.is.string('')).toBe(true);
        expect(Clay.util.is.string(123)).toBe(false);
        expect(Clay.util.is.string([1, 2, 3])).toBe(false);
        expect(Clay.util.is.string({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.string(/re/)).toBe(false);
        expect(Clay.util.is.string(undefined)).toBe(false);
        expect(Clay.util.is.string(function(){})).toBe(false);
        expect(Clay.util.is.string(true)).toBe(false);
        expect(Clay.util.is.string(new Date())).toBe(false);
        expect(Clay.util.is.string(new TypeError())).toBe(false);
        expect(Clay.util.is.string(null)).toBe(false);
        expect(Clay.util.is.string(Clay('body'))).toBe(false);
    });

    it('can use is.number', function() {
        expect(Clay.util.is.number('')).toBe(false);
        expect(Clay.util.is.number(123)).toBe(true);
        expect(Clay.util.is.number([1, 2, 3])).toBe(false);
        expect(Clay.util.is.number({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.number(/re/)).toBe(false);
        expect(Clay.util.is.number(undefined)).toBe(false);
        expect(Clay.util.is.number(function(){})).toBe(false);
        expect(Clay.util.is.number(true)).toBe(false);
        expect(Clay.util.is.number(new Date())).toBe(false);
        expect(Clay.util.is.number(new TypeError())).toBe(false);
        expect(Clay.util.is.number(null)).toBe(false);
        expect(Clay.util.is.number(Clay('body'))).toBe(false);
    });

    it('can use is.array', function() {
        expect(Clay.util.is.array('')).toBe(false);
        expect(Clay.util.is.array(123)).toBe(false);
        expect(Clay.util.is.array([1, 2, 3])).toBe(true);
        expect(Clay.util.is.array({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.array(/re/)).toBe(false);
        expect(Clay.util.is.array(undefined)).toBe(false);
        expect(Clay.util.is.array(function(){})).toBe(false);
        expect(Clay.util.is.array(true)).toBe(false);
        expect(Clay.util.is.array(new Date())).toBe(false);
        expect(Clay.util.is.array(new TypeError())).toBe(false);
        expect(Clay.util.is.array(null)).toBe(false);
        expect(Clay.util.is.array(Clay('body'))).toBe(false);
    });

    it('can use is.object', function() {
        expect(Clay.util.is.object('')).toBe(false);
        expect(Clay.util.is.object(123)).toBe(false);
        expect(Clay.util.is.object([1, 2, 3])).toBe(false);
        expect(Clay.util.is.object({a: 1, b:2, c:3})).toBe(true);
        expect(Clay.util.is.object(/re/)).toBe(false);
        expect(Clay.util.is.object(undefined)).toBe(false);
        expect(Clay.util.is.object(function(){})).toBe(false);
        expect(Clay.util.is.object(true)).toBe(false);
        expect(Clay.util.is.object(new Date())).toBe(false);
        expect(Clay.util.is.object(new TypeError())).toBe(false);
        expect(Clay.util.is.object(null)).toBe(false);
        expect(Clay.util.is.object(Clay('body'))).toBe(true);
    });

    it('can use is.regexp', function() {
        expect(Clay.util.is.regexp('')).toBe(false);
        expect(Clay.util.is.regexp(123)).toBe(false);
        expect(Clay.util.is.regexp([1, 2, 3])).toBe(false);
        expect(Clay.util.is.regexp({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.regexp(/re/)).toBe(true);
        expect(Clay.util.is.regexp(undefined)).toBe(false);
        expect(Clay.util.is.regexp(function(){})).toBe(false);
        expect(Clay.util.is.regexp(true)).toBe(false);
        expect(Clay.util.is.regexp(new Date())).toBe(false);
        expect(Clay.util.is.regexp(new TypeError())).toBe(false);
        expect(Clay.util.is.regexp(null)).toBe(false);
        expect(Clay.util.is.regexp(Clay('body'))).toBe(false);
    });

    it('can use is.undef', function() {
        expect(Clay.util.is.undef('')).toBe(false);
        expect(Clay.util.is.undef(123)).toBe(false);
        expect(Clay.util.is.undef([1, 2, 3])).toBe(false);
        expect(Clay.util.is.undef({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.undef(/re/)).toBe(false);
        expect(Clay.util.is.undef(undefined)).toBe(true);
        expect(Clay.util.is.undef(function(){})).toBe(false);
        expect(Clay.util.is.undef(true)).toBe(false);
        expect(Clay.util.is.undef(new Date())).toBe(false);
        expect(Clay.util.is.undef(new TypeError())).toBe(false);
        expect(Clay.util.is.undef(null)).toBe(false);
        expect(Clay.util.is.undef(Clay('body'))).toBe(false);
    });

    it('can use is.callable', function() {
        expect(Clay.util.is.callable('')).toBe(false);
        expect(Clay.util.is.callable(123)).toBe(false);
        expect(Clay.util.is.callable([1, 2, 3])).toBe(false);
        expect(Clay.util.is.callable({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.callable(/re/)).toBe(false);
        expect(Clay.util.is.callable(undefined)).toBe(false);
        expect(Clay.util.is.callable(function(){})).toBe(true);
        expect(Clay.util.is.callable(true)).toBe(false);
        expect(Clay.util.is.callable(new Date())).toBe(false);
        expect(Clay.util.is.callable(new TypeError())).toBe(false);
        expect(Clay.util.is.callable(null)).toBe(false);
        expect(Clay.util.is.callable(Clay('body'))).toBe(false);
    });

    it('can use is.bool', function() {
        expect(Clay.util.is.bool('')).toBe(false);
        expect(Clay.util.is.bool(123)).toBe(false);
        expect(Clay.util.is.bool([1, 2, 3])).toBe(false);
        expect(Clay.util.is.bool({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.bool(/re/)).toBe(false);
        expect(Clay.util.is.bool(undefined)).toBe(false);
        expect(Clay.util.is.bool(function(){})).toBe(false);
        expect(Clay.util.is.bool(true)).toBe(true);
        expect(Clay.util.is.bool(new Date())).toBe(false);
        expect(Clay.util.is.bool(new TypeError())).toBe(false);
        expect(Clay.util.is.bool(null)).toBe(false);
        expect(Clay.util.is.bool(Clay('body'))).toBe(false);
    });

    it('can use is.date', function() {
        expect(Clay.util.is.date('')).toBe(false);
        expect(Clay.util.is.date(123)).toBe(false);
        expect(Clay.util.is.date([1, 2, 3])).toBe(false);
        expect(Clay.util.is.date({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.date(/re/)).toBe(false);
        expect(Clay.util.is.date(undefined)).toBe(false);
        expect(Clay.util.is.date(function(){})).toBe(false);
        expect(Clay.util.is.date(true)).toBe(false);
        expect(Clay.util.is.date(new Date())).toBe(true);
        expect(Clay.util.is.date(new TypeError())).toBe(false);
        expect(Clay.util.is.date(null)).toBe(false);
        expect(Clay.util.is.date(Clay('body'))).toBe(false);
    });

    it('can use is.nil', function() {
        expect(Clay.util.is.nil('')).toBe(false);
        expect(Clay.util.is.nil(123)).toBe(false);
        expect(Clay.util.is.nil([1, 2, 3])).toBe(false);
        expect(Clay.util.is.nil({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.nil(/re/)).toBe(false);
        expect(Clay.util.is.nil(undefined)).toBe(false);
        expect(Clay.util.is.nil(function(){})).toBe(false);
        expect(Clay.util.is.nil(true)).toBe(false);
        expect(Clay.util.is.nil(new Date())).toBe(false);
        expect(Clay.util.is.nil(new TypeError())).toBe(false);
        expect(Clay.util.is.nil(null)).toBe(true);
        expect(Clay.util.is.nil(Clay('body'))).toBe(false);
    });

    it('can use is.error', function() {
        expect(Clay.util.is.error('')).toBe(false);
        expect(Clay.util.is.error(123)).toBe(false);
        expect(Clay.util.is.error([1, 2, 3])).toBe(false);
        expect(Clay.util.is.error({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.error(/re/)).toBe(false);
        expect(Clay.util.is.error(undefined)).toBe(false);
        expect(Clay.util.is.error(function(){})).toBe(false);
        expect(Clay.util.is.error(true)).toBe(false);
        expect(Clay.util.is.error(new Date())).toBe(false);
        expect(Clay.util.is.error(new TypeError())).toBe(true);
        expect(Clay.util.is.error(null)).toBe(false);
        expect(Clay.util.is.error(Clay('body'))).toBe(false);
    });

    it('can use is.lump', function() {
        expect(Clay.util.is.lump('')).toBe(false);
        expect(Clay.util.is.lump(123)).toBe(false);
        expect(Clay.util.is.lump([1, 2, 3])).toBe(false);
        expect(Clay.util.is.lump({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.lump(/re/)).toBe(false);
        expect(Clay.util.is.lump(undefined)).toBe(false);
        expect(Clay.util.is.lump(function(){})).toBe(false);
        expect(Clay.util.is.lump(true)).toBe(false);
        expect(Clay.util.is.lump(new Date())).toBe(false);
        expect(Clay.util.is.lump(new TypeError())).toBe(false);
        expect(Clay.util.is.lump(null)).toBe(false);
        expect(Clay.util.is.lump(Clay('body'))).toBe(true);

        expect(Clay.util.is.lump(document.body)).toBe(false);
    });

    it('can use is.element', function() {
        expect(Clay.util.is.element('')).toBe(false);
        expect(Clay.util.is.element(123)).toBe(false);
        expect(Clay.util.is.element([1, 2, 3])).toBe(false);
        expect(Clay.util.is.element({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.element(/re/)).toBe(false);
        expect(Clay.util.is.element(undefined)).toBe(false);
        expect(Clay.util.is.element(function(){})).toBe(false);
        expect(Clay.util.is.element(true)).toBe(false);
        expect(Clay.util.is.element(new Date())).toBe(false);
        expect(Clay.util.is.element(new TypeError())).toBe(false);
        expect(Clay.util.is.element(null)).toBe(false);
        expect(Clay.util.is.element(Clay('body'))).toBe(false);

        expect(Clay.util.is.element(document.body)).toBe(true);

    });

    it('can use is.numeric', function() {
        expect(Clay.util.is.numeric('')).toBe(false);
        expect(Clay.util.is.numeric(123)).toBe(true);
        expect(Clay.util.is.numeric([1, 2, 3])).toBe(false);
        expect(Clay.util.is.numeric({a: 1, b:2, c:3})).toBe(false);
        expect(Clay.util.is.numeric(/re/)).toBe(false);
        expect(Clay.util.is.numeric(undefined)).toBe(false);
        expect(Clay.util.is.numeric(function(){})).toBe(false);
        expect(Clay.util.is.numeric(true)).toBe(false);
        expect(Clay.util.is.numeric(false)).toBe(false);
        expect(Clay.util.is.numeric(new Date())).toBe(false);
        expect(Clay.util.is.numeric(new TypeError())).toBe(false);
        expect(Clay.util.is.numeric(null)).toBe(false);
        expect(Clay.util.is.numeric(Clay('body'))).toBe(false);

        expect(Clay.util.is.numeric('0xFF')).toBe(true);
        expect(Clay.util.is.numeric('1e8')).toBe(true);
        expect(Clay.util.is.numeric('8+26')).toBe(false);
        expect(Clay.util.is.numeric('256px')).toBe(false);
    });

    afterEach(function() {

    });
});

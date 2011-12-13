describe('String.prototype', function() {

    beforeEach(function() {

    });

    it('can use repeat', function() {
        expect('-'.repeat(5)).toEqual('-----');
    });

    it('can use trim', function() {
        expect((" "+'(L) half space').trim()).toEqual('(L) half space');
        expect(("　"+'(L) double space').trim()).toEqual('(L) double space');
        expect(("\t"+'(L) tab').trim()).toEqual('(L) tab');
        expect(("\r"+'(L) CR').trim()).toEqual('(L) CR');
        expect(("\n"+'(L) LF').trim()).toEqual('(L) LF');
        expect(("\r\n"+'(L) CRLF').trim()).toEqual('(L) CRLF');

        expect(('(R) half space'+" ").trim()).toEqual('(R) half space');
        expect(('(R) double space'+"　").trim()).toEqual('(R) double space');
        expect(('(R) tab'+"\t").trim()).toEqual('(R) tab');
        expect(('(R) CR'+"\r").trim()).toEqual('(R) CR');
        expect(('(R) LF'+"\n").trim()).toEqual('(R) LF');
        expect(('(R) CRLF'+"\r\n").trim()).toEqual('(R) CRLF');
    });

    it('can use trimLeft', function() {
        expect(('(R) half space'+" ").trimRight()).toEqual('(R) half space');
        expect(('(R) double space'+"　").trimRight()).toEqual('(R) double space');
        expect(('(R) tab'+"\t").trimRight()).toEqual('(R) tab');
        expect(('(R) CR'+"\r").trimRight()).toEqual('(R) CR');
        expect(('(R) LF'+"\n").trimRight()).toEqual('(R) LF');
        expect(('(R) CRLF'+"\r\n").trimRight()).toEqual('(R) CRLF');
    });

    it('can use trimRight', function() {
        expect((" "+'(L) half space').trimLeft()).toEqual('(L) half space');
        expect(("　"+'(L) double space').trimLeft()).toEqual('(L) double space');
        expect(("\t"+'(L) tab').trimLeft()).toEqual('(L) tab');
        expect(("\r"+'(L) CR').trimLeft()).toEqual('(L) CR');
        expect(("\n"+'(L) LF').trimLeft()).toEqual('(L) LF');
        expect(("\r\n"+'(L) CRLF').trimLeft()).toEqual('(L) CRLF');
    });

    it('can use camelize', function() {
        expect('abc-def-ghi'.camelize()).toBe('abcDefGhi');
        expect('abc_def_ghi'.camelize()).toBe('abcDefGhi');
    });

    it('can use decamelize', function() {
        expect('abcDefGhi'.decamelize()).toBe('abc-def-ghi');
        expect('abcDefGhi'.decamelize('_')).toBe('abc_def_ghi');
    });

    afterEach(function() {

    });
});

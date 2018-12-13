import assert from 'assert';
import {symbolicSubstitutionAndEval} from '../src/js/Task2';

describe('Test task2', () => {
    it('is parsing an empty function correctly', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('', [])),
            { newCode: '', red: [], green: [] }
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('let a = 1;',[])),
            { newCode: '', red: [], green: [] }
        );
    });

    it('test1', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function test (x)  { let a =12; if (a<x) {a = a + 5; return a;} else {a = a -10; return (a + x); } }',[])),
            { newCode: 'function test(x) {\n    if (12 < x) {\n        return 12 + 5;\n    } else {\n        return 12 - 10 + x;\n    }\n}', red: [], green: [] }
        );
    });


    it('test2', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('let a ,x = a +b; a =5; let y = x; function t1(y){a=x;x=10;a=x; function t2(x) {x = 50; y=x;} z = x + y;} z= y;'
                ,[])),
            { newCode: ';\nfunction t1(y) {\n    a = 5 + b;\n    x = 10;\n    a = 10;\n    function t2(x) {\n        x = 50;\n        y = 50;\n    }\n    z = 10 + 50;\n}\nz = 5 + b;'
                , red: [], green: [] }
        );
    });

    it('test3', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('let x = 42; let a; let y; function t1 (x,y) { x = 3; y =x; a =7;} z = x + a + y; '
                ,[])),
            { newCode: 'function t1(x, y) {\n    x = 3;\n    y = 3;\n    a = 7;\n}\nz = 42 + 7 + y;'
                , red: [], green: [] }
        );
    });

    it('test4', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('let x =3; let y =4; z=[x,y,879,w]'
                ,[])),
            { newCode: 'z = [\n    3,\n    4,\n    879,\n    w\n];'
                , red: [], green: [] }
        );
    });

    it('test5', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval( 'let a = 3; let x = 30; if (a+x <y) {x = 10; z = a + x + y}else {a = 60; z = a + x +y}'
                ,[])),
            { newCode: 'if (3 + 30 < y) {\n    z = 3 + 10 + y;\n} else {\n    z = 60 + 30 + y;\n}'
                , red: [], green: [] }
        );
    });

    it('test6', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function t1 (x,y) { x = a + y;  if (x < 100) { x= 10; b = x;} else if (x===100) { x = 50; b = x} else { x=30;b = x} b=x;} b =x;'
                ,[])),
            { newCode: 'function t1(x, y) {\n    x = a + y;\n    if (a + y < 100) {\n        x = 10;\n        b = 10;\n    } else if (a + y === 100) {\n        x = 50;\n        b = 50;\n    } else {\n        x = 30;\n        b = 30;\n    }\n    b = a + y;\n}\nb = x;'
                , red: [], green: [] }
        );
    });

    it('test7', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n'
                ,[])),
            { newCode: 'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + 0 + x + 5;\n    } else {\n        return x + y + z + 0 + z + 5;\n    }\n}'
                , red: [], green: [] }
        );
    });


    it('test8', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n'
                ,[])),
            { newCode: 'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + 0 + x + 5;\n    } else {\n        return x + y + z + 0 + z + 5;\n    }\n}'
                , red: [], green: [] }
        );
    });

    it('test9', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('x = a + b; while (x < z) { z = x ; x = 10} z = x '
                ,[])),
            { newCode: 'x = a + b;\nwhile (a + b < z) {\n    z = a + b;\n    x = 10;\n}\nz = a + b;'
                , red: [], green: [] }
        );
    });

    it('test10', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('x = a +b ; for (let z =0;z<x;z = z+ 1) { x =50; b = x;} z = x;'
                ,[])),
            { newCode: 'x = a + b;\nfor (; 0 < a + b; ) {\n    x = 50;\n    b = 50;\n}\nz = 50;'
                , red: [], green: [] }
        );
    });

    it('test11', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('let x = 100; function t2 () { x = 50;} z = x;'
                ,[])),
            { newCode: 'function t2() {\n    x = 50;\n}\nz = 50;'
                , red: [], green: [] }
        );
    });

    it('test12', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function t1 (x) { if (x > 2) {if (x === 10) x++}else  if (x > 1 )  y++;}'
                ,[2])),
            { newCode: 'function t1(x) {\n    if (x > 2) {\n        if (x === 10)\n            x++;\n    } else if (x > 1)\n        y++;\n}'
                , red: [1], green: [4] }
        );
    });
    it('test13', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function t1 (x) { if (x > 2) {if (x === 10) x++}else  if (x > 1 )  y++;}'
                ,[8])),
            { newCode: 'function t1(x) {\n    if (x > 2) {\n        if (x === 10)\n            x++;\n    } else if (x > 1)\n        y++;\n}'
                , red: [2], green: [1] }
        );
    });

    it('test14', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function t1 (x) { for (;x>10;) return true;}'
                ,[15])),
            { newCode: 'function t1(x) {\n    for (; x > 10;)\n        return true;\n}'
                , red: [], green: [1] }
        );
    });

    it('test15', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function t1(x) {\n    for (let z =2; x > 10;z =z + 1)\n        return true;\n}'
                ,[1])),
            { newCode: 'function t1(x) {\n    for (; x > 10; )\n        return true;\n}'
                , red: [1], green: [] }
        );
    });

    it('test16', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function t1 (x) { for (;x>10;) return true;}'
                ,[1])),
            { newCode: 'function t1(x) {\n    for (; x > 10;)\n        return true;\n}'
                , red: [1], green: [] }
        );
    });

    it('test17', () => {
        assert.deepEqual(
            (symbolicSubstitutionAndEval('function t1 (x) { if (x>4) return true;}'
                ,[1])),
            { newCode: 'function t1(x) {\n    if (x > 4)\n        return true;\n}'
                , red: [1], green: [] }
        );
    });





});
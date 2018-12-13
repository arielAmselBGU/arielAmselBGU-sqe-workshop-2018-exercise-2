const assert = require 'assert';
import {symbolicSubstitutionAndEval} from '../src/js/Task2';

describe('Test task2', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            (symbolicSubstitutionAndEval('', [])),
            '[]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            (symbolicSubstitutionAndEval('let a = 1;',[])),
            '[[{"lineNum":1,"type":"Variable Declaration","name":"a","value":"1"}]]'
        );
    });


});
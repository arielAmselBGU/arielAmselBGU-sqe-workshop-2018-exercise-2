import * as esprima from 'esprima';
import {CreateNewLineForTabele} from './TableParser.js';
import {setOriginalCode} from './TableParser.js';


const parseCode = (codeToParse) => {
    let esprimaTree =  esprima.parseScript(codeToParse,{loc:true,range:true},null);
    setOriginalCode(codeToParse);
    const astTree = esprimaTree.body.map(CreateNewLineForTabele);
    return astTree;
};

export {parseCode};

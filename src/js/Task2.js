import * as esprima from 'esprima';
import * as codeGen from 'escodegen';
import * as esTraverse from 'estraverse';


let listOfParameters =[];
let localVariablesSub = {};
let rangeToRemove =[];

function findInDictionary(key) {
    return localVariablesSub[key];
}

export function symbolicSubstitutionAndEval(codeToParse) {

    let programTree = esprima.parse(codeToParse,{loc:true,range:true});
    let programAns = esTraverse.traverse(programTree,
        {enter: function(node,parent){ handleTree(node,parent);} }
        );



/*    let programTree = esprima.parse(codeToParse,{loc:true,range:true},createSubtitutionTable);    // create dictionary
    //remove all let and assignments
    let sorterdToRemove = rangeToRemove.sort((a,b) => {return b.end - a.end;});
    sorterdToRemove.forEach(range =>{
       codeToParse = codeToParse.substring(0,range.start) + codeToParse.substring(range.end,codeToParse.length);
    });

   /!* // remove all ';'
    let codeWithoutDeclarations = codeToParse;
    while (codeWithoutDeclarations.indexOf(';')>-1) {
        codeWithoutDeclarations = codeWithoutDeclarations.replace(';', '');
    }*!/


    let codeWithoutDeclarations = codeToParse;
    //add ( ) too all dictionary values
    for (let x in localVariablesSub){
        let updatededVal = localVariablesSub[x].trim();
        if (updatededVal.length >1)
            updatededVal='('+localVariablesSub[x] +')';
        localVariablesSub[x] = updatededVal;
    }
    //replace all local variables with values
    let tokenizedCode = esprima.tokenize(codeWithoutDeclarations,{range:true,tolerant: true});
    let ids = tokenizedCode.filter(x => x.type === 'Identifier' );
    let sortedIds = ids.sort((a, b) => { return b.range[0] - a.range[0];});
    sortedIds.forEach(ident => {
        let valueInDictionary = findInDictionary(ident.value);
        if (valueInDictionary !== undefined) {
            const start = ident.range[0];
            const end = ident.range[1];
            codeWithoutDeclarations = codeWithoutDeclarations.slice(0, start) + valueInDictionary + codeWithoutDeclarations.slice(end);
        }
    });

    let codeWithValues = codeGen.generate(esprima.parse(codeWithoutDeclarations,{tolerant:true}));
    return codeWithValues;
    //todo eval with and paint*/
}


function handleTree(node,parent) {
    switch (node.type){
        case 'VariableDeclaration'://let declaration
            rangeToRemove.push({start: body.range[0], end: body.range[1]});
            return HandleVarDec (body);
        case 'AssignmentExpression':
            rangeToRemove.push({start: body.range[0], end: body.range[1]});
            return HandleAssignmentExpression (body);
        case 'FunctionDeclaration':
            listOfParameters = body.params.map (x=>x.name);
    }
}



/**
 * assume that dec doesn't contain any refernce to himself
 * @param dec
 */
function replaceValuesInVar (node){
    if (node.type === 'Identifier'){
        let varValueInDictionary = findInDictionary(node.name);
        if (varValueInDictionary !== undefined){
            node.name = varValueInDictionary;
        }
    }
}



function HandleVarDec(letDec) {
    for (let dec of letDec.declarations) {
        if (dec.init !== null && dec.init !== undefined) {

        }
    }
}
/*
function HandleVarDec(letDec) {
    for (let dec of letDec.declarations) {
        if (dec.init !== null && dec.init !== undefined ) {
            let newVarVal = codeGen.generate(dec.init,{format:{semicolons:false}});
            let replacedVarVal = esprima.parse(newVarVal,{},function (node) {
                replaceValuesInVar(node);
            });
            let newStringVal = codeGen.generate(replacedVarVal,{format:{semicolons:false}});
            localVariablesSub [dec.id.name] = newStringVal;
        }
        else
            localVariablesSub[dec.id.name] = undefined;
    }
}
*/


function HandleAssignmentExpression(ass) {
    let varOrigValue = codeGen.generate(ass.right, {format: {semicolons: false}});
    let replacedValue = esprima.parse(varOrigValue, {}, function (node) {
        replaceValuesInVar(node);
    });
    let newStringVal = codeGen.generate(replacedValue, {format: {semicolons: false}});
    localVariablesSub [ass.left.name] = newStringVal;
}

function replaceAllOccurences (toReplace){
    let stringToReplace = codeGen.generate(toReplace);
    let tokenizedCode = esprima.tokenize(stringToReplace,{range:true});
    let ids = tokenizedCode.filter(x => x.type === 'Identifier' );
    let sortedIds = ids.sort((a, b) => { return b.range[0] - a.range[0];});
    sortedIds.forEach(ident => {
        let valueInDictionary = findInDictionary(ident.value);
        if (valueInDictionary !== undefined) {
            const start = ident.range[0];
            const end = ident.range[1];
            stringToReplace = stringToReplace.slice(0, start) + valueInDictionary + stringToReplace.slice(end);
        }
    });

    return stringToReplace;
}


function createSubtitutionTable(body) {
    switch (body.type){
        case 'VariableDeclaration'://let declaration
            rangeToRemove.push({start: body.range[0], end: body.range[1]});
            return HandleVarDec (body);
        case 'AssignmentExpression':
            rangeToRemove.push({start: body.range[0], end: body.range[1]});
            return HandleAssignmentExpression (body);
        case 'FunctionDeclaration':
            listOfParameters = body.params.map (x=>x.name);
    }
}
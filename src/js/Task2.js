import * as esprima from 'esprima';
import * as codeGen from 'escodegen';
import * as esTraverse from 'estraverse';

let inputVector;
let greenRanges = [];
let redRanges = [];
let parametersListForColors =[];
let listOfParameters =[];
let nodesToRemove =[];
let scopedVariables= [];
let declareScope = [];

function findInScopedDictionary(key) {
    for (let i =0;i<scopedVariables.length;i++){
        if (scopedVariables[i].hasOwnProperty(key))
            return scopedVariables[i][key];
    }
    return undefined;
}

function updateInScopedDictionary(key, value) {
    for (let i =0;i<scopedVariables.length;i++){
        if (scopedVariables[i].hasOwnProperty(key)) {
            scopedVariables[i][key] = value;
            return;
        }
    }
    addToScopedDictionary(key,value);
}

function addToScopedDictionary (key,value){
    scopedVariables[0][key] = value;
}

function getScopeByIndex(idx) {
    return scopedVariables[idx];
}

function getParamByIndex(idx) {
    return listOfParameters[idx];
}

function addNewScope(parmList) {
    scopedVariables.unshift({});
    listOfParameters.unshift(parmList);
    declareScope.unshift([]);
}

function removeScope() {
    scopedVariables.shift();
    listOfParameters.shift();
    declareScope.shift();
}

function declaredInCurrentScope(varName) {
    let currScopeDeclarations = declareScope[0];
    return (currScopeDeclarations.indexOf(varName) >-1);
}

function addDuplicateScope (){
    let copiedScope = Object.assign({},getScopeByIndex(0));
    let copiedParams = Array.from(getParamByIndex(0));
    let copiedDeclerations = Array.from(declareScope[0]);

    scopedVariables.unshift(copiedScope);
    listOfParameters.unshift(copiedParams);
    declareScope.unshift(copiedDeclerations);
}

export function symbolicSubstitutionAndEval(codeToParse,inputVec) {

    greenRanges = [];
    redRanges = [];
    parametersListForColors =[];
    listOfParameters =[];
    nodesToRemove =[];
    scopedVariables= [];
    declareScope = [];

    addNewScope([]);
    inputVector = inputVec;

    let programTree = esprima.parse(codeToParse);
    myTraversal(programTree.body,handleSubstitution);
    myTraversal(programTree,handleDeleteNodes);

    let substitutedCode = codeGen.generate(programTree).replace (/\n\s*;\n/gi,'\n');
    let newCodeTree = esprima.parse(substitutedCode,{tolerant:true,loc:true});
    myTraversal(newCodeTree.body,handleColors);

    return {newCode: substitutedCode,red: redRanges,green: greenRanges};

}

function handleSubstitution (node){
    if (node === null || node === undefined)
        return;
    let updatedValue;
    switch (node.type) {
        case 'VariableDeclaration'://let declaration
            HandleVarDec(node);
            nodesToRemove.push(node);
            break;
        case 'AssignmentExpression':
            handleAssignment(node);
            if ( declaredInCurrentScope(node.left.name))
                nodesToRemove.push(node);
            break;
        case 'FunctionDeclaration':
            handleFunctionDeclaration(node);
            break;
        case 'IfStatement':
            handleIfSatment(node);
            break;
        case 'WhileStatement':
            myTraversal(node.test,handleSubstitution);
            addDuplicateScope();
            myTraversal(node.body,handleSubstitution);
            removeScope();
            break;
        case 'ForStatement':
            addNewScope([]);
            myTraversal(node.init,handleSubstitution);
            myTraversal(node.test,handleSubstitution);
            myTraversal(node.update,handleSubstitution);
            myTraversal(node.body,handleSubstitution);
            removeScope();
            break;
        case 'Identifier':
            updatedValue = ReplaceStringIdentifiers(node.name);
            if (updatedValue!== undefined)
                node.name = updatedValue;
            break;
        default:
            for (let property in node) {
                if (Array.isArray(node[property]) || typeof node[property] === 'object')
                    myTraversal(node[property],handleSubstitution);
            }
    }
}

function handleDeleteNodes(node) {
    /*if (node === null || node === undefined)
        return;*/
    for (let property in node) {
        let nodeProperty = node[property];
        if (Array.isArray(nodeProperty)) {
            nodesToRemove.forEach(toRemove =>{
                let indexInArr = nodeProperty.indexOf(toRemove);
                if (indexInArr > -1) {
                    nodeProperty.splice(indexInArr,1);
                }
            });
            nodeProperty.forEach(x => {myTraversal(x,handleDeleteNodes);});
        } else if (typeof  nodeProperty === 'object'){ // todo in case of object
            nodesToRemove.forEach(toRemove => {
                if (nodeProperty === toRemove)
                    node[property]= esprima.parse("");
            });
            if (nodeProperty!==undefined)
                myTraversal(nodeProperty,handleDeleteNodes);
        }
    }
}

function setIfColor(node){
    esTraverse.traverse(node.test,{
        enter:function (node) {
            if (node.type === 'Identifier'){
                let indexOfParameter = parametersListForColors.indexOf(node.name);
                let inputVectorValue = inputVector[indexOfParameter];
                /*let varValue = findInScopedDictionary(inputVectorValue);
                if (varValue!== undefined){
                    node.name = varValue;
                }else if (inputVectorValue !== undefined) {
                    node.name = inputVectorValue.toString();
                }*/
                if (inputVectorValue !== undefined) {
                    node.name = inputVectorValue.toString();
                }
            }
        }
    });

    let testEval;
    try{
        testEval = eval(codeGen.generate(node.test));
    }catch (e) {
        return;
    }
    if (testEval){
        greenRanges.push(node.test.loc.start.line-1);
        myTraversal(node.consequent,handleColors);
    } else{
        redRanges.push(node.test.loc.start.line-1);
        myTraversal(node.alternate,handleColors);
    }
}

function setLoopColor(node) {
    esTraverse.traverse(node.test,{
        enter:function (node) {
            if (node.type === 'Identifier'){
                let indexOfParameter = parametersListForColors.indexOf(node.name);
                let inputVectorValue = inputVector[indexOfParameter];
                /*let varValue = findInScopedDictionary(inputVectorValue);
                if (varValue!== undefined){
                    node.name = varValue;
                }else if (inputVectorValue !== undefined) {
                    node.name = inputVectorValue.toString();
                }*/
                if (inputVectorValue !== undefined) {
                    node.name = inputVectorValue.toString();
                }
            }
        }
    });
    let testEval;
    try{
        testEval = eval(codeGen.generate(node.test));
    }catch (e) {
        return;
    }
    if (testEval){
        greenRanges.push(node.test.loc.start.line-1);
        myTraversal(node.body,handleColors);
    }else{
        redRanges.push(node.test.loc.start.line-1);
    }
}

function handleColors(node) {
    if (node === null || node === undefined)
        return;
    switch (node.type) {
        case  'FunctionDeclaration':
            parametersListForColors = node.params.map(x => x.name);
            myTraversal(node.body,handleColors);
            parametersListForColors.shift();
            break;
        case 'IfStatement':
            //update node test with input vector
            setIfColor(node);
            break;
        case 'WhileStatement':
            setLoopColor(node);
            break;
        case 'ForStatement':
            setLoopColor(node);
            break;
        default:
            for (let property in node) {
                if (Array.isArray(node[property]) || typeof node[property] === 'object')
                    myTraversal(node[property],handleColors);
            }
    }

}

function myTraversal (node,handler) {
    if (Array.isArray(node)) {
        node.forEach(x => myTraversal(x, handler));
    } else {
        handler(node);
    }
}


/** receives a string that needs to be updated from table **/
function ReplaceStringIdentifiers(toReplace) {
    if (toReplace !== undefined) {
        let treeToReplace = esprima.parse(toReplace);
        ReplaceIdentifiers(treeToReplace);
        return codeGen.generate(treeToReplace, {format: {semicolons: false}});
    }
}

/** update an esprima tree from table **/
function ReplaceIdentifiers (toReplace){
    if (toReplace !== undefined) {
        esTraverse.traverse(toReplace, {
            enter: function (node) {
                if (node.type === 'Identifier') {
                    let valueInDictionary = findInScopedDictionary(node.name);
                    if (valueInDictionary !== undefined) {
                        node.name = valueInDictionary;
                    }
                }
            }
        });
    }

}

/**
 * updates all variables in a specifc scpoe
 * @param scopeIndex
 * @constructor
 */
function UpdateCurrnetScopeWithNewVar(scopeIndex) {
    let varsScope = getScopeByIndex(scopeIndex);
    for (let currVar in varsScope){
        let updatedValue = ReplaceStringIdentifiers(varsScope[currVar]);
        if (updatedValue !== undefined)
            varsScope[currVar] = updatedValue;
    }

}

/**
 * every time there is an update to the table this should be called
 * this function search from currnet scope outwards to update all variables until reaches a scope that has a declration for the same
 * variable as it received as a parameter
 * @param varUpdated the var updated in the table
 * @constructor
 */
function UpdateVarSubstitutionDictionary(varUpdated) {
    for (let i =0;i<listOfParameters.length;i++){
        let currParamList = getParamByIndex(i);
        if (currParamList.indexOf(varUpdated)>-1){
            UpdateCurrnetScopeWithNewVar(i);
            break;
        }
        UpdateCurrnetScopeWithNewVar (i);
    }
}

function HandleVarDec(letDec) {
    for (let dec of letDec.declarations) {
        if (dec.init !== null && dec.init !== undefined) {
            ReplaceIdentifiers(dec.init);
            addToScopedDictionary(dec.id.name, codeGen.generate(dec.init,{format:{semicolons:false}}));
            UpdateVarSubstitutionDictionary (dec.id.name);
        }else{
            addToScopedDictionary(dec.id.name, undefined);
        }
        declareScope[0].push(dec.id.name);
    }
}

function handleAssignment(ass) {
    ReplaceIdentifiers(ass.right);
    // if in param list add to dictionary
    if (getParamByIndex(0).indexOf(ass.left.name) > -1 ){
        addToScopedDictionary(ass.left.name,codeGen.generate(ass.right));
    }else {
        updateInScopedDictionary(ass.left.name,codeGen.generate(ass.right));
    }
    // else find first occurnece and update it
    UpdateVarSubstitutionDictionary(ass.left.name);
}


function handleFunctionDeclaration(node) {
    getParamByIndex(0).forEach(param => {if (! getScopeByIndex(0).hasOwnProperty(param)) addToScopedDictionary(param,undefined);}); // if a parameter is declared but isn't used in scope
    addNewScope(node.params.map(x => x.name));
    myTraversal(node.body,handleSubstitution);
    removeScope();
}

function handleIfSatment(node) {
    myTraversal(node.test,handleSubstitution);
    addDuplicateScope();
    myTraversal(node.consequent,handleSubstitution);
    removeScope();
    if (node.alternate!==null && node.alternate!== undefined){
        addDuplicateScope();
        myTraversal(node.alternate,handleSubstitution);
        removeScope();
    }
}
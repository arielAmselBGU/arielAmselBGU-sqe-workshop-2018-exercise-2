import $ from 'jquery';
import {symbolicSubstitutionAndEval} from './Task2';

var table;

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVectorString = $('#inputVectorPlaceholder').val();
        let inputVectorArray = (inputVectorString.split('[')).map(x=>{ if (x.charAt(x.length-1) === ','){ return x.substring(0,x.length-1);} else {return x;}  }).map(x=>{if (x.indexOf(']') === -1 ) {return x.split(',');} else {return'['+x;} }).reduce((acc,curr)=>{return acc.concat(curr);},[]);

        let codeAndColors = symbolicSubstitutionAndEval(codeToParse,inputVectorArray);
        let lines = codeAndColors.newCode.split('\n');
        for(let i=0;i<lines.length;i++){
            if(codeAndColors.green.indexOf(i) > -1){
                paintGreenBackground(i,lines[i].length);
            }else if (codeAndColors.red.indexOf(i) > -1){
                paintRedBackground(i,lines[i].length);
            }
            paintLine(lines[i],i);
        }

    });
});

function paintLine(text,lineNum) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext ("2d");
    ctx.font = "14px Georgia";
    ctx.fillStyle = "black";
    ctx.fillText(text,10,lineNum*20+20);
}

function paintGreenBackground (lineNum,length){
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext ("2d");

    ctx.beginPath();
    ctx.rect (10,lineNum*20+5,length*6,20);
    ctx.fillStyle = "green";
    ctx.fill();

}


function paintRedBackground (lineNum,length){
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext ("2d");

    ctx.beginPath();
    ctx.rect (10,lineNum*20+5,length*6,20);
    ctx.fillStyle = "red";
    ctx.fill();

}



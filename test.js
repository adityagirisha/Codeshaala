
'use strict'
var express = require("express");
var bodyParser    = require('body-parser');
var fs = require("fs");
var session = require('express-session');
var path = require('path');
var dataset={
    'Lisa Rose': {
    'Lady in the Water': 2.5,
    'Snakes on a Plane': 3.5,
    'Just My Luck': 3.0,
    'Superman Returns': 3.5,
    'You, Me and Dupree': 2.5,
    'The Night Listener': 3.0},
    
    'Gene Seymour': {'Lady in the Water': 3.0,
    'Snakes on a Plane': 3.5,
    'Just My Luck': 1.5,
    'Superman Returns': 5.0,
    'The Night Listener': 3.0,
    'You, Me and Dupree': 3.5},
    
    'Michael Phillips': {'Lady in the Water': 2.5,
    'Snakes on a Plane': 3.0,
    'Superman Returns': 3.5,
    'The Night Listener': 4.0},
    
    'Claudia Puig': {'Snakes on a Plane': 3.5,
    'Just My Luck': 3.0,
    'The Night Listener': 4.5,
    'Superman Returns': 4.0,
    'You, Me and Dupree': 2.5},
    
    'Mick LaSalle': {'Lady in the Water': 3.0,
    'Snakes on a Plane': 4.0,
    'Just My Luck': 2.0,
    'Superman Returns': 3.0,
    'The Night Listener': 3.0,
    'You, Me and Dupree': 2.0},
    
    'Jack Matthews': {'Lady in the Water': 3.0,
    'Snakes on a Plane': 4.0,
    'The Night Listener': 3.0,
    'Superman Returns': 5.0,
    'You, Me and Dupree': 3.5},
    
    'Toby': {'Snakes on a Plane':4.5,
    'You, Me and Dupree':1.0,
    'Superman Returns':4.0}};

function len(obj){
    var len=0;
    for(var i in obj){
        len++
    }
    return len;
}


function euclidean_score(dataset,p1,p2){
    var existp1p2 = {};
    for(var key in dataset[p1]){
        if(key in dataset[p2]){
            existp1p2[key] = 1
        }
    }
        if(len(existp1p2) ==0) return 0;
        var sum=0;
        for(var item in dataset[p1]){
            if(item in dataset[p2]){
                sum +=(Math.pow(dataset[p1][item]-dataset[p2][item],2));
            }
        }
        
        var sum_sqrt = 1/(1 +Math.sqrt(sum));    
        return sum_sqrt;
    
}

function person_correlation(dataset,p1,p2){
        var existp1p2 = {};
        for(item in dataset[p1]){
            if(item in dataset[p2]){
                existp1p2[item] = 1
            }
        }
        var num_existence = len(existp1p2);
        if(num_existence ==0) return 0;
        var p1_sum=0,
            p2_sum=0,
            p1_sq_sum=0,
            p2_sq_sum=0,
            prod_p1p2 = 0;
        for(var item in existp1p2){
            p1_sum += dataset[p1][item];
            p2_sum += dataset[p2][item];
            p1_sq_sum += Math.pow(dataset[p1][item],2);
            p2_sq_sum += Math.pow(dataset[p2][item],2);
            prod_p1p2 += dataset[p1][item]*dataset[p2][item];
        }
        var numerator =prod_p1p2 - (p1_sum*p2_sum/num_existence);
        var st1 = p1_sq_sum - Math.pow(p1_sum,2)/num_existence;
        var st2 = p2_sq_sum -Math.pow(p2_sum,2)/num_existence;
        var denominator = Math.sqrt(st1*st2);
        if(denominator ==0)return 0;
        else {
            var val = numerator / denominator;
            return val;
        }
        
}




var content = fs.readFileSync("data/ratings_data.json");
var dat = JSON.parse(content);
var db ={};
for(var i=0; i < dat.ratings.length; i++)   
    {
        var item=dat.ratings[i];
        db[item.user]={}
        for(var lang in item.courses){
            db[item.user][lang]=parseInt(item.courses[lang])
        }
    }
var p1="aditya";
var m1= -1;
var m2= -1;
var m3=-1;
var f=p1;
var s=p1;
var t=p1;
var p1lang=db[p1];
for(var p2 in db){
    if(p2!=p1){
        var x=euclidean_score(db,p1,p2)
        if(x>m1){
            t=s;
            s=f;
            f=p2;
            m3=m2;
            m2=m1;
            m1=x;
            
        }
        else{
            if(x>m2){
                t=s;
                s=p2;
                m3=m2;
                m2=x;

            }
            else{
                if(x>m3){
                    t=p2;
                    m3=x;
                }
            }
        }
    }
    // console.log(p2,f,s,t);
}
var arr=[];
var res={};
arr.push(f);
arr.push(s);
arr.push(t);
for(var p2 in arr){
    for(var lang in db[arr[p2]]){
        if(!p1lang.hasOwnProperty(lang) & !res.hasOwnProperty()){
            res[lang]=lang;
            if(Object.keys(res).length>=3){
                break;
            }
        }
    }    
    if(Object.keys(res).length>=3){
        break;
    }
}
if(Object.keys(res).length<3){
    for(var p2 in arr){
        for(var lang in db[arr[p2]]){   
                res[lang]=lang;
                if(Object.keys(res).length>=3){
                    break;
                }
        }    
        if(Object.keys(res).length>=3){
            break;
        }
    }  
}
console.log(f,s,t);
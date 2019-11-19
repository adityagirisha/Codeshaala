'use strict'
var express = require("express");
var bodyParser    = require('body-parser');
var fs = require("fs");
var session = require('express-session');
var path = require('path');

var app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

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

app.use(session({
    secret: 'SadTanookiNoises',
    resave: true,
    saveUninitialized: true
}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/api/v1/get_highscore',function(req,res){
    var user=req.body.user;
    var name=req.body.quiz;
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content)
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        console.log("here");
        flag=true;
        break;
    }
    }
    var thisuser;
    console.log(dat.users[0]);
    var arr=dat.users[i].quizes;
    flag=false;
    for (i = 0; i < arr.length; i++) {
        if (arr[i].hasOwnProperty(name)) {
            thisuser=arr[i]
            flag=true;
            break;
        }
    }
    if(flag){
        return res.status(200).send(thisuser[name]);
    }
    else{
        return res.status(200).send("0");
    }
});

app.post('/api/v1/get_questions',function(req,res){
    var lang=req.body.quiz;
    var content = fs.readFileSync("data/quiz_data.json");
    var dat = JSON.parse(content);
    return res.status(200).send(dat[lang]);
});

app.post('/api/v1/send_result',function(req,res){
    var user=req.body.user;
    var name=req.body.quiz;
    var score=req.body.score;
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content)
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        flag=true;
        break;
    }
    }
    flag=false;
    var thisuser;
    var arr=dat.users[i].quizes;
    for (i = 0; i < arr.length; i++) {
        if (arr[i].hasOwnProperty(name)) {
            thisuser=arr[i]
            flag=true;
            break;
        }
    }
    if(flag){
        if(score>thisuser[name]){

            
            thisuser[name]=score;
            fs.writeFile("data/user_data.json", JSON.stringify(dat));
            res.status(200).send("High Score Updated");
        }
        else{
            res.status(200).send("Better Luck Next Time...");
        }
    }
    else{ 
        var payload={
        }
        payload[name]=score
        arr.push(payload);
        fs.writeFile("data/user_data.json", JSON.stringify(dat));
        res.status(200).send("Score Recorded!");
    }
    
});

app.post('/api/v1/get_content',function(req,res){
    var course=req.body.course;
    var sect=req.body.sect[0];
    var content = fs.readFileSync("data/content_data.json");
    var dat = JSON.parse(content);
    res.status(200).send(dat[course][sect]); 
});

app.post('/api/v1/taken_course',function(req,res){
    var user=req.body.user;
    var course=req.body.course;
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content);
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        flag=true;
        break;
    }
    }
    flag=false;
    var arr=dat.users[i].courses;
    for (i = 0; i < arr.length; i++) {
        if (arr[i] === course) {
            flag=true;
            break;
        }
    }
    if(flag){
        return res.status(200).send("true");
    }
    else{
        return res.status(200).send("false");
    }
});

app.post('/api/v1/rate_course',function(req,res){
    var user= req.body.user;
    var course=req.body.course;
    var rating=req.body.rate;
    var content = fs.readFileSync("data/ratings_data.json");
    var dat = JSON.parse(content);


    var flag=false;
    var i=0;
    for(; i < dat.ratings.length; i++)   
    {
        if(dat.ratings[i].user == user)
        {
        flag=true;
        break;
    }
    }
    if(flag){
        var payload={
        }
        payload[course]=rating;
        console.log(dat.ratings[i].courses);
        dat.ratings[i].courses[course]=rating;
        fs.writeFile("data/ratings_data.json", JSON.stringify(dat));
    }
    else{
        var payload={
        }
        payload[course]=rating
        // arr.push(payload);
        dat.ratings.push({"user":user,"courses":payload});
        
    }
    
    fs.writeFile("data/ratings_data.json", JSON.stringify(dat));
    
    
    //add course to user_data
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content);
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        flag=true;
        break;
    }
    }
    dat.users[i].courses.push(course);
    fs.writeFile("data/user_data.json", JSON.stringify(dat));
    return res.status(200).send("Thank You For Rating!");
});

app.post('/api/v1/update_clock',function(req,res){
    var user=req.body.user;
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content);
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        flag=true;
        break;
    }
    }
    var thisuser=dat.users[i];
    thisuser.time+=1;
    fs.writeFile("data/user_data.json", JSON.stringify(dat))
    return res.status(200);
});

app.post('/api/v1/get_stats',function(req,res){
    var user=req.body.user;
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content);
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        flag=true;
        break;
    }
    }
    var thisuser=dat.users[i];

    var time=thisuser.time;
    var courses=thisuser.courses.length;
    var quizes=thisuser.quizes.length;
    var score=0;
    for(var i=0; i < thisuser.quizes.length; i++)   
    {   
        score+=parseInt(thisuser.quizes[i][Object.keys(thisuser.quizes[i])[0]]);
    
    }
    return res.status(200).send({"time":time,"courses":courses,"quizes":quizes,"score":score});
});

app.post('/api/v1/login',function(req, res){
    var user=req.body.name;
    var pass=req.body.pass;
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content);
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        flag=true;
        break;
    }
    }
    if(flag){
        var thisuser=dat.users[i];
        if(thisuser.pass==pass){
            req.session.user= user;
            // res.sendFile(path.join(__dirname + '/dashboard.html'));
            // return res.status(200).redirect('/dashboard');
            return res.status(200).send({result: 'OK'});
        }
        else{
            return res.status(200).send({result: 'Wrong Password'});
            
        }
    }
    else{
        return res.status(200).send({result: 'Not a Valid User'}) ;
    }
});

app.post('/api/v1/register',function(req, res){
    var user=req.body.name
    var pass=req.body.pass
    var mail=req.body.mail
    var content = fs.readFileSync("data/user_data.json");
    var dat = JSON.parse(content)
    var flag=false;
    var i=0;
    for(; i < dat.users.length; i++)   
    {
        if(dat.users[i].username == user)
        {
        flag=true;
        break;
    }
}
    if(flag){
            return res.status(200).send({result: 'Username Taken'});
    }
    else{
        dat.users.push({"username":user,"pass":pass,"email":mail,"time":0,"courses":[],"quizes":[]});
        fs.writeFile("data/user_data.json", JSON.stringify(dat))
        return res.status(200).send({result: 'Registered Successfully!'});
    }
    
});
 
app.post('/api/v1/recmon', function(req, response){
var p1=req.body.user;
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
var m1= -1;
var m2= -1;
var m3=-1;
var f=p1;
var s=p1;
var t=p1;
if(Object.keys(db[p1]).length==0){
    var p1lang={}
}
else{
    var p1lang=db[p1];
}
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
// console.log(res);
return response.status(200).send(res);
});


app.get('/getleaders', function(req, res) {
    var page = parseInt(req.query.page);
    req.setEncoding("utf8");
    console.log(page);
    // res.writeHead(200, {"Content-Type":"application/json"});
    // while(true) {
        var content = fs.readFileSync("data/score_data.json");
        var data = JSON.parse(content);
        var mtime = fs.statSync("data/score_data.json").mtime;
        console.log(data.length);
        data.sort((a, b) => (a.score > b.score) ? -1 : 1);
        if(data.length < 10*page+1) {
            res.write(JSON.stringify(data.slice(10*(page-1), data.length)));
            console.log("first");
            res.end();
        }
        else if (data.length < 10*(page+1)){
            res.write(JSON.stringify(data.slice(10*(page), data.length)));
            console.log("second");
            res.end();
        }
        else {
            // res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify(data.slice(10*(page), 10*(page+1))));
            console.log("third");
        }
        // console.log(fs.statSync("data/score_data.json").mtime);
        console.log(mtime.getTime());
        var i =0;
        while(fs.statSync("data/score_data.json").mtime.getTime() == mtime.getTime()) {
            if(i%10000000==0){
                break;
            }
            i+=1;
        }
    // }
});

function datesEqual(a, b) {
    return !(a > b || b > a);
}

app.get('/leaderboard', function(req, res) {
    res.sendFile(path.join(__dirname + '/leaderboard.html'));
});

function sleep(ms) {
    return new Promise(resolve => {setTimeout(resolve,ms)});
}

var server = app.listen(8081, function(){
    var port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});
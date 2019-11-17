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

app.use(session({
    secret: 'SadTanookiNoises',
    resave: true,
    saveUninitialized: true
}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
 
app.get('/api/v1/get_questions',function(req,res){
    var content = fs.readFileSync("quiz_data.json");
    var dat = JSON.parse(content);
    return res.status(200).send(dat.quiz1);
});

app.post('/api/v1/send_result',function(req,res){
    var user=req.body.user;
    var name=req.body.quiz;
    var score=req.body.score;


    var content = fs.readFileSync("data.json");
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
    // console.log(arr);
    for (i = 0; i < arr.length; i++) {
        if (arr[i].hasOwnProperty(name)) {
            thisuser=arr[i]
            flag=true;
            break;
        }
    }
    // console.log(thisuser);

    if(flag){
        if(score>thisuser[name]){

            
            thisuser[name]=score;
            fs.writeFile("data.json", JSON.stringify(dat));
            res.status(200).send("High Score Updated");
        }
        else{
            res.status(200).send("Better Luck Next Time...");
        }
    }
    else{
        
        var payload={
        }
        console.log(name)
        payload[name]=score
        console.log(payload)
        arr.push(payload);
        fs.writeFile("data.json", JSON.stringify(dat));
        res.status(200).send("Score Recorded!");
    }
    
});

app.post('/api/v1/get_content',function(req,res){
    var course=req.body.course;
    var content = fs.readFileSync("content_data.json");
    var dat = JSON.parse(content);
    res.status(200).send(dat[course]); 
});


app.post('/api/v1/taken_course',function(req,res){
    var user=req.body.user;
    var course=req.body.course;
    var content = fs.readFileSync("data.json");
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
    var content = fs.readFileSync("ratings_data.json");
    var dat = JSON.parse(content);
    dat.ratings.push({"course":course,"rating":rating});
    fs.writeFile("ratings_data.json", JSON.stringify(dat));


    var content = fs.readFileSync("data.json");
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
    fs.writeFile("data.json", JSON.stringify(dat));


    res.status(200).send("Thank You For Rating!");
});

app.post('/api/v1/login',function(req, res){
    var user=req.body.name;
    var pass=req.body.pass;
    var content = fs.readFileSync("data.json");
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
    var content = fs.readFileSync("data.json");
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
        dat.users.push({"username":user,"pass":pass,"email":mail,"courses":[],"quizes":[]});
        fs.writeFile("data.json", JSON.stringify(dat))
        return res.status(200).send({result: 'Registered Successfully!'});
    }
    
});
 


var server = app.listen(8081, function(){
    var port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});
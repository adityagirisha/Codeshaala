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

var len  = function(obj){
    var len=0;
    for(var i in obj){
        len++
    }
    return len;
}

//calculate the euclidean distance btw two item
var euclidean_score  = function(dataset,p1,p2){
    
    var existp1p2 = {};
    //store item existing in both item
    //if dataset is in p1 and p2 
    //store it in as one
    for(var key in dataset[p1]){
        if(key in dataset[p2]){
            existp1p2[key] = 1
        }
        if(len(existp1p2) ==0) return 0;
        //check if it has a datavar sum_of_euclidean_dist = [];
        //store the  euclidean distance
        
        //calculate the euclidean distance
        for(item in dataset[p1]){
            if(item in dataset[p2]){
                sum_of_euclidean_dist.push(Math.pow(dataset[p1] [item]-dataset[p2][item],2));
            }}
        var sum=0;
        for(var i=0;i<sum_of_euclidean_dist.length;i++){
            sum +=sum_of_euclidean_dist[i]; //calculate the sum of the euclidean
        }//since the sum will be small for familiar user
        // and larger for non-familiar user 
        //we make it exist btwn 0 and 1        var sum_sqrt = 1/(1 +Math.sqrt(sum));    return sum_sqrt;
    }
    
}
console.log(euclidean_score)

var pearson_correlation = function(dataset,p1,p2){
        var existp1p2 = {};
        for(item in dataset[p1]){
            if(item in dataset[p2]){
                existp1p2[item] = 1
            }
        }
        var num_existence = len(existp1p2);
        if(num_existence ==0) return 0;
        //store the sum and the square sum of both p1 and p2
        //store the product of both
        var p1_sum=0,
            p2_sum=0,
            p1_sq_sum=0,
            p2_sq_sum=0,
            prod_p1p2 = 0;
        //calculate the sum and square sum of each data point
        //and also the product of both point
        for(var item in existp1p2){
            p1_sum += dataset[p1][item];
            p2_sum += dataset[p2][item];p1_sq_sum += Math.pow(dataset[p1][item],2);
            p2_sq_sum += Math.pow(dataset[p2][item],2);prod_p1p2 += dataset[p1][item]*dataset[p2][item];
        }
        var numerator =prod_p1p2 - (p1_sum*p2_sum/num_existence);var st1 = p1_sq_sum - Math.pow(p1_sum,2)/num_existence;
        var st2 = p2_sq_sum -Math.pow(p2_sum,2)/num_existence;var denominator = Math.sqrt(st1*st2);
        if(denominator ==0) return 0;
        else {
            var val = numerator / denominator;
            return val;
        }
        
}




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
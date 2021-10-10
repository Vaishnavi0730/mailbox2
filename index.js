//-------------------------------------------//

var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var PORT = process.env.PORT || 9000;
var mongodb = require('mongodb');

const nodemailer = require('nodemailer')
const path = require('path')
const app = express()

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.set("view engine","ejs");
app.use(express.static('static'));
app.use(express.static('images'));

const uri = process.env.MONGODB_URI || 'mongodb+srv://vaishnavi:haravrva@cluster0.p1v2h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

//-------------------------------------------//

//-------------------------------------------//

mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;


db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

var email;

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user: 'y3vofficial@gmail.com',
        pass: 'officialy3v',
    }

});

//-------------------------------------------//


app.get('/', function (req, res) {
    res.set({
        "Allow-access-Allow-Origin": '*'
    })

    var alpha=['A','a','B','b','C','c','D','d','E','e','F','f','G','g','H','h','I','i','J','j','K','k','L','l','M','m','N','n','O','o','P','p','Q','q','R','r','S','s','T','t','U','u','V','v','W','w','X','x','Y','y','Z','z','0','1','2','3','4','5','6','7','8','9','!','@','#','$','%','^','&','*','+']
    var a = alpha[Math.floor(Math.random()*71)];
    var b = alpha[Math.floor(Math.random()*71)];
    var c = alpha[Math.floor(Math.random()*71)];
    var d = alpha[Math.floor(Math.random()*71)];
    var e = alpha[Math.floor(Math.random()*71)];
    var f = alpha[Math.floor(Math.random()*71)];
    var final=a+b+c+d+e+f;

    res.render("captcha",{'capt':final});
    
	// res.render("login");
})

app.get('/signin', function (req, res) {
	 res.render("signin");
});

app.get('/forgot', function (req, res){
	 res.render("forgot");
});

app.get('/gotootppage', function (req, res){
    res.render("otp");
});

app.get('/gotocaptchapage', function (req, res){
    res.render("captcha", {'capt': 'No_description'});
});

app.post('/forwardsent', function (req, res){
	var from= req.body.from;
	var to= req.body.to;
	var id= req.body.id;

    var query = {_id: new mongodb.ObjectID(id)};

    db.collection("inbox").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result[0].from)
        console.log(result[0].to)
        console.log(result[0].message)
        console.log(result[0].subject)

        var data = {
            "to": to,
            "from": from,
            "subject": result[0].subject,
            "message": result[0].message,
            "date": new Date()
        }

        console.log(data)
        db.collection('inbox').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully Into Inbox  collection");
        var query = { from: from };
        db.collection("inbox").find(query).toArray(function(err, result) {
            if (err) throw err;
            res.render('sent',{'data': result,'email':from})
        });
    });
    });
});

app.post('/forwardinbox', function (req, res){
	var from= req.body.from;
	var to= req.body.to;
	var id= req.body.id;

    var query = {_id: new mongodb.ObjectID(id)};

    db.collection("inbox").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result[0].from)
        console.log(result[0].to)
        console.log(result[0].message)
        console.log(result[0].subject)

        var data = {
            "to": to,
            "from": from,
            "subject": result[0].subject,
            "message": result[0].message,
            "date": new Date()
        }

        console.log(data)
        db.collection('inbox').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully Into Inbox  collection");
        var query = { to: from };
        db.collection("inbox").find(query).toArray(function(err, result) {
            if (err) throw err;
            res.render('inbox',{'data': result,'email':from})
        });
    });
    });
});

app.post('/compose', urlencodedParser, function (req, res){
	var email= req.body.email;

	 res.render("compose",{'email':email});
});

app.post('/back', urlencodedParser, function (req, res){
	var email= req.body.email;
    
	 res.render("mail",{'email':email});
});

app.post('/inbox', urlencodedParser, function (req, res){
	var email= req.body.email;
    var query = { to: email };

    db.collection("inbox").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.render('inbox',{'data': result,'email':email})

    });
});

app.post('/sent', urlencodedParser, function (req, res){
	var email= req.body.email;


    var query = { from: email };

    db.collection("inbox").find(query).toArray(function(err, result) {
        if (err) throw err;
        res.render('sent',{'data': result,'email':email})

    });
});

app.post('/deleteinbox', urlencodedParser, function (req, res){
	var id= req.body.id;
    var email = req.body.email;
    var query = {_id: new mongodb.ObjectID(id)};

    db.collection("inbox").deleteOne(query, function(err, obj) {
        if (err) throw err;
        console.log('1 document deleteed');

        var query = { to: email };
        db.collection("inbox").find(query).toArray(function(err, result) {
            if (err) throw err;
            res.render('inbox',{'data': result,'email':email})
        });
      });
});

app.post('/deletesent', urlencodedParser, function (req, res){
	var id= req.body.id;
    var email = req.body.email;
    var query = {_id: new mongodb.ObjectID(id)};

    db.collection("inbox").deleteOne(query, function(err, obj) {
        if (err) throw err;
        console.log('1 document deleteed')
        
        var query = { from: email };
        db.collection("inbox").find(query).toArray(function(err, result) {
            if (err) throw err;
            res.render('sent',{'data': result,'email':email})

        });
      });
});
//-------------------------------------------//

//-------------------------------------------//
app.post('/loggedin', urlencodedParser, function (req, res){
	var email= req.body.email;
	var password= req.body.password;
    
    var query = { email: email };
    db.collection("signin").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        if(result.length>0){
            if(result[0].password == password){
                // send mail with defined transport object
                var mailOptions = {
                    to: req.body.email,
                    subject: "Otp for registration is: ",
                    html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                };
            
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            
                    res.render('otp');
                });
                res.render('otp',{'email': result[0].email})
    
            }else{
                console.log('Invalid password');
                res.render('login')
            }
        }else{
            console.log('No such user present, please create a account');
            res.render('login')
        }
    });

});
//-------------------------------------------//

//-------------------------------------------//

app.post('/signedin', urlencodedParser, function (req, res){
	var fname= req.body.fname;
	var lname= req.body.lname;
	var email= req.body.email;
	var password= req.body.password;
	var cpassword= req.body.cpassword;

    var query = { email: email };
    db.collection("signin").find(query).toArray(function(err, result1) {
        if (err) throw err;
        console.log(result1);
        if(result1.length==0){
            if(password==cpassword){
                var data = {
                    "firstname": fname,
                    "lastname": lname,
                    "email" : email,
                    "password" : password
                }
        
                var data2 = {
                    "email" : email,
                    "password" : password
                }
            
                db.collection('signin').insertOne(data,(err,collection)=>{
                    if(err){
                        throw err;
                    }
                    else{
                        console.log("Record Inserted Successfully Into Sign In collection");

                        var data3 = {
                            "to": email,
                            "from": "Y2Vsupportstaff@y3v.com",
                            "subject": "Welcome Message",
                            "message": "Hello and  welcome to our mail service hope you have a good experience",
                            "date": new Date()
                        }
                    
                        db.collection('inbox').insertOne(data3,(err,collection)=>{
                            if(err){
                                throw err;
                            }
                            console.log("Record Inserted Successfully Into Inbox  collection");
                        });

                    }                
                });
        
                db.collection('login').insertOne(data2,(err,collection)=>{
                    if(err){
                        throw err;
                    }
                    console.log("Record Inserted Successfully Into Login collection");
                });
        
                // db.collection('signin').find().forEach( function(myDoc) { console.log( "email: " + myDoc.email ); } );
        
                 res.redirect('/');
        
            }else{
                console.log('Password Not Matching...try again!!')
                res.redirect('signin')
            }

        }else{
            console.log('User already exist')
            res.redirect('signin')

        }
    });

});

//-------------------------------------------//

//-------------------------------------------//

app.post('/forgot', urlencodedParser, function (req, res){
	var email= req.body.email;
	var password = req.body.password;

    var myquery = { email: email };
    var newvalues = { $set: {password:password } };
    db.collection("signin").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });
    db.collection("login").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });

    res.redirect('/')
});

//-------------------------------------------//

/-------------------------------------------//

app.post('/mailsent', urlencodedParser, function (req, res){
	var to= req.body.to;
	var subject= req.body.subject;
	var message= req.body.message;
	var from= req.body.from;

    var data = {
        "to": to,
        "from": from,
        "subject": subject,
        "message": message,
        "date": new Date()
    }

    db.collection('inbox').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully Into Inbox  collection");
        res.render('mail',{'email':from})
    });

});

//-------------------------------------------//

//-------------------------------------------//


app.post('/validcap', urlencodedParser, function (req, res){

    var stg1=req.body.capt;
    var stg2=req.body.textinput;
    if(stg1==stg2){
        console.log("validation is successful");
        res.render('login');
    }
    else{
        console.log("Please enter valid Captcha");
        res.redirect('/');   
    }
});

app.post('/verifyotp', function (req, res) {

	var email= req.body.email;

    if (req.body.otp == otp) {
        console.log("You has been successfully registered");
        res.render('mail',{'email':email});
    }
    else {
        console.log("INVALID OTP!! TRY AGAIn");
        res.render('otp', {'email':email});
    }
});

app.listen(PORT,function()
{
  console.log("Server running on port "+ PORT);
});
   



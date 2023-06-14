require('dotenv').config()
const  express = require("express")
const bodyParser = require("body-parser")
const app = express();
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const passportLocal = require("passport-local")
var findOrCreate = require('mongoose-findorcreate')
//google require
var GoogleStrategy = require('passport-google-oauth20').Strategy;

app.set('view engine', 'ejs')
// setup the static method for using css and images
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}));

// level 5 config
app.use(
    session({
        secret: "hello world",
        resave: false,
        saveUninitialized:false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

//to avoid deep warning

mongoose.connect("mongodb+srv://anjaliDB:"+process.env.PASSWORD+"@cluster0.vrccx.mongodb.net/hospitalDB",{useNewUrlParser:true, useUnifiedTopology:true})
mongoose.set("useCreateIndex", true);

// schema for footer
const patientSchema = new mongoose.Schema({
    name:String,
    email:String,
})
// model
const Patient = mongoose.model("Patient",patientSchema);

// schema for contact
const contactSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    country:String,
    state:String,
    city:String,
    mobile:String,
    subject:String,
    message:String,
})
// model
const Patientcont = mongoose.model("Patientcont",contactSchema);

// schema for appointment
const appointSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    country:String,
    mobile:String,
    reason:String,
    date:String,
    description:String,
    doctor:String,
    department:String,
})
// model
const Appointment = mongoose.model("Appointment",appointSchema);

// creating a reviews schema
const reviewSchema = new mongoose.Schema({
    name:String,
    feedback:String,
    rating:Number
  });
//  creating a model
const Review = mongoose.model("Review", reviewSchema);

// creating a User schema
const userSchema = new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
  });
  //level 5 plm comfig
userSchema.plugin(passportLocalMongoose);
//plugin for findOrCreate
userSchema.plugin(findOrCreate);
//  creating a model
const User = mongoose.model("User", userSchema);



//level 5 plm config 2
//use static authentication method of model in LocalStrategy
passport.use(User.createStrategy());

//suites all strtegy
passport.serializeUser(function(user, done){
    done(null,user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err,user){
        done(err,user);
    });
});

//google config
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://prohospital.herokuapp.com/auth/google/appointment"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",(req,res)=>{
    res.render("index");
})
    
app.get("/auth/google",passport.authenticate("google",{
    scope:["profile"]
}))
app.get('/auth/google/appointment', 
  passport.authenticate('google', { failureRedirect: '/User' }),
  function(req, res) {
    // Successful authentication, redirectappointment.
    res.redirect('/appointment');
});

app.get("/doctors",(req,res)=>{
    res.render("doctors")
})
    
app.get("/contact",(req,res)=>{
    res.render("contact")
})

app.get("/reviews",(req,res)=>{
    res.render("reviews")
})

app.get("/department",(req,res)=>{
    res.render("department")
})
    
app.get("/faq",(req,res)=>{
    Review.find({},(err,foundReviews)=>{
        if(!err){
            if(foundReviews){
                res.render("faq",{
                    ourfoundReviews : foundReviews
                });
            }
        }
    })
})

app.get("/registration",(req,res)=>{
    res.render("registration")
})

app.get("/signin",(req,res)=>{
    res.render("signin")
})
    
app.get("/signup",(req,res)=>{
    res.render("signup")
})
//app.post("/User",(req,res)=>{
//    const newUser = new User({
//        email: req.body.username,
//        password: req.body.password
//    })
//    newUser.save((err)=>{
//        if(!err){
//            res.render("appointment")
//        }else{
//            console.log(err);
//        }
//    });
//})

app.post("/signup", function(req, res){
    const newUser = req.body.username;
    const pass = req.body.password;

    User.register({username: newUser }, pass , function(err,user){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/appointment");
            });
        }
    });
});

//app.post("/signin",(req,res)=>{
//    const user_name = req.body.username;
//    const pass= req.body.password;
//    User.findOne({email:user_name},(err,foundregister)=>{
//        if(!err){
//            if(foundregister){
//                if(foundregister.password === pass){
//                    res.render("appointment");
//                }
//            }
//        }
//    })
//})

app.post("/signin",(req,res)=>{
     const user = new User({
         username: req.body.username,
         password:req.body.password
     });
     req.login(user,function(err){
         if(err){
             console.log(err);
         }else{
             passport.authenticate("local")(req,res, function(){
                 res.redirect("/appointment");
             });
         }
     })
 })
 
 app.get("/appointment",(req,res)=>{
     if(req.isAuthenticated()){
         res.render("appointment")
     }else{
         res.redirect("/registration")
     }
 })

app.post("/register",(req,res)=>{
    const newPatient = new Patient({
        name: req.body.username,
        email: req.body.useremail
    })
    newPatient.save((err)=>{
        if(!err){
            res.render("index")
        }else{
            console.log(err);
        }
    });
})

app.post("/contct",(req,res)=>{
    const newPatientcont = new Patientcont({
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.Email,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        mobile: req.body.mobile,
        subject: req.body.subject,
        message: req.body.message,
    })
    newPatientcont.save((err)=>{
        if(!err){
            res.render("index")
        }else{
            console.log(err);
        }
    });
})


app.post("/appoint",(req,res)=>{
    const newAppointment = new Appointment({
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        country: req.body.country,
        mobile: req.body.mobile,
        reason:req.body.reason,
        date:req.body.date,
        description:req.body.description,
        doctor:req.body.doctor,
        department:req.body.department,
    })
    newAppointment.save((err)=>{
        if(!err){
            res.render("index")
        }else{
            console.log(err);
        }
    });
})


app.post("/reviews", (req, res) => {
    const reviname = req.body.reviname;
    const review = req.body.review;
    const userRating = req.body.userRating;

    const review1 = new Review({
      name:reviname,
      feedback:review,
      rating:userRating
    });
    review1.save();
    res.redirect("/faq")
});
  
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/")
})



//setting up the server
app.listen(process.env.PORT || 3000,()=>{
    console.log("server started at port: 3000")
});
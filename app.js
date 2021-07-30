const express =require("express");
const mongoose = require("mongoose");
const bodyParser=require("body-parser");
const { stringify } = require("querystring");
const _ = require("lodash");
const { title } = require("process");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var authenticated=false;

// connecting to the database  
mongoose.connect("mongodb://localhost:27017/blogdb",{useNewUrlParser: true});


const articleschema ={
  title: String ,
  content:  String,
  comments:[String]
};

const article =mongoose.model("article",articleschema);


//routes

app.get("/",function(req,res){
        article.find({},function(err,articles){
        if(err)
        {
            console.log("errror while reading file");
            res.send("failed");
        }
        else{
            res.render("home",{articles:articles});
        }
    });
});


app.get("/login",function(req,res){
    res.render("login");
})

app.post("/login",function(req,res){
    //console.log("here");
    var email=req.body.admemail;
    var password=req.body.admpassword;
    //console.log(eml);
    if(email=="admin@gmail.com"&&password=="HALdhar@456"){
        authenticated=true;
        res.redirect("/compose");
    }
    else{
        console.log("failed login");
        res.redirect("/login");
    }
})

app.get("/compose",function(req,res){
    if(authenticated== true)
    res.render("compose");
    else
    {
        res.redirect("/login");
    }
});

app.post("/compose",function(req,res){
    var posttitle=req.body.title;
    var postcontent=req.body.content;
    article1=new article({
        title:posttitle,
        content:postcontent
    });
    article.create(article1);
    res.redirect("/");
});


app.get("/articles/:name",function(req,res){
    const requestedTitle = _.lowerCase(req.params.name);
    //console.log(requestedTitle);
    article.find({},function(err,articles){
        if(err){
            console.log("articles doesn't exist");
            res.redirect("/");
        }
        else{
                articles.forEach(function(article){
                const storedTitle = _.lowerCase(article.title);
            
                if (storedTitle === requestedTitle) {
                    //console.log(article.comments);
                    res.render("post", {
                    title: article.title,
                    content: article.content,
                    comments:article.comments
                  });
                }
              });
        }
    });
});

//post comments
app.post("/articles/:name",function(req,res){
    const requestedTitle = _.lowerCase(req.params.name);
    const comnt=req.body.comment;
    //console.log(comnt);
    var ans;
    article.find({},function(err,articles){
        if(err){
            console.log("articles doesn't exist");
            res.redirect("/");
        }
        else{
                articles.forEach(function(article){
                const storedTitle = _.lowerCase(article.title);
            
                if (storedTitle === requestedTitle) {
                    article.comments.push(comnt);
                    article.save();
                }
              });
        }
    });
    //article.save();
    res.redirect("/articles/"+req.params.name);                       
});

//search in databse 

app.post("/search",function(req,res){
    const searchstr=req.body.searchquery;
    const ttl = searchstr;
    const regex = new RegExp(ttl, 'i');
    //console.log(searchstr);
    article.find({title: {$regex: regex}}).exec(function(err, articles){
        if(err)
        {
            console.log(err);
            res.redirect("/");
        }
        else
        res.render("home",{articles:articles});
    }); 
});

//about and contact routes

app.get("/contact",function(req,res){
    res.render("contact");
});

app.get("/about",function(req,res){
res.render("about");
});

//dafault page

   app.use((req, res, next) => {
    res.render('default'); 
   });

// listening 
app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
  



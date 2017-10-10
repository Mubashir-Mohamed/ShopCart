const express = require('express')
const bp = require('body-parser')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express()
var token;
app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())

mongoose.connect('mongodb://localhost/shopcartdb');


const Schema = mongoose.Schema;

// create a schema
let userSchema = new Schema({
    username: String,
    password: String,
    name : String
  });


let shopSchema = new Schema({
    user_id : Schema.Types.ObjectId,
    item : String,
    added_on : { type: Date, default: Date.now }
});

let Shop = mongoose.model("shopts", shopSchema);




app.use(cookieParser());
const MS = require('express-mongoose-store')(session, mongoose);
app.use(session({ 
	secret: 'keyboard cat',
	store: new MS( {ttl: 600000})
})); //10 minute sessions

let User = mongoose.model('users', userSchema);



app.all('/', (req, res) =>{

   if(req.session.login_token){
        
        res.redirect('/display');
   }
   else{
    res.sendFile('./login.html', {root: __dirname });
   }
   
})
app.all('/login', (req, res) => {
    res.sendFile('./login.html', {root: __dirname });

})


app.all('/signup', (req, res) => {

    res.sendFile('./signup.html', {root: __dirname });


})

  

app.post('/api/signup', (req, res) => {


    let json_res = {
        error: true,
        message: "no_params_receieved"
    };

    if( ! req.body.hasOwnProperty('username') || 
    ! req.body.hasOwnProperty('password')  ||   ! req.body.hasOwnProperty('name')){
        res.json(json_res);
        return;
    }
    let user = req.body.username;
    let password = req.body.password;
    let name = req.body.name;

    User.create({"username": user, "password": password, "name" : name}, (error, result) => {
        if(error){
            json_res.message = "Something happened";
            res.json(json_res);

        }
        else{
            console.log(user)
            console.log(password)
            console.log(name)
            json_res.error = false;
            json_res.message = "success";
            res.json(json_res);
        }
    })
})

app.post('/api/login', (req, res) => {
    
    
        let json_res = {
            error: true,
            message: "no_params_receieved"
        };
    
        if( ! req.body.hasOwnProperty('username') || 
        ! req.body.hasOwnProperty('password')) {
            res.json(json_res);
            return;
        }
        let user = req.body.username;
        let password = req.body.password;    
        User.find({"username": user, "password": password}, (error, result) => {
            if(error){
                json_res.message = "failed";
                res.json(json_res);
    
            }
            else{
                console.log(user)
                console.log(password)
                req.session.login_token = result[0]["_id"]
                token = req.session.login_token;
                console.log(token)
                console.log(req.session.login_token)
                json_res.error = false;
                json_res.message = "success";
                res.json(json_res);
            }
        })
})
app.post('/logout', (req, res) => {
    let json_res = {
        error : true,
        message : "no_parameters_passed"
    }
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else{
            json_res.error = false;
            json_res.message = "destroyed";
            console.log(json_res);
            res.json(json_res);
        }
    })


})


app.post('/api/createshop', (req, res) => {
    
        console.log("Session var ", req.session.login_token);
        let json_res = {
            error: true,
            message: "no_params_receieved"
        };
    
        if( ! req.body.hasOwnProperty('item') ){
            res.json(json_res);
            return;
        }
        let item = req.body.item;
        let user_id = req.session.login_token;
        Shop.create({"user_id": user_id, "item": item}, (error, result) => {
            if(error){
                json_res.message = "Something happened";
                res.json(json_res);
    
            }
            else{
                console.log(req.session.login_token)
                json_res.error = false;
                json_res.message = "Shop details stored successfully";
                res.redirect('/display');
            }
        })
    })

app.all('/display', (req, res) => {
    if(req.session.login_token){
        res.sendFile('./display.html', {root: __dirname });
        
    }
    else{
        res.redirect('/login');
    }
})

app.post('/show-list', (req, res) => {
    
    let item_list = {
        item : "Your Item List is empty"
    }
    let user_id = req.session.login_token;
    Shop.find({"user_id" : user_id}, (error, result) => {
        if(error){
            json_res.message = "Something happened";
        }
        else{
            
            res.json(result);
            // console.log(len);
            // for(let i = 0; i < len; i++){
            //     item_list.item = result[i]["item"];
            //     console.log(item_list)
            //     res.json(item_list);
            // }
        }
    }) 
    
})

app.post('/updateitem', (req, res) => {
    let json_res = {
        error: true,
        message: "no_params_receieved"
    };

    if( ! req.body.hasOwnProperty('item') || ! req.body.hasOwnProperty('new_item')) {

        res.json(json_res);
        return;

    }
    let item = req.body.item;
    let new_item = req.body.new_item;
    console.log(item);
    let user_id = req.session.login_token;
    Shop.findOneAndUpdate({"item" : item}, {"item": new_item }, function(error, result) {
        if(error) {
            json_res.message = "something happened";
        } else {
             json_res.error = false;
            json_res.message = "item updated successfully";
            
            res.redirect('/display');
        }
    })
});


app.post('/deleteitem', (req, res) => {
    let json_res = {
        error: true,
        message: "no_params_receieved"
    };

    if( ! req.body.hasOwnProperty('item') ) {

        res.json(json_res);
        return;

    }
    let item = req.body.item;
    console.log(item);
    Shop.remove({"item" : item}, function(error, result) {
        if(error) {
            json_res.message = "something happened";
            
        } else {
             json_res.error = false;
            json_res.message = "item deleted successfully";
            
            res.redirect('/display');
        }
    })
});

app.post('/logout', (req, res) => {
   
    console.log("logout triggered");

    let json_res = {
        error : true,
        message : "no_parameters_passed"
    }
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else{
            json_res.message = "destroyed";
            console.log(json_res);
            res.redirect('/login');
            

        }
    })


})






app.listen(3000, () => {
    console.log(" => 3000")
})
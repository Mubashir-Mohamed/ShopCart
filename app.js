const express = require('express')
const bp = require('body-parser')
const mongoose = require('mongoose');
const app = express()

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

/*
let shopSchema = new Schema({
    user_id : Schema.Types.ObjectId,
    item : String,
    added_on : { type: Date, default: Date.now },
    price : Number
});

let Shop = mongoose.model("shoplist", shopSchema);


*/

let User = mongoose.model('users', userSchema);

app.all('/login', (req, res) => {
    res.sendFile('./login.html', {root: __dirname });

})


app.get('/signup', (req, res) => {

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
                json_res.error = false;
                json_res.message = "success";
                res.json(json_res);
            }
        })
})
/*
app.post('/api/createshop', (req, res) => {
    
    
        let json_res = {
            error: true,
            message: "no_params_receieved"
        };
    
        if( ! req.body.hasOwnProperty('item') || 
        ! req.body.hasOwnProperty('price')){
            res.json(json_res);
            return;
        }
        let item = req.body.item;
        let price = req.body.price;
    
        Shop.create({"item": item, "price": price}, (error, result) => {
            if(error){
                json_res.message = "Something happened";
                res.json(json_res);
    
            }
            else{
                console.log(user)
                console.log(password)
                console.log(name)
                json_res.error = false;
                json_res.message = "Shop details stored successfully";
                res.json(json_res);
            }
        })
    })
*/

app.listen(3000, () => {
    console.log(" => 3000")
})
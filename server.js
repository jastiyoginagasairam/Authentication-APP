const express = require('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const cors = require('cors');
const app = express();
require('dotenv').config()


const url=process.env.MONGOURL
const port=process.env.PORT
const path =require('path');


mongoose.connect(url,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex : true
}).then(
    () => console.log('DB Connection established')
)

app.use(express.static(path.join(__dirname,"./client/build")))
app.get("*",function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html'))
})


app.use(express.json());

app.use(cors({origin:"*"}))

app.post('/register',async (req, res) =>{
    try{
        const {username,email,password,confirmpassword} = req.body;
        let exist = await Registeruser.findOne({email})
        if(exist){
            return res.status(400).send("400");
        }
        if(password !== confirmpassword){
            return res.status(404).send("404");
        }
        let newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save();
        res.status(200).send("200");
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Internel Server Error')
    }
})

app.post('/login',async (req, res) => {
    try{
        const {email,password} = req.body;
        let exist = await Registeruser.findOne({email});
        if(!exist) {
            return res.status(404).send("404");
        }
        if(exist.password !== password) {
            return res.status(400).send("400");
        }
        let payload = {
            user:{
                id : exist.id
            }
        }
        jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
          (err,token) =>{
              if (err) throw err;
              return res.json({token})
          }  
            )

    }
    catch(err){
        console.log(err);
        return res.status(500).send("500");
    }
})

app.get('/myprofile',middleware,async(req, res)=>{
    try{
        let exist = await Registeruser.findById(req.user.id);
        if(!exist){
            return res.status(400).send('User not found');
        }
        res.json(exist);
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server Error');
    }
})

app.listen(5000||port,()=>{
    console.log("server running...")
})
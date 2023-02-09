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

app.use(cors())

app.post('/register',async (req, res) =>{
        const {username,email,password,confirmpassword} = req.body;
        let exist = await Registeruser.findOne({email})
        if(exist){
            res.status(400).json({message:"user already exist"});
        }
        if(password !== confirmpassword){
            res.status(404).json({message:"password and confirm-password should be same"});
        }
        let newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save();
        res.status(200).json({message:"Registered successfully"});
    
})

app.post('/login',async (req, res) => {
    try{
        const {email,password} = req.body;
        let exist = await Registeruser.findOne({email});
        if(!exist) {
            res.status(404).json({message:"Email not exist"});
        }
        if(exist.password !== password) {
            res.status(400).json({message:"Wrong password"});
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
        res.status(500).json({message:"server error"});
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

app.listen(port,()=>{
    console.log("server running...",port)
})
const router=require('express').Router();
const {User, validate}=require('../models/user');
const bcrypt=require("bcrypt");
const auth=require("../middleware/auth");

const admin =require("../middleware/admin");

const validObjectId=require("../middleware/validObjectId");
//create user
router.post("/",async(req,res)=>{
const {error}=validate(req.body);
if(error) return res.status(400).send({message:error.details[0].message});

const user =await User.findOne({email:req.body.email});

if(user)
    return res.status(403).send({message:"User with given email exist"})

 const salt=await bcrypt.genSalt(Number(process.env.SALT));

 const hashPassword =await bcrypt.hash(req.body.password,salt);

 let newUser=await User({...req.body,password:hashPassword}).save();

 newUser.password=undefined;
 newUser._v=undefined;

 res.status(200).send({data:newUser,message:"Account created successfully"})




})
//get all users

router.get("/",admin,async(req,res)=>{
    const users =await User.find().select("-password -__v")
    res.status(200).send({data:users})
})

//get user by id
router.get("/:id",[validObjectId,admin],async(req,res)=>{
    const user =await User.findById(req.params.id).select("-password -__v")
    res.status(200).send({data:user})
})

//update user by id
router.put("/:id",[validObjectId,auth],async(req,res)=>{
    const user =await User.findOneAndUpdate(req.params.id,
        {$set:req.body},
        {new:true}).select("-password -__v") 
    res.status(200).send({data:user})
})

//delete user by id
router.delete("/:id",[validObjectId,admin],async(req,res)=>{
 await User.findByIdAndDelete(req.params.id)
 res.status(200).send({message:"Successfully deleted user"})
})

 

module.exports=router;


 
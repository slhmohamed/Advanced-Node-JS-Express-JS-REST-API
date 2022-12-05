const router=require('express').Router();
const {Song, validate}=require('../models/song');
const bcrypt=require("bcrypt");
const auth=require("../middleware/auth");

const admin =require("../middleware/admin");

const validObjectId=require("../middleware/validObjectId");
//create song
router.post("/",admin,async(req,res)=>{
const {error}=validate(req.body);
if(error) return res.status(400).send({message:error.details[0].message});

 

 
 let newUser=await Song(req.body).save();

 

 res.status(200).send({data:newUser,message:"Song created successfully"})




})
//get all songs

router.get("/",async(req,res)=>{
    const songs =await Song.find()
    res.status(200).send({data:songs})
})


//update song by id
router.put("/:id",[validObjectId,admin],async(req,res)=>{
    const song =await Song.findOneAndUpdate(req.params.id,
        {$set:req.body},
        {new:true})
    res.status(200).send({data:song,message:"Updated song successfully"})
})

//delete song by id
router.delete("/:id",[validObjectId,admin],async(req,res)=>{
 await Song.findByIdAndDelete(req.params.id)
 res.status(200).send({message:"Successfully deleted song"})
})

//LIKE SONG 
router.put("/like/:id",[validObjectId,auth],async(req,res)=>{
    
    let resMessage="";
    const song =await Song .findById(req.params.id);
    if(!song) return res.status(400).send({message:"Song does not exist"});

    const user =await User.findById(req.user._id);

    const index=user.likedSongs.indexOf(song._id);

    if(index===-1){

        user.likedSongs.push(song._id);
        resMessage="Added to your liked songs"
    }else{
        user.likedSongs.splice(index,1);
        resMessage="Removed from your liked songs";
    }
    await user.save();

    res;status(200).send({message:resMessage})
});

//get all liked songs

router.get("/like" ,auth,async(req,res)=>{
    const user =await User.findById(req.user._id);
    const songs =await Song.find({_id:user.likedSongs});
    res.status(200).send({data:songs})

})

 

module.exports=router;


 
const router = require('express').Router();
const { Playlist, validate } = require('../models/playlist');
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const { User } = require("../models/user")
const { Song } = require("../models/song")


const admin = require("../middleware/admin");
const Joi = require("joi");
const validObjectId = require("../middleware/validObjectId");
//create playlist

router.post("/", auth, async (req, res) => {

    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const user = await User.findById(req.user._id);
    const playlist = await Playlist({ ...req.body, user: user._id }).save();
    user.playlists.push(playlist._id);
    await user.save();
    res.satatus(201).send({ data: playlist });

})

//edit playlist by id

router.put("/edit/:id", [validObjectId, auth], async (req, res) => {
    const Schema = Joi.object({
        name: Joi.string.required(),
        desc: Joi.string().allow(""),
        img: Joi.string.allow("")
    });
    const { error } = schema.validate(req.body);

    if (error) return res.status(400).send({ message: error.details[0].message })

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) return res.status(404).send({ message: "Playlist not found" });

    const user = await User.findById(req.user._id);

    if (!user._id.equals(playlist.user))
        return res.status(403).send({ message: "User don't have access to edit" });

    playlist.name = req.body.name;
    playlist.desc = req.body.desc;
    playlist.img = req.body.img;

    await playlist.save();

    res.status(200).send({ message: "Update successfully" })

});

//add song to playlsit

router.put("/add-song", auth, async (req, res) => {
    const schema = Joi.object({
        playlistId: Joi.string().required(),
        songId: Joi.string().required()

    })

    const { error } = schema.validate(req.body);

    if (error) return res.status(400).send({ message: eroor.details[0].message });
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);
    if (!user._id.equals(playlist.user))
        return res.satatus(403).send({ message: "User don't have access to add" });


    if (playlist.songs.indexOf(req.body.songId) === -1) {
        playlist.songs.push(req.body.songId);

    }

    await playlist.save()
    res.status(200).send({ data: playlist, message: "Added to playlist" })
})

//remove song form plyalist

router.put("/remove-song", auth, async (req, res) => {
    const schema = Joi.object({
        playlistId: Joi.string().required(),
        songId: Joi.string().required()

    })

    const { error } = schema.validate(req.body);

    if (error) return res.status(400).send({ message: eroor.details[0].message });
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);
    if (!user._id.equals(playlist.user))
        return res.satatus(403).send({ message: "User don't have access to add" });

const index=playlist.songs.indexOf(req.body.songId);

playlist.songs.splice(index,1);
await playlist.save();
res.status(200).send({data:playlist,message:"Remove from playlist"})
})

//get random playlist

router.get("/random",auth,async(req,res)=>{
    const playlists =await Playlist.aggregate([{$sample:{size:10}}]);
    res.status(200).send({data:playlists});

})

//get playlist by id and songs
router.get("/:id",[validObjectId,auth],async(req,res)=>{
    const playlist=await Playlist.findById(req.params.id);

    if(!playlist) return res.status(404).send("Not found");

    const songs =await Song.find({id:playlist.songs});
    res.status(200).send({data:{playlist,songs}})
})

//get all playlist
router.get("/",auth,async(req,res)=>{
    const playlists=await Playlist.find();
    res.status(200).send({data:playlists})
})
 module.exports=router;

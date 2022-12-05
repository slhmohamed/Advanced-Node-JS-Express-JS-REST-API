require("dotenv").config();
const express =require("express");
require("express-async-errors");
const cors =require("cors");
const app=express();
const connection=require('./startup/DB')
const userRoutes=require('./routes/users')
const authRoutes=require("./routes/auth")
const searchRoutes=require("./routes/search");
const playlistRoutes=require("./routes/playlists");

connection();
app.use(cors());
app.use(express.json())


app.use("/api/users",userRoutes)
app.use("/api/login",authRoutes)
app.use("/api/search",searchRoutes)
app.use("/api/playlist",playlistRoutes)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`AppLocal .. Listening on port ${port}...`);
})
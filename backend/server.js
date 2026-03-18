const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey"; // change later

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/admin-login", (req, res) => {

const { email, password } = req.body;

if(email === "admin@gmail.com" && password === "123456"){

const token = jwt.sign(
{ email: email },
SECRET_KEY,
{ expiresIn: "1h" }
);

res.json({ success: true, token });

}else{
res.json({ success: false });
}

});


function verifyToken(req, res, next){

const token = req.headers.authorization;

if(!token){
return res.status(403).json({ error: "No token provided" });
}

try{
const decoded = jwt.verify(token, SECRET_KEY);
req.user = decoded;
next();
}catch(err){
return res.status(401).json({ error: "Invalid token" });
}

}

/* ========================= */
/* DATABASE CONNECTION */
/* ========================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ========================= */
/* SCHEMA (ADD HERE ✅) */
/* ========================= */

const applicationSchema = new mongoose.Schema({
name: String,
email: String,
social: String,
followers: Number,
category: String,
message: String,
status: {
type: String,
default: "Pending"
}
});

const Application = mongoose.model("Application", applicationSchema);

const messageSchema = new mongoose.Schema({
name: String,
email: String,
message: String,
date: {
type: Date,
default: Date.now
}
});

const Message = mongoose.model("Message", messageSchema);

app.post("/contact", async (req, res) => {

try{
const newMessage = new Message(req.body);
await newMessage.save();

res.json({ message: "Message sent successfully" });
}
catch(err){
res.status(500).json({ error: "Failed to send message" });
}

});

app.get("/messages", async (req, res) => {

try{
const data = await Message.find().sort({ date: -1 });
res.json(data);
}
catch(err){
res.status(500).json({ error: "Failed to fetch messages" });
}

});

/* ========================= */
/* ROUTES */
/* ========================= */

app.get("/", (req, res) => {
res.send("CreatorAccess Backend Running");
});

app.post("/apply", async (req, res) => {

try{
const newApp = new Application(req.body);
await newApp.save();

res.json({ message: "Application saved to database" });
}
catch(err){
res.status(500).json({ error: "Failed to save data" });
}

});

app.get("/applications", verifyToken, async (req, res) => {
    const data = await Application.find();
res.json(data);
});


app.get("/stats", async (req, res) => {

const total = await Application.countDocuments();

res.json({
totalApplications: total
});

});

app.put("/update-status/:id", async (req, res) => {

const { status } = req.body;

try{

await Application.findByIdAndUpdate(req.params.id, { status });

res.json({ message: "Status updated successfully" });

}
catch(err){
res.status(500).json({ error: "Failed to update status" });
}

});



/* ========================= */
/* SERVER */
/* ========================= */

app.listen(5000, () => {
console.log("Server running on http://localhost:5000");
});
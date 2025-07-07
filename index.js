import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { userrouter } from './Routes/route.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api",userrouter);
app.get("/",(req,res)=>{
    res.send("Welcome to the API");

})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
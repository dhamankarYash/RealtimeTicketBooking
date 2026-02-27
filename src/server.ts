import express from "express"
import dotenv from "dotenv"
import { prisma } from "./config/prisma";

dotenv.config();

const app= express();
app.use(express.json());

app.get("/db-check", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/health",(req,res) =>{
    res.status(200).json({status:"ok"});
});



const PORT=process.env.PORT || 5000;

app.listen(PORT ,()=>{
    console.log(`Server is runnin on port ${PORT}`);
});
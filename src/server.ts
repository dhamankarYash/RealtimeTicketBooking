import express from "express"
import dotenv from "dotenv"
import { prisma } from "./config/prisma";
import eventRoutes from "./routes/event.routes"
import bookingroutes from "./routes/booking.routes"
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
dotenv.config();

const app= express();
app.use(express.json());

app.use("/events",eventRoutes);
app.use("/bookings",bookingroutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

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



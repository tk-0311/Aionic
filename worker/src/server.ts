import express from "express";
import cors from "cors";
import { startAutoUpdate } from "./service/autoUpdate"; 
const app = express();
const PORT:number = 3110
app.use(cors({ credentials: true, origin: '/' }));

startAutoUpdate()


app.listen(PORT, ()=> {
    console.log(`listening to port ${PORT}`) 
})
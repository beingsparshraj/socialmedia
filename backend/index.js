import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import postRoute from './routes/post.route.js';
import messageRoute from './routes/message.route.js'
import commentRoute from './routes/message.route.js';
dotenv.config();
import { app, server } from './socket/socket.js';
const PORT = process.env.PORT;
import path from "path";

const _dirname = path.resolve();
console.log(_dirname);

const corsOptions = {
    origin: process.env.URL,
    credentials: true,
}
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/comment', commentRoute);
app.use('/api/v1/message', messageRoute);

app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
})




app.get('/', (req, res) => {
    return res.status(200).json({
        message: "Welcome to the backend server!"

    })
})



connectDB();
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

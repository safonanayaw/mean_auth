import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000
connectDB();

const allowedOrigins = process.env.FRONTEND_URL


app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins,
    methods: "GET, POST, PUT, DELETE",
    credentials: true
}))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});


//API EndPoints
app.get('/',(req, res)=> res.send('API working'));

app.use('/api/auth', authRouter); 
app.use('/api/user', userRouter);

app.listen(port, ()=> console.log(`App is runnig on port ${port}`));
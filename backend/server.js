import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'; // Import dotenv
import stockentryRoute from './routes/stockentryRoute.js'; // Adjust the path if necessary
import userRouter from './routes/userRoute.js';

// Load environment variables
dotenv.config();

const app = express();

app.use(cors({
    origin: 'https://stock-management-frontend-pzfv.onrender.com'
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

//api endpoints
app.use('/api/stock', stockentryRoute);
app.use("/api/user", userRouter) 

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

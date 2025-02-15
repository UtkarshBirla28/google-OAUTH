import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import googleRouter from './routes/google.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);


app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
  })
);


app.use('/api/google', googleRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

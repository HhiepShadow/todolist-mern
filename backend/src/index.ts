import express from "express";
import mongoose from "mongoose";
import todoRouter from "./routes/todoRouter";
import dotenv from "dotenv";
import cors from "cors";
import { loggingMiddleware } from "./middlewares/loggingMiddleware";
import { PORT, MONGO_URI } from "./utils/constants";
import userRouter from "./routes/userRouter";
import redisClient from "./utils/redis";

dotenv.config();

const app = express();

// Middlewares:
app.use(express.json());
app.use(loggingMiddleware);
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.use("/api/todos", todoRouter);
app.use("/api/auth", userRouter);

redisClient
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error(err));

mongoose
  .connect(MONGO_URI as string)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    console.log(`Connected to Database`);
  })
  .catch((err) => console.error(err));

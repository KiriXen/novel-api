import express from "express";
import cors from "cors";
import novelRouter from "./routes/novel-routes.js";
import genreRouter from "./routes/genre-routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/novel", novelRouter);
app.use("/api/genre", genreRouter);
app.use("/", (req, res) => {
  res.send({ message: "Welcome to Novel Scrapper" });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}

export default app;
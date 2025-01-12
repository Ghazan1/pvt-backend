import * as dotenv from "dotenv";
import express from "express";
import path, { dirname } from "path";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import fs from "fs";
import serveIndex from "serve-index";

dotenv.config();
const now = new Date();
// Format the date as "yyyy-mm-dd"
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, "0");
const day = now.getDate().toString().padStart(2, "0");
const date = `${year}-${month}-${day}`;
// Format the time as "hhmmss"
const hours = now.getHours().toString().padStart(2, "0");
const minutes = now.getMinutes().toString().padStart(2, "0");
const seconds = now.getSeconds().toString().padStart(2, "0");
const time = `${hours}${minutes}${seconds}`;
// Combine the date and time into a single string
const dateTime = `${date}_${time}`;
var baseUrl;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(
  "/files",
  express.static("public"),
  serveIndex("public", { icon: true })
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "20mb" }));

app.use(cors({ origin: "*" }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // specify the destination folder where the file will be saved
  },
  filename: function (req, file, cb) {
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}_${date
      .getHours()
      .toString()
      .padStart(2, "0")}-${date.getMinutes().toString().padStart(2, "0")}-${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    cb(null, timestamp); // concatenate the timestamp and the original file name
  },
});

const multerUploader = multer({ storage: storage });
const upload = multerUploader.single("file");

function getBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

app.post("/upload/csv", function (req, res) {
  upload(req, res, function (err) {
    const file = req.file;
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: err.message });
    } else if (err) {
      console.log("checking API Request ERROR:::", err);

      return res.status(500).json({
        success: false,
        message: "An error occurred",
      });
    }
    // baseUrl = getBaseUrl(req);
    baseUrl = process.env.BASE_URL;
    const fileUrl = `https://pvt-1.onrender.com/download/${file.filename}`;
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: fileUrl,
    });
  });
});

app.get("/download/:csv", (req, res) => {
  const filePath = path.join(__dirname, `public/uploads/${req.params.csv}`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
      return;
    }
    res.setHeader("Content-Type", "text/csv");
    res.send(data);
  });
});

app.use(express.static(__dirname + "/public"));

app.listen(process.env.PORT, function () {
  baseUrl = `${this.address().address}:${this.address().port}`;
  console.log(`Server started at ${baseUrl}`);
});

import * as dotenv from 'dotenv';
import express from 'express';
import path, { dirname } from 'path';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';

dotenv.config();
const now = new Date();
// Format the date as "yyyy-mm-dd"
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');
const date = `${year}-${month}-${day}`;
// Format the time as "hhmmss"
const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');
const seconds = now.getSeconds().toString().padStart(2, '0');
const time = `${hours}${minutes}${seconds}`;
// Combine the date and time into a single string
const dateTime = `${date}_${time}`;
var baseUrl;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors({ origin: '*' }));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname + '/public/uploads/'));
	},
	filename: function (req, file, cb) {
		// const uniqueSuffix = `${dateTime}`;
		cb(null, dateTime + path.extname(file.originalname));
	},
});

const multerUploader = multer({ storage: storage });
const upload = multerUploader.single('file');

function getBaseUrl(req) {
	return `${req.protocol}://${req.get('host')}`;
}

app.post('/upload/csv', function (req, res) {
	console.log('checking API Request :::');
	upload(req, res, function (err) {
		let file = req.file;
		if (err instanceof multer.MulterError) {
			return res.status(500).json({ success: false, message: err.message });
		} else if (err) {
			console.log('checking API Request ERROR:::', err);

			return res.status(500).json({
				success: false,
				message: 'An error occurred',
			});
		}
		// baseUrl = getBaseUrl(req);
		baseUrl = process.env.BASE_URL;
		console.log(baseUrl);
		const fileUrl = `${baseUrl}/uploads/${file.filename}`;
		console.log(fileUrl);
		return res.status(200).json({
			success: true,
			message: 'File uploaded successfully',
			url: fileUrl,
		});
	});
});

app.use(express.static(__dirname + '/public'));

app.listen(3003, function () {
	baseUrl = `${this.address().address}:${this.address().port}`;
	console.log(`Server started at ${baseUrl}`);
});

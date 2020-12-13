const multer = require('multer');
const DIR = './public/images';
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR); // for folder name
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${new Date().toISOString().replace(/:/g, "-")}-${file.originalname}`
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "video/quicktime" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "video/mp4"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
var upload = multer({ storage: fileStorage, fileFilter: fileFilter });

module.exports = upload;
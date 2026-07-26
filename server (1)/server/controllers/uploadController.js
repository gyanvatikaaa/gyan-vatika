const cloudinary = require("../config/cloudinary");

// @route  POST /api/upload/file
// @body   { fileBase64, fileName }
// @desc   Uploads any file (image or PDF) and returns its hosted URL + detected type.
// Used by both test answer photos and assignment attachments/submissions.
const uploadFile = async (req, res) => {
  try {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ message: "No file provided" });
    }

    const isPdf = fileBase64.startsWith("data:application/pdf");

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "gyan-vatika/assignments",
      resource_type: isPdf ? "raw" : "image",
    });

    res.json({
      url: result.secure_url,
      fileType: isPdf ? "pdf" : "image",
      fileName: fileName || "file",
    });
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

module.exports = { uploadFile };

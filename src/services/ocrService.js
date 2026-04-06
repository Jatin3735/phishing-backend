const Tesseract = require('tesseract.js');
const fs = require('fs');

exports.extractTextFromImage = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng',
            { logger: m => console.log(m) }
        );
        return text;
    } catch (error) {
        console.error('Tesseract OCR error:', error);
        throw new Error('Failed to extract text from image');
    } finally {
        // Cleanup temp file uploaded via multer if needed
        if (fs.existsSync(imagePath)) {
            // Optional: comment out if we want to keep images for manual review
            fs.unlinkSync(imagePath);
        }
    }
};

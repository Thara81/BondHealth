// storage.js - Handle file uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        './uploads',
        './uploads/reports',
        './uploads/scans',
        './uploads/temp'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

createUploadDirs();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = './uploads/temp';
        if (file.fieldname === 'report') {
            dest = './uploads/reports';
        } else if (file.fieldname === 'scan') {
            dest = './uploads/scans';
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

// File filter - allow only certain file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf',
        'application/dicom', 
        'application/octet-stream'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and DICOM files are allowed.'), false);
    }
};

// Configure upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: fileFilter
});

// Simple storage service (local files for now)
class StorageService {
    async uploadFile(file, folder = 'reports') {
        // For now, just return the local path
        return {
            url: `/uploads/${folder}/${path.basename(file.path)}`,
            filename: path.basename(file.path),
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        };
    }

    async deleteFile(filename, folder = 'reports') {
        const filePath = path.join('./uploads', folder, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }
}

module.exports = {
    upload,
    storageService: new StorageService()
};
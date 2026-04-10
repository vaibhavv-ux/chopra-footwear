const path = require('path');
const fs = require('fs');

/**
 * Utility to resolve storage paths for the database and uploads.
 * If running on Render with a persistent disk, it uses the mount path.
 * Otherwise, it defaults to the local server directory.
 */

const getStoragePath = () => {
    // Check for the persistent storage path environment variable (set in render.yaml)
    const renderPath = process.env.PERSISTENT_STORAGE_PATH;
    
    if (renderPath && fs.existsSync(renderPath)) {
        return renderPath;
    }
    
    // Default to project root for local development
    return path.join(__dirname, '..');
};

const storagePath = getStoragePath();
const uploadsPath = path.join(storagePath, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
    console.log(`📁 Creating uploads directory at: ${uploadsPath}`);
    fs.mkdirSync(uploadsPath, { recursive: true });
}

module.exports = {
    storagePath,
    uploadsPath,
    dbPath: path.join(storagePath, 'chopra.db')
};

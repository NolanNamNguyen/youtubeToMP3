const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Vercel Serverless Function to download YouTube audio as MP3
 */
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let tempFilePath = null;

    try {
        const { url } = req.body;

        // Validate URL
        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        // Basic YouTube URL validation
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/;
        if (!youtubeRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        console.log('Processing URL:', url);

        // First, get the video title
        const titleProcess = spawn('yt-dlp', ['--get-title', url]);
        let title = '';
        let titleError = '';

        titleProcess.stdout.on('data', (data) => {
            title += data.toString();
        });

        titleProcess.stderr.on('data', (data) => {
            titleError += data.toString();
        });

        await new Promise((resolve, reject) => {
            titleProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(titleError || 'Failed to get video title'));
                } else {
                    resolve();
                }
            });
        });

        title = title.trim().replace(/[^\w\s-]/g, '').trim();
        const filename = `${title}.mp3`;

        console.log('Video title:', title);

        // Create a temporary file path
        tempFilePath = path.join(os.tmpdir(), `ytdl-${Date.now()}.mp3`);

        // Download and convert to MP3
        const downloadArgs = [
            url,
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '0',
            '--output', tempFilePath,
            '--no-playlist',
            '--quiet',
            '--progress',
        ];

        const downloadProcess = spawn('yt-dlp', downloadArgs);

        let downloadError = '';
        downloadProcess.stderr.on('data', (data) => {
            downloadError += data.toString();
        });

        // Wait for download to complete
        await new Promise((resolve, reject) => {
            downloadProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(downloadError || 'Download failed'));
                }
            });

            downloadProcess.on('error', (error) => {
                reject(error);
            });
        });

        console.log('Download completed, streaming file...');

        // Set response headers for file download
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');

        // Stream the file to the response
        const fileStream = fs.createReadStream(tempFilePath);
        
        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to stream audio file' });
            }
        });

        fileStream.pipe(res);

        // Clean up temp file after streaming
        fileStream.on('end', () => {
            console.log('Streaming completed for:', title);
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlink(tempFilePath, (err) => {
                    if (err) console.error('Failed to delete temp file:', err);
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Clean up temp file on error
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error('Failed to delete temp file:', err);
            });
        }
        
        // Send error response if headers not sent
        if (!res.headersSent) {
            const errorMessage = error.message || 'An error occurred while processing the video';
            res.status(500).json({ error: errorMessage });
        }
    }
};

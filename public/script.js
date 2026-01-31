// DOM Elements
const form = document.getElementById('converterForm');
const urlInput = document.getElementById('youtubeUrl');
const convertBtn = document.getElementById('convertBtn');
const statusDiv = document.getElementById('status');
const progressDiv = document.getElementById('progress');

// YouTube URL validation regex
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/;

// Event Listeners
form.addEventListener('submit', handleSubmit);
urlInput.addEventListener('input', clearStatus);

/**
 * Handle form submission
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    
    // Validate URL
    if (!validateYouTubeUrl(url)) {
        showStatus('Please enter a valid YouTube URL', 'error');
        return;
    }
    
    // Start conversion
    await convertToMP3(url);
}

/**
 * Validate YouTube URL
 */
function validateYouTubeUrl(url) {
    return YOUTUBE_REGEX.test(url);
}

/**
 * Convert YouTube video to MP3
 */
async function convertToMP3(url) {
    try {
        // Update UI
        setLoading(true);
        showProgress();
        showStatus('Processing your video...', 'info');
        
        // Call API
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to convert video');
        }
        
        // Get the blob
        const blob = await response.blob();
        
        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'audio.mp3';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="([^"]+)"|filename=([^;\s]+)/);
            if (filenameMatch) {
                filename = filenameMatch[1] || filenameMatch[2];
            }
        }
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        // Success message
        hideProgress();
        showStatus('✓ Download started! Check your downloads folder.', 'success');
        
        // Reset form after delay
        setTimeout(() => {
            urlInput.value = '';
            clearStatus();
        }, 3000);
        
    } catch (error) {
        console.error('Conversion error:', error);
        hideProgress();
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
}

/**
 * Clear status message
 */
function clearStatus() {
    statusDiv.textContent = '';
    statusDiv.className = 'status-message';
}

/**
 * Show progress indicator
 */
function showProgress() {
    progressDiv.style.display = 'block';
}

/**
 * Hide progress indicator
 */
function hideProgress() {
    progressDiv.style.display = 'none';
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    convertBtn.disabled = isLoading;
    urlInput.disabled = isLoading;
    
    if (isLoading) {
        convertBtn.querySelector('.btn-text').textContent = 'Converting...';
    } else {
        convertBtn.querySelector('.btn-text').textContent = 'Convert to MP3';
    }
}

// App Deployer - Main JavaScript functionality
class AppDeployer {
    constructor() {
        this.apiUrl = 'https://landing-page-api-bgf8.onrender.com';
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.folderInput = document.getElementById('folderInput');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultContainer = document.getElementById('resultContainer');
        this.resultUrl = document.getElementById('resultUrl');
        this.errorMessage = document.getElementById('errorMessage');
        this.copyBtn = document.getElementById('copyBtn');
        this.visitBtn = document.getElementById('visitBtn');
        
        this.currentUrl = '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Drag and drop events
        this.dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        
        // File input changes
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        this.folderInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        // Prevent default drag behaviors on document
        document.addEventListener('dragenter', this.preventDefaults);
        document.addEventListener('dragover', this.preventDefaults);
        document.addEventListener('dragleave', this.preventDefaults);
        document.addEventListener('drop', this.preventDefaults);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragEnter(e) {
        this.preventDefaults(e);
        this.dropZone.classList.add('dragover');
    }

    handleDragOver(e) {
        this.preventDefaults(e);
        this.dropZone.classList.add('dragover');
    }

    handleDragLeave(e) {
        this.preventDefaults(e);
        // Only remove dragover if we're leaving the drop zone entirely
        if (!this.dropZone.contains(e.relatedTarget)) {
            this.dropZone.classList.remove('dragover');
        }
    }

    handleDrop(e) {
        this.preventDefaults(e);
        this.dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        this.handleFiles(files);
    }

    async handleFiles(files) {
        if (files.length === 0) return;
        
        this.hideError();
        this.setProcessingState();
        
        try {
            // Process files and extract content
            const appData = await this.processFiles(files);
            
            // Deploy full app via API
            const result = await this.deployApp(appData);
            
            // Show success
            this.showSuccess(result.url);
            
        } catch (error) {
            console.error('Error processing files:', error);
            this.showError(error.message || 'Failed to process your files. Please try again.');
        }
    }

    async processFiles(files) {
        this.updateProgress(10, 'Analyzing files...');
        
        let title = 'My App';
        let mainFile = 'index.html';
        const processedFiles = {};
        
        // Convert FileList to Array
        const fileArray = Array.from(files);
        
        this.updateProgress(30, 'Processing content...');
        
        // Process each file
        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            let fileName = file.name;
            
            // Handle file paths from folders (webkitRelativePath)
            if (file.webkitRelativePath) {
                fileName = file.webkitRelativePath;
            }
            
            this.updateProgress(30 + (i / fileArray.length) * 40, `Processing ${fileName}...`);
            
            try {
                if (fileName.toLowerCase().endsWith('.png') || 
                    fileName.toLowerCase().endsWith('.jpg') || 
                    fileName.toLowerCase().endsWith('.jpeg') ||
                    fileName.toLowerCase().endsWith('.gif') ||
                    fileName.toLowerCase().endsWith('.svg')) {
                    // Handle image files as base64
                    processedFiles[fileName] = await this.readFileAsDataURL(file);
                } else {
                    // Handle text files
                    processedFiles[fileName] = await this.readFileAsText(file);
                }
                
                // Extract title from HTML files
                if (fileName.toLowerCase().endsWith('.html')) {
                    const extracted = this.extractHTMLMetadata(processedFiles[fileName]);
                    if (extracted.title) {
                        title = extracted.title;
                    }
                    
                    // Set main file (prefer index.html)
                    if (fileName.toLowerCase().includes('index') || mainFile === 'index.html') {
                        mainFile = fileName;
                    }
                }
            } catch (error) {
                console.warn(`Failed to process file ${fileName}:`, error);
                // Continue with other files
            }
        }
        
        // If no HTML files, use first file as main
        if (!Object.keys(processedFiles).some(name => name.toLowerCase().endsWith('.html'))) {
            mainFile = fileArray[0]?.name || 'index.html';
        }
        
        this.updateProgress(80, 'Preparing deployment...');
        
        return {
            title: title.substring(0, 50),
            files: processedFiles,
            mainFile: mainFile
        };
    }

    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    extractHTMLMetadata(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Extract title
        const titleElement = doc.querySelector('title');
        const title = titleElement ? titleElement.textContent.trim() : '';
        
        // Extract description from meta tag
        const descriptionMeta = doc.querySelector('meta[name="description"]');
        const description = descriptionMeta ? descriptionMeta.getAttribute('content') : '';
        
        return { title, description };
    }

    getFileNameWithoutExtension(filename) {
        return filename.split('.').slice(0, -1).join('.') || filename;
    }

    async deployApp(appData) {
        this.updateProgress(85, 'Deploying your app...');
        
        const response = await fetch(`${this.apiUrl}/api/apps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: Failed to deploy app`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to deploy app');
        }
        
        this.updateProgress(100, 'Complete!');
        
        return result;
    }

    setProcessingState() {
        this.hideAllStates();
        this.dropZone.classList.add('processing');
        this.progressContainer.classList.remove('hidden');
        
        // Update drop zone content
        const dropIcon = this.dropZone.querySelector('.drop-icon');
        const dropText = this.dropZone.querySelector('.drop-text');
        const dropSubtext = this.dropZone.querySelector('.drop-subtext');
        
        dropIcon.textContent = '⚙️';
        dropText.textContent = 'Processing your app...';
        dropSubtext.textContent = 'Creating your live URL';
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }

    showSuccess(url) {
        this.hideAllStates();
        this.dropZone.classList.add('success');
        this.resultContainer.classList.remove('hidden');
        
        // Ensure URL has protocol
        this.currentUrl = url.startsWith('http') ? url : `https://${url}`;
        
        this.resultUrl.textContent = this.currentUrl;
        this.visitBtn.href = this.currentUrl;
        
        // Update drop zone for success state
        const dropIcon = this.dropZone.querySelector('.drop-icon');
        const dropText = this.dropZone.querySelector('.drop-text');
        const dropSubtext = this.dropZone.querySelector('.drop-subtext');
        
        dropIcon.textContent = '✅';
        dropText.textContent = 'App deployed successfully!';
        dropSubtext.textContent = 'Your app is now live on the internet';
    }

    showError(message) {
        this.hideAllStates();
        this.dropZone.classList.add('error');
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        
        // Update drop zone for error state
        const dropIcon = this.dropZone.querySelector('.drop-icon');
        const dropText = this.dropZone.querySelector('.drop-text');
        const dropSubtext = this.dropZone.querySelector('.drop-subtext');
        
        dropIcon.textContent = '❌';
        dropText.textContent = 'Something went wrong';
        dropSubtext.textContent = 'Please try again';
        
        // Reset to normal state after 5 seconds
        setTimeout(() => {
            this.resetForm();
        }, 5000);
    }

    hideAllStates() {
        this.progressContainer.classList.add('hidden');
        this.resultContainer.classList.add('hidden');
        this.hideError();
        
        // Reset drop zone classes
        this.dropZone.classList.remove('processing', 'success', 'error', 'dragover');
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    resetForm() {
        this.hideAllStates();
        
        // Reset drop zone content
        const dropIcon = this.dropZone.querySelector('.drop-icon');
        const dropText = this.dropZone.querySelector('.drop-text');
        const dropSubtext = this.dropZone.querySelector('.drop-subtext');
        
        dropIcon.textContent = '📁';
        dropText.textContent = 'Drop your app files here';
        dropSubtext.textContent = 'or click to browse';
        
        // Reset file inputs
        this.fileInput.value = '';
        this.folderInput.value = '';
        
        // Reset progress
        this.progressFill.style.width = '0%';
        this.progressText.textContent = 'Processing your files...';
        
        // Reset copy button
        this.copyBtn.textContent = '📋 Copy URL';
        this.copyBtn.classList.remove('copied');
    }
}

// Global functions for button events
function selectFiles() {
    document.getElementById('fileInput').click();
}

function selectFolder() {
    document.getElementById('folderInput').click();
}

function copyUrl() {
    const appDeployer = window.appDeployer;
    if (!appDeployer || !appDeployer.currentUrl) return;
    
    navigator.clipboard.writeText(appDeployer.currentUrl).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy URL';
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = appDeployer.currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy URL';
            copyBtn.classList.remove('copied');
        }, 2000);
    });
}

function resetForm() {
    if (window.appDeployer) {
        window.appDeployer.resetForm();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appDeployer = new AppDeployer();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // We can add a service worker later for offline capabilities
    });
}
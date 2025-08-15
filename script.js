// Certificate Generator JavaScript - Performance Optimized
class CertificateGenerator {
    constructor() {
        // Performance optimization: Cache frequently used values
        this.cache = new Map();
        this.debounceTimer = null;
        this.fontSizeCache = new Map();
        this.isGenerating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.setupFormValidation();
        this.preloadFont();
    }

    initializeElements() {
        this.form = document.getElementById('certificateForm');
        this.fullNameInput = document.getElementById('fullName');
        this.clubNameInput = document.getElementById('clubName');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadSection = document.getElementById('downloadSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.certificateTemplate = document.getElementById('certificateTemplate');
        this.nameOverlay = document.getElementById('nameOverlay');
        this.clubOverlay = document.getElementById('clubOverlay');
        
        this.btnText = this.generateBtn.querySelector('.btn-text');
        this.btnLoading = this.generateBtn.querySelector('.btn-loading');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        
        // Performance optimized: Use passive listeners and optimized debouncing
        this.fullNameInput.addEventListener('input', () => {
            this.debounce(() => this.updatePreview(), 200); // Reduced debounce time
        }, { passive: true });
        
        this.clubNameInput.addEventListener('input', () => {
            this.debounce(() => this.updatePreview(), 200); // Reduced debounce time
        }, { passive: true });
        

        
        // Template image load event
        this.certificateTemplate.addEventListener('load', () => {
            this.handleTemplateLoaded();
        });
        
        // Template image error event
        this.certificateTemplate.addEventListener('error', () => {
            this.handleTemplateError();
        });
    }

    debounce(func, wait) {
        // Performance optimized debouncing
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(func, wait);
    }

    // Performance optimized font preloading
    preloadFont() {
        try {
            // Check if fonts are already loaded
            if (document.fonts.check('1em Fira Sans')) {
                console.log('Fira Sans font already loaded');
                return;
            }
            
            // Performance optimized font preloading for Fira Sans
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.href = 'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvl4jO.ttf';
            link.crossOrigin = 'anonymous';
            
            // Add to head for better performance
            document.head.appendChild(link);
            console.log('Fira Sans font preloading initiated');
        } catch (err) {
            console.log('Font preloading failed, using fallback:', err);
        }
    }

    setupFormValidation() {
        this.fullNameInput.addEventListener('blur', () => {
            this.validateName();
        });
    }

    validateName() {
        const name = this.fullNameInput.value.trim();
        if (!name) {
            this.showError('Please enter a valid name');
            return false;
        }
        this.hideError();
        return true;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    handleTemplateLoaded() {
        console.log('Certificate template loaded successfully');
        console.log('Template dimensions:', this.certificateTemplate.naturalWidth, 'x', this.certificateTemplate.naturalHeight);
        const previewContainer = document.querySelector('.preview-container');
        previewContainer.classList.remove('no-template');
        this.certificateTemplate.style.display = 'block';
        this.updatePreview();
    }

    handleTemplateError() {
        console.log('Certificate template failed to load, using fallback');
        const previewContainer = document.querySelector('.preview-container');
        previewContainer.classList.add('no-template');
        this.certificateTemplate.style.display = 'none';
        this.updatePreview();
    }

    updatePreview() {
        // Performance optimization: Batch DOM updates
        const name = this.fullNameInput.value.trim();
        const clubName = this.clubNameInput.value.trim();
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            this.updateNameOverlay(name);
            this.updateClubOverlay(clubName);
        });
    }

    updateNameOverlay(name) {
        if (name) {
            // Always use auto font sizing
            const nameFontSize = this.getCachedFontSize(name);
            
            // Batch style updates
            Object.assign(this.nameOverlay.style, {
                fontFamily: 'Fira Sans, sans-serif',
                fontSize: `${nameFontSize}px`,
                color: '#000000',
                fontWeight: '400',
                whiteSpace: 'nowrap',
                wordWrap: 'normal',
                overflow: 'visible'
            });
            this.nameOverlay.textContent = name;
        } else {
            this.nameOverlay.textContent = '';
        }
    }

    updateClubOverlay(clubName) {
        if (clubName) {
            // Always use auto font sizing
            const clubFontSize = this.getCachedFontSize(clubName);
            
            // Batch style updates
            Object.assign(this.clubOverlay.style, {
                fontFamily: 'Fira Sans, sans-serif',
                fontSize: `${clubFontSize}px`,
                color: '#000000',
                fontWeight: '400',
                whiteSpace: 'nowrap',
                wordWrap: 'normal',
                overflow: 'visible'
            });
            this.clubOverlay.textContent = clubName;
        } else {
            this.clubOverlay.textContent = '';
        }
    }

    getCachedFontSize(text) {
        // Performance optimization: Cache font size calculations
        const cacheKey = `${text}_${this.getContainerDimensions()}`;
        
        if (this.fontSizeCache.has(cacheKey)) {
            return this.fontSizeCache.get(cacheKey);
        }
        
        const fontSize = this.calculateOptimalFontSize(text);
        this.fontSizeCache.set(cacheKey, fontSize);
        
        // Limit cache size to prevent memory leaks
        if (this.fontSizeCache.size > 100) {
            const firstKey = this.fontSizeCache.keys().next().value;
            this.fontSizeCache.delete(firstKey);
        }
        
        return fontSize;
    }

    getContainerDimensions() {
        // Cache container dimensions
        const cacheKey = 'container_dimensions';
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const previewContainer = document.querySelector('.preview-container');
        const dimensions = `${previewContainer.offsetWidth}x${previewContainer.offsetHeight}`;
        this.cache.set(cacheKey, dimensions);
        
        return dimensions;
    }

    calculateOptimalFontSize(name) {
        // Performance optimization: Use cached container reference
        const previewContainer = this.getCachedContainer();
        const maxWidth = previewContainer.offsetWidth * 0.75;
        
        // Performance optimization: Reuse temporary element
        const tempElement = this.getOrCreateTempElement();
        
        // Force single-line text measurement
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.style.wordWrap = 'normal';
        tempElement.style.overflow = 'hidden';
        
        // Start with maximum font size and work down
        let fontSize = 16; // Maximum font size is now 16px
        const minFontSize = 8;
        
        // Binary search for optimal font size that fits in single line
        let low = minFontSize;
        let high = fontSize;
        let optimalSize = minFontSize;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            tempElement.style.fontSize = `${mid}px`;
            tempElement.textContent = name;
            
            const textWidth = tempElement.offsetWidth;
            
            // Add 5% safety margin to prevent edge overflow
            if (textWidth <= maxWidth * 0.95) {
                // This size fits with safety margin, try a larger size
                optimalSize = mid;
                low = mid + 1;
            } else {
                // This size is too large, try a smaller size
                high = mid - 1;
            }
        }
        
        return optimalSize;
    }

    getCachedContainer() {
        // Cache container reference
        if (!this.cache.has('previewContainer')) {
            this.cache.set('previewContainer', document.querySelector('.preview-container'));
        }
        return this.cache.get('previewContainer');
    }

    getOrCreateTempElement() {
        // Performance optimization: Reuse temporary element
        if (!this.cache.has('tempElement')) {
            const tempElement = document.createElement('div');
            Object.assign(tempElement.style, {
                fontFamily: 'Fira Sans, sans-serif',
                fontWeight: '400',
                position: 'absolute',
                visibility: 'hidden',
                whiteSpace: 'nowrap',
                wordWrap: 'normal',
                lineHeight: '1.2',
                textAlign: 'center',
                overflow: 'visible'
            });
            document.body.appendChild(tempElement);
            this.cache.set('tempElement', tempElement);
        }
        
        const tempElement = this.cache.get('tempElement');
        const previewContainer = this.getCachedContainer();
        tempElement.style.maxWidth = `${previewContainer.offsetWidth * 0.75}px`;
        
        return tempElement;
    }

    calculateOptimalFontSizeForCanvas(name, canvasWidth, canvasHeight) {
        const maxWidth = canvasWidth * 0.75; // 75% of canvas width
        
        // Start with maximum font size
        let fontSize = 16; // Maximum font size is now 16px
        const minFontSize = 8;
        
        // Create a temporary canvas to measure text
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = '400 16px Fira Sans';
        
        // Binary search for optimal font size that fits in single line
        let low = minFontSize;
        let high = fontSize;
        let optimalSize = minFontSize;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            tempCtx.font = `400 ${mid}px Fira Sans`;
            
            const textMetrics = tempCtx.measureText(name);
            const textWidth = textMetrics.width;
            
            // Add 5% safety margin to prevent edge overflow
            if (textWidth <= maxWidth * 0.95) {
                // This size fits with safety margin, try a larger size
                optimalSize = mid;
                low = mid + 1;
            } else {
                // This size is too large, try a smaller size
                high = mid - 1;
            }
        }
        
        return optimalSize;
    }

    wrapTextForCanvas(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Performance optimization: Prevent multiple submissions
        if (this.isGenerating) {
            return;
        }
        
        if (!this.validateName()) {
            return;
        }

        this.isGenerating = true;
        this.setLoadingState(true);
        
        try {
            await this.generateCertificate();
            this.showDownloadSection();
        } catch (error) {
            console.error('Error generating certificate:', error);
            this.showError('Failed to generate certificate. Please try again.');
        } finally {
            this.isGenerating = false;
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.btnText.style.display = 'none';
            this.btnLoading.style.display = 'flex';
        } else {
            this.generateBtn.disabled = false;
            this.btnText.style.display = 'block';
            this.btnLoading.style.display = 'none';
        }
    }

    async generateCertificate() {
        // Wait a bit to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // The actual certificate generation happens in the preview
        // This method is mainly for the loading state and future enhancements
    }

    showDownloadSection() {
        this.downloadSection.style.display = 'block';
        this.downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async downloadPDF() {
        // Performance optimization: Prevent multiple downloads
        if (this.isGenerating) {
            return;
        }
        
        try {
            this.isGenerating = true;
            this.downloadBtn.disabled = true;
            this.downloadBtn.innerHTML = `
                <div class="spinner"></div>
                Generating High-Quality PDF...
            `;

            // Performance optimization: Parallel font loading and canvas generation
            const [canvas] = await Promise.all([
                this.generateCertificateCanvas(),
                this.waitForFonts()
            ]);
            
            // Verify canvas has content
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas generation failed - empty canvas');
            }
            
            console.log('Canvas verification passed:', canvas.width, 'x', canvas.height);
            
            const pdf = await this.createPDF(canvas);
            
            // Download the PDF
            const fileName = `Certificate_${this.fullNameInput.value.trim().replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);
            
        } catch (error) {
            console.error('Error creating PDF:', error);
            this.showError('Failed to create PDF. Please try again.');
        } finally {
            this.isGenerating = false;
            this.downloadBtn.disabled = false;
            this.downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
            `;
        }
    }

    async waitForFonts() {
        // Performance optimization: Parallel font loading
        try {
            await Promise.race([
                document.fonts.ready,
                new Promise(resolve => setTimeout(resolve, 1500)) // Reduced timeout
            ]);
        } catch (err) {
            console.log('Font loading timeout, proceeding anyway:', err);
        }
    }

    async generateCertificateCanvas() {
        const previewContainer = document.querySelector('.preview-container');
        
        // Check if template image is loaded and visible
        const templateLoaded = this.certificateTemplate.complete && 
                              this.certificateTemplate.naturalHeight !== 0 && 
                              this.certificateTemplate.style.display !== 'none';
        
        if (templateLoaded) {
            // Temporarily remove border and styling for clean capture
            const originalBorder = previewContainer.style.border;
            const originalBorderRadius = previewContainer.style.borderRadius;
            const originalBackground = previewContainer.style.background;
            const originalPadding = previewContainer.style.padding;
            const originalMargin = previewContainer.style.margin;
            
            previewContainer.style.border = 'none';
            previewContainer.style.borderRadius = '0';
            previewContainer.style.background = '#ffffff';
            previewContainer.style.padding = '0';
            previewContainer.style.margin = '0';
            
            // Use the template with name overlay - Optimized quality settings
            const canvas = await html2canvas(previewContainer, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scale: 2, // Balanced quality
                logging: false,
                width: previewContainer.offsetWidth,
                height: previewContainer.offsetHeight,
                scrollX: 0,
                scrollY: 0,
                imageTimeout: 10000,
                removeContainer: false,
                foreignObjectRendering: false
            });
            
            // Restore original styles
            previewContainer.style.border = originalBorder;
            previewContainer.style.borderRadius = originalBorderRadius;
            previewContainer.style.background = originalBackground;
            previewContainer.style.padding = originalPadding;
            previewContainer.style.margin = originalMargin;
            
            console.log('Canvas generated successfully:', canvas.width, 'x', canvas.height);
            return canvas;
        } else {
            // Use enhanced fallback certificate design
            return this.createFallbackCertificate();
        }
    }

    async createPDF(canvas) {
        const { jsPDF } = window.jspdf;
        
        // Get canvas dimensions
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        console.log('Canvas dimensions:', canvasWidth, 'x', canvasHeight);
        
        // Use standard DPI calculation for reliability
        const dpi = 96; // Standard web DPI
        const mmPerPixel = 25.4 / dpi;
        const imgWidth = canvasWidth * mmPerPixel;
        const imgHeight = canvasHeight * mmPerPixel;
        
        console.log('PDF dimensions (mm):', imgWidth, 'x', imgHeight);
        console.log('Effective DPI:', dpi);
        
        // Determine orientation based on dimensions
        const isLandscape = imgWidth > imgHeight;
        const orientation = isLandscape ? 'l' : 'p'; // 'l' for landscape, 'p' for portrait
        
        // For landscape, jsPDF expects [height, width], for portrait [width, height]
        const pdfDimensions = isLandscape ? [imgHeight, imgWidth] : [imgWidth, imgHeight];
        
        console.log('PDF orientation:', orientation, 'Dimensions:', pdfDimensions);
        
        // Create PDF with correct orientation and exact certificate dimensions
        const pdf = new jsPDF(orientation, 'mm', pdfDimensions);
        
        // Standard image quality settings
        const imgData = canvas.toDataURL('image/png', 0.95); // High quality but not maximum
        
        console.log('Image data length:', imgData.length);
        
        // Add image to PDF with exact positioning (no margins)
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

        return pdf;
    }

    // Enhanced fallback method for when template image is not available
    createFallbackCertificate() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Standard canvas size for reliability
        canvas.width = 800; // Standard size
        canvas.height = 600; // Standard size
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Create a simple certificate design
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border (standard resolution)
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 20; // Standard size
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Add inner border
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 2; // Standard size
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
        
        // Add title (standard resolution)
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 48px Times New Roman'; // Standard size
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Completion', canvas.width / 2, 120); // Standard position
        
        // Add subtitle
        ctx.fillStyle = '#6c757d';
        ctx.font = '24px Times New Roman'; // Standard size
        ctx.fillText('This is to certify that', canvas.width / 2, 180); // Standard position
        
        // Add name with dynamic font sizing and multi-line support
        const name = this.fullNameInput.value.trim();
        const clubName = this.clubNameInput.value.trim();
        
        // Calculate positions for both texts (standard resolution)
        const nameY = canvas.height * 0.49; // 49% from top (matching CSS)
        const clubY = canvas.height * 0.53; // 53% from top (matching CSS)
        
                            // Draw name
        if (name) {
            // Always calculate optimal font size automatically
            const nameFontSize = this.calculateOptimalFontSizeForCanvas(name, canvas.width, canvas.height * 0.4);
                
                ctx.fillStyle = '#000000';
            ctx.font = `400 ${nameFontSize}px Fira Sans`; // Standard font size
            ctx.textAlign = 'center';
            
            // Handle multi-line text for name
            const nameLines = this.wrapTextForCanvas(ctx, name, canvas.width * 0.6);
            const nameLineHeight = nameFontSize * 1.2; // Standard line height
            const nameTotalHeight = nameLines.length * nameLineHeight;
            const nameStartY = nameY - nameTotalHeight / 2 + nameLineHeight / 2;
            
            nameLines.forEach((line, index) => {
                const y = nameStartY + index * nameLineHeight;
                ctx.fillText(line, canvas.width / 2, y);
            });
        }
        
                            // Draw club name
        if (clubName) {
            // Always calculate optimal font size automatically
            const clubFontSize = this.calculateOptimalFontSizeForCanvas(clubName, canvas.width, canvas.height * 0.4);
                
                ctx.fillStyle = '#000000';
            ctx.font = `400 ${clubFontSize}px Fira Sans`; // Standard font size
            ctx.textAlign = 'center';
            
            // Handle multi-line text for club name
            const clubLines = this.wrapTextForCanvas(ctx, clubName, canvas.width * 0.6);
            const clubLineHeight = clubFontSize * 1.2; // Standard line height
            const clubTotalHeight = clubLines.length * clubLineHeight;
            const clubStartY = clubY - clubTotalHeight / 2 + clubLineHeight / 2;
            
            clubLines.forEach((line, index) => {
                const y = clubStartY + index * clubLineHeight;
                ctx.fillText(line, canvas.width / 2, y);
            });
        }
        
        // Add completion text (standard resolution)
        ctx.fillStyle = '#6c757d';
        ctx.font = '24px Times New Roman'; // Standard size
        ctx.fillText('has successfully completed the course', canvas.width / 2, canvas.height / 2 + 60); // Standard position
        
        // Add date (standard resolution)
        ctx.fillStyle = '#6c757d';
        ctx.font = '18px Times New Roman'; // Standard size
        const today = new Date().toLocaleDateString();
        ctx.fillText(`Issued on: ${today}`, canvas.width / 2, canvas.height - 80); // Standard position
        
        return canvas;
    }
}

// Performance optimized application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Store instance globally for cleanup
    window.certificateGenerator = new CertificateGenerator();
});

// Performance optimized initialization
document.addEventListener('DOMContentLoaded', () => {
    const templateImg = document.getElementById('certificateTemplate');
    const previewContainer = document.querySelector('.preview-container');
    
    // Set initial state
    if (templateImg.complete && templateImg.naturalHeight !== 0) {
        // Template is already loaded
        previewContainer.classList.remove('no-template');
        templateImg.style.display = 'block';
    } else {
        // Template is not loaded yet, show placeholder
        previewContainer.classList.add('no-template');
        templateImg.style.display = 'none';
    }
    
    // Performance optimization: Reduced timeout and better error handling
    setTimeout(() => {
        if (!templateImg.complete || templateImg.naturalHeight === 0) {
            console.log('Certificate template not loaded after timeout, using fallback design');
            previewContainer.classList.add('no-template');
            templateImg.style.display = 'none';
        }
    }, 1500); // Reduced timeout for faster fallback
});

// Performance optimization: Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Clean up any cached elements
    if (window.certificateGenerator && window.certificateGenerator.cache) {
        const tempElement = window.certificateGenerator.cache.get('tempElement');
        if (tempElement && tempElement.parentNode) {
            tempElement.parentNode.removeChild(tempElement);
        }
        window.certificateGenerator.cache.clear();
        window.certificateGenerator.fontSizeCache.clear();
    }
});

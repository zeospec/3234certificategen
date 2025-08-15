// Secure Certificate Generator - Security Enhanced
class CertificateGenerator {
    constructor() {
        // Secure configuration with fallback
        this.config = this.getSecureConfig();
        this.elements = {};
        this.cache = new Map();
        this.debounceTimer = null;
        this.isGenerating = false;
        this.libraries = {};
        this.securityToken = this.generateSecurityToken();
        
        this.init();
    }

    getSecureConfig() {
        const defaultConfig = {
            isDev: false,
            maxFontSize: 16,
            minFontSize: 8,
            debounceDelay: 150,
            maxRetries: 3,
            timeout: 10000,
            security: {
                maxInputLength: 150,
                allowedCharacters: /^[A-Za-z\s]+$/,
                sanitizeOutput: true
            }
        };

        // Validate and sanitize configuration
        if (window.APP_CONFIG && typeof window.APP_CONFIG === 'object') {
            return Object.freeze({
                ...defaultConfig,
                ...window.APP_CONFIG,
                security: {
                    ...defaultConfig.security,
                    ...(window.APP_CONFIG.security || {})
                }
            });
        }

        return Object.freeze(defaultConfig);
    }

    generateSecurityToken() {
        // Generate a simple security token for internal validation
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupTemplate();
    }

    cacheElements() {
        const selectors = {
            form: '#certificateForm',
            fullName: '#fullName',
            clubName: '#clubName',
            generateBtn: '#generateBtn',
            downloadBtn: '#downloadBtn',
            downloadSection: '#downloadSection',
            errorMessage: '#errorMessage',
            certificateTemplate: '#certificateTemplate',
            nameOverlay: '#nameOverlay',
            clubOverlay: '#clubOverlay',
            btnText: '#generateBtn .btn-text',
            btnLoading: '#generateBtn .btn-loading',
            loadingOverlay: '#loadingOverlay',
            nameHelp: '#nameHelp',
            clubHelp: '#clubHelp'
        };

        for (const [key, selector] of Object.entries(selectors)) {
            this.elements[key] = document.querySelector(selector);
        }
    }

    bindEvents() {
        this.elements.form.addEventListener('submit', e => this.handleSubmit(e));
        this.elements.downloadBtn.addEventListener('click', () => this.downloadPDF());
        
        // Enhanced input handling with validation
        const inputs = [this.elements.fullName, this.elements.clubName];
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.debounce(() => this.updatePreview(), this.config.debounceDelay);
                this.validateInput(input);
            });
            
            input.addEventListener('focus', () => this.showHelp(input));
            input.addEventListener('blur', () => this.hideHelp(input));
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.elements.form.dispatchEvent(new Event('submit'));
            }
        });
    }

    setupTemplate() {
        const template = this.elements.certificateTemplate;
        
        if (template.complete && template.naturalHeight > 0) {
            this.handleTemplateReady();
        } else {
            template.addEventListener('load', () => this.handleTemplateReady());
            template.addEventListener('error', () => this.handleTemplateError());
        }
    }

    handleTemplateReady() {
        if (this.config.isDev) console.log('Template loaded');
        this.elements.certificateTemplate.style.display = 'block';
        document.querySelector('.preview-container').classList.remove('no-template');
        this.updatePreview();
    }

    handleTemplateError() {
        if (this.config.isDev) console.log('Template failed, using fallback');
        document.querySelector('.preview-container').classList.add('no-template');
        this.elements.certificateTemplate.style.display = 'none';
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }

    updatePreview() {
        const name = this.sanitizeInput(this.elements.fullName.value);
        const clubName = this.sanitizeInput(this.elements.clubName.value);
        
        this.updateOverlay(this.elements.nameOverlay, name);
        this.updateOverlay(this.elements.clubOverlay, clubName);
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // Remove any potential script tags and dangerous content
        let sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
        
        // Limit length
        if (sanitized.length > this.config.security.maxInputLength) {
            sanitized = sanitized.substring(0, this.config.security.maxInputLength);
        }
        
        return sanitized;
    }

    validateInputSecurity(input) {
        if (typeof input !== 'string') return false;
        
        // Check for dangerous patterns
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /data:text\/html/i,
            /vbscript:/i,
            /expression\(/i
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(input));
    }

    updateOverlay(element, text) {
        if (!text) {
            element.textContent = '';
            return;
        }

        const fontSize = this.calculateFontSize(text);
        element.style.fontSize = `${fontSize}px`;
        element.style.color = '#000000'; // Ensure standard black color
        element.textContent = text;
        
        // Add subtle animation for better UX without affecting positioning
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 50);
    }

    calculateFontSize(text) {
        // Enhanced font size calculation with increased width allowance
        const maxWidth = this.getContainerWidth() * 0.95; // Increased from 0.75 to 0.95
        const baseSize = this.config.maxFontSize;
        
        // Calculate font size based on text length with 2x allowance
        const textLength = text.length;
        let fontSize = baseSize;
        
        // Only start reducing font size after 2x the typical name length (40 characters)
        if (textLength > 40) {
            fontSize = Math.max(this.config.minFontSize, baseSize - (textLength - 40) * 0.25);
        }
        
        // Quick width check using cached measurement
        const estimatedWidth = textLength * fontSize * 0.6; // Rough estimation
        if (estimatedWidth > maxWidth) {
            fontSize = Math.max(this.config.minFontSize, (maxWidth / textLength) * 1.6);
        }
        
        return Math.round(fontSize);
    }

    getContainerWidth() {
        if (!this.cache.has('containerWidth')) {
            const container = document.querySelector('.preview-container');
            this.cache.set('containerWidth', container.offsetWidth);
        }
        return this.cache.get('containerWidth');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isGenerating || !this.validateForm()) return;
        
        this.isGenerating = true;
        this.setLoading(true);
        
        try {
            await this.generateCertificate();
            this.showDownloadSection();
        } catch (error) {
            this.showError('Failed to generate certificate. Please try again.');
            if (this.config.isDev) console.error('Generation error:', error);
        } finally {
            this.isGenerating = false;
            this.setLoading(false);
        }
    }

    validateForm() {
        const name = this.sanitizeInput(this.elements.fullName.value);
        const clubName = this.sanitizeInput(this.elements.clubName.value);
        
        // Clear previous errors
        this.hideError();
        
        // Security validation
        if (!this.validateInputSecurity(name) || !this.validateInputSecurity(clubName)) {
            this.showError('Invalid input detected. Please check your input and try again.');
            return false;
        }
        
        // Validate name
        if (!name) {
            this.showError('Please enter your full name');
            this.elements.fullName.focus();
            return false;
        }
        
        if (!this.config.security.allowedCharacters.test(name)) {
            this.showError('Name should contain only letters and spaces');
            this.elements.fullName.focus();
            return false;
        }
        
        if (name.length < 2) {
            this.showError('Name should be at least 2 characters long');
            this.elements.fullName.focus();
            return false;
        }
        
        if (name.length > 100) {
            this.showError('Name should not exceed 100 characters');
            this.elements.fullName.focus();
            return false;
        }
        
        // Validate club name (mandatory)
        if (!clubName) {
            this.showError('Please enter your Rotaract Club name');
            this.elements.clubName.focus();
            return false;
        }
        
        if (clubName.length < 2) {
            this.showError('Club name should be at least 2 characters long');
            this.elements.clubName.focus();
            return false;
        }
        
        if (clubName.length > this.config.security.maxInputLength) {
            this.showError(`Club name should not exceed ${this.config.security.maxInputLength} characters`);
            this.elements.clubName.focus();
            return false;
        }
        
        return true;
    }
    
    validateInput(input) {
        const value = input.value.trim();
        const isName = input.id === 'fullName';
        
        if (isName && value) {
            if (!/^[A-Za-z\s]+$/.test(value)) {
                input.setCustomValidity('Please use only letters and spaces');
                input.classList.add('invalid');
            } else {
                input.setCustomValidity('');
                input.classList.remove('invalid');
            }
        }
    }
    
    showHelp(input) {
        const helpId = input.id === 'fullName' ? 'nameHelp' : 'clubHelp';
        const helpElement = this.elements[helpId];
        if (helpElement) {
            helpElement.style.display = 'block';
        }
    }
    
    hideHelp(input) {
        const helpId = input.id === 'fullName' ? 'nameHelp' : 'clubHelp';
        const helpElement = this.elements[helpId];
        if (helpElement) {
            helpElement.style.display = 'none';
        }
    }

    setLoading(isLoading) {
        this.elements.generateBtn.disabled = isLoading;
        this.elements.btnText.style.display = isLoading ? 'none' : 'block';
        this.elements.btnLoading.style.display = isLoading ? 'flex' : 'none';
        
        // Show/hide loading overlay for better UX
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = isLoading ? 'flex' : 'none';
        }
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
    }

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }

    showDownloadSection() {
        this.elements.downloadSection.style.display = 'block';
        this.elements.downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Add success animation
        const downloadContent = this.elements.downloadSection.querySelector('.download-content');
        if (downloadContent) {
            downloadContent.style.opacity = '0';
            downloadContent.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                downloadContent.style.transition = 'all 0.5s ease';
                downloadContent.style.opacity = '1';
                downloadContent.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    async generateCertificate() {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async downloadPDF() {
        if (this.isGenerating) return;
        
        try {
            this.isGenerating = true;
            this.elements.downloadBtn.disabled = true;
            this.elements.downloadBtn.innerHTML = '';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        const text = document.createTextNode(' Generating PDF...');
        this.elements.downloadBtn.appendChild(spinner);
        this.elements.downloadBtn.appendChild(text);

            await this.loadLibraries();
            
            // Generate canvas with template and text
            const canvas = await this.retryOperation(
                () => this.generateCanvas(),
                this.config.maxRetries,
                'Canvas generation'
            );
            
            const pdf = await this.retryOperation(
                () => this.createPDF(canvas),
                this.config.maxRetries,
                'PDF creation'
            );
            
            const fileName = this.generateFileName();
            pdf.save(fileName);
            
            // Show success feedback
            this.showSuccess('Certificate downloaded successfully!');
            
        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            this.showError(errorMessage);
            if (this.config.isDev) console.error('PDF error:', error);
        } finally {
            this.isGenerating = false;
            this.elements.downloadBtn.disabled = false;
            this.elements.downloadBtn.innerHTML = '';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '20');
            svg.setAttribute('height', '20');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
            
            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', '7,10 12,15 17,10');
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '12');
            line.setAttribute('y1', '15');
            line.setAttribute('x2', '12');
            line.setAttribute('y2', '3');
            
            svg.appendChild(path);
            svg.appendChild(polyline);
            svg.appendChild(line);
            
            const text = document.createTextNode(' Download PDF Certificate');
            
            this.elements.downloadBtn.appendChild(svg);
            this.elements.downloadBtn.appendChild(text);
        }
    }
    
    async retryOperation(operation, maxRetries, operationName) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await Promise.race([
                    operation(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)
                    )
                ]);
            } catch (error) {
                lastError = error;
                if (this.config.isDev) {
                    console.warn(`${operationName} attempt ${attempt} failed:`, error);
                }
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }
        
        throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError.message}`);
    }
    
    generateFileName() {
        const sanitizedName = this.sanitizeInput(this.elements.fullName.value)
            .replace(/[^A-Za-z\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50); // Limit filename length
        
        const timestamp = new Date().toISOString().slice(0, 10);
        const safeFileName = `RISE_${sanitizedName}_${timestamp}.pdf`;
        
        // Additional security check for filename
        if (!/^[A-Za-z0-9_-]+\.pdf$/.test(safeFileName)) {
            return `RISE_Certificate_${timestamp}.pdf`;
        }
        
        return safeFileName;
    }
    
    getErrorMessage(error) {
        if (error.message.includes('timeout')) {
            return 'Operation timed out. Please check your internet connection and try again.';
        }
        if (error.message.includes('Canvas generation')) {
            return 'Failed to generate certificate. Please refresh the page and try again.';
        }
        if (error.message.includes('PDF creation')) {
            return 'Failed to create PDF. Please try again.';
        }
        return 'An unexpected error occurred. Please try again.';
    }
    
    showSuccess(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message-temp';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    async loadLibraries() {
        if (this.libraries.jspdf) return;

        const jsPDF = await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        this.libraries.jspdf = jsPDF;
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Validate script source
            if (!this.isValidScriptSource(src)) {
                reject(new Error('Invalid script source'));
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.integrity = this.getScriptIntegrity(src);
            
            script.onload = () => {
                // Validate that the expected library is loaded
                if (window.jspdf) {
                    resolve(window.jspdf);
                } else {
                    reject(new Error('Library not loaded properly'));
                }
            };
            
            script.onerror = () => reject(new Error('Failed to load script'));
            
            // Set timeout for script loading
            const timeout = setTimeout(() => {
                reject(new Error('Script loading timeout'));
            }, this.config.timeout);
            
            script.onload = () => {
                clearTimeout(timeout);
                if (window.jspdf) {
                    resolve(window.jspdf);
                } else {
                    reject(new Error('Library not loaded properly'));
                }
            };
            
            document.head.appendChild(script);
        });
    }

    isValidScriptSource(src) {
        // Only allow specific trusted sources
        const allowedSources = [
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        ];
        
        return allowedSources.includes(src);
    }

    getScriptIntegrity(src) {
        // Return integrity hash for known scripts (in production, these should be actual hashes)
        const integrityHashes = {
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js': ''
        };
        
        return integrityHashes[src] || '';
    }

    async generateCanvas() {
        const templateImage = this.elements.certificateTemplate;
        const templateLoaded = templateImage.complete && templateImage.naturalHeight > 0;

        if (templateLoaded) {
            return await this.createCanvasWithTemplate();
        } else {
            return this.createFallbackCanvas();
        }
    }

    async createCanvasWithTemplate() {
        const templateImage = this.elements.certificateTemplate;
        
        // Security validation
        if (!templateImage || !templateImage.complete || templateImage.naturalHeight === 0) {
            throw new Error('Template image not loaded');
        }
        
        const name = this.sanitizeInput(this.elements.fullName.value);
        const clubName = this.sanitizeInput(this.elements.clubName.value);
        
        // Validate input parameters
        if (!this.validateInputSecurity(name) || !this.validateInputSecurity(clubName)) {
            throw new Error('Invalid input detected');
        }
        
        // Create canvas with template image dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match template image
        canvas.width = templateImage.naturalWidth;
        canvas.height = templateImage.naturalHeight;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the template image
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
        
        // Calculate font sizes using the exact same logic as preview
        const baseNameFontSize = this.calculateFontSize(name);
        const baseClubFontSize = this.calculateFontSize(clubName);
        
        // Scale font sizes to match the canvas dimensions
        const containerWidth = this.getContainerWidth();
        const scaleFactor = canvas.width / containerWidth;
        const nameFontSize = Math.round(baseNameFontSize * scaleFactor);
        const clubFontSize = Math.round(baseClubFontSize * scaleFactor);
        
        // Set font properties
        ctx.font = `${nameFontSize}px Fira Sans`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate positions based on the same percentages as CSS
        const nameY = canvas.height * 0.484; // 48.4% from top
        const clubY = canvas.height * 0.555; // 55.5% from top
        const centerX = canvas.width / 2;
        
        // Draw name text
        if (name) {
            ctx.font = `${nameFontSize}px Fira Sans`;
            ctx.fillText(name, centerX, nameY);
        }
        
        // Draw club name text
        if (clubName) {
            ctx.font = `${clubFontSize}px Fira Sans`;
            ctx.fillText(clubName, centerX, clubY);
        }
        
        return canvas;
    }



    createFallbackCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 600;
        
        // Simple fallback design - fill entire canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border that extends to edges
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 48px Times New Roman';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Completion', canvas.width / 2, 120);
        
        const name = this.elements.fullName.value.trim();
        const clubName = this.elements.clubName.value.trim();
        
        if (name) {
            const fontSize = Math.min(16, 800 / name.length * 3); // Increased multiplier for more width
            ctx.font = `${fontSize}px Fira Sans`;
            ctx.fillStyle = '#000000';
            ctx.fillText(name, canvas.width / 2, canvas.height * 0.49);
        }
        
        if (clubName) {
            const fontSize = Math.min(16, 800 / clubName.length * 3); // Increased multiplier for more width
            ctx.font = `${fontSize}px Fira Sans`;
            ctx.fillStyle = '#000000';
            ctx.fillText(clubName, canvas.width / 2, canvas.height * 0.53);
        }
        
        return canvas;
    }

    async createPDF(canvas) {
        const { jsPDF } = this.libraries.jspdf;
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate PDF dimensions to fill the entire page
        const dpi = 96;
        const mmPerPixel = 25.4 / dpi;
        const imgWidth = canvasWidth * mmPerPixel;
        const imgHeight = canvasHeight * mmPerPixel;
        
        // Determine orientation and PDF page size
        const isLandscape = imgWidth > imgHeight;
        const orientation = isLandscape ? 'l' : 'p';
        
        // Use the image dimensions as the PDF page size to eliminate margins
        const pdfDimensions = isLandscape ? [imgHeight, imgWidth] : [imgWidth, imgHeight];
        
        // Create PDF with exact dimensions
        const pdf = new jsPDF(orientation, 'mm', pdfDimensions);
        const imgData = canvas.toDataURL('image/png', 0.95);
        
        // Add image with slight overflow to ensure no white space at edges
        // Use negative margins to extend beyond PDF boundaries
        const overflow = 0.5; // 0.5mm overflow on each side
        pdf.addImage(imgData, 'PNG', -overflow, -overflow, imgWidth + (overflow * 2), imgHeight + (overflow * 2), undefined, 'FAST');
        
        return pdf;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.certificateGenerator = new CertificateGenerator();
    });
} else {
    window.certificateGenerator = new CertificateGenerator();
}


// Optimized Certificate Generator - Performance Focused
class CertificateGenerator {
    constructor() {
        this.config = window.APP_CONFIG || { isDev: false, maxFontSize: 16, minFontSize: 8, debounceDelay: 150 };
        this.elements = {};
        this.cache = new Map();
        this.debounceTimer = null;
        this.isGenerating = false;
        this.libraries = {};
        
        this.init();
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
            btnLoading: '#generateBtn .btn-loading'
        };

        for (const [key, selector] of Object.entries(selectors)) {
            this.elements[key] = document.querySelector(selector);
        }
    }

    bindEvents() {
        this.elements.form.addEventListener('submit', e => this.handleSubmit(e));
        this.elements.downloadBtn.addEventListener('click', () => this.downloadPDF());
        
        // Optimized input handling
        const inputs = [this.elements.fullName, this.elements.clubName];
        inputs.forEach(input => {
            input.addEventListener('input', () => this.debounce(() => this.updatePreview(), this.config.debounceDelay));
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
        const name = this.elements.fullName.value.trim();
        const clubName = this.elements.clubName.value.trim();
        
        this.updateOverlay(this.elements.nameOverlay, name);
        this.updateOverlay(this.elements.clubOverlay, clubName);
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
    }

    calculateFontSize(text) {
        // Simplified font size calculation - no binary search needed
        const maxWidth = this.getContainerWidth() * 0.75;
        const baseSize = this.config.maxFontSize;
        
        // Simple linear calculation based on text length
        const textLength = text.length;
        let fontSize = baseSize;
        
        if (textLength > 20) {
            fontSize = Math.max(this.config.minFontSize, baseSize - (textLength - 20) * 0.3);
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
        const name = this.elements.fullName.value.trim();
        if (!name) {
            this.showError('Please enter a valid name');
            return false;
        }
        this.hideError();
        return true;
    }

    setLoading(isLoading) {
        this.elements.generateBtn.disabled = isLoading;
        this.elements.btnText.style.display = isLoading ? 'none' : 'block';
        this.elements.btnLoading.style.display = isLoading ? 'flex' : 'none';
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
            this.elements.downloadBtn.innerHTML = '<div class="spinner"></div> Generating PDF...';

            await this.loadLibraries();
            const canvas = await this.generateCanvas();
            const pdf = await this.createPDF(canvas);
            
            const fileName = `RISE_${this.elements.fullName.value.trim().replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);
            
        } catch (error) {
            this.showError('Failed to create PDF. Please try again.');
            if (this.config.isDev) console.error('PDF error:', error);
        } finally {
            this.isGenerating = false;
            this.elements.downloadBtn.disabled = false;
            this.elements.downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
            `;
        }
    }

    async loadLibraries() {
        if (this.libraries.jspdf && this.libraries.html2canvas) return;

        const [jsPDF, html2canvas] = await Promise.all([
            this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
            this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
        ]);

        this.libraries.jspdf = jsPDF;
        this.libraries.html2canvas = html2canvas;
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(window.jspdf || window.html2canvas);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async generateCanvas() {
        const container = document.querySelector('.preview-container');
        const templateLoaded = this.elements.certificateTemplate.complete && 
                              this.elements.certificateTemplate.naturalHeight > 0;

        if (templateLoaded) {
            // Temporarily remove styling that affects PDF generation
            const originalPadding = container.style.padding;
            const originalMargin = container.style.margin;
            const originalBorder = container.style.border;
            const originalBorderRadius = container.style.borderRadius;
            const originalOverflow = container.style.overflow;
            
            container.style.padding = '0';
            container.style.margin = '0';
            container.style.border = 'none';
            container.style.borderRadius = '0'; // Remove rounded corners
            container.style.overflow = 'visible'; // Remove overflow hidden
            
            try {
                return await this.libraries.html2canvas(container, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    width: container.offsetWidth,
                    height: container.offsetHeight,
                    scrollX: 0,
                    scrollY: 0,
                    removeContainer: false
                });
            } finally {
                // Restore original styles
                container.style.padding = originalPadding;
                container.style.margin = originalMargin;
                container.style.border = originalBorder;
                container.style.borderRadius = originalBorderRadius;
                container.style.overflow = originalOverflow;
            }
        } else {
            return this.createFallbackCanvas();
        }
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
            const fontSize = Math.min(16, 800 / name.length * 2);
            ctx.font = `${fontSize}px Fira Sans`;
            ctx.fillStyle = '#000000';
            ctx.fillText(name, canvas.width / 2, canvas.height * 0.49);
        }
        
        if (clubName) {
            const fontSize = Math.min(16, 800 / clubName.length * 2);
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
        
        // Add image to fill the entire PDF page (0, 0 coordinates with full width/height)
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
        
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


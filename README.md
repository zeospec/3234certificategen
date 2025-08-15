# Certificate Generator Website

A modern, browser-based certificate generator that creates professional PDF certificates from PNG templates with customizable text overlays.

## 🚀 Features

- **Dynamic Certificate Generation**: Upload a PNG template and overlay custom text
- **Real-time Preview**: See changes instantly as you type
- **Fixed Font Styling**: Professional Times New Roman font with consistent styling
- **PDF Export**: Download high-quality PDF certificates
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **No Backend Required**: Runs entirely in the browser
- **Fallback Design**: Built-in certificate design if no template is provided

## 📁 Project Structure

```
certificatestest/
├── index.html          # Main HTML file
├── style.css           # Modern CSS styling
├── script.js           # JavaScript functionality
├── certificate_template.png  # Your certificate template (optional)
└── README.md           # This file
```

## 🛠️ Setup Instructions

### Option 1: Quick Start (No Template)
1. Simply open `index.html` in your web browser
2. The app will use a built-in certificate design
3. Enter a name and customize font options
4. Generate and download your certificate

### Option 2: With Custom Template
1. Open `generate_template.html` to create a sample template
2. Click "Download certificate_template.png" to save the template
3. Place the downloaded file in your project directory
4. Open `index.html` in your web browser
5. Your template will be automatically loaded

## 🎨 Customization

### Font Styling
- **Font Family**: Fira Sans (modern sans-serif font)
- **Font Size**: 
  - Automatic: Dynamic sizing based on name length (8px to 18px)
- **Font Color**: Black (#000000)
- **Font Weight**: 400 (Regular)

### Template Requirements
- **Format**: PNG (recommended) or JPG
- **Size**: Any size (will be scaled to fit)
- **Design**: Leave space in the center for the name overlay
- **Naming**: Must be named `certificate_template.png`

## 🔧 Technical Details

### Dependencies
- **jsPDF**: PDF generation library
- **html2canvas**: Canvas rendering for PDF conversion
- **Inter Font**: Modern typography (loaded from Google Fonts)
- **Alex Brush Font**: Elegant cursive font for certificate text

### Quality Features
- **Ultra High Resolution**: 4x scale rendering for crisp text and images
- **Print Quality**: 300 DPI output suitable for professional printing
- **Font Preloading**: Ensures consistent font rendering across all browsers
- **Image Smoothing**: High-quality anti-aliasing for smooth edges
- **Enhanced Canvas**: Optimized rendering with foreign object support

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

### File Naming Convention
Generated PDFs follow the pattern: `Certificate_[UserName].pdf`

## 📱 Usage

1. **Enter Name**: Type the recipient's full name
2. **Enter Club Name**: Type the Rotaract Club name (optional)
3. **Preview**: See real-time preview of the certificate
4. **Generate**: Click "Generate Certificate" to process
5. **Download**: Click "Download PDF" to save the certificate

## 🎯 Use Cases

- **Educational Institutions**: Issue completion certificates
- **Event Organizers**: Provide attendance certificates
- **Training Programs**: Generate course completion certificates
- **Awards & Recognition**: Create achievement certificates
- **Small Organizations**: Quick certificate generation without server setup

## 🔮 Future Enhancements

- [ ] Custom template upload functionality
- [ ] Batch certificate generation (CSV import)
- [ ] QR code integration for verification
- [ ] Multiple certificate layouts
- [ ] Digital signature support
- [ ] Certificate numbering system

## 🐛 Troubleshooting

### Template Not Loading
- Ensure the file is named exactly `certificate_template.png`
- Check that the file is in the same directory as `index.html`
- Verify the file is a valid PNG image

### PDF Generation Issues
- Try refreshing the page
- Ensure you have a stable internet connection (for library loading)
- Check browser console for error messages

### Font Not Displaying
- Some fonts may not be available on all systems
- Try using web-safe fonts like Arial or Times New Roman

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this certificate generator.

---

**Built with ❤️ using vanilla JavaScript, HTML5, and CSS3**

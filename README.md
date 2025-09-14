# AI Resume Customizer

A powerful, AI-powered web application that customizes resumes for specific job postings using Google's Gemini API and generates professional PDF output. Built entirely with client-side technologies for GitHub Pages compatibility.

![AI Resume Customizer](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=google)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-green?style=for-the-badge&logo=github)
![Pure JavaScript](https://img.shields.io/badge/Pure%20JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)

<img width="1680" height="1050" alt="Screenshot 2025-09-14 at 12 21 23 AM" src="https://github.com/user-attachments/assets/87b38c6a-c471-4688-908a-a93177be9645" />
<img width="1680" height="1050" alt="Screenshot 2025-09-14 at 12 21 31 AM" src="https://github.com/user-attachments/assets/2a2b507e-924e-4be1-9dfc-ecb6ceb0e1ed" />


## ✨ Features

### 🚀 Core Functionality
- **Agentic AI Customization**: Multi-step AI processing with specialized agents for optimal results
- **Multi-Format Support**: Upload PDF, DOCX, or TXT resumes
- **AI-Powered Parsing**: Intelligent text extraction and structured JSON conversion using Gemini
- **Ultra-Fast PDF Output**: Optimized PDF generation with 3-tier speed system (Instant/Fast/Standard)
- **ATS Optimization**: Applicant Tracking System friendly formatting

### 🎨 Multiple Templates
- **Modern**: Clean, contemporary design with subtle colors
- **ATS-Friendly**: Plain formatting optimized for parsing systems
- **Executive**: Professional layout for senior positions
- **Creative**: Innovative design with creative elements
- **Minimal**: Clean, minimal design focusing on content
- **Technical**: Technical-focused design for engineering roles

### 🔧 Advanced Features
- **Industry-Specific Optimization**: Tailored for different job sectors
- **Keyword Integration**: Natural integration of job-specific keywords
- **Achievement Enhancement**: Quantifiable results and metrics
- **Section Prioritization**: Smart reordering based on job requirements
- **Real-time Preview**: Live resume preview with JSON editor
- **Drag & Drop Upload**: Intuitive file handling

### 🛡️ Privacy & Security
- **Client-Side Processing**: All data processed locally in your browser
- **No Server Storage**: Your information never leaves your device
- **Secure API Integration**: Direct communication with Gemini API
- **Local Storage**: API keys stored securely in browser localStorage

## 🚀 Quick Start

### 1. Get Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key for Gemini 1.5 Flash
3. Copy your API key

### 2. Deploy to GitHub Pages
1. Fork or clone this repository
2. Push to your GitHub repository
3. Enable GitHub Pages in repository settings
4. Your app will be available at `https://yourusername.github.io/repository-name`

### 3. Use the Application
1. Open the deployed application
2. Enter your Gemini API key
3. Upload your resume
4. Paste the job description
5. Click "Customize Resume with AI"
6. Download your customized PDF

## 📋 Requirements

### Browser Compatibility
- **Chrome**: 88+ (Recommended)
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

### File Formats
- **Resume**: PDF, DOCX, TXT (max 10MB)
- **Output**: PDF, JSON

### API Requirements
- **Gemini API Key**: Required for AI customization
- **Internet Connection**: For API calls and external libraries

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript ES6+
- **PDF Generation**: jsPDF with 3-tier optimization (Instant/Fast/Standard)
- **File Processing**: PDF.js, Mammoth.js
- **Code Editor**: Monaco Editor
- **AI Integration**: Google Gemini API with agentic processing
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Hosting**: GitHub Pages compatible (client-side only)

### Module Structure
```
js/
├── app.js                  # Main application logic and workflow
├── resume-parser.js        # AI-powered resume parsing and conversion
├── agentic-ai-handler.js   # Multi-agent AI processing system
├── ai-handler.js           # Legacy Gemini API integration
├── instant-pdf.js          # Ultra-fast PDF generation (50ms)
├── fast-pdf-generator.js   # Optimized PDF generation (200ms)
└── simple-pdf-generator.js # Standard PDF generation (fallback)
```

### Key Components
1. **Resume Parser**: Converts various file formats to structured JSON
2. **AI Handler**: Manages Gemini API communication and response processing
3. **PDF Generator**: Creates professional PDFs using LaTeX compilation
4. **Template System**: Multiple professional resume templates
5. **UI Manager**: Handles user interactions and workflow

## 🔧 Setup & Installation

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-resume-customizer.git
   cd ai-resume-customizer
   ```

2. Open `index.html` in a modern web browser

3. For development server (optional):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

### GitHub Pages Deployment
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source branch (usually `main` or `master`)
4. Save and wait for deployment

### Environment Configuration
No environment variables needed - the application is entirely client-side.

## 📖 Usage Guide

### Step 1: API Configuration
1. **Get API Key**: Visit [Google AI Studio](https://aistudio.google.com/)
2. **Enter Key**: Paste your API key in the application
3. **Save**: Click "Save Key" to store locally
4. **Verify**: Status indicator should show "API key configured and valid"

### Step 2: Upload Resume
1. **Drag & Drop**: Drag your resume file onto the upload area
2. **Supported Formats**: PDF, DOCX, TXT files up to 10MB
3. **File Validation**: Automatic format and size validation
4. **Parsing**: Resume is automatically parsed into structured format

### Step 3: Job Description
1. **Industry Selection**: Choose your industry/role type
2. **Job Description**: Paste the complete job posting
3. **Requirements**: Include all qualifications and requirements
4. **Character Count**: Monitor input length for optimal results

### Step 4: AI Customization
1. **Review Requirements**: Ensure all fields are completed
2. **Start Customization**: Click "Customize Resume with AI"
3. **Progress Tracking**: Monitor the customization process
4. **Results**: View AI-optimized resume in JSON format

### Step 5: Review & Edit
1. **JSON Editor**: Use Monaco Editor for fine-tuning
2. **Live Preview**: See changes in real-time preview
3. **Validation**: Validate JSON structure and format
4. **Reset Option**: Return to original if needed

### Step 6: Generate PDF
1. **Template Selection**: Choose from available templates
2. **PDF Generation**: Click "Generate PDF"
3. **Preview**: View PDF in browser
4. **Download**: Save your customized resume

## 🎯 AI Customization Features

### Keyword Optimization
- **Natural Integration**: Keywords seamlessly woven into content
- **Context Awareness**: Maintains readability and flow
- **ATS Optimization**: Optimized for applicant tracking systems

### Content Enhancement
- **Action Verbs**: Strong, impactful language
- **Quantifiable Results**: Metrics and achievements
- **Industry Terminology**: Professional language and jargon

### Section Prioritization
- **Relevance-Based Ordering**: Most relevant sections first
- **Industry Standards**: Follows industry best practices
- **Customizable Layout**: Flexible section arrangement

## 📊 Template System

### Available Templates

#### Modern Template
- **Style**: Clean, contemporary design
- **Colors**: Blue accent colors
- **Best For**: General professional use
- **Features**: Color accents, professional fonts, modern layout

#### ATS-Friendly Template
- **Style**: Simple, clean formatting
- **Colors**: Black and white
- **Best For**: Large companies, ATS systems
- **Features**: Simple formatting, high readability, universal compatibility

#### Executive Template
- **Style**: Sophisticated, professional
- **Colors**: Dark, executive color scheme
- **Best For**: Senior positions, executive roles
- **Features**: Executive styling, sophisticated colors, professional layout

#### Creative Template
- **Style**: Innovative, modern aesthetics
- **Colors**: Purple and creative palette
- **Best For**: Creative industries, design roles
- **Features**: Creative design, modern aesthetics, visual appeal

#### Minimal Template
- **Style**: Clean, minimal design
- **Colors**: Simple black and white
- **Best For**: Content-focused applications
- **Features**: Minimal design, clean layout, high readability

#### Technical Template
- **Style**: Technical, engineering-focused
- **Colors**: Green technical palette
- **Best For**: Engineering, technical roles
- **Features**: Technical focus, code-friendly, engineering style

## 🔒 Privacy & Security

### Data Handling
- **Local Processing**: All resume processing happens in your browser
- **No Server Storage**: Your data never leaves your device
- **API Communication**: Only resume data and job descriptions sent to Gemini API
- **Secure Storage**: API keys stored in browser localStorage

### API Security
- **Direct Communication**: Direct HTTPS connection to Google's servers
- **No Intermediaries**: Your data doesn't pass through our servers
- **Encrypted Transmission**: All API calls use HTTPS encryption
- **Rate Limiting**: Built-in retry logic with exponential backoff

## 🚨 Troubleshooting

### Common Issues

#### API Key Problems
- **Invalid Key**: Ensure your Gemini API key is correct
- **Quota Exceeded**: Check your API usage limits
- **Network Issues**: Verify internet connection

#### File Upload Issues
- **Format Not Supported**: Use PDF, DOCX, or TXT files
- **File Too Large**: Ensure file is under 10MB
- **Corrupted File**: Try re-saving your resume

#### PDF Generation Problems
- **LaTeX Compilation**: Falls back to basic PDF generation
- **Browser Compatibility**: Use modern browser versions
- **Memory Issues**: Close other tabs to free up memory

#### Performance Issues
- **Large Files**: Processing time increases with file size
- **Complex Resumes**: More sections = longer processing
- **Browser Resources**: Ensure sufficient memory and CPU

### Error Messages

#### "API key not configured"
- Enter your Gemini API key
- Click "Save Key"
- Verify the status indicator is green

#### "Failed to parse resume"
- Check file format (PDF, DOCX, TXT)
- Ensure file is not corrupted
- Try a different resume file

#### "AI customization failed"
- Verify API key is valid
- Check internet connection
- Ensure job description is not empty

#### "PDF generation failed"
- Try a different template
- Check browser compatibility
- Ensure sufficient memory

## 📈 Performance & Optimization

### Processing Times
- **Resume Parsing**: 1-3 seconds (AI-powered parsing)
- **AI Customization**: 8-20 seconds (multi-agent processing)
- **PDF Generation**: 50-200ms (optimized 3-tier system)

### Optimization Tips
- **File Size**: Keep resumes under 5MB for best performance
- **Content Length**: Optimal job descriptions: 200-1000 words
- **Browser**: Use Chrome or Edge for best performance
- **Memory**: Close unnecessary tabs during processing

### Browser Performance
- **Chrome**: Best performance, recommended
- **Edge**: Good performance, good compatibility
- **Firefox**: Good performance, some limitations
- **Safari**: Moderate performance, some features limited

## 🔮 Future Enhancements

### Planned Features
- **Multiple Resume Support**: Manage multiple resume versions
- **Advanced Analytics**: Resume scoring and optimization metrics
- **Template Customization**: User-defined template creation
- **Batch Processing**: Multiple job descriptions at once
- **Export Formats**: Additional output formats (Word, HTML)

### API Enhancements
- **Multiple AI Models**: Support for other AI providers
- **Advanced Prompts**: Customizable AI instructions
- **Learning System**: Improve suggestions based on usage

### User Experience
- **Dark Mode**: Alternative color scheme
- **Mobile App**: Native mobile application
- **Offline Support**: Basic functionality without internet
- **Collaboration**: Team resume review features

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **JavaScript**: ES6+ with modern syntax
- **CSS**: CSS Grid, Flexbox, CSS Variables
- **HTML**: Semantic HTML5
- **Documentation**: JSDoc comments for functions

### Testing
- **Cross-browser**: Test in Chrome, Firefox, Safari, Edge
- **File Formats**: Test with various resume formats
- **API Integration**: Test with valid/invalid API keys
- **Error Handling**: Test error scenarios and edge cases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini API**: AI-powered customization capabilities
- **PDF.js**: PDF text extraction
- **Mammoth.js**: DOCX file processing
- **LaTeX.js**: LaTeX compilation
- **Monaco Editor**: Code editing experience
- **Font Awesome**: Beautiful icons

## 📞 Support

### Getting Help
- **Documentation**: Check this README first
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions
- **Email**: Contact for business inquiries

### Community
- **GitHub**: [Repository](https://github.com/yourusername/ai-resume-customizer)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-resume-customizer/discussions)
- **Issues**: [Bug Reports](https://github.com/yourusername/ai-resume-customizer/issues)

---

**Built with ❤️ for job seekers worldwide**

*Transform your resume with the power of AI and land your dream job!*

/**
 * AI Resume Customizer - Main Application
 * Handles the overall application flow and UI interactions
 */

class ResumeCustomizerApp {
    constructor() {
        this.currentResume = null;
        this.originalResume = null;
        this.customizedResume = null;
        this.apiKey = null;
        this.monacoEditor = null;
        this.currentStep = 1;
        this.isProcessingFile = false;
        this.isCustomizing = false;
        
        this.init();
    }

    init() {
        this.loadApiKey();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.checkRequirements();
        this.initializeMonacoEditor();
        
        // Only load sample resume in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Development mode: Loading sample resume for testing');
            this.loadSampleResume();
        }
    }

    setupEventListeners() {
        // API Key Management
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('toggleApiKey').addEventListener('click', () => this.toggleApiKeyVisibility());
        
        // File Upload
        document.getElementById('resumeFile').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('removeFile').addEventListener('click', () => this.removeFile());
        
        // Job Description
        document.getElementById('jobDescription').addEventListener('input', (e) => this.handleJobDescriptionInput(e));
        document.getElementById('industryType').addEventListener('change', () => this.checkRequirements());
        
        // Customize Button
        document.getElementById('customizeBtn').addEventListener('click', (event) => {
            // Ensure this is a user-initiated click
            if (event.isTrusted) {
                this.startCustomization();
            } else {
                console.log('Programmatic click detected - customization requires user interaction');
            }
        });
        
        // Editor Controls
        document.getElementById('resetResume').addEventListener('click', () => this.resetResume());
        document.getElementById('formatJson').addEventListener('click', () => this.formatJson());
        document.getElementById('validateJson').addEventListener('click', () => this.validateJson());
        
        // Tab Navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });
        
        // Download Actions
        document.getElementById('downloadJson').addEventListener('click', () => this.downloadJson());
        document.getElementById('generatePdf').addEventListener('click', () => this.generatePdf());
        document.getElementById('downloadPdf').addEventListener('click', () => this.downloadPdf());
        document.getElementById('regeneratePdf').addEventListener('click', () => this.regeneratePdf());
        
        // Template Selection
        document.getElementById('templateSelect').addEventListener('change', () => this.handleTemplateChange());
        
        // Modal Controls
        document.getElementById('closeErrorModal').addEventListener('click', () => this.hideErrorModal());
        document.getElementById('errorModalClose').addEventListener('click', () => this.hideErrorModal());
        
        // Footer Links
        document.getElementById('privacyLink').addEventListener('click', (e) => this.handleFooterLink(e, 'privacy'));
        document.getElementById('helpLink').addEventListener('click', (e) => this.handleFooterLink(e, 'help'));
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('fileUploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            });
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload({ target: { files } });
            }
        });

        uploadArea.addEventListener('click', () => {
            document.getElementById('resumeFile').click();
        });
    }

    async initializeMonacoEditor() {
        try {
            // Load Monaco Editor
            require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
            
            require(['vs/editor/editor.main'], () => {
                this.monacoEditor = monaco.editor.create(document.getElementById('jsonEditor'), {
                    value: '// Resume JSON will appear here...',
                    language: 'json',
                    theme: 'vs',
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible'
                    }
                });

                // Update editor content when resume changes
                this.monacoEditor.onDidChangeModelContent(() => {
                    this.updateResumeFromEditor();
                });
            });
        } catch (error) {
            console.error('Failed to initialize Monaco Editor:', error);
            this.showError('Failed to initialize JSON editor. Please refresh the page.');
        }
    }

    loadApiKey() {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            this.apiKey = savedKey;
            document.getElementById('apiKey').value = savedKey;
            this.updateApiStatus('valid');
        }
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const key = apiKeyInput.value.trim();
        
        if (!key) {
            this.showError('Please enter a valid API key');
            return;
        }

        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
        this.updateApiStatus('valid');
        this.checkRequirements();
        
        // Show success message
        this.showSuccessMessage('API key saved successfully!');
    }

    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleApiKey');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    updateApiStatus(status) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        indicator.className = `status-indicator ${status}`;
        
        switch (status) {
            case 'valid':
                statusText.textContent = 'API key configured and valid';
                break;
            case 'loading':
                statusText.textContent = 'Validating API key...';
                break;
            case 'invalid':
                statusText.textContent = 'API key invalid or expired';
                break;
            default:
                statusText.textContent = 'API key not configured';
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Prevent duplicate processing
        if (this.isProcessingFile) {
            console.log('File already being processed, skipping...');
            return;
        }

        // Validate file
        if (!this.validateFile(file)) {
            event.target.value = ''; // Clear the input
            return;
        }

        try {
            this.isProcessingFile = true;
            this.showProgressModal('Processing resume file...');
            this.updateProgress(10, 'Reading file content...');
            
            // Parse the resume file with enhanced AI parsing
            const resumeData = await window.resumeParser.parseFile(file, (progress, message) => {
                this.updateProgress(10 + progress * 0.8, message);
            });
            
            if (resumeData) {
                this.originalResume = JSON.parse(JSON.stringify(resumeData));
                this.currentResume = resumeData;
                
                this.updateProgress(90, 'Finalizing resume data...');
                
                // Update UI
                this.updateFileInfo(file);
                this.updateEditorContent();
                this.updateResumePreview();
                
                // Show the editor section
                document.getElementById('editorSection').style.display = 'block';
                
                this.updateProgress(100, 'Resume processing complete!');
                
                setTimeout(() => {
                    this.hideProgressModal();
                    this.checkRequirements();
                    this.showSuccessMessage('Resume uploaded successfully! You can now enter a job description and customize your resume.');
                    this.isProcessingFile = false;
                }, 500);
            } else {
                this.isProcessingFile = false;
            }
        } catch (error) {
            this.isProcessingFile = false;
            this.hideProgressModal();
            this.showError(`Failed to parse resume: ${error.message}`);
            event.target.value = ''; // Clear the input on error
        }
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        
        if (file.size > maxSize) {
            this.showError('File size must be less than 10MB');
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showError('Please upload a PDF, DOCX, or TXT file');
            return false;
        }
        
        return true;
    }

    updateFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
        
        if (fileInfo) fileInfo.style.display = 'flex';
        if (fileUploadArea) fileUploadArea.style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile() {
        this.originalResume = null;
        this.currentResume = null;
        this.customizedResume = null;
        
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('fileUploadArea').style.display = 'block';
        document.getElementById('resumeFile').value = '';
        
        if (this.monacoEditor) {
            this.monacoEditor.setValue('// Resume JSON will appear here...');
        }
        
        document.getElementById('resumePreview').innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-eye"></i>
                <p>Resume preview will appear here</p>
            </div>
        `;
        
        this.checkRequirements();
    }

    handleJobDescriptionInput(event) {
        const charCount = document.getElementById('charCount');
        if (charCount) charCount.textContent = event.target.value.length;
        this.checkRequirements();
    }

    checkRequirements() {
        const requirements = {
            api: !!this.apiKey,
            file: !!this.currentResume,
            description: document.getElementById('jobDescription').value.trim().length > 0
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(req => {
            const element = document.querySelector(`[data-requirement="${req}"]`);
            if (element) {
                if (requirements[req]) {
                    element.classList.add('met');
                    element.querySelector('i').className = 'fas fa-check-circle';
                } else {
                    element.classList.remove('met');
                    element.querySelector('i').className = 'fas fa-times-circle';
                }
            }
        });

        // Enable/disable customize button
        const customizeBtn = document.getElementById('customizeBtn');
        const allMet = Object.values(requirements).every(Boolean);
        
        if (customizeBtn) {
            customizeBtn.disabled = !allMet;
            
            // Update button text based on state
            if (!requirements.api) {
                customizeBtn.innerHTML = '<i class="fas fa-key"></i> Configure API Key First';
            } else if (!requirements.file) {
                customizeBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Resume First';
            } else if (!requirements.description) {
                customizeBtn.innerHTML = '<i class="fas fa-edit"></i> Enter Job Description';
            } else {
                customizeBtn.innerHTML = '<i class="fas fa-magic"></i> Customize Resume with AI';
            }
        }

        return allMet;
    }

    async startCustomization() {
        // Prevent multiple simultaneous customizations
        if (this.isCustomizing) {
            console.log('Customization already in progress...');
            return;
        }

        if (!this.checkRequirements()) {
            this.showError('Please complete all requirements before proceeding');
            return;
        }

        // Validate that we have a job description
        const jobDescription = document.getElementById('jobDescription').value.trim();
        if (!jobDescription) {
            this.showError('Please enter a job description before customizing your resume');
            return;
        }

        try {
            this.isCustomizing = true;
            this.showProgressModal('Starting AI customization...');
            this.updateProgress(0, 'Initializing...');
            
            const industryType = document.getElementById('industryType').value;
            
            // Start AI customization
            this.updateProgress(5, 'Analyzing job requirements...');
            
            let customizedData;
            try {
                // Use agentic AI handler for better results with multi-step processing
                if (window.agenticAIHandler) {
                    customizedData = await window.agenticAIHandler.customizeResumeWithAgents(
                        this.currentResume,
                        jobDescription,
                        industryType,
                        this.apiKey,
                        (progress, message) => this.updateProgress(progress, message)
                    );
                } else {
                    // Fallback to original AI handler
                    customizedData = await window.aiHandler.customizeResume(
                        this.currentResume,
                        jobDescription,
                        industryType,
                        this.apiKey,
                        (progress, message) => this.updateProgress(progress, message)
                    );
                }
            } catch (aiError) {
                console.warn('AI customization failed, using original resume:', aiError);
                this.updateProgress(90, 'AI customization failed, using original resume...');
                
                // Use original resume as fallback
                customizedData = JSON.parse(JSON.stringify(this.originalResume));
                
                // Show warning to user
                setTimeout(() => {
                    this.showError(`AI customization failed: ${aiError.message}. You can still edit the resume manually and generate PDF.`);
                }, 1000);
            }
            
            if (customizedData) {
                this.customizedResume = customizedData;
                this.currentResume = customizedData;
                
                // Update UI
                this.updateEditorContent();
                this.updateResumePreview();
                this.showCustomizationSummary();
                
                // Show editor section and switch to JSON tab
                this.showStep(2);
                this.switchToTab('json');
                
                // Enable PDF generation after customization
                setTimeout(() => {
                    this.switchToTab('pdf');
                }, 1000);
                
                this.hideProgressModal();
                this.showSuccessMessage(customizedData === this.originalResume ? 
                    'Resume loaded for editing (AI customization was skipped)' : 
                    'Resume customized successfully!');
            }
        } catch (error) {
            this.hideProgressModal();
            this.showError(`Customization failed: ${error.message}`);
        } finally {
            this.isCustomizing = false;
        }
    }

    updateProgress(percentage, message) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            // Smooth animation
            progressFill.style.transition = 'width 0.3s ease-in-out';
            progressFill.style.width = `${Math.min(percentage, 100)}%`;
            
            // Color progression based on progress
            if (percentage < 25) {
                progressFill.style.backgroundColor = '#3b82f6'; // Blue
            } else if (percentage < 50) {
                progressFill.style.backgroundColor = '#8b5cf6'; // Purple
            } else if (percentage < 75) {
                progressFill.style.backgroundColor = '#f59e0b'; // Orange
            } else {
                progressFill.style.backgroundColor = '#10b981'; // Green
            }
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        console.log(`Progress: ${percentage}% - ${message}`);
        
        // Update step indicators
        if (percentage >= 25) this.updateStepStatus('parse', 'completed');
        if (percentage >= 75) this.updateStepStatus('ai', 'completed');
        if (percentage >= 100) this.updateStepStatus('generate', 'completed');
    }

    updateStepStatus(step, status) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (stepElement) {
            stepElement.className = `step-item ${status}`;
        }
    }

    showCustomizationSummary() {
        // Calculate metrics
        const keywordCount = this.calculateKeywordCount();
        const relevanceScore = this.calculateRelevanceScore();
        const processingTime = this.calculateProcessingTime();
        
        const keywordElement = document.getElementById('keywordCount');
        const relevanceElement = document.getElementById('relevanceScore');
        const processingElement = document.getElementById('processingTime');
        
        if (keywordElement) keywordElement.textContent = keywordCount;
        if (relevanceElement) relevanceElement.textContent = `${relevanceScore}%`;
        if (processingElement) processingElement.textContent = `${processingTime}s`;
    }

    calculateKeywordCount() {
        // Simple keyword counting logic
        const jobDesc = document.getElementById('jobDescription').value.toLowerCase();
        const resumeText = JSON.stringify(this.customizedResume).toLowerCase();
        
        const commonKeywords = ['javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'agile', 'leadership'];
        let count = 0;
        
        commonKeywords.forEach(keyword => {
            if (jobDesc.includes(keyword) && resumeText.includes(keyword)) {
                count++;
            }
        });
        
        return count;
    }

    calculateRelevanceScore() {
        // Simple relevance scoring
        const baseScore = 75;
        const keywordBonus = this.calculateKeywordCount() * 3;
        return Math.min(100, baseScore + keywordBonus);
    }

    calculateProcessingTime() {
        // Mock processing time
        return Math.floor(Math.random() * 5) + 2;
    }

    updateEditorContent() {
        if (this.monacoEditor && this.currentResume) {
            const jsonString = JSON.stringify(this.currentResume, null, 2);
            this.monacoEditor.setValue(jsonString);
        }
    }

    updateResumePreview() {
        if (!this.currentResume) return;
        
        const previewContainer = document.getElementById('resumePreview');
        previewContainer.innerHTML = this.generateResumePreviewHTML(this.currentResume);
    }

    generateResumePreviewHTML(resume) {
        let html = `
            <h1>${resume.personalInfo?.name || 'Your Name'}</h1>
            <div class="contact-info">
        `;
        
        // Contact information
        if (resume.personalInfo) {
            const { email, phone, location, linkedin, github, website } = resume.personalInfo;
            if (email) html += `<span><i class="fas fa-envelope"></i> ${email}</span>`;
            if (phone) html += `<span><i class="fas fa-phone"></i> ${phone}</span>`;
            if (location) html += `<span><i class="fas fa-map-marker-alt"></i> ${location}</span>`;
            if (linkedin) html += `<span><i class="fab fa-linkedin"></i> ${linkedin}</span>`;
            if (github) html += `<span><i class="fab fa-github"></i> ${github}</span>`;
            if (website) html += `<span><i class="fas fa-globe"></i> ${website}</span>`;
        }
        
        html += '</div>';
        
        // Summary
        if (resume.summary) {
            html += `<p>${resume.summary}</p>`;
        }
        
        // Experience
        if (resume.experience && resume.experience.length > 0) {
            html += '<h2>Professional Experience</h2>';
            resume.experience.forEach(exp => {
                html += `
                    <div class="experience-item">
                        <div class="job-header">
                            <span class="job-title">${exp.title}</span>
                            <span class="company">${exp.company}</span>
                            <span class="dates">${exp.startDate} - ${exp.endDate || 'Present'}</span>
                        </div>
                        <p>${exp.location || ''}</p>
                        <div class="achievements">
                            ${exp.achievements?.map(achievement => 
                                `<div class="achievement-item">${achievement}</div>`
                            ).join('') || ''}
                        </div>
                    </div>
                `;
            });
        }
        
        // Education
        if (resume.education && resume.education.length > 0) {
            html += '<h2>Education</h2>';
            resume.education.forEach(edu => {
                html += `
                    <div class="education-item">
                        <div class="education-header">
                            <span class="degree">${edu.degree}</span>
                            <span class="institution">${edu.institution}</span>
                            <span class="dates">${edu.graduationDate}</span>
                        </div>
                        <p>${edu.location || ''}</p>
                        ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
                    </div>
                `;
            });
        }
        
        // Skills
        if (resume.skills) {
            html += '<h2>Skills</h2>';
            if (resume.skills.technical && resume.skills.technical.length > 0) {
                html += '<h3>Technical Skills</h3>';
                html += '<div class="skills-section">';
                resume.skills.technical.forEach(skill => {
                    html += `<span class="skill-tag">${skill}</span>`;
                });
                html += '</div>';
            }
            
            if (resume.skills.soft && resume.skills.soft.length > 0) {
                html += '<h3>Soft Skills</h3>';
                html += '<div class="skills-section">';
                resume.skills.soft.forEach(skill => {
                    html += `<span class="skill-tag">${skill}</span>`;
                });
                html += '</div>';
            }
        }
        
        // Projects
        if (resume.projects && resume.projects.length > 0) {
            html += '<h2>Projects</h2>';
            resume.projects.forEach(project => {
                html += `
                    <div class="project-item">
                        <div class="project-header">
                            <span class="project-name">${project.name}</span>
                        </div>
                        <p>${project.description}</p>
                        ${project.technologies && project.technologies.length > 0 ? 
                            `<div class="skills-section">
                                ${project.technologies.map(tech => `<span class="skill-tag">${tech}</span>`).join('')}
                            </div>` : ''
                        }
                    </div>
                `;
            });
        }
        
        return html;
    }

    updateResumeFromEditor() {
        if (!this.monacoEditor) return;
        
        try {
            const value = this.monacoEditor.getValue();
            if (value && value !== '// Resume JSON will appear here...') {
                const parsed = JSON.parse(value);
                this.currentResume = parsed;
                this.updateResumePreview();
            }
        } catch (error) {
            // Invalid JSON, ignore
        }
    }

    resetResume() {
        if (this.originalResume) {
            this.currentResume = JSON.parse(JSON.stringify(this.originalResume));
            this.updateEditorContent();
            this.updateResumePreview();
            this.showSuccessMessage('Resume reset to original');
        }
    }

    formatJson() {
        if (this.monacoEditor) {
            try {
                const value = this.monacoEditor.getValue();
                const parsed = JSON.parse(value);
                const formatted = JSON.stringify(parsed, null, 2);
                this.monacoEditor.setValue(formatted);
                this.showSuccessMessage('JSON formatted successfully');
            } catch (error) {
                this.showError('Invalid JSON format');
            }
        }
    }

    validateJson() {
        if (this.monacoEditor) {
            try {
                const value = this.monacoEditor.getValue();
                JSON.parse(value);
                this.showSuccessMessage('JSON is valid');
            } catch (error) {
                this.showError(`Invalid JSON: ${error.message}`);
            }
        }
    }

    switchTab(event) {
        const tabBtn = event.currentTarget;
        const tabName = tabBtn.dataset.tab;
        const tabContainer = tabBtn.closest('.editor-tabs, .output-tabs');
        
        // Update active tab button
        tabContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tabBtn.classList.add('active');
        
        // Update active tab content
        const tabContent = tabContainer.nextElementSibling;
        tabContent.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        const targetPane = tabContent.querySelector(`#${tabName}Tab`);
        if (targetPane) {
            targetPane.classList.add('active');
        }
        
        // Auto-generate PDF if switching to PDF tab and we have resume data
        if (tabName === 'pdf' && this.currentResume && !this.currentPdfBlob) {
            setTimeout(() => this.generatePdf(), 500);
        }
    }

    showStep(stepNumber) {
        this.currentStep = stepNumber;
        
        // In single-page layout, just show the editor section and enable tabs
        const editorSection = document.getElementById('editorSection');
        if (stepNumber >= 2) {
            editorSection.style.display = 'block';
            // Switch to appropriate tab based on step
            if (stepNumber === 3) {
                this.switchToTab('pdf');
            }
        }
    }

    getStepName(stepNumber) {
        switch (stepNumber) {
            case 1: return 'input';
            case 2: return 'editor';
            case 3: return 'output';
            default: return 'input';
        }
    }

    async generatePdf() {
        if (!this.currentResume) {
            this.showError('No resume data available');
            return;
        }

        try {
            const selectedTemplate = document.getElementById('templateSelect').value;
            const pdfPreview = document.getElementById('pdfPreview');
            
            pdfPreview.classList.add('loading');
            pdfPreview.innerHTML = '<div class="preview-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Generating PDF...</p></div>';
            
            // Generate PDF using the simple PDF generator
            const pdfBlob = await window.simplePdfGenerator.generatePDF(this.currentResume, selectedTemplate);
            
            if (pdfBlob) {
                // Create preview
                const pdfUrl = URL.createObjectURL(pdfBlob);
                pdfPreview.innerHTML = `<iframe src="${pdfUrl}"></iframe>`;
                pdfPreview.classList.remove('loading');
                
                // Enable download button
                document.getElementById('downloadPdf').disabled = false;
                
                // Store PDF blob for download
                this.currentPdfBlob = pdfBlob;
                
                this.showSuccessMessage('PDF generated successfully!');
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            document.getElementById('pdfPreview').classList.remove('loading');
            document.getElementById('pdfPreview').innerHTML = `
                <div class="preview-placeholder error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>PDF generation failed: ${error.message}</p>
                    <button class="btn btn-secondary btn-sm" onclick="window.app.generatePdf()">Try Again</button>
                </div>
            `;
            this.showError(`PDF generation failed: ${error.message}`);
        }
    }

    downloadJson() {
        if (!this.currentResume) {
            this.showError('No resume data available');
            return;
        }

        const jsonString = JSON.stringify(this.currentResume, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customized-resume.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('JSON file downloaded successfully!');
    }

    downloadPdf() {
        if (!this.currentPdfBlob) {
            this.showError('No PDF available for download');
            return;
        }

        const url = URL.createObjectURL(this.currentPdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customized-resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('PDF downloaded successfully!');
    }

    regeneratePdf() {
        this.generatePdf();
    }
    
    handleTemplateChange() {
        // Auto-regenerate PDF when template changes if we already have a resume
        if (this.currentResume && this.currentPdfBlob) {
            this.generatePdf();
        }
    }
    
    switchToTab(tabName) {
        // Find and click the appropriate tab
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.click();
        }
    }

    showProgressModal(message) {
        const modal = document.getElementById('progressModal');
        const progressText = document.getElementById('progressText');
        
        if (progressText) progressText.textContent = message;
        modal.style.display = 'flex';
    }

    hideProgressModal() {
        document.getElementById('progressModal').style.display = 'none';
    }

    showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorMessage) errorMessage.textContent = message;
        modal.style.display = 'flex';
    }

    hideErrorModal() {
        document.getElementById('errorModal').style.display = 'none';
    }

    showError(message) {
        this.showErrorModal(message);
    }

    showSuccessMessage(message) {
        // Create a temporary success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--success-color)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '1001',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1rem',
            fontWeight: '500'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    handleFooterLink(event, type) {
        event.preventDefault();
        
        switch (type) {
            case 'privacy':
                this.showErrorModal('Privacy Policy: This application processes all data locally in your browser. No information is sent to external servers except for the Gemini API calls you authorize.');
                break;
            case 'help':
                this.showErrorModal('Help & Support: Upload your resume, enter the job description, and click "Customize Resume with AI" to get started. Make sure to configure your Gemini API key first.');
                break;
        }
    }

    async loadSampleResume() {
        try {
            // Load the test resume for demonstration
            const response = await fetch('test-resume.json');
            if (response.ok) {
                const resumeData = await response.json();
                this.originalResume = JSON.parse(JSON.stringify(resumeData));
                this.currentResume = resumeData;
                
                // Update UI
                this.updateEditorContent();
                this.updateResumePreview();
                
                // Show the editor section
                document.getElementById('editorSection').style.display = 'block';
                
                // Show file as loaded
                const fileInfo = document.getElementById('fileInfo');
                const fileName = document.getElementById('fileName');
                const fileSize = document.getElementById('fileSize');
                const fileUploadArea = document.getElementById('fileUploadArea');
                
                if (fileName) fileName.textContent = 'test-resume.json (sample)';
                if (fileSize) fileSize.textContent = '4.2 KB';
                if (fileInfo) fileInfo.style.display = 'flex';
                if (fileUploadArea) fileUploadArea.style.display = 'none';
                
                this.checkRequirements();
                console.log('Sample resume loaded for testing');
            }
        } catch (error) {
            console.log('Sample resume not found, user will need to upload manually');
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ResumeCustomizerApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeCustomizerApp;
}

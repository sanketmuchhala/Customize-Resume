/**
 * Resume Parser Module
 * Handles parsing of different resume file formats and converts to structured JSON
 */

class ResumeParser {
    constructor() {
        this.pdfjsLib = null;
        this.initializePDFJS();
    }

    async initializePDFJS() {
        try {
            // Initialize PDF.js
            if (typeof pdfjsLib !== 'undefined') {
                this.pdfjsLib = pdfjsLib;
                this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
        } catch (error) {
            console.error('Failed to initialize PDF.js:', error);
        }
    }

    /**
     * Parse a resume file and convert to structured JSON
     * @param {File} file - The resume file to parse
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise<Object>} Structured resume data
     */
    async parseFile(file, progressCallback = null) {
        try {
            if (progressCallback) progressCallback(20, 'Extracting text from file...');
            
            const fileType = file.type;
            let textContent = '';

            switch (fileType) {
                case 'application/pdf':
                    textContent = await this.parsePDF(file);
                    break;
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    textContent = await this.parseDOCX(file);
                    break;
                case 'text/plain':
                    textContent = await this.parseTXT(file);
                    break;
                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }

            if (progressCallback) progressCallback(60, 'Converting to structured format...');

            // Parse the extracted text into structured JSON
            const result = await this.parseTextToJSON(textContent, progressCallback);
            
            if (progressCallback) progressCallback(100, 'Resume parsing complete');
            
            return result;
        } catch (error) {
            console.error('Error parsing resume file:', error);
            throw new Error(`Failed to parse resume: ${error.message}`);
        }
    }

    /**
     * Parse PDF file and extract text content
     * @param {File} file - PDF file
     * @returns {Promise<string>} Extracted text content
     */
    async parsePDF(file) {
        if (!this.pdfjsLib) {
            throw new Error('PDF.js not initialized');
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            
            return fullText.trim();
        } catch (error) {
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse DOCX file and extract text content
     * @param {File} file - DOCX file
     * @returns {Promise<string>} Extracted text content
     */
    async parseDOCX(file) {
        try {
            if (typeof mammoth === 'undefined') {
                throw new Error('Mammoth.js not loaded');
            }

            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            
            if (result.messages.length > 0) {
                console.warn('DOCX parsing warnings:', result.messages);
            }
            
            return result.value.trim();
        } catch (error) {
            throw new Error(`DOCX parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse TXT file and extract text content
     * @param {File} file - TXT file
     * @returns {Promise<string>} Extracted text content
     */
    async parseTXT(file) {
        try {
            const text = await file.text();
            return text.trim();
        } catch (error) {
            throw new Error(`TXT parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse extracted text and convert to structured JSON
     * @param {string} text - Raw text content from resume
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise<Object>} Structured resume data
     */
    async parseTextToJSON(text, progressCallback = null) {
        try {
            if (progressCallback) progressCallback(70, 'Using AI to parse resume...');
            
            // Use AI to parse the text into structured format
            const parsedData = await this.parseWithAI(text);
            
            if (progressCallback) progressCallback(90, 'Validating resume structure...');
            
            // Validate and clean the parsed data
            return this.validateAndCleanResumeData(parsedData);
        } catch (error) {
            // Fallback to basic parsing if AI fails
            console.warn('AI parsing failed, using fallback parser:', error);
            if (progressCallback) progressCallback(85, 'Using fallback parser...');
            return this.fallbackParse(text);
        }
    }

    /**
     * Use AI to parse resume text into structured format
     * @param {string} text - Raw resume text
     * @returns {Promise<Object>} Parsed resume data
     */
    async parseWithAI(text) {
        try {
            // Check if we have API key and AI handler available
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey || !window.aiHandler) {
                throw new Error('AI parsing not available');
            }

            console.log('Using AI to parse resume text to JSON...');
            
            // Create a specialized prompt for parsing resume text to JSON
            const parsePrompt = this.buildParsePrompt(text);
            
            // Call Gemini API directly for parsing
            const response = await window.aiHandler.callGeminiAPI(apiKey, parsePrompt, '');
            
            // Parse the AI response
            const parsedData = this.parseAIParseResponse(response);
            
            return parsedData;
            
        } catch (error) {
            console.warn('AI parsing failed:', error.message);
            throw error;
        }
    }

    /**
     * Build prompt for parsing resume text to JSON
     * @param {string} text - Raw resume text
     * @returns {string} Parse prompt
     */
    buildParsePrompt(text) {
        return `You are an expert resume parser. Your task is to convert the following raw resume text into a structured JSON format.

IMPORTANT: Return ONLY valid JSON with the exact structure shown below. Do not include any explanatory text, markdown formatting, or code blocks.

Required JSON Structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State",
    "linkedin": "linkedin profile",
    "github": "github profile",
    "website": "personal website"
  },
  "summary": "Professional summary or objective statement",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name", 
      "location": "City, State",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "description": ["bullet point 1", "bullet point 2"],
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "location": "City, State", 
      "graduationDate": "MM/YYYY",
      "gpa": "GPA if mentioned",
      "relevant_coursework": ["course 1", "course 2"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"], 
    "languages": ["language1", "language2"],
    "certifications": ["cert1", "cert2"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "achievements": ["achievement1", "achievement2"]
    }
  ]
}

RESUME TEXT TO PARSE:
${text}

Parse the above resume text and return ONLY the JSON object with the exact structure shown. Extract all available information and organize it properly. If a field is not found, use an empty string or empty array as appropriate.

JSON OUTPUT:`;
    }

    /**
     * Parse AI response for resume parsing
     * @param {Object} response - AI response
     * @returns {Object} Parsed resume data
     */
    parseAIParseResponse(response) {
        try {
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No response from AI');
            }

            const textResponse = response.candidates[0].content.parts[0].text;
            console.log('AI Parse Response:', textResponse.substring(0, 200) + '...');

            // Try to extract JSON from the response
            let parsedData;
            
            // Method 1: Direct JSON parse
            try {
                parsedData = JSON.parse(textResponse.trim());
            } catch (e) {
                // Method 2: Extract JSON from code blocks
                const codeBlockMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                if (codeBlockMatch) {
                    parsedData = JSON.parse(codeBlockMatch[1]);
                } else {
                    // Method 3: Find JSON object
                    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No valid JSON found in AI response');
                    }
                }
            }

            // Validate the structure
            if (!parsedData.personalInfo) {
                throw new Error('Invalid resume structure from AI');
            }

            return parsedData;

        } catch (error) {
            console.error('Failed to parse AI response:', error);
            throw new Error(`AI parsing failed: ${error.message}`);
        }
    }

    /**
     * Fallback parser for when AI parsing is not available
     * @param {string} text - Raw resume text
     * @returns {Object} Parsed resume data
     */
    fallbackParse(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        const resume = {
            personalInfo: this.extractPersonalInfo(lines),
            summary: this.extractSummary(lines),
            experience: this.extractExperience(lines),
            education: this.extractEducation(lines),
            skills: this.extractSkills(lines),
            projects: this.extractProjects(lines)
        };

        return resume;
    }

    /**
     * Extract personal information from resume text
     * @param {Array<string>} lines - Array of text lines
     * @returns {Object} Personal information object
     */
    extractPersonalInfo(lines) {
        const personalInfo = {};
        
        // Look for name (usually first line or prominent text)
        if (lines.length > 0) {
            const firstLine = lines[0];
            if (firstLine.length > 0 && firstLine.length < 100 && !firstLine.includes('@')) {
                personalInfo.name = firstLine;
            }
        }

        // Extract email
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        for (const line of lines) {
            const emailMatch = line.match(emailRegex);
            if (emailMatch) {
                personalInfo.email = emailMatch[0];
                break;
            }
        }

        // Extract phone
        const phoneRegex = /(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/;
        for (const line of lines) {
            const phoneMatch = line.match(phoneRegex);
            if (phoneMatch) {
                personalInfo.phone = phoneMatch[0];
                break;
            }
        }

        // Extract location
        const locationRegex = /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})(?:\s|$)/;
        for (const line of lines) {
            const locationMatch = line.match(locationRegex);
            if (locationMatch) {
                personalInfo.location = locationMatch[1];
                break;
            }
        }

        // Extract LinkedIn and GitHub
        for (const line of lines) {
            if (line.includes('linkedin.com')) {
                personalInfo.linkedin = line.trim();
            }
            if (line.includes('github.com')) {
                personalInfo.github = line.trim();
            }
        }

        return personalInfo;
    }

    /**
     * Extract summary/objective from resume text
     * @param {Array<string>} lines - Array of text lines
     * @returns {string} Summary text
     */
    extractSummary(lines) {
        const summaryKeywords = ['summary', 'objective', 'profile', 'overview'];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (summaryKeywords.some(keyword => line.includes(keyword))) {
                // Look for the next few lines as summary content
                let summary = '';
                for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                    const contentLine = lines[j];
                    if (contentLine.length > 10 && !this.isSectionHeader(contentLine)) {
                        summary += contentLine + ' ';
                    } else {
                        break;
                    }
                }
                return summary.trim();
            }
        }
        
        return '';
    }

    /**
     * Extract work experience from resume text
     * @param {Array<string>} lines - Array of text lines
     * @returns {Array} Array of experience objects
     */
    extractExperience(lines) {
        const experience = [];
        const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];
        
        let inExperienceSection = false;
        let currentExperience = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            
            // Check if we're entering experience section
            if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
                inExperienceSection = true;
                continue;
            }
            
            if (inExperienceSection) {
                // Check if we've hit another major section
                if (this.isSectionHeader(line) && !experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
                    break;
                }
                
                // Look for job titles (usually in caps or prominent formatting)
                if (this.isJobTitle(line)) {
                    if (currentExperience) {
                        experience.push(currentExperience);
                    }
                    
                    currentExperience = {
                        title: line.trim(),
                        company: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        description: [],
                        achievements: []
                    };
                } else if (currentExperience) {
                    // Extract company name (usually on next line)
                    if (!currentExperience.company && line.length > 0) {
                        currentExperience.company = line.trim();
                    } else if (line.length > 0) {
                        // Add as description or achievement
                        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                            currentExperience.achievements.push(line.trim());
                        } else if (line.length > 20) {
                            currentExperience.description.push(line.trim());
                        }
                    }
                }
            }
        }
        
        // Add the last experience entry
        if (currentExperience) {
            experience.push(currentExperience);
        }
        
        return experience;
    }

    /**
     * Extract education from resume text
     * @param {Array<string>} lines - Array of text lines
     * @returns {Array} Array of education objects
     */
    extractEducation(lines) {
        const education = [];
        const educationKeywords = ['education', 'academic', 'degree', 'university', 'college'];
        
        let inEducationSection = false;
        let currentEducation = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            
            if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
                inEducationSection = true;
                continue;
            }
            
            if (inEducationSection) {
                if (this.isSectionHeader(line) && !educationKeywords.some(keyword => lowerLine.includes(keyword))) {
                    break;
                }
                
                // Look for degree information
                if (this.isDegreeInfo(line)) {
                    if (currentEducation) {
                        education.push(currentEducation);
                    }
                    
                    currentEducation = {
                        degree: line.trim(),
                        institution: '',
                        location: '',
                        graduationDate: '',
                        gpa: '',
                        relevant_coursework: []
                    };
                } else if (currentEducation) {
                    // Extract institution name
                    if (!currentEducation.institution && line.length > 0) {
                        currentEducation.institution = line.trim();
                    }
                }
            }
        }
        
        if (currentEducation) {
            education.push(currentEducation);
        }
        
        return education;
    }

    /**
     * Extract skills from resume text
     * @param {Array<string>} lines - Array of text lines
     * @returns {Object} Skills object with technical, soft, and other skills
     */
    extractSkills(lines) {
        const skills = {
            technical: [],
            soft: [],
            languages: [],
            certifications: []
        };
        
        const skillsKeywords = ['skills', 'technical skills', 'competencies', 'technologies'];
        const technicalKeywords = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes'];
        const softKeywords = ['leadership', 'communication', 'teamwork', 'problem solving', 'collaboration'];
        
        let inSkillsSection = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            
            if (skillsKeywords.some(keyword => lowerLine.includes(keyword))) {
                inSkillsSection = true;
                continue;
            }
            
            if (inSkillsSection) {
                if (this.isSectionHeader(line) && !skillsKeywords.some(keyword => lowerLine.includes(keyword))) {
                    break;
                }
                
                // Extract skills from the line
                const words = line.split(/[,•\-\*]/).map(word => word.trim()).filter(word => word.length > 0);
                
                words.forEach(word => {
                    const lowerWord = word.toLowerCase();
                    if (technicalKeywords.some(tech => lowerWord.includes(tech))) {
                        skills.technical.push(word);
                    } else if (softKeywords.some(soft => lowerWord.includes(soft))) {
                        skills.soft.push(word);
                    } else if (word.length > 2 && word.length < 20) {
                        skills.technical.push(word);
                    }
                });
            }
        }
        
        return skills;
    }

    /**
     * Extract projects from resume text
     * @param {Array<string>} lines - Array of text lines
     * @returns {Array} Array of project objects
     */
    extractProjects(lines) {
        const projects = [];
        const projectKeywords = ['projects', 'portfolio', 'applications', 'software'];
        
        let inProjectsSection = false;
        let currentProject = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            
            if (projectKeywords.some(keyword => lowerLine.includes(keyword))) {
                inProjectsSection = true;
                continue;
            }
            
            if (inProjectsSection) {
                if (this.isSectionHeader(line) && !projectKeywords.some(keyword => lowerLine.includes(keyword))) {
                    break;
                }
                
                // Look for project names (usually prominent text)
                if (this.isProjectName(line)) {
                    if (currentProject) {
                        projects.push(currentProject);
                    }
                    
                    currentProject = {
                        name: line.trim(),
                        description: '',
                        technologies: [],
                        achievements: []
                    };
                } else if (currentProject) {
                    // Add as description
                    if (line.length > 10) {
                        currentProject.description = line.trim();
                    }
                }
            }
        }
        
        if (currentProject) {
            projects.push(currentProject);
        }
        
        return projects;
    }

    /**
     * Check if a line is a section header
     * @param {string} line - Text line to check
     * @returns {boolean} True if section header
     */
    isSectionHeader(line) {
        const sectionHeaders = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'contact'];
        const lowerLine = line.toLowerCase();
        return sectionHeaders.some(header => lowerLine.includes(header)) && line.length < 50;
    }

    /**
     * Check if a line represents a job title
     * @param {string} line - Text line to check
     * @returns {boolean} True if job title
     */
    isJobTitle(line) {
        // Job titles are usually 3-8 words, contain common job words, and are prominent
        const jobKeywords = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator', 'director', 'lead'];
        const lowerLine = line.toLowerCase();
        
        return line.length > 5 && 
               line.length < 100 && 
               jobKeywords.some(keyword => lowerLine.includes(keyword)) &&
               !line.includes('@') &&
               !line.includes('http');
    }

    /**
     * Check if a line represents degree information
     * @param {string} line - Text line to check
     * @returns {boolean} True if degree info
     */
    isDegreeInfo(line) {
        const degreeKeywords = ['bachelor', 'master', 'phd', 'associate', 'diploma', 'certificate'];
        const lowerLine = line.toLowerCase();
        
        return degreeKeywords.some(keyword => lowerLine.includes(keyword)) && line.length < 100;
    }

    /**
     * Check if a line represents a project name
     * @param {string} line - Text line to check
     * @returns {boolean} True if project name
     */
    isProjectName(line) {
        // Project names are usually 2-6 words and don't contain common resume words
        const resumeKeywords = ['experience', 'education', 'skills', 'contact', 'summary'];
        const lowerLine = line.toLowerCase();
        
        return line.length > 3 && 
               line.length < 80 && 
               !resumeKeywords.some(keyword => lowerLine.includes(keyword)) &&
               !line.includes('@') &&
               !line.includes('http');
    }

    /**
     * Validate and clean parsed resume data
     * @param {Object} data - Parsed resume data
     * @returns {Object} Cleaned and validated resume data
     */
    validateAndCleanResumeData(data) {
        const cleaned = {
            personalInfo: this.cleanPersonalInfo(data.personalInfo || {}),
            summary: data.summary || '',
            experience: this.cleanExperience(data.experience || []),
            education: this.cleanEducation(data.education || []),
            skills: this.cleanSkills(data.skills || {}),
            projects: this.cleanProjects(data.projects || [])
        };

        // Ensure required fields exist
        if (!cleaned.personalInfo.name) {
            cleaned.personalInfo.name = 'Your Name';
        }

        return cleaned;
    }

    /**
     * Clean personal information data
     * @param {Object} personalInfo - Personal info object
     * @returns {Object} Cleaned personal info
     */
    cleanPersonalInfo(personalInfo) {
        return {
            name: personalInfo.name || '',
            email: personalInfo.email || '',
            phone: personalInfo.phone || '',
            location: personalInfo.location || '',
            linkedin: personalInfo.linkedin || '',
            github: personalInfo.github || '',
            website: personalInfo.website || ''
        };
    }

    /**
     * Clean experience data
     * @param {Array} experience - Experience array
     * @returns {Array} Cleaned experience array
     */
    cleanExperience(experience) {
        return experience.map(exp => ({
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: Array.isArray(exp.description) ? exp.description : [],
            achievements: Array.isArray(exp.achievements) ? exp.achievements : []
        }));
    }

    /**
     * Clean education data
     * @param {Array} education - Education array
     * @returns {Array} Cleaned education array
     */
    cleanEducation(education) {
        return education.map(edu => ({
            degree: edu.degree || '',
            institution: edu.institution || '',
            location: edu.location || '',
            graduationDate: edu.graduationDate || '',
            gpa: edu.gpa || '',
            relevant_coursework: Array.isArray(edu.relevant_coursework) ? edu.relevant_coursework : []
        }));
    }

    /**
     * Clean skills data
     * @param {Object} skills - Skills object
     * @returns {Object} Cleaned skills object
     */
    cleanSkills(skills) {
        return {
            technical: Array.isArray(skills.technical) ? skills.technical : [],
            soft: Array.isArray(skills.soft) ? skills.soft : [],
            languages: Array.isArray(skills.languages) ? skills.languages : [],
            certifications: Array.isArray(skills.certifications) ? skills.certifications : []
        };
    }

    /**
     * Clean projects data
     * @param {Array} projects - Projects array
     * @returns {Array} Cleaned projects array
     */
    cleanProjects(projects) {
        return projects.map(project => ({
            name: project.name || '',
            description: project.description || '',
            technologies: Array.isArray(project.technologies) ? project.technologies : [],
            achievements: Array.isArray(project.achievements) ? project.achievements : []
        }));
    }
}

// Create global instance
window.resumeParser = new ResumeParser();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeParser;
}

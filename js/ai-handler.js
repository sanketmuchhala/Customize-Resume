/**
 * AI Handler Module
 * Handles communication with Gemini API for resume customization
 */

class AIHandler {
    constructor() {
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    /**
     * Customize resume using Gemini API
     * @param {Object} resume - Original resume data
     * @param {string} jobDescription - Job description and requirements
     * @param {string} industryType - Industry/role type
     * @param {string} apiKey - Gemini API key
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise<Object>} Customized resume data
     */
    async customizeResume(resume, jobDescription, industryType, apiKey, progressCallback) {
        try {
            if (!apiKey) {
                throw new Error('API key is required');
            }

            if (!resume || !jobDescription) {
                throw new Error('Resume and job description are required');
            }

            progressCallback(25, 'Preparing AI request...');

            // Prepare the system prompt
            const systemPrompt = this.buildSystemPrompt(industryType);
            
            // Prepare the user prompt
            const userPrompt = this.buildUserPrompt(resume, jobDescription);

            progressCallback(50, 'Sending request to Gemini API...');

            // Make the API call
            const response = await this.callGeminiAPI(apiKey, systemPrompt, userPrompt);

            progressCallback(75, 'Processing AI response...');

            // Parse and validate the response
            const customizedResume = this.parseAIResponse(response);

            progressCallback(100, 'Customization complete!');

            return customizedResume;

        } catch (error) {
            console.error('AI customization failed:', error);
            throw new Error(`AI customization failed: ${error.message}`);
        }
    }

    /**
     * Build the system prompt for the AI
     * @param {string} industryType - Industry/role type
     * @returns {string} System prompt
     */
    buildSystemPrompt(industryType) {
        let industrySpecific = '';
        
        // Add industry-specific guidance
        switch (industryType) {
            case 'software-engineering':
                industrySpecific = `
                Focus on technical skills, programming languages, frameworks, and quantifiable achievements.
                Emphasize software development methodologies, agile practices, and technical problem-solving.
                Highlight code quality, testing, and deployment experience.`;
                break;
            case 'data-science':
                industrySpecific = `
                Emphasize statistical analysis, machine learning, data visualization, and programming skills.
                Highlight experience with big data tools, databases, and analytical methodologies.
                Focus on quantifiable insights and business impact.`;
                break;
            case 'marketing':
                industrySpecific = `
                Emphasize campaign performance, ROI metrics, digital marketing skills, and brand management.
                Highlight experience with marketing tools, analytics platforms, and creative strategies.
                Focus on customer acquisition and market expansion results.`;
                break;
            case 'sales':
                industrySpecific = `
                Emphasize sales performance, revenue generation, relationship building, and territory management.
                Highlight experience with CRM systems, sales methodologies, and market expansion.
                Focus on quota achievement and customer retention.`;
                break;
            case 'finance':
                industrySpecific = `
                Emphasize financial analysis, modeling, risk management, and regulatory compliance.
                Highlight experience with financial software, reporting, and strategic planning.
                Focus on cost savings and revenue optimization.`;
                break;
            case 'healthcare':
                industrySpecific = `
                Emphasize patient care, medical procedures, regulatory compliance, and healthcare systems.
                Highlight experience with medical software, protocols, and interdisciplinary collaboration.
                Focus on patient outcomes and quality improvement.`;
                break;
            case 'education':
                industrySpecific = `
                Emphasize teaching methodologies, curriculum development, student assessment, and educational technology.
                Highlight experience with learning management systems and student engagement strategies.
                Focus on student achievement and program improvement.`;
                break;
            case 'design':
                industrySpecific = `
                Emphasize creative skills, design tools, user experience, and visual communication.
                Highlight experience with design software, prototyping, and design thinking methodologies.
                Focus on user feedback and design impact.`;
                break;
            case 'consulting':
                industrySpecific = `
                Emphasize problem-solving, strategic thinking, client management, and project delivery.
                Highlight experience with business analysis, change management, and stakeholder engagement.
                Focus on client outcomes and business transformation.`;
                break;
            default:
                industrySpecific = `
                Focus on relevant skills, achievements, and experiences that align with the job requirements.
                Emphasize quantifiable results and professional growth.`;
        }

        return `You are an expert resume writer and ATS optimization specialist with deep knowledge of ${industryType} roles. Your task is to customize a resume to maximize relevance for a specific job posting while maintaining authenticity and factual accuracy.

${industrySpecific}

KEY OPTIMIZATION PRINCIPLES:
1. KEYWORD INTEGRATION: Naturally integrate relevant keywords from the job description throughout the resume
2. SECTION PRIORITIZATION: Reorder sections based on job requirements and industry standards
3. ACHIEVEMENT ENHANCEMENT: Add metrics and quantifiable results where logical and factual
4. SKILL ALIGNMENT: Highlight relevant skills and suggest missing ones that would be valuable
5. DESCRIPTION OPTIMIZATION: Rewrite job descriptions using action verbs and industry terminology
6. ATS OPTIMIZATION: Ensure proper formatting and keyword density for applicant tracking systems

CRITICAL RULES:
- NEVER fabricate experience, skills, or achievements
- Maintain factual accuracy and truthfulness
- Ensure natural language flow and readability
- Optimize for both human readers and ATS systems
- Keep content concise, impactful, and relevant
- Return ONLY valid JSON in the exact same structure provided

Your response must be a valid JSON object that maintains the exact structure of the input resume while incorporating the optimizations above.`;
    }

    /**
     * Build the user prompt for the AI
     * @param {Object} resume - Resume data
     * @param {string} jobDescription - Job description
     * @returns {string} User prompt
     */
    buildUserPrompt(resume, jobDescription) {
        return `Please customize the following resume for this job description:

JOB DESCRIPTION:
${jobDescription}

RESUME TO CUSTOMIZE:
${JSON.stringify(resume, null, 2)}

Please return the customized resume as a valid JSON object with the exact same structure. Focus on:
1. Integrating relevant keywords naturally
2. Enhancing descriptions with action verbs and industry terms
3. Reordering sections if beneficial
4. Adding quantifiable achievements where appropriate
5. Optimizing for ATS scanning

Return ONLY the JSON object, no additional text or explanations.`;
    }

    /**
     * Call the Gemini API
     * @param {string} apiKey - Gemini API key
     * @param {string} systemPrompt - System prompt
     * @param {string} userPrompt - User prompt
     * @returns {Promise<Object>} API response
     */
    async callGeminiAPI(apiKey, systemPrompt, userPrompt) {
        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: systemPrompt + '\n\n' + userPrompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                stopSequences: []
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
                }

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(`API error: ${data.error.message}`);
                }

                return data;

            } catch (error) {
                lastError = error;
                
                if (attempt < this.maxRetries) {
                    console.warn(`API call attempt ${attempt} failed, retrying in ${this.retryDelay}ms:`, error);
                    await this.delay(this.retryDelay * attempt); // Exponential backoff
                }
            }
        }

        throw new Error(`API call failed after ${this.maxRetries} attempts. Last error: ${lastError.message}`);
    }

    /**
     * Parse the AI response and extract the customized resume
     * @param {Object} response - API response from Gemini
     * @returns {Object} Customized resume data
     */
    parseAIResponse(response) {
        try {
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No response candidates from AI');
            }

            const candidate = response.candidates[0];
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Invalid response structure from AI');
            }

            const textResponse = candidate.content.parts[0].text;
            if (!textResponse) {
                throw new Error('Empty text response from AI');
            }

            // Try to extract JSON from the response
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response');
            }

            const jsonString = jsonMatch[0];
            const parsedResume = JSON.parse(jsonString);

            // Validate the parsed resume
            if (!this.validateResumeStructure(parsedResume)) {
                throw new Error('Invalid resume structure returned by AI');
            }

            return parsedResume;

        } catch (error) {
            console.error('Failed to parse AI response:', error);
            throw new Error(`Failed to parse AI response: ${error.message}`);
        }
    }

    /**
     * Validate that the AI response maintains the correct resume structure
     * @param {Object} resume - Parsed resume data
     * @returns {boolean} True if valid structure
     */
    validateResumeStructure(resume) {
        const requiredFields = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects'];
        
        // Check if all required fields exist
        for (const field of requiredFields) {
            if (!(field in resume)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validate personalInfo structure
        if (!resume.personalInfo || typeof resume.personalInfo !== 'object') {
            console.error('Invalid personalInfo structure');
            return false;
        }

        // Validate arrays
        const arrayFields = ['experience', 'education', 'skills', 'projects'];
        for (const field of arrayFields) {
            if (!Array.isArray(resume[field])) {
                console.error(`Field ${field} is not an array`);
                return false;
            }
        }

        // Validate skills object structure
        if (resume.skills && typeof resume.skills === 'object') {
            const skillTypes = ['technical', 'soft', 'languages', 'certifications'];
            for (const skillType of skillTypes) {
                if (resume.skills[skillType] && !Array.isArray(resume.skills[skillType])) {
                    console.error(`Skills.${skillType} is not an array`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Utility function to add delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test API key validity
     * @param {string} apiKey - API key to test
     * @returns {Promise<boolean>} True if valid
     */
    async testAPIKey(apiKey) {
        try {
            const testPrompt = "Please respond with 'OK' if you can read this message.";
            const response = await this.callGeminiAPI(apiKey, testPrompt, testPrompt);
            return response && response.candidates && response.candidates.length > 0;
        } catch (error) {
            console.error('API key test failed:', error);
            return false;
        }
    }

    /**
     * Get estimated cost for API call
     * @param {Object} resume - Resume data
     * @param {string} jobDescription - Job description
     * @returns {Object} Cost estimation
     */
    getCostEstimation(resume, jobDescription) {
        // Gemini 1.5 Flash pricing (approximate)
        const inputTokens = this.estimateTokens(JSON.stringify(resume) + jobDescription);
        const outputTokens = this.estimateTokens(JSON.stringify(resume)) * 1.2; // Estimate 20% more output
        
        const inputCost = (inputTokens / 1000000) * 0.075; // $0.075 per 1M input tokens
        const outputCost = (outputTokens / 1000000) * 0.30; // $0.30 per 1M output tokens
        
        return {
            inputTokens,
            outputTokens,
            estimatedCost: inputCost + outputCost,
            currency: 'USD'
        };
    }

    /**
     * Estimate token count (rough approximation)
     * @param {string} text - Text to estimate
     * @returns {number} Estimated token count
     */
    estimateTokens(text) {
        // Rough approximation: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }

    /**
     * Analyze job description for key requirements
     * @param {string} jobDescription - Job description text
     * @returns {Object} Analysis results
     */
    analyzeJobDescription(jobDescription) {
        const analysis = {
            requiredSkills: [],
            preferredSkills: [],
            experienceLevel: '',
            industryKeywords: [],
            technicalTerms: [],
            softSkills: []
        };

        const text = jobDescription.toLowerCase();
        
        // Extract technical skills
        const technicalSkills = [
            'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
            'kubernetes', 'machine learning', 'data analysis', 'agile', 'scrum'
        ];
        
        technicalSkills.forEach(skill => {
            if (text.includes(skill)) {
                analysis.requiredSkills.push(skill);
            }
        });

        // Extract experience level indicators
        if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
            analysis.experienceLevel = 'senior';
        } else if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
            analysis.experienceLevel = 'junior';
        } else if (text.includes('mid') || text.includes('intermediate')) {
            analysis.experienceLevel = 'mid-level';
        }

        // Extract industry keywords
        const industryKeywords = [
            'startup', 'enterprise', 'fintech', 'healthtech', 'e-commerce', 'saas',
            'consulting', 'agency', 'non-profit', 'government'
        ];
        
        industryKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                analysis.industryKeywords.push(keyword);
            }
        });

        return analysis;
    }
}

// Create global instance
window.aiHandler = new AIHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIHandler;
}

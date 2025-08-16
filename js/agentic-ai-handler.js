/**
 * Agentic AI Handler
 * Implements multi-step AI processing with specialized agents for better results
 */

class AgenticAIHandler {
    constructor() {
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.agents = {
            analyzer: new JobAnalyzerAgent(),
            optimizer: new ResumeOptimizerAgent(),
            validator: new QualityValidatorAgent()
        };
    }

    /**
     * Multi-step agentic resume customization
     * @param {Object} resume - Resume JSON data
     * @param {string} jobDescription - Job description
     * @param {string} industryType - Industry type
     * @param {string} apiKey - API key
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Object>} Optimized resume
     */
    async customizeResumeWithAgents(resume, jobDescription, industryType, apiKey, progressCallback) {
        try {
            console.log('Starting agentic resume customization...');
            
            // Phase 1: Analyze job requirements (20%)
            progressCallback(5, 'Analyzing job requirements...');
            const jobAnalysis = await this.agents.analyzer.analyzeJob(
                jobDescription, 
                industryType, 
                apiKey, 
                this.callGeminiAPI.bind(this),
                (progress, message) => progressCallback(5 + progress * 0.15, message)
            );
            
            // Phase 2: Generate optimization strategy (40%)
            progressCallback(20, 'Creating optimization strategy...');
            const optimizationStrategy = await this.agents.optimizer.createStrategy(
                resume,
                jobAnalysis,
                apiKey,
                this.callGeminiAPI.bind(this),
                (progress, message) => progressCallback(20 + progress * 0.20, message)
            );
            
            // Phase 3: Apply optimizations (70%)
            progressCallback(40, 'Applying resume optimizations...');
            const optimizedResume = await this.agents.optimizer.applyOptimizations(
                resume,
                optimizationStrategy,
                apiKey,
                this.callGeminiAPI.bind(this),
                (progress, message) => progressCallback(40 + progress * 0.30, message)
            );
            
            // Phase 4: Validate and refine (90%)
            progressCallback(70, 'Validating and refining results...');
            const finalResume = await this.agents.validator.validateAndRefine(
                optimizedResume,
                jobAnalysis,
                optimizationStrategy,
                apiKey,
                this.callGeminiAPI.bind(this),
                (progress, message) => progressCallback(70 + progress * 0.20, message)
            );
            
            progressCallback(90, 'Finalizing customized resume...');
            
            // Final validation
            if (!this.validateResumeStructure(finalResume)) {
                throw new Error('Final resume validation failed');
            }
            
            progressCallback(100, 'Resume customization complete!');
            return finalResume;
            
        } catch (error) {
            console.error('Agentic customization failed:', error);
            throw new Error(`Agentic customization failed: ${error.message}`);
        }
    }

    /**
     * Call Gemini API (shared method)
     */
    async callGeminiAPI(apiKey, systemPrompt, userPrompt) {
        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: systemPrompt + (userPrompt ? '\n\n' + userPrompt : '')
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
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw new Error(`API call failed after ${this.maxRetries} attempts. Last error: ${lastError.message}`);
    }

    /**
     * Validate resume structure
     */
    validateResumeStructure(resume) {
        return resume && 
               typeof resume === 'object' && 
               resume.personalInfo && 
               typeof resume.personalInfo === 'object';
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Extract JSON from AI response
     */
    extractJSON(response) {
        try {
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No response candidates');
            }

            const textResponse = response.candidates[0].content.parts[0].text;
            
            // Try direct parse first
            try {
                return JSON.parse(textResponse.trim());
            } catch (e) {
                // Try extracting from code blocks
                const codeBlockMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                if (codeBlockMatch) {
                    return JSON.parse(codeBlockMatch[1]);
                }
                
                // Try finding JSON object
                const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                
                throw new Error('No valid JSON found in response');
            }
        } catch (error) {
            throw new Error(`Failed to extract JSON: ${error.message}`);
        }
    }
}

/**
 * Job Analyzer Agent
 * Specializes in analyzing job descriptions and extracting requirements
 */
class JobAnalyzerAgent {
    async analyzeJob(jobDescription, industryType, apiKey, callAPI, progressCallback) {
        try {
            progressCallback(25, 'Extracting key requirements...');
            
            const prompt = `You are a job analysis expert. Analyze the following job description and extract key information in JSON format.

JOB DESCRIPTION:
${jobDescription}

INDUSTRY TYPE: ${industryType}

Return ONLY valid JSON with this structure:
{
  "keyRequirements": ["requirement1", "requirement2"],
  "mustHaveSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "experienceLevel": "junior|mid|senior",
  "industryKeywords": ["keyword1", "keyword2"],
  "companySize": "startup|mid-size|enterprise|unknown",
  "roleType": "individual_contributor|team_lead|manager|executive",
  "techStack": ["tech1", "tech2"],
  "softSkills": ["skill1", "skill2"],
  "priorities": {
    "technical": 0.7,
    "leadership": 0.3,
    "communication": 0.5
  }
}

JSON OUTPUT:`;

            progressCallback(50, 'Processing job requirements...');
            const response = await callAPI(apiKey, prompt, '');
            
            progressCallback(75, 'Analyzing company culture fit...');
            const analysis = this.extractJSON(response);
            
            progressCallback(100, 'Job analysis complete');
            return analysis;
            
        } catch (error) {
            throw new Error(`Job analysis failed: ${error.message}`);
        }
    }

    extractJSON(response) {
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error('No response candidates');
        }

        const textResponse = response.candidates[0].content.parts[0].text;
        
        try {
            return JSON.parse(textResponse.trim());
        } catch (e) {
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found');
        }
    }
}

/**
 * Resume Optimizer Agent
 * Specializes in creating and applying optimization strategies
 */
class ResumeOptimizerAgent {
    async createStrategy(resume, jobAnalysis, apiKey, callAPI, progressCallback) {
        try {
            progressCallback(20, 'Creating optimization strategy...');
            
            const prompt = `You are a resume optimization strategist. Based on the job analysis and current resume, create an optimization strategy.

JOB ANALYSIS:
${JSON.stringify(jobAnalysis, null, 2)}

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

Return ONLY valid JSON with this structure:
{
  "keywordIntegration": {
    "primary": ["keyword1", "keyword2"],
    "secondary": ["keyword3", "keyword4"]
  },
  "sectionPriorities": ["experience", "skills", "education", "projects"],
  "improvementAreas": [
    {
      "section": "experience",
      "action": "enhance_descriptions",
      "details": "Add more action verbs and quantifiable results"
    }
  ],
  "skillsToEmphasize": ["skill1", "skill2"],
  "achievementsToHighlight": ["achievement1", "achievement2"],
  "languageOptimizations": {
    "tone": "professional|technical|creative",
    "keywords": ["keyword1", "keyword2"],
    "actionVerbs": ["verb1", "verb2"]
  }
}

JSON OUTPUT:`;

            progressCallback(60, 'Analyzing optimization opportunities...');
            const response = await callAPI(apiKey, prompt, '');
            
            progressCallback(100, 'Strategy created');
            return this.extractJSON(response);
            
        } catch (error) {
            throw new Error(`Strategy creation failed: ${error.message}`);
        }
    }

    async applyOptimizations(resume, strategy, apiKey, callAPI, progressCallback) {
        try {
            progressCallback(10, 'Applying keyword optimizations...');
            
            const prompt = `You are a resume optimization specialist. Apply the given strategy to optimize the resume.

OPTIMIZATION STRATEGY:
${JSON.stringify(strategy, null, 2)}

CURRENT RESUME:
${JSON.stringify(resume, null, 2)}

Apply the optimization strategy and return the improved resume in the EXACT same JSON structure. Focus on:
1. Integrating keywords naturally
2. Enhancing job descriptions with action verbs
3. Quantifying achievements where possible
4. Improving overall ATS compatibility
5. Maintaining factual accuracy

Return ONLY the optimized resume JSON with the exact same structure:

JSON OUTPUT:`;

            progressCallback(50, 'Enhancing descriptions...');
            const response = await callAPI(apiKey, prompt, '');
            
            progressCallback(80, 'Applying final optimizations...');
            const optimizedResume = this.extractJSON(response);
            
            progressCallback(100, 'Optimizations applied');
            return optimizedResume;
            
        } catch (error) {
            throw new Error(`Optimization application failed: ${error.message}`);
        }
    }

    extractJSON(response) {
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error('No response candidates');
        }

        const textResponse = response.candidates[0].content.parts[0].text;
        
        try {
            return JSON.parse(textResponse.trim());
        } catch (e) {
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found');
        }
    }
}

/**
 * Quality Validator Agent
 * Specializes in validating and refining the final output
 */
class QualityValidatorAgent {
    async validateAndRefine(resume, jobAnalysis, strategy, apiKey, callAPI, progressCallback) {
        try {
            progressCallback(25, 'Validating resume quality...');
            
            const prompt = `You are a resume quality validator. Review the optimized resume and make final refinements.

JOB ANALYSIS:
${JSON.stringify(jobAnalysis, null, 2)}

OPTIMIZATION STRATEGY:
${JSON.stringify(strategy, null, 2)}

OPTIMIZED RESUME:
${JSON.stringify(resume, null, 2)}

Perform final quality checks and refinements:
1. Ensure all keywords are naturally integrated
2. Verify descriptions are compelling and specific
3. Check for consistency in formatting and language
4. Ensure ATS compatibility
5. Validate that achievements are quantified

Return the final refined resume in the EXACT same JSON structure:

JSON OUTPUT:`;

            progressCallback(60, 'Refining content quality...');
            const response = await callAPI(apiKey, prompt, '');
            
            progressCallback(90, 'Final validation checks...');
            const refinedResume = this.extractJSON(response);
            
            progressCallback(100, 'Quality validation complete');
            return refinedResume;
            
        } catch (error) {
            throw new Error(`Quality validation failed: ${error.message}`);
        }
    }

    extractJSON(response) {
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error('No response candidates');
        }

        const textResponse = response.candidates[0].content.parts[0].text;
        
        try {
            return JSON.parse(textResponse.trim());
        } catch (e) {
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found');
        }
    }
}

// Create global instance
window.agenticAIHandler = new AgenticAIHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgenticAIHandler;
}
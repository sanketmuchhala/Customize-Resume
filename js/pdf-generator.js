/**
 * PDF Generator Module
 * Handles LaTeX compilation and PDF generation using LaTeX.js
 */

class PDFGenerator {
    constructor() {
        this.latex = null;
        this.initializeLaTeX();
    }

    async initializeLaTeX() {
        try {
            // Initialize LaTeX.js if available
            if (typeof LaTeX !== 'undefined') {
                this.latex = new LaTeX();
            }
        } catch (error) {
            console.error('Failed to initialize LaTeX.js:', error);
        }
    }

    /**
     * Generate PDF from resume data
     * @param {Object} resume - Resume data to convert to PDF
     * @param {string} template - Template to use (modern, ats, executive)
     * @returns {Promise<Blob>} Generated PDF blob
     */
    async generatePDF(resume, template = 'modern') {
        try {
            if (!resume) {
                throw new Error('Resume data is required');
            }

            // Generate LaTeX content
            const latexContent = this.generateLaTeX(resume, template);
            
            // Compile LaTeX to PDF
            const pdfBlob = await this.compileLaTeX(latexContent);
            
            return pdfBlob;

        } catch (error) {
            console.error('PDF generation failed:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    /**
     * Generate LaTeX content from resume data
     * @param {Object} resume - Resume data
     * @param {string} template - Template name
     * @returns {string} LaTeX content
     */
    generateLaTeX(resume, template) {
        const templateData = this.getTemplateData(template);
        
        let latex = templateData.header;
        
        // Add personal information
        latex += this.generatePersonalInfoLaTeX(resume.personalInfo, templateData);
        
        // Add summary
        if (resume.summary) {
            latex += this.generateSummaryLaTeX(resume.summary, templateData);
        }
        
        // Add experience
        if (resume.experience && resume.experience.length > 0) {
            latex += this.generateExperienceLaTeX(resume.experience, templateData);
        }
        
        // Add education
        if (resume.education && resume.education.length > 0) {
            latex += this.generateEducationLaTeX(resume.education, templateData);
        }
        
        // Add skills
        if (resume.skills) {
            latex += this.generateSkillsLaTeX(resume.skills, templateData);
        }
        
        // Add projects
        if (resume.projects && resume.projects.length > 0) {
            latex += this.generateProjectsLaTeX(resume.projects, templateData);
        }
        
        latex += templateData.footer;
        
        return latex;
    }

    /**
     * Get template data for specified template
     * @param {string} template - Template name
     * @returns {Object} Template configuration
     */
    getTemplateData(template) {
        const templates = {
            modern: {
                header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fontawesome}

\\geometry{margin=0.75in}

% Custom colors
\\definecolor{primary}{HTML}{2563eb}
\\definecolor{secondary}{HTML}{64748b}
\\definecolor{accent}{HTML}{0ea5e9}

% Custom section formatting
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titleformat{\\subsection}{\\large\\bfseries\\color{secondary}}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}
\\newcommand{\\skillTag}[1]{\\fbox{\\color{primary}#1}}

% Header styling
\\newcommand{\\resumeHeader}[1]{
    \\begin{center}
        {\\Huge\\bfseries\\color{primary}#1}\\\\[0.5em]
    \\end{center}
}

% Contact info styling
\\newcommand{\\contactInfo}[1]{
    \\begin{center}
        {\\large\\color{secondary}#1}\\\\[1em]
    \\end{center}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}

`,
                footer: `
\\end{document}`,
                sectionSpacing: '\\vspace{0.5em}',
                itemSpacing: '\\vspace{0.25em}'
            },
            
            ats: {
                header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\geometry{margin=1in}

% ATS-friendly formatting - simple and clean
\\titleformat{\\section}{\\Large\\bfseries}{}{0em}{}
\\titleformat{\\subsection}{\\large\\bfseries}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}

% Simple header
\\newcommand{\\resumeHeader}[1]{
    \\begin{center}
        {\\Huge\\bfseries#1}\\\\[0.5em]
    \\end{center}
}

% Simple contact info
\\newcommand{\\contactInfo}[1]{
    \\begin{center}
        {\\large#1}\\\\[1em]
    \\end{center}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}

`,
                footer: `
\\end{document}`,
                sectionSpacing: '\\vspace{0.5em}',
                itemSpacing: '\\vspace{0.25em}'
            },
            
            executive: {
                header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fontawesome}

\\geometry{margin=0.75in}

% Executive color scheme
\\definecolor{executive}{HTML}{1e293b}
\\definecolor{accent}{HTML}{334155}
\\definecolor{text}{HTML}{475569}

% Executive section formatting
\\titleformat{\\section}{\\Large\\bfseries\\color{executive}}{}{0em}{}[\\color{accent}\\titlerule]
\\titleformat{\\subsection}{\\large\\bfseries\\color{executive}}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}
\\newcommand{\\skillTag}[1]{\\fbox{\\color{executive}#1}}

% Executive header
\\newcommand{\\resumeHeader}[1]{
    \\begin{center}
        {\\Huge\\bfseries\\color{executive}#1}\\\\[0.5em]
    \\end{center}
}

% Executive contact info
\\newcommand{\\contactInfo}[1]{
    \\begin{center}
        {\\large\\color{text}#1}\\\\[1em]
    \\end{center}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}

`,
                footer: `
\\end{document}`,
                sectionSpacing: '\\vspace{0.5em}',
                itemSpacing: '\\vspace{0.25em}'
            }
        };

        return templates[template] || templates.modern;
    }

    /**
     * Generate LaTeX for personal information section
     * @param {Object} personalInfo - Personal information
     * @param {Object} template - Template data
     * @returns {string} LaTeX content
     */
    generatePersonalInfoLaTeX(personalInfo, template) {
        if (!personalInfo || !personalInfo.name) {
            return '';
        }

        let latex = `\\resumeHeader{${this.escapeLaTeX(personalInfo.name)}}\n`;
        
        // Build contact information
        const contactParts = [];
        
        if (personalInfo.email) {
            contactParts.push(`\\faEnvelope\\ ${this.escapeLaTeX(personalInfo.email)}`);
        }
        if (personalInfo.phone) {
            contactParts.push(`\\faPhone\\ ${this.escapeLaTeX(personalInfo.phone)}`);
        }
        if (personalInfo.location) {
            contactParts.push(`\\faMapMarker\\ ${this.escapeLaTeX(personalInfo.location)}`);
        }
        if (personalInfo.linkedin) {
            contactParts.push(`\\faLinkedin\\ ${this.escapeLaTeX(personalInfo.linkedin)}`);
        }
        if (personalInfo.github) {
            contactParts.push(`\\faGithub\\ ${this.escapeLaTeX(personalInfo.github)}`);
        }
        if (personalInfo.website) {
            contactParts.push(`\\faGlobe\\ ${this.escapeLaTeX(personalInfo.website)}`);
        }

        if (contactParts.length > 0) {
            latex += `\\contactInfo{${contactParts.join(' \\quad ')}${template.sectionSpacing}}\n`;
        }

        return latex;
    }

    /**
     * Generate LaTeX for summary section
     * @param {string} summary - Summary text
     * @param {Object} template - Template data
     * @returns {string} LaTeX content
     */
    generateSummaryLaTeX(summary, template) {
        if (!summary) return '';
        
        return `\\resumeSection{Professional Summary}${template.sectionSpacing}
${this.escapeLaTeX(summary)}${template.sectionSpacing}\n`;
    }

    /**
     * Generate LaTeX for experience section
     * @param {Array} experience - Experience array
     * @param {Object} template - Template data
     * @returns {string} LaTeX content
     */
    generateExperienceLaTeX(experience, template) {
        if (!experience || experience.length === 0) return '';

        let latex = `\\resumeSection{Professional Experience}${template.sectionSpacing}\n`;
        
        experience.forEach((exp, index) => {
            latex += `\\resumeSubsection{${this.escapeLaTeX(exp.title)}}\n`;
            
            if (exp.company) {
                latex += `\\textbf{${this.escapeLaTeX(exp.company)}}`;
                if (exp.location) {
                    latex += ` \\quad ${this.escapeLaTeX(exp.location)}`;
                }
                if (exp.startDate || exp.endDate) {
                    latex += ` \\quad ${this.escapeLaTeX(exp.startDate || '')} - ${this.escapeLaTeX(exp.endDate || 'Present')}`;
                }
                latex += `\\\\\n`;
            }
            
            if (exp.description && exp.description.length > 0) {
                latex += `\\begin{itemize}[leftmargin=*]\n`;
                exp.description.forEach(desc => {
                    latex += `\\item ${this.escapeLaTeX(desc)}\n`;
                });
                latex += `\\end{itemize}\n`;
            }
            
            if (exp.achievements && exp.achievements.length > 0) {
                latex += `\\textbf{Key Achievements:}\n\\begin{itemize}[leftmargin=*]\n`;
                exp.achievements.forEach(achievement => {
                    latex += `\\item ${this.escapeLaTeX(achievement)}\n`;
                });
                latex += `\\end{itemize}\n`;
            }
            
            if (index < experience.length - 1) {
                latex += template.itemSpacing;
            }
        });

        return latex;
    }

    /**
     * Generate LaTeX for education section
     * @param {Array} education - Education array
     * @param {Object} template - Template data
     * @returns {string} LaTeX content
     */
    generateEducationLaTeX(education, template) {
        if (!education || education.length === 0) return '';

        let latex = `\\resumeSection{Education}${template.sectionSpacing}\n`;
        
        education.forEach((edu, index) => {
            latex += `\\resumeSubsection{${this.escapeLaTeX(edu.degree)}}\n`;
            
            if (edu.institution) {
                latex += `\\textbf{${this.escapeLaTeX(edu.institution)}}`;
                if (edu.location) {
                    latex += ` \\quad ${this.escapeLaTeX(edu.location)}`;
                }
                if (edu.graduationDate) {
                    latex += ` \\quad ${this.escapeLaTeX(edu.graduationDate)}`;
                }
                if (edu.gpa) {
                    latex += ` \\quad GPA: ${this.escapeLaTeX(edu.gpa)}`;
                }
                latex += `\\\\\n`;
            }
            
            if (edu.relevant_coursework && edu.relevant_coursework.length > 0) {
                latex += `\\textbf{Relevant Coursework:} ${edu.relevant_coursework.map(course => this.escapeLaTeX(course)).join(', ')}\n`;
            }
            
            if (index < education.length - 1) {
                latex += template.itemSpacing;
            }
        });

        return latex;
    }

    /**
     * Generate LaTeX for skills section
     * @param {Object} skills - Skills object
     * @param {Object} template - Template data
     * @returns {string} LaTeX content
     */
    generateSkillsLaTeX(skills, template) {
        if (!skills) return '';

        let latex = `\\resumeSection{Skills}${template.sectionSpacing}\n`;
        
        if (skills.technical && skills.technical.length > 0) {
            latex += `\\textbf{Technical Skills:} ${skills.technical.map(skill => `\\skillTag{${this.escapeLaTeX(skill)}}`).join(' ')}\\\\[0.5em]\n`;
        }
        
        if (skills.soft && skills.soft.length > 0) {
            latex += `\\textbf{Soft Skills:} ${skills.soft.map(skill => `\\skillTag{${this.escapeLaTeX(skill)}}`).join(' ')}\\\\[0.5em]\n`;
        }
        
        if (skills.languages && skills.languages.length > 0) {
            latex += `\\textbf{Languages:} ${skills.languages.map(lang => `\\skillTag{${this.escapeLaTeX(lang)}}`).join(' ')}\\\\[0.5em]\n`;
        }
        
        if (skills.certifications && skills.certifications.length > 0) {
            latex += `\\textbf{Certifications:} ${skills.certifications.map(cert => `\\skillTag{${this.escapeLaTeX(cert)}}`).join(' ')}\\\\[0.5em]\n`;
        }

        return latex;
    }

    /**
     * Generate LaTeX for projects section
     * @param {Array} projects - Projects array
     * @param {Object} template - Template data
     * @returns {string} LaTeX content
     */
    generateProjectsLaTeX(projects, template) {
        if (!projects || projects.length === 0) return '';

        let latex = `\\resumeSection{Projects}${template.sectionSpacing}\n`;
        
        projects.forEach((project, index) => {
            latex += `\\resumeSubsection{${this.escapeLaTeX(project.name)}}\n`;
            
            if (project.description) {
                latex += `${this.escapeLaTeX(project.description)}\\\\[0.5em]\n`;
            }
            
            if (project.technologies && project.technologies.length > 0) {
                latex += `\\textbf{Technologies:} ${project.technologies.map(tech => `\\skillTag{${this.escapeLaTeX(tech)}}`).join(' ')}\\\\[0.5em]\n`;
            }
            
            if (project.achievements && project.achievements.length > 0) {
                latex += `\\textbf{Key Achievements:}\n\\begin{itemize}[leftmargin=*]\n`;
                project.achievements.forEach(achievement => {
                    latex += `\\item ${this.escapeLaTeX(achievement)}\n`;
                });
                latex += `\\end{itemize}\n`;
            }
            
            if (index < projects.length - 1) {
                latex += template.itemSpacing;
            }
        });

        return latex;
    }

    /**
     * Compile LaTeX to PDF
     * @param {string} latexContent - LaTeX content to compile
     * @returns {Promise<Blob>} Generated PDF blob
     */
    async compileLaTeX(latexContent) {
        try {
            if (this.latex) {
                // Use LaTeX.js if available
                return await this.compileWithLaTeXJS(latexContent);
            } else {
                // Fallback to PDF-lib for basic PDF generation
                return await this.generateBasicPDF(latexContent);
            }
        } catch (error) {
            console.error('LaTeX compilation failed, using fallback:', error);
            return await this.generateBasicPDF(latexContent);
        }
    }

    /**
     * Compile LaTeX using LaTeX.js
     * @param {string} latexContent - LaTeX content
     * @returns {Promise<Blob>} PDF blob
     */
    async compileWithLaTeXJS(latexContent) {
        try {
            const result = await this.latex.compile(latexContent);
            
            if (result.pdf) {
                return new Blob([result.pdf], { type: 'application/pdf' });
            } else {
                throw new Error('LaTeX.js compilation failed to produce PDF');
            }
        } catch (error) {
            throw new Error(`LaTeX.js compilation failed: ${error.message}`);
        }
    }

    /**
     * Generate basic PDF using PDF-lib as fallback
     * @param {string} latexContent - LaTeX content (converted to plain text)
     * @returns {Promise<Blob>} PDF blob
     */
    async generateBasicPDF(latexContent) {
        try {
            if (typeof PDFLib === 'undefined') {
                throw new Error('PDF-lib not available for fallback PDF generation');
            }

            // Convert LaTeX to plain text for basic PDF
            const plainText = this.latexToPlainText(latexContent);
            
            // Create PDF document
            const pdfDoc = await PDFLib.PDFDocument.create();
            const page = pdfDoc.addPage([612, 792]); // Letter size
            
            // Add text content
            const fontSize = 12;
            const lineHeight = fontSize * 1.2;
            let y = 750;
            
            const lines = plainText.split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    page.drawText(line.trim(), {
                        x: 50,
                        y: y,
                        size: fontSize,
                        color: PDFLib.rgb(0, 0, 0)
                    });
                    y -= lineHeight;
                }
                
                if (y < 50) {
                    // Add new page if needed
                    const newPage = pdfDoc.addPage([612, 792]);
                    y = 750;
                }
            }
            
            // Save PDF
            const pdfBytes = await pdfDoc.save();
            return new Blob([pdfBytes], { type: 'application/pdf' });
            
        } catch (error) {
            throw new Error(`Fallback PDF generation failed: ${error.message}`);
        }
    }

    /**
     * Convert LaTeX content to plain text for fallback PDF
     * @param {string} latexContent - LaTeX content
     * @returns {string} Plain text
     */
    latexToPlainText(latexContent) {
        // Remove LaTeX commands and formatting
        let text = latexContent
            .replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?/g, '') // Remove LaTeX commands
            .replace(/\\%/g, '%') // Unescape percent signs
            .replace(/\\_/g, '_') // Unescape underscores
            .replace(/\\\{/g, '{') // Unescape braces
            .replace(/\\\}/g, '}') // Unescape braces
            .replace(/\\\$/g, '$') // Unescape dollar signs
            .replace(/\\\&/g, '&') // Unescape ampersands
            .replace(/\\\#/g, '#') // Unescape hash
            .replace(/\\\~/g, '~') // Unescape tilde
            .replace(/\\\^/g, '^') // Unescape caret
            .replace(/\\\"/g, '"') // Unescape quotes
            .replace(/\\'/g, "'") // Unescape single quotes
            .replace(/\\\\/g, '\n') // Convert double backslash to newline
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        return text;
    }

    /**
     * Escape special LaTeX characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeLaTeX(text) {
        if (!text) return '';
        
        return text
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\$/g, '\\$')
            .replace(/\&/g, '\\&')
            .replace(/\#/g, '\\#')
            .replace(/\~/g, '\\textasciitilde{}')
            .replace(/\^/g, '\\textasciicircum{}')
            .replace(/"/g, '\\textquotedbl{}')
            .replace(/'/g, '\\textquotesingle{}')
            .replace(/%/g, '\\%')
            .replace(/_/g, '\\_');
    }

    /**
     * Get available templates
     * @returns {Array} Array of template names
     */
    getAvailableTemplates() {
        return ['modern', 'ats', 'executive'];
    }

    /**
     * Get template preview information
     * @param {string} template - Template name
     * @returns {Object} Template preview data
     */
    getTemplatePreview(template) {
        const previews = {
            modern: {
                name: 'Modern',
                description: 'Clean, contemporary design with subtle colors and professional typography',
                features: ['Color accents', 'Professional fonts', 'Modern layout', 'ATS friendly']
            },
            ats: {
                name: 'ATS-Friendly',
                description: 'Plain formatting optimized for applicant tracking systems',
                features: ['Simple formatting', 'High readability', 'ATS optimized', 'Universal compatibility']
            },
            executive: {
                name: 'Executive',
                description: 'Professional layout for senior positions with sophisticated styling',
                features: ['Executive styling', 'Sophisticated colors', 'Professional layout', 'Senior level']
            }
        };

        return previews[template] || previews.modern;
    }
}

// Create global instance
window.pdfGenerator = new PDFGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}

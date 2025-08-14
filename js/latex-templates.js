/**
 * LaTeX Templates Module
 * Provides additional LaTeX templates and utilities for PDF generation
 */

class LaTeXTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
    }

    /**
     * Initialize all available LaTeX templates
     * @returns {Object} Templates object
     */
    initializeTemplates() {
        return {
            modern: this.getModernTemplate(),
            ats: this.getATSTemplate(),
            executive: this.getExecutiveTemplate(),
            creative: this.getCreativeTemplate(),
            minimal: this.getMinimalTemplate(),
            technical: this.getTechnicalTemplate()
        };
    }

    /**
     * Get modern template configuration
     * @returns {Object} Template configuration
     */
    getModernTemplate() {
        return {
            name: 'Modern',
            description: 'Clean, contemporary design with subtle colors and professional typography',
            features: ['Color accents', 'Professional fonts', 'Modern layout', 'ATS friendly'],
            header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fontawesome}
\\usepackage{parskip}

\\geometry{margin=0.75in}

% Custom colors
\\definecolor{primary}{HTML}{2563eb}
\\definecolor{secondary}{HTML}{64748b}
\\definecolor{accent}{HTML}{0ea5e9}
\\definecolor{lightgray}{HTML}{f8fafc}

% Custom section formatting
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titleformat{\\subsection}{\\large\\bfseries\\color{secondary}}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}
\\newcommand{\\skillTag}[1]{\\fbox{\\color{primary}#1}}
\\newcommand{\\highlight}[1]{\\color{primary}#1}

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

% Custom itemize environment
\\newenvironment{resumeItemize}{
    \\begin{itemize}[leftmargin=*, itemsep=0.1em, parsep=0em]
}{
    \\end{itemize}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}
\\setlength{\\parskip}{0.5em}

`,
            footer: `
\\end{document}`,
            sectionSpacing: '\\vspace{0.5em}',
            itemSpacing: '\\vspace{0.25em}'
        };
    }

    /**
     * Get ATS-friendly template configuration
     * @returns {Object} Template configuration
     */
    getATSTemplate() {
        return {
            name: 'ATS-Friendly',
            description: 'Plain formatting optimized for applicant tracking systems',
            features: ['Simple formatting', 'High readability', 'ATS optimized', 'Universal compatibility'],
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

% Simple itemize environment
\\newenvironment{resumeItemize}{
    \\begin{itemize}[leftmargin=*, itemsep=0.1em, parsep=0em]
}{
    \\end{itemize}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}
\\setlength{\\parskip}{0.3em}

`,
            footer: `
\\end{document}`,
            sectionSpacing: '\\vspace{0.5em}',
            itemSpacing: '\\vspace{0.25em}'
        };
    }

    /**
     * Get executive template configuration
     * @returns {Object} Template configuration
     */
    getExecutiveTemplate() {
        return {
            name: 'Executive',
            description: 'Professional layout for senior positions with sophisticated styling',
            features: ['Executive styling', 'Sophisticated colors', 'Professional layout', 'Senior level'],
            header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fontawesome}
\\usepackage{parskip}

\\geometry{margin=0.75in}

% Executive color scheme
\\definecolor{executive}{HTML}{1e293b}
\\definecolor{accent}{HTML}{334155}
\\definecolor{text}{HTML}{475569}
\\definecolor{light}{HTML}{f1f5f9}

% Executive section formatting
\\titleformat{\\section}{\\Large\\bfseries\\color{executive}}{}{0em}{}[\\color{accent}\\titlerule]
\\titleformat{\\subsection}{\\large\\bfseries\\color{executive}}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}
\\newcommand{\\skillTag}[1]{\\fbox{\\color{executive}#1}}
\\newcommand{\\highlight}[1]{\\color{executive}#1}

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

% Executive itemize environment
\\newenvironment{resumeItemize}{
    \\begin{itemize}[leftmargin=*, itemsep=0.1em, parsep=0em]
}{
    \\end{itemize}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}
\\setlength{\\parskip}{0.5em}

`,
            footer: `
\\end{document}`,
            sectionSpacing: '\\vspace{0.5em}',
            itemSpacing: '\\vspace{0.25em}'
        };
    }

    /**
     * Get creative template configuration
     * @returns {Object} Template configuration
     */
    getCreativeTemplate() {
        return {
            name: 'Creative',
            description: 'Innovative design with creative elements and modern aesthetics',
            features: ['Creative design', 'Modern aesthetics', 'Visual appeal', 'Unique layout'],
            header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fontawesome}
\\usepackage{parskip}
\\usepackage{tikz}

\\geometry{margin=0.75in}

% Creative color scheme
\\definecolor{creative}{HTML}{7c3aed}
\\definecolor{accent}{HTML}{a855f7}
\\definecolor{text}{HTML}{374151}
\\definecolor{light}{HTML}{f3f4f6}

% Creative section formatting
\\titleformat{\\section}{\\Large\\bfseries\\color{creative}}{}{0em}{}[\\color{accent}\\rule{0.3\\textwidth}{2pt}]
\\titleformat{\\subsection}{\\large\\bfseries\\color{creative}}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}
\\newcommand{\\skillTag}[1]{\\tikz\\node[draw, rounded corners, fill=light, text=creative, inner sep=0.3em]{#1};}
\\newcommand{\\highlight}[1]{\\color{creative}#1}

% Creative header
\\newcommand{\\resumeHeader}[1]{
    \\begin{center}
        \\begin{tikzpicture}
            \\node[fill=creative, text=white, rounded corners, inner sep=1em]{\\Huge\\bfseries#1};
        \\end{tikzpicture}\\\\[1em]
    \\end{center}
}

% Creative contact info
\\newcommand{\\contactInfo}[1]{
    \\begin{center}
        {\\large\\color{text}#1}\\\\[1em]
    \\end{center}
}

% Creative itemize environment
\\newenvironment{resumeItemize}{
    \\begin{itemize}[leftmargin=*, itemsep=0.1em, parsep=0em]
}{
    \\end{itemize}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}
\\setlength{\\parskip}{0.5em}

`,
            footer: `
\\end{document}`,
            sectionSpacing: '\\vspace{0.5em}',
            itemSpacing: '\\vspace{0.25em}'
        };
    }

    /**
     * Get minimal template configuration
     * @returns {Object} Template configuration
     */
    getMinimalTemplate() {
        return {
            name: 'Minimal',
            description: 'Clean, minimal design focusing on content and readability',
            features: ['Minimal design', 'Clean layout', 'High readability', 'Content focused'],
            header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{parskip}

\\geometry{margin=1in}

% Minimal formatting
\\titleformat{\\section}{\\Large\\bfseries}{}{0em}{}
\\titleformat{\\subsection}{\\large\\bfseries}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}

% Minimal header
\\newcommand{\\resumeHeader}[1]{
    \\begin{center}
        {\\Huge\\bfseries#1}\\\\[0.5em]
    \\end{center}
}

% Minimal contact info
\\newcommand{\\contactInfo}[1]{
    \\begin{center}
        {\\large#1}\\\\[1em]
    \\end{center}
}

% Minimal itemize environment
\\newenvironment{resumeItemize}{
    \\begin{itemize}[leftmargin=*, itemsep=0.1em, parsep=0em]
}{
    \\end{itemize}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}
\\setlength{\\parskip}{0.4em}

`,
            footer: `
\\end{document}`,
            sectionSpacing: '\\vspace{0.4em}',
            itemSpacing: '\\vspace{0.2em}'
        };
    }

    /**
     * Get technical template configuration
     * @returns {Object} Template configuration
     */
    getTechnicalTemplate() {
        return {
            name: 'Technical',
            description: 'Technical-focused design for engineering and technical roles',
            features: ['Technical focus', 'Code-friendly', 'Engineering style', 'Professional'],
            header: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fontawesome}
\\usepackage{parskip}
\\usepackage{listings}

\\geometry{margin=0.75in}

% Technical color scheme
\\definecolor{tech}{HTML}{059669}
\\definecolor{accent}{HTML}{10b981}
\\definecolor{text}{HTML}{1f2937}
\\definecolor{codebg}{HTML}{f8fafc}

% Technical section formatting
\\titleformat{\\section}{\\Large\\bfseries\\color{tech}}{}{0em}{}[\\color{accent}\\rule{0.4\\textwidth}{3pt}]
\\titleformat{\\subsection}{\\large\\bfseries\\color{tech}}{}{0em}{}

% Custom commands
\\newcommand{\\resumeSection}[1]{\\section*{#1}}
\\newcommand{\\resumeSubsection}[1]{\\subsection*{#1}}
\\newcommand{\\resumeItem}[2]{\\item \\textbf{#1}: #2}
\\newcommand{\\skillTag}[1]{\\fbox{\\color{tech}#1}}
\\newcommand{\\highlight}[1]{\\color{tech}#1}
\\newcommand{\\code}[1]{\\texttt{\\colorbox{codebg}{#1}}}

% Technical header
\\newcommand{\\resumeHeader}[1]{
    \\begin{center}
        {\\Huge\\bfseries\\color{tech}#1}\\\\[0.5em]
    \\end{center}
}

% Technical contact info
\\newcommand{\\contactInfo}[1]{
    \\begin{center}
        {\\large\\color{text}#1}\\\\[1em]
    \\end{center}
}

% Technical itemize environment
\\newenvironment{resumeItemize}{
    \\begin{itemize}[leftmargin=*, itemsep=0.1em, parsep=0em]
}{
    \\end{itemize}
}

\\begin{document}

\\pagestyle{empty}
\\thispagestyle{empty}
\\setlength{\\parskip}{0.5em}

`,
            footer: `
\\end{document}`,
            sectionSpacing: '\\vspace{0.5em}',
            itemSpacing: '\\vspace{0.25em}'
        };
    }

    /**
     * Get template by name
     * @param {string} templateName - Name of the template
     * @returns {Object} Template configuration or null if not found
     */
    getTemplate(templateName) {
        return this.templates[templateName] || null;
    }

    /**
     * Get all available template names
     * @returns {Array} Array of template names
     */
    getTemplateNames() {
        return Object.keys(this.templates);
    }

    /**
     * Get template preview information
     * @param {string} templateName - Template name
     * @returns {Object} Template preview data
     */
    getTemplatePreview(templateName) {
        const template = this.getTemplate(templateName);
        if (!template) return null;

        return {
            name: template.name,
            description: template.description,
            features: template.features,
            previewClass: `${templateName}-preview`
        };
    }

    /**
     * Validate template configuration
     * @param {Object} template - Template configuration to validate
     * @returns {boolean} True if valid
     */
    validateTemplate(template) {
        const requiredFields = ['name', 'description', 'features', 'header', 'footer', 'sectionSpacing', 'itemSpacing'];
        
        for (const field of requiredFields) {
            if (!(field in template)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Create custom template
     * @param {Object} config - Template configuration
     * @returns {Object} Custom template or null if invalid
     */
    createCustomTemplate(config) {
        if (!this.validateTemplate(config)) {
            return null;
        }

        const customTemplate = {
            ...config,
            isCustom: true,
            created: new Date().toISOString()
        };

        return customTemplate;
    }

    /**
     * Get template statistics
     * @returns {Object} Template statistics
     */
    getTemplateStats() {
        const stats = {
            total: Object.keys(this.templates).length,
            custom: 0,
            builtin: 0,
            categories: {
                professional: 0,
                creative: 0,
                technical: 0,
                minimal: 0
            }
        };

        Object.values(this.templates).forEach(template => {
            if (template.isCustom) {
                stats.custom++;
            } else {
                stats.builtin++;
            }

            // Categorize templates
            if (template.name.includes('Modern') || template.name.includes('Executive') || template.name.includes('ATS')) {
                stats.categories.professional++;
            } else if (template.name.includes('Creative')) {
                stats.categories.creative++;
            } else if (template.name.includes('Technical')) {
                stats.categories.technical++;
            } else if (template.name.includes('Minimal')) {
                stats.categories.minimal++;
            }
        });

        return stats;
    }

    /**
     * Export template to JSON
     * @param {string} templateName - Template name to export
     * @returns {string} JSON string representation
     */
    exportTemplate(templateName) {
        const template = this.getTemplate(templateName);
        if (!template) return null;

        return JSON.stringify(template, null, 2);
    }

    /**
     * Import template from JSON
     * @param {string} jsonString - JSON string representation
     * @returns {Object} Imported template or null if invalid
     */
    importTemplate(jsonString) {
        try {
            const template = JSON.parse(jsonString);
            if (this.validateTemplate(template)) {
                return template;
            }
        } catch (error) {
            console.error('Failed to import template:', error);
        }

        return null;
    }

    /**
     * Get template recommendations based on industry
     * @param {string} industry - Industry type
     * @returns {Array} Array of recommended template names
     */
    getTemplateRecommendations(industry) {
        const recommendations = {
            'software-engineering': ['technical', 'modern', 'ats'],
            'data-science': ['technical', 'modern', 'executive'],
            'marketing': ['creative', 'modern', 'executive'],
            'sales': ['executive', 'modern', 'ats'],
            'finance': ['executive', 'modern', 'ats'],
            'healthcare': ['ats', 'modern', 'executive'],
            'education': ['modern', 'ats', 'minimal'],
            'design': ['creative', 'modern', 'minimal'],
            'consulting': ['executive', 'modern', 'ats'],
            'other': ['modern', 'ats', 'minimal']
        };

        return recommendations[industry] || ['modern', 'ats', 'minimal'];
    }

    /**
     * Get template comparison
     * @param {Array} templateNames - Array of template names to compare
     * @returns {Object} Comparison data
     */
    compareTemplates(templateNames) {
        const comparison = {
            templates: [],
            features: {},
            recommendations: {}
        };

        templateNames.forEach(name => {
            const template = this.getTemplate(name);
            if (template) {
                comparison.templates.push({
                    name: template.name,
                    description: template.description,
                    features: template.features
                });

                // Build feature comparison
                template.features.forEach(feature => {
                    if (!comparison.features[feature]) {
                        comparison.features[feature] = [];
                    }
                    comparison.features[feature].push(template.name);
                });
            }
        });

        // Generate recommendations
        comparison.recommendations = {
            bestOverall: comparison.templates[0]?.name || 'modern',
            mostFeatures: comparison.templates.reduce((best, current) => 
                current.features.length > best.features.length ? current : best
            )?.name || 'modern',
            mostProfessional: comparison.templates.find(t => 
                t.name.includes('Executive') || t.name.includes('Modern')
            )?.name || 'modern'
        };

        return comparison;
    }
}

// Create global instance
window.latexTemplates = new LaTeXTemplates();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaTeXTemplates;
}

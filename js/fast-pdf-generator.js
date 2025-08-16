/**
 * Fast PDF Generator
 * Ultra-optimized PDF generation for speed
 */

class FastPDFGenerator {
    constructor() {
        this.isReady = false;
        this.initializeJsPDF();
    }

    async initializeJsPDF() {
        // Ensure jsPDF is loaded
        if (typeof window.jsPDF !== 'undefined') {
            this.isReady = true;
        } else {
            // Wait for jsPDF to load
            let attempts = 0;
            const checkInterval = setInterval(() => {
                if (typeof window.jsPDF !== 'undefined') {
                    this.isReady = true;
                    clearInterval(checkInterval);
                } else if (attempts++ > 50) { // 5 second timeout
                    clearInterval(checkInterval);
                    console.error('jsPDF failed to load');
                }
            }, 100);
        }
    }

    /**
     * Generate PDF quickly with minimal processing
     * @param {Object} resume - Resume data
     * @param {string} template - Template style
     * @returns {Promise<Blob>} PDF blob
     */
    async generatePDF(resume, template = 'modern') {
        return new Promise((resolve, reject) => {
            try {
                if (!this.isReady) {
                    reject(new Error('PDF generator not ready'));
                    return;
                }

                // Use requestIdleCallback for non-blocking generation
                if (window.requestIdleCallback) {
                    requestIdleCallback(() => this.createFastPDF(resume, template, resolve, reject));
                } else {
                    // Fallback for browsers without requestIdleCallback
                    setTimeout(() => this.createFastPDF(resume, template, resolve, reject), 0);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    createFastPDF(resume, template, resolve, reject) {
        try {
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();

            // Fast template settings
            const config = this.getTemplateConfig(template);
            let y = 20;
            
            // Cache commonly used settings
            let currentFontSize = 0;
            let currentFontWeight = '';
            let currentColor = null;

            // Helper for fast text addition
            const addText = (text, size, weight = 'normal', indent = 0) => {
                if (!text) return;
                
                // Only update font settings if changed
                if (currentFontSize !== size) {
                    doc.setFontSize(size);
                    currentFontSize = size;
                }
                if (currentFontWeight !== weight) {
                    doc.setFont('helvetica', weight);
                    currentFontWeight = weight;
                }
                if (JSON.stringify(currentColor) !== JSON.stringify(config.textColor)) {
                    doc.setTextColor(config.textColor);
                    currentColor = config.textColor;
                }
                
                // Quick line wrapping without complex calculations
                const maxWidth = 170 - indent;
                if (text.length > maxWidth / 2) { // Rough estimate
                    const words = text.split(' ');
                    let line = '';
                    for (const word of words) {
                        if ((line + word).length < maxWidth / 2) {
                            line += (line ? ' ' : '') + word;
                        } else {
                            if (line) {
                                doc.text(line, 20 + indent, y);
                                y += config.lineHeight;
                                line = word;
                            }
                        }
                    }
                    if (line) {
                        doc.text(line, 20 + indent, y);
                        y += config.lineHeight;
                    }
                } else {
                    doc.text(text, 20 + indent, y);
                    y += config.lineHeight;
                }
            };

            const addSection = (title) => {
                y += 5;
                doc.setFontSize(config.sectionSize);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(config.primaryColor);
                doc.text(title, 20, y);
                y += config.sectionSpacing;
                doc.setTextColor(config.textColor);
            };

            // Quick page break check
            const checkPage = () => {
                if (y > 750) {
                    doc.addPage();
                    y = 20;
                }
            };

            // HEADER - Name only
            if (resume.personalInfo?.name) {
                doc.setFontSize(config.nameSize);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(config.primaryColor);
                doc.text(resume.personalInfo.name, 20, y);
                y += config.nameSpacing;

                // Contact info in one line
                const contacts = [
                    resume.personalInfo.email,
                    resume.personalInfo.phone,
                    resume.personalInfo.location
                ].filter(Boolean);
                
                if (contacts.length > 0) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(config.contactColor);
                    doc.text(contacts.join(' | '), 20, y);
                    y += 15;
                }
            }

            // SUMMARY - Simple paragraph
            if (resume.summary) {
                addSection('SUMMARY');
                addText(resume.summary, 10);
                y += 5;
            }

            // EXPERIENCE - Simplified
            if (resume.experience?.length > 0) {
                checkPage();
                addSection('EXPERIENCE');
                
                resume.experience.forEach((exp, index) => {
                    checkPage();
                    
                    // Job title and company on separate lines
                    if (exp.title) {
                        addText(exp.title, 11, 'bold');
                    }
                    if (exp.company) {
                        const companyLine = [exp.company, exp.location, 
                            (exp.startDate || exp.endDate) ? `${exp.startDate || ''} - ${exp.endDate || 'Present'}` : ''
                        ].filter(Boolean).join(' | ');
                        addText(companyLine, 9);
                    }
                    
                    // Only first 3 descriptions for speed
                    if (exp.description?.length > 0) {
                        exp.description.slice(0, 3).forEach(desc => {
                            addText(`• ${desc}`, 9, 'normal', 5);
                        });
                    }
                    
                    if (index < resume.experience.length - 1) y += 5;
                });
            }

            // EDUCATION - One line per degree
            if (resume.education?.length > 0) {
                checkPage();
                addSection('EDUCATION');
                
                resume.education.forEach(edu => {
                    const eduLine = [edu.degree, edu.institution, edu.graduationDate].filter(Boolean).join(' | ');
                    addText(eduLine, 10);
                });
                y += 5;
            }

            // SKILLS - Comma separated lists
            if (resume.skills) {
                checkPage();
                addSection('SKILLS');
                
                if (resume.skills.technical?.length > 0) {
                    addText(`Technical: ${resume.skills.technical.join(', ')}`, 10);
                }
                if (resume.skills.soft?.length > 0) {
                    addText(`Soft Skills: ${resume.skills.soft.join(', ')}`, 10);
                }
                if (resume.skills.languages?.length > 0) {
                    addText(`Languages: ${resume.skills.languages.join(', ')}`, 10);
                }
            }

            // PROJECTS - Title and description only
            if (resume.projects?.length > 0) {
                checkPage();
                addSection('PROJECTS');
                
                resume.projects.slice(0, 3).forEach(project => { // Limit to 3 for speed
                    if (project.name) {
                        addText(project.name, 10, 'bold');
                    }
                    if (project.description) {
                        addText(project.description, 9);
                    }
                    y += 3;
                });
            }

            // Generate and resolve immediately
            const pdfBlob = doc.output('blob');
            resolve(pdfBlob);

        } catch (error) {
            reject(new Error(`Fast PDF generation failed: ${error.message}`));
        }
    }

    getTemplateConfig(template) {
        const configs = {
            modern: {
                primaryColor: [37, 99, 235],
                textColor: [0, 0, 0],
                contactColor: [100, 100, 100],
                nameSize: 20,
                sectionSize: 12,
                nameSpacing: 10,
                sectionSpacing: 8,
                lineHeight: 6
            },
            ats: {
                primaryColor: [0, 0, 0],
                textColor: [0, 0, 0],
                contactColor: [60, 60, 60],
                nameSize: 18,
                sectionSize: 11,
                nameSpacing: 8,
                sectionSpacing: 6,
                lineHeight: 5
            },
            executive: {
                primaryColor: [30, 41, 59],
                textColor: [0, 0, 0],
                contactColor: [71, 85, 105],
                nameSize: 22,
                sectionSize: 13,
                nameSpacing: 12,
                sectionSpacing: 10,
                lineHeight: 7
            }
        };
        
        return configs[template] || configs.modern;
    }
}

// Create global instance
window.fastPdfGenerator = new FastPDFGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FastPDFGenerator;
}
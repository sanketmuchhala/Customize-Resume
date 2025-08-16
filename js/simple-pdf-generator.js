/**
 * Simple PDF Generator
 * A reliable PDF generation solution using jsPDF
 */

class SimplePDFGenerator {
    constructor() {
        this.loadJsPDF();
    }

    async loadJsPDF() {
        // jsPDF will be loaded from the script tag in HTML
        console.log('SimplePDFGenerator initialized');
    }

    /**
     * Generate PDF from resume data
     * @param {Object} resume - Resume data
     * @param {string} template - Template style (modern, ats, executive)
     * @returns {Promise<Blob>} PDF blob
     */
    async generatePDF(resume, template = 'modern') {
        return new Promise((resolve, reject) => {
            try {
                // Optimize: Use requestAnimationFrame for better performance
                requestAnimationFrame(() => {
                    const checkJsPDF = () => {
                        if (typeof window.jsPDF !== 'undefined') {
                            // Use setTimeout to prevent blocking UI
                            setTimeout(() => this.createPDF(resume, template, resolve, reject), 0);
                        } else if (typeof window.jspdf !== 'undefined') {
                            window.jsPDF = window.jspdf;
                            setTimeout(() => this.createPDF(resume, template, resolve, reject), 0);
                        } else {
                            setTimeout(checkJsPDF, 50); // Reduced wait time
                        }
                    };
                    checkJsPDF();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    createPDF(resume, template, resolve, reject) {
        try {
            let jsPDF;
            
            // Try different ways to access jsPDF
            if (window.jsPDF && window.jsPDF.jsPDF) {
                jsPDF = window.jsPDF.jsPDF;
            } else if (window.jsPDF) {
                jsPDF = window.jsPDF;
            } else if (window.jspdf) {
                jsPDF = window.jspdf.jsPDF || window.jspdf;
            } else {
                throw new Error('jsPDF not loaded');
            }
            
            const doc = new jsPDF();
            
            // Set up styles based on template
            const styles = this.getTemplateStyles(template);
            
            let currentY = 20;
            const margin = 20;
            const lineHeight = 7;
            const pageHeight = doc.internal.pageSize.height;
            
            // Helper function to check page break
            const checkPageBreak = (space = 20) => {
                if (currentY + space > pageHeight - 20) {
                    doc.addPage();
                    currentY = 20;
                }
            };
            
            // Helper to add wrapped text (optimized)
            const addWrappedText = (text, x, fontSize = 10, fontWeight = 'normal', maxWidth = 170) => {
                if (!text || text.length === 0) return;
                
                // Cache font settings to avoid repeated calls
                if (this.lastFontSize !== fontSize || this.lastFontWeight !== fontWeight) {
                    doc.setFontSize(fontSize);
                    doc.setFont('helvetica', fontWeight);
                    this.lastFontSize = fontSize;
                    this.lastFontWeight = fontWeight;
                }
                
                // Optimize text splitting for performance
                const textStr = text.toString();
                const lines = textStr.length > maxWidth ? doc.splitTextToSize(textStr, maxWidth) : [textStr];
                
                // Batch text rendering
                lines.forEach(line => {
                    checkPageBreak();
                    doc.text(line, x, currentY);
                    currentY += lineHeight;
                });
            };
            
            // Add section header
            const addSectionHeader = (title) => {
                checkPageBreak(15);
                currentY += 5;
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(styles.primary.r, styles.primary.g, styles.primary.b);
                doc.text(title, margin, currentY);
                
                // Add underline
                doc.setDrawColor(styles.primary.r, styles.primary.g, styles.primary.b);
                doc.setLineWidth(0.5);
                doc.line(margin, currentY + 2, margin + 60, currentY + 2);
                
                currentY += 10;
            };
            
            // HEADER - Name and Contact
            if (resume.personalInfo?.name) {
                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(styles.primary.r, styles.primary.g, styles.primary.b);
                doc.text(resume.personalInfo.name, margin, currentY);
                currentY += 12;
                
                // Contact info
                const contactParts = [];
                if (resume.personalInfo.email) contactParts.push(resume.personalInfo.email);
                if (resume.personalInfo.phone) contactParts.push(resume.personalInfo.phone);
                if (resume.personalInfo.location) contactParts.push(resume.personalInfo.location);
                if (resume.personalInfo.linkedin) contactParts.push(resume.personalInfo.linkedin);
                
                if (contactParts.length > 0) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    doc.text(contactParts.join(' | '), margin, currentY);
                    currentY += 10;
                }
            }
            
            // SUMMARY
            if (resume.summary) {
                addSectionHeader('PROFESSIONAL SUMMARY');
                doc.setTextColor(0, 0, 0);
                addWrappedText(resume.summary, margin, 10, 'normal');
                currentY += 5;
            }
            
            // EXPERIENCE
            if (resume.experience?.length > 0) {
                addSectionHeader('PROFESSIONAL EXPERIENCE');
                
                resume.experience.forEach((exp, index) => {
                    checkPageBreak(25);
                    
                    // Job title
                    if (exp.title) {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 0, 0);
                        doc.text(exp.title, margin, currentY);
                        currentY += 7;
                    }
                    
                    // Company and dates
                    if (exp.company) {
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(80, 80, 80);
                        
                        let companyLine = exp.company;
                        if (exp.location) companyLine += ` | ${exp.location}`;
                        if (exp.startDate || exp.endDate) {
                            companyLine += ` | ${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
                        }
                        
                        doc.text(companyLine, margin, currentY);
                        currentY += 8;
                    }
                    
                    // Description bullets
                    if (exp.description?.length > 0) {
                        doc.setTextColor(0, 0, 0);
                        exp.description.forEach(desc => {
                            addWrappedText(`• ${desc}`, margin + 5, 10, 'normal');
                        });
                    }
                    
                    // Achievements
                    if (exp.achievements?.length > 0) {
                        exp.achievements.forEach(achievement => {
                            addWrappedText(`• ${achievement}`, margin + 5, 10, 'normal');
                        });
                    }
                    
                    if (index < resume.experience.length - 1) currentY += 8;
                });
            }
            
            // EDUCATION
            if (resume.education?.length > 0) {
                addSectionHeader('EDUCATION');
                
                resume.education.forEach(edu => {
                    checkPageBreak(15);
                    
                    if (edu.degree) {
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 0, 0);
                        doc.text(edu.degree, margin, currentY);
                        currentY += 7;
                    }
                    
                    if (edu.institution) {
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(80, 80, 80);
                        
                        let eduLine = edu.institution;
                        if (edu.location) eduLine += ` | ${edu.location}`;
                        if (edu.graduationDate) eduLine += ` | ${edu.graduationDate}`;
                        if (edu.gpa) eduLine += ` | GPA: ${edu.gpa}`;
                        
                        doc.text(eduLine, margin, currentY);
                        currentY += 8;
                    }
                });
            }
            
            // SKILLS
            if (resume.skills) {
                addSectionHeader('SKILLS');
                doc.setTextColor(0, 0, 0);
                
                if (resume.skills.technical?.length > 0) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Technical Skills:', margin, currentY);
                    currentY += 6;
                    
                    doc.setFont('helvetica', 'normal');
                    addWrappedText(resume.skills.technical.join(', '), margin, 10, 'normal');
                    currentY += 3;
                }
                
                if (resume.skills.soft?.length > 0) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Soft Skills:', margin, currentY);
                    currentY += 6;
                    
                    doc.setFont('helvetica', 'normal');
                    addWrappedText(resume.skills.soft.join(', '), margin, 10, 'normal');
                    currentY += 3;
                }
                
                if (resume.skills.languages?.length > 0) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Languages:', margin, currentY);
                    currentY += 6;
                    
                    doc.setFont('helvetica', 'normal');
                    addWrappedText(resume.skills.languages.join(', '), margin, 10, 'normal');
                }
            }
            
            // PROJECTS
            if (resume.projects?.length > 0) {
                addSectionHeader('PROJECTS');
                
                resume.projects.forEach(project => {
                    checkPageBreak(20);
                    
                    if (project.name) {
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(0, 0, 0);
                        doc.text(project.name, margin, currentY);
                        currentY += 7;
                    }
                    
                    if (project.description) {
                        doc.setFont('helvetica', 'normal');
                        addWrappedText(project.description, margin, 10, 'normal');
                    }
                    
                    if (project.technologies?.length > 0) {
                        doc.setFontSize(9);
                        doc.setTextColor(80, 80, 80);
                        addWrappedText(`Technologies: ${project.technologies.join(', ')}`, margin, 9, 'normal');
                    }
                    
                    currentY += 5;
                });
            }
            
            // Convert to blob and resolve
            const pdfBlob = doc.output('blob');
            resolve(pdfBlob);
            
        } catch (error) {
            console.error('PDF creation error:', error);
            reject(new Error(`PDF generation failed: ${error.message}`));
        }
    }
    
    getTemplateStyles(template) {
        const styles = {
            modern: {
                primary: { r: 37, g: 99, b: 235 }  // Blue
            },
            ats: {
                primary: { r: 0, g: 0, b: 0 }      // Black
            },
            executive: {
                primary: { r: 30, g: 41, b: 59 }  // Dark blue
            }
        };
        
        return styles[template] || styles.modern;
    }
}

// Create global instance
window.simplePdfGenerator = new SimplePDFGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimplePDFGenerator;
}
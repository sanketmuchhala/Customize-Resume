/**
 * Instant PDF Generator
 * For immediate preview generation with minimal features
 */

class InstantPDF {
    static generatePreview(resume) {
        if (typeof window.jsPDF === 'undefined') {
            throw new Error('jsPDF not available');
        }

        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        let y = 20;
        
        // Name
        if (resume.personalInfo?.name) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(resume.personalInfo.name, 20, y);
            y += 10;
        }
        
        // Contact
        if (resume.personalInfo?.email) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(resume.personalInfo.email + ' | ' + (resume.personalInfo.phone || ''), 20, y);
            y += 15;
        }
        
        // Summary
        if (resume.summary) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('SUMMARY', 20, y);
            y += 8;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const summaryLines = doc.splitTextToSize(resume.summary, 170);
            summaryLines.forEach(line => {
                doc.text(line, 20, y);
                y += 5;
            });
            y += 10;
        }
        
        // Experience
        if (resume.experience?.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('EXPERIENCE', 20, y);
            y += 8;
            
            resume.experience.slice(0, 2).forEach(exp => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(exp.title || 'Position', 20, y);
                y += 6;
                
                doc.setFont('helvetica', 'normal');
                doc.text(exp.company || 'Company', 20, y);
                y += 8;
            });
        }
        
        return doc.output('blob');
    }
}

window.InstantPDF = InstantPDF;
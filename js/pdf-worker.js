/**
 * PDF Generation Web Worker
 * Handles PDF generation in a separate thread to prevent UI blocking
 */

// Import jsPDF in worker context
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

self.onmessage = function(e) {
    const { resume, template, id } = e.data;
    
    try {
        // Generate PDF using the same logic as SimplePDFGenerator
        const pdfBlob = generatePDF(resume, template);
        
        // Send result back to main thread
        self.postMessage({
            success: true,
            id: id,
            pdfBlob: pdfBlob
        });
    } catch (error) {
        self.postMessage({
            success: false,
            id: id,
            error: error.message
        });
    }
};

function generatePDF(resume, template) {
    const { jsPDF } = self.jspdf;
    const doc = new jsPDF();
    
    // Simplified PDF generation for worker
    let currentY = 20;
    const margin = 20;
    const lineHeight = 7;
    
    // Add content efficiently
    if (resume.personalInfo?.name) {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(resume.personalInfo.name, margin, currentY);
        currentY += 15;
    }
    
    if (resume.personalInfo?.email) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const contact = [
            resume.personalInfo.email,
            resume.personalInfo.phone,
            resume.personalInfo.location
        ].filter(Boolean).join(' | ');
        doc.text(contact, margin, currentY);
        currentY += 15;
    }
    
    // Add other sections with minimal processing
    const sections = [
        { key: 'summary', title: 'PROFESSIONAL SUMMARY' },
        { key: 'experience', title: 'EXPERIENCE' },
        { key: 'education', title: 'EDUCATION' },
        { key: 'skills', title: 'SKILLS' }
    ];
    
    sections.forEach(section => {
        if (resume[section.key]) {
            // Add section header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, margin, currentY);
            currentY += 10;
            
            // Add content
            if (typeof resume[section.key] === 'string') {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const lines = doc.splitTextToSize(resume[section.key], 170);
                lines.forEach(line => {
                    doc.text(line, margin, currentY);
                    currentY += lineHeight;
                });
            } else if (Array.isArray(resume[section.key])) {
                resume[section.key].forEach(item => {
                    if (typeof item === 'string') {
                        doc.text(item, margin, currentY);
                        currentY += lineHeight;
                    } else if (item.title || item.name) {
                        doc.setFont('helvetica', 'bold');
                        doc.text(item.title || item.name, margin, currentY);
                        currentY += lineHeight;
                        doc.setFont('helvetica', 'normal');
                    }
                });
            }
            currentY += 10;
        }
    });
    
    return doc.output('blob');
}
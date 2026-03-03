// =====================================================
//  certificate.js  —  Ravionus Learn
//  Generates a styled PDF certificate using jsPDF
// =====================================================

/**
 * Generates and downloads a course completion certificate as a PDF.
 * jsPDF is loaded via CDN in the HTML — no build tool needed.
 *
 * @param {string} userName    The learner's display name
 * @param {string} topicTitle  Title of the completed topic
 * @param {string} dateStr     Formatted completion date (e.g. "3 March 2026")
 * @param {string} certId      Unique certificate ID from Firestore
 */
export function generateCertificate(userName, topicTitle, dateStr, certId) {
    // jsPDF is attached to window by the CDN script
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = 297; // A4 landscape width  (mm)
    const H = 210; // A4 landscape height (mm)

    // ── Background ───────────────────────────────────────
    // Dark gradient-like base
    doc.setFillColor(10, 10, 20);
    doc.rect(0, 0, W, H, 'F');

    // Subtle top accent strip
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 0, W, 4, 'F');

    // Bottom accent strip
    doc.setFillColor(99, 102, 241);
    doc.rect(0, H - 4, W, 4, 'F');

    // Side accents
    doc.rect(0, 0, 4, H, 'F');
    doc.rect(W - 4, 0, 4, H, 'F');

    // Inner border glow (thin line)
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, W - 20, H - 20);

    // ── Watermark circle ─────────────────────────────────
    doc.setFillColor(99, 102, 241, 0.05);
    doc.setDrawColor(60, 60, 90);
    doc.setLineWidth(0.3);
    doc.circle(W / 2, H / 2, 70, 'S');
    doc.circle(W / 2, H / 2, 75, 'S');

    // ── Logo / brand ──────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(160, 160, 200);
    doc.text('RAVIONUS', W / 2, 26, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 160);
    doc.text('L E A R N', W / 2, 31, { align: 'center' });

    // Thin separator line
    doc.setDrawColor(80, 80, 120);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - 40, 35, W / 2 + 40, 35);

    // ── Main heading ─────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 220);
    doc.text('Certificate of Completion', W / 2, 47, { align: 'center' });

    // ── "This certifies that" ─────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(140, 140, 180);
    doc.text('This certifies that', W / 2, 62, { align: 'center' });

    // ── Learner name ─────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(230, 230, 255);
    doc.text(userName, W / 2, 80, { align: 'center' });

    // Name underline
    const nameWidth = doc.getTextWidth(userName);
    const nameX = W / 2 - nameWidth / 2;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.6);
    doc.line(nameX, 83, nameX + nameWidth, 83);

    // ── "has successfully completed" ─────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(140, 140, 180);
    doc.text('has successfully completed the course', W / 2, 96, { align: 'center' });

    // ── Course title ─────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(167, 139, 250); // violet-400
    doc.text(topicTitle, W / 2, 112, { align: 'center' });

    // ── Date ─────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 160);
    doc.text(`Completed on ${dateStr}`, W / 2, 128, { align: 'center' });

    // ── Decorative stars / dots ───────────────────────────
    doc.setFillColor(167, 139, 250);
    [-30, 0, 30].forEach(offset => {
        doc.circle(W / 2 + offset, 140, 1, 'F');
    });

    // ── Certificate ID (bottom) ───────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 110);
    doc.text(`Certificate ID: ${certId}`, W / 2, H - 16, { align: 'center' });
    doc.text('ravionus.com/learn', W / 2, H - 10, { align: 'center' });

    // ── Save ─────────────────────────────────────────────
    const safeTitle = topicTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    doc.save(`ravionus-certificate-${safeTitle}.pdf`);
}

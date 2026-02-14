/**
 * QR Code Export Utilities
 * Professional PDF and PNG export for attendance QR codes
 */

import jsPDF from 'jspdf';

interface ExportOptions {
    serviceName: string;
    date: string;
    churchName?: string;
}

/**
 * Export QR Code as professional PDF for printing/posting
 */
export async function exportQRCodeToPDF(
    qrElement: HTMLElement | SVGElement,
    options: ExportOptions
): Promise<void> {
    const { serviceName, date, churchName = 'Solution Arena Ministry' } = options;

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header with dark background
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDANCE QR CODE', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('The City of Truth', pageWidth / 2, 32, { align: 'center' });

    // Service info box
    let yPos = 55;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'S');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(serviceName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), pageWidth / 2, yPos + 10, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(formattedDate, pageWidth / 2, yPos + 19, { align: 'center' });

    // QR Code - centered and large
    yPos = 95;
    const qrSize = 120;
    const qrX = (pageWidth - qrSize) / 2;

    // QR Code border/frame
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 5, yPos - 5, qrSize + 10, qrSize + 10, 2, 2, 'F');
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(1);
    doc.roundedRect(qrX - 5, yPos - 5, qrSize + 10, qrSize + 10, 2, 2, 'S');

    // Convert SVG to image and add to PDF
    const qrDataUrl = await svgToDataUrl(qrElement);
    if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', qrX, yPos, qrSize, qrSize);
    }

    // Instructions section
    yPos = 225;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('How to Check In', pageWidth / 2, yPos, { align: 'center' });

    const instructions = [
        '1. Generate unique QR codes for each service',
        '2. Export QR code as image or PDF',
        '3. Open Camera app to scan, no app needed',
        '4. Members choose member or visitor option',
        '5. Members enter phone number or email to check-in',
        '6. Visitors enter name and phone number for verification'
    ];

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    let instructY = yPos + 12;
    instructions.forEach((text) => {
        doc.text(text, pageWidth / 2, instructY, { align: 'center' });
        instructY += 7;
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const footerText = `Solution Arena Ministry 2025 | Church Management System`;
    const genText = `Generated: ${new Date().toLocaleString()}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text(genText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    const fileName = `QR_Code_${serviceName.replace(/[^a-z0-9]/gi, '_')}_${date}.pdf`;
    doc.save(fileName);
}

/**
 * Export QR Code as PNG image
 */
export async function exportQRCodeToPNG(
    qrElement: HTMLElement | SVGElement,
    options: ExportOptions
): Promise<void> {
    const { serviceName, date, churchName = 'Solution Arena Ministry' } = options;

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create a canvas for professional output
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Set canvas size (800x1000px for high quality)
    canvas.width = 800;
    canvas.height = 1000;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, 120);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ATTENDANCE QR CODE', canvas.width / 2, 55);

    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('The City of Truth', canvas.width / 2, 95);

    // Service info box
    let yPos = 150;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    roundRect(ctx, 40, yPos, canvas.width - 80, 80, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(serviceName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), canvas.width / 2, yPos + 35);

    ctx.fillStyle = '#64748b';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(formattedDate, canvas.width / 2, yPos + 62);

    // QR Code - centered
    yPos = 260;
    const qrSize = 400;
    const qrX = (canvas.width - qrSize) / 2;

    // QR Code border
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    roundRect(ctx, qrX - 10, yPos - 10, qrSize + 20, qrSize + 20, 8);
    ctx.fill();
    ctx.stroke();

    // Draw QR code
    const qrImage = await svgToImage(qrElement);
    if (qrImage) {
        ctx.drawImage(qrImage, qrX, yPos, qrSize, qrSize);
    }

    // Instructions section
    yPos = 690;
    ctx.fillStyle = '#ffffff'; // White background for instructions in PNG
    roundRect(ctx, 40, yPos, canvas.width - 80, 260, 8);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('How to Check In', canvas.width / 2, yPos + 40);

    const instructions = [
        '1. Generate unique QR codes for each service',
        '2. Export QR code as image or PDF',
        '3. Open Camera app to scan, no app needed',
        '4. Members choose member or visitor option',
        '5. Members enter phone number or email to check-in',
        '6. Visitors enter name and phone number for verification'
    ];

    ctx.fillStyle = '#475569';
    ctx.font = '20px Arial, sans-serif';
    let instructY = yPos + 85;
    instructions.forEach(instruction => {
        ctx.fillText(instruction, canvas.width / 2, instructY);
        instructY += 32;
    });

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Solution Arena Ministry 2025 | Church Management System`, canvas.width / 2, canvas.height - 45);
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 20);

    // Download PNG
    canvas.toBlob(blob => {
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `QR-Code-${serviceName.replace(/\s+/g, '-')}-${date}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
}

/**
 * Helper function to draw rounded rectangles
 */
function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Convert SVG element to data URL
 */
async function svgToDataUrl(element: HTMLElement | SVGElement): Promise<string | null> {
    try {
        const svgElement = element.querySelector('svg') || element;
        if (!(svgElement instanceof SVGElement)) {
            console.error('No SVG element found');
            return null;
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width || 250;
                canvas.height = img.height || 250;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    resolve(null);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.src = url;
        });
    } catch (error) {
        console.error('Error converting SVG to data URL:', error);
        return null;
    }
}

/**
 * Convert SVG element to Image
 */
async function svgToImage(element: HTMLElement | SVGElement): Promise<HTMLImageElement | null> {
    try {
        const dataUrl = await svgToDataUrl(element);
        if (!dataUrl) return null;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = dataUrl;
        });
    } catch (error) {
        console.error('Error converting SVG to image:', error);
        return null;
    }
}

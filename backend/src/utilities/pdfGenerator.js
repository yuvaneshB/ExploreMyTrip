import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Generate Invoice PDF
export const generateInvoicePDF = (invoice, booking, user, tour, savePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // Ensure directory exists
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(savePath);
      doc.pipe(writeStream);

      // Header Branding
      doc.fillColor('#0f172a').fontSize(24).text('ExploreMyTrip Ltd.', 50, 50);
      doc.fontSize(10).fillColor('#64748b').text('Premium Travel & SaaS Solutions', 50, 75);
      doc.text('Email: billing@exploremytrip.com | Phone: +1 555 999 1234', 50, 90);
      
      // Invoice Info Right side
      doc.fillColor('#0f172a').fontSize(14).text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10).fillColor('#64748b').text(`Invoice #: ${invoice.invoiceNumber}`, 400, 70, { align: 'right' });
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, 85, { align: 'right' });
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 400, 100, { align: 'right' });

      doc.moveDown(2);
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

      // Bill To & Booking Info
      doc.moveDown(1.5);
      doc.fillColor('#0f172a').fontSize(12).text('BILL TO:', 50, 140);
      doc.fontSize(10).fillColor('#475569').text(`Customer Name: ${user.name}`, 50, 160);
      doc.text(`Email: ${user.email}`, 50, 175);
      
      doc.fillColor('#0f172a').fontSize(12).text('BOOKING DETAILS:', 300, 140);
      doc.fontSize(10).fillColor('#475569').text(`Tour Name: ${tour.title}`, 300, 160);
      doc.text(`Departure Date: ${new Date(booking.departureDate).toLocaleDateString()}`, 300, 175);
      doc.text(`Pricing Plan: ${booking.pricingPlanName}`, 300, 190);
      doc.text(`Seats Booked: ${booking.numSeats}`, 300, 205);

      doc.moveDown(2);
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, 230).lineTo(550, 230).stroke();

      // Billing Table
      doc.moveDown(2);
      doc.fillColor('#0f172a').fontSize(11).text('Description', 50, 250);
      doc.text('Qty', 350, 250, { width: 50, align: 'right' });
      doc.text('Rate', 420, 250, { width: 50, align: 'right' });
      doc.text('Total', 490, 250, { width: 60, align: 'right' });

      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, 265).lineTo(550, 265).stroke();

      // Table Row
      doc.fontSize(10).fillColor('#475569').text(`${tour.title} - ${booking.pricingPlanName} Plan`, 50, 280);
      doc.text(`${booking.numSeats}`, 350, 280, { width: 50, align: 'right' });
      doc.text(`$${booking.subTotal / booking.numSeats}`, 420, 280, { width: 50, align: 'right' });
      doc.text(`$${booking.subTotal}`, 490, 280, { width: 60, align: 'right' });

      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, 300).lineTo(550, 300).stroke();

      // Calculation summary
      let currentY = 320;
      doc.text('Subtotal:', 350, currentY, { width: 120, align: 'right' });
      doc.text(`$${invoice.subTotal}`, 490, currentY, { width: 60, align: 'right' });

      currentY += 15;
      doc.text('Discount:', 350, currentY, { width: 120, align: 'right' });
      doc.text(`-$${invoice.discountAmount}`, 490, currentY, { width: 60, align: 'right' });

      currentY += 15;
      doc.text('Tax (15%):', 350, currentY, { width: 120, align: 'right' });
      doc.text(`$${invoice.taxAmount}`, 490, currentY, { width: 60, align: 'right' });

      currentY += 20;
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(350, currentY).lineTo(550, currentY).stroke();

      currentY += 10;
      doc.fontSize(12).fillColor('#0f172a').text('Total Amount Paid:', 320, currentY, { width: 150, align: 'right' });
      doc.text(`$${invoice.totalAmount}`, 490, currentY, { width: 60, align: 'right' });

      // Footer
      doc.fontSize(8).fillColor('#94a3b8').text('Thank you for choosing ExploreMyTrip! Let us create experiences of a lifetime.', 50, 700, { align: 'center' });

      doc.end();
      
      writeStream.on('finish', () => {
        resolve(savePath);
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

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

// Helper to draw status badges
const drawBadge = (doc, text, x, y, bgColor) => {
  doc.save();
  doc.roundedRect(x, y, 90, 16, 3).fill(bgColor);
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(text, x, y + 4, { width: 90, align: 'center' });
  doc.restore();
};

// Generate E-Ticket PDF
export const generateTicketPDF = (booking, user, tour, payment, savePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(savePath);
      doc.pipe(writeStream);

      // Header Branding
      const logoPath = path.resolve('./frontend/src/assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { height: 35 });
      } else {
        doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(22).text('ExploreMyTrip', 50, 45);
      }

      doc.font('Helvetica-Bold').fillColor('#1e40af').fontSize(24).text('E-TICKET', 200, 40, { width: 195, align: 'center' });
      doc.font('Helvetica-Oblique').fillColor('#64748b').fontSize(8.5).text('Your Journey. Our Promise.', 200, 68, { width: 195, align: 'center' });

      doc.font('Helvetica-Bold').fillColor('#334155').fontSize(8).text('ExploreMyTrip Ltd.', 400, 40, { width: 145, align: 'right' });
      doc.font('Helvetica').fillColor('#64748b').fontSize(7.5)
         .text('Email: support@exploremytrip.com', 400, 52, { width: 145, align: 'right' })
         .text('Phone: +1 555 999 1234', 400, 64, { width: 145, align: 'right' });

      // Blue divider bar
      doc.rect(50, 90, 495, 2.5).fill('#1e40af');

      // Booking Summary Card background & border
      doc.save();
      doc.roundedRect(50, 105, 495, 100, 8).fill('#f8fafc');
      doc.roundedRect(50, 105, 495, 100, 8).lineWidth(0.5).strokeColor('#cbd5e1').stroke();
      doc.restore();

      // Booking Summary Columns
      doc.font('Helvetica-Bold').fillColor('#1e293b').fontSize(8.5);
      const summaryY = 118;
      doc.text('Booking Reference:', 65, summaryY);
      doc.font('Helvetica').fillColor('#475569').text(booking._id.toString().toUpperCase(), 65, summaryY + 12);
      
      doc.font('Helvetica-Bold').fillColor('#1e293b').text('Booking Date:', 65, summaryY + 34);
      doc.font('Helvetica').fillColor('#475569').text(new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 65, summaryY + 46);

      doc.font('Helvetica-Bold').fillColor('#1e293b').text('Total Price Paid:', 65, summaryY + 68);
      doc.font('Helvetica-Bold').fillColor('#1e40af').text(`$${booking.totalAmount} USD`, 65, summaryY + 80);

      doc.font('Helvetica-Bold').fillColor('#1e293b').text('Payment Method:', 240, summaryY);
      doc.font('Helvetica').fillColor('#475569').text(payment?.gateway ? payment.gateway.toUpperCase() : 'MOCK PAYMENT', 240, summaryY + 12);

      doc.font('Helvetica-Bold').fillColor('#1e293b').text('No. of Travellers:', 240, summaryY + 34);
      doc.font('Helvetica').fillColor('#475569').text(`${booking.numSeats} Guest(s)`, 240, summaryY + 46);

      doc.font('Helvetica-Bold').fillColor('#1e293b').text('Booking Status:', 405, summaryY);
      const bookingStatusText = booking.status === 'Cancelled' ? 'CANCELLED' : 'CONFIRMED';
      const bookingStatusColor = booking.status === 'Cancelled' ? '#ef4444' : '#10b981';
      drawBadge(doc, bookingStatusText, 405, summaryY + 12, bookingStatusColor);

      doc.font('Helvetica-Bold').fillColor('#1e293b').text('Payment Status:', 405, summaryY + 44);
      let payText = 'PENDING';
      let payColor = '#f59e0b';
      if (booking.status === 'Fully Paid') {
        payText = 'PAID';
        payColor = '#10b981';
      } else if (booking.status === 'Deposited') {
        payText = 'DEPOSITED';
        payColor = '#3b82f6';
      } else if (booking.status === 'Cancelled') {
        payText = 'VOID';
        payColor = '#64748b';
      }
      drawBadge(doc, payText, 405, summaryY + 56, payColor);

      // Tour Details Section
      doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(11).text('TOUR DETAILS', 50, 220);
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, 235).lineTo(550, 235).stroke();

      const tourY = 245;
      doc.font('Helvetica-Bold').fillColor('#334155').fontSize(9.5).text('Tour / Activity Name:', 50, tourY);
      doc.font('Helvetica').fillColor('#475569').fontSize(9).text(tour.title, 50, tourY + 12, { width: 220 });

      const tourTitleHeight = doc.heightOfString(tour.title, { width: 220 });
      const destY = tourY + 12 + tourTitleHeight + 10;
      doc.font('Helvetica-Bold').fillColor('#334155').fontSize(9.5).text('Destination:', 50, destY);
      const destName = `${tour.city || ''}, ${tour.country || ''}`.replace(/^,\s*/, '') || tour.location || 'Global';
      doc.font('Helvetica').fillColor('#475569').fontSize(9).text(destName, 50, destY + 12, { width: 220 });

      doc.font('Helvetica-Bold').fillColor('#334155').fontSize(9.5).text('Departure Date:', 300, tourY);
      doc.font('Helvetica').fillColor('#475569').fontSize(9).text(new Date(booking.departureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 300, tourY + 12);

      doc.font('Helvetica-Bold').fillColor('#334155').fontSize(9.5).text('Duration & Schedule:', 300, tourY + 34);
      const durationText = `${tour.durationDays} Day(s) (${tour.tourStartTime || '09:00 AM'} Start)`;
      doc.font('Helvetica').fillColor('#475569').fontSize(9).text(durationText, 300, tourY + 46);

      const meetingPointY = tourY + 68;
      doc.font('Helvetica-Bold').fillColor('#334155').fontSize(9.5).text('Meeting Point:', 300, meetingPointY);
      const meetingPointText = tour.location || 'Check inclusions/itinerary for detailed pickup locations.';
      doc.font('Helvetica').fillColor('#475569').fontSize(9).text(meetingPointText, 300, meetingPointY + 12, { width: 220 });

      const destHeight = doc.heightOfString(destName, { width: 220 });
      const leftColumnEndY = destY + 12 + destHeight;
      const meetingPointHeight = doc.heightOfString(meetingPointText, { width: 220 });
      const rightColumnEndY = meetingPointY + 12 + meetingPointHeight;
      let currentY = Math.max(leftColumnEndY, rightColumnEndY) + 20;

      // Passenger Details Section
      if (currentY > 680) {
        doc.addPage();
        currentY = 50;
      }
      doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(11).text('PASSENGER DETAILS', 50, currentY);
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();

      const passHeaderY = currentY + 25;
      doc.font('Helvetica-Bold').fillColor('#475569').fontSize(8.5)
         .text('S.No', 55, passHeaderY)
         .text('Passenger Name', 90, passHeaderY)
         .text('Age', 330, passHeaderY)
         .text('Sex/Gender', 430, passHeaderY);
      
      doc.strokeColor('#cbd5e1').lineWidth(0.25).moveTo(50, passHeaderY + 12).lineTo(550, passHeaderY + 12).stroke();

      currentY = passHeaderY + 20;
      if (booking.travelers && booking.travelers.length > 0) {
        booking.travelers.forEach((traveler, index) => {
          if (currentY > 720) {
            doc.addPage();
            currentY = 50;
            doc.font('Helvetica-Bold').fillColor('#475569').fontSize(8.5)
               .text('S.No', 55, currentY)
               .text('Passenger Name', 90, currentY)
               .text('Age', 330, currentY)
               .text('Sex/Gender', 430, currentY);
            doc.strokeColor('#cbd5e1').lineWidth(0.25).moveTo(50, currentY + 12).lineTo(550, currentY + 12).stroke();
            currentY += 20;
          }
          doc.font('Helvetica').fillColor('#334155').fontSize(8.5)
             .text(String(index + 1), 55, currentY)
             .text(traveler.name, 90, currentY)
             .text(String(traveler.age || 'N/A'), 330, currentY)
             .text(traveler.gender || 'N/A', 430, currentY);
          currentY += 16;
        });
      } else {
        doc.font('Helvetica').fillColor('#334155').fontSize(8.5)
           .text('-', 55, currentY)
           .text('No traveler details registered', 90, currentY)
           .text('-', 330, currentY)
           .text('-', 430, currentY);
        currentY += 16;
      }
      currentY += 15;

      // Inclusions & Exclusions Section (Two Columns)
      const hasInclusions = tour.inclusions && tour.inclusions.length > 0;
      const hasExclusions = tour.exclusions && tour.exclusions.length > 0;

      if (hasInclusions || hasExclusions) {
        if (currentY > 660) {
          doc.addPage();
          currentY = 50;
        }
        doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(11).text('INCLUSIONS & EXCLUSIONS', 50, currentY);
        doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
        currentY += 25;

        let incColY = currentY;
        let excColY = currentY;

        if (hasInclusions) {
          doc.font('Helvetica-Bold').fillColor('#059669').fontSize(9.5).text('INCLUSIONS', 50, incColY);
          incColY += 15;
          tour.inclusions.forEach(item => {
            if (incColY > 740) {
              doc.addPage();
              incColY = 50;
              excColY = 50;
            }
            doc.font('Helvetica').fillColor('#475569').fontSize(8.5).text(`• ${item}`, 50, incColY, { width: 225 });
            incColY += doc.heightOfString(`• ${item}`, { width: 225 }) + 5;
          });
        }

        if (hasExclusions) {
          doc.font('Helvetica-Bold').fillColor('#dc2626').fontSize(9.5).text('EXCLUSIONS', 300, excColY);
          excColY += 15;
          tour.exclusions.forEach(item => {
            if (excColY > 740) {
              doc.addPage();
              incColY = 50;
              excColY = 50;
            }
            doc.font('Helvetica').fillColor('#475569').fontSize(8.5).text(`• ${item}`, 300, excColY, { width: 225 });
            excColY += doc.heightOfString(`• ${item}`, { width: 225 }) + 5;
          });
        }

        currentY = Math.max(incColY, excColY) + 15;
      }

      // Important Travel Information Section
      if (currentY > 680) {
        doc.addPage();
        currentY = 50;
      }
      doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(11).text('IMPORTANT INFORMATION', 50, currentY);
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
      currentY += 25;

      const instructions = [
        '• Please carry a valid photo ID matching passenger details during the travel.',
        '• For international tours, passport must be valid for at least 6 months from travel date.',
        '• Please arrive at the meeting point at least 15 minutes before the scheduled start time.',
        '• In case of emergencies, please call +1 555 999 1234 or email support@exploremytrip.com.'
      ];

      instructions.forEach(instruction => {
        if (currentY > 760) {
          doc.addPage();
          currentY = 50;
        }
        doc.font('Helvetica').fillColor('#475569').fontSize(8.5).text(instruction, 55, currentY, { width: 480 });
        currentY += doc.heightOfString(instruction, { width: 480 }) + 6;
      });

      // Footer
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#94a3b8').text('Thank you for choosing ExploreMyTrip. Have a safe and memorable journey!', 50, doc.page.height - 60, { align: 'center' });

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

// Generate Itinerary PDF
export const generateItineraryPDF = (booking, user, tour, savePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(savePath);
      doc.pipe(writeStream);

      // Header Branding
      doc.fillColor('#0f172a').fontSize(24).text('ExploreMyTrip Tour Itinerary', 50, 50);
      doc.fontSize(10).fillColor('#64748b').text('Premium Travel & SaaS Solutions', 50, 75);
      doc.text('Email: bookings@exploremytrip.com | Phone: +1 555 999 1234', 50, 90);
      
      // Itinerary Info Right side
      doc.fillColor('#0f172a').fontSize(14).text('TRIP SCHEDULE', 400, 50, { align: 'right' });
      doc.fontSize(10).fillColor('#64748b').text(`Tour: ${tour.title}`, 400, 70, { align: 'right' });
      doc.text(`Duration: ${tour.durationDays} Day(s)`, 400, 85, { align: 'right' });

      doc.moveDown(2);
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

      // Trip Overview
      doc.moveDown(1.5);
      doc.fillColor('#0f172a').fontSize(12).text('TOUR OVERVIEW:', 50, 140);
      doc.fontSize(10).fillColor('#475569').text(`Destination: ${tour.city || tour.country || 'Global'}`, 50, 160);
      doc.text(`Departure Date: ${new Date(booking.departureDate).toLocaleDateString()}`, 50, 175);
      doc.text(`Location: ${tour.location || 'Not specified'}`, 50, 190);

      doc.moveDown(2);
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, 220).lineTo(550, 220).stroke();

      // Highlights
      let currentY = 240;
      if (tour.highlights && tour.highlights.length > 0) {
        doc.fillColor('#0f172a').fontSize(12).text('TOUR HIGHLIGHTS:', 50, currentY);
        currentY += 20;
        doc.fontSize(10).fillColor('#475569');
        tour.highlights.slice(0, 5).forEach(highlight => {
          doc.text(`* ${highlight}`, 60, currentY);
          currentY += 15;
        });
        currentY += 10;
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();
        currentY += 20;
      }

      // Detailed Day-by-day Itinerary
      doc.fillColor('#0f172a').fontSize(12).text('DAY-BY-DAY SCHEDULE:', 50, currentY);
      currentY += 20;
      doc.fontSize(10).fillColor('#475569');

      if (tour.itinerary && tour.itinerary.length > 0) {
        tour.itinerary.forEach((dayPlan) => {
          if (currentY > 600) {
            doc.addPage();
            currentY = 50;
          }
          doc.fillColor('#0f172a').fontSize(10).text(`Day ${dayPlan.day}: ${dayPlan.title}`, 50, currentY, { bold: true });
          currentY += 15;
          doc.fillColor('#475569').fontSize(9).text(dayPlan.description, 60, currentY, { width: 480 });
          currentY += Math.max(30, Math.ceil(dayPlan.description.length / 80) * 12);
        });
      } else {
        doc.text('Detailed day-by-day itinerary schedule will be provided by the tour guide.', 50, currentY);
      }

      // Footer
      doc.fontSize(8).fillColor('#94a3b8').text('Thank you for choosing ExploreMyTrip! Let us create experiences of a lifetime.', 50, doc.page.height - 50, { align: 'center' });

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

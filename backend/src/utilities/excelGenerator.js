import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

// Generate Sales/Revenue Report Excel
export const generateRevenueReportExcel = async (payments, savePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Revenue Report');

  // Define Columns
  worksheet.columns = [
    { header: 'Transaction ID', key: 'transactionId', width: 25 },
    { header: 'Booking Ref', key: 'bookingId', width: 25 },
    { header: 'Customer Email', key: 'email', width: 30 },
    { header: 'Gateway', key: 'gateway', width: 12 },
    { header: 'Amount ($)', key: 'amount', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Date', key: 'date', width: 18 }
  ];

  // Make header row bold with background color
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' } // Dark blue
  };

  // Add Data Rows
  payments.forEach(payment => {
    worksheet.addRow({
      transactionId: payment.transactionId,
      bookingId: payment.booking.toString(),
      email: payment.user?.email || 'N/A',
      gateway: payment.gateway,
      amount: payment.amount,
      status: payment.status,
      date: new Date(payment.createdAt).toLocaleDateString()
    });
  });

  // Calculate Total Row
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalRow = worksheet.addRow({
    transactionId: 'TOTAL REVENUE',
    amount: totalAmount
  });
  totalRow.font = { bold: true };

  // Format amount column as currency
  worksheet.getColumn('amount').numFmt = '$#,##0.00';

  // Ensure directory exists
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await workbook.xlsx.writeFile(savePath);
  return savePath;
};

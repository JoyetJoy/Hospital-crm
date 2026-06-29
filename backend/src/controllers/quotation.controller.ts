import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export const getQuotations = async (req: Request, res: Response) => {
  try {
    const { hospitalId, executiveId } = req.query;
    const where: any = {};
    if (hospitalId) where.hospitalId = parseInt(String(hospitalId));
    if (executiveId) where.executiveId = parseInt(String(executiveId));

    const quotations = await prisma.quotation.findMany({
      where,
      include: { hospital: true, executive: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quotations', error });
  }
};

export const getQuotationById = async (req: Request, res: Response) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { hospital: true, items: { include: { product: true } } }
    });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quotation', error });
  }
};

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const { quotationNumber, hospitalId, executiveId, validTill, items } = req.body;
    
    // items expected to be array of: { productId, quantity, price, gst, discount }
    
    let totalAmount = 0;
    const quotationItemsData = items.map((item: any) => {
      const total = (item.price * item.quantity) - item.discount + ((item.price * item.quantity - item.discount) * (item.gst / 100));
      totalAmount += total;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        gst: item.gst,
        discount: item.discount,
        total
      };
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        hospitalId: parseInt(hospitalId),
        executiveId: parseInt(executiveId),
        validTill: new Date(validTill),
        totalAmount,
        status: 'Draft',
        items: {
          create: quotationItemsData
        }
      },
      include: { hospital: true, items: { include: { product: true } }, executive: { include: { user: true } } }
    });

    // Generate PDF
    const pdfFileName = `quotation_${quotation.id}_${Date.now()}.pdf`;
    const pdfPath = `/uploads/${pdfFileName}`;
    const fullPath = path.join(__dirname, '../../uploads', pdfFileName);
    
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(fullPath));
    
    doc.fontSize(20).text('Quotation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Quotation No: ${quotation.quotationNumber}`);
    doc.text(`Date: ${quotation.date.toDateString()}`);
    doc.text(`Valid Till: ${quotation.validTill.toDateString()}`);
    doc.moveDown();
    doc.text(`Hospital: ${quotation.hospital.name}`);
    doc.moveDown();
    doc.text('Items:');
    quotation.items.forEach((item) => {
      doc.text(`- ${item.product.productName}: ${item.quantity} x $${item.price} (GST: ${item.gst}%, Discount: ${item.discount}) = $${item.total}`);
    });
    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: $${quotation.totalAmount.toFixed(2)}`, { align: 'right' });
    
    doc.end();

    // Update quotation with PDF path
    const updatedQuotation = await prisma.quotation.update({
      where: { id: quotation.id },
      data: { pdfPath }
    });

    res.status(201).json(updatedQuotation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quotation', error });
  }
};

export const updateQuotationStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const quotation = await prisma.quotation.update({
      where: { id: parseInt(req.params.id as string) },
      data: { status }
    });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quotation', error });
  }
};

export const deleteQuotation = async (req: Request, res: Response) => {
  try {
    await prisma.quotation.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quotation', error });
  }
};

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuotation = exports.updateQuotationStatus = exports.createQuotation = exports.getQuotationById = exports.getQuotations = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getQuotations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, executiveId } = req.query;
        const where = {};
        if (hospitalId)
            where.hospitalId = parseInt(String(hospitalId));
        if (executiveId)
            where.executiveId = parseInt(String(executiveId));
        const quotations = yield prisma_1.default.quotation.findMany({
            where,
            include: { hospital: true, executive: { include: { user: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(quotations);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching quotations', error });
    }
});
exports.getQuotations = getQuotations;
const getQuotationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quotation = yield prisma_1.default.quotation.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { hospital: true, items: { include: { product: true } } }
        });
        if (!quotation)
            return res.status(404).json({ message: 'Quotation not found' });
        res.json(quotation);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching quotation', error });
    }
});
exports.getQuotationById = getQuotationById;
const createQuotation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quotationNumber, hospitalId, executiveId, validTill, items } = req.body;
        // items expected to be array of: { productId, quantity, price, gst, discount }
        let totalAmount = 0;
        const quotationItemsData = items.map((item) => {
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
        const quotation = yield prisma_1.default.quotation.create({
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
        const fullPath = path_1.default.join(__dirname, '../../uploads', pdfFileName);
        const doc = new pdfkit_1.default();
        doc.pipe(fs_1.default.createWriteStream(fullPath));
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
        const updatedQuotation = yield prisma_1.default.quotation.update({
            where: { id: quotation.id },
            data: { pdfPath }
        });
        res.status(201).json(updatedQuotation);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating quotation', error });
    }
});
exports.createQuotation = createQuotation;
const updateQuotationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const quotation = yield prisma_1.default.quotation.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(quotation);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating quotation', error });
    }
});
exports.updateQuotationStatus = updateQuotationStatus;
const deleteQuotation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.quotation.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Quotation deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting quotation', error });
    }
});
exports.deleteQuotation = deleteQuotation;

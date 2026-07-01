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
            include: { hospital: true, executive: { include: { user: true } } }
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
        const { hospitalId, executiveId, date, time } = req.body;
        
        let finalExecutiveId = parseInt(executiveId);
        if (isNaN(finalExecutiveId) && req.user && req.user.executiveId) {
            finalExecutiveId = req.user.executiveId;
        }
        
        const executiveIdToSave = isNaN(finalExecutiveId) ? null : finalExecutiveId;

        const file = req.file;
        const pdfPath = file ? `/uploads/${file.filename}` : null;
        
        const quotation = yield prisma_1.default.quotation.create({
            data: {
                hospitalId: parseInt(hospitalId),
                executiveId: executiveIdToSave,
                date: date ? new Date(date) : new Date(),
                time,
                pdfPath
            },
            include: { hospital: true, executive: { include: { user: true } } }
        });
        
        res.status(201).json(quotation);
    }
    catch (error) {
        console.error('Error creating quotation:', error);
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

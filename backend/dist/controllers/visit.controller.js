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
exports.deleteVisit = exports.updateVisit = exports.createVisit = exports.getVisitById = exports.getVisits = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getVisits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, executiveId } = req.query;
        const where = {};
        if (hospitalId)
            where.hospitalId = parseInt(String(hospitalId));
        if (executiveId)
            where.executiveId = parseInt(String(executiveId));
        const visits = yield prisma_1.default.visit.findMany({
            where,
            include: { hospital: true, executive: { include: { user: true } } },
            orderBy: { visitDate: 'desc' }
        });
        res.json(visits);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching visits', error });
    }
});
exports.getVisits = getVisits;
const getVisitById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const visit = yield prisma_1.default.visit.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { hospital: true, followups: true }
        });
        if (!visit)
            return res.status(404).json({ message: 'Visit not found' });
        res.json(visit);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching visit', error });
    }
});
exports.getVisitById = getVisitById;
const createVisit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, executiveId, visitDate, visitTime, purpose, notes, productsDiscussed, outcome, status } = req.body;
        // Handle image paths
        const files = req.files;
        const images = files ? files.map(file => `/uploads/${file.filename}`).join(',') : null;
        const visit = yield prisma_1.default.visit.create({
            data: {
                hospitalId: parseInt(hospitalId),
                executiveId: parseInt(executiveId),
                visitDate: new Date(visitDate),
                visitTime,
                purpose,
                notes,
                productsDiscussed,
                outcome,
                status: status || 'Interested',
                images
            }
        });
        res.status(201).json(visit);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating visit', error });
    }
});
exports.createVisit = createVisit;
const updateVisit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { visitDate, visitTime, purpose, notes, productsDiscussed, outcome, status } = req.body;
        const updateData = {
            visitDate: visitDate ? new Date(visitDate) : undefined,
            visitTime, purpose, notes, productsDiscussed, outcome, status
        };
        const files = req.files;
        if (files && files.length > 0) {
            updateData.images = files.map(file => `/uploads/${file.filename}`).join(',');
        }
        const visit = yield prisma_1.default.visit.update({
            where: { id: parseInt(req.params.id) },
            data: updateData
        });
        res.json(visit);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating visit', error });
    }
});
exports.updateVisit = updateVisit;
const deleteVisit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.visit.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Visit deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting visit', error });
    }
});
exports.deleteVisit = deleteVisit;

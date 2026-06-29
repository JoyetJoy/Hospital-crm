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
exports.deleteHospital = exports.updateHospital = exports.createHospital = exports.getHospitalById = exports.getHospitals = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, category, status } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { city: { contains: String(search), mode: 'insensitive' } }
            ];
        }
        if (category)
            where.category = String(category);
        if (status)
            where.status = String(status);
        const hospitals = yield prisma_1.default.hospital.findMany({ where, orderBy: { name: 'asc' } });
        res.json(hospitals);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching hospitals', error });
    }
});
exports.getHospitals = getHospitals;
const getHospitalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hospital = yield prisma_1.default.hospital.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                assignments: { include: { executive: { include: { user: true } } } },
                visits: { orderBy: { visitDate: 'desc' }, take: 5 },
                followups: { orderBy: { followupDate: 'desc' }, take: 5 }
            }
        });
        if (!hospital)
            return res.status(404).json({ message: 'Hospital not found' });
        res.json(hospital);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching hospital', error });
    }
});
exports.getHospitalById = getHospitalById;
const createHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const hospital = yield prisma_1.default.hospital.create({ data });
        res.status(201).json(hospital);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating hospital', error });
    }
});
exports.createHospital = createHospital;
const updateHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const hospital = yield prisma_1.default.hospital.update({
            where: { id: parseInt(req.params.id) },
            data
        });
        res.json(hospital);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating hospital', error });
    }
});
exports.updateHospital = updateHospital;
const deleteHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.hospital.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Hospital deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting hospital', error });
    }
});
exports.deleteHospital = deleteHospital;

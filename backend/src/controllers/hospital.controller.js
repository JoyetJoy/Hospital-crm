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
exports.deleteHospital = exports.updateHospital = exports.createHospital = exports.getHospitalById = exports.getHospitals = exports.getLocations = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, category, status, state, district, city } = req.query;
        const where = {};
        
        // If user is a Sales Executive, only show their assigned hospitals
        if (req.user && req.user.role === 'Sales Executive' && req.user.executiveId) {
            where.assignments = {
                some: {
                    executiveId: req.user.executiveId
                }
            };
        }

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
        if (state)
            where.state = String(state);
        if (district)
            where.district = String(district);
        if (city)
            where.city = String(city);
        const hospitals = yield prisma_1.default.hospital.findMany({ 
            where, 
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { visits: true }
                }
            }
        });
        res.json(hospitals);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching hospitals', error });
    }
});
exports.getHospitals = getHospitals;
const getLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const states = yield prisma_1.default.hospital.findMany({ select: { state: true }, distinct: ['state'], where: { state: { not: null } } });
        const districts = yield prisma_1.default.hospital.findMany({ select: { district: true }, distinct: ['district'], where: { district: { not: null } } });
        const cities = yield prisma_1.default.hospital.findMany({ select: { city: true }, distinct: ['city'], where: { city: { not: null } } });
        res.json({
            states: states.map(s => s.state).filter(Boolean),
            districts: districts.map(d => d.district).filter(Boolean),
            cities: cities.map(c => c.city).filter(Boolean)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching locations', error });
    }
});
exports.getLocations = getLocations;
const getHospitalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hospital = yield prisma_1.default.hospital.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                assignments: { include: { executive: { include: { user: true } } } },
                visits: { orderBy: { visitDate: 'desc' }, take: 10 },
                followups: { orderBy: { followupDate: 'desc' }, take: 10 },
                quotations: { orderBy: { createdAt: 'desc' }, take: 10 }
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

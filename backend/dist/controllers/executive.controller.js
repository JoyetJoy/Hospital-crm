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
exports.removeAssignment = exports.assignHospital = exports.deleteExecutive = exports.updateExecutive = exports.createExecutive = exports.getExecutiveById = exports.getExecutives = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getExecutives = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const executives = yield prisma_1.default.executive.findMany({
            include: { user: true }
        });
        res.json(executives);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching executives', error });
    }
});
exports.getExecutives = getExecutives;
const getExecutiveById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const executive = yield prisma_1.default.executive.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { user: true, assignments: { include: { hospital: true } } }
        });
        if (!executive)
            return res.status(404).json({ message: 'Executive not found' });
        res.json(executive);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching executive', error });
    }
});
exports.getExecutiveById = getExecutiveById;
const createExecutive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, employeeCode, territory, target } = req.body;
        const executive = yield prisma_1.default.executive.create({
            data: {
                userId: parseInt(userId),
                employeeCode,
                territory,
                target: target ? parseFloat(target) : null
            }
        });
        res.status(201).json(executive);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating executive', error });
    }
});
exports.createExecutive = createExecutive;
const updateExecutive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeCode, territory, target } = req.body;
        const executive = yield prisma_1.default.executive.update({
            where: { id: parseInt(req.params.id) },
            data: {
                employeeCode,
                territory,
                target: target ? parseFloat(target) : null
            }
        });
        res.json(executive);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating executive', error });
    }
});
exports.updateExecutive = updateExecutive;
const deleteExecutive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.executive.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Executive deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting executive', error });
    }
});
exports.deleteExecutive = deleteExecutive;
// Hospital Assignments
const assignHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, notes } = req.body;
        const assignment = yield prisma_1.default.hospitalAssignment.create({
            data: {
                hospitalId: parseInt(hospitalId),
                executiveId: parseInt(req.params.id),
                notes
            }
        });
        res.status(201).json(assignment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error assigning hospital', error });
    }
});
exports.assignHospital = assignHospital;
const removeAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.hospitalAssignment.delete({
            where: { id: parseInt(req.params.assignmentId) }
        });
        res.json({ message: 'Assignment removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error removing assignment', error });
    }
});
exports.removeAssignment = removeAssignment;

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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
        const { email, password, firstName, lastName, employeeCode, territory, target } = req.body;
        let role = yield prisma_1.default.role.findUnique({
            where: { name: 'Sales Executive' }
        });
        if (!role) {
            role = yield prisma_1.default.role.findUnique({
                where: { name: 'Executive' }
            });
        }
        if (!role) {
            res.status(400).json({ message: 'Executive role not found. Please seed the roles.' });
            return;
        }
        const roleId = role.id;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newExecutive = yield prisma_1.default.$transaction((prismaClient) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prismaClient.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    roleId
                }
            });
            const executive = yield prismaClient.executive.create({
                data: {
                    userId: user.id,
                    employeeCode,
                    territory,
                    target: target ? parseFloat(String(target)) : null
                },
                include: { user: true }
            });
            return executive;
        }));
        res.status(201).json(newExecutive);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating executive', error });
    }
});
exports.createExecutive = createExecutive;
const updateExecutive = async (req, res) => {
    try {
        const { employeeCode, territory, target, firstName, lastName, email, password } = req.body;
        
        const existingExecutive = await prisma_1.default.executive.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (!existingExecutive) return res.status(404).json({ message: 'Executive not found' });

        const updateDataUser = {};
        if (firstName) updateDataUser.firstName = firstName;
        if (lastName) updateDataUser.lastName = lastName;
        if (email) updateDataUser.email = email;
        
        if (password) {
            updateDataUser.password = await bcryptjs_1.default.hash(password, 10);
        }

        const executive = await prisma_1.default.$transaction(async (prismaClient) => {
            if (Object.keys(updateDataUser).length > 0) {
                await prismaClient.user.update({
                    where: { id: existingExecutive.userId },
                    data: updateDataUser
                });
            }
            
            const updatedExecutive = await prismaClient.executive.update({
                where: { id: parseInt(req.params.id) },
                data: {
                    employeeCode,
                    territory,
                    target: target ? parseFloat(String(target)) : null
                },
                include: { user: true }
            });
            return updatedExecutive;
        });
        
        res.json(executive);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating executive', error });
    }
};
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

const bulkAssignHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalIds, notes } = req.body;
        const executiveId = parseInt(req.params.id);
        
        if (!Array.isArray(hospitalIds) || hospitalIds.length === 0) {
            return res.status(400).json({ message: 'No hospitals provided' });
        }
        
        const data = hospitalIds.map(id => ({
            hospitalId: parseInt(id),
            executiveId,
            notes
        }));
        
        const result = yield prisma_1.default.hospitalAssignment.createMany({
            data,
            skipDuplicates: true
        });
        
        res.status(201).json({ message: 'Hospitals assigned successfully', count: result.count });
    }
    catch (error) {
        res.status(500).json({ message: 'Error in bulk assignment', error });
    }
});
exports.bulkAssignHospitals = bulkAssignHospitals;

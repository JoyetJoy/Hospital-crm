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
exports.deleteFollowup = exports.updateFollowup = exports.createFollowup = exports.getFollowupById = exports.getFollowups = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getFollowups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, status } = req.query;
        const where = {};
        if (hospitalId)
            where.hospitalId = parseInt(String(hospitalId));
        if (status)
            where.status = String(status);
        const followups = yield prisma_1.default.followup.findMany({
            where,
            include: { hospital: true, visit: true },
            orderBy: { followupDate: 'asc' }
        });
        res.json(followups);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching followups', error });
    }
});
exports.getFollowups = getFollowups;
const getFollowupById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followup = yield prisma_1.default.followup.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { hospital: true, visit: true }
        });
        if (!followup)
            return res.status(404).json({ message: 'Followup not found' });
        res.json(followup);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching followup', error });
    }
});
exports.getFollowupById = getFollowupById;
const createFollowup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId, visitId, followupDate, followupTime, followupType, priority, notes, status } = req.body;
        const followup = yield prisma_1.default.followup.create({
            data: {
                hospitalId: parseInt(hospitalId),
                visitId: visitId ? parseInt(visitId) : null,
                followupDate: new Date(followupDate),
                followupTime,
                followupType,
                priority: priority || 'Medium',
                notes,
                status: status || 'Pending'
            }
        });
        res.status(201).json(followup);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating followup', error });
    }
});
exports.createFollowup = createFollowup;
const updateFollowup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { followupDate, followupTime, followupType, priority, notes, status } = req.body;
        const followup = yield prisma_1.default.followup.update({
            where: { id: parseInt(req.params.id) },
            data: {
                followupDate: followupDate ? new Date(followupDate) : undefined,
                followupTime, followupType, priority, notes, status
            }
        });
        res.json(followup);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating followup', error });
    }
});
exports.updateFollowup = updateFollowup;
const deleteFollowup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.followup.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Followup deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting followup', error });
    }
});
exports.deleteFollowup = deleteFollowup;

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
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalHospitals = yield prisma_1.default.hospital.count();
        const totalVisits = yield prisma_1.default.visit.count();
        const activeFollowups = yield prisma_1.default.followup.count({ where: { status: 'Pending' } });
        const generatedQuotations = yield prisma_1.default.quotation.count();
        const recentVisits = yield prisma_1.default.visit.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { hospital: true, executive: { include: { user: true } } }
        });
        const recentQuotations = yield prisma_1.default.quotation.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { hospital: true }
        });
        res.json({
            stats: {
                totalHospitals,
                totalVisits,
                activeFollowups,
                generatedQuotations
            },
            recentVisits,
            recentQuotations
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
});
exports.getDashboardStats = getDashboardStats;

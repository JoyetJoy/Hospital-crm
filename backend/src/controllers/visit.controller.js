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
        const { hospitalId, executiveId, visitDate, visitTime, requirement, notes, remarks, createFollowup, followupDate, followupTime, contactName, contactPhone, contactEmail } = req.body;
        
        let finalExecutiveId = parseInt(executiveId);
        if (isNaN(finalExecutiveId) && req.user && req.user.executiveId) {
            finalExecutiveId = req.user.executiveId;
        }

        const files = req.files;
        const images = files && files.length > 0 ? files.map(file => `/uploads/${file.filename}`).join(',') : null;
        
        const visit = yield prisma_1.default.visit.create({
            data: {
                hospitalId: parseInt(hospitalId),
                executiveId: finalExecutiveId,
                visitDate: new Date(visitDate),
                visitTime,
                requirement,
                notes,
                remarks,
                images,
                contactName,
                contactPhone,
                contactEmail
            }
        });

        if (images) {
            yield prisma_1.default.quotation.create({
                data: {
                    hospitalId: parseInt(hospitalId),
                    executiveId: finalExecutiveId,
                    date: new Date(visitDate),
                    time: visitTime,
                    pdfPath: images.split(',')[0]
                }
            });
        }

        if (createFollowup === 'true' && followupDate) {
            yield prisma_1.default.followup.create({
                data: {
                    hospitalId: parseInt(hospitalId),
                    visitId: visit.id,
                    followupDate: new Date(followupDate),
                    followupTime: followupTime || null,
                    followupType: 'Visit',
                    priority: 'Medium',
                    status: 'Pending',
                    notes: requirement || 'Follow up for recent visit'
                }
            });
        }

        res.status(201).json(visit);
    }
    catch (error) {
        console.error('Error creating visit:', error);
        res.status(500).json({ message: 'Error creating visit', error });
    }
});
exports.createVisit = createVisit;
const updateVisit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { visitDate, visitTime, requirement, notes, remarks } = req.body;
        const updateData = {
            visitDate: visitDate ? new Date(visitDate) : undefined,
            visitTime, requirement, notes, remarks
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

const exportVisits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ExcelJS = require('exceljs');
        const visits = yield prisma_1.default.visit.findMany({
            include: {
                hospital: true,
                executive: { include: { user: true } }
            },
            orderBy: { visitDate: 'desc' }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Visits');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Place', key: 'place', width: 20 },
            { header: 'Hospital Name', key: 'hospitalName', width: 30 },
            { header: 'Contact Person', key: 'contactPerson', width: 20 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Requirement', key: 'requirement', width: 30 },
            { header: 'Remark', key: 'remark', width: 30 }
        ];

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1677FF' } // Ant Design Blue
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        visits.forEach(visit => {
            const d = visit.visitDate;
            const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            worksheet.addRow({
                date: formattedDate,
                place: visit.hospital?.city || visit.hospital?.district || '',
                hospitalName: visit.hospital?.name || '',
                contactPerson: visit.contactName || visit.hospital?.contactPerson || '',
                phone: visit.contactPhone || visit.hospital?.mobileNumber || '',
                email: visit.contactEmail || visit.hospital?.email || '',
                requirement: visit.requirement || '',
                remark: visit.remarks || ''
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'visits_report.xlsx');

        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error exporting visits:', error);
        res.status(500).json({ message: 'Error exporting visits', error });
    }
});
exports.exportVisits = exportVisits;

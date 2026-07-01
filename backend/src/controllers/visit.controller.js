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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [visits, total] = yield Promise.all([
            prisma_1.default.visit.findMany({
                where,
                include: { hospital: true, executive: { include: { user: true } }, followups: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.visit.count({ where })
        ]);
        res.json({
            data: visits,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
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
        const { hospitalId, executiveId, visitDate, visitTime, requirement, notes, remarks, createFollowup, followupDate, followupTime, contactName, contactPhone, contactEmail, competitor, visitLog, priority } = req.body;
        
        let finalExecutiveId = parseInt(executiveId);
        if (isNaN(finalExecutiveId) && req.user && req.user.executiveId) {
            finalExecutiveId = req.user.executiveId;
        }

        // Allow null for admins, otherwise use the parsed ID
        const executiveIdToSave = isNaN(finalExecutiveId) ? null : finalExecutiveId;

        const finalHospitalId = parseInt(hospitalId);
        if (isNaN(finalHospitalId)) {
            return res.status(400).json({ message: 'Valid Hospital ID is required.' });
        }

        const finalVisitDate = new Date(visitDate);
        if (isNaN(finalVisitDate.getTime())) {
            return res.status(400).json({ message: 'Valid visitDate is required.' });
        }

        const files = req.files;
        const images = files && files.length > 0 ? files.map(file => `/uploads/${file.filename}`).join(',') : null;
        
        const visit = yield prisma_1.default.visit.create({
            data: {
                hospitalId: finalHospitalId,
                executiveId: executiveIdToSave,
                visitDate: finalVisitDate,
                visitTime,
                requirement,
                notes,
                remarks,
                images,
                contactName,
                contactPhone,
                contactEmail,
                competitor,
                visitLog,
                priority
            }
        });

        if (images) {
            yield prisma_1.default.quotation.create({
                data: {
                    hospitalId: finalHospitalId,
                    executiveId: finalExecutiveId,
                    date: finalVisitDate,
                    time: visitTime,
                    pdfPath: images.split(',')[0]
                }
            });
        }

        if (createFollowup === 'true' && followupDate) {
            yield prisma_1.default.followup.create({
                data: {
                    hospitalId: finalHospitalId,
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
        const { visitDate, visitTime, requirement, notes, remarks, competitor, visitLog, priority, contactName, contactPhone, contactEmail, createFollowup, followupDate, followupTime } = req.body;
        const updateData = {
            visitDate: visitDate ? new Date(visitDate) : undefined,
            visitTime, requirement, notes, remarks, competitor, visitLog, priority, contactName, contactPhone, contactEmail
        };
        const files = req.files;
        if (files && files.length > 0) {
            updateData.images = files.map(file => `/uploads/${file.filename}`).join(',');
        }
        const visit = yield prisma_1.default.visit.update({
            where: { id: parseInt(req.params.id) },
            data: updateData
        });

        if (files && files.length > 0) {
            yield prisma_1.default.quotation.create({
                data: {
                    hospitalId: visit.hospitalId,
                    executiveId: visit.executiveId,
                    date: new Date(),
                    time: visitTime,
                    pdfPath: updateData.images.split(',')[0]
                }
            });
        }

        if (createFollowup === 'true' && followupDate) {
            const existingFollowup = yield prisma_1.default.followup.findFirst({
                where: { visitId: visit.id }
            });
            if (existingFollowup) {
                yield prisma_1.default.followup.update({
                    where: { id: existingFollowup.id },
                    data: {
                        followupDate: new Date(followupDate),
                        followupTime: followupTime || null
                    }
                });
            } else {
                yield prisma_1.default.followup.create({
                    data: {
                        hospitalId: visit.hospitalId,
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
        }

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
            { header: 'Date', key: 'date' },
            { header: 'Place', key: 'place' },
            { header: 'Hospital Name', key: 'hospitalName' },
            { header: 'Contact Person', key: 'contactPerson' },
            { header: 'Phone', key: 'phone' },
            { header: 'Email', key: 'email' },
            { header: 'Requirement', key: 'requirement' },
            { header: 'Remark', key: 'remark' },
            { header: 'Competitor', key: 'competitor' }
        ];

        // Track max width for each column based on header initially
        const colWidths = {
            date: 15,
            place: 10,
            hospitalName: 15,
            contactPerson: 15,
            phone: 15,
            email: 10,
            requirement: 15,
            remark: 15,
            competitor: 15
        };

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1677FF' } // Ant Design Blue
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        let previousDate = null;

        visits.forEach(visit => {
            const d = visit.visitDate;
            const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            const displayDate = formattedDate === previousDate ? '' : formattedDate;
            previousDate = formattedDate;

            const place = [visit.hospital?.city, visit.hospital?.district, visit.hospital?.state].filter(Boolean).join(', ');
            const hospitalName = visit.hospital?.name || '';
            const contactPerson = visit.contactName || visit.hospital?.contactPerson || '';
            const phone = visit.contactPhone || visit.hospital?.mobileNumber || '';
            const email = visit.contactEmail || visit.hospital?.email || '';
            const requirement = visit.requirement || '';
            const remark = visit.remarks || '';
            const competitor = visit.competitor || '';
            
            // Update max widths
            colWidths.date = Math.max(colWidths.date, displayDate.length + 2);
            colWidths.place = Math.max(colWidths.place, place.length + 2);
            colWidths.hospitalName = Math.max(colWidths.hospitalName, hospitalName.length + 2);
            colWidths.contactPerson = Math.max(colWidths.contactPerson, contactPerson.length + 2);
            colWidths.phone = Math.max(colWidths.phone, phone.length + 2);
            colWidths.email = Math.max(colWidths.email, email.length + 2);
            colWidths.requirement = Math.max(colWidths.requirement, requirement.length + 2);
            colWidths.remark = Math.max(colWidths.remark, remark.length + 2);
            colWidths.competitor = Math.max(colWidths.competitor, competitor.length + 2);

            const addedRow = worksheet.addRow({
                date: displayDate,
                place,
                hospitalName,
                contactPerson,
                phone,
                email,
                requirement,
                remark,
                competitor
            });
            
            addedRow.getCell('hospitalName').font = { bold: true };
        });

        // Apply calculated widths, capping at 60 characters
        worksheet.columns.forEach(column => {
            let width = colWidths[column.key];
            if (width > 60) width = 60;
            column.width = width;
        });

        // Enable text wrapping for all cells to prevent cutoff
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell({ includeEmpty: true }, (cell) => {
                // Keep header styling intact but apply wrapText everywhere
                if (rowNumber !== 1) {
                    cell.alignment = { wrapText: true, vertical: 'top' };
                }
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

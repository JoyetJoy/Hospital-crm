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
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportVisitReport = exports.exportSalesReport = void 0;
const exportSalesReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Mock export
        res.json({ message: 'Sales report exported successfully', downloadUrl: '/mock/sales_report.csv' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error exporting sales report', error });
    }
});
exports.exportSalesReport = exportSalesReport;
const exportVisitReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Mock export
        res.json({ message: 'Visit report exported successfully', downloadUrl: '/mock/visit_report.csv' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error exporting visit report', error });
    }
});
exports.exportVisitReport = exportVisitReport;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const executive_routes_1 = __importDefault(require("./routes/executive.routes"));
const hospital_routes_1 = __importDefault(require("./routes/hospital.routes"));
const visit_routes_1 = __importDefault(require("./routes/visit.routes"));
const followup_routes_1 = __importDefault(require("./routes/followup.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const quotation_routes_1 = __importDefault(require("./routes/quotation.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/executives', executive_routes_1.default);
app.use('/api/hospitals', hospital_routes_1.default);
app.use('/api/visits', visit_routes_1.default);
app.use('/api/followups', followup_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/quotations', quotation_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// triggered restart

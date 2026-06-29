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
const prisma_1 = __importDefault(require("../src/utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const superAdminRole = yield prisma_1.default.role.upsert({
            where: { name: 'Super Admin' },
            update: {},
            create: { name: 'Super Admin', permissions: 'ALL' },
        });
        yield prisma_1.default.role.upsert({
            where: { name: 'Sales Executive' },
            update: {},
            create: { name: 'Sales Executive', permissions: 'BASIC' },
        });
        const hashedPassword = yield bcryptjs_1.default.hash('admin123', 10);
        const admin = yield prisma_1.default.user.upsert({
            where: { email: 'admin@hospitalcrm.com' },
            update: {},
            create: {
                email: 'admin@hospitalcrm.com',
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                roleId: superAdminRole.id,
            },
        });
        console.log({ admin });
    });
}
main()
    .then(() => prisma_1.default.$disconnect())
    .catch((e) => {
    console.error(e);
    prisma_1.default.$disconnect();
});

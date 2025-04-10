"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moduleController = __importStar(require("../controllers/module.controller"));
const progressController = __importStar(require("../controllers/progress.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const module_middleware_1 = require("../middleware/module.middleware");
const router = (0, express_1.Router)();
// Module listing and filtering routes - Public
router.get('/', moduleController.getAllModules);
router.get('/recommended', auth_middleware_1.authenticate, moduleController.getRecommendedModules);
// Module detail routes - Public with possible restrictions
router.get('/:moduleId', module_middleware_1.moduleExists, module_middleware_1.checkModulePublished, moduleController.getModuleById);
router.get('/:moduleId/content', module_middleware_1.moduleExists, module_middleware_1.checkModulePublished, module_middleware_1.checkPremiumAccess, moduleController.getModuleContent);
// Module progress routes - Private (requires authentication)
router.get('/:moduleId/progress', auth_middleware_1.authenticate, progressController.getModuleProgress);
router.post('/:moduleId/progress', auth_middleware_1.authenticate, module_middleware_1.moduleExists, progressController.updateProgress);
// Admin module management routes - Private (requires admin or instructor role)
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'INSTRUCTOR']), moduleController.createModule);
router.put('/:moduleId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN', 'INSTRUCTOR']), module_middleware_1.moduleExists, moduleController.updateModule);
router.delete('/:moduleId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']), module_middleware_1.moduleExists, moduleController.deleteModule);
exports.default = router;

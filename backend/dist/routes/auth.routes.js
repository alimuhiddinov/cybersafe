"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Auth routes
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/verify-email', auth_controller_1.verifyEmail);
router.post('/request-password-reset', auth_controller_1.requestPasswordReset);
router.post('/reset-password', auth_controller_1.resetPassword);
// Protected routes
router.get('/profile', auth_middleware_1.authenticate, auth_controller_1.getProfile);
router.put('/profile', auth_middleware_1.authenticate, auth_controller_1.updateProfile);
router.put('/password', auth_middleware_1.authenticate, auth_controller_1.changePassword);
router.post('/profile/image', auth_middleware_1.authenticate, auth_controller_1.uploadProfileImage);
// Test route to verify authentication
router.get('/verify-token', auth_middleware_1.authenticate, (req, res) => {
    res.status(200).json({ message: 'Token is valid', user: req.user });
});
exports.default = router;

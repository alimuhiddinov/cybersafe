"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_2 = require("./config/cors");
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
// Create Express server
const app = (0, express_1.default)();
// Set port
const port = process.env.PORT || 3001;
// Middleware
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)(cors_2.corsConfig));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Root route
app.get('/', (_, res) => {
    res.status(200).json({
        message: 'CyberSafe API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api',
            auth: '/api/auth/*'
        }
    });
});
// API Routes
app.use('/api', routes_1.default);
// Health check endpoint
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
});
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
exports.default = app;

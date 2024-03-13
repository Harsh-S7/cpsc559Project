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
// src/index.js
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json(), (0, cors_1.default)());
// Primary server URL
const primaryServerUrl = 'http://backend:3001';
// Secondary server URL
const secondaryServerUrl = 'http://backend:3002';
// Function to create a proxy middleware
function createProxy(target) {
    return (0, express_http_proxy_1.default)(target, {
        proxyReqPathResolver: function (req) {
            return __awaiter(this, void 0, void 0, function* () {
                const param = req.params.endpoint;
                return `${target}/api/${param}`;
            });
        },
        proxyErrorHandler: function (err, res, next) {
            console.error('Primary server error:', err);
            // If there's an error with the primary server, switch to the secondary server
            if (target === primaryServerUrl) {
                console.log('Switching to secondary server...');
                return createProxy(secondaryServerUrl)(res.req, res, next);
            }
            // If already switched to secondary and still error, proceed with error handling
            return next(err);
        }
    });
}
const proxyMiddleware = createProxy(primaryServerUrl);
app.use('/api/:endpoint', (req, res, next) => {
    proxyMiddleware(req, res, next);
}, (0, cors_1.default)());
app.get("/server-down", (req, res) => {
    res.status(500).send("Servers are down");
});
app.listen(port, () => {
    console.log(`[proxy]: Proxy is running at http://backend:${port}`);
});

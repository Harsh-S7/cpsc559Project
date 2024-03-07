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
function selectProxyHost() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Selecting proxy host");
        const response = yield fetch("http://localhost:3001/api/mstring");
        if (!response.ok) {
            console.log("Primary server is down");
            // Refresh primary server.
            // redirect to secondary server
            const response = yield fetch("http://localhost:3002/api/mstring");
            if (!response.ok) {
                // Both servers are down
                console.log("Both servers are down");
                return "http://localhost:3000/server-down";
            }
            console.log("Secondary server is up");
            return "http://localhost:3002/api/mstring";
        }
        console.log("Primary server is up");
        return "http://localhost:3001/api/mstring/";
    });
}
app.use(express_1.default.json(), (0, cors_1.default)());
app.use("/api/mstring", (0, cors_1.default)(), (0, express_http_proxy_1.default)("http://localhost:3001/api/mstring", {
    proxyReqPathResolver: function () {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield selectProxyHost();
            return response;
        });
    }
}));
app.listen(port, () => {
    console.log(`[proxy]: Proxy is running at http://localhost:${port}`);
});

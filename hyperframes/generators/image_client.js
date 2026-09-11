"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImage = void 0;
// Re-export from backend service for spec directory structure
var image_client_1 = require("../../backend/src/services/hyperframes/image_client");
Object.defineProperty(exports, "generateImage", { enumerable: true, get: function () { return image_client_1.generateImage; } });

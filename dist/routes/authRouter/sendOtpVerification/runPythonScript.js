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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.runPythonScript = void 0;
const child_process_1 = require("child_process");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let pathToScript = process.env.PYTHON_SCRIPT_PATH;
if (!pathToScript) {
    console.error("No environment variable found for python script path");
    process.exit(1);
}
const runPythonScript = (email, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const pythonProcess = (0, child_process_1.spawn)("python", [
            pathToScript,
            email,
            subject,
            message,
        ]);
        pythonProcess.stdout.on("data", (data) => {
            console.log(`Output: ${data}`);
        });
        pythonProcess.stderr.on("data", (data) => {
            console.error(`Error: ${data}`);
        });
        pythonProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`Python script exited with code ${code}`));
            }
        });
    });
});
exports.runPythonScript = runPythonScript;
//# sourceMappingURL=runPythonScript.js.map
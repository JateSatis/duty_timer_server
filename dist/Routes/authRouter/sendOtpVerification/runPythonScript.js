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
exports.runPythonScript = void 0;
const child_process_1 = require("child_process");
const pathToScript = "C:/Users/danil/OneDrive/Рабочий стол 2/duty_timer/src/python/sendEmail.py";
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
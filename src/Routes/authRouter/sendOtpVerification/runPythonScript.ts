import { spawn } from "child_process";

const pathToScript =
  "C:/Users/danil/OneDrive/Рабочий стол 2/duty_timer/src/python/sendEmail.py";

// Функция для запуска Python-скрипта
export const runPythonScript = async (
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Запуск Python-скрипта с передачей аргументов
    const pythonProcess = spawn("python", [
      pathToScript,
      email,
      subject,
      message,
    ]);

    // Обработка вывода из stdout
    pythonProcess.stdout.on("data", (data) => {
      console.log(`Output: ${data}`);
    });

    // Обработка ошибок из stderr
    pythonProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    // Завершение процесса
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python script exited with code ${code}`));
      }
    });
  });
};

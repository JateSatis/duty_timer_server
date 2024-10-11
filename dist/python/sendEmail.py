import sys
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


sender_email = 'danilovmaksim303@gmail.com'
sender_password = 'losw gtho ooqs fuwk'


def send_email(recipient_email: str, subject: str, message: str) -> None:
    # Настройки SMTP сервера
    smtp_server = 'smtp.' + sender_email.split('@')[1]
    smtp_port = 587

    # Создание сообщения
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    try:
        # Установка соединения с SMTP сервером
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Включение TLS
        server.login(sender_email, sender_password)  # Авторизация на сервере
        server.send_message(msg)  # Отправка сообщения
        print("Письмо успешно отправлено!")
    except Exception as e:
        print(f"Ошибка при отправке письма: {e}")
    finally:
        server.quit()  # Завершение соединения


def main() -> None:
    # Получение аргументов из командной строки
    if len(sys.argv) < 4:
        print("Недостаточно аргументов. Использование: script.py <email> <subject> <message>")
        sys.exit(1)
    
    email = sys.argv[1]
    subject = sys.argv[2]
    message = sys.argv[3]

    # Логика обработки аргументов (например, отправка письма)
    send_email(email, subject, message)


if __name__ == "__main__":
    main()

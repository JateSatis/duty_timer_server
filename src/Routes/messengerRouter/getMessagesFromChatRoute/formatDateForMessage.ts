export const formatDateForMessage = (milliseconds: number) => {
  const date = new Date(milliseconds);

  // Format "HH:MM"
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const timeFormat = `${hours}:${minutes}`;

  // Format "<month name> <date>, <year>" in Russian
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  const dateFormat = date.toLocaleDateString("ru-RU", options);

  return { timeFormat, dateFormat };
}

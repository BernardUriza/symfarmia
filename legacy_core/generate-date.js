const fs = require('fs');

const currentDate = new Date();
const formattedDate = `on day ${currentDate.getDate()} of ${currentDate.toLocaleString("en-US", {
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
})}`;

fs.writeFileSync('generate-date.txt', formattedDate);

console.log(formattedDate);
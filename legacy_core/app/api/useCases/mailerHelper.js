import { mailOptions, transporter } from '../../config/nodemailer';
import { formatDateHandler } from '../../providers/formatDateHandler';
import fs from 'fs/promises';
import path from 'path';

const readHtmlFile = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  return content;
};

const generateEmailContent = async (htmlFilePath, nombreDeUsuario, fecha, url) => {
  const htmlContent = await readHtmlFile(htmlFilePath);
  return {
    html: htmlContent
      .replace('[Nombre del Usuario]', nombreDeUsuario)
      .replace('[Fecha]', fecha)
      .replace('[URL]', url),
  };
};

export async function sendTokenByEmail(data) {
  const { to, subject, nombreDeUsuario, fecha, url } = data;
  const htmlFilePath = path.join(process.cwd(), 'app/api/mailerHelper/template.html');
  const emailContent = await generateEmailContent(htmlFilePath, nombreDeUsuario, formatDateHandler(fecha), url);
  mailOptions.to = to;
  await transporter.sendMail({
    ...mailOptions,
    ...emailContent,
    subject,
  });
}

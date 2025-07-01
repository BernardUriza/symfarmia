import { NextResponse } from 'next/server';
import { mailOptions, transporter } from '../../config/nodemailer';
import { formatDateHandler } from '../../providers/formatDateHandler';
const path = require('path');
const fs = require('fs').promises;

const readHtmlFile = async (filePath) => {
  try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
  } catch (error) {
      console.error('Error reading HTML file:', error);
      throw error;
  }
};

// Función para generar el contenido del correo
const generateEmailContent = async (htmlFilePath, nombreDeUsuario, fecha, url) => {
  const htmlContent = await readHtmlFile(htmlFilePath);
  return {
      html: htmlContent.replace("[Nombre del Usuario]",nombreDeUsuario).replace("[Fecha]", fecha).replace("[URL]", url),
  };
};


export async function POST(req) {
  const body = await req.json();
  const { to, subject, nombreDeUsuario, fecha, url } = body;

  // Input validation
  if (!to || !subject) {
    return NextResponse.json({ message: 'Missing required fields ' + to }, { status: 400 });
  }

  // Find the absolute path of the "json" directory
  const htmlFilePath = path.join(process.cwd(), 'app/api/mailerHelper/template.html');
  const emailContent = await generateEmailContent(htmlFilePath, nombreDeUsuario, formatDateHandler(fecha), url);

  mailOptions.to = to;
  try {
    await transporter.sendMail({
      ...mailOptions,
      ...emailContent,
      subject: subject,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

import nodemailer from "nodemailer";
import { Options, SentMessageInfo } from "nodemailer/lib/smtp-transport";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "porto.joao.2025@gmail.com",
    pass: "Hello5566",
  },
});

/**
  @params {object} options - mail options (to, subject, text, html)
  @params {function} callback - callback function to handle response
*/
const SENDMAIL = async (mailDetails: Options & Partial<Options>, callback: (arg0: SentMessageInfo) => void) => {
  try {
    const info = await transporter.sendMail(mailDetails)
    callback(info);
  } catch (error) {
    console.log(error);
  } 
};

export default SENDMAIL;

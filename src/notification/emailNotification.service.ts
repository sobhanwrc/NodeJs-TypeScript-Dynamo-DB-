import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

module.exports = function (emailType) {
  const emailFromUserName = process.env.GMAIL_USERNAME;
  const emailAuthPassword = Buffer.from(
    process.env.GMAIL_USER_PASSWORD,
    "base64"
  ).toString("ascii");
  const mailDict = {
    userVerifiedMail: {
      subject: "Email Verification",
      html: "../notification/emailTemplate/verifyEmail.html",
    },
    userWelcomeMail: {
      subject: "Welcome",
      html: "../notification/emailTemplate/welcomeEmail.html",
    },
    forgotPasswordEmail: {
      subject: "Forgot Password",
      html: "../notification/emailTemplate/forgotPassword.html",
    },
    addUserWithLoginCredential: {
      subject: "Create User",
      html: "../notification/emailTemplate/addUserWithLoginCredential.html",
    },
  };

  const filePath = path.join(__dirname, mailDict[emailType].html);
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailFromUserName,
      pass: emailAuthPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return function (to, data) {
    const self = {
      send: () => {
        const mailOption = {
          from: `ESA <emailFromUserName>`,
          to: to,
          bcc: "sanju.meghwal@rishabhsoft.com",
          subject: mailDict[emailType].subject,
        };

        const emailData = {
          ...data,
        };

        const emailObj = {
          ...mailOption,
          html: template(emailData),
        };

        transporter.sendMail(emailObj, function (error, response) {
          if (error) {
            return error.message;
          } else {
            console.log("Message sent to: " + response.accepted);
          }
        });
      },
    };
    return self;
  };
};

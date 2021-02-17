import nodemailer from 'nodemailer';
import fs from 'fs'
import path from 'path'
import handlebars from 'handlebars'

module.exports = function (emailType) {
    const emailFromUserName = process.env.GMAIL_USERNAME;
    const emailAuthPassword = Buffer.from(process.env.GMAIL_USER_PASSWORD, 'base64').toString('ascii')
    let mailDict = {
        "userVerifiedMail" : {
            subject : "Email Verification",
            html : "../notification/emailTemplate/verifyEmail.html"
        },
        "userWelcomeMail" : {
            subject : "Welcome",
            html : "../notification/emailTemplate/WelcomeEmail.html"
        }
    }

    const filePath = path.join(__dirname, mailDict[emailType].html);
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);

    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: emailFromUserName,
            pass: emailAuthPassword
        }, tls: {
            rejectUnauthorized: false
        }
    });

    return function (to, data) {
        let self = {
            send: () => {
                let mailOption = {
                    from : `ESA <emailFromUserName>`,
                    to : to,
                    subject : mailDict[emailType].subject
                }

                let emailData = {
                    ...data
                }

                const emailObj = {
                    ...mailOption,
                    html : template(emailData)
                }

                transporter.sendMail(emailObj, function(error, response){
                    if(error){
                        return error.message
                    }else{
                        console.log("Message sent to: " + response.accepted);
                    }
                });
            }
        }
        return self;
    }
}

// export async function sentEmail(toEmailId) {
//     var transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.GMAIL_USERNAME,//replace with your personal email id which isactie and enable it to allow low secured apps
//             pass: Buffer.from(process.env.GMAIL_USER_PASSWORD, 'base64').toString('ascii')// your email password
//         }, tls: {
//           rejectUnauthorized: false
//       }
//     });
//     var mailOptions={
//         to: toEmailId,// replace with receivers email address
//         subject: "test email",
//         html:"testing email feature with node mailer"
//       }
//     transporter.sendMail(mailOptions, function(error, response){
//         if(error){
//             return error.message
//         }else{
//             console.log("Message sent to: " + response.accepted);
//             return true
//         }
//     });
// }
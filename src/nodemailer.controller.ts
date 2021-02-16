import * as express from 'express';
import nodemailer from 'nodemailer';
import Controller from './interfaces/controller.interface';

class NodemailController implements Controller {
  public path = '/nodemailer'
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.nodemailer);
  }

  private nodemailer = async (req: express.Request, res: express.Response) => {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USERNAME,//replace with your personal email id which isactie and enable it to allow low secured apps
            pass: Buffer.from(process.env.GMAIL_USER_PASSWORD, 'base64').toString('ascii')// your email password
        }, tls: {
          rejectUnauthorized: false
      }
    });
    var mailOptions={
        to: "sobhan.dasr@gmail.com",// replace with receivers email address
        subject: "test email",
        html:"testing email feature with node mailer"
      }
  transporter.sendMail(mailOptions, function(error, response){
   if(error){
          console.log(error);
      res.end("error");
   }else{
          console.log("Message sent to: " + response.accepted);
      res.end("sent");
       }
});
  }
}


export default NodemailController;
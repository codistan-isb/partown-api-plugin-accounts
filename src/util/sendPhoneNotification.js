var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);
import Twilio from "twilio";

export default async function sendPhoneNotification(number, body) {
  return new Promise((resolve, reject) => {
    try {
      console.log("twilio send otp ", number, body);

      //Sending Reset OTP to user number
      client.messages
        .create({
          body: body,
          to: number,
          from: process.env.TWILIO_PHONE_NO,
        })
        .then((data) => {
          console.log(data);
          resolve(true);
        })
        .catch((err) => {
          console.log("testing");
          console.log(err);
          reject(err);
        });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

import sendEmailNotification from "../util/sendEmailNotification.js";
import sendPhoneNotification from "../util/sendPhoneNotification.js";

export default async function sendPlatformNotification(
  context,
  account,
  shop,
  headerMsg,
  msgBody,
  url
) {
  //   let promises = [];

  if (account?.userPreferences?.contactPreferences?.email) {
    await sendEmailNotification(
      account,
      shop,
      headerMsg,
      msgBody,
      url,
      context,
      "property/updates"
    );
  }

  if (account?.userPreferences?.contactPreferences?.sms) {
    await sendPhoneNotification(
      account?.profile?.phone,
      `${headerMsg} ${msgBody}`
    );
  }
}

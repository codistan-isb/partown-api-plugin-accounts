import _ from "lodash";
export default async function sendEmailNotification(
  account,
  shop,
  headerMsg,
  msgBody,
  url,
  context,
  bodyTemplate
) {
  console.log("reaching send email notification");

  // const bodyTemplate = "invite/user";

  let email = _.get(account, "emails[0].address");
  let firstName = _.get(account, "profile.firstName");
  let lastName = _.get(account, "profile.lastName");

  const emailForTemplate = "dev@partown.co";

  const linkedIn = "https://www.linkedin.com/";
  const logoImage = "https://i.imgur.com/xgJX3WK.jpeg";

  const dataForEmail = {
    logoImage,
    fullName: `${firstName} ${lastName}`,
    headerMsg,
    bodyMsg: msgBody,
    website: "dev@partown.co",
    email: emailForTemplate,
    linkedIn,
    url,
  };

  const language =
    (account.profile && account.profile.language) || shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: email,
  });
}

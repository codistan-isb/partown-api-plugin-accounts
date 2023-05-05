import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

export default async function inviteUserEmail(context, recipientEmail, userId) {
  const {
    collections: { Accounts, Shops },
  } = context;

  const bodyTemplate = "invite/user";

  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  // let email = _.get(account, "emails[0].address");
  const headerMsg = "You are invited to partOwn";
  const bodyMsg = "PartOwn Description";
  const website = "https://dev.partown.co/en?";
  const emailForTemplate = "dev@partown.co";
  const linkedIn = "https://www.linkedin.com/";
  const logoImage = "https://i.imgur.com/xgJX3WK.jpeg";
  const dataForEmail = {
    logoImage,
    userEmail: recipientEmail,
    headerMsg,
    bodyMsg,
    website,
    email: emailForTemplate,
    linkedIn,
    // url: "https://dev.partown.co/en?",
  };

  const language = shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: recipientEmail,
  });
}

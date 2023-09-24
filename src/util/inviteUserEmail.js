import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

export default async function inviteUserEmail(
  context,
  recipientEmail,
  registerToken,
  senderName
) {
  const {
    collections: { Accounts, Shops },
  } = context;

  const bodyTemplate = "invite/user";

  const registerUrl = `${process.env.CLIENT_URL}?registerToken=${registerToken}`;

  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");
  const currentYear = new Date().getFullYear();

  const dataForEmail = {
    name: senderName,
    registerUrl,
    facebook: process.env.FACEBOOK,
    twitter: process.env.TWITTER,
    instagram: process.env.INSTAGRAM,
    currentYear,
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

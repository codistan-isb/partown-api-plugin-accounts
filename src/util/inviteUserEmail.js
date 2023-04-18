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

  const dataForEmail = {
    url: "https://dev.partown.co/en?",
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

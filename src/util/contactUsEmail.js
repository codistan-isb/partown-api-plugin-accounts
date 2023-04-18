import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

export default async function contactUsEmail(context, args, userId) {
  const {
    collections: { Accounts, Shops },
  } = context;

  const bodyTemplate = "contact/platform";

  const account = await Accounts.findOne({ userId });

  if (!account) throw new ReactionError("not-found", "Account not found");

  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  let email = _.get(account, "emails[0].address");

  const dataForEmail = {
    url: "https://dev.partown.co/en?",
  };

  const language =
    (account.profile && account.profile.language) || shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: "dev@partown.co",
  });
}

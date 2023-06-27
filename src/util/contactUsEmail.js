import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

export default async function contactUsEmail(context, args) {
  const {
    collections: { Shops, Accounts },
  } = context;

  console.log("args in email function", args);

  const {
    firstName,
    lastName,
    email,
    contactNumber,
    officeAddress,
    emailMessage,
  } = args;

  const bodyTemplate = "contact/platform";

  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  const account = await Accounts.findOne({
    adminUIShopIds: { $ne: null, $exists: true },
  });
  let adminEmail = _.get(account, "emails[0].address");

  const dataForEmail = {
    firstName,
    lastName,
    email: email.toLowerCase(),
    contactNumber,
    officeAddress,
    emailMessage,
  };

  const language = shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: adminEmail,
  });
}

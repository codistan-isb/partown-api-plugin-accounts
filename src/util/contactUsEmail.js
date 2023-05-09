import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

export default async function contactUsEmail(context, args, userId) {
  const {
    collections: { Shops },
  } = context;

  const bodyTemplate = "contact/platform";

  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  const dataForEmail = {
    url: "https://dev.partown.co/en?",
  };

  const language = shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: "dev@partown.co",
  });
}

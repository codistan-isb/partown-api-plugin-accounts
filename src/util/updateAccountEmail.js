import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

export default async function updateAccountEmail(
  context,
  email,
  messageHeader,
  messageBody,
  url
) {
  const {
    collections: { Shops },
  } = context;

  const bodyTemplate = "generic/template";

  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  const dataForEmail = {
    messageHeader,
    messageBody,
    url,
    website: "dev.partown.co",
    email: "dev@partown.co",
    linkedIn: "https://linkedin.com/",
  };

  const language = shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: email,
  });
}

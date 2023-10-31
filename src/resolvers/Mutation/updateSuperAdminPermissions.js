import ReactionError from "@reactioncommerce/reaction-error";

export default async function updateSuperAdminPermissions(
  _,
  input,
  context,
  info
) {
  const { Accounts } = context.collections;

  console.log("in account startup function");

  const superAdminAccount = Accounts.findOne({
    adminUIShopIds: { $ne: null, $exists: true, $not: { $size: 0 } },
  });

  if (!superAdminAccount)
    throw new ReactionError("not-found", "Admin Account not found");

  console.log("super admin account is ", superAdminAccount);

  await Accounts.findOneAndUpdate(
    {
      adminUIShopIds: { $ne: null, $exists: true, $not: { $size: 0 } },
    },
    {
      $set: {
        identityVerified: true,
        accountPermissions: {
          manageUsers: ["read", "edit", "delete"],
          manageProperties: ["read", "edit", "delete"],
          manageReports: ["read", "edit", "delete"],
          manageRates: ["read", "edit", "delete"],
          managePermissions: ["read", "edit", "delete"],
          manageFunds: ["read", "edit", "delete"],
        },
      },
    }
  );

  return true;
}

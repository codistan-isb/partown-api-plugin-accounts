import _ from "lodash";
import addAccountAddressBookEntry from "./addAccountAddressBookEntry.js";
import addAccountEmailRecord from "./addAccountEmailRecord.js";
import addAccountToGroup from "./addAccountToGroup.js";
import createAccount from "./createAccount.js";
import createAccountGroup from "./createAccountGroup.js";
import grantAdminUIAccess from "./grantAdminUIAccess.js";
import inviteShopMember from "./inviteShopMember.js";
import removeAccountAddressBookEntry from "./removeAccountAddressBookEntry.js";
import removeAccountEmailRecord from "./removeAccountEmailRecord.js";
import removeAccountGroup from "./removeAccountGroup.js";
import removeAccountFromGroup from "./removeAccountFromGroup.js";
import revokeAdminUIAccess from "./revokeAdminUIAccess.js";
import sendResetAccountPasswordEmail from "./sendResetAccountPasswordEmail.js";
import setAccountDefaultEmail from "./setAccountDefaultEmail.js";
import updateAccount from "./updateAccount.js";
import updateAccountAddressBookEntry from "./updateAccountAddressBookEntry.js";
import updateAccountGroup from "./updateAccountGroup.js";
import updateAdminUIAccess from "./updateAdminUIAccess.js";
import updateGroupsForAccounts from "./updateGroupsForAccounts.js";
import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";
import checkUserPermissionsGroup from "../../util/checkUserPermissionsGroup.js";
import { generateRandomString } from "../../util/generateRandom.js";
import getAccountGroup from "../../util/getAccountGroup.js";
import getPermissionsMapping from "../../util/getPermissionsMapping.js";
import inviteUserEmail from "../../util/inviteUserEmail.js";
import ReactionError from "@reactioncommerce/reaction-error";
import contactUsEmail from "../../util/contactUsEmail.js";
import sendEmailNotification from "../../util/sendEmailNotification.js";
import sendPhoneNotification from "../../util/sendPhoneNotification.js";
import sendPlatformWideNotification from "../../jobs/sendPlatformWideNotification.js";
import sendPlatformNotification from "../../util/sendPlatformNotification.js";
import updateAccountEmail from "../../util/updateAccountEmail.js";
import account from "../Query/account.js";

import Random from "@reactioncommerce/random";
import updateSuperAdminPermissions from "./updateSuperAdminPermissions.js";

// // const Recaptcha = require("google-recaptcha");
// import Recaptcha from "google-recaptcha";
// const recaptcha = new Recaptcha({
//   secret: "6LdjCrcmAAAAAGWZSNqVxEKnqALklnOQPLPLkrH7",
// });

export default {
  updateSuperAdminPermissions,
  addAccountAddressBookEntry,
  addAccountEmailRecord,
  addAccountToGroup,
  createAccount,
  createAccountGroup,
  grantAdminUIAccess,
  inviteShopMember,
  removeAccountAddressBookEntry,
  removeAccountEmailRecord,
  removeAccountFromGroup,
  removeAccountGroup,
  revokeAdminUIAccess,
  sendResetAccountPasswordEmail,
  setAccountDefaultEmail,
  updateAccount,
  updateAccountAddressBookEntry,
  updateAccountGroup,
  updateAdminUIAccess,
  updateGroupsForAccounts,
  async verifyUserIdentification(parent, { accountId, shopId }, context, info) {
    try {
      let { Accounts } = context.collections;
      await context.validatePermissions("reaction:legacy:accounts", "create", {
        shopId,
      });
      const { result } = await Accounts.updateOne(
        {
          _id: decodeOpaqueId(accountId).id,
        },
        { $set: { identityVerified: true } }
      );
      return result?.n > 0;
    } catch (err) {
      return err;
    }
  },
  async rejectUserIdentification(parent, args, context, info) {
    try {
      const { userId, authToken, collections } = context;
      const { Accounts, Shops } = collections;
      const { accountId, cancellationReason, shopId } = args;
      const decodedAccountId = decodeOpaqueId(accountId).id;

      if (!userId || !authToken) return new Error("Unauthorized");

      await context.validatePermissions("reaction:legacy:accounts", "create", {
        shopId,
      });

      const account = await Accounts.findOne({ _id: decodedAccountId });

      const { result } = await Accounts.updateOne(
        {
          _id: decodedAccountId,
        },
        {
          $set: {
            govId: [],
            poAddress: [],
          },
        }
      );

      const firstName = _.get(account, "profile.firstName");
      const lastName = _.get(account, "profile.lastName");
      const fullName = `${firstName} ${lastName}`;

      const headerMsg = "Your account verification has been rejected";

      const shop = await Shops.findOne({ shopType: "primary" });
      if (!shop) throw new ReactionError("not-found", "Shop not found");

      let email = _.get(account, "emails[0].address");

      const dataForEmail = {
        fullName,
        headerMsg,
        bodyMsg: cancellationReason,
        website: "dev.partown.co",
        email: "dev@partown.co",
        linkedin: "https://www.linkedin.com",
      };

      const language =
        (account.profile && account.profile.language) || shop.language;

      if (result?.n > 0) {
        context.mutations.createNotification(context, {
          title: "Verification Rejected",
          details: cancellationReason,
          hasDetails: true,
          message: "",
          status: null,
          to: decodedAccountId,
          type: "banUser",
        });

        if (account?.userPreferences?.contactPreferences?.email) {
          context.mutations.sendEmail(context, {
            data: dataForEmail,
            fromShop: shop,
            templateName: "reject/invitation",
            language,
            to: email,
          });
        }
      }
    } catch (err) {
      return err;
    }
  },
  async banAccount(parent, { accountId, shopId }, context, info) {
    try {
      const { userId, authToken, collections } = context;

      if (!userId || !authToken) return new Error("Unauthorized");

      let { Accounts } = collections;

      const decodedAccountId = decodeOpaqueId(accountId).id;
      await context.validatePermissions("reaction:legacy:accounts", "create", {
        shopId,
      });

      const res = await Accounts.findOne({
        _id: decodedAccountId,
      });

      let msgString = res?.isBanned
        ? "Congratulations, your account has been restored"
        : "Your account has been banned";

      let titleString = res?.isBanned ? "Account Restored" : "Account Banned";

      const { result } = await Accounts.updateOne(
        {
          _id: decodedAccountId,
        },
        { $set: { isBanned: res?.isBanned ? !res?.isBanned : true } }
      );
      await context.mutations.createNotification(context, {
        title: titleString,
        details: msgString,
        hasDetails: true,
        message: "",
        status: null,
        to: decodedAccountId,
        type: "banUser",
        image:
          "https://images.pexels.com/photos/3172740/pexels-photo-3172740.jpeg?cs=srgb&dl=pexels-%E6%9D%8E%E8%BF%9B-3172740.jpg&fm=jpg&w=640&h=640",
      });

      return result?.n > 0;
    } catch (err) {
      return err;
    }
  },
  async addUserWallet(parent, args, context, info) {
    try {
      let { Accounts } = context.collections;
      let { user } = context;
      let { userId, wallet } = args.input;
      if (user) {
        let wallets = await Accounts.updateOne(
          { userId },
          {
            $inc: { "wallets.amount": wallet.amount },
            $set: { "wallets.currency": wallet.currency },
          }
        );
        console.log("walletInput", userId, wallet.currency, wallet.amount);
        return {
          // wallets,
          status: 200,
          success: true,
          message: `data found.`,
        };
      } else {
        return {
          success: false,
          message: `unAuthorized.`,
          status: 401,
        };
      }
    } catch (err) {
      console.log("Error", err);
      return {
        success: false,
        message: `Server Error ${err}.`,
        status: 500,
      };
    }
  },
  async updateUserFunds(parent, args, context, info) {
    try {
      let { Accounts } = context.collections;
      let { authToken } = context;
      let { wallet, userId } = args.input;

      if (!authToken || !context.userId) {
        return new Error("Unauthorized");
      }

      let wallets = await Accounts.updateOne(
        { userId: decodeOpaqueId(userId).id },
        {
          $inc: { "wallets.amount": wallet.amount },
          $set: { "wallets.currency": wallet.currency },
        }
      );

      return wallets?.result?.n > 0;
    } catch (err) {
      return err;
    }
  },
  async suspendUser(parent, args, context, info) {
    try {
      let { Accounts } = context.collections;
      let { user } = context;
      let { userId, suspend } = args;

      if (!user) {
        return false;
      }
      // let accountInfo = await Accounts.find({ userId }).toArray();

      const updatedStatus = await Accounts.updateOne(
        { userId },
        { $set: { suspend: Boolean(suspend) } }
      );
      console.log("*****updated suspension status result*****");
      console.log(updatedStatus);
      if (updatedStatus?.result?.n > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("update user suspension status ", err);
      return false;
    }
  },
  async createTransactionId(parent, args, context, info) {
    try {
      let { Accounts } = context.collections;
      let { user } = context;
      let { transactionId } = args;

      if (!user) {
        return false;
      }
      // let accountInfo = await Accounts.find({ userId }).toArray();
      let userId = user._id;
      const updatedId = await Accounts.updateOne(
        { userId },
        { $set: { transactionId: transactionId } }
      );
      console.log("*****updated transaction Id result result*****");
      console.log(updatedId);
      if (updatedId?.result?.n > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("create user transaction Id ", err);
      return false;
    }
  },
  async updateUserPermissions(parent, args, context, info) {
    try {
      const { authToken, userId, collections } = context;
      const { Accounts } = collections;
      const { accountId, shopId, input } = args;
      const decodedShopId = decodeOpaqueId(shopId).id;

      let { permissionsArray, additionalPermissionsArray } =
        getPermissionsMapping(input); // Destructure the result of getPermissionsMapping into two variables

      if (!authToken || !userId) return new Error("Unauthorized");

      await context.validatePermissions("reaction:legacy:groups", "update", {
        shopId: decodedShopId,
      });

      //throw an error if the super user permissions are changed

      const decodedAccountId = decodeOpaqueId(accountId).id;

      const { _id: superAdminId } = await Accounts.findOne({
        adminUIShopIds: { $ne: null },
      });

      if (superAdminId === decodedAccountId)
        return new Error(
          "Access Denied, cannot update super admin permissions"
        );

      const { check1, check2 } = await checkUserPermissionsGroup(
        context,
        decodedAccountId
      );

      if (!check1) {
        let random = generateRandomString(6);
        const { group } = await context.mutations.createAccountGroup(
          context.getInternalContext(),
          {
            group: {
              name: `product-${random}`,
              slug: `product-${random}`,
            },
            createdBy: userId,
            shopId: decodedShopId,
          }
        );

        await Accounts.update(
          {
            _id: decodedAccountId,
          },
          { $set: { groups: [group?._id], accountPermissions: input } }
        );
      }

      let groupId = await getAccountGroup(context, decodedAccountId);

      const groupInput = {
        group: {
          permissions: permissionsArray,
        },
      };

      await context.mutations.updateAccountGroup(context, {
        ...groupInput,
        groupId: groupId[0],
        shopId: decodedShopId,
      });

      const additionalGroupInput = {
        // Create an additional group input object for additional permissions
        group: {
          permissions: additionalPermissionsArray,
        },
      };

      if (!check2) {
        const random2 = generateRandomString(6);
        // Create a new group with additional permissions if needed

        const { group: additionalGroup } =
          await context.mutations.createAccountGroup(
            context.getInternalContext(),
            {
              group: {
                name: `users-${random2}`,
                slug: `users-${random2}`,
                permissions: additionalPermissionsArray,
              },
              createdBy: userId,
            }
          );
        await Accounts.update(
          {
            _id: decodedAccountId,
          },
          { $push: { groups: additionalGroup?._id } }
        );
      }

      await context.mutations.updateAccountGroup(context, {
        ...additionalGroupInput,
        groupId: groupId[1],
      });

      await Accounts.update(
        { _id: decodedAccountId },
        { $set: { accountPermissions: input } }
      );
      return true;
    } catch (err) {
      console.log("update user permissions error");
      return err;
    }
  },
  async updateUserWallet(parent, args, context, info) {
    try {
      let { Accounts } = context.collections;
      let { authToken } = context;
      let { wallet, userId } = args.input;

      if (!authToken || !context.userId) {
        return new Error("Unauthorized");
      }

      let { result } = await Accounts.updateOne(
        { userId: decodeOpaqueId(userId).id },
        {
          $set: {
            "wallets.amount": wallet.amount,
            "wallets.escrow": wallet.escrow,
          },
        }
      );

      return result?.n > 0;
    } catch (err) {
      return err;
    }
  },
  async inviteUser(parent, { emails, invitationExpiry }, context, info) {
    try {
      const { userId, authToken, collections } = context;
      const { Accounts, InvitedUsers } = collections;
      if (!userId || !authToken) return new Error("Unauthorized");

      // await context.validatePermissions("reaction:legacy:accounts", "create");

      const account = await Accounts.findOne({ _id: userId });

      const senderName = account?.profile?.firstName;

      let today = new Date();
      let expiryDate = new Date();

      expiryDate.setDate(today.getDate() + 2);

      expiryDate = expiryDate.toISOString();

      const lowerCaseArray = emails.map((item) => item.toLowerCase());
      let registerToken = [];
      let bulkOperations = lowerCaseArray.map((item, key) => {
        registerToken[key] = generateRandomString(32);
        return {
          updateOne: {
            filter: {
              email: item,
            },
            update: {
              $set: {
                email: item,
                dateSent: today,
                expirationTime: expiryDate,
                isRegistered: false,
                registerToken: registerToken[key],
                invitedBy: userId,
              },
            },
            upsert: true,
          },
        };
      });

      const { result } = await InvitedUsers.bulkWrite(bulkOperations);

      lowerCaseArray.forEach(async (email, index) => {
        await inviteUserEmail(context, email, registerToken[index], senderName);
      });

      return result?.ok > 0;
    } catch (err) {
      return err;
    }
  },
  async cancelInvitation(parent, { email }, context, info) {
    try {
      const { userId, authToken, collections } = context;
      const { InvitedUsers } = collections;

      if (!userId || !authToken) return new Error("Unauthorized");
      await context.validatePermissions("reaction:legacy:accounts", "create");
      email = email.toLowerCase();
      const { result } = await InvitedUsers.deleteOne({ email });
      console.log("result is ", result);
      return result?.n > 0;
    } catch (err) {
      return err;
    }
  },

  async contactUs(parent, { input, token }, context, info) {
    try {
      // const result = await recaptcha.verify(token);

      // if (!result.success) {
      //   throw new Error("reCAPTCHA verification failed.");
      // }

      await contactUsEmail(context, input);
      return null;
    } catch (err) {
      return err;
    }
  },
  async sendCustomNotification(parent, { input, productId }, context, info) {
    try {
      const { userId, authToken, collections, mutations, backgroundJobs } =
        context;

      const { Accounts, Shops, Trades, Catalog } = collections;

      const shop = await Shops.findOne({ shopType: "primary" });
      if (!shop) throw new ReactionError("not-found", "Shop not found");

      const { headerMsg, msgBody, url } = input;
      const decodedProductId = decodeOpaqueId(productId).id;
      const { product } = await Catalog.findOne({
        "product._id": decodedProductId,
      });
      const decodedManagerId = decodeOpaqueId(product?.manager).id;
      await sendPlatformNotification(
        context,
        account,
        shop,
        headerMsg,
        msgBody,
        url
      );
      console.log("product manager is ", decodedManagerId);

      const trades = await Trades.find({
        productId: decodedProductId,
      }).toArray();

      trades.push({ createdBy: decodedManagerId });

      trades?.map(async (item, key) => {
        console.log("item is ", item);
        const account = await Accounts.findOne({ _id: item?.createdBy });
        await sendPlatformNotification(
          context,
          account,
          shop,
          headerMsg,
          msgBody,
          url
        );
      });

      return null;
      // const jobData = { shop, accounts, headerMsg, msgBody, url };

      // console.log("running job 1");
      // const test = await backgroundJobs.scheduleJob({
      //   type: "platformEmails",
      //   data: jobData,
      //   retry: {
      //     retries: 5,
      //     wait: 3 * 60000,
      //   },
      // });

      // console.log("test is ", test);
      return null;
    } catch (err) {
      return err;
    }
  },
  // async trusteeNotifications(parent, args, context, info) {
  //   try {
  //     const { userId, authToken, collections, mutations, backgroundJobs } =
  //       context;

  //     const { Accounts, Shops, Trades } = collections;

  //     const shop = await Shops.findOne({ shopType: "primary" });
  //     if (!shop) throw new ReactionError("not-found", "Shop not found");

  //     const { headerMsg, msgBody, url } = input;
  //     const decodedProductId = decodeOpaqueId(productId).id;
  //     const trades = await Trades.find({
  //       productId: decodedProductId,
  //     }).toArray();

  //     console.log("trades are ", trades);
  //     trades?.map(async (item, key) => {
  //       const account = await Accounts.findOne({ _id: item?.createdBy });
  //       await sendPlatformNotification(
  //         context,
  //         account,
  //         shop,
  //         headerMsg,
  //         msgBody,
  //         url
  //       );
  //     });

  //     return null;
  //     // const jobData = { shop, accounts, headerMsg, msgBody, url };

  //     // console.log("running job 1");
  //     // const test = await backgroundJobs.scheduleJob({
  //     //   type: "platformEmails",
  //     //   data: jobData,
  //     //   retry: {
  //     //     retries: 5,
  //     //     wait: 3 * 60000,
  //     //   },
  //     // });

  //     // console.log("test is ", test);
  //     return null;
  //   } catch (err) {
  //     return err;
  //   }
  // },
  async accountUpdateNotification(parent, { input, accountId }, context, info) {
    try {
      const { userId, authToken, collections, mutations, backgroundJobs } =
        context;

      const { Accounts, Shops, Trades } = collections;

      const shop = await Shops.findOne({ shopType: "primary" });
      if (!shop) throw new ReactionError("not-found", "Shop not found");

      const decodedAccountId = decodeOpaqueId(accountId).id;
      const { headerMsg, msgBody, url } = input;

      const account = await Accounts.findOne({ _id: decodedAccountId });

      const email = account?.emails[0]?.address;

      if (account?.userPreferences?.contactPreferences?.email) {
        await updateAccountEmail(context, email, headerMsg, msgBody, url);
      }
      if (account?.userPreferences?.contactPreferences?.sms) {
        console.log("sms notification");
      }
      context.mutations.createNotification(context, {
        title: headerMsg,
        details: msgBody,
        hasDetails: true,
        message: "",
        status: null,
        to: decodedAccountId,
        type: "banUser",
      });

      return null;
    } catch (err) {
      return err;
    }
  },
};

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

export default {
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
  async banAccount(parent, { accountId, shopId }, context, info) {
    try {
      let { Accounts } = context.collections;
      const decodedAccountId = decodeOpaqueId(accountId).id;
      await context.validatePermissions("reaction:legacy:accounts", "create", {
        shopId,
      });
      const { result } = await Accounts.updateOne(
        {
          _id: decodedAccountId,
        },
        { $set: { isBanned: true } }
      );
      await context.mutations.createNotification(context, {
        details: "Account Suspension",
        hasDetails: true,
        message: "Your Account has been banned",
        to: decodedAccountId,
        type: "banUser",
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

      let permissions = getPermissionsMapping(input);

      if (!authToken || !userId) return new Error("Unauthorized");

      await context.validatePermissions("reaction:legacy:groups", "update", {
        shopId: decodedShopId,
      });

      const decodedAccountId = decodeOpaqueId(accountId).id;
      const check = await checkUserPermissionsGroup(context, decodedAccountId);

      if (!check) {
        let random = generateRandomString();
        const { group } = await context.mutations.createAccountGroup(
          context.getInternalContext(),
          {
            group: {
              name: random,
              slug: random,
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
          permissions: permissions,
        },
      };

      console.log("group id is ", groupId);

      await context.mutations.updateAccountGroup(context, {
        ...groupInput,
        groupId: decodeOpaqueId(groupId).id,
        shopId: decodedShopId,
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
};

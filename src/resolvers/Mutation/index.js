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
      let { user } = context;
      let { wallet } = args.input;
      console.log("user is ");
      console.log(user);
      let userId = user._id;
      if (user) {
        let wallets = await Accounts.updateOne(
          { userId },
          {
            $inc: { "wallets.amount": wallet.amount },
            $set: { "wallets.currency": wallet.currency },
          }
        );
        console.log("walletInput", wallet.currency, wallet.amount);

        console.log("update output is ");
        console.log(wallets);
        if (wallets?.result?.n > 0) {
          return {
            // wallets,
            status: 200,
            success: true,
            message: `data found.`,
          };
        } else {
          return {
            // wallets,
            status: 200,
            success: false,
            message: `not updated`,
          };
        }
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
};

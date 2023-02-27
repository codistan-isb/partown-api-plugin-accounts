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
      let { userId, wallet } = args.input;

      if (!user) {
        return {
          success: false,
          message: "User not found",
          status: 200,
        };
      }
      let accountInfo = await Accounts.find({ userId }).toArray();

      const prevAmount = accountInfo[0].wallets.amount;
      let newAmount = prevAmount + wallet.amount;
      console.log("prevAmount is ", prevAmount);
      console.log("new amount is ", newAmount);
      const updatedWallet = await Accounts.updateOne(
        { userId },
        { $set: { "wallets.amount": newAmount } }
      );
      console.log("*****updated wallet result*****");
      console.log(updatedWallet);
      if (updatedWallet?.result?.n > 0) {
        return {
          success: true,
          message: "wallet amount updated successfully",
          status: 200,
        };
      }
    } catch (err) {
      console.log("Add Funds to Wallet Mutation", err);
      return {
        success: false,
        message: `Server Error ${err}`,
        status: 500,
      };
    }
  },
  async addSuspensionStatus(parent, args, context, info) {
    try {
      let { Accounts } = context.collections;
      let { user } = context;
      let { userId, suspend } = args;

      console.log("user is ");
      console.log(user);

      console.log("user suspension status is ");
      console.log(suspend);

      // console.log("suspend is ");
      // console.log(suspend);
      // console.log(typeof suspend);
      // console.log("args are ");
      // console.log(args);
      // console.log("user suspension status");
      // console.log(user.suspend);
      // if (user) {
      //   let suspendStatus = await Accounts.updateOne(
      //     { userId },
      //     {
      //       $set: { suspend: Boolean(suspend) },
      //     }
      //   );
      //   if (suspendStatus) {
      //     return suspendStatus;
      //   } else {
      //     return false;
      //   }
      // }
    } catch (err) {
      console.log("Error", err);

      return false;
    }
  },
};

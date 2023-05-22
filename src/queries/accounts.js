/**
 * @name accounts
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns accounts optionally filtered by group IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} [input.groupIds] - Array of group IDs to limit the results
 * @param {String} [input.notInAnyGroups] - Return accounts that aren't part of any groups
 * @returns {Promise} Mongo cursor
 */

const permissions = [
  "manageUsers",
  "manageProperties",
  "manageReports",
  "manageRates",
  "managePermissions",
  "manageFunds",
];

export default async function accounts(context, input) {
  const { collections } = context;
  const { Accounts } = collections;
  const { groupIds, notInAnyGroups, searchQuery, filter } = input;

  await context.validatePermissions("reaction:legacy:accounts", "read");

  const selector = {};
  if (groupIds && notInAnyGroups) {
    selector.$or = [
      {
        groups: {
          $in: groupIds,
        },
      },
      {
        groups: {
          $in: [null, []],
        },
      },
    ];
  } else if (groupIds) {
    selector.groups = { $in: groupIds };
  } else if (notInAnyGroups) {
    selector.groups = { $in: [null, []] };
  }

  if (searchQuery) {
    selector.$or = [
      {
        "emails.0.address": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "profile.firstName": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "profile.lastName": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "profile.phone": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
      {
        "profile.transactionId": {
          $regex: new RegExp(searchQuery, "i"),
        },
      },
    ];
  }
  if (filter === "pending") {
    selector.identityVerified = false;
  } else if (filter === "blocked") {
    selector.isBanned = true;
  } else if (filter === "active") {
    selector.accountPermissions = { $exists: true };
    Object.keys(selector.accountPermissions).forEach((permission) => {
      selector[`accountPermissions.${permission}`] = { $not: { $size: 0 } };
    });
  } else if (filter === "inactive") {
    selector.$or = [
      { accountPermissions: { $exists: false } },
      { accountPermissions: { $size: 0 } },
    ];
  }

  return Accounts.find(selector);
}

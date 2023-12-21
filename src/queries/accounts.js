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
  const { groupIds, notInAnyGroups, searchQuery, filter, adminFilter } = input;

  await context.validatePermissions("reaction:legacy:accounts", "read");

  const conditions = [];

  // Logic for groupIds and notInAnyGroups
  // (omitted for brevity, use the existing logic for groupIds and notInAnyGroups)

  // Logic for searchQuery
  if (searchQuery) {
    const searchConditions = {
      $or: [
        { "emails.0.address": { $regex: new RegExp(searchQuery, "i") } },
        { "profile.firstName": { $regex: new RegExp(searchQuery, "i") } },
        { "profile.lastName": { $regex: new RegExp(searchQuery, "i") } },
        { "profile.phone": { $regex: new RegExp(searchQuery, "i") } },
        { "profile.transactionId": { $regex: new RegExp(searchQuery, "i") } },
      ],
    };
    conditions.push(searchConditions);
  }

  // Logic for filter
  if (filter === "pending") {
    conditions.push({ identityVerified: false });
  } else if (filter === "blocked") {
    conditions.push({ isBanned: true });
  } else if (filter === "active") {
    const activeConditions = {
      $and: [
        { accountPermissions: { $exists: true } },
        {
          $or: [
            { "accountPermissions.manageUsers": { $not: { $size: 0 } } },
            { "accountPermissions.manageProperties": { $not: { $size: 0 } } },
            { "accountPermissions.manageReports": { $not: { $size: 0 } } },
            { "accountPermissions.manageRates": { $not: { $size: 0 } } },
            { "accountPermissions.managePermissions": { $not: { $size: 0 } } },
          ],
        },
      ],
    };
    conditions.push(activeConditions);
  } else if (filter === "inactive") {
    const inactiveConditions = {
      $or: [
        { accountPermissions: { $exists: false } },
        { accountPermissions: { $size: 0 } },
        {
          $and: [
            {
              "accountPermissions.manageUsers": { $size: 0 },
              "accountPermissions.manageProperties": { $size: 0 },
              "accountPermissions.manageReports": { $size: 0 },
              "accountPermissions.manageRates": { $size: 0 },
              "accountPermissions.managePermissions": { $size: 0 },
            },
          ],
        },
      ],
    };
    conditions.push(inactiveConditions);
  }

  // Combine conditions based on filter
  let finalQuery = {};
  if (conditions.length > 0) {
    finalQuery = { $and: conditions };
  }

  console.log("final query is ", finalQuery);

  return Accounts.find(finalQuery);
}

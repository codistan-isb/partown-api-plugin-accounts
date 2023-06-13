import sendPlatformNotification from "../util/sendPlatformNotification.js";

/**
 * @name sendPlatformWideNotification
 * @summary send platform wide notification depending on user preferences
 * @param {Object} context App context
 * @returns {undefined}
 */
const jobType = "platformEmails";

export default async function sendPlatformWideNotification(context) {
  console.log("coming to function");

  await context.backgroundJobs.addWorker({
    type: jobType,
    workTimeout: 180 * 1000,
    async worker(job) {
      const { shop, accounts, headerMsg, msgBody, url } = job.data;

      try {
        await sendPlatformNotification(
          context,
          accounts,
          shop,
          headerMsg,
          msgBody,
          url
        );
        job.done(`${jobType} job done`, { repeatId: true });
      } catch (error) {
        job.fail(`Failed to send platform emails and sms. Error: ${error}`);
      }
    },
  });
}

// return backgroundJobs.scheduleJob({
//   type: "sendEmail",
//   data: jobData,
//   retry: {
//     retries: 5,
//     wait: 3 * 60000,
//   },
// });

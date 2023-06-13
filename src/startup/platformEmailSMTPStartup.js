import sendPlatformWideNotification from "../jobs/sendPlatformWideNotification.js";

/**
 * @name startup
 * @summary Called on startup. Initializes Platform wide notifications handler.
 * @param {Object} context App context
 * @returns {undefined}
 */
export default function platformEmailSMTPStartup(context) {
  console.log("registering startup function");

  context.appEvents.on("platformEmails", () =>
    sendPlatformWideNotification(context)
  );
}

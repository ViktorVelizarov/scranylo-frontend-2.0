// This listener triggers when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
  // This creates a context menu item for the extension.
  chrome.contextMenus.create({
    id: "SUextension",
    title: "SU extension",
    contexts: ["all"],
  });
});

// This listener triggers when any tab is updated.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // The action is performed only when the tab update status is 'complete' and the tab is active.
  if (changeInfo.status == "complete" && tab.active) {
    // Checks if the URL of the tab matches the LinkedIn profile or company URL pattern.
    if (/^https:\/\/www\.linkedin\.com\/(in\/[^\/]{2,}|company\/[^\/]{2,})\/$/.test(tab.url)) {
      // Sends a message to the tab to open a modal window of the extension (main UI on the right side)
      chrome.tabs.sendMessage(tabId, { type: "openModal" });
      // This listener triggers when a message is received from the runtime.
      chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        // If the message contains specific data (it will be setted when extension finish upload of the candidate's data to the Google Sheet)
        if (
          request &&
          request.data &&
          request.data.subject === "succesfull_upload"
        ) {
          // Sends another message to the tab to show popup with satus of the candidate's data upload to the Google Sheet
          chrome.tabs.sendMessage(tabId, {
            type: "showSuccesfullStatus",
            content: request.data.content,
          });
          // Responds to the sender.
          sendResponse(tabId);
        } else {
          // If the message received doesn't match the expected structure, logs information for debugging.
          console.log("other message");
          console.log(request);
          console.log(tab.url);
        }
      });
    }
  }
});

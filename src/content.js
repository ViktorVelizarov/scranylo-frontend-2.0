// Add an event listener for incoming messages from the background script
chrome.runtime.onMessage.addListener((request) => {
  // Check if the received message is to open a modal (open main modal window with extension's UI)
  if (request.type === "openModal") {
    // Fetch the modal iframe if it exists and the LinkedIn body
    let iframe = document.querySelector("body #SUscrapeModal");
    let linkedinBody = document.querySelector("body[dir=ltr]");
    // If the modal iframe does not exist and LinkedIn body exists, proceed to create the modal
    if (iframe === null && linkedinBody != null) {
      let modal = document.createElement("div");
      modal.setAttribute(
        "style",
        "height: 81vh; width: 40rem; position: fixed; top: 10.25rem; right: 0;z-index: 100; background: #FFC85C; padding: 3.25rem 2rem 1rem 2rem; font-family: sans-serif; border-radius: 1rem;"
      );
      modal.setAttribute("id", "SUscrapeModal");
      // Insert the iframe and the closing button into the modal div
      modal.innerHTML = `<iframe id="scrape" style="height: 100%; width:100%"></iframe>
                       <div style="position:absolute; top: 0px; right: 5px;">
                        <button style="font-size: 3rem; font-weight: 400; color: #393e41; user-select:none;">&#10006;</button>
                       </div>`;
      // Append the modal to the body of the webpage
      document.body.appendChild(modal);
      // Fetch the iframe by its id and set its source and frameBorder attributes
      const iframe = document.getElementById("scrape");
      iframe.src = chrome.runtime.getURL("popup.html");
      iframe.frameBorder = 0;
      // Create the openModal div that will be shown when the modal is closed
      let openModal = document.createElement("div");
      openModal.setAttribute(
        "style",
        "height: 5rem; width: 3rem; top: 10.25rem; right: 0; z-index: 100; position: fixed; justify-content: center; align-items: center; background: #FFC85C; border-radius: 1rem 0 0 1rem; display: none"
      );
      openModal.setAttribute("id", "openModal");
      openModal.innerHTML = `<div style="cursor: pointer; user-select:none;">&#10010;</div>`;
      // Append the openModal div to the body of the webpage
      document.body.appendChild(openModal);
      // Add event listener to the modal close button to hide the modal and show the openModal div when clicked
      modal.querySelector("button").addEventListener("click", () => {
        modal.style.display = "none";
        openModal.style.display = "flex";
      });
      // Add event listener to the openModal div to hide it and show the modal when clicked
      openModal.querySelector("div").addEventListener("click", () => {
        openModal.style.display = "none";
        modal.style.display = "block";
      });
    }
  }
  // Check if the received message is to show a success status popup after candidate's data upload to the Google Sheet
  if (request.type === "showSuccesfullStatus") {
    // Fetch the stateModal if it exists and the LinkedIn body
    let stateModal = document.querySelector("body #SUstateModal");
    let linkedinBody = document.querySelector("body[dir=ltr]");
    // If the stateModal does not exist or is hidden and the LinkedIn body exists, proceed to create/show the stateModal
    if (
      (stateModal == null && linkedinBody !== null) ||
      (stateModal !== null &&
        stateModal.style.display == "none" &&
        linkedinBody !== null)
    ) {
      // Create a div element for the modal
      let modal = document.createElement("div");
      modal.setAttribute(
        "style",
        "min-height: 7rem; width: 100vw; position: fixed; top: 3rem; left: 0; z-index: 100; display: flex; align-items: center; justify-content: center;"
      );
      modal.setAttribute("id", "SUstateModal");
      modal.innerHTML = `<div style="width: 50rem; background: #EDF7ED; padding: 2rem; border-radius: 1rem; display: flex; justify-content: center;">
          <div style="height: 100%; margin-right: 2rem;">&#x2714;</div><div>
            <h1 style="font-size: 2rem; font-weight: 400">
              ${request.content}
            </h1>
          </div>
        </div>`;
      // Append the modal to the body of the webpage
      document.body.appendChild(modal);
      // Set a timeout to hide the modal after 2 seconds
      setTimeout(() => {
        modal.style.display = "none";
      }, 2000);
    }
  }
});

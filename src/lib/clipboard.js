// The function copies the provided errorMessage to the system clipboard after a 1 second delay.
export function writeToClipboard(errorMessage) {
  setTimeout(() => navigator.clipboard.writeText(errorMessage), 1000);
}

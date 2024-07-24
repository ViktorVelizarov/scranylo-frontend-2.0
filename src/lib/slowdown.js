// function calculates the time difference between the current time and the time of first interaction of the sourcer with the page. If this difference is greater than or equal to 10 seconds, the function returns 0. Otherwise, it returns the remaining time till 10 seconds. It helps to slow down page switches, ensuring LinkedIn doesn't block the sourser.
export function calculateSlowdownTime(firstInteraction) {
  let currentTime = new Date();
  let timeDifference = currentTime - firstInteraction;
  let maxTimeInMilliseconds = 10 * 1000;
  if (timeDifference >= maxTimeInMilliseconds) {
    return 0;
  } else {
    return maxTimeInMilliseconds - timeDifference;
  }
}

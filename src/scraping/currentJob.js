// file contains a function which will find the current or last position in which the candidate is (were) working in the experience section.

export function getCurrent(){
  // Create an object to store the extracted information
  let info = {};
  // Extract the main profile's section
  let mainExp = document.querySelector("main").innerText;
  // Remove all html tags from the extracted content
  let exp = mainExp.replace(/<\/?[^>]+(>|$)/g, "").split("\n");

  // Loop through each line of the experience text
  for (let i in exp) {
    // Check if the line matches the pattern for dates (either years or 'Present', optionally followed by a duration)
    if (/((\d{4})|(Present)) ·( \d+ yrs?)?( \d+ mo(s)?)?$/g.test(exp[i])) {
      let j = 0;
      // Loop upwards through the lines until reaching a line that starts with 'Experience' or 'Show all activity'
      while (
        !/^Experience/.test(exp[i - j]) &&
        !/^Show all activity/.test(exp[i - j - 2])
      ) {
        j++;
        // If the job type hasn't been found yet, check the current line for a match
        if (!info["type"]) {
          info["type"] = exp[i - j].match(
            /(Full-time)|(Contract)|(Part-time)|(Freelance)|(Self-employed)/gm
          );
        }
        // If there's still no job type, set it to null
        if (!info["type"]) {
          info["type"] = null;
        }
      }
      // If no job type was found in the entire block, set it to 'N/A'
      if (info["type"] === null) {
        info["type"] = "N/A";
      }
      // Extract the start and end dates of the job
      let dates = exp[i].match(
        /(Jan |Feb |Mar |Apr |May |Jun |Jul |Aug |Sep |Oct |Nov |Dec )?[12]\d{3}/g
      );
      // Convert each date string to a Date object
      for (let j in dates) {
        dates[j] = new Date(dates[j]);
      }
      // If the job is currently ongoing, add the current date as the end date
      if (exp[i].match(/Present/)) {
        dates.push(new Date());
      }
      // Calculate the total number of days between the start and end dates
      info["days"] = Math.round((dates[1] - dates[0]) / (1000 * 60 * 60 * 24));

      // Extract additional information depending on the structure of the job block
      if (j > 5) {
        // For larger blocks, the company name is 1 line below the job typ
        info["company"] = exp[i - j + 1];
        // The position is either 3 or 1 line above the dates, depending on whether a job type was found
        if (
          /(Full-time)|(Contract)|(Part-time)|(Freelance)|(Self-Employed)/.test(
            exp[i - 1]
          )
        ) {
          info["position"] = exp[i - 3];
        } else {
          info["position"] = exp[i - 1];
        }
        // Extract the duration of the job in years and months
        let years = exp[i - j + 3].match(/\d+ yrs?/gm);
        if (years === null) {
          years = 0;
        } else {
          years = years[0].split(" ");
          years = years[0];
        }
        let months = exp[i - j + 3].match(/\d+ mo(s)?/gm);
        if (months === null) {
          months = 0;
        } else {
          months = months[0].split(" ");
          months = months[0];
        }
        // Convert the years and months to days and compare it with the previously calculated total days
        let generalDays = years * 365 + months * 30;
        if (generalDays > info["days"]) {
          info["days"] = generalDays;
        }
      } else {
        // For smaller blocks, the company name is part of the line above the dates
        info["company"] = exp[i - 1].split(" · ");
        info["company"] = info["company"][0];
        // The position is 1 line above the dates
        info["position"] = exp[i - j + 1];
      }
      console.log("Current--------------");
      console.log("Type: " + info["type"]);
      console.log("Position: " + info["position"]);
      console.log("Company: " + info["company"]);
      console.log("Days: " + (info["days"] / 365).toFixed(1));
      // Stop the loop after the first job block
      break;
    }
  }
  // Return the extracted information
  return info;
};

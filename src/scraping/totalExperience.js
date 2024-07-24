// file contains a function that calculates the candidate's total work experience based on the jobs listed in the candidate's profile and in the job descriptions the function uses regexes to select all relevant skills for the job (skillsRegex) and for all relevant skills (allSkillsRegex)

export function getExp(skillsRegex, allSkillsRegex) {
  // Convert provided regular expressions into RegExp objects for global, multiline, and case-insensitive matching
  skillsRegex = new RegExp(skillsRegex, "gmi");
  allSkillsRegex = new RegExp(allSkillsRegex, "gmi");
  // Initialize an empty object to store the extracted information
  let info = {};
  info["workDays"] = 0;
  // Query all buttons with class '.pvs-navigation__text', these buttons are used to expand sections in LinkedIn
  let showAllBtns = document.querySelectorAll(".pvs-navigation__text");
  for (let i in showAllBtns) {
    // Retrieve the text content of each button
    const btnText = showAllBtns[i].innerText;
    // If a button has text matching "Show all <number> experiences", it is the button for expanding the experiences section
    if (/Show all \d+ experiences/.test(btnText)) {
      const link = showAllBtns[i].parentElement;
      // Trigger a click on the button to expand all experiences
      link.click();
      // Promise to handle asynchronous behaviour after clicking the button
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let mainExp = document.querySelector("main").innerText;
          // get relevant skills from the subpage with all experience
          info["skills"] = mainExp.match(skillsRegex);
          if (info["skills"]) {
            // remove duplicated skills
            info["skills"] = info["skills"].filter((item, pos, self) => {
              return self.indexOf(item) == pos;
            });
            // remove matched word boundaries
            info["skills"] = info["skills"].map((item) =>
              item.substr(1, item.length - 2)
            );
          } else {
            info["skills"] = [];
          }

          // get all skills from the subpage with all experience
          info["allSkills"] = mainExp.match(allSkillsRegex);
          if (info["allSkills"]) {
            // remove duplicated skills
            info["allSkills"] = info["allSkills"].filter((item, pos, self) => {
              return self.indexOf(item) == pos;
            });
          } else {
            info["allSkills"] = [];
          }
          console.log("all skills in experience:");
          console.log(info["allSkills"]);
          // Remove HTML tags from the main experience text and split it into separate lines
          let expText = mainExp.replace(/<\/?[^>]+(>|$)/g, "").split("\n");
          // Filter out duplicate lines
          let exp = expText.filter(function (elem, pos) {
            return expText.indexOf(elem) == pos;
          });
          // Initialize an empty array to store dates from the experience
          let lastDates = [];

          for (let i in exp) {
            // If a line matches a specific date format (year and potentially month), it's considered as a work experience timeline
            if (
              /((\d{4})|(Present)) ·( \d+ yrs?)?( \d+ mo(s)?)?$/g.test(exp[i])
            ) {
              console.log(exp[i]);
              // Extract all date components from the experience timeline
              let dates = exp[i].match(
                /(Jan |Feb |Mar |Apr |May |Jun |Jul |Aug |Sep |Oct |Nov |Dec )?[12]\d{3}/g
              );
              // Convert each extracted date component into a JavaScript Date object
              for (let j in dates) {
                dates[j] = new Date(dates[j]);
              }
              // If the timeline includes the word 'Present', it's an ongoing experience, add the current date as the end date
              if (exp[i].match(/Present/)) {
                dates.push(new Date());
              }
              // Calculate work days from the dates and update 'workDays' in the 'info' object. The logic here handles overlapping dates and calculates the total days correctly
              if (dates.length === 1) {
                info["workDays"] += 365;
              } else {
                if (lastDates.length === 0) {
                  info["workDays"] = Math.round(
                    (dates[1] - dates[0]) / (1000 * 60 * 60 * 24)
                  );
                  lastDates[0] = dates[0];
                  lastDates[1] = dates[1];
                } else if (lastDates[0] > dates[1]) {
                  info["workDays"] += Math.round(
                    (dates[1] - dates[0]) / (1000 * 60 * 60 * 24)
                  );
                  lastDates[0] = dates[0];
                  lastDates[1] = dates[1];
                } else if (
                  lastDates[0] <= dates[1] &&
                  lastDates[0] > dates[0]
                ) {
                  info["workDays"] -= Math.round(
                    (lastDates[1] - lastDates[0]) / (1000 * 60 * 60 * 24)
                  );
                  info["workDays"] += Math.round(
                    (lastDates[1] - dates[0]) / (1000 * 60 * 60 * 24)
                  );
                  lastDates[0] = dates[0];
                }
              }
            }
          }
          // Go back to the previous page in the browser history
          history.back();
          // Resolve the promise and return the 'info' object
          resolve(info);
        }, 1000);
      });
      // if we didn't found btn that contains text "Show all X experiences, then this page doesn't have it and it will be enough to find all experiences on the main page of the candidate". Skills we already scraped from the whole page in the getInfo.js function
    } else if (i == showAllBtns.length - 1) {
      let mainExp = document.querySelector("main").innerText;
      // Remove any HTML tags from the extracted text and split it into lines
      let expText = mainExp.replace(/<\/?[^>]+(>|$)/g, "").split("\n");
      // Filter the lines to remove any duplicates
      let exp = expText.filter(function (elem, pos) {
        return expText.indexOf(elem) == pos;
      });

      let lastDates = [];

      for (let i in exp) {
        // If the line matches the pattern of a date line in the work experience, extract the date information
        if (/((\d{4})|(Present)) ·( \d+ yrs?)?( \d+ mo(s)?)?$/g.test(exp[i])) {
          console.log(exp[i]);
          // Extract the specific dates from the date line
          let dates = exp[i].match(
            /(Jan |Feb |Mar |Apr |May |Jun |Jul |Aug |Sep |Oct |Nov |Dec )?[12]\d{3}/g
          );
          // Convert each extracted date to a Date object
          for (let j in dates) {
            dates[j] = new Date(dates[j]);
          }
          // If the date line contains 'Present', it means the job is ongoing, so add the current date to the dates array
          if (exp[i].match(/Present/)) {
            dates.push(new Date());
          }
          // Calculate work days from the dates and update 'workDays' in the 'info' object. The logic here handles overlapping dates and calculates the total days correctly
          if (dates.length === 1) {
            info["workDays"] += 365;
          } else {
            if (lastDates.length === 0) {
              info["workDays"] = Math.round(
                (dates[1] - dates[0]) / (1000 * 60 * 60 * 24)
              );
              lastDates[0] = dates[0];
              lastDates[1] = dates[1];
            } else if (lastDates[0] > dates[1]) {
              info["workDays"] += Math.round(
                (dates[1] - dates[0]) / (1000 * 60 * 60 * 24)
              );
              lastDates[0] = dates[0];
              lastDates[1] = dates[1];
            } else if (lastDates[0] <= dates[1] && lastDates[0] > dates[0]) {
              info["workDays"] -= Math.round(
                (lastDates[1] - lastDates[0]) / (1000 * 60 * 60 * 24)
              );
              info["workDays"] += Math.round(
                (lastDates[1] - dates[0]) / (1000 * 60 * 60 * 24)
              );
              lastDates[0] = dates[0];
            }
          }
        }
      }
      // skills from the main page were scraped in the getInfo() function
      info["skills"] = [];
      info["allSkills"] = [];
    }
  }
  return info;
};

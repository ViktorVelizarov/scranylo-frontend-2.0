// file contains a function that selects all relevant skills for the job and for all relevant skills in the skills section using the regexes for the skills relevant to the job (skillsRegex) and for all relevant skills (allSkillsRegex)

export function getSkills(skillsRegex, allSkillsRegex) {
  // An empty object to store the results.
  let result = {};
  // Convert the regular expressions from string to RegExp objects, with flags for global, multiline, and case-insensitive search.
  skillsRegex = new RegExp(skillsRegex, "gmi");
  allSkillsRegex = new RegExp(allSkillsRegex, "gmi");
  // Select all the buttons with the text 'Show all X'.
  let showAllBtns = document.querySelectorAll(".pvs-navigation__text");
  for (let i in showAllBtns) {
    const btnText = showAllBtns[i].innerText;
    // If the button text matches the regular expression for 'Show all X skills'.
    if (/Show all \d+ skills/.test(btnText)) {
      // Click on the button to show all skills.
      const link = showAllBtns[i].parentElement;
      link.click();
      // Return a promise that resolves when the skills are extracted.
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight);
          resolve(
            new Promise((resolve, reject) => {
              // Set a timeout to allow the page to load.
              setTimeout(() => {
                // Scroll to the bottom of the page to load all skills. and repeat this to load all skills
                window.scrollTo(0, document.body.scrollHeight);
                resolve(
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      // Extract the main section of the page.
                      let main = document.querySelector("main").innerText;

                      // get all skills from the subpage with all skills
                      result["allSkills"] = main.match(allSkillsRegex);
                      if (result["allSkills"]) {
                        // remove duplicated skills
                        result["allSkills"] = result["allSkills"].filter(
                          (item, pos, self) => {
                            return self.indexOf(item) == pos;
                          }
                        );
                      } else {
                        // If the match is not successful, set 'allSkills' to an empty array.
                        result["allSkills"] = [];
                      }
                      // Match all relevant skills for sourcing job
                      result["relevantSkills"] = main.match(skillsRegex);
                      if (!result["relevantSkills"]) {
                        history.back();
                        resolve(result);
                      } else {
                        // If the match is successful, filter the relevant skills to remove duplicates, and clean them up.
                        result["relevantSkills"] = result[
                          "relevantSkills"
                        ].filter((item, pos, self) => {
                          return self.indexOf(item) == pos;
                        });
                        console.log("RELEVANT SKILLS BEFORE CLEANUP:");
                        console.log(result["relevantSkills"]);
                        // Clean up the relevant skills by removing the leading and trailing "\n" chars.
                        result["relevantSkills"] = result["relevantSkills"].map(
                          (item) => item.substr(1, item.length - 2)
                        );
                        console.log("RELEVANT SKILLS AFTER CLEANUP:");
                        console.log(result["relevantSkills"]);
                        history.back();
                        resolve(result);
                      }
                    }, 1000);
                  })
                );
              }, 1000);
            })
          );
        }, 1000);
      });
    }
  }
  // If no skills were found, return the empty result object.
  return result;
}

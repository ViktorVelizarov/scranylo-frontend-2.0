// file contains a function that finds in the first section of the profile the name of the candidate, the number of connections and by using the regexes of the skills for that job (skillsRegex) and for all the skills (allSkillsRegex), the function finds in the first section the relevant skills of the candidate.

export function getInfo(skillsRegex, allSkillsRegex) {
  skillsRegex = new RegExp(skillsRegex, "gmi");
  allSkillsRegex = new RegExp(allSkillsRegex, "gmi");
  console.log("In getInfo:");
  let info = {};
  // Extracting the name of the LinkedIn user
  info["name"] = document.querySelector("div.ph5 h1").innerText;
  console.log("Found name:");
  console.log(info["name"]);
  // If name has parentheses, remove second name of the candidate, for example Egon (Adam) Veermae => Egon Veermae
  if (info["name"].indexOf("(") >= 0) {
    let fullName = info["name"].split(/\(|\)/);
    fullName.splice(1, 1);
    fullName = fullName.map((e) => e.trim());
    info["name"] = fullName.join(" ");
  }
  // Extracting the main content of the page
  let main = document.querySelector("main").innerText;
  // remove HTML tags
  let content = main.replace(/<\/?[^>]+(>|$)/g, "").split("\n");
  // Searching for connection details in the content
  for (let i in content) {
    if (/\d{1,3}\+? connection(s)?/.test(content[i])) {
      info["connections"] = content[i].split(" ");
      info["connections"] = info["connections"][0];
    } else {
      if (i === content.length - 1) {
        info["connections"] = "N/A";
      }
    }
  }
  // search for relevant skills in the main section of the page
  info["skills"] = main.match(skillsRegex);
  if (info["skills"]) {
    // remove duplicates in the matched array
    info["skills"] = info["skills"].filter((item, pos, self) => {
      return self.indexOf(item) == pos;
    });
    // remove matched regex patterns for word boundaries, like space, /n, etc.
    info["skills"] = info["skills"].map((item) =>
      item.substr(1, item.length - 2)
    );
  } else {
    info["skills"] = [];
  }
  // search for all skills in the main section of the page
  console.time("getAllSkills");
  info["allSkills"] = main.match(allSkillsRegex);
  if (info["allSkills"]) {
    // remove duplicates
    info["allSkills"] = info["allSkills"].filter((item, pos, self) => {
      return self.indexOf(item) == pos;
    });
    console.log("All skills");
    console.log(info["allSkills"]);
  }
  console.timeEnd("getAllSkills");
  // Returning info object with the extracted details
  return info;
}

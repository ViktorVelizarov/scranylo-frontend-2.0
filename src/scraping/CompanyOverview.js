// file: getCompanyOverviewInitial.js
export function getCompanyOverviewInitial(skillsRegex, allSkillsRegex) {
  skillsRegex = new RegExp(skillsRegex, "gmi");
  allSkillsRegex = new RegExp(allSkillsRegex, "gmi");
  console.log("In getCompanyOverviewInitial:");
  let info = {};
  // Extracting the name of the Company
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
  
  // Navigate to the company "About" page
  let aboutLink = document.querySelector('a[href*="/about/"]');
  console.log("about link:");
  console.log(aboutLink);
  if (aboutLink) {
    aboutLink.click();
  }
  return info;
}

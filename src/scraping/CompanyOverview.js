export function getCompanyOverviewInitial(skillsRegex, allSkillsRegex) {
  skillsRegex = new RegExp(skillsRegex, "gmi");
  allSkillsRegex = new RegExp(allSkillsRegex, "gmi");
  console.log("In getCompanyOverviewInitial:");
  let info = {};

  // Extracting the Followers count
  let followersElement = Array.from(document.querySelectorAll("div.org-top-card-summary-info-list__info-item"))
    .find(element => element.innerText.includes("followers"));
  if (followersElement) {
    info["followers"] = followersElement.innerText.trim();
  } else {
    console.log("Followers element not found.");
  }

  // Extracting the name of the Company
  let nameElement = document.querySelector("div.ph5 h1");
  if (nameElement) {
    info["name"] = nameElement.innerText.trim();
    console.log("Found name:");
    console.log(info["name"]);
    // If name has parentheses, remove second name of the candidate, for example Egon (Adam) Veermae => Egon Veermae
    if (info["name"].indexOf("(") >= 0) {
      let fullName = info["name"].split(/\(|\)/);
      fullName.splice(1, 1);
      fullName = fullName.map((e) => e.trim());
      info["name"] = fullName.join(" ");
    }
  } else {
    console.log("Name element not found.");
  }

  // Extracting the percentage of total headcount growth
  let headcountGrowthElement = document.querySelector(".org-home-premium-insights-module__content-card .text-display-small");
  if (headcountGrowthElement) {
    info["headcountGrowth"] = headcountGrowthElement.innerText.trim();
  } else {
    console.log("Headcount growth element not found.");
  }

  // Extracting the duration of median tenure
  let medianTenureElement = Array.from(document.querySelectorAll(".org-home-premium-insights-module__content-card .text-display-small"))
    .find(element => element.innerText.includes("years"));
  if (medianTenureElement) {
    info["medianTenure"] = medianTenureElement.innerText.trim();
  } else {
    console.log("Median tenure element not found.");
  }
  
    // Navigate to the company "About" page
    let aboutLink = document.querySelector('a[href*="/about/"]');
    console.log("about link:");
    console.log(aboutLink);
    if (aboutLink) {
      aboutLink.click();
  
      // Wait for the "About" page to load
      let observer = new MutationObserver((mutations, observer) => {
        // Check for a specific element that only exists on the "About" page
        let aboutPageLoaded = document.querySelector('h2.text-heading-xlarge');
        if (aboutPageLoaded && aboutPageLoaded.innerText.includes("Overview")) {
          observer.disconnect(); // Stop observing
          console.log("About page loaded");
  
          // Wait for seconds after the "About" page has loaded
          setTimeout(() => {
            // Navigate to the company "Jobs" page
            let jobsLink = document.querySelector('a[href*="/jobs/"]');
            console.log("jobs link:");
            console.log(jobsLink);
            if (jobsLink) {
              jobsLink.click();
            }
          }, 1800);
        }
      });
  
      // Start observing the document for changes
      observer.observe(document, { childList: true, subtree: true });
    }
  

  return info;
}

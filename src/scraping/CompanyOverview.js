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

  // Function to recursively get text content
  function getTextContent(element) {
    return Array.from(element.childNodes).map(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent.trim();
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        return getTextContent(node);
      }
      return "";
    }).join(" ");
  }

  // Function to click the "Next" button
  function clickNextButton() {
    let nextButton = document.querySelector('button.artdeco-pagination__button--next');
    if (nextButton) {
      nextButton.click();
      console.log("Clicked Next button");
    }
  }



  function navigateToAboutPage() {
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
  }
  let postContents = [];
  function ScrapePost(){
 // Scrape the first post from the specified <ul> element
 
 let posts = document.querySelectorAll('ul.artdeco-carousel__slider li');
 for (let i = 0; i < 3 && i < posts.length; i++) {
   let postContentElement = posts[i].querySelector('span.break-words span[dir="ltr"]');
   if (postContentElement) {
     // Collect text from the post, including nested spans
     let postText = getTextContent(postContentElement);
     postContents.push(postText);
   }
 }
  }

  ScrapePost()
  clickNextButton()
  ScrapePost()
  clickNextButton()
  ScrapePost()
  clickNextButton()
  ScrapePost()

  // Using a Set to remove duplicates
let uniquePostContents = [...new Set(postContents)];
console.log("uniquePostContents");
console.log(uniquePostContents);
info["post1"] = uniquePostContents[0]
info["post2"] = uniquePostContents[1]
info["post3"] = uniquePostContents[2]

console.log("info2")
console.log(info)
  // Proceed with navigating to the company "About" page
navigateToAboutPage();


  return info;
}

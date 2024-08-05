export function getCompanyOverviewInitial(skillsRegex, allSkillsRegex) {

  // Helper function to get element by text content
  function getElementByText(selector, text) {
    const elements = document.querySelectorAll(selector);
    for (let element of elements) {
        if (element.textContent.includes(text)) {
            return element;
        }
    }
    return null;
}

return new Promise((resolve, reject) => {
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

    // If name has parentheses, remove the text within them and any trailing space
    if (info["name"].indexOf("(") >= 0) {
        let fullName = info["name"].split(/\(|\)/);
        // Remove the part within parentheses
        fullName.splice(1, 1);
        // Trim any extra spaces from each part and filter out empty strings
        fullName = fullName.map((e) => e.trim()).filter(e => e);
        // Join the parts back together, ensuring no extra spaces
        console.log("removed")
        console.log(fullName)
        info["name"] = fullName.join(" ");
    }
}
else {
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

  // Function to navigate to the "About" page
  function navigateToAboutPage() {
    return new Promise((resolve, reject) => {
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

            // Scrape additional company information
    const overviewElement = getElementByText('section h2', 'Overview');
    if (overviewElement) {
        info["getCompanyOverview"] = overviewElement.nextElementSibling.innerText;
        console.log("CompanyOverview")
        console.log(info["getCompanyOverview"])
    }

    const websiteElement = getElementByText('dt', 'Website');
    if (websiteElement) {
        info["website"] = websiteElement.nextElementSibling.querySelector('a').innerText;
    }

    const HQElement = getElementByText('dt', 'Headquarters');
    if (HQElement) {
        info["headquarters"] = HQElement.nextElementSibling.innerText;
    }

    const SpecialtiesElement = getElementByText('dt', 'Specialties');
    if (SpecialtiesElement) {
        info["specialties"] = SpecialtiesElement.nextElementSibling.innerText;
    }

    const industryElement = getElementByText('dt', 'Industry');
    if (industryElement) {
        info["industry"] = industryElement.nextElementSibling.innerText;
    }

    const companySizeElement = getElementByText('dt', 'Company size');
    if (companySizeElement) {
        info["companySize"] = companySizeElement.nextElementSibling.innerText;
    }

    const specialtiesElement = getElementByText('dt', 'Specialties');
    if (specialtiesElement) {
        info["specialties"] = specialtiesElement.nextElementSibling.innerText;
    }
            

            // Wait for seconds after the "About" page has loaded
            setTimeout(() => {
              // Navigate to the company "Jobs" page
              let jobsLink = document.querySelector('a.org-page-navigation__item-anchor[href*="/jobs/"]');
              if (jobsLink) {
                jobsLink.click();
                waitForJobsPageToLoad().then(resolve);
              } else {
                console.log("Jobs link not found")
                reject("Jobs link not found");
              }
            }, 1800);
          }
        });

        // Start observing the document for changes
        observer.observe(document, { childList: true, subtree: true });
      } else {
        reject("About link not found");
      }
    });
  }

// Function to wait for the jobs page to load
function waitForJobsPageToLoad() {
  return new Promise((resolve, reject) => {
    let observer = new MutationObserver((mutations, observer) => {
      let jobsPageLoaded = document.querySelector('ul.artdeco-carousel__slider li');
      if (jobsPageLoaded) {
        observer.disconnect(); // Stop observing
        console.log("Jobs page loaded");
        resolve(ScrapeJobs());
      }
    });

    // Start observing the document for changes
    observer.observe(document, { childList: true, subtree: true });

    // Set a timeout to stop waiting after a certain period
    setTimeout(() => {
      observer.disconnect(); // Stop observing after timeout
      console.log("Timeout waiting for jobs page to load");
      resolve(); // Proceed without job scraping
    }, 1500); // Adjust timeout duration as needed (e.g., 10000 ms = 10 seconds)
  });
}

  let postContents = [];
  function ScrapePost() {
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

  let jobTitles = [];
  let jobURLs = [];
  function ScrapeJobs() {
    return new Promise((resolve) => {
      setTimeout(() => {

        // Scrape the first 3 jobs from the specified <ul> element
        let jobs = document.querySelectorAll('ul.artdeco-carousel__slider li');
        console.log("jobs ul")
        console.log(jobs)
        for (let i = 0; i < 3 && i < jobs.length; i++) {
          console.log("in loop")
          let jobTitle = jobs[i].querySelector('div.job-card-square__title span');
          console.log("jobTitle")
          console.log(jobTitle)
          let jobURL = jobs[i].querySelector('div.job-card-square__main a');

          if (jobTitle) {
            let jobTitleText = getTextContent(jobTitle);
            jobTitles.push(jobTitleText);
            console.log("jobTitles: ");
            console.log(jobTitles);
          }
          if (jobURL) {
            let jobURLText = jobURL.getAttribute('href');
            jobURLText = "https://www.linkedin.com" + jobURLText;
            jobURLs.push(jobURLText);
            console.log("jobURLs: ");
            console.log(jobURLs);
          }
        }

        info["jobTitle1"] = jobTitles[0];
        info["jobTitle2"] = jobTitles[1];
        info["jobURL1"] = jobURLs[0];
        info["jobURL2"] = jobURLs[1];

        console.log("info2");
        console.log(info);

        resolve();
      }, 500);
    });
  }

  ScrapePost();
  clickNextButton();
  ScrapePost();
  clickNextButton();
  ScrapePost();
  clickNextButton();
  ScrapePost();

  // Using a Set to remove duplicates
  let uniquePostContents = [...new Set(postContents)];
  console.log("uniquePostContents");
  console.log(uniquePostContents);
  info["post1"] = uniquePostContents[0];
  info["post2"] = uniquePostContents[1];
  info["post3"] = uniquePostContents[2];

  // Add the current datetime up to minutes to the info object
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 2); // Add 2 hours
  info["scraped_date"] = currentDate.toISOString().slice(0, 16).replace('T', ' '); // Format as 'YYYY-MM-DD HH:mm'

  console.log("info with scraped_date");
  console.log(info);

  // Proceed with navigating to the company "About" page
  navigateToAboutPage().then(() => {
    resolve(info);
  }).catch(reject);
});
}

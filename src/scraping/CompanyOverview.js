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
        clickNextButton();
        console.log("whole html: ")
    console.log(document.documentElement.outerHTML);
        // Scrape the first 3 jobs from the specified <ul> element
        let jobs = document.querySelectorAll('ul.artdeco-carousel__slider li');
        for (let i = 0; i < 3 && i < jobs.length; i++) {
          let jobTitle = jobs[i].querySelector('div.job-card-square__title span');
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

  // Proceed with navigating to the company "About" page
  navigateToAboutPage().then(() => {
    resolve(info);
  }).catch(reject);
});
}

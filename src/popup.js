/*global chrome*/
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import axios from "axios";
import { normalize } from "normalize-diacritics";
import Select from "react-select";
import { getInfo } from "./scraping/basicInfo";
import { getCompanyOverviewInitial } from "./scraping/CompanyOverview";
import { getCompanyOverviewAfterNavigation } from "./scraping/getCompanyOverviewAfterNavigation";
import { getCurrent } from "./scraping/currentJob";
import { getUniversity } from "./scraping/university";
import { getSkills } from "./scraping/skills";
import { getExp } from "./scraping/totalExperience";
import { getCurrentName } from "./scraping/name";
import { writeToClipboard } from "./lib/clipboard";
import { prepareSkills } from "./lib/skills";
import CustomInput from "./lib/input";
import { calculateSlowdownTime } from "./lib/slowdown";
import { emptyRule } from "./lib/rule";

const backendLink = process.env.SERVER_MAIN;
// const backendLink = process.env.SERVER_LOCAL;

const root = ReactDOM.createRoot(document.getElementById("react-target"));

function Popup() {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(localStorage.getItem("owner"));
  // rules (jobs) from backend
  const [rules, setRules] = useState([]);
  // rules in the format required for select input "Rules" ({ label: "", value: "" })
  const [rulesOptions, setRulesOptions] = useState([]);
  // selected rule (in the original format)
  const [currentRule, setCurrentRule] = useState(emptyRule);
  // selected rule in the select input "Rules" (in the format required for select input)
  const [currentRuleOption, setCurrentRuleOption] = useState({});
  const [url, setUrl] = useState(localStorage.getItem("url"));
  const [name, setName] = useState(localStorage.getItem("name"));
  const [connections, setConnections] = useState(
    localStorage.getItem("connections")
  );
  const [experience, setExperience] = useState(
    localStorage.getItem("experience")
  );
  const [currentPosition, setCurrentPosition] = useState(
    localStorage.getItem("currentPosition")
  );
  const [currentCompany, setCurrentCompany] = useState(
    localStorage.getItem("currentCompany")
  );
  const [yearInCurrent, setYearInCurrent] = useState(
    localStorage.getItem("yearInCurrent")
  );
  const [currentType, setCurrentType] = useState(
    localStorage.getItem("currentType")
  );
  const [university, setUniversity] = useState(
    localStorage.getItem("university")
      ? JSON.parse(localStorage.getItem("university"))
      : { relevant: false, university: "No", graduationYear: "" }
  );
  // scraped skills relevant for currently sourced job
  const [skills, setSkills] = useState(
    localStorage.getItem("skills") ? localStorage.getItem("skills") : ""
  );
  // scaped for skills relevant for our database (all jobs)
  const [allSkills, setAllSkills] = useState(
    localStorage.getItem("all-skills") ? localStorage.getItem("all-skills") : ""
  );
  const [status, setStatus] = useState(
    localStorage.getItem("status")
      ? JSON.parse(localStorage.getItem("status"))
      : { label: "1a - Prospect Connection", value: "1a" }
  );
  const [reachoutTopic, setReachoutTopic] = useState(
    localStorage.getItem("reachoutTopic")
      ? JSON.parse(localStorage.getItem("reachoutTopic"))
      : { label: "Other", value: "Other" }
  );
  const [reachoutComment, setReachoutComment] = useState(
    localStorage.getItem("reachoutComment")
      ? localStorage.getItem("reachoutComment")
      : ""
  );
  const [relevant, setRelevant] = useState(
    localStorage.getItem("relevant")
      ? JSON.parse(localStorage.getItem("relevant"))
      : { label: "No", value: "No" }
  );
  // sourcer's stats for the current day
  const [stats, setStats] = useState({ total: 0, relevant: 0, unrelevant: 0 });
  // links to the previous and next candidates in the google sheet
  const [back, setBack] = useState("");
  const [next, setNext] = useState("");
  //state to manage the currently selected tab, people by default
  const [currentTab, setCurrentTab] = useState('people');

//states for the company form
const [followers, setFollowers] = useState(localStorage.getItem('followers') || '');
const [description, setDescription] = useState(localStorage.getItem('description') || '');
const [website, setWebsite] = useState(localStorage.getItem('website') || '');
const [industry, setIndustry] = useState(localStorage.getItem('industry') || '');
const [companySize, setCompanySize] = useState(localStorage.getItem('companySize') || '');
const [totalHeadcount, setTotalHeadcount] = useState(localStorage.getItem('totalHeadcount') || '');
const [medianTenure, setMedianTenure] = useState(localStorage.getItem('medianTenure') || '');
const [hq, setHq] = useState(localStorage.getItem('hq') || '');
const [specialities, setSpecialities] = useState(localStorage.getItem('specialities') || '');
const [post1Url, setPost1Url] = useState(localStorage.getItem('post1Url') || '');
const [post1Text, setPost1Text] = useState(localStorage.getItem('post1Text') || '');
const [post2Url, setPost2Url] = useState(localStorage.getItem('post2Url') || '');
const [post2Text, setPost2Text] = useState(localStorage.getItem('post2Text') || '');
const [post3Url, setPost3Url] = useState(localStorage.getItem('post3Url') || '');
const [post3Text, setPost3Text] = useState(localStorage.getItem('post3Text') || '');
const [recentlyPostedJobs, setRecentlyPostedJobs] = useState(localStorage.getItem('recentlyPostedJobs') || '');


  // regex for skills relevant for our database (all jobs)
  const [allSkillsRegex, setAllSkillsRegex] = useState("");
  // options for select inputs: "Status", "Relevant", "Reach out topic"
  const statusOptions = [
    { label: "1a - Prospect Connection", value: "1a" },
    { label: "1b - Prospect Inmail", value: "1b" },
  ];
  const relevantOptions = [
    { label: "No", value: "No" },
    { label: "Yes", value: "Yes" },
  ];
  const reachoutTopicOptions = [
    { label: "Education", value: "Education" },
    { label: "Experience", value: "Experience" },
    { label: "Skills", value: "Skills" },
    { label: "Activities", value: "Activities" },
    { label: "Other", value: "Other" },
  ];
  // error message that will be copied to the clipboard
  const [errorMessage, setErrorMessage] = useState("");
  const [slowdownAnimation, setSlowdownAnimation] = useState(false);
  // The time when the sorter opened this candidate's page. If less than 10 seconds have passed since then and the sorter presses the "Next", "Back" buttons, then an animation will be shown which will continue until 10 seconds have passed since the loading of the extension
  const [firstInteraction, setFirstInteraction] = useState(new Date());

  // when owner enters initials into "Owner" input run next code
  useEffect(() => {
    // If we don't have back and next links yet wait when sourcer finish entering initials and request this links and relevant for user jobs (rules) for sourcing
    if (owner && !back && !next) {
      // Create a timeout that triggers the findBackNextLinks function after 1.5 seconds
      // This creates a debounce effect, which delays the processing of the findBackNextLinks function
      const delayDebounceFn = setTimeout(findBackNextLinks, 1500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setLoading(false);
    }
  }, [owner, currentTab]); // rerun the findLinks function if the tab is also changed

//See the current open tab so the extension mode can be set to either person or company mode
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  // Store the URL and ID of the current tab.
  const currentURL = tabs[0].url;
  if (/^https:\/\/www\.linkedin\.com\/in\/[^\/]{2,}\/$/.test(currentURL)) {
    setCurrentTab("people")
}
// Check if a LinkedIn company link is open
if (/^https:\/\/www\.linkedin\.com\/company\/[^\/]{2,}\/$/.test(currentURL)) {
   setCurrentTab("company")
}
})

// This listener triggers when any tab is updated.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // The action is performed only when the tab update status is 'complete' and the tab is active.
  if (changeInfo.status == "complete" && tab.active) {
    // Checks if the URL of the tab matches the LinkedIn profile.
    if (/^https:\/\/www\.linkedin\.com\/in\/[^\/]{2,}\/$/.test(tab.url)) {
      setCurrentTab("people")
  }
  // Check if a LinkedIn company link is open
  if (/^https:\/\/www\.linkedin\.com\/company\/[^\/]{2,}\/$/.test(tab.url)) {
     setCurrentTab("company")
  }
  }
});



  // Function that will find current candidate in the spradsheet and check that the candidate is not already processed also function returns links to the next and previous unprocessed profile in the spreadsheet and relevant jobs (rules) for sourcing for the given sourcer (user)
  const findBackNextLinks = () => {
    // turn on loading animation
    setLoading(true);
    // Gets the details of the currently active tab in the current window.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Store the URL and ID of the current tab.
      const currentURL = tabs[0].url;
      const tabId = tabs[0].id;
      // Execute a 'getCurrentName' function in the context of the active tab, which gets the name of the current candidate.
      chrome.scripting.executeScript(
        {
          target: {
            tabId: tabId,
          },
          func: getCurrentName,
        },
        async (res) => {
          const currentName = await normalize(res[0].result);
          console.log("name")
          console.log(currentName)
          // Constructs a request URL to the backend with appropriate query parameters, so backend will verify owner and find current candidate in the Google Spreadsheet
          console.log("currentTab:")
          console.log(currentTab)
          console.log("currentURL")
          console.log(currentURL)
          const linkReq = `${backendLink}/api?name=${currentName}&owner=${owner}&link=${currentURL}&mode=${currentTab}`;
          axios
            .get(linkReq)
            .then((res) => {
              // Set states with received data from the backend.
              setBack(res.data.back);
              setNext(res.data.next);
              setAllSkillsRegex(res.data.skills);
              setStats(res.data.stats);
              setRules(res.data.rules);
              // If any rules data received, create options for the Select input for those rules.
              if (res.data.rules.length) {
                createRulesOptions(res.data.rules);
              }
              // Extension will notify sourcer if current candidate is processed already
              if (res.data.alert) {
                alert(res.data.alert);
              }
            })
            .catch((err) => {
              console.log("responce error:")
              console.log(err);
              // Handle any specific error response and create an error message accordingly.
              // The error message can be copied to the clipboard if user accepts the prompt.
              if (err.response.data && err.response.data.error) {
                console.log("responce error2:")
                console.log(err);
                if (
                  
                  confirm(
                    'Something went wrong :(\nPlease check if this candidate has the correct name in the table!\nIf the name is correct but the error remains, press "OK" to copy the error message and paste it to Slack.'
                  )
                ) {
                  const error = `Url: ${currentURL}\nName: ${currentName}\nError message: ${err.message}\nError code: ${err.code}\nAPI response: ${err.response.data.error}`;
                  setErrorMessage(error);
                }
              } else {
                if (
                  confirm(
                    'Something went wrong :(\nPress "OK" if you want to copy the error message and then paste it to Slack. Or press "Cancel" to close alert popup.'
                  )
                ) {
                  const error = `Url: ${currentURL}\nName: ${currentName}\nError message: ${err.message}\nError code: ${err.code}\n`;
                  console.log("error")
                  console.log(error)
                  setErrorMessage(error);
                }
              }
            })
            // Whether the request was successful or failed, stop the loading animation.
            .finally(() => setLoading(false));
        }
      );
    });
  };

  // This function is responsible for creating options based on provided rules for select input "Rules"
  const createRulesOptions = (rules) => {
    const currentRulesOptions = [...rulesOptions];
    for (let i in rules) {
      // Create an individual option for each rule.
      const ruleOption = {};
      ruleOption["label"] = rules[i].title;
      ruleOption["value"] = rules[i]["id"];
      currentRulesOptions.push(ruleOption);
    }
    // Update the state with the new set of rules options.
    setRulesOptions(currentRulesOptions);
    // Check local storage for previously selected rule option, if none exists then select the first option in the current rules options.
    const currentRuleOption = localStorage.getItem("rule")
      ? JSON.parse(localStorage.getItem("rule"))
      : currentRulesOptions[0];
    // If the current selected rule option doesn't exist in the updated rules options (this option was saved in the localStorage, but for example now this job doesn't exist), then select the first option in the current rules options.
    if (!currentRulesOptions.some((e) => e.value === currentRuleOption.value)) {
      currentRuleOption = { ...currentRulesOptions[0] };
    }
    setCurrentRuleOption(currentRuleOption);
    // Find the index of the current rule option in the rules array.
    const indx = rules.findIndex((e) => e.id === currentRuleOption.value);
    setCurrentRule(rules[indx]);
  };

  // The useEffect hook will run whenever the errorMessage state changes, extension haven't found candidate in the spreadsheet, some other happend on the backend.
  useEffect(() => {
    if (errorMessage) {
      // Query the current browser tab
      // Here, we're passing the error message to be written to the clipboard.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({
          target: {
            tabId: tabId,
          },
          func: writeToClipboard,
          args: [errorMessage],
        });
      });
    }
  }, [errorMessage]);

  //handle tab button click
  const handleTabClick = (tab) => {
    setCurrentTab(tab);
  };

   


  const scrape2 = async (event) => {
    // Prevent the default submission of a form
    event.preventDefault();
  
    // If there are no rules defined, exit the function.
    if (!rules.length) {
      return;
    }
  
    let tabId = "";
    let currentSkills = [];
    let allSkills = [];
  
    try {
      // Query the active tab in the current window
      const tabs = await new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(tabs);
          }
        });
      });
  
      const url = tabs[0].url;
      tabId = tabs[0].id;
      setUrl(url);
      localStorage.setItem("url", url);
  
      // Helper function to wrap chrome.scripting.executeScript in a Promise
      const executeScript = (func, args = []) => {
        return new Promise((resolve, reject) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              func: func,
              args: args,
            },
            (res) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(res);
              }
            }
          );
        });
      };
  
      // Scrape initial company overview and initiate navigation
      let res = await executeScript(getCompanyOverviewInitial, [currentRule.skillsRegex, allSkillsRegex]);
      console.log("res from scrape initial:");
      console.log(res);
  
      let name = await normalize(res[0].result.name);
      let followers = await normalize(res[0].result.followers);
      let totalHeadcount = await normalize(res[0].result.headcountGrowth);
      let medianTenure = await normalize(res[0].result.medianTenure);
      setName(name);
      setFollowers(followers);
      setTotalHeadcount(totalHeadcount)
      setMedianTenure(medianTenure)
      localStorage.setItem("name", name);
  
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // Scrape additional company information after navigation
      res = await executeScript(getCompanyOverviewAfterNavigation);
      console.log("res from scrape after navigation:");
      console.log(res);
  
      
      setDescription(res[0].result.getCompanyOverview);
      localStorage.setItem("company-description", res[0].result.getCompanyOverview);

      setWebsite(res[0].result.website);
      localStorage.setItem("company-website", res[0].result.website);

      setSpecialities(res[0].result.specialties);
      localStorage.setItem("company-specialities", res[0].result.specialties);
      
      setHq(res[0].result.headquarters);
      localStorage.setItem("company-headquarters", res[0].result.headquarters);

      setIndustry(res[0].result.industry);
      localStorage.setItem("company-industry", res[0].result.industry);

      setCompanySize(res[0].result.companySize);
      localStorage.setItem("company-size", res[0].result.companySize);
  
      currentSkills = res[0].result.skills && res[0].result.skills.length ? res[0].result.skills : [];
      allSkills = res[0].result.allSkills && res[0].result.allSkills.length ? res[0].result.allSkills : [];
  
  
      // Scrape additional skills
      res = await executeScript(getSkills, [currentRule.skillsRegex, allSkillsRegex]);
      if (res[0].result.relevantSkills) {
        currentSkills = currentSkills.concat(res[0].result.relevantSkills);
      }

    } catch (error) {
      console.error("Error during scraping:", error);
    }

    // Remove previous reachout comment and set reachout topic to default value
    setReachoutComment("");
    setReachoutTopic({ label: "Other", value: "Other" });
  };
  






  
  // This function is responsible for scraping candidate's information from the active LinkedIn profile, it runs all functions from the /scraping directory (except getCurrentName())
  const scrape = (event) => {
    // Prevent the default submission of a form
    event.preventDefault();
    // If there are no rules defined, exit the function.
    if (!rules.length) {
      return;
    }
    let tabId = "";
    let currentSkills = [];
    let allSkills = [];
    // Execute a script in the context of the active tab to scrape information.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      tabId = tabs[0].id;
      setUrl(url);
      localStorage.setItem("url", url);

      chrome.scripting.executeScript(
        {
          target: {
            tabId: tabId,
          },
          func: getCompanyOverviewInitial ,
          args: [currentRule.skillsRegex, allSkillsRegex],
        },
        // Normalize scraped data and save them to the state and local storage
        async (res) => {
          console.log("res from scrape:")
          console.log(res)
          
          res[0].result.name = await normalize(res[0].result.name);
          setName(res[0].result.name);
          localStorage.setItem("name", res[0].result.name);
          setConnections(res[0].result.connections);
          localStorage.setItem("connections", res[0].result.connections);
          // Process the skills and save them in 'currentSkills' (relevant for curently sourcing job) and 'allSkills' (relevant generally)
          currentSkills =
            res[0].result.skills && res[0].result.skills.length
              ? res[0].result.skills
              : [];
          allSkills =
            res[0].result.allSkills && res[0].result.allSkills.length
              ? res[0].result.allSkills
              : [];
        }
      );
      chrome.scripting.executeScript(
        {
          target: {
            tabId: tabId,
          },
          func: getCurrent,
        },
        (res) => {
          setCurrentPosition(res[0].result.position);
          localStorage.setItem("currentPosition", res[0].result.position);
          setCurrentCompany(res[0].result.company);
          localStorage.setItem("currentCompany", res[0].result.company);
          setYearInCurrent((res[0].result.days / 365).toFixed(1));
          localStorage.setItem(
            "yearInCurrent",
            (res[0].result.days / 365).toFixed(1)
          );
          if (typeof res[0].result.type === "object") {
            res[0].result.type = res[0].result.type[0];
          }
          setCurrentType(res[0].result.type);
          localStorage.setItem("currentType", res[0].result.type);
        }
      );
      chrome.scripting.executeScript(
        {
          target: {
            tabId: tabId,
          },
          func: getUniversity,
          args: [currentRule.universitiesRegex],
        },
        (res) => {
          setUniversity(res[0].result);
          localStorage.setItem("university", JSON.stringify(res[0].result));
        }
      );
      chrome.scripting.executeScript(
        {
          target: {
            tabId: tabId,
          },
          func: getExp,
          args: [currentRule.skillsRegex, allSkillsRegex],
        },
        (res) => {
          setExperience((res[0].result.workDays / 365).toFixed(1));
          localStorage.setItem(
            "experience",
            (res[0].result.workDays / 365).toFixed(1)
          );
          // add new sourced skills from experience section (if there were subpage for full experience ("Show all X experiences"))
          if (res[0].result.skills) {
            currentSkills = currentSkills.concat(res[0].result.skills);
          }
          if (res[0].result.allSkills) {
            allSkills = allSkills.concat(res[0].result.allSkills);
          } else {
            console.log("there is no skills in the experience section");
          }
          chrome.scripting.executeScript(
            {
              target: {
                tabId: tabId,
              },
              func: getSkills,
              args: [currentRule.skillsRegex, allSkillsRegex],
            },
            (res) => {
              if (res[0].result.relevantSkills) {
                currentSkills = currentSkills.concat(
                  res[0].result.relevantSkills
                );
              }
              // create array of unique skills (relevant for current job) that will be case insensetive
              let uniqueRelevantSkills = currentSkills
                .filter((item, index) => {
                  const lower = item.toLowerCase();
                  const firstIndex = currentSkills.findIndex(
                    (skill) => skill.toLowerCase() === lower
                  );
                  return index === firstIndex;
                })
                .join(", ");
              if (!uniqueRelevantSkills) {
                uniqueRelevantSkills = "";
              }

              if (res[0].result.allSkills) {
                allSkills = allSkills.concat(res[0].result.allSkills);
              }
              // create array of unique "all skills" (generally relevant) that will be case insensetive
              let uniqueAllSkills = allSkills
                .filter((item, index) => {
                  const lower = item.toLowerCase();
                  const firstIndex = allSkills.findIndex(
                    (skill) => skill.toLowerCase() === lower
                  );
                  return index === firstIndex;
                })
                .join(", ");
              if (!uniqueAllSkills) {
                uniqueAllSkills = "";
              }
              localStorage.setItem("skills", uniqueRelevantSkills);
              setSkills(uniqueRelevantSkills);
              localStorage.setItem("all-skills", uniqueAllSkills);
              setAllSkills(uniqueAllSkills);
            }
          );
        }
      );
    });



    
    // By default candidate is not relevant (only the sourcer determines the relevance of the candidate)
    setRelevant({ label: "No", value: "No" });
    localStorage.setItem(
      "relevant",
      JSON.stringify({ label: "No", value: "No" })
    );
    // Remove previous reachout comment and set rechout topic to default value
    setReachoutComment("");
    setReachoutTopic({ label: "Other", value: "Other" });
  };

  // This function is used to send the scraped data to a backend server where data will be uploaded to the Google Sheet and also backend will update stats
  const sendData = async (event) => {
    // start loading animation
    setLoading(true);
    // prevent form submition
    event.preventDefault();
    // if there is no owner setted, then finish upload
    if (!owner) {
      alert("Owner is empty");
    }
    // send POST request with data to the server
    await axios
      .post(`${backendLink}/api`, {
        owner: owner,
        status: status.label,
        relevant: relevant.label,
        url: url,
        name: name,
        connections: connections,
        experience: experience,
        currentPosition: currentPosition,
        currentCompany: currentCompany,
        yearInCurrent: yearInCurrent,
        currentType: currentType,
        university: university,
        skills: prepareSkills(skills), //arrays of skills to the strings
        allSkills: prepareSkills(allSkills),
        reachoutTopic: reachoutTopic.label,
        reachoutComment: reachoutComment,
        sourcingJob: currentRule.title,
      })
      .then((res) => {
        // On successful response from the server, update the sourcer's stats
        setStats(res.data.stats);
        // Send a success message to the extension runtime to show popup after upload
        chrome.runtime.sendMessage(
          {
            data: {
              subject: "succesfull_upload",
              content: res.data.res,
            },
          },
          (response) => {
            return true;
          }
        );
      })
      .catch((err) => {
        let apiResponse = "";
        // Handle any errors that occur during the request (same process as in the findBackNextLinks() function)
        if (err.response.data && err.response.data.error) {
          apiResponse = `API response: ${err.response.data.error}`;
        }
        if (
          confirm(
            'Something went wrong :(\nPress "OK" if you want to copy the error message and then paste it to Slack. Or press "Cancel" to close alert popup.'
          )
        ) {
          const error = `Url: ${url}\nName: ${name}\nError message: ${err.message}\nError code: ${err.code}\n${apiResponse}`;
          setErrorMessage(error);
        }
      })
      // remove loading animation after request
      .finally(() => setLoading(false));
  };

  // This function is used to handle navigation to the next or previous candidate's profile in the Google Spreadsheet
  const handleNextBack = (dirrection) => {
    // Start a slowdown animation
    setSlowdownAnimation(true);
    // Calculate the delay before the navigation starts, based on the time when extension's loading started
    const slowdownTime = calculateSlowdownTime(firstInteraction);
    // Set a delay before the navigation starts
    setTimeout(() => {
      // Stop slowdown loading 
      setSlowdownAnimation(false);
      // Query the current tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        // Determine the URL to navigate to, based on the direction parameter
        let url = dirrection === "next" ? next : back;
        chrome.scripting.executeScript({
          target: {
            tabId: tabId,
          },
          func: (url) => window.open(url, "_self"), // This function opens the new URL in the current tab
          args: [url],
        });
      });
    }, slowdownTime);
  };

  return (
    <div id="main">
      {loading && <img src="/loading.gif" className="loading" />}
      {!loading && (
        <form action="" method="post">

        <p style={{ display: 'flex', justifyContent: 'center' }}>{currentTab} mode</p>

          <div className="stats">
            <b>Total: {stats.total}</b>
            <b>Relevant: {stats.relevant}</b>
            <b>Not relevant: {stats.unrelevant}</b>
          </div>
          <div className="tabs" style={{ display: 'flex', justifyContent: 'center' }}>
          </div>
          {currentTab === 'people' && (
            <>
              <div className="btn">
                <button type="button" onClick={scrape} disabled={!rules.length}>Scrape</button>
              </div>
              <div className="btns">
                <button type="button" onClick={() => handleNextBack('back')} disabled={!back}>Back</button>
                <button type="button" onClick={() => handleNextBack('next')} disabled={!next}>Next</button>
              </div>
              <label htmlFor="owner">Owner:</label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={owner}
                onChange={(e) => { setOwner(e.target.value); localStorage.setItem('owner', e.target.value); }}
                required
              />
              <label htmlFor="rule">Rules:</label>
              <Select
                name="rule"
                value={currentRuleOption}
                onChange={(selectedOption) => {
                  setCurrentRuleOption(selectedOption);
                  localStorage.setItem('rule', JSON.stringify(selectedOption));
                  const indx = rules.findIndex(e => e.id === selectedOption.value);
                  setCurrentRule(rules[indx]);
                }}
                options={rulesOptions}
                components={{ Input: CustomInput }}
              />
              <label htmlFor="status">Status:</label>
              <Select
                name="status"
                value={status}
                onChange={(selectedOption) => {
                  setStatus(selectedOption);
                  localStorage.setItem('status', JSON.stringify(selectedOption));
                }}
                options={[] /* Add your options here */}
                components={{ Input: CustomInput }}
              />
              <label htmlFor="url">Current url:</label>
              <textarea
                id="url"
                name="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); localStorage.setItem('url', e.target.value); }}
              ></textarea>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => { setName(e.target.value); localStorage.setItem('name', e.target.value); }}
              />
              <label
                htmlFor="connections"
                className={parseInt(connections) > parseInt(currentRule.minConnections) ? 'relevant' : 'not-relevant'}
              >
                Connections:
              </label>
              <input
                type="text"
                id="connections"
                name="connections"
                value={connections}
                onChange={(e) => { setConnections(e.target.value); localStorage.setItem('connections', e.target.value); }}
              />
              <label
                htmlFor="university"
                className={university.relevant ? 'relevant' : 'not-relevant'}
              >
                University:
              </label>
              <textarea
                id="university"
                name="university"
                value={university.university}
                onChange={(e) => {
                  setUniversity({
                    relevant: false,
                    university: e.target.value,
                    graduationYear: university.graduationYear,
                  });
                  localStorage.setItem(
                    'university',
                    JSON.stringify({
                      relevant: false,
                      university: e.target.value,
                      graduationYear: university.graduationYear,
                    })
                  );
                }}
              ></textarea>
              <label
                htmlFor="graduationYear"
                className={
                  new Date().getFullYear() - currentRule.gradYear <
                  university.graduationYear
                    ? 'relevant'
                    : 'not-relevant'
                }
              >
                Year of graduation:
              </label>
              <input
                type="text"
                id="graduationYear"
                name="graduationYear"
                value={university.graduationYear}
                onChange={(e) => {
                  setUniversity({
                    relevant: university.relevant,
                    university: university.university,
                    graduationYear: e.target.value,
                  });
                  localStorage.setItem(
                    'university',
                    JSON.stringify({
                      relevant: university.relevant,
                      university: university.university,
                      graduationYear: e.target.value,
                    })
                  );
                }}
              />
              <label
                htmlFor="experience"
                className={
                  parseFloat(experience) >= parseFloat(currentRule.experience)
                    ? 'relevant'
                    : 'not-relevant'
                }
              >
                Experience:
              </label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={experience}
                onChange={(e) => { setExperience(e.target.value); localStorage.setItem('experience', e.target.value); }}
              />
              <label
                htmlFor="currentPosition"
                className={
                  new RegExp(currentRule.relevantRolesRegex, 'i').test(currentPosition)
                    ? 'relevant'
                    : 'not-relevant'
                }
              >
                Current (Last) role:
              </label>
              <input
                type="text"
                id="currentPosition"
                name="currentPosition"
                value={currentPosition}
                onChange={(e) => { setCurrentPosition(e.target.value); localStorage.setItem('currentPosition', e.target.value); }}
              />
              <label htmlFor="currentCompany">Current (Last) company:</label>
              <input
                type="text"
                id="currentCompany"
                name="currentCompany"
                value={currentCompany}
                onChange={(e) => { setCurrentCompany(e.target.value); localStorage.setItem('currentCompany', e.target.value); }}
              />
              <label htmlFor="yearsInCurrent">Years in current (last) company:</label>
              <input
                type="text"
                id="yearsInCurrent"
                name="yearsInCurrent"
                value={yearInCurrent}
                onChange={(e) => { setYearInCurrent(e.target.value); localStorage.setItem('yearInCurrent', e.target.value); }}
              />
              <label htmlFor="currentType">Current job type:</label>
              <input
                type="text"
                id="currentType"
                name="currentType"
                value={currentType}
                onChange={(e) => { setCurrentType(e.target.value); localStorage.setItem('currentType', e.target.value); }}
              />
              <label
                htmlFor="skills"
                className={
                  skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0).length <
                  currentRule.skills.length
                    ? 'not-relevant'
                    : 'relevant'
                }
              >
                Relevant skills:
              </label>
              <textarea
                id="skills"
                name="skills"
                value={skills}
                onChange={(e) => { setSkills(e.target.value); localStorage.setItem('skills', e.target.value); }}
              ></textarea>
              <label htmlFor="all-skills">All found skills:</label>
              <textarea
                id="all-skills"
                name="all-skills"
                value={allSkills}
                onChange={(e) => { setAllSkills(e.target.value); localStorage.setItem('allSkills', e.target.value); }}
              ></textarea>
              <label htmlFor="reachoutTopic">Reach out topic:</label>
              <Select
                value={reachoutTopic}
                name="reachoutTopic"
                onChange={(selectedOption) => {
                  setReachoutTopic(selectedOption);
                  localStorage.setItem('reachoutTopic', JSON.stringify(selectedOption));
                }}
                options={[] /* Add your options here */}
                components={{ Input: CustomInput }}
              />
              <label htmlFor="reachoutComment">Reach out comment:</label>
              <textarea
                name="reachoutComment"
                value={reachoutComment}
                onChange={(e) => { setReachoutComment(e.target.value); localStorage.setItem('reachoutComment', e.target.value); }}
              ></textarea>
              <label htmlFor="relevant">Relevant:</label>
              <Select
                value={relevant}
                name="relevant"
                onChange={(selectedOption) => {
                  setRelevant(selectedOption);
                  localStorage.setItem('relevant', JSON.stringify(selectedOption));
                }}
                options={[] /* Add your options here */}
                components={{ Input: CustomInput }}
              />
              <div className="btn">
                <input
                  type="submit"
                  disabled={!rules.length}
                  onClick={sendData}
                />
              </div>
            </>
          )}
          {currentTab === 'company' && (
            <>
              <div className="btn">
                <button type="button" onClick={scrape2} disabled={!rules.length}>Scrape</button>
              </div>
              <div className="btns">
                <button type="button" onClick={() => handleNextBack('back')} disabled={!back}>Back</button>
                <button type="button" onClick={() => handleNextBack('next')} disabled={!next}>Next</button>
              </div>
              <label htmlFor="owner">Owner:</label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={owner}
                onChange={(e) => { setOwner(e.target.value); localStorage.setItem('owner', e.target.value); }}
                required
              />
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => { setName(e.target.value); localStorage.setItem('name', e.target.value); }}
              />
              <label htmlFor="followers">Followers:</label>
              <input
                type="text"
                id="followers"
                name="followers"
                value={followers}
                onChange={(e) => { setFollowers(e.target.value); localStorage.setItem('followers', e.target.value); }}
              />
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); localStorage.setItem('description', e.target.value); }}
              ></textarea>
              <label htmlFor="website">Website:</label>
              <input
                type="text"
                id="website"
                name="website"
                value={website}
                onChange={(e) => { setWebsite(e.target.value); localStorage.setItem('website', e.target.value); }}
              />
              <label htmlFor="industry">Industry:</label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); localStorage.setItem('industry', e.target.value); }}
              />
              <label htmlFor="companySize">Company Size:</label>
              <input
                type="text"
                id="companySize"
                name="companySize"
                value={companySize}
                onChange={(e) => { setCompanySize(e.target.value); localStorage.setItem('companySize', e.target.value); }}
              />
              <label htmlFor="totalHeadcount">Total Headcount:</label>
              <input
                type="text"
                id="totalHeadcount"
                name="totalHeadcount"
                value={totalHeadcount}
                onChange={(e) => { setTotalHeadcount(e.target.value); localStorage.setItem('totalHeadcount', e.target.value); }}
              />
              <label htmlFor="medianTenure">Median Tenure:</label>
              <input
                type="text"
                id="medianTenure"
                name="medianTenure"
                value={medianTenure}
                onChange={(e) => { setMedianTenure(e.target.value); localStorage.setItem('medianTenure', e.target.value); }}
              />
              <label htmlFor="hq">HQ:</label>
              <input
                type="text"
                id="hq"
                name="hq"
                value={hq}
                onChange={(e) => { setHq(e.target.value); localStorage.setItem('hq', e.target.value); }}
              />
              <label htmlFor="specialities">Specialities:</label>
              <input
                type="text"
                id="specialities"
                name="specialities"
                value={specialities}
                onChange={(e) => { setSpecialities(e.target.value); localStorage.setItem('specialities', e.target.value); }}
              />
              <label htmlFor="post1Url">Post 1 URL:</label>
              <input
                type="text"
                id="post1Url"
                name="post1Url"
                value={post1Url}
                onChange={(e) => { setPost1Url(e.target.value); localStorage.setItem('post1Url', e.target.value); }}
              />
              <label htmlFor="post1Text">Post 1 Text:</label>
              <textarea
                id="post1Text"
                name="post1Text"
                value={post1Text}
                onChange={(e) => { setPost1Text(e.target.value); localStorage.setItem('post1Text', e.target.value); }}
              ></textarea>
              <label htmlFor="post2Url">Post 2 URL:</label>
              <input
                type="text"
                id="post2Url"
                name="post2Url"
                value={post2Url}
                onChange={(e) => { setPost2Url(e.target.value); localStorage.setItem('post2Url', e.target.value); }}
              />
              <label htmlFor="post2Text">Post 2 Text:</label>
              <textarea
                id="post2Text"
                name="post2Text"
                value={post2Text}
                onChange={(e) => { setPost2Text(e.target.value); localStorage.setItem('post2Text', e.target.value); }}
              ></textarea>
              <label htmlFor="post3Url">Post 3 URL:</label>
              <input
                type="text"
                id="post3Url"
                name="post3Url"
                value={post3Url}
                onChange={(e) => { setPost3Url(e.target.value); localStorage.setItem('post3Url', e.target.value); }}
              />
              <label htmlFor="post3Text">Post 3 Text:</label>
              <textarea
                id="post3Text"
                name="post3Text"
                value={post3Text}
                onChange={(e) => { setPost3Text(e.target.value); localStorage.setItem('post3Text', e.target.value); }}
              ></textarea>
              <label htmlFor="recentlyPostedJobs">Recently Posted Jobs:</label>
              <textarea
                id="recentlyPostedJobs"
                name="recentlyPostedJobs"
                value={recentlyPostedJobs}
                onChange={(e) => { setRecentlyPostedJobs(e.target.value); localStorage.setItem('recentlyPostedJobs', e.target.value); }}
              ></textarea>
            </>
          )}
        </form>
      )}
    </div>
  );
}

root.render(<Popup />);

# chrome-extension-frontend

## Summary

1. [Launching and using the extension](https://github.com/scaleupgroup/chrome-extension-frontend#launching-and-using-the-extension)
2. [Project structure](https://github.com/scaleupgroup/chrome-extension-frontend#project-structure)
3. [/scr](https://github.com/scaleupgroup/chrome-extension-frontend#scr)
4. [Popup.js logic](https://github.com/scaleupgroup/chrome-extension-frontend#project-structure)
5. [Important Notes](https://github.com/scaleupgroup/chrome-extension-frontend#project-structure)

___


## Launching and using the extension
1. Press button "Code" 
2. Click on "Download ZIP" and unzip the downloaded file
3. Open Chrome and click on three dots in the upper right corner
4. Click on "More tools" and then on "Extensions"
5. Turn on "Developer mode" in the upper right corner
6. Сlick on the "Load unpacked" button that has just appeared in the upper left corner
7. Select "dist" to upload
8. "SU sourcing" the extension should have appeared in the list of your extensions
9. When you open the link to the candidate's LinkedIn from Google Spreadsheet, you will see the extension window automatically open on the right-hand side of the screen
10. Set your initials in the "Owner" field, in the format "XXX" you can find them in your work email "xxx@scaleup.agency"
11. In the Rules selector, select the ojb for which you are sourcing candidates
12. Click the "Scrape" button and the extension will populate the data from the candidate page of the extension
13. Check that the data is filled in correctly, as the extension often makes mistakes
14. Manually fill in the fields: "Reach out topic", "Reach out comment", "Relevant"
15. Click on the "Submit" button and the extension will fill in the data in the Google Sheet
16. Once you see the popup with the result of the data in the Google Sheet, you can click on "Next" and move on to the next candidate
17. Repeat from step 12

[Video tutorial on using the extension](https://drive.google.com/file/d/1TalfiQL1l0lLJkzF5I6od_8dX5xhXmiT/view?usp=sharing)

___


## Project structure

Each file has comments that go into more detail about the code in it. This is just a general description of the purpose of the files.

* **/dist** - this is the directory where processed and bundled files will be saved after running the webpack build process (`npm run build` or `npm run dev`). This is the folder that is uploaded to the *chrome://extensions*.

* **/public** - this folder contains static assets that aren't handled by webpack, like the manifest.json and static images, gifs.

* **/src** - this is the source directory whith all source code of the extension 

* **.env** - links to the backend (`SERVER_MAIN` - instance on the GCP App Engine; `SERVER_LOCAL` - local instance used for development)

* **.gitignore** - text file that tells Git which files or folders to ignore in a project, preventing them from being tracked, committed, or uploaded to the remote repository.

* **package-lock.json** - this file holds various metadata relevant to the project.

* **package.json** - this is an automatically generated file that is created whenever a new module is installed in the project using npm. It locks down the versions of a project's dependencies so that you can control exactly which versions of each dependency will be used when anyone runs `npm install` on the project.

* **webpack.config.js** - file serves as a configuration guide for Webpack, a module bundler.

* **webpack.dev.js** - extends the base webpack configuration (*webpack.config.js*) with development-specific settings, such as enabling source maps for easier debugging (`devtool: "inline-source-map"`), by using the "webpack-merge" module.

* **webpack.prod.js** - merges the base webpack configuration (*webpack.config.js*) with settings optimal for production, such as minification and optimization, by declaring `mode: "production"`.

### /scr
* **/lib** - files with helper functions that are triggered in the **popup.js**, for example function for counting the time spent on a page (*slowdown.js*)
  * **clipboard.js** - the function `writeToClipboard(errorMessage)` copies the provided `errorMessage` to the system clipboard after a 1 second delay.
  * **input.js** - `CustomInput` function is a React component that wraps around react-select's Input component and adds a `maxLength` property to it. We use it for select components like "Rules" and "Status".
  * **rule.js** - file with const that have structure of the empty rule to use in the logic in the **popup.js**.
  * **skills.js** - function `prepareSkills` takes a string of skills, splits them by commas, trims any extra spaces around each skill, removes any empty strings, and then rejoins them into a single string with each skill separated by a comma and a space that will be save to the database.
  * **slowdown.js** - file contains a function that decides whether an animation should be displayed before switching to the next page. An animation is displayed to ensure that LikedIn has not blocked the user for switching pages quickly. 
* **/scraping** - files with functions for scraping candidate information from the page, these functions are triggered when the "Scrape" button is clicked from the `scrape()` function in **popup.js**
  * **basicInfo.js** - file contains a function that finds in the first section of the profile the name of the candidate, the number of connections and by using the regexes of the skills for that job (`skillsRegex`) and for all the skills (`allSkillsRegex`), the function finds in the first section the relevant skills of the candidate.
  * **currentJob.js** - file contains a function which will find the current or last position in which the candidate is (were) working in the experience section.
  * **name.js** - file contains a function that will find the name of the candidate whose profile is now open.
  * **skills.js** - file contains a function that selects all relevant skills for the job and for all relevant skills in the skills section using the regexes for the skills relevant to the job (`skillsRegex`) and for all relevant skills (`allSkillsRegex`).
  * **totalExperience.js** - file contains a function that calculates the candidate's total work experience based on the jobs listed in the candidate's profile and in the job descriptions the function uses regexes to select all relevant skills for the job (`skillsRegex`) and for all relevant skills (`allSkillsRegex`).
  * **university.js** - file contains a function which will retrieve from the education section the name of the last listed school (if any), the year of graduation, and using a regex (`uniRegex`) of the relevant universities for the position, determine if the found school is relevant for the sourcing job. 

* **background.js** - this file istening for certain events and responds accordingly. In our script, it sets up a context menu when the extension is installed and listens for tab updates. When a tab finishes loading a LinkedIn profile page, it sends a message to that tab to open a modal window with extenion. It also listens for a `"successful_upload"` message (*when user uploaded data to the Google Sheet clicking on the "Submit" button*) and, when it gets one, sends a message back to the tab to show a successful status popup.

* **content.js** - interacts with the content of the pages browser displays. It listens for messages from the background script. When it receives a "openModal" message, it injects a modal into the LinkedIn profile page currently displayed. This modal contains an iframe that loads a 'popup.html' page (*UI of the extension*). If it receives a "showSuccessfulStatus" message, it creates a status modal and displays it for 2 seconds (*popup that will be displayed after the candidate's data has been successfully uploaded to Google Sheet*).

* **index.css** - extension styles, layout of which can be found in the **popup.js** file

* **popup.html** - file serves as a template for the modal injected into LinkedIn profiles by extension. It's a basic HTML document that includes a div with the id "react-target", which is where your React application will attach itself.

* **popup.js** -  file has the logic and layout of the popup and modal window in the extension. In our case, this file is responsible for rendering React application into the `"react-target"` div of **popup.html**.

___


## Popup.js logic
1. When the extension is loaded, it will take all previously saved data from the localStorage to the local state into Popup component in popup.js
2. Sorser enters his or her initials in the **"Owner"** field
3. Extension triggers `useEffect(() => {}, [owner])` в **popup.js**
4. If there are no `next` and `back` links yet, call `findBackNextlinks()`
5. The `findBackNextlinks()` function finds the name of the current candidate and sends it to the backend along with the sourser's initials, in response the extension receives links to the next and previous candidate in the Google Spreadsheet, the sourser's current statistics and a list of rules (jobs) in which the sourser has been added to the [relevancy site](http://relevancy.scaleup.wtf/login)
6. After receiving data from the backend, the `createRulesOptions()` function will run to create options for the select input **"Rules"** with the received rules
7. The sourser in the select input **"Rules"** will select the job for which he is sourcing candidates, thus setting up the correct regexes for scraping
8. The sourcer presses **"Scrape"** and the application starts the `scrape()` function from which `getInfo()`, `getCurrent()`, `getUniversity()`, `getExp()`, `getSkills()` will be called one by one to fill all fields except **"Status"**, **"Reach out topic"**, **"Reach out comment"**, **"Relevant"** (*these fields should be filled manually*) with found data from candidate profile.
9. The sourcer presses the **"Submit"** button
10. The application will run the `sendData()` function, which will save the scraped data to the Google Spreadsheet, update the sourcer statistics and show a popup with the result of saving the data
11. The sourcer will press the **"Back"**, **"Next"** buttons and if more than 10 seconds have passed since the extension was loaded, the extension will move on to the next candidate in the Google Spreadsheet. Otherwise, the extension will display an animation until 10 seconds have passed since the extension was loaded, so that LinkedIn does not block the sourcer.

___


## Important Notes

**Note 1:** when you update any data in a form, it is updated not only in the local state, but also in the local storage. So when you open another page, you will have previous candidate's data in the form and you compare them with new profile also you will have same selected job and owner's initials. Also localstorage alows to show the same data in the extension's native popup

**Note 2:** when an error occurs in the `sendData()` and `findBackNextLinks()` functions, the extension will call an alert which will show the error text and allow it to be copied to clipboard using the `writeToClipboard()` function

**Note 3:** only the **/dist** directory archive is sent to the sourcers. It is uploaded to this folder. Make sure that the `WebpackObfuscator` plugin has been commented out in **webpack.config.js** before uploading. Otherwise, run the `npm run build` command again in the terminal During the build time it makes code less readable in the build to make it harder to steal the code.



// file contains a function which will retrieve from the education section the name of the last listed school (if any), the year of graduation, and using a regex (uniRegex) of the relevant universities for the position, determine if the found school is relevant for the sourcing job.

export function getUniversity(uniRegex) {
  // Convert the regular expression from string to RegExp objects, with case-insensitive search.
  uniRegex = new RegExp(uniRegex, "i");
  let main = document.querySelector("main").innerText;
  // If the main section contains the word 'Education'
  if (/Education/.test(main)) {
    // Remove HTML tags, if any, and split the content by line breaks.
    let content = main.replace(/<\/?[^>]+(>|$)/g, "").split("\n");
    // Search for the index where the 'Education' line is
    let i = 0;
    for (; i < content.length; i++) {
      if (/^Education$/.test(content[i])) {
        break;
      }
    }
    console.log("Found education content:");
    console.log(content[i + 2]);
    // Extract the university name, which is expected to be 2 lines below 'Education'
    let university = content[i + 2];
    let graduationYear = "";
    // Extract the graduation year, which is expected to be 5 or 6 lines below 'Education'.
    if (/\d{4}( - \d{4})?/.test(content[i + 5])) {
      graduationYear = content[i + 5];
    } else if (/\d{4}( - \d{4})?/.test(content[i + 6])) {
      graduationYear = content[i + 6];
    }
    // If a range of years was found, get only the last one.
    graduationYear = graduationYear.split(" - ");
    graduationYear = graduationYear[graduationYear.length - 1];
    // Test if the university name matches the regex.
    if (uniRegex.test(content[i + 2])) {
      return {
        relevant: true, // if the university is in the list of relevant universities.
        university: university,
        graduationYear: graduationYear,
      };
    } else {
      return {
        relevant: false,
        university: university,
        graduationYear: graduationYear,
      };
    }
  } else {
    // If no education information is found, return a default object.
    return { relevant: false, university: "No", graduationYear: "" };
  }
}

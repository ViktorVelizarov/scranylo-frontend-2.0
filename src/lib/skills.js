// function takes a string of skills, splits them by commas, trims any extra spaces around each skill, removes any empty strings, and then rejoins them into a single string with each skill separated by a comma and a space.
export function prepareSkills(skills) {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)
    .join(", ");
}
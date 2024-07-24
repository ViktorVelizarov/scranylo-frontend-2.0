// This function retrieves the name from a LinkedIn profile
export function getCurrentName() {
  let name = document.querySelector("div.ph5 h1").innerText;
  // If name has parentheses, remove second name of the candidate, for example Egon (Adam) Veermae => Egon Veermae
  if (name.indexOf("(") >= 0) {
    let fullName = name.split(/\(|\)/);
    fullName.splice(1, 1);
    fullName = fullName.map((e) => e.trim());
    name = fullName.join(" ");
  }
  return name;
}

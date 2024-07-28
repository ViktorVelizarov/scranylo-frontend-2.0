export function getCompanyOverviewAfterNavigation() {
    // Log the entire HTML document to the console
    console.log("whole html: ")
    console.log(document.documentElement.outerHTML);

    let info = {};

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

    console.log("info:");
    console.log(info);

    return info;
}

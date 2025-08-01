const log=require("../utils/log");
// Config
const API_BASE_URL = 'https://assessment.ksensetech.com/api/patients';
const API_KEY = 'ak_01dace6ffca8c9ed47c66d7d5acf11034db27d48a0080b6d';
const MAX_RETRIES = 10;
const INITIAL_BACKOFF_MS = 1000;
const MAX_PAGES_TO_TRY = 50;

async function fetchWithRetry(page) {
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const url = `${API_BASE_URL}?page=${page}`;
            log(`Attempting to fetch page ${page} (Attempt: ${attempt + 1})...`);
            const response = await fetch(url, {
                headers: {
                    'x-api-key': API_KEY,
                },
            });
            if (response.ok) {
                const data = await response.json();
                const patientData=data.data
                log(`Page ${page} fetched successfully! Got ${Array.isArray(patientData) ? patientData.length : 0} records.`, 'success');
                return patientData;
            }
            if ([429, 500, 503].includes(response.status)) {
                lastError = new Error(`API returned status: ${response.status}. Retrying...`);
                const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                log(`Encountered error ${response.status}. Retrying in ${delay}ms...`, 'error');
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Go to the next attempt
            }

            throw new Error(`API returned an unrecoverable error: ${response.status} ${response.statusText}`);

        } catch (error) {
            lastError = error;
            log(`Request failed: ${error.message}`, 'error');
            if (attempt < MAX_RETRIES - 1) {
                const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                log(`Will retry in ${delay}ms...`, 'error');
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error(`Failed to fetch page ${page} after ${MAX_RETRIES} attempts. Last error: ${lastError.message}`);
}

async function fetchAllPatients() {
    let currentPage = 1;
    const allPatients = [];

    while (currentPage <= MAX_PAGES_TO_TRY) {
        try {
            const pageData = await fetchWithRetry(currentPage);
            if (!Array.isArray(pageData)) {
                log(`Response for page ${currentPage} was not an array. Stopping fetch.`, 'error');
                break;
            }
            if (pageData.length === 0) {
                log('API returned an empty array, assuming all data has been fetched.', 'success');
                break;
            }
            allPatients.push(...pageData);
            log(`Total patients collected so far: ${allPatients.length}`);

        } catch (error) {
            log(`Could not fetch page ${currentPage}. It will be skipped. Error: ${error.message}`, 'error');
        }
        currentPage++;
    }

    if (currentPage > MAX_PAGES_TO_TRY) {
        log(`Reached the maximum page limit of ${MAX_PAGES_TO_TRY}. Concluding process.`, 'info');
    }

    return allPatients;
}

// (async () => {
//     const allPatients = await fetchAllPatients();
//     console.log(allPatients);
// })();

module.exports = { fetchAllPatients };

const log=require("../utils/log");
// Config
const SUBMIT_API_BASE_URL = 'https://assessment.ksensetech.com/api/submit-assessment';
const API_KEY = 'ak_01dace6ffca8c9ed47c66d7d5acf11034db27d48a0080b6d';


async function postResult(data) {
    if(!data){
        log("No Submit data");
        return;
    }
    try {
        const response = await fetch(SUBMIT_API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            log(`Submit result encountered error ${response.status}.`, 'error');
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        log('Submit result Success');
        console.log(responseData);
    } catch (error) {
        log(`Could not submit result Error: ${error.message}`, 'error');
    }
}

module.exports = { postResult };

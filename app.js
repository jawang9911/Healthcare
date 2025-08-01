const {fetchAllPatients} = require('./service/fetchAllPatients');
const {analyzeData} = require("./controller/analyzeData");
const {postResult} = require("./service/postResult");

async function main() {
    try {
        const doctorInfo = await fetchAllPatients();
        const result = analyzeData(doctorInfo);
        await postResult(result);
    } catch (error) {
        console.error('Error fetching patients:', error);
    }
}
//execute main function
main()
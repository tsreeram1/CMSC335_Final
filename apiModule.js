const axios = require('axios');

async function getActivityName() {
    try {
        const res = await axios.get('http://www.boredapi.com/api/activity')
        return res.data.activity
    } catch(e) {
        console.log("Error occurred while using Bored API.")
        console.error(e)
    }
}

module.exports = { getActivityName }
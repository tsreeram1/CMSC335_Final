const axios = require('axios');

async function getActivityName() {
    try {
        const res = await axios.get('http://www.boredapi.com/api/activity')
        console.log(res.data.activity)
        return res.data.activity
    } catch(e) {
        console.log("Error occurred while using APIs.")
        console.error(e)
    }
}

module.exports = { getActivityName }
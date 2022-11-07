const {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_BUCKET,
    PORT
} = process.env;

if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_BUCKET) {
    console.warn('Some of the required env. variables are missing.');
    process.exit(1);
}

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_BUCKET,
    PORT: PORT || 3000
};

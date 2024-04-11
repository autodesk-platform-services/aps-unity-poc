const express = require('express');
const { SdkManagerBuilder } = require('@aps_sdk/autodesk-sdkmanager');
const { AuthenticationClient, Scopes } = require('@aps_sdk/authentication');
const { OssClient } = require('@aps_sdk/oss');
const { ModelDerivativeClient } = require('@aps_sdk/model-derivative');
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_BUCKET } = require('../config.js');

const sdkManager = SdkManagerBuilder.create().build();
const authenticationClient = new AuthenticationClient(sdkManager);
const ossClient = new OssClient(sdkManager);
const modelDerivativeClient = new ModelDerivativeClient(sdkManager);
let router = express.Router();

let _credentials = null;
async function getAccessToken() {
    if (!_credentials || _credentials.expires_at < Date.now()) {
        _credentials = await authenticationClient.getTwoLeggedToken(APS_CLIENT_ID, APS_CLIENT_SECRET, [Scopes.DataRead, Scopes.ViewablesRead]);
        _credentials.expires_at = Date.now() + credentials.expires_in * 1000;
    }
    return _credentials.access_token;
}

async function listObjects(bucketKey) {
    const accessToken = await getAccessToken();
    let resp = await ossClient.getObjects(accessToken, bucketKey, { limit: 64 });
    let objects = resp.items;
    while (resp.next) {
        const startAt = new URL(resp.next).searchParams.get('startAt');
        resp = await ossClient.getObjects(accessToken, bucketKey, { startAt, limit: 64 });
        objects = objects.concat(resp.items);
    }
    return objects;
}

// List models in a pre-configured bucket
router.get('/', async function (req, res, next) {
    try {
        const objects = await listObjects(APS_BUCKET);
        res.json(objects.map(obj => {
            return {
                name: obj.objectKey,
                urn: urnify(obj.objectId)
            };
        }));
    } catch (err) {
        next(err);
    }
});

router.use('/:urn', async function (req, res, next) {
    try {
        const { urn } = req.params;
        const result = await modelDerivativeClient.getModelViews(await getAccessToken(), urn);
        req.defaultViewable = result.data.metadata.find(entry => entry.role === '3d');
        next();
    } catch (err) {
        next(err);
    }
});

// Retrieve hierarchy for the default viewable of a model
router.get('/:urn/hierarchy', async function (req, res, next) {
    try {
        const { urn } = req.params;
        const accessToken = await getAccessToken();
        const response = req.query.dbid
            ? await modelDerivativeClient.getObjectTree(accessToken, urn, req.defaultViewable.guid, { objectId: req.query.dbid })
            : await modelDerivativeClient.getObjectTree(accessToken, urn, req.defaultViewable.guid);
        res.json(response.data.objects);
    } catch (err) {
        next(err);
    }
});

// Retrieve properties for the default viewable of a model
router.get('/:urn/properties', async function (req, res, next) {
    try {
        const { urn } = req.params;
        const accessToken = await getAccessToken();
        const response = req.query.dbid
            ? await modelDerivativeClient.getAllProperties(accessToken, urn, req.defaultViewable.guid, { objectId: req.query.dbid })
            : await modelDerivativeClient.getAllProperties(accessToken, urn, req.defaultViewable.guid);
        res.json(response.data.collection);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

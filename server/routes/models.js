const express = require('express');
const { DataManagementClient, ModelDerivativeClient, urnify } = require('forge-server-utils');
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_BUCKET } = require('../config.js');

let dataManagementClient = new DataManagementClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
let modelDerivativeClient = new ModelDerivativeClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
let router = express.Router();

// List models in a pre-configured bucket
router.get('/', async function (req, res, next) {
    try {
        const objects = await dataManagementClient.listObjects(APS_BUCKET);
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
        const result = await modelDerivativeClient.getMetadata(urn);
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
        const response = req.query.dbid
            ? await modelDerivativeClient.getViewableTree(urn, req.defaultViewable.guid, undefined, req.query.dbid)
            : await modelDerivativeClient.getViewableTree(urn, req.defaultViewable.guid);
        res.json(response.data.objects);
    } catch (err) {
        next(err);
    }
});

// Retrieve properties for the default viewable of a model
router.get('/:urn/properties', async function (req, res, next) {
    try {
        const { urn } = req.params;
        const response = req.query.dbid
            ? await modelDerivativeClient.getViewableProperties(urn, req.defaultViewable.guid, undefined, req.query.dbid)
            : await modelDerivativeClient.getViewableProperties(urn, req.defaultViewable.guid);
        res.json(response.data.collection);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

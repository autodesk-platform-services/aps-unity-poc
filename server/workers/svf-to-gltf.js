const { ModelDerivativeClient, ManifestHelper } = require('forge-server-utils');
const { SvfReader, GltfWriter } = require('forge-convert-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = require('../config.js');

/*
 * Customized glTF writer, outputting meshes with an additional _CUSTOM_INDEX
 * mesh attribute (UNSIGNED_BYTE, vec4) encoding a 32-bit object ID.
 */
class CustomGltfWriter extends GltfWriter {
    constructor(options) {
        super(options);
        this._currentDbId = -1;
    }

    createNode(fragment /* IMF.IObjectNode */, imf /* IMF.IScene */, outputUvs /* boolean */) /* gltf.Node */ {
        this._currentDbId = fragment.dbid;
        return super.createNode(fragment, imf, outputUvs);
    }

    createMeshGeometry(geometry /* IMF.IMeshGeometry */, imf /* IMF.IScene */, outputUvs /* boolean */) /* gltf.Mesh */ {
        let mesh = super.createMeshGeometry(geometry, imf, outputUvs);
        let prim = mesh.primitives[0];

        if (prim) {
            // Output custom attr buffer
            const vertexCount = geometry.getVertices().length / 3;
            const customBuffer = Buffer.alloc(vertexCount * 4);
            for (let i = 0; i < customBuffer.length; i += 4) {
                customBuffer[i] = this._currentDbId & 0xff;
                customBuffer[i + 1] = (this._currentDbId >> 8) & 0xff;
                customBuffer[i + 2] = (this._currentDbId >> 16) & 0xff;
                customBuffer[i + 3] = (this._currentDbId >> 24) & 0xff;
            }
            const customBufferView = this.createBufferView(customBuffer);
            const customBufferViewID = this.addBufferView(customBufferView);
            const customAccessor = this.createAccessor(customBufferViewID, 5121 /* UNSIGNED_BYTE */, customBufferView.byteLength / 4, 'VEC4');
            customAccessor.normalized = true;
            const customAccessorID = this.addAccessor(customAccessor);
            prim.attributes['COLOR_0'] = customAccessorID;
        }

        return mesh;
    }

    computeMeshHash(mesh /* gltf.Mesh */) /* string */ {
        return mesh.primitives.map(p => {
            return `${p.mode || ''}/${p.material || ''}/${p.indices}`
                + `/${p.attributes['POSITION'] || ''}/${p.attributes['NORMAL'] || ''}/${p.attributes['TEXCOORD_0'] || ''}`
                + `/${p.attributes['COLOR_0'] || ''}`;
        }).join('/');
    }
}

async function convert(urn, guid, outputDir) {
    const auth = { client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET };
    // const modelDerivativeClient = new ModelDerivativeClient(auth);
    // const helper = new ManifestHelper(await modelDerivativeClient.getManifest(urn));
    // const derivatives = helper.search({ type: 'resource', role: 'graphics' });
    // if (derivatives.length === 0) {
    //     throw new Error('No 3D viewables found.');
    // }
    // let derivative = derivatives.find(entry => entry.useAsDefault) || derivatives[0];
    const reader = await SvfReader.FromDerivativeService(urn, guid, auth);
    const scene = await reader.read({ log: console.log });
    const writer = new CustomGltfWriter({
        ignoreLineGeometry: true,
        ignorePointGeometry: true,
        deduplicate: false,
        skipUnusedUvs: true,
        log: console.log
    });
    await writer.write(scene, outputDir);
}

convert(process.argv[2], process.argv[3], process.argv[4])
    .then(() => console.log('Done!'))
    .catch(err => { console.error(err); process.exit(1); });

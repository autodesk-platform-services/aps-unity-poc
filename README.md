# APS/Unity Prototype

![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![node.js](https://img.shields.io/badge/node.js-16.17-blue.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-8.15-blue.svg)](https://www.npmjs.com/)
[![license](https://img.shields.io/:license-mit-green.svg)](https://opensource.org/licenses/MIT)

[![Model Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](https://aps.autodesk.com/en/docs/model-derivative/v2/overview/)

Prototype application allowing you to load and preview your [Autodesk Platform Services](https://aps.autodesk.com) models in Unity.

![thumbnail](./thumbnail.png)

The sample code consists of two projects:

- Simple Node.js server used to list 3D models in a pre-configured APS bucket, and convert the models
into the glb format with [meshopt](https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md) compression.
To enable picking, the conversion process also embeds 32-bit object IDs in the color channel of the output geometry.

- Unity application that communicates with the Node.js server, and uses [glTFast](https://github.com/atteneder/glTFast)
to load and preview the generated glb files. It includes a "pointer" game object that can identify whatever object
it is pointing at by parsing the object ID from the color channel.

## Development

### Prerequisites

- APS credentials (see the [Create an App](https://aps.autodesk.com/en/docs/oauth/v2/tutorials/create-app) tutorial)
- [Node.js](https://nodejs.org) (recommended version: LTS), and [yarn](https://yarnpkg.com)
- [Unity](https://unity.com) (recommended version: 2020.3.29f1)
- Terminal (for example, [Windows Command Prompt](https://en.wikipedia.org/wiki/Cmd.exe), or [macOS Terminal](https://support.apple.com/guide/terminal/welcome/mac))

### Setup & Run

- Clone this repository
- Install dependencies: `yarn install`
- Setup env. variables:
  - `APS_CLIENT_ID` - your APS application client ID
  - `APS_CLIENT_SECRET` - your APS application client secret
  - `APS_BUCKET` - APS bucket with designs to load and display
- Run the server app: `yarn start`
- Open the Unity project in the `unity/DesignPreview` subfolder
- Run the Unity project; the dropdown in the UI should be populated with designs available in your configured bucket, and after selecting one of the designs from the dropdown the server will download the design, preprocess it, and finally load it into the 3D scene

## Troubleshooting

Submit your question via [APS Support Form](https://aps.autodesk.com/en/support/get-help).

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for more details.

## Author

Petr Broz ([@ipetrbroz](https://twitter.com/ipetrbroz)), Developer Advocate

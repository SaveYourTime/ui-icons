# ui-icons

An automated script that downloads icon SVGs in Figma via the [Figma REST API](https://www.figma.com/developers/api), optimizes them with [SVGO](https://github.com/svg/svgo), and convert them into React Component through [SVGR](https://react-svgr.com/).

## How does it work?

First, we send an API request with the `Figma REST API` to get a list of all icon nodes in the Figma File.

Second, we `parse` and `validate` the response nodes with a valid name, style, and size.

Third, download the SVG file with node-id and `optimize` it with `SVGO`.

Fourth, we save the optimized SVG file to the `src/svg` directory.

Finally, we convert the SVG file into React Component with `SVGR` to the `src/icons` directory.

## Installation

Use the package manager [yarn](https://yarnpkg.com/) to install dependencies.

```
yarn install
```

## Prerequisites

1. Create a `.env` file at the root of project (you can duplicated one from `.env.example`)

2. Configure the environment variables below

- FIGMA_TOKEN - Your Figma API token. (Generate your personal access token from [this instruction](https://www.figma.com/developers/api#access-tokens))
- FIGMA_FILE_KEY - The key of the Figma file you want to download icons from.
- FIGMA_NODE_ID - The node inside the Figma file you want to download icons from.

> The _file key_ and _node id_ can be parsed from any Figma node url: https://www.figma.com/file/:key/:title?node-id=:id

<img src="https://i.imgur.com/8uExjLS.png" width="600" />

## Usage

##### Download all the icons from specific Figma file node, run:

```
yarn icons:fetch
```

##### Generate React Icon Component, run:

```
yarn icons:generate
```

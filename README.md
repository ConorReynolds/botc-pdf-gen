# BOTC Script PDF Generator

Basic utility that boots the new script tool in a headless browser and uses it to quickly and automatically generate multiple script PDFs.

## Prerequisites

You’ll need to [install Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). There are instructions on that page for what to do on Windows, Mac, and Linux.

## Usage

Open a terminal. Clone this repository into a new directory:

```sh
git clone https://github.com/ConorReynolds/botc-pdf-gen.git
```

Navigate to the directory in your terminal. If you just cloned it, do this:

```sh
cd botc-pdf-gen
```

Now run `npm i`. This installs the stuff you need to run the tool. (Don’t worry, it doesn’t install anything outside the tool’s directory.) If this doesn’t work, you probably didn’t install Node.js & NPM – see the prerequisites above.

To use this tool, you’ll need a directory with all your script JSONs in it – let’s say it’s at `path/to/scripts`. Invoke the tool like so:

```sh
npm start -- --directory="path/to/scripts"
```

For each script JSON in the directory, a new subdirectory will be created inside `path/to/scripts` with 3 PDFs:

- the **player sheet** (1 page)
- the **meta sheet** (1 page)
- the **night sheet** (2 pages, print double-sided)

If compact mode is enabled:

```sh
npm start -- --compact --directory="path/to/scripts"
```

… then each subdirectory will contain a single PDF with two pages, the first being the player sheet and the second being the meta sheet + compact night sheet.

## TODO

- [ ] CSS injection, maybe?


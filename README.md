# BOTC Script PDF Generator

Extremely basic utility that opens the new script tool in headless chromium and uses it to quickly generate multiple script PDFs.

## Prerequisites

You’ll need to [install Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). There are instructions on that page for what to do on Windows, Mac, and Linux.

## Usage

Run `npm i`, then copy the script link from the official script tool and pass it as an argument here:

```sh
npm start [script link]
```

This will generate a directory with three PDFs:

- the **player sheet** (1-sided)
- the **meta sheet** (1-sided)
- the **night sheet** (2-sided)

## TODO

- [ ] Add settings, especially for 2-sided PDF gen
- [ ] CSS injection


# CSS Grid Inspector

[CSS Grid](https://drafts.csswg.org/css-grid/) is awesome. It's more awesome if you can see the lines while you are defining the grid. So we here at the Mozilla Developer Relations Team created this basic Grid Inspector tool. Use it to see your grids.

![Screenshot of this tool in use](toolinaction.jpg)

We know this tool doesn't always work properly, and we are looking at when and why. It does however work for many grids — perhaps all of the simple ones. Please help out by [reporting problems and making requests](https://github.com/mozilla/css-grid-inspector/issues). We are limited in what we can do in this Extension, but many of the ideas being tested in this little project are informing more powerful tools for the future. Plus, for many of us working to understand Grid, this tool has been incredibly helpful, even with its limitations. We hope it's helpful for you, too.

This tool works only in Firefox. If you download and use [Firefox Nightly](https://nightly.mozilla.org/), you'll have the most-complete implementation of CSS Grid, and you don't have to flip a flag to make it work. It will Just Work™.

## To Install This Extention:
1. Open Firefox. [Nightly](https://nightly.mozilla.org/) is best.
2. Go to the [release page](https://github.com/potch/gridviz/releases), and click to download the most recent version of the the .xpi file.
3. Firefox will offer to install it for you. Say yes, please.
4. Use it by clicking the new icon in the upper right corner of the browser.
5. Enjoy! And [file issues](https://github.com/potch/gridviz/issues) with new ideas, feature requests, and bug reports. We need your help to make this better.

Need more help installing? Watch [this silent movie](howtoinstall.gif).

## To Help Develop This Extention

To develop this extension, you'll need `node` and `npm`.

For local development,

* `git clone` the project
* `npm install` to pick up dependencies including `jpm`
* `npm start` to start a test copy and file watching server.

Currently building against Firefox Nightly.

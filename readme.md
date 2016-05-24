# reddit imgur uploader

*A Chrome Extension that allows you to upload an image to Imgur and get the resulting URL without ever leaving your Reddit tab*

## building and running locally

In order to get up and running locally, you'll need to:

1. pull down the project
2. if you use nvm, run `nvm use` to make sure you're on a compatible version of node
3. run `npm install` from the project root
4. run `gulp` (this will build the js file and css file that Chrome will use and continue to listen to changes in source files)
5. go to `chrome://extensions` in Chrome
6. make sure "Developer mode" is on
7. click "Load unpacked extension..."
8. choose the project root directory, and you should be good to go!

## todos
- [ ] highlighting text then uploading an image will create a markdown-style link to that image
- [ ] account support
- [ ] drag and drop uploading
- [ ] refactor how we determine our behavior based on what page we're on (comments page vs. submit link vs. submit text)
- [ ] DRY up our uploader button injection
- [ ] figure out how to trigger RES comment preview on text injection
- [ ] add uploader button to /message/*
- [ ] move to ES6

![](https://zippy.gfycat.com/LoneAgonizingAztecant.gif)

![](https://fat.gfycat.com/EasyCalculatingCow.gif)

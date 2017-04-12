# verpix-viewer

The Viewer of [Verpix](https://www.verpix.me) to run panophoto and livephoto.

## Installation
In the browser, include the [minified library](https://d3je762wafoivc.cloudfront.net/sdk/sdk.js) in your html. The library contains panophoto and livephoto.
```html
<script src="https://d3je762wafoivc.cloudfront.net/sdk/sdk.js"></script>
```
You can also just include specfic version only for panophoto or livephoto.
```html
<!-- panophoto only version -->
<script src="https://d3je762wafoivc.cloudfront.net/sdk/sdk-panophoto.js"></script>
<!-- livephoto only version -->
<script src="https://d3je762wafoivc.cloudfront.net/sdk/sdk-livephoto.js"></script>
```

## Usage
### panophoto
You can run panophoto via html and javascript, detailed usage is shown in [API](#api-panophoto) section.
#### html
The library automatically takes all DOM elements with class *verpix-panophoto* and run panophoto on them.
```html
<div class="verpix-panophoto" data-id="ada933e24ca82c00" data-width="500" data-height="300"></div>
```
#### javascript
```javascript
// Create the DOM element that will show panophoto
const el = document.createElement('DIV');

// Set parameters
el.setAttribute('data-id', 'ada933e24ca82c00');
el.setAttribute('data-width', 500);
el.setAttribute('data-height', 300);

// Create panophoto
verpix.createPanophoto(el, {}, (err, instance) => {
  if (err) {
    // Something erro while creating, print it
    console.error(err);
  } else {
    // Append the panophoto on body
    document.body.appendChild(instance.root);
    // Start playing panophoto
    instance.start();
  }
});
```
### livephoto
```javascript
// TODO: Usage for livephoto
```

## API
### <a name="api-panophoto"></a>panophoto
```javascript
// TODO: API for panophoto
```
### <a name="api-livephoto"></a>livephoto
```javascript
// TODO: API for livephoto
```

## Development and Build
#### Prerequisites
* Install [Node.js](https://nodejs.org/).
* Clone the project to your file system:
```bash
git clone https://github.com/TopPano/verpix-viewer
```
* Go into the project directory
```bash
cd ./verpix-viewer
```
* Install dependencies
```bash
npm install
```
#### Development Mode
Run in development mode and hot re-building library when you modify source files.
```bash
npm start
```
#### Test
Run unit test.
```bash
npm test
```
You can also run test in watch mode. Test will re-run when you modify source and testing files.
```bash
npm run test:watch
```
#### Build
Build the library, the output files are in `public/dist`.
```bash
npm run build
```

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
The library automatically takes all html elements with class *verpix-panophoto* and run panophoto on them.
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
You can run panophoto via both html and javascript.
#### Via html
To run panophoto via html, you just need html elements whose class is *verpix-panophoto*. To parameterize, you should set the parameter value to html attribute `data-*`, such as `data-width="500"`. [Parameters](#api-panophoto) section shows all available parameters.
#### Via javascript
To run panophoto via javascript, call `verpix.createPanophoto`.
##### verpix.createPanophoto(source, params, callback(err, instance))
- **_source_**: One of following types
  - *type 0*: a *DOM element* that you want to show panophoto
  - *type 1*: a *string* that is a media ID you have posted in [Verpix](https://www.verpix.me)
  - *type 2*: an *array of string* that is each string is an URL of image
- **_params_**: An *object* that fills parameters, only used for *type 1* and *type 2*. *Type 0* is parameterized by setting attribute of `data-*`. [Parameters](#api-panophoto) section shows all available parameters.
- **_callback(err, instance)_**: An *function* that will be executed after creating.
  - *err*: An *Error object* if some errors occur while creating, and *null* if no error.
  - *instance*: An *object* that contains the panophoto DOM element and methods to manipulate it. The return value of *instance* depends on the value of *err*.
##### instance when error is null
You willget an DOM element that can display panophoto and methods to manipulate it.
<table class="table table-bordered table-striped">
  <thead>
		<tr>
			<th style="width: 100px;">Name</th>
      <th style="width: 100px;">Return</th>
			<th>Description</th>
		</tr>
	</thead>
		<tr>
			<td>root</td>
      <td></td>
			<td>The dom element that displays panophoto.</td>
		</tr>
		<tr>
			<td>start(function)</td>
      <td></td>
			<td>Start playing panophoto. An optional callback function will be called after starting.</td>
		</tr>
		<tr>
			<td>stop()</td>
      <td></td>
			<td>Stop playing panophoto.</td>
		</tr>
    <tr>
			<td>getCurrentCoordinates()</td>
      <td>{ lng: number, lat: number }</td>
			<td>Get current coordinates of panophoto, lng is longitude and lat is latitude.</td>
		</tr>
    <tr>
			<td>getCurrentCoordinates()</td>
      <td>DataURL</td>
			<td>Snapshot of current view. The snapshot is encoded in JPEG format.</td>
		</tr>
    <tr>
			<td>setPhotos(array[string])</td>
      <td></td>
			<td>Replace current photos to new ones. Each string in the array is an URL of image.</td>
		</tr>
    <tr>
      <td>setVisibleSize(number, number)</td>
			<td></td>
			<td>Change visible size. The first number is width and second is height.</td>
		</tr>
    <tr>
			<td>setAutoplay(bool)</td>
      <td></td>
			<td>Enable autoplay or not.</td>
		</tr>
  <tbody>
  </tbody>
</table>

##### instance when error is not null
You will get an DOM element that can show an alternative photo and methods to manipulate it.
<table class="table table-bordered table-striped">
  <thead>
		<tr>
			<th style="width: 100px;">Name</th>
      <th style="width: 100px;">Return</th>
			<th>Description</th>
		</tr>
	</thead>
		<tr>
			<td>root</td>
      <td></td>
			<td>The dom element that displays the alternative photo.</td>
		</tr>
		<tr>
			<td>showAltPhoto()</td>
      <td></td>
			<td>Show the alternative photo. It shows something only when parameter `altPhoto` is an URL of image.</td>
		</tr>
    <tr>
			<td>hideAltPhoto</td>
      <td></td>
			<td>Hide the alternative photo.</td>
		</tr>
  <tbody>
  </tbody>
</table>

#### <a name="api-panophoto-params">Parameters
```javascript
// TODO: Parameters for livephoto
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

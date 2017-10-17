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

You can run panophoto via html and javascript, detailed usage is shown in [Panophoto API](#panophoto-api) section.

#### html

The library automatically takes all html elements whose class are *verpix-panophoto* and run panophoto on them.

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
    // Some errors occur while creating, print it
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

## <a name="panophoto-api"></a>Panophoto API

You can run panophoto via html and javascript.

### Via html

To run panophoto via html, you just need html elements whose class are *verpix-panophoto*. To parameterize, you should set the parameter value to html attribute `data-*`, such as `data-width="500"`. [Parameters](#panophoto-params) section shows all available parameters.

### Via javascript

To run panophoto via javascript, call `verpix.createPanophoto`.

#### verpix.createPanophoto(source, params, callback(err, instance))

- **_source_**: One of following types
  - *type 0*: a *DOM element* that you want to show panophoto
  - *type 1*: a *string* that is a media ID you have posted in [Verpix](https://www.verpix.me)
  - *type 2*: an *array of string* that is each string is an URL of image
- **_params_**: An *object* that fills parameters, only used for *type 1* and *type 2*. *Type 0* is parameterized by setting attribute of `data-*`. [Parameters](#panophoto-params) section shows all available parameters.
- **_callback(err, instance)_**: An *function* that will be executed after creating.
  - *err*: An *Error object* if some errors occur while creating, and *null* if no error.
  - *instance*: An *object* that contains the panophoto DOM element and methods to manipulate it. The return value of *instance* depends on the value of *err*.

#### instance when error is null

You will get an DOM element that can display panophoto and methods to manipulate it.

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
			<td>getCurrentSnapshot({ quality: number, ratio: number })</td>
      <td>string</td>
			<td>Snapshot of current view. The snapshot is a base64 string encoded in JPEG format. The quality option should be in range from 0 to 1, and its default value is 1. The ratio option specifies the aspect ratio of snapshot. If ratio is no specified, the whole current view will be captured.</td>
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
			<td>setAutoplay(boolean)</td>
      <td></td>
			<td>Enable autoplay or not.</td>
		</tr>
  <tbody>
  </tbody>
</table>

#### instance when error is not null

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

### <a name="panophoto-params">Parameters

Parameters can be passed via data attributes for html and *type 0*, and via *params* for *type 1* and *type 2*. For data attributes, append the parameter name to `data-`, as in `data-width="500"`.

Note that when specifying these parameters as data-attributes, you should convert *camelCased* names into *dash-separated lower-case* names (e.g. `initialLng` would be `data-initial-lng="35"`, and `disableCDN` would be `data-disable-cdn="true"`).

<table class="table table-bordered table-striped">
	<thead>
		<tr>
			<th style="width: 100px;">Name</th>
			<th style="width: 100px;">type</th>
			<th style="width: 50px;">default</th>
			<th>description</th>
		</tr>
	</thead>
  <tbody>
		<tr>
			<td>id</td>
			<td>string</td>
			<td>required</td>
			<td>The media id you want to specify. Only used in html and type 0.</td>
		</tr>
		<tr>
			<td>width</td>
			<td>number</td>
			<td>required</td>
			<td rowspan="2">The visible size of panophoto. The size effects the quality of panophoto to load For html, type 0 and 1. If width and height are both not larger than 300, lowest quality panophoto are loaded; otherwise, highest ones are loaded.</td>
		</tr>
    <tr>
			<td>height</td>
			<td>number</td>
			<td>required</td>
		</tr>
    <tr>
			<td>initialLng</td>
			<td>number</td>
			<td>0/auto</td>
			<td rowspan="2">The initial coordinates (longitude and latitude) of panophoto. For type 2, the default values are (0, 0). For other cases, the default values are determined by the coordinates when you posting on Verpix.</td>
		</tr>
    <tr>
			<td>initialLat</td>
			<td>number</td>
			<td>0/auto</td>
		</tr>
    <tr>
			<td>autoplay</td>
			<td>boolean</td>
			<td>true</td>
			<td>Autoplay after idle duration.</td>
		</tr>
		<tr>
			<td>idleDuration</td>
			<td>number</td>
			<td>10</td>
			<td>Determine how long the idle duration to autoplay. This parameters is taken only when autoplay is true.</td>
		</tr>
    <tr>
			<td>loopMediaIcon</td>
			<td>boolean</td>
			<td>false</td>
			<td>In autoplay mode, show an 360 icon or not. This parameters is taken only when autoplay is true.</td>
		</tr>
    <tr>
			<td>altPhotoUrl</td>
			<td>string</td>
			<td>''</td>
			<td>The URL of alternative image when error occurs while creating panophoto.</td>
		</tr>
		<tr>
			<td>tipOnTop</td>
			<td>boolean</td>
			<td>false</td>
			<td>Always show the tip on top even some other html elements are covered on it.</td>
		</tr>
		<tr>
			<td>disableCDN</td>
			<td>boolean</td>
			<td>false</td>
			<td>Load panophoto from CDN or not. The parameter is used only in html, type 0 and 1.</td>
		</tr>
		<tr>
			<td>disableGA</td>
			<td>boolean</td>
			<td>false</td>
			<td>Send a Google Analytics event or not.</td>
		</tr>
  </tbody>
</table>

## <a name="livephoto-api"></a>Livephoto API

```javascript
// TODO: API for livephoto
```

## Development and Build

### Prerequisites

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

### Development

Run in development mode that will hot re-build the library when you modify source files.

```bash
npm start
```

### Test

Run unit test.

```bash
npm test
```

You can also run test in watch mode. Test will re-run when you modify source and testing files.

```bash
npm run test:watch
```

### Build

Build the library, the output files are in `public/dist`.

```bash
npm run build
```

/* eslint-disable import/no-duplicates,no-duplicate-imports */

import constructPhotoUrls from 'api/panophoto/constructPhotoUrls';
import createAltPhoto from 'api/panophoto/createAltPhoto';
import createBrand from 'api/panophoto/createBrand';
import createContainer from 'api/panophoto/createContainer';

import * as createAltPhotoProxy from 'api/panophoto/createAltPhoto';
import * as createBrandProxy from 'api/panophoto/createBrand';
import * as createTipProxy from 'api/common/createTip';
import * as createLogoProxy from 'api/common/createLogo';

import {
  testElementStyles,
  STATIC_ROOT,
} from 'test/helpers';

function testPhotoUrls(
  photoUrls,
  expectedStoreRoot,
  expectedShardingKey,
  expectedMediaId,
  expectedSize,
  expectedTiles
) {
  // Test the type of photoUrls
  expect(photoUrls).to.be.an('array');
  // Test the length of photoUrls
  expect(photoUrls).to.have.lengthOf(expectedTiles);

  const urlPrefix =
    `${expectedStoreRoot}${expectedShardingKey}/media/${expectedMediaId}/pano/${expectedSize}`;
  photoUrls.forEach((photoUrl, idx) => {
    expect(photoUrl).to.equal(`${urlPrefix}/${idx}.jpg`);
  });

}

describe('panophoto/constructPhotoUrls()', () => {
  const mediaId = 'ad32641ed06d6000';
  const cdnUrl = 'https://cdn.com/';
  const storeUrl = 'https://store.com/';
  const quality = [{
    size: '8000x4000',
    tiles: 8,
  }, {
    size: '4000x2000',
    tiles: 2,
  }, {
    size: '2000x1000',
    tiles: 2,
  }];
  const shardingKey = 'ab56';
  const mediaObj = {
    content: {
      cdnUrl,
      storeUrl,
      shardingKey,
      quality,
    },
  };

  it('should construct photo URLs from CDN if the parameter "isCDNDisabled" is false', () => {
    const width = 500;
    const height = 500;

    // Test "isCDNDisabled" is false as default
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, width, height),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[0].size,
      quality[0].tiles
    );

    // Test "isCDNDisabled" is false
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, width, height, false),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[0].size,
      quality[0].tiles
    );
  });

  it('should construct photo URLs from store if the parameter "isCDNDisabled" is true', () => {
    const width = 500;
    const height = 500;

    // Test "isCDNDisabled" is true
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, width, height, true),
      storeUrl,
      shardingKey,
      mediaId,
      quality[0].size,
      quality[0].tiles
    );
  });

  it('should construct highest quality photo URLs if visible width or height is > 300', () => {
    // Test width = 500, height = 300
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, 500, 300),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[0].size,
      quality[0].tiles
    );

    // Test width = 300, height = 500
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, 300, 500),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[0].size,
      quality[0].tiles
    );

    // Test width = 500, height = 500
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, 500, 500),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[0].size,
      quality[0].tiles
    );
  });

  it('should construct low quality photo URLs if visible width and height is <= 300', () => {
    // Test width = 300, height = 300
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, 300, 300),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[2].size,
      quality[2].tiles
    );

    // Test width = 100, height = 300
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, 100, 300),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[2].size,
      quality[2].tiles
    );

    // Test width = 300, height = 100
    testPhotoUrls(
      constructPhotoUrls(mediaId, mediaObj, 300, 100),
      cdnUrl,
      shardingKey,
      mediaId,
      quality[2].size,
      quality[2].tiles
    );
  });
});

describe('panophoto/createAltPhoto()', () => {
  const url = 'https://imgur.com/alt.jpg';
  let altPhoto;

  beforeEach(() => { altPhoto = createAltPhoto(url); });

  it('should return an image by a given URL', () => {
    // Test altPhoto is an image
    expect(altPhoto).to.match('img');
    // Test url of altPhoto
    expect(altPhoto).to.have.attribute('src', url);
  });

  it('should have proper styles', () => {
    testElementStyles(altPhoto, {
      width: 'auto',
      height: '100%',
      position: 'absolute',
      left: '50%',
      top: '0px',
      display: 'none',
      transform: {
        withPrefix: true,
        value: 'translate(-50%, 0px)',
      },
    });
  });

  it('should have property "isShown" and methods "show" and "hide"', () => {
    const expectedShownStyle = {
      display: 'block',
    };
    const expectedHiddenStyle = {
      display: 'none',
    };

    // The altPhoto should have methods "show" and "hide", and property initialized to be false
    expect(altPhoto.isShown).to.be.false;
    expect(altPhoto.show).to.be.a('function');
    expect(altPhoto.hide).to.be.a('function');

    // Show altPhoto after calling "show" method
    altPhoto.show();
    expect(altPhoto.isShown).to.be.true;
    testElementStyles(altPhoto, expectedShownStyle);

    // Hide altPhoto after calling "hide" method
    altPhoto.hide();
    expect(altPhoto.isShown).to.be.false;
    testElementStyles(altPhoto, expectedHiddenStyle);
  });
});

describe('panophoto/createBrand()', () => {
  let brand;

  beforeEach(() => { brand = createBrand(); });

  it('should return a 360 brand image', () => {
    // Test brand is an image
    expect(brand).to.match('img');
    // Test url of brand
    expect(brand).to.have.attribute('src', `${STATIC_ROOT}/assets/brand-pano.svg`);
    // Test width of brand
    expect(brand).to.have.attribute('width', '70');
    // Test height of brand
    expect(brand).to.have.attribute('height', '70');
  });

  it('should have proper styles', () => {
    testElementStyles(brand, {
      position: 'absolute',
      left: '50%',
      bottom: '50%',
      visibility: 'hidden',
      opacity: '0',
      pointerEvents: {
        withPrefix: true,
        value: 'none',
      },
      transform: {
        withPrefix: true,
        value: 'translate(-50%, 50%)',
      },
    });
  });

  it('should have property "isShown" and methods "show" and "hide"', () => {
    const expectedShownStyle = {
      transition: {
        withPrefix: true,
        value: 'visibility 0s linear 1.5s, opacity 1.5s linear',
      },
      visibility: 'visible',
      opacity: '1',
    };
    const expectedHiddenStyle = {
      transition: {
        withPrefix: true,
        value: 'visibility 0s linear 0.5s, opacity 0.5s linear',
      },
      visibility: 'hidden',
      opacity: '0',
    };

    // The brand should have methods "show" and "hide", and property initialized to be false
    expect(brand.isShown).to.be.false;
    expect(brand.show).to.be.a('function');
    expect(brand.hide).to.be.a('function');

    // Show brand after calling "show" method
    brand.show();
    expect(brand.isShown).to.be.true;
    testElementStyles(brand, expectedShownStyle);

    // Hide brand after calling "hide" method
    brand.hide();
    expect(brand.isShown).to.be.false;
    testElementStyles(brand, expectedHiddenStyle);
  });
});

describe('panophoto/createContainer()', () => {
  const altPhotoUrl = 'https://imgur.com/alt.jpg';
  const tipParams = {
    onTop: false,
  };
  const logoParams = {
    redirectURL: 'https://www.google.com',
  };
  const fakeAltPhoto = new Image();
  const fakeBrand = new Image();
  const fakeTip = new Image();
  const fakeLogo = document.createElement('a');
  let root;
  let stubCreateAltPhoto;
  let stubCreateBrand;
  let stubCreateTip;
  let stubCreateLogo;

  beforeEach(() => {
    root = document.createElement('DIV');
    stubCreateAltPhoto =
      sinon.stub(createAltPhotoProxy, 'default').returns(fakeAltPhoto);
    stubCreateBrand =
      sinon.stub(createBrandProxy, 'default').returns(fakeBrand);
    stubCreateTip =
      sinon.stub(createTipProxy, 'default').returns(fakeTip);
    stubCreateLogo =
      sinon.stub(createLogoProxy, 'default').returns(fakeLogo);
  });

  afterEach(() => {
    stubCreateAltPhoto.restore();
    stubCreateBrand.restore();
    stubCreateTip.restore();
    stubCreateLogo.restore();
  });

  it('should return an object contains container, altPhoto, brand and tip', () => {
    const {
      container,
      altPhoto,
      brand,
      tip,
    } = createContainer(root, 100, 100, altPhotoUrl, tipParams, logoParams);

    // Test container is a div
    expect(container).to.match('div');
    // Test container has childrent: altPhoto, brand, tip and logo
    expect(container.children[0]).to.equal(fakeAltPhoto);
    expect(container.children[1]).to.equal(fakeBrand);
    expect(container.children[2]).to.equal(fakeTip);
    expect(container.children[3]).to.equal(fakeLogo);

    // Test altPhoto is an image returned by createAltPhoto
    expect(altPhoto).to.equal(fakeAltPhoto);
    // Test createAltPhoto is called correctly
    expect(stubCreateAltPhoto).to.have.been.calledWith(altPhotoUrl);

    // Test brand is an image returned by createBrand
    expect(brand).to.equal(fakeBrand);

    // Test tip is an image returned by createTip
    expect(tip).to.equal(fakeTip);
    // Test createTip is called correctly
    expect(stubCreateTip).to.have.been.calledWith(tipParams);

    // Test createLogo is called correctly
    expect(stubCreateLogo).to.have.been.calledWith(logoParams);
  });

  it('should have parent wrapper and grandparent root, with proper styles', () => {
    const { container } = createContainer(root, 355, 782, '', {}, {});

    // Test styles of container
    testElementStyles(container, {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '0px',
      left: '0px',
    });

    const expectedWrapper = container.parentElement;
    // Test wrapper (the parent of container) is a div
    expect(expectedWrapper).to.match('div');
    testElementStyles(expectedWrapper, {
      paddingBottom: '220%',
      position: 'relative',
      overflow: 'hidden',
    });

    const expectedRoot = expectedWrapper.parentElement;
    // Test root (the grandparent of container) is the given root
    expect(expectedRoot).to.equal(root);
    // Test styles of root
    testElementStyles(expectedRoot, {
      width: '355px',
      maxWidth: '100%',
      cursor: 'pointer',
    });
  });
});

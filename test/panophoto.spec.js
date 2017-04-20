/* eslint-disable max-len */

import range from 'lodash/range';
import isDom from 'is-dom';
import changeCase from 'change-case';
import Promise from 'bluebird';
import THREE from 'three';

import create from 'api/panophoto/create';
import config from 'config';

import {
  execute,
  setResponse,
  mockMobile,
  createEvent,
  swipeOnElement,
  testElementStyles,
  testError,
  inMobile,
  CLICK_MOBILE,
  FETCH_ROOT,
  STATIC_ROOT,
} from 'test/helpers';
import panos from 'test/__fixtures__/panos';

// Helper functions for panophoto
const getRootEl = (instance) => instance.root;

const getWrapperEl = (instance) => instance.root.children[0];

const getContainerEl = (instance) => instance.root.children[0].children[0];

const getAltPhotoEl = (instance) => instance.root.children[0].children[0].children[0];

const getBrandEl = (instance) => instance.root.children[0].children[0].children[1];

const getTipEl = (instance) => instance.root.children[0].children[0].children[2];

const getLogoEl = (instance) => instance.root.children[0].children[0].children[3];

const getCanvasEl = (instance) => instance.root.children[0].children[0].children[4];

const setCreateParam = (inputs, paramName, paramValue) => {
  inputs.forEach((input) => {
    if (isDom(input.source)) {
      // eslint-disable-next-line no-param-reassign
      input.source.setAttribute(`data-${changeCase.paramCase(paramName)}`, paramValue);
    } else {
      // eslint-disable-next-line no-param-reassign
      input.params[paramName] = paramValue;
    }
  });
};

const testCreate = (inputs, testFn, onEnd) => {
  // The counter that counts # of passed tests
  let count = 0;

  return new Promise((resolve, reject) => {
    inputs.forEach((input) => {
      create(input.source, input.params, (err, instance) => {
        try {
          testFn(err, instance, () => {
            // Increase the counter
            count++;

            // If all tests pass, resolve it
            if (count === inputs.length) {
              execute(onEnd);
              resolve();
            }
          });
        } catch (e) {
          execute(onEnd);
          reject(e);
        }
      });
    });
  });
};

const testCreateOnDesktop = (inputs, testFn, onEnd) => (
  !inMobile() ? testCreate(inputs, testFn, onEnd) : Promise.resolve()
);

const testCreateOnMobile = (inputs, testFn, onEnd) => {
  if (process.env.SLIMER) {
    // Mockup mobile device
    const mockMobileDevice = mockMobile();
    return testCreate(inputs, testFn, () => {
      mockMobileDevice.restore();
      execute(onEnd);
    });
  } else if (inMobile()) {
    return testCreate(inputs, testFn, onEnd);
  }

  return Promise.resolve();
};

const testAltPhoto = (altPhoto, expectedSrc, expectedDisplay = 'none') => {
  // Test altPhoto is an image
  expect(altPhoto).to.match('IMG');
  // Test the source of altPhoto equals to the expected source
  expect(altPhoto).to.have.attribute('src', expectedSrc);
  // Test altPhoto styles
  testElementStyles(altPhoto, {
    width: 'auto',
    height: '100%',
    position: 'absolute',
    left: '50%',
    top: '0px',
    display: expectedDisplay,
    transform: {
      withPrefix: true,
      value: 'translate(-50%, 0px)',
    },
  });
};

const testTipShape = (tip, expectedSrc, expectedWidth, expectedHeight) => {
  expect(tip).to.have.attribute('src', expectedSrc);
  expect(tip).to.have.attribute('width', expectedWidth);
  expect(tip).to.have.attribute('height', expectedHeight);
};

const testTipShownStyles = (tip) => {
  testElementStyles(tip, {
    opacity: '1',
    transition: {
      withPrefix: true,
      value: 'opacity 2.5s linear 3s',
    },
  });
};

const testTipHiddenStyles = (tip) => {
  testElementStyles(tip, {
    opacity: '0',
    transition: {
      withPrefix: true,
      value: 'opacity 0.5s linear 0s',
    },
  });
};

const testLogoLink = (logo, expectedLink) => {
  expect(logo).to.have.attribute('href', expectedLink);
  expect(logo).to.have.attribute('target', '_href');
};

const testLogoImage = (logo, expectedSrc, expectedWidth, expectedHeight) => {
  const img = logo.children[0];

  expect(img).to.have.attribute('src', expectedSrc);
  expect(img).to.have.attribute('width', expectedWidth);
  expect(img).to.have.attribute('height', expectedHeight);
};

const testPhotoUrls = (
  stubMethod,
  expectedStoreRoot,
  expectedShardingKey,
  expectedMediaId,
  expectedSize,
  expectedTiles
) => {
  const urlPrefix =
    `${expectedStoreRoot}${expectedShardingKey}/media/${expectedMediaId}/pano/${expectedSize}`;
  range(expectedTiles).forEach((idx) => {
    stubMethod.should.have.been.calledWith(`${urlPrefix}/${idx}.jpg`);
  });
};

describe('panophoto/create()', () => {
  // The existed media ID and its response
  const mediaId = 'ad32641ed06d6000';
  const apiKey = '1d847021d22398516d480e2ecf543020';
  const gaId = 'UA-GAtracking-2';
  const type = 'panoPhoto';
  const lng = 37;
  const lat = 42;
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

  // The non-existed media ID and its response
  const nonExistedMediaId = 'ad44641ed06d65566';
  const nonExistedErrMsg = 'media not found';
  // The non-matched API key and its response
  const nonMatchedApiKey = '1d847021d22398516d480e2ecf543010';
  const nonMatchedErrMsg = 'License not passed';

  // Inputs of customized parameters;
  const width = 300;
  const height = 500;
  const customPhotos = range(4).map((idx) => `https://imgur.com/img${idx}.jpg`);
  const altPhoto = 'https://imgur.com/alt.jpg';
  const redirectURL = 'https://www.google.com';
  const customLogo = 'https://imgur.com/awesome.jpg';
  const idleDuration = 0.5;

  // The fake objects, stubbed and spied methods
  let server;
  let stubLoadImage;

  // The source of type 0
  let domEl;

  // The inputs of create()
  let inputs;

  beforeEach(() => {
    // Create the fake server
    server = sinon.fakeServer.create({
      autoRespond: true,
    });
    // Set response of fake server
    quality.forEach((qual) => {
      const result = {
        type,
        owner: {
          gaId,
        },
        dimension: {
          lng,
          lat,
        },
        content: {
          cdnUrl,
          storeUrl,
          shardingKey,
          tiles: qual.tiles,
        },
      };

      // Set response of existed media ID
      setResponse(server, `${FETCH_ROOT}/media/${mediaId}/${qual.size}`, 'GET', (xhr) => {
        // Authentication message format: 'VERPIX $apiKey:$signature'
        const authMessage = xhr.requestHeaders.authorization;

        if (authMessage.startsWith('VERPIX ')) {
          const key = authMessage.slice(7).split(':')[0];

          if (key === apiKey) {
            // Return media only when authentication passed
            // TODO: We should check more for other fields, such as signature
            return {
              body: JSON.stringify({ result }),
            };
          }
        }

        // Return error message for failed authentication
        return {
          status: 401,
          body: JSON.stringify({
            error: {
              message: nonMatchedErrMsg,
            },
          }),
        };
      });

      // Set response of non-existed media ID
      setResponse(server, `${FETCH_ROOT}/media/${nonExistedMediaId}/${qual.size}`, 'GET', {
        status: 404,
        body: JSON.stringify({
          error: {
            message: nonExistedErrMsg,
          },
        }),
      });
    });

    // Stub the image loading method, replacing it by loading base64 image we provided
    stubLoadImage = sinon.stub(THREE.ImageLoader.prototype, 'load').callsFake((url, onLoad) => {
      const img = new Image();

      img.onload = () => {
        execute(onLoad, img);
      };
      img.src = panos.img;

      return img;
    });

    // Reset the inputs
    inputs = [];

    // Input of type 0 is a DOM element
    domEl = document.createElement('DIV');
    inputs.push({
      source: domEl,
      params: {},
    });
    inputs[0].source.setAttribute('data-id', mediaId);
    inputs[0].source.setAttribute('data-width', width);
    inputs[0].source.setAttribute('data-height', height);

    // Input of type 1 is a media ID (string)
    inputs.push({
      source: mediaId,
      params: {
        width,
        height,
      },
    });

    // Input of type 2 is a list of URLs (array of string)
    inputs.push({
      source: customPhotos,
      params: {
        width,
        height,
      },
    });

    // Set API key
    setCreateParam(inputs, 'apiKey', apiKey);

    // Disable GA
    // TODO: Test GA events in the future
    setCreateParam(inputs, 'disableGA', true);
  });

  afterEach(() => {
    // Restore the fake objects
    server.restore();
    stubLoadImage.restore();
  });

  const commonErrorTests = () => {
    describe('instance.root', () => {
      it('should equal to the given dom element for type 0', () =>
        testCreate(inputs.slice(0, 1), (err, instance, done) => {
          expect(getRootEl(instance)).to.equal(domEl);
          done();
        })
      );

      it('should be a DIV dom element for type 1', () =>
        testCreate(inputs.slice(1, 2), (err, instance, done) => {
          expect(getRootEl(instance)).to.match('DIV');
          done();
        })
      );
    });

    describe('instance.showAltPhoto()', () => {
      it('should show an alternative photo', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.showAltPhoto();
          testAltPhoto(getAltPhotoEl(instance), '', 'block');
          done();
        })
      );

      describe('when parameter "altPhoto" is string', () => {
        beforeEach(() => {
          setCreateParam(inputs.slice(0, 2), 'altPhoto', altPhoto);
        });

        it('should show an alternative photo that source equals to given URL', () =>
          testCreate(inputs.slice(0, 2), (err, instance, done) => {
            instance.showAltPhoto();
            testAltPhoto(getAltPhotoEl(instance), altPhoto, 'block');
            done();
          })
        );
      });
    });

    describe('instance.hideAltPhoto()', () => {
      it('should hide the alternative photo', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.hideAltPhoto();
          testAltPhoto(getAltPhotoEl(instance), '', 'none');
          done();
        })
      );
    });
  };

  describe('when input is type 0 or 1 but given media ID does not exist', () => {
    beforeEach(() => {
      // Only type 0 & 1 should be tested
      inputs[0].source.setAttribute('data-id', nonExistedMediaId);
      inputs[1].source = nonExistedMediaId;
    });

    describe('err', () => {
      it(`should get error message "${nonExistedErrMsg}"`, () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          testError(err, nonExistedErrMsg);
          done();
        })
      );
    });

    commonErrorTests();
  });

  describe('when input is type 0 or 1 but the API key does not belong to the owner of requested media', () => {
    beforeEach(() => {
      // Only type 0 & 1 should be tested
      setCreateParam(inputs.slice(0, 2), 'apiKey', nonMatchedApiKey);
    });

    describe('err', () => {
      it(`should get error message "${nonMatchedErrMsg}"`, () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          testError(err, nonMatchedErrMsg);
          done();
        })
      );
    });

    commonErrorTests();
  });

  describe('err', () => {
    it('should be null', () =>
      testCreate(inputs, (err, instance, done) => {
        expect(err).to.be.null;
        done();
      })
    );
  });

  describe('instance.root', () => {
    it('should equal to the given dom element for type 0', () =>
      testCreate(inputs.slice(0, 1), (err, instance, done) => {
        expect(getRootEl(instance)).to.equal(domEl);
        done();
      })
    );

    it('should be a DIV dom element for type 1 and 2', () =>
      testCreate(inputs.slice(1, 3), (err, instance, done) => {
        expect(getRootEl(instance)).to.match('DIV');
        done();
      })
    );

    it('should have proper styles', () =>
      testCreate(inputs, (err, instance, done) => {
        testElementStyles(getRootEl(instance), {
          width: `${width}px`,
          maxWidth: '100%',
          cursor: 'pointer',
        });
        done();
      })
    );

    it('should prevent from "touchmove" event on mobile device', () =>
      testCreateOnMobile(inputs, (err, instance, done) => {
        // Create an touchmove event
        const event = createEvent('touch', CLICK_MOBILE.MOVE);

        // Spy "preventDefault" method of the event
        sinon.stub(event, 'preventDefault');
        // Dispatch the event to the root
        getRootEl(instance).dispatchEvent(event);
        // Test "preventDefault" is called correctly
        event.preventDefault.should.have.been.calledOnce;

        // Restore the stubbed method
        event.preventDefault.restore();

        done();
      })
    );

    it('should contain a DIV child "wrapper" with proper styles', () =>
      testCreate(inputs, (err, instance, done) => {
        // Test wrapper is a DIV element
        expect(getWrapperEl(instance)).to.match('DIV');
        // Test wrapper styles
        testElementStyles(getWrapperEl(instance), {
          paddingBottom: '167%', // Math.round((height / width) * 100)
          position: 'relative',
          overflow: 'hidden',
        });
        done();
      })
    );

    it('should contain a DIV grandchild "container" with proper styles', () =>
      testCreate(inputs, (err, instance, done) => {
        // Test container is a DIV element
        expect(getContainerEl(instance)).to.match('div');
        // Test container styles
        testElementStyles(getContainerEl(instance), {
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '0px',
          left: '0px',
        });
        done();
      })
    );

    it('should contain an image grandchild "brand" with proper styles', () =>
      testCreate(inputs, (err, instance, done) => {
        // Test brand is an image
        expect(getBrandEl(instance)).to.match('IMG');
        // Test brand styles
        testElementStyles(getBrandEl(instance), {
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
        done();
      })
    );

    it('should contain an image grandchild "tip" with proper styles', () =>
      testCreate(inputs, (err, instance, done) => {
        // Test tip is an image
        expect(getTipEl(instance)).to.match('IMG');
        // Test tip styles
        testElementStyles(getTipEl(instance), {
          opacity: '0',
          position: 'absolute',
          left: '50%',
          bottom: '12px',
          pointerEvents: {
            withPrefix: true,
            value: 'none',
          },
          transform: {
            withPrefix: true,
            value: 'translateX(-50%)',
          },
          zIndex: '',
        });
        done();
      })
    );

    it('should contain an image grandchild "tip" that shows mouse on desktop', () =>
      testCreateOnDesktop(inputs, (err, instance, done) => {
        testTipShape(getTipEl(instance), `${STATIC_ROOT}/assets/tip-mouse.svg`, '45', '45');
        done();
      })
    );

    it('should contain an image grandchild "tip" that shows tilt on mobile', () =>
      testCreateOnMobile(inputs, (err, instance, done) => {
        testTipShape(getTipEl(instance), `${STATIC_ROOT}/assets/tip-tilt.svg`, '80', '60');
        done();
      })
    );

    describe('when paramter "tipOnTop" is true', () => {
      beforeEach(() => { setCreateParam(inputs, 'tipOnTop', true); });

      it('should contain an image grandchild "tip" that has very hight z-index', () =>
        testCreate(inputs, (err, instance, done) => {
          testElementStyles(getTipEl(instance), {
            zIndex: '99999999',
          });
          done();
        })
      );
    });

    it('should contain an linked image grandchild "logo" with proper styles', () =>
      testCreate(inputs, (err, instance, done) => {
        const logo = getLogoEl(instance);

        // Test logo is a anchor
        expect(logo).to.match('A');
        // Test logo has exactly one child node
        expect(logo).to.have.length(1);
        // Test the child of logo is an image
        expect(logo.children[0]).to.match('IMG');
        // Test logo styles
        testElementStyles(getLogoEl(instance), {
          position: 'absolute',
          right: '10px',
          bottom: '12px',
        });
        done();
      })
    );

    it('should contain an linked image grandchild "logo" redirects to default URL', () =>
      testCreate(inputs, (err, instance, done) => {
        testLogoLink(getLogoEl(instance), config.redirectURL);
        done();
      })
    );

    // XXX:
    // Currently code for parameter "redirectURL" is not implemented completely.
    // Please complete the code and delete "skip" in the future.
    describe.skip('when parameter "redirectURL" is string', () => {
      beforeEach(() => { setCreateParam(inputs, 'redirectURL', redirectURL); });

      it('should contain an linked image grandchild "logo" redirects to given URL', () =>
        testCreate(inputs, (err, instance, done) => {
          testLogoLink(getLogoEl(instance), redirectURL);
          done();
        })
      );
    });

    it('should contain an linked image grandchild "logo" with default logo', () =>
      testCreate(inputs, (err, instance, done) => {
        testLogoImage(getLogoEl(instance), `${STATIC_ROOT}/assets/logo.svg`, '90', '13');
        done();
      })
    );

    // XXX:
    // Currently code for parameter "logo" is not implemented completely.
    // Please complete the code and delete "skip" in the future.
    describe.skip('when parameter "logo" is string', () => {
      beforeEach(() => { setCreateParam(inputs, 'logo', customLogo); });

      it('should contain an linked image grandchild "logo" with proper styles', () =>
        testCreate(inputs, (err, instance, done) => {
          testElementStyles(getLogoEl(instance), {
            position: 'absolute',
            right: '5px',
            bottom: '3px',
          });
          done();
        })
      );

      it('should contain an linked image grandchild "logo" with given logo', () =>
        testCreate(inputs, (err, instance, done) => {
          testLogoImage(getLogoEl(instance), customLogo, '30', '30');
          done();
        })
      );
    });

    it.skip('should remove grandchild "container" after removing "logo"', () => {
      // TODO: Remove logo and check container is removed
    });

    it.skip('should remove grandchild "container" after modifying "logo"', () => {
      // TODO: Modify logo and check container is removed
    });
  });

  describe('instance.start()', () => {
    // XXX:
    // Unkown bug: when calling testAltPhoto with last argument 'block',
    // it will make some other tests fail.
    // Please fix it in the future and delete "skip".
    describe.skip('when error occurs while loading photos', () => {
      beforeEach(() => {
        stubLoadImage.callsFake((url, onLoad, onProgress, onError) => {
          // Call directly onError to make failture
          onError();
        });
      });

      it('should show an alternative photo', () =>
        testCreate(inputs, (err, instance, done) => {
          instance.start(() => {
            testAltPhoto(getAltPhotoEl(instance), '', 'block');
            done();
          });
        })
      );

      describe('when parameter "altPhoto" is string', () => {
        beforeEach(() => { setCreateParam(inputs, 'altPhoto', altPhoto); });

        it('should show an alternative photo that source equals to given URL', () =>
          testCreate(inputs, (err, instance, done) => {
            instance.start(() => {
              // testAltPhoto(getAltPhotoEl(instance), altPhoto, 'block');
              done();
            });
          })
        );
      });
    });

    it('should load photos from given URLs for type 3', () =>
      testCreate(inputs.slice(2, 3), (err, instance, done) => {
        instance.start(() => {
          customPhotos.forEach((photoUrl) => {
            stubLoadImage.should.have.been.calledWith(photoUrl);
          });
          done();
        });
      })
    );

    describe('when parameters "width" is > 300 and "height" is <= 300', () => {
      beforeEach(() => {
        setCreateParam(inputs.slice(0, 2), 'width', 500);
        setCreateParam(inputs.slice(0, 2), 'height', 200);
      });

      it('should load "8000x4000" quality photos for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            testPhotoUrls(
              stubLoadImage,
              cdnUrl,
              shardingKey,
              mediaId,
              quality[0].size,
              quality[0].tiles
            );
            done();
          });
        })
      );
    });

    describe('when parameters "width" is <= 300 and "height" is > 300', () => {
      beforeEach(() => {
        setCreateParam(inputs.slice(0, 2), 'width', 200);
        setCreateParam(inputs.slice(0, 2), 'height', 500);
      });

      it('should load "8000x4000" quality photos for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            testPhotoUrls(
              stubLoadImage,
              cdnUrl,
              shardingKey,
              mediaId,
              quality[0].size,
              quality[0].tiles
            );
            done();
          });
        })
      );
    });

    describe('when parameters "width" and "height" are both > 300', () => {
      beforeEach(() => {
        setCreateParam(inputs.slice(0, 2), 'width', 500);
        setCreateParam(inputs.slice(0, 2), 'height', 500);
      });

      it('should load "8000x4000" quality photos for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            testPhotoUrls(
              stubLoadImage,
              cdnUrl,
              shardingKey,
              mediaId,
              quality[0].size,
              quality[0].tiles
            );
            done();
          });
        })
      );
    });

    describe('when parameters "width" and "height" are both <= 300', () => {
      beforeEach(() => {
        setCreateParam(inputs.slice(0, 2), 'width', 200);
        setCreateParam(inputs.slice(0, 2), 'height', 200);
      });

      it('should load "2000x1000" quality photos for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            testPhotoUrls(
              stubLoadImage,
              cdnUrl,
              shardingKey,
              mediaId,
              quality[2].size,
              quality[2].tiles
            );
            done();
          });
        })
      );
    });

    it('should load photos from CDN for type 0 and 1', () =>
      testCreate(inputs.slice(0, 2), (err, instance, done) => {
        instance.start(() => {
          testPhotoUrls(
            stubLoadImage,
            cdnUrl,
            shardingKey,
            mediaId,
            quality[0].size,
            quality[0].tiles
          );
          done();
        });
      })
    );

    describe('when parameter "disableCDN" is true', () => {
      beforeEach(() => { setCreateParam(inputs, 'disableCDN', true); });

      it('should load image from original store for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            testPhotoUrls(
              stubLoadImage,
              storeUrl,
              shardingKey,
              mediaId,
              quality[0].size,
              quality[0].tiles
            );
            done();
          });
        })
      );
    });

    it('should contain a WebGL CANVAS grandchild', () =>
      testCreate(inputs, (err, instance, done) => {
        instance.start(() => {
          // XXX: Is it possible to test it is also a "WebGL" CANVAS
          expect(getCanvasEl(instance)).to.match('CANVAS');
          done();
        });
      })
    );

    it.skip('should show tip after idle 10 seconds', () => {
      // TODO: Test tip styles after idle 10 seconds
    });

    it.skip('should hide tip after using mouse to swipe it', () => {
      // TODO: Test tip styles after idle 10 seconds and swipe it
    });

    describe('when parameter "autoplay" is false', () => {
      beforeEach(() => { setCreateParam(inputs, 'autoplay', false); });

      it.skip('should not show tip after idle 10 seconds', () => {
        // TODO: Test for tip styles after idle 10 seconds when autoplay = false
      });
    });

    describe('when parameter "idleDuration" is > 0', () => {
      beforeEach(() => { setCreateParam(inputs, 'idleDuration', idleDuration); });

      it('should show tip after idle for given duration (in seconds)', () =>
        testCreate(inputs, (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              testTipShownStyles(getTipEl(instance));
              done();
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );

      it('should hide tip after using mouse to swipe it on desktop', () =>
        testCreateOnDesktop(inputs, (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              const swipeParams = {
                fromX: 10,
                fromY: 10,
                toX: 30,
                toY: 40,
              };
              swipeOnElement(getContainerEl(instance), swipeParams, () => {
                testTipHiddenStyles(getTipEl(instance));
                done();
              });
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );

      it('should hide tip after using touch to swipe it on mobile', () =>
        testCreateOnMobile(inputs, (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              const swipeParams = {
                fromX: 10,
                fromY: 10,
                toX: 30,
                toY: 40,
              };
              swipeOnElement(getContainerEl(instance), swipeParams, () => {
                testTipHiddenStyles(getTipEl(instance));
                done();
              });
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );
    });

    describe('when parameters "idleDuration" is > 0 and "autoplay is false"', () => {
      beforeEach(() => {
        setCreateParam(inputs, 'idleDuration', idleDuration);
        setCreateParam(inputs, 'autoplay', false);
      });

      it('should not show tip after idle for given duration (in seconds)', () =>
        testCreate(inputs, (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              testElementStyles(getTipEl(instance), {
                opacity: '0',
              });
              done();
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );
    });

    // TODO:
    // More tests needed to add, include:
    // - showStartedBrand
    // - THREE.js related states (scene, camera, renderer...)
    // - wheel events
  });

  describe.skip('instance.stop()', () => {
    // TODO: Tests of stop()
  });

  describe('instance.getCurrentCoordinates()', () => {
    it('should get null before starting', () =>
      testCreate(inputs, (err, instance, done) => {
        expect(instance.getCurrentCoordinates()).to.be.null;
        done();
      })
    );

    it('should get default (longitude, latitude) after just starting for type 0 and 1', () =>
      testCreate(inputs.slice(0, 2), (err, instance, done) => {
        instance.start(() => {
          expect(instance.getCurrentCoordinates()).to.deep.equal({
            lng,
            lat,
          });
          done();
        });
      })
    );

    it('should get (0, 0) after just starting for type 2', () =>
      testCreate(inputs.slice(2, 3), (err, instance, done) => {
        instance.start(() => {
          expect(instance.getCurrentCoordinates()).to.deep.equal({
            lng: 0,
            lat: 0,
          });
          done();
        });
      })
    );

    describe('when parameter "initialLng" is in range [0, 360)', () => {
      const initialLng = 70;

      beforeEach(() => { setCreateParam(inputs, 'initialLng', initialLng); });

      it('should get ((initialLng + 360) % 360, default latitude) after just starting for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: initialLng,
              lat,
            });
            done();
          });
        })
      );

      it('should get (initialLng, 0) after just starting for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: initialLng,
              lat: 0,
            });
            done();
          });
        })
      );
    });

    describe('when parameter "initialLng" is < 0', () => {
      beforeEach(() => { setCreateParam(inputs, 'initialLng', -100); });

      it('should get ((initialLng + 360) % 360, default latitude) after just starting for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            // (initialLng + 360) % 360
            // TODO: Should check the formula is right or not
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: 260,
              lat,
            });
            done();
          });
        })
      );

      it('should get ((initialLng + 360) % 360, 0) after just starting for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            // (initialLng + 360) % 360
            // TODO: Should check the formula is right or not
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: 260,
              lat: 0,
            });
            done();
          });
        })
      );
    });

    describe('when parameter "initialLng" is >= 360', () => {
      beforeEach(() => { setCreateParam(inputs, 'initialLng', 500); });

      it('should get ((initialLng + 360) % 360, default latitude) after just starting for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            // (initialLng + 360) % 360
            // TODO: Should check the formula is right or not
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: 140,
              lat,
            });
            done();
          });
        })
      );

      it('should get ((initialLng + 360) % 360, 0) after just starting for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            // (initialLng + 360) % 360
            // TODO: Should check the formula is right or not
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: 140,
              lat: 0,
            });
            done();
          });
        })
      );
    });

    describe('when parameter "initialLat" is in range [-85, 85]', () => {
      const initialLat = 56;
      beforeEach(() => { setCreateParam(inputs, 'initialLat', initialLat); });

      it('should get (default longitude, initialLat) after just starting for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng,
              lat: initialLat,
            });
            done();
          });
        })
      );

      it('should get (0, initialLat) after just starting for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: 0,
              lat: initialLat,
            });
            done();
          });
        })
      );
    });

    describe('when parameter "initialLat" is < -85', () => {
      beforeEach(() => { setCreateParam(inputs, 'initialLat', -100); });

      it('should get (default longitude, -85) after just starting for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng,
              lat: -85,
            });
            done();
          });
        })
      );

      it('should get (0, -85) after just starting for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: 0,
              lat: -85,
            });
            done();
          });
        })
      );
    });

    describe('when parameter "initialLat" is > 85', () => {
      beforeEach(() => { setCreateParam(inputs, 'initialLat', 100); });

      it('should get (default longitude, 85) after just starting for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng,
              lat: 85,
            });
            done();
          });
        })
      );

      it('should get (0, 85) after just starting for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            expect(instance.getCurrentCoordinates()).to.deep.equal({
              lng: 0,
              lat: 85,
            });
            done();
          });
        })
      );
    });

    it('should get different (longitude, latitude) after using mouse to swipe it on desktop for type 0 and 1', () =>
      testCreateOnDesktop(inputs.slice(0, 2), (err, instance, done) => {
        instance.start(() => {
          // Swipe from left-up to bottom-right
          const swipeParams = {
            fromX: 10,
            fromY: 10,
            toX: 30,
            toY: 40,
          };
          swipeOnElement(getContainerEl(instance), swipeParams, () => {
            const coordinates = instance.getCurrentCoordinates();

            // Test longitude is decreased
            expect(coordinates.lng).to.be.below(lng);
            // Test latitude is increased
            expect(coordinates.lat).to.be.above(lat);
            done();
          });
        });
      })
    );

    it('should get different (longitude, latitude) after using mouse to swipe it on desktop for type 2', () =>
      testCreateOnDesktop(inputs.slice(2, 3), (err, instance, done) => {
        instance.start(() => {
          // Swipe from right-up to left-bottom
          const swipeParams = {
            fromX: 30,
            fromY: 10,
            toX: 10,
            toY: 40,
          };
          swipeOnElement(getContainerEl(instance), swipeParams, () => {
            const coordinates = instance.getCurrentCoordinates();

            // Test longitude is increased
            expect(coordinates.lng).to.be.within(0, 10);
            // Test latitude is increased
            expect(coordinates.lat).to.be.within(0, 10);
            done();
          });
        });
      })
    );

    it('should get different (longitude, latitude) after using touch to swipe it on desktop for type 0 and 1', () =>
      testCreateOnMobile(inputs.slice(0, 2), (err, instance, done) => {
        instance.start(() => {
          // Swipe from left-up to bottom-right
          const swipeParams = {
            fromX: 10,
            fromY: 10,
            toX: 30,
            toY: 40,
          };
          swipeOnElement(getContainerEl(instance), swipeParams, () => {
            const coordinates = instance.getCurrentCoordinates();

            // Test longitude is decreased
            expect(coordinates.lng).to.be.below(lng);
            // Test latitude is increased
            expect(coordinates.lat).to.be.above(lat);
            done();
          });
        });
      })
    );

    it('should get different (longitude, latitude) after using touch to swipe it on desktop for type 2', () =>
      testCreateOnMobile(inputs.slice(2, 3), (err, instance, done) => {
        instance.start(() => {
          // Swipe from right-up to left-bottom
          const swipeParams = {
            fromX: 30,
            fromY: 10,
            toX: 10,
            toY: 40,
          };
          swipeOnElement(getContainerEl(instance), swipeParams, () => {
            const coordinates = instance.getCurrentCoordinates();

            // Test longitude is increased
            expect(coordinates.lng).to.be.within(0, 10);
            // Test latitude is increased
            expect(coordinates.lat).to.be.within(0, 10);
            done();
          });
        });
      })
    );

    it.skip('should get different (longitude, latitude) after rotating on mobile', () => {
      // TODO: Test for mobile rotation
    });

    it.skip('should get different (longitude, latitude) after idle 10 seconds', () => {
      // TODO: Test for idle 10 seconds
    });

    describe('when parameter "autoplay" is false', () => {
      beforeEach(() => { setCreateParam(inputs, 'autoplay', false); });

      it.skip('should get default (longitude, latitude) after idle 10 seconds', () => {
        // TODO: Test for autoplay after idle 10 seconds when autoplay = false
      });
    });

    describe('when parameter "idleDuration" is > 0', () => {
      beforeEach(() => { setCreateParam(inputs, 'idleDuration', idleDuration); });

      it('should get (larger longitude, default latitude) after idle for given duration (in seconds) for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              const coordinates = instance.getCurrentCoordinates();

              // Test longitude is increased
              expect(coordinates.lng).to.be.above(lng);
              // Test latitude is the same
              expect(coordinates.lat).to.be.equal(lat);
              done();
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );

      it('should get (larger longitude, 0) after idle for given duration (in seconds) for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              const coordinates = instance.getCurrentCoordinates();

              // Test longitude is increased
              expect(coordinates.lng).to.be.within(0, 10);
              // Test latitude is the same
              expect(coordinates.lat).to.be.equal(0);
              done();
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );
    });

    describe('when parameters "idleDuration" is > 0 and "autoplay is false"', () => {
      beforeEach(() => {
        setCreateParam(inputs, 'idleDuration', idleDuration);
        setCreateParam(inputs, 'autoplay', false);
      });

      it('should get default (longitude, latitude) after idle for given duration (in seconds) for type 0 and 1', () =>
        testCreate(inputs.slice(0, 2), (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              const coordinates = instance.getCurrentCoordinates();

              // Test longitude is the same
              expect(coordinates.lng).to.be.equal(lng);
              // Test latitude is the same
              expect(coordinates.lat).to.be.equal(lat);
              done();
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );

      it('should get (0, 0) after idle for given duration (in seconds) for type 2', () =>
        testCreate(inputs.slice(2, 3), (err, instance, done) => {
          instance.start(() => {
            setTimeout(() => {
              const coordinates = instance.getCurrentCoordinates();

              // Test longitude is the same
              expect(coordinates.lng).to.be.equal(0);
              // Test latitude is the same
              expect(coordinates.lat).to.be.equal(0);
              done();
            }, (idleDuration + 0.1) * 1000);
          });
        })
      );
    });
  });

  describe.skip('instance.getCurrentSnapshot()', () => {
    // TODO: Tests of getCurrentSnapshot()
  });

  describe.skip('instance.setPhotos()', () => {
    // TODO: Tests of setPhotos()
  });

  describe('instance.setVisibleSize()', () => {
    it('should set visible size by giving width and height', () =>
      testCreate(inputs, (err, instance, done) => {
        instance.start(() => {
          instance.setVisibleSize(643, 401);

          // Test width of root
          testElementStyles(getRootEl(instance), {
            width: '643px',
          });
          // Test paddingBottom of wrapper
          testElementStyles(getWrapperEl(instance), {
            paddingBottom: '62%', // Math.round((height / width) * 100)
          });
          done();
        });
      })
    );
  });

  describe.skip('instance.setAutoplay()', () => {
    // TODO: Tests of setAutoplay()
  });
});

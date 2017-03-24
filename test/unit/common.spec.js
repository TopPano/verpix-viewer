import getMedia from 'api/common/getMedia';
import createTip from 'api/common/createTip';
import createLogo from 'api/common/createLogo';
import config from 'config';

import {
  inMobile,
  mockMobile,
  testError,
  testElementStyles,
} from 'test/helpers';

const FETCH_ROOT = config.fetchRoot;
const STATIC_ROOT = config.staticRoot;

function setResponse(server, {
  method = 'GET',
  url,
  status = 200,
  header = { 'Content-Type': 'application/json' },
  body = JSON.stringify({}),
}) {
  server.respondWith(method, url, [
    status,
    header,
    body,
  ]);
}

describe('getMedia()', () => {
  let server;

  beforeEach(() => {
    server = sinon.fakeServer.create({
      autoRespond: true,
    });
  });

  afterEach(() => { server.restore(); });

  it('should reject with error if input id is not a string', () => (
    getMedia(100).catch((err) => {
      testError(err, 'Media ID should be an non-empty string');
    })
  ));

  it('should reject with error if input id is not a non-empty string', () => (
    getMedia('').catch((err) => {
      testError(err, 'Media ID should be an non-empty string');
    })
  ));

  it('should get media information from API server by feeding its id', () => {
    const mediaId = 'ad32641ed06d6000';
    const result = {
      sid: mediaId,
      caption: 'this is caption',
      created: '2017-02-22T07:45:28.992Z',
      onwerId: '7a2a1470-a26a-11e6-8262-1d55016639f5',
    };

    setResponse(server, {
      url: `${FETCH_ROOT}/media/${mediaId}`,
      body: JSON.stringify({ result }),
    });

    return getMedia(mediaId).then((res) => {
      expect(server.requests.length).to.equal(1);
      expect(res).to.deep.equal(result);
    });
  });

  it('should reject with error if input id does not exist', () => {
    const wrongMediaId = 'ad32641ed06d6000';
    const errMsg = 'message not found';

    setResponse(server, {
      status: 404,
      url: `${FETCH_ROOT}/media/${wrongMediaId}`,
      body: JSON.stringify({
        error: {
          message: errMsg,
        },
      }),
    });

    return getMedia(wrongMediaId).catch((err) => {
      expect(server.requests.length).to.equal(1);
      testError(err, errMsg);
    });
  });
});

function testOptimizedMobile() {
  // FIXME:
  // If we use "import" to include optimizmeMobile, it will also include event constants,
  // which uses non-mobile version because import is executed before mocking-up mobile device.
  // The only choice is to use require in this function.
  // Please fix the issue in the future.
  // eslint-disable-next-line global-require
  const optimizeMobile = require('api/common/optimizeMobile').default;
  const el = document.createElement('DIV');

  // Spy "addEventListener" method of the element
  sinon.spy(el, 'addEventListener');
  // Call the tested function
  optimizeMobile(el);
  // Test "addEvnetListener" is called correctly
  el.addEventListener.should.have.been.calledOnce;
  el.addEventListener.should.have.been.calledWith('touchmove');
  expect(el.addEventListener.getCall(0).args[1]).to.be.a('function');

  // Create an touchmove event
  const event = new CustomEvent('touchmove');

  // Spy "preventDefault" method of the event
  sinon.stub(event, 'preventDefault');
  // Dispatch the event to the element
  el.dispatchEvent(event);
  // Test "preventDefault" is called correctly
  event.preventDefault.should.have.been.calledOnce;

  // Restore the spied methods
  el.addEventListener.restore();
  event.preventDefault.restore();
}

describe('optimizeMobile()', () => {
  let mockMobileDevice;

  beforeEach(() => {
    if (process.env.PHANTOM) {
      mockMobileDevice = mockMobile();
    }
  });

  afterEach(() => {
    if (process.env.PHANTOM) {
      mockMobileDevice.restore();
    }
  });

  it('should optimize an element on mobile', () => {
    if (process.env.PHANTOM) {
      testOptimizedMobile();
    } else {
      if (inMobile()) {
        testOptimizedMobile();
      }
    }
  });
});

function testTipShape(tip, expectedSrc, expectedWidth, expectedHeight) {
  expect(tip).to.be.an.instanceof(Image);
  expect(tip).to.have.attribute('src', expectedSrc);
  expect(tip).to.have.attribute('width', expectedWidth);
  expect(tip).to.have.attribute('height', expectedHeight);
}

describe('createTip()', () => {
  it('should be mouse image on desktop and tilt image on mobile', () => {
    if (process.env.PHANTOM) {
      testTipShape(createTip({}), `${STATIC_ROOT}/assets/tip-mouse.svg`, '45', '45');

      // Mockup mobile device
      const mockMobileDevice = mockMobile();
      testTipShape(createTip({}), `${STATIC_ROOT}/assets/tip-tilt.svg`, '80', '60');
      mockMobileDevice.restore();
    } else {
      if (inMobile()) {
        testTipShape(createTip({}), `${STATIC_ROOT}/assets/tip-tilt.svg`, '80', '60');
      } else {
        testTipShape(createTip({}), `${STATIC_ROOT}/assets/tip-mouse.svg`, '45', '45');
      }
    }
  });

  it('should have proper styles', () => {
    const expectedStyles = {
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
    };

    // Tests for onTop = false
    // The parameter onTop should be false on default
    testElementStyles(createTip({}), expectedStyles);
    testElementStyles(createTip({ onTop: false }), expectedStyles);

    // Test for onTop = true
    expectedStyles.zIndex = '99999999';
    testElementStyles(createTip({ onTop: true }), expectedStyles);
  });

  it('should have property "isShown", and functions "show", "hide"', () => {
    const expectedShownStyle = {
      opacity: '1',
      transition: {
        withPrefix: true,
        value: 'opacity 2.5s linear 3s',
      },
    };
    const expectedHiddenStyle = {
      opacity: '0',
      transition: {
        withPrefix: true,
        value: 'opacity 0.5s linear',
      },
    };
    const tip = createTip({});

    // Tip should have functions "show" and "hide", and property initialized to be false
    expect(tip.isShown).to.be.false;
    expect(tip.show).to.be.a('function');
    expect(tip.hide).to.be.a('function');

    // Show tip after calling "show" function
    tip.show();
    expect(tip.isShown).to.be.true;
    testElementStyles(tip, expectedShownStyle);

    // Hide tip after calling "hide" function
    tip.hide();
    expect(tip.isShown).to.be.false;
    testElementStyles(tip, expectedHiddenStyle);
  });
});

function testLogoLink(logo, expectedLink) {
  expect(logo).to.have.attribute('href', expectedLink);
  expect(logo).to.have.attribute('target', '_href');
}

function testLogoImage(logo, expectedSrc, expectedWidth, expectedHeight) {
  const img = logo.children[0];

  expect(img).to.have.attribute('src', expectedSrc);
  expect(img).to.have.attribute('width', expectedWidth);
  expect(img).to.have.attribute('height', expectedHeight);
}

describe('createLogo()', () => {
  it('should create an anchor element that contains an image', () => {
    const logo = createLogo({});

    // Test logo is a anchor
    expect(logo).to.match('a');
    // Test logo has exactly one child node
    expect(logo).to.have.length(1);
    // Test the child of logo is an image
    expect(logo.children[0]).to.match('img');
  });

  it('should use default redirect URL if redirectURL is not provided', () => {
    testLogoLink(createLogo({}), config.redirectURL);
  });

  it('should use custom redirect URL if redirectURL is provided', () => {
    const redirectURL = 'https://www.google.com';

    testLogoLink(createLogo({ redirectURL: '' }), '');
    testLogoLink(createLogo({ redirectURL }), redirectURL);
  });

  it('should have default anchor styles if logo is not provided', () => {
    const expectedStyle = {
      position: 'absolute',
      right: '10px',
      bottom: '12px',
    };

    testElementStyles(createLogo({}), expectedStyle);
  });

  it('should have another anchor styles if logo is provided', () => {
    const logo = 'https://imgurl.com/awesome.jpg';
    const expectedStyle = {
      position: 'absolute',
      right: '5px',
      bottom: '3px',
    };

    testElementStyles(createLogo({ logo: '' }), expectedStyle);
    testElementStyles(createLogo({ logo }), expectedStyle);
  });

  it('should have default image if logo is not provided', () => {
    testLogoImage(createLogo({}), `${STATIC_ROOT}/assets/logo.svg`, '90', '13');
  });

  it('should have custom image if logo is provided', () => {
    const logo = 'https://imgurl.com/awesome.jpg';

    testLogoImage(createLogo({ logo: '' }), '', '30', '30');
    testLogoImage(createLogo({ logo }), logo, '30', '30');
  });

  it('should execute callback "onMutation" when logo is removed', () => {
    const onMutation = sinon.stub();
    const logo = createLogo({ onMutation });

    document.body.appendChild(logo);
    document.body.removeChild(logo);
    onMutation.should.have.been.calledOnce;
  });

  it.skip('should execute callback "onMutation" when logo is modified', () => {
    // TODO: Modify logo and check the callback is called
  });
});

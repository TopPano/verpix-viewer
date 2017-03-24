import isIframe from 'lib/devices/isIframe';
import isMobile from 'lib/devices/isMobile';
import isIOS from 'lib/devices/isIOS';

import {
  inIframe,
  inIOS,
  inMobile,
  mockMobile,
  IOS,
  ANDROID,
} from 'test/helpers';

describe('isIframe()', () => {
  it('should return true if in iframe and false if not', () => {
    if (inIframe()) {
      expect(isIframe()).to.be.true;
    } else {
      expect(isIframe()).to.be.false;
    }
  });
});

describe('isMobile()', () => {
  it('should return true on mobile device and return false on desktop', () => {
    if (process.env.PHANTOM) {
      expect(isMobile()).to.be.false;

      // Mockup mobile device
      const mockMobileDevice = mockMobile();
      try {
        expect(isMobile()).to.be.true;
      } finally {
        mockMobileDevice.restore();
      }
    } else {
      if (inMobile()) {
        expect(isMobile()).to.be.true;
      } else {
        expect(isMobile()).to.be.false;
      }
    }
  });
});

describe('isIOS()', () => {
  it('should return true on iOS and return false on others', () => {
    if (process.env.PHANTOM) {
      expect(isIOS()).to.be.false;

      // Mockup Android
      const mockAndroid = mockMobile(ANDROID);
      try {
        expect(isIOS()).to.be.false;
      } finally {
        mockAndroid.restore();
      }

      // Mockup iOS
      const mockIOS = mockMobile(IOS);
      try {
        expect(isIOS()).to.be.true;
      } finally {
        mockIOS.restore();
      }
    } else {
      if (inIOS()) {
        expect(isIOS()).to.be.true;
      } else {
        expect(isIOS()).to.be.false;
      }
    }
  });
});

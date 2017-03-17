import isMobile from 'lib/devices/isMobile';

import { inMobile } from 'test/helpers';

describe('isMobile()', () => {
  it('should return true on mobile device and return false on desktop', () => {
    if (inMobile()) {
      expect(isMobile()).to.be.true;
    } else {
      expect(isMobile()).to.be.false;
    }
  });
});

import isMobile from 'lib/devices/isMobile';

import helpers from 'test/helpers';

describe('isMobile()', () => {
  it('should return true on mobile device and return false on desktop', () => {
    if (helpers.isMobile()) {
      expect(isMobile()).to.be.true;
    } else {
      expect(isMobile()).to.be.false;
    }
  });
});

import applyStyle from 'lib/dom/applyStyle';
import getDataAttribute from 'lib/dom/getDataAttribute';
import setDataAttribute from 'lib/dom/setDataAttribute';
import isHover from 'lib/dom/isHover'; // eslint-disable-line no-unused-vars

describe('applyStyle()', () => {
  // https://blogs.msdn.microsoft.com/ie/2011/10/28/a-best-practice-for-programming-with-vendor-prefixes/
  it('should apply style with different vendor prefixes to dom element', () => {
    const el = document.createElement('DIV');

    applyStyle(el, 'transform', 'translate(50%, 50%)');
    expect(el.style.transform).to.equal('translate(50%, 50%)');
    expect(el.style.webkitTransform).to.equal('translate(50%, 50%)');
    expect(el.style.MozTransform).to.equal('translate(50%, 50%)');
    expect(el.style.msTransform).to.equal('translate(50%, 50%)');
    expect(el.style.OTransform).to.equal('translate(50%, 50%)');

    applyStyle(el, 'pointerEvents', 'none');
    expect(el.style.pointerEvents).to.equal('none');
    expect(el.style.webkitPointerEvents).to.equal('none');
    expect(el.style.MozPointerEvents).to.equal('none');
    expect(el.style.msPointerEvents).to.equal('none');
    expect(el.style.OPointerEvents).to.equal('none');
  });
});

describe('getDataAttribute()', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('DIV');
  });

  it('should return true if data attribute is string "true"', () => {
    el.setAttribute('data-is-true', 'true');
    expect(getDataAttribute(el, 'is-true')).to.be.true;
  });

  it('should return false if data attribute is string "false"', () => {
    el.setAttribute('data-is-false', 'false');
    expect(getDataAttribute(el, 'is-false')).to.be.false;
  });

  it('should return null if data attribute is string "null"', () => {
    el.setAttribute('data-is-null', 'null');
    expect(getDataAttribute(el, 'is-null')).to.be.null;
  });

  it('should return undefined if data attribute is string "undefined"', () => {
    el.setAttribute('data-is-undefined', 'undefined');
    expect(getDataAttribute(el, 'is-undefined')).to.be.undefined;
  });

  it('should return float number if data attribute is string of float number', () => {
    el.setAttribute('data-float', '100');
    expect(getDataAttribute(el, 'float')).to.equal(100);
    el.setAttribute('data-float', '123.456789');
    expect(getDataAttribute(el, 'float')).to.equal(123.456789);
    el.setAttribute('data-float', '-987364324.12321398093435');
    expect(getDataAttribute(el, 'float')).to.equal(-987364324.12321398093435);
  });

  it('should return original value if data attribute is not string of above cases', () => {
    el.setAttribute('data-is-nan', 'NaN');
    expect(getDataAttribute(el, 'is-nan')).to.equal('NaN');
    el.setAttribute('data-str', 'I AM StrING');
    expect(getDataAttribute(el, 'str')).to.equal('I AM StrING');
  });
});

describe('setDataAttribute()', () => {
  it('should set string value of attribute with "data-" prefix of element', () => {
    const el = document.createElement('DIV');

    setDataAttribute(el, 'is-true', true);
    expect(el.getAttribute('data-is-true')).to.equal('true');
    setDataAttribute(el, 'is-false', false);
    expect(el.getAttribute('data-is-false')).to.equal('false');
    setDataAttribute(el, 'is-null', null);
    expect(el.getAttribute('data-is-null')).to.equal('null');
    setDataAttribute(el, 'is-undefined', undefined);
    expect(el.getAttribute('data-is-undefined')).to.equal('undefined');
    setDataAttribute(el, 'float', 3.14159);
    expect(el.getAttribute('data-float')).to.equal('3.14159');
    setDataAttribute(el, 'is-nan', NaN);
    expect(el.getAttribute('data-is-nan')).to.equal('NaN');
    setDataAttribute(el, 'str', 'MY NamE IS strIng');
    expect(el.getAttribute('data-str')).to.equal('MY NamE IS strIng');
  });
});

describe('isHover()', () => {
  // TODO: test cases of isHover
});

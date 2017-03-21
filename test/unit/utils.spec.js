import isArrayOfString from 'lib/utils/isArrayOfString';
import isArrayOfImageData from 'lib/utils/isArrayOfImageData'; // eslint-disable-line no-unused-vars
import execute from 'lib/utils/execute';
import sendGAEvent from 'lib/utils/sendGAEvent'; // eslint-disable-line no-unused-vars

describe('isArrayOfString()', () => {
  it('should return true if input is array of string', () => {
    [
      [],
      ['STR'],
      ['str0', 'str1'],
      ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's10'],
    ].forEach((arr) => expect(isArrayOfString(arr)).to.be.true);
  });

  it('should return false if input is array of string', () => {
    [
      undefined,
      null,
      () => {},
      100,
      'STR',
      [3],
      ['STR', 3],
      [0.0, 'str'],
    ].forEach((arr) => expect(isArrayOfString(arr)).to.be.false);
  });
});

describe('isArrayOfImageData()', () => {
  // TODO: test cases of isArrayOfImageData
});

describe('execute()', () => {
  it('should execute if input is a function (without arguments)', () => {
    const func = sinon.stub();

    execute(func);
    expect(func.calledOnce).to.be.true;
  });

  it('should execute if input is a function', () => {
    const func = sinon.stub();

    execute(func, 100, 'GA', true);
    expect(func.calledOnce).to.be.true;
    expect(func.calledWith(100, 'GA', true)).to.be.true;
  });

  it('should not execute if input is not a function', () => {
    [undefined, null, 100.123, 'STR', NaN].forEach((nonFunc) => {
      const spyExecute = sinon.spy(execute);

      execute(nonFunc);
      expect(spyExecute.threw()).to.be.false;
    });
  });
});

describe('sendGAEvent()', () => {
  // TODO: test cases of sendGAEvent
});

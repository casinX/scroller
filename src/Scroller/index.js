import positionTypes from '../config/positionTypes';
import timingFunctions from '../config/timingFunctions';


class Scroller {
  constructor({
    ancestor = window,
    target = null,
    duration = 1000,
    position = positionTypes.top,
    timingFunc = timingFunctions.linear
  }) {
    this._ancestor = ancestor;
    this._target = target;
    this._duration = duration;
    this._position = position;
    this._timingFunc = timingFunc;

    this._startTime = null;
    this._scrollLoop = null;
    this._ignoreFirst = false;

    this.FPS = 60;
  }

  call = () => {
    this.cancel();

    if (this._target === null) {
      return;
    }

    this._ancestor.addEventListener('scroll', this.onUserScroll);

    this._startTime = window.performance.now();
    this._animationLoop();
  };

  _animationLoop = () => {
    const fullScrollLength = this._getScrollLength();

    const time = window.performance.now() - this._startTime;

    let timeFactor = time / this._duration;

    if (timeFactor > 1) {
      timeFactor = 1;
    }

    const scrollFactor = this._timingFunc(timeFactor);
    const scrollValue = scrollFactor * fullScrollLength;

    if (this._ancestor === window) {
      this._ancestor.scrollTo(0, scrollValue);
    } else {
      this._ancestor.scrollTop = scrollValue;
    }

    this._ignoreFirst = true;

    if (timeFactor === 1) {
      return this.cancel();
    }

    this._scrollLoop = setTimeout(this._animationLoop, 1000 / this.FPS);
  };

  _getScrollLength = () => {
    const ancestorHeight = this._ancestor === window ?
      this._ancestor.innerHeight :
      this._ancestor.clientHeight;

    switch (this._position) {
      case 'start':
        return this._target.offsetTop;
      case 'center':
        return this._target.offsetTop - ancestorHeight / 2 + this._target.clientHeight / 2;
      case 'end':
        return this._target.offsetTop - ancestorHeight + this._target.clientHeight;
    }
  };

  onUserScroll = (e) => {
    if (this._ignoreFirst) {
      return this._ignoreFirst = false;
    }

    return this.cancel();
  };

  cancel = () => {
    if (this._scrollLoop !== null) {
      clearTimeout(this._scrollLoop);
      this._scrollLoop = null;
      this._startTime = null;
      this._ignoreFirst = false;
      this._ancestor.removeEventListener('scroll', this.onUserScroll);
    }
  };

  setTarget = (target) => {
    this._target = target;
  };
}


export default Scroller;

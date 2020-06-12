class Watcher {
  constructor(onCompleteCb) {
    this.onCompleteCb = onCompleteCb;
    this.proccess = [];
    this.isStarted = false;
  }

  started() {
    this.isStarted = true;
  }

  startProccess(element) {
    this.proccess.push(element);
  }

  endProccess(element) {
    const index = this.proccess.findIndex((item) => item === element);
    this.proccess.splice(index, 1);
    this._checkAllComplete();
  }

  _checkAllComplete() {
    if (this.isStarted && this.proccess.length === 0) {
      this.onCompleteCb();
    }
  }
}

module.exports = Watcher;

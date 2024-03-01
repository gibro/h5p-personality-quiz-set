import Screenshot from '@services/screenshot.js';
import Util from '@services/util.js';
import './header.scss';

/** Class representing a media screen */
export default class Header {
  /**
   * @class
   */
  constructor() {
    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-personality-quiz-set-header');

    this.awplusLogo = document.createElement('div');
    this.awplusLogo.classList.add('h5p-personality-quiz-set-header-logo-awplus');
    this.dom.append(this.awplusLogo);

    this.igmLogo = document.createElement('div');
    this.igmLogo.classList.add('h5p-personality-quiz-set-header-logo-igm');
    this.dom.append(this.igmLogo);
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get as image blob. Needs to be attached to DOM!
   * @returns {Blob} Image blob.
   */
  async getBlob() {
    const domClone = this.dom.cloneNode(true);
    domClone.classList.add('export');
    domClone.classList.add('offscreen');
    document.body.append(domClone);

    await Util.delay(0);

    const screenshot = await Screenshot.takeScreenshot(
      { element: domClone, enforceImage: true }
    );

    domClone.remove();

    return screenshot;
  }
}

import Screenshot from '@services/screenshot.js';
import Util from '@services/util.js';
import './footer.scss';

/** Class representing a media screen */
export default class Footer {
  /**
   * @class
   * @param {object} [params] Parameters.
   */
  constructor(params = {}) {
    this.params = params;

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-personality-quiz-set-footer');

    this.logo = document.createElement('div');
    this.logo.classList.add('h5p-personality-quiz-set-footer-logo');
    this.dom.append(this.logo);

    this.text = document.createElement('div');
    this.text.classList.add('h5p-personality-quiz-set-footer-text');
    this.text.innerText = this.params.text ?? '';
    this.dom.append(this.text);
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

/** @constant {number} BLOB_LINES_MAX Maximum number of lines to display in blob. */
Footer.BLOB_LINES_MAX = 6;

/** @constant {number} BLOB_LINE_HEIGHT_MAX_PX Maximum height of line measured in px in blob. */
Footer.BLOB_LINE_HEIGHT_MAX_PX = 48;

/** @constant {number} BLOB_FONT_SIZE_OF_LINE_HEIGHT Factor based font size for blob based on line height. */
Footer.BLOB_FONT_SIZE_OF_LINE_HEIGHT = 0.75;

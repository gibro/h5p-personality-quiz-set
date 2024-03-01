import { jsPDF } from 'jspdf';

export default class ExportPDF {
  /**
   * @class
   */
  constructor() {}

  /**
   * Export document.
   * @param {object} [params] Parameters of export.
   * @param {string} params.filename Filename for export.
   */
  export(params = {}) {
    params.filename = params.filename ||
      `${H5P.createUUID()}-${Date.now()}.pdf`;

    const pdf = new jsPDF();
    pdf.deletePage(1); // Start with a clean slate to keep code simpler

    this.fillDocument(
      pdf, params.resultsBlobs, params.headerBlob, params.footerBlob
    );

    pdf.save(params.filename);
  }

  /**
   * Fill document with blobs.
   * @param {jsPDF} pdf JSPDF object.
   * @param {Blob[]} blobs Results blobs.
   * @param {Blob} headerBlob Header blob.
   * @param {Blob} footerBlob Footer blob.
   */
  fillDocument(pdf, blobs, headerBlob, footerBlob) {
    const contentGeometry = this.addPage({
      pdf,
      headerBlob: headerBlob,
      footerBlob: footerBlob
    });

    let remainingHeightMM = contentGeometry.height;

    while (remainingHeightMM > 0 && blobs.length) {
      const { image, size } = this.getSizedImageBlob({
        pdf: pdf,
        blob: blobs[0],
        maxHeightMM: remainingHeightMM
      });

      const totalImageSpace = size.height + ExportPDF.PAGE_MARGIN_MM;

      if (totalImageSpace <= remainingHeightMM) {
        pdf.addImage(
          image, 'PNG',
          contentGeometry.x,
          contentGeometry.y + contentGeometry.height - remainingHeightMM,
          size.width,
          size.height
        );

        blobs.shift();
      }

      remainingHeightMM = remainingHeightMM - totalImageSpace;
    }

    if (blobs.length) {
      this.fillDocument(pdf, blobs, headerBlob, footerBlob);
    }
  }

  /**
   * Get sized image blob.
   * @param {object} [params] Parameters.
   * @param {jsPDF} params.pdf PDF document.
   * @param {Blob} params.blob Blob of header image.
   * @param {number} [params.maxWidthMM] Maximum width in mm.
   * @param {number} [params.maxHeightMM] Maximum height in mm.
   * @returns {object} HTMLImage element and its scaled size.
   */
  getSizedImageBlob(params = {}) {
    params.maxWidthMM = params.maxWidthMM ?? ExportPDF.PAGE_WIDTH_MAX_MM;

    const image = document.createElement('img');
    image.src = URL.createObjectURL(params.blob);

    const imageSize = params.pdf.getImageProperties(image);
    const imageRatio = imageSize.width / imageSize.height;

    // Determine image size at full width
    let size = {
      width: params.maxWidthMM,
      height: params.maxWidthMM / imageRatio
    };

    // Use maximum height as limiting factor and scale width down
    if (params.maxHeightMM && size.height > params.maxHeightMM) {
      size = {
        width: params.maxHeightMM * imageRatio,
        height: params.maxHeightMM
      };
    }

    return { image, size };
  }

  /**
   * Add page including header/footer.
   * @param {object} params Parameters.
   * @param {jsPDF} params.pdf PDF document.
   * @param {Blob} [params.headerBlob] Blob of header image.
   * @param {Blob} [params.footerBlob] Blob of footer image.
   * @returns {object|undefined} Remaining content geometry or undefined.
   */
  addPage({ pdf, headerBlob, footerBlob }) {
    if (!pdf) {
      return;
    }

    pdf.addPage();

    let headerGeometry = { x: 0, y: 0, width: 0, height: 0 };
    let footerGeometry = { x: 0, y: 0, width: 0, height: 0 };

    // Header
    if (headerBlob) {
      const { image, size } = this.getSizedImageBlob({ pdf, blob: headerBlob });

      headerGeometry = {
        x: ExportPDF.PAGE_MARGIN_MM,
        y: ExportPDF.PAGE_MARGIN_MM + ExportPDF.PAGE_HEIGHT_MAX_MM -
          ExportPDF.PAGE_HEIGHT_MAX_MM,
        width: size.width,
        height: size.height
      };

      pdf.addImage(
        image, 'PNG',
        headerGeometry.x, headerGeometry.y,
        headerGeometry.width, headerGeometry.height
      );
    }

    // Footer
    if (footerBlob) {
      const { image, size } = this.getSizedImageBlob({ pdf, blob: footerBlob });

      footerGeometry = {
        x: ExportPDF.PAGE_MARGIN_MM,
        y: ExportPDF.PAGE_MARGIN_MM + ExportPDF.PAGE_HEIGHT_MAX_MM - size.height,
        width: size.width,
        height: size.height
      };

      pdf.addImage(
        image, 'PNG',
        footerGeometry.x, footerGeometry.y,
        footerGeometry.width, footerGeometry.height
      );
    }

    // Describes rect between header and footer incl. margin to both
    return {
      x: ExportPDF.PAGE_MARGIN_MM,
      y: footerGeometry.height + ExportPDF.PAGE_MARGIN_MM,
      width: ExportPDF.PAGE_WIDTH_MAX_MM,
      height: ExportPDF.PAGE_HEIGHT_MAX_MM - ExportPDF.PAGE_MARGIN_MM -
        headerGeometry.height - footerGeometry.height
    };
  }

  /**
   * Get image from blob.
   * @param {Blob} imageBlob Image blob.
   * @returns {HTMLElement|null} Image element or null if error.
   */
  async getImage(imageBlob) {
    return await new Promise((resolve, reject) => {
      const image = document.createElement('img');
      image.addEventListener('load', () => {
        resolve(image);
      });
      image.addEventListener('error', () => {
        reject(null);
      });
      image.src = URL.createObjectURL(imageBlob);
    });
  }
}

/** @constant {number} Page width in mm. */
ExportPDF.PAGE_WIDTH_MM = 210; // 210 is DinA4 width in mm

/** @constant {number} Page height in mm. */
ExportPDF.PAGE_HEIGHT_MM = 297; // 297 is DinA4 height in mm

/** @constant {number} Default gap between elements in mm. */
ExportPDF.PAGE_MARGIN_MM = 10; // Default gap between elements in mm

/** @constant {number} Max width in mm. */
ExportPDF.PAGE_WIDTH_MAX_MM = ExportPDF.PAGE_WIDTH_MM - 2 * ExportPDF.PAGE_MARGIN_MM;

/** @constant {number} Max width in mm. */
ExportPDF.PAGE_HEIGHT_MAX_MM = ExportPDF.PAGE_HEIGHT_MM - 2 * ExportPDF.PAGE_MARGIN_MM;

/** @constant {number} Pixels that equal one mm */
ExportPDF.MM_EQUALS_PX = 3.7795275591;

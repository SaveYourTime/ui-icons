import { stringify } from 'csv-stringify/sync';
import { orderBy } from 'lodash-es';
import { writeFile } from 'fs/promises';

export enum STYLE_ERROR_CODE {
  PROPERTY_NOT_EXISTED = 1000,
  INVALID_VALUE = 1001,
}

export enum SIZE_ERROR_CODE {
  PROPERTY_NOT_EXISTED = 2000,
  INVALID_VALUE = 2001,
}

export enum SOURCE_ERROR_CODE {
  IMAGE_URL_NOT_FOUND = 3000,
  SVG_NOT_FOUND = 3001,
  COMPONENT_NAME_DUPLICATED = 3002,
  MISSING_FILLED_SVG = 3003,
  MISSING_TWOTONED_SVG = 3004,
  COMBINE_FAIL = 3005,
  COMPONENT_SET_NOT_FOUND = 3006,
}

type ERROR_CODE = STYLE_ERROR_CODE | SIZE_ERROR_CODE | SOURCE_ERROR_CODE;

const ERROR_MESSAGE: Record<ERROR_CODE, string> = {
  [STYLE_ERROR_CODE.PROPERTY_NOT_EXISTED]: `Can't found Component Property 'Style'`,
  [STYLE_ERROR_CODE.INVALID_VALUE]: `The value of Component Property 'Style' should be 'Filled', 'TwoToned', 'Outlined'`,
  [SIZE_ERROR_CODE.PROPERTY_NOT_EXISTED]: `Can't found Component Property 'Size'`,
  [SIZE_ERROR_CODE.INVALID_VALUE]: `The value of Component Property 'Size' should be '20px', '24px'`,
  [SOURCE_ERROR_CODE.IMAGE_URL_NOT_FOUND]: `Can't found source url`,
  [SOURCE_ERROR_CODE.SVG_NOT_FOUND]: `Can't found svg`,
  [SOURCE_ERROR_CODE.COMPONENT_NAME_DUPLICATED]: `There are duplicated naming for several svgs`,
  [SOURCE_ERROR_CODE.MISSING_FILLED_SVG]: `svg for 'Filled' style is missing`,
  [SOURCE_ERROR_CODE.MISSING_TWOTONED_SVG]: `svg for 'TowToned' style is missing`,
  [SOURCE_ERROR_CODE.COMBINE_FAIL]: `Can't combine svg`,
  [SOURCE_ERROR_CODE.COMPONENT_SET_NOT_FOUND]: `Can't found icon name from parents layer`,
};

class Report {
  private report: {
    code: ERROR_CODE;
    message: string;
    meta: { [key: string]: any };
  }[] = [];

  public add(code: ERROR_CODE, meta: { [key: string]: any } = {}) {
    this.report.push({ code, message: ERROR_MESSAGE[code], meta });
  }

  public log() {
    // eslint-disable-next-line no-console
    console.log(this.report);
  }

  public async csv() {
    const records = orderBy(
      this.report.map(
        ({ code, message, meta: { id = '', name = '', ...rest } }) => ({
          code,
          message,
          id,
          name,
          extra: JSON.stringify(rest),
          url: id
            ? `https://www.figma.com/file/${process.env.FIGMA_FILE_KEY}?node-id=${id}`
            : '',
        }),
      ),
      ['code', ({ name }) => name.toLowerCase(), 'id'],
      ['asc', 'asc', 'asc'],
    );
    const csv = stringify(records, {
      header: true,
      columns: ['id', 'name', 'extra', 'code', 'message', 'url'],
    });
    await writeFile('report.csv', csv);
  }
}
const report = new Report();
export default report;

import { mkdir, writeFile } from 'fs/promises';
import { JSDOM } from 'jsdom';
import { assign, chunk } from 'lodash-es';
import { resolve } from 'path';
import rimraf from 'rimraf';
import { loadConfig, optimize } from 'svgo';
import { getImages, getSVG } from './api';
import report, {
  SIZE_ERROR_CODE,
  SOURCE_ERROR_CODE,
  STYLE_ERROR_CODE,
} from './report';
import {
  FileResponse,
  Icon,
  ICON_MODE,
  ICON_SIZE,
  ICON_STYLE,
  SVGIcon,
} from './types';

const SVG_PATH = 'src/svg';

export const getIcons = ({ componentSets, components }: FileResponse): Icon[] =>
  Object.entries(components).reduce((result: Icon[], [id, component]) => {
    const { componentSetId } = component;
    const componentSet = componentSetId && componentSets[componentSetId];

    if (componentSet) {
      // remove empty spaces, dashes, parentheses and slashes from componentSet name
      const name = componentSet.name.replace(/ |-|\(|\)|\//g, '');

      // extract style, size, mode from component name
      const properties = component.name.split(', ');
      const style = (properties
        .find((property) => property.startsWith('Style='))
        ?.replace(/Style=|-/g, '') ?? '') as ICON_STYLE | '';
      const size = (properties
        .find((property) => property.startsWith('Size='))
        ?.replace(/Size=/g, '') ?? '') as ICON_SIZE | '';
      const mode = (properties
        .find((property) => property.startsWith('Mode='))
        ?.replace(/Mode=/g, '') ?? '') as ICON_MODE | '';

      // skip components with outlined style
      if (style === ICON_STYLE.OUTLINED) return result;
      // skip dark mode for now
      if (mode === ICON_MODE.DARK) return result;
      // skip components with invalid style
      if (!style) {
        report.add(STYLE_ERROR_CODE.PROPERTY_NOT_EXISTED, {
          id,
          name,
          componentSetId,
        });
        return result;
      }
      if (![ICON_STYLE.FILLED, ICON_STYLE.TWOTONED].includes(style)) {
        report.add(STYLE_ERROR_CODE.INVALID_VALUE, {
          id,
          name,
          componentSetId,
          style,
        });
        return result;
      }
      // skip components with invalid size
      if (!size) {
        report.add(SIZE_ERROR_CODE.PROPERTY_NOT_EXISTED, {
          id,
          name,
          componentSetId,
        });
        return result;
      }
      if (![ICON_SIZE['20px'], ICON_SIZE['24px']].includes(size)) {
        report.add(SIZE_ERROR_CODE.INVALID_VALUE, {
          id,
          name,
          componentSetId,
          size,
        });
        return result;
      }

      result.push({ id, name, style, size });
    } else {
      report.add(SOURCE_ERROR_CODE.COMPONENT_SET_NOT_FOUND, {
        id,
        name: component.name,
        componentSetId: component.componentSetId,
      });
    }

    return result;
  }, []);

export const getSVGs = async (icons: Icon[]) => {
  const CHUNK_SIZE = 50;
  const ids = icons.map((icon) => icon.id);
  const idChunks = chunk(ids, CHUNK_SIZE);
  const imageGroups = await Promise.all(
    idChunks.map((idChunk) => getImages(idChunk.join(','))),
  );
  const images = assign({}, ...imageGroups);
  return Promise.all(
    icons
      .filter((icon) => {
        const imageUrl = images[icon.id];
        if (!imageUrl) {
          report.add(SOURCE_ERROR_CODE.IMAGE_URL_NOT_FOUND, icon);
          return false;
        }
        return true;
      })
      .map(async ({ id, name, style, size }) => {
        const imageUrl = images[id];
        const svg = await getSVG(imageUrl);
        return { id, name, style, size, svg };
      }),
  );
};

const sanitizeSVGs = (icons: SVGIcon[]) =>
  icons.filter((icon, index, items) => {
    if (!icon.svg) {
      report.add(SOURCE_ERROR_CODE.SVG_NOT_FOUND, icon);
      return false;
    }
    if (
      items.findIndex(
        (item) =>
          item.name === icon.name &&
          item.style === icon.style &&
          item.size === icon.size,
      ) !== index
    ) {
      const { svg, ...rest } = icon;
      report.add(SOURCE_ERROR_CODE.COMPONENT_NAME_DUPLICATED, rest);
      return false;
    }
    return true;
  });

const modifySVG = (svg: string) =>
  svg
    .replace(/fill="#838691"/gi, 'fill="currentColor" class="filled"')
    .replace(/fill="#006FFF"/gi, 'fill="currentColor" class="outlined"')
    .replace(/fill="#E5F1FF"/gi, 'fill="currentColor" class="twoToned"');

const optimizeSVG = async (svg: string, path: string) => {
  const config = await loadConfig();
  const result = optimize(svg, { ...config, path });
  if ('data' in result) {
    const optimizedSVG = result.data;
    return optimizedSVG;
  }
  return svg;
};

export const generateSVGs = async (svgs: SVGIcon[]) => {
  // clean svg folder
  await new Promise((res, rej) => {
    rimraf(SVG_PATH, (err) => (err ? rej(err) : res(true)));
  });
  // create svg folder if not exists
  await mkdir(SVG_PATH, { recursive: true });
  const sanitizedSVGs = sanitizeSVGs(svgs);
  const groupedSVGs = sanitizedSVGs.reduce(
    (
      result: {
        [key: Icon['name']]: {
          [key in ICON_STYLE]: string;
        };
      },
      item,
    ) => {
      const { name, style, size, svg } = item;
      const svgName = size === ICON_SIZE['20px'] ? name : `Nav${name}`;
      return { ...result, [svgName]: { ...result[svgName], [style]: svg } };
    },
    {},
  );
  await Promise.all(
    Object.entries(groupedSVGs).map(async ([name, { Filled, TwoToned }]) => {
      if (!Filled) {
        report.add(SOURCE_ERROR_CODE.MISSING_FILLED_SVG, { name });
        return;
      }
      if (!TwoToned) {
        report.add(SOURCE_ERROR_CODE.MISSING_TWOTONED_SVG, { name });
        return;
      }
      const FilledSVGDOM = new JSDOM(Filled).window.document.querySelector(
        'svg',
      );
      const filledWithoutSVGTag = FilledSVGDOM?.innerHTML ?? '';
      const TwoTonedSVGDOM = new JSDOM(TwoToned).window.document.querySelector(
        'svg',
      );
      TwoTonedSVGDOM?.insertAdjacentHTML('beforeend', filledWithoutSVGTag);
      const combinedSVG = TwoTonedSVGDOM?.outerHTML ?? '';
      if (!combinedSVG) {
        report.add(SOURCE_ERROR_CODE.COMBINE_FAIL, { name });
        return;
      }
      const path = resolve(SVG_PATH, `${name}.svg`);
      const modifiedSVG = modifySVG(combinedSVG);
      const optimizedSVG = await optimizeSVG(modifiedSVG, path);
      await writeFile(path, optimizedSVG, { encoding: 'utf8' });
    }),
  );
};

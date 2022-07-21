interface Component {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: unknown[];
}

interface ComponentSet {
  key: string;
  name: string;
  description: string;
}

export interface FileResponse {
  document: {
    id: string;
    name: string;
    type: string;
    children: {
      // some properties are missing and not fully typed here
      id: string;
      name: string;
      type: string;
      children: unknown[];
    }[];
  };
  components: { [key: string]: Component };
  componentSets: { [key: string]: ComponentSet };
  schemaVersion: number;
  styles: {
    [key: string]: {
      key: string;
      name: string;
      styleType: string;
      description: string;
    };
  };
  name: string;
  lastModified: string;
  thunbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

export interface ImageResponse {
  err: string | null;
  images: { [key: string]: string };
}

export enum ICON_STYLE {
  FILLED = 'Filled',
  OUTLINED = 'Outlined',
  TWOTONED = 'TwoToned',
}

export enum ICON_SIZE {
  '20px' = '20px',
  '24px' = '24px',
}

export enum ICON_MODE {
  LIGHT = 'Light',
  DARK = 'Dark',
}

export interface Icon {
  id: string;
  name: string;
  style: ICON_STYLE;
  size: ICON_SIZE;
}

export interface SVGIcon extends Icon {
  svg: string;
}

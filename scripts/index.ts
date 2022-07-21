import 'dotenv/config';
import { getFile } from './api';
import { generateSVGs, getIcons, getSVGs } from './utils';
import report from './report';

const main = async () => {
  const file = await getFile();
  const icons = getIcons(file);
  const svgs = await getSVGs(icons);
  await generateSVGs(svgs);
  report.csv();
};
main();

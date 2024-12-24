import { indexLocalesConfig } from './modules';

const generateLocalesMapping = (config: any, locales = 'en') => {
  const result = {};
  Object.keys(config).forEach((key) => {
    // @ts-ignore
    result[key] = config[key][locales];
  });
  return result;
};

const generateLocalesId = (config: any) => {
  const result = {};
  Object.keys(config).forEach((key) => {
    // @ts-ignore
    result[key] = key;
  });
  return result;
};

export const localesIds: any = {
  ...generateLocalesId(indexLocalesConfig),
};

export const localesMap = (lang: string) => ({
  ...generateLocalesMapping(indexLocalesConfig, lang),
});

export default localesIds;

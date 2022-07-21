const template = (
  { componentName, props, interfaces, imports, exports, jsx },
  { tpl },
) => {
  return tpl`
    ${imports};
    import withIconWrapper, { withStyled } from '../withIconWrapper';

    ${interfaces};

    const ${componentName} = withIconWrapper(withStyled((${props}) => ${jsx}));

    ${exports};
  `;
};
module.exports = template;

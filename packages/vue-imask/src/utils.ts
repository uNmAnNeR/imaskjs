import { type FactoryOpts } from 'imask';


export
function extractOptionsFromProps<Props extends FactoryOpts> (props: Props, exclude: Readonly<Array<keyof Props>>): FactoryOpts {
  props = {...props};

  // keep only defined props
  (Object.keys(props) as Array<keyof Props>)
    .forEach(prop => {
      if (props[prop] === undefined || exclude.includes(prop)) delete props[prop];
    });

  return props;
}

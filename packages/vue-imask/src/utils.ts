export
function extractOptionsFromProps<
  Props extends Record<string, any>,
  ExcludeProps extends keyof Props
> (props: Props, exclude: Readonly<ExcludeProps[]>): Omit<Props, ExcludeProps> {
  props = {...props};

  // keep only defined props
  (Object.keys(props) as Array<ExcludeProps>)
    .forEach(prop => {
      if (props[prop] === undefined || exclude.includes(prop)) delete props[prop];
    });

  return props;
}

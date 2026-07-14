import { Text, TextProps } from 'react-native';

const AppText = ({ style, ...props }: TextProps) => {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: 'PlusJakartaSans',
          fontSize: 14,
        },
        style,
      ]}
    />
  );
};

export default AppText;
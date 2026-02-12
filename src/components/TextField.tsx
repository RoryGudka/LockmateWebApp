import { FormEventHandler } from "react";
import { palette } from "../theme";

interface ContainerProps {
  value: string;
  onChange: FormEventHandler<HTMLInputElement>;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

const TextField: React.FC<ContainerProps> = ({
  value,
  onChange,
  placeholder,
  type,
  disabled,
  onKeyDown,
}) => {
  return (
    <input
      style={{
        textAlign: "left",
        backgroundColor: palette.gray.main,
        borderRadius: "8px",
        padding: "12px 16px",
        width: "100%",
        maxWidth: "360px",
        margin: "0 auto",
        display: "block",
        boxSizing: "border-box",
      }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      onKeyDown={onKeyDown}
    />
  );
};

export default TextField;

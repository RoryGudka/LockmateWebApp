import * as SelectPrimitive from "@radix-ui/react-select";
import { palette } from "../theme";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
}) => {
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "6px",
            color: palette.text.main,
          }}
        >
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "15px",
            fontWeight: 400,
            borderRadius: "8px",
            border: "none",
            backgroundColor: palette.gray.main,
            color: palette.text.main,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
            outline: "none",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e8e8ec";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = palette.gray.main;
          }}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon style={{ color: palette.gray.darkest }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow:
                "0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)",
              width: "var(--radix-select-trigger-width)",
              maxHeight: "300px",
              overflow: "hidden",
              zIndex: 10000,
            }}
          >
            <SelectPrimitive.Viewport style={{ padding: "4px" }}>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  style={{
                    fontSize: "15px",
                    padding: "10px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    userSelect: "none",
                    color: palette.text.main,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = palette.gray.main;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator
                    style={{
                      position: "absolute",
                      right: "12px",
                      color: palette.blue.main,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};

export default Select;

import { palette } from "../theme";

interface InlineMessageProps {
  text: string;
  tone?: "error" | "info" | "success";
}

const toneStyles = {
  error: {
    backgroundColor: palette.alert.light,
    color: palette.alert.main,
    border: `1px solid ${palette.alert.main}`,
  },
  info: {
    backgroundColor: palette.gray.main,
    color: palette.text.main,
    border: `1px solid ${palette.gray.dark}`,
  },
  success: {
    backgroundColor: palette.safe.light,
    color: palette.safe.main,
    border: `1px solid ${palette.safe.main}`,
  },
};

const InlineMessage: React.FC<InlineMessageProps> = ({
  text,
  tone = "error",
}) => {
  if (!text) return null;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      style={{
        marginTop: "16px",
        marginBottom: "4px",
        padding: "10px 12px",
        borderRadius: "8px",
        fontSize: "14px",
        textAlign: "left",
        ...toneStyles[tone],
      }}
    >
      {text}
    </div>
  );
};

export default InlineMessage;

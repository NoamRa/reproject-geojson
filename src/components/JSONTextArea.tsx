import { useEffect, useState } from "react";

type JSONTextAreaProps = {
  json: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
};

export function JSONTextArea({ json, onChange }: JSONTextAreaProps) {
  const [text, setText] = useState(JSON.stringify(json, null, 2));
  const [error, setError] = useState("");

  useEffect(() => {
    setText(JSON.stringify(json, null, 2));
  }, [json]);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (evt) => {
    error && setError("");

    const updatedText = evt.target.value;
    setText(updatedText);
    try {
      const updatedJson = JSON.parse(updatedText);
      onChange(updatedJson);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? `Invalid JSON: ${err.message as string}`
          : "";
      setError(message);
    }
  };

  return (
    <>
      <h5 style={{ color: "red", display: "block" }}>{error}&nbsp;</h5>
      <textarea
        onChange={handleChange}
        value={text}
        rows={24}
        cols={80}
        style={{ border: error ? "3px red solid" : "3px black solid" }}
      />
    </>
  );
}

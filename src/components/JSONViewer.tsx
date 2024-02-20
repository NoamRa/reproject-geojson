type JSONViewerProps = {
  json: Record<string, unknown>;
};

export function JSONViewer({ json }: JSONViewerProps) {
  return (
    <pre>
      <code>{JSON.stringify(json, null, 2)}</code>
    </pre>
  );
}

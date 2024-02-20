type JSONViewerProps = {
  json: object;
};

export function JSONViewer({ json }: JSONViewerProps) {
  return (
    <pre>
      <code>{JSON.stringify(json, null, 2)}</code>
    </pre>
  );
}

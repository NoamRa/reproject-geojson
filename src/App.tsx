import { useEffect, useState } from "react";
import { JSONTextArea } from "./components/JSONTextArea";
import { JSONViewer } from "./components/JSONViewer";
import {
  GeoJsonWithCrs,
  reprojectGeoJSONIfNeeded,
} from "./reprojectGeoJSON/reprojectGeoJSON";

export default function App() {
  const [inputGeoJSON, setInputGeoJSON] = useState({});
  const [outputGeoJSON, setOutputGeoJSON] = useState({});

  useEffect(() => {
    reprojectGeoJSONIfNeeded(inputGeoJSON as GeoJsonWithCrs).then(
      setOutputGeoJSON
    );
  }, [inputGeoJSON]);

  return (
    <>
      <header>
        <h1>Reproject GeoJSON</h1>
      </header>
      <main>
        <JSONTextArea json={inputGeoJSON} onChange={setInputGeoJSON} />
        <JSONViewer json={outputGeoJSON} />
      </main>
    </>
  );
}

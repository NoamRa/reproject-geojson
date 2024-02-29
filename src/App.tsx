import { GeoJsonObject } from "geojson";
import { useEffect, useState } from "react";
import { JSONTextArea } from "./components/JSONTextArea";
import { JSONViewer } from "./components/JSONViewer";
import { Map } from "./components/Map";
import {
  GeoJsonWithCrs,
  reprojectGeoJSONIfNeeded,
} from "./reprojectGeoJSON/reprojectGeoJSON";

export default function App() {
  const [inputGeoJSON, setInputGeoJSON] = useState<Record<string, unknown>>({});
  const [outputGeoJSON, setOutputGeoJSON] = useState<
    GeoJsonObject | undefined
  >();

  useEffect(() => {
    reprojectGeoJSONIfNeeded(inputGeoJSON as unknown as GeoJsonWithCrs).then(
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
        <details>
          {outputGeoJSON && <JSONViewer json={outputGeoJSON as unknown as Record<string, unknown>} />}
        </details>
        <Map geoJSON={outputGeoJSON} />
      </main>
    </>
  );
}

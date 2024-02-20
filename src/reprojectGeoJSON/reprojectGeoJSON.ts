/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GeoJsonObject } from "geojson";
import proj4 from "proj4-fully-loaded";

export type GeoJsonWithCrs = GeoJsonObject & {
  crs?: string;
};

const WGS84_CRS_URN = "urn:ogc:def:crs:OGC:1.3:CRS84";

/**
 * Transform a GeoJSON to EPSG4326 - the native projection used by Leaflet
 * A GeoJSON doesn't needs transformation if it can be read as-is by Leaflet's `GeoJSON` component.
 * If transform is not needed, the original GeoJSON is returned, else Clones the GeoJSON and does not change the original.
 * @param {GeoJsonWithCrs} geoJson GeoJSON object.
 * @returns {GeoJsonWithCrs} GeoJSON object, either the same one if n
 */
export async function reprojectGeoJSONIfNeeded(
  geoJson: GeoJsonWithCrs
): Promise<GeoJsonWithCrs> {
  const crsUrn = getCrsUrn(geoJson);
  if (!requiresTransform(crsUrn, geoJson)) return geoJson;

  return reprojectGeoJSON(structuredClone(geoJson), crsUrn);
}

async function reprojectGeoJSON(
  geoJson: GeoJsonWithCrs,
  crsUrn: string
): Promise<GeoJsonWithCrs> {
  const crs = detectCRS(crsUrn);

  // create a transform coordinate function from our EPSG code to WGS84, Leaflet's native projection
  const coordinateTransformer = proj4(crs, "WGS84").forward;
  const visitor = (value: any, obj: any, key: string) => {
    if (isArrayOfNumbers(value)) {
      obj[key] = coordinateTransformer(value);
    }
    if (value === crsUrn) {
      obj[key] = WGS84_CRS_URN;
    }
  };
  traverse(geoJson, visitor);
  return geoJson;
}

/**
 * Check if GeoJSON needs to be transforms based on the CRS URN
 * A GeoJSON doesn't needs transformation if it can be read as-is by Leaflet's `GeoJSON` component.
 * There are two cases:
 * 1) The CRS URN is `CRS84`, which is the same as `WGS84` / `EPSG4326` - the native projection used by Leaflet.
 * 2) GeoJSONs without CRS URN - after inspection of the GeoJSONs in production, these GeoJSONs are _mostly_ EPSG4326.
 *    In order to assert that that's the case, we validate each point in the GeoJSON.
 *    For more details see https://up42.atlassian.net/browse/AT-3787
 * @param {string} crsUrn
 * @param {GeoJsonWithCrs} geoJson
 * @returns {boolean} should or shouldn't transform
 */
function requiresTransform(
  crsUrn: string,
  geoJson: Readonly<GeoJsonWithCrs>
): boolean {
  if (crsUrn === WGS84_CRS_URN) return false;
  if (crsUrn === "") {
    let boundsAreValid = true;
    const isBetween = (min: number, num: number, max: number) =>
      min <= num && num <= max;
    const validatePoint = (value: any) => {
      if (isArrayOfNumbers(value)) {
        const [lng, lat] = value;
        if (!isBetween(-180, lng, 180) || !isBetween(-90, lat, 90)) {
          boundsAreValid = false;
        }
      }
    };
    traverse(geoJson, validatePoint);
    return !boundsAreValid;
  }
  return true;
}

function getCrsUrn(geoJson: GeoJsonWithCrs): string {
  let crsUrn = "";
  if (geoJson.crs) {
    const findCrsUrn = (value: unknown) => {
      if (typeof value === "string" && value.includes("urn:ogc:def:crs")) {
        crsUrn = value;
      }
    };
    traverse(geoJson.crs, findCrsUrn);
  }
  return crsUrn;
}

function detectCRS(urn: string): string {
  const [namespace, , code] = urn.replace("urn:ogc:def:crs:", "").split(":");
  if (namespace !== "EPSG") {
    throw new Error(
      "CRS URN invalid or missing. Only EPSG namespaces are supported"
    );
  }
  return [namespace, code].join(":");
}

function traverse(
  obj: any,
  visitor: (value: any, obj: any, key: string) => void
) {
  for (const key in obj) {
    const value = obj[key];
    visitor(value, obj, key);
    if (value !== null && typeof value == "object") {
      traverse(value, visitor);
    }
  }
}

function isArrayOfNumbers(value: any) {
  return Array.isArray(value) && value.every(Number.isFinite);
}

// #endregion

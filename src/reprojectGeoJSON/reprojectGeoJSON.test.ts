import type { GeoJsonObject } from 'geojson'
import { describe, expect, test } from 'vitest'

import { reprojectGeoJSONIfNeeded } from './reprojectGeoJSON'

describe('Test GeoJSON helpers', () => {
  describe('Test reprojectGeoJSONIfNeeded', () => {
    test('empty object', async () => {
      const geoJson = {} as GeoJsonObject
      const res = await reprojectGeoJSONIfNeeded(geoJson)
      expect(res).toBe(geoJson)
    })

    test('keep CRS84 as is', async () => {
      const geoJson = {
        type: 'FeatureCollection',
        name: 'BJ3B1_PMS_20231012164242_L1_201CB9_SC_006',
        crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
        features: [
          {
            type: 'Feature',
            properties: { DN: 0 },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-85.411967055718861, 38.844696865091066],
                  [-85.41937824216005, 38.821558395697579],
                  [-85.420205558902296, 38.821271176436198],
                  [-85.420387545906976, 38.821210895217462],
                  [-85.420572070056267, 38.821155535353398],
                ],
              ],
            },
          },
        ],
      } as GeoJsonObject
      const res = await reprojectGeoJSONIfNeeded(geoJson)
      expect(res).toBe(geoJson)
    })

    test('keep GeoJSON with valid points as is', async () => {
      const geoJson = {
        type: 'FeatureCollection',
        name: 'BJ3B1_PMS_20231012164242_L1_201CB9_SC_006',
        features: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-85.411967055718861, 38.844696865091066],
                  [-85.41937824216005, 38.821558395697579],
                  [-85.420205558902296, 38.821271176436198],
                  [-85.420387545906976, 38.821210895217462],
                  [-85.420572070056267, 38.821155535353398],
                ],
              ],
            },
          },
        ],
      } as GeoJsonObject
      const res = await reprojectGeoJSONIfNeeded(geoJson)
      expect(res).toBe(geoJson)
    })

    test('transform coordinates', async () => {
      const geoJson = {
        type: 'FeatureCollection',
        name: 'MaskFeature',
        crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::32612' } },
        features: [
          {
            type: 'Feature',
            properties: {
              gml_id: 'source_image_footprint-PHR1A_PMS_201503191809319_ORT_0c8dd0b7-db27-4038-c03b-47d0995e3e13-001-0',
              maskType: 'SOURCE_IMAGE_FOOTPRINT',
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [607059.5, 5004456.0],
                  [604618.5, 5005509.0],
                  [604604.0, 5005515.5],
                ],
                [
                  [607064.0, 5004456.0],
                  [607059.5, 5004456.0],
                ],
              ],
            },
          },
        ],
      } as GeoJsonObject

      const res = await reprojectGeoJSONIfNeeded(geoJson)
      expect(res).toEqual({
        crs: {
          properties: {
            name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
          },
          type: 'name',
        },
        features: [
          {
            geometry: {
              coordinates: [
                [
                  [-109.6372365361107, 45.185457595525556],
                  [-109.6680785388592, 45.19530022763665],
                  [-109.66826172697034, 45.195360874786424],
                ],
                [
                  [-109.63717927173671, 45.185456912107774],
                  [-109.6372365361107, 45.185457595525556],
                ],
              ],
              type: 'Polygon',
            },
            properties: {
              gml_id: 'source_image_footprint-PHR1A_PMS_201503191809319_ORT_0c8dd0b7-db27-4038-c03b-47d0995e3e13-001-0',
              maskType: 'SOURCE_IMAGE_FOOTPRINT',
            },
            type: 'Feature',
          },
        ],
        name: 'MaskFeature',
        type: 'FeatureCollection',
      })
    })

    test('throw when need conversion but fail to find CRS URN', async () => {
      const geoJson = {
        type: 'FeatureCollection',
        name: 'MaskFeature',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[607059.5, 5004456.0]]],
            },
          },
        ],
      } as GeoJsonObject

      expect(reprojectGeoJSONIfNeeded(geoJson)).rejects.toThrowError(
        'CRS URN invalid or missing. Only EPSG namespaces are supported',
      )
    })
  })
})

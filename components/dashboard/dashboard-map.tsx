'use client'

import React from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

import { FlightTrackerOverlay } from './flight-tracker-overlay'

export function DashboardMap() {
  const [isFullscreen, setIsFullscreen] = React.useState(false)


  const mapHtml = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1,maximum-scale=1" />
    <style>html,body,#map{height:100%;margin:0;padding:0}</style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function(){
        try{
          var map = L.map('map', {zoomControl: true, attributionControl: true}).setView([39, -98], 4.5);
          // ESRI Satellite base
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Esri World Imagery'
          }).addTo(map);
          // ArcGIS reference labels overlay for place names
          L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 20,
            attribution: 'Place labels © Esri'
          }).addTo(map);
        } catch (e) { console.error(e) }
      })();
    </script>
  </body>
</html>`
  return (
    <>
      <div
        className={`${
          isFullscreen
            ? 'fixed inset-0 z-50 p-0'
            : 'relative h-[calc(100dvh-120px)] sm:h-[calc(100vh-190px)] min-h-[360px] max-h-[780px]'
        }`}
      >
        <div
          className={`${
            isFullscreen ? 'w-full h-full' : 'p-4 md:p-6 lg:p-8'
          }`}
        >
          <section
            className={`rounded border border-border bg-card overflow-hidden ${
              isFullscreen ? 'h-full' : ''
            }`}
          >
            <div className="px-4 py-3 md:px-5 md:py-4 border-b border-border bg-black text-white flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-semibold break-words">
                  Flight Tracker Map
                </h1>
                <p className="text-xs md:text-sm text-white/70 mt-1 break-words">
                  Live satellite view for routes, airports, and operations
                </p>
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-white/10 rounded transition-colors self-start shrink-0"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            </div>

            <div
              className={`relative bg-black ${
                isFullscreen
                  ? 'h-[calc(100vh-80px)]'
                  : 'h-[calc(100vh-190px)] min-h-[360px] max-h-[780px]'
              }`}
            >
              <iframe
                title="Satellite Flight Operations Map"
                srcDoc={mapHtml}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Tracker UI overlay (populates based on the "first flight" serial rule) */}
              <FlightTrackerOverlay tripId={typeof window !== 'undefined' ? (window as any).__SELECTED_TRIP_ID__ || '' : ''} />


              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-black/5" />

              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </section>
        </div>

        {isFullscreen && (
          <div
            className="fixed inset-0 bg-black/20 -z-10"
            onClick={() => setIsFullscreen(false)}
          />
        )}
      </div>
    </>
  )
}

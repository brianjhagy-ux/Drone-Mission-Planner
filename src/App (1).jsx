import React, { useState, useMemo, useEffect } from 'react';

// ============================================================================
// DRONE FLEET DATABASE
// ============================================================================

const DRONE_FLEET = {
  'm4e': {
    name: 'DJI Matrice 4E',
    shortName: 'M4E',
    category: 'enterprise',
    sensor: {
      name: 'Wide Camera',
      width_mm: 17.3,
      height_mm: 13.0,
      resolution_mp: 50,
      pixels_x: 8192,
      pixels_y: 6144,
      pixel_size_um: 2.11,
    },
    lens: {
      focal_length_mm: 24,
      actual_focal_mm: 12.29,
      aperture_range: [2.8, 11],
      min_focus_m: 1,
    },
    flight: {
      max_flight_time_min: 45,
      max_speed_ms: 23,
      wind_resistance_ms: 12,
    },
    thermal: null,
    multispectral: null,
    capabilities: ['rgb', 'mapping', 'inspection', '3d_model'],
    strengths: ['High resolution', 'Enterprise reliability', 'Long flight time', 'RTK compatible'],
  },
  
  'm4t': {
    name: 'DJI Matrice 4T',
    shortName: 'M4T',
    category: 'enterprise',
    sensor: {
      name: 'Wide Camera',
      width_mm: 17.3,
      height_mm: 13.0,
      resolution_mp: 50,
      pixels_x: 8192,
      pixels_y: 6144,
      pixel_size_um: 2.11,
    },
    thermal: {
      name: 'Thermal Camera',
      resolution: '640×512',
      pixels_x: 640,
      pixels_y: 512,
    },
    multispectral: null,
    lens: {
      focal_length_mm: 24,
      actual_focal_mm: 12.29,
      aperture_range: [2.8, 11],
      min_focus_m: 1,
    },
    flight: {
      max_flight_time_min: 45,
      max_speed_ms: 23,
      wind_resistance_ms: 12,
    },
    capabilities: ['rgb', 'thermal', 'mapping', 'inspection'],
    strengths: ['Thermal imaging', 'RGB + Thermal combo', 'Enterprise grade', 'RTK compatible'],
  },
  
  'm3_multispectral': {
    name: 'DJI Mavic 3 Multispectral',
    shortName: 'M3M',
    category: 'agricultural',
    sensor: {
      name: 'RGB Camera',
      width_mm: 17.3,
      height_mm: 13.0,
      resolution_mp: 20,
      pixels_x: 5280,
      pixels_y: 3956,
      pixel_size_um: 3.28,
    },
    thermal: null,
    multispectral: {
      name: 'Multispectral Array',
      bands: ['Green', 'Red', 'Red Edge', 'NIR'],
      resolution_mp: 5,
    },
    lens: {
      focal_length_mm: 24,
      actual_focal_mm: 12.29,
      aperture_range: [2.8, 11],
      min_focus_m: 1,
    },
    flight: {
      max_flight_time_min: 43,
      max_speed_ms: 21,
      wind_resistance_ms: 12,
    },
    capabilities: ['rgb', 'multispectral', 'ndvi', 'vegetation_analysis', 'mapping'],
    strengths: ['NDVI analysis', 'Crop health', 'Global shutter MS', 'RTK compatible'],
  },
  
  'm3e': {
    name: 'DJI Mavic 3 Enterprise',
    shortName: 'M3E',
    category: 'enterprise',
    sensor: {
      name: 'Wide Camera',
      width_mm: 17.3,
      height_mm: 13.0,
      resolution_mp: 20,
      pixels_x: 5280,
      pixels_y: 3956,
      pixel_size_um: 3.28,
    },
    thermal: null,
    multispectral: null,
    lens: {
      focal_length_mm: 24,
      actual_focal_mm: 12.29,
      aperture_range: [2.8, 11],
      min_focus_m: 1,
    },
    flight: {
      max_flight_time_min: 45,
      max_speed_ms: 21,
      wind_resistance_ms: 12,
    },
    capabilities: ['rgb', 'mapping', 'inspection', '3d_model'],
    strengths: ['Compact enterprise', 'Good resolution', 'RTK compatible', 'Mechanical shutter'],
  },
  
  'm3_classic': {
    name: 'DJI Mavic 3 Classic',
    shortName: 'M3C',
    category: 'prosumer',
    sensor: {
      name: 'Hasselblad Camera',
      width_mm: 17.3,
      height_mm: 13.0,
      resolution_mp: 20,
      pixels_x: 5280,
      pixels_y: 3956,
      pixel_size_um: 3.28,
    },
    thermal: null,
    multispectral: null,
    lens: {
      focal_length_mm: 24,
      actual_focal_mm: 12.29,
      aperture_range: [1.7, 16],
      min_focus_m: 1,
    },
    flight: {
      max_flight_time_min: 46,
      max_speed_ms: 21,
      wind_resistance_ms: 12,
    },
    capabilities: ['rgb', 'mapping', '3d_model', 'video'],
    strengths: ['Excellent image quality', 'Wide aperture', 'Color science', 'Cost effective'],
  },
};

// ============================================================================
// USE CASE DEFINITIONS
// ============================================================================

const USE_CASES = {
  'orthomosaic_standard': {
    name: 'Orthomosaic - Standard',
    description: 'General purpose 2D map for area documentation',
    target_gsd_cm: 2.5,
    gsd_range: [1.5, 3.5],
    front_overlap: 75,
    side_overlap: 70,
    recommended_drones: ['m4e', 'm3e', 'm3_classic'],
    camera_angle: 'nadir',
    priority: 'coverage',
  },
  'orthomosaic_high_detail': {
    name: 'Orthomosaic - High Detail',
    description: 'High resolution mapping for detailed measurements',
    target_gsd_cm: 1.0,
    gsd_range: [0.5, 1.5],
    front_overlap: 80,
    side_overlap: 75,
    recommended_drones: ['m4e', 'm3e'],
    camera_angle: 'nadir',
    priority: 'quality',
  },
  '3d_model_structure': {
    name: '3D Model - Structure/Building',
    description: 'Detailed 3D reconstruction of buildings or structures',
    target_gsd_cm: 1.5,
    gsd_range: [0.8, 2.0],
    front_overlap: 85,
    side_overlap: 80,
    recommended_drones: ['m4e', 'm3e', 'm3_classic'],
    camera_angle: 'oblique',
    camera_angle_degrees: 45,
    oblique_angles: [45, 60],
    priority: 'quality',
    crosshatch: true,
    dji_flight_modes: ['Smart Oblique', 'Smart 3D'],
  },
  '3d_model_terrain': {
    name: '3D Model - Terrain/Landscape',
    description: '3D terrain model for earthwork or landscape',
    target_gsd_cm: 2.0,
    gsd_range: [1.0, 3.0],
    front_overlap: 80,
    side_overlap: 75,
    recommended_drones: ['m4e', 'm3e', 'm3_classic'],
    camera_angle: 'nadir',
    priority: 'coverage',
    crosshatch: true,
  },
  'stockpile_volume': {
    name: 'Stockpile Volume Measurement',
    description: 'Accurate volumetric calculations for material piles',
    target_gsd_cm: 1.5,
    gsd_range: [0.8, 2.0],
    front_overlap: 80,
    side_overlap: 75,
    recommended_drones: ['m4e', 'm3e'],
    camera_angle: 'nadir_plus_oblique',
    camera_angle_degrees: 90,
    oblique_angles: [45],
    priority: 'accuracy',
    crosshatch: true,
    dji_flight_modes: ['Smart Oblique', 'Mapping'],
  },
  'vegetation_ndvi': {
    name: 'Vegetation Analysis (NDVI)',
    description: 'Crop health and vegetation index mapping',
    target_gsd_cm: 5.0,
    gsd_range: [3.0, 8.0],
    front_overlap: 75,
    side_overlap: 70,
    recommended_drones: ['m3_multispectral'],
    camera_angle: 'nadir',
    priority: 'coverage',
    special: 'multispectral',
  },
  'thermal_inspection': {
    name: 'Thermal Inspection',
    description: 'Solar panels, roofs, or electrical infrastructure',
    target_gsd_cm: 3.0,
    gsd_range: [2.0, 5.0],
    front_overlap: 75,
    side_overlap: 70,
    recommended_drones: ['m4t'],
    camera_angle: 'nadir',
    priority: 'coverage',
    special: 'thermal',
  },
  'roof_inspection': {
    name: 'Roof Inspection',
    description: 'Detailed roof documentation for damage assessment',
    target_gsd_cm: 0.8,
    gsd_range: [0.4, 1.2],
    front_overlap: 85,
    side_overlap: 80,
    recommended_drones: ['m4e', 'm4t', 'm3e'],
    camera_angle: 'oblique',
    camera_angle_degrees: 45,
    oblique_angles: [45, 60, 75],
    priority: 'quality',
    dji_flight_modes: ['Smart Oblique', 'Smart 3D'],
  },
  'construction_progress': {
    name: 'Construction Progress',
    description: 'Regular site documentation and comparison',
    target_gsd_cm: 2.0,
    gsd_range: [1.0, 3.0],
    front_overlap: 75,
    side_overlap: 70,
    recommended_drones: ['m4e', 'm3e', 'm3_classic'],
    camera_angle: 'nadir_plus_oblique',
    oblique_angles: [45],
    priority: 'coverage',
  },
  'real_estate': {
    name: 'Real Estate Marketing',
    description: 'Property showcase imagery and basic mapping',
    target_gsd_cm: 3.0,
    gsd_range: [2.0, 5.0],
    front_overlap: 70,
    side_overlap: 65,
    recommended_drones: ['m3_classic', 'm3e'],
    camera_angle: 'nadir_plus_oblique',
    oblique_angles: [30, 45],
    priority: 'aesthetics',
  },
  'facade_inspection': {
    name: 'Facade/Wall Inspection',
    description: 'Vertical structure documentation',
    target_gsd_cm: 0.5,
    gsd_range: [0.3, 1.0],
    front_overlap: 85,
    side_overlap: 80,
    recommended_drones: ['m4e', 'm3e'],
    camera_angle: 'horizontal',
    camera_angle_degrees: 0,
    priority: 'quality',
    dji_flight_modes: ['Linear Flight', 'Smart Oblique'],
  },
  'defensible_space': {
    name: 'Aerial Defensible Space Analysis',
    description: 'Wildfire risk vegetation assessment with RGB and multispectral',
    target_gsd_cm: 3.0,
    gsd_range: [2.0, 5.0],
    front_overlap: 75,
    side_overlap: 70,
    recommended_drones: ['m3_multispectral', 'm4e', 'm3e'],
    camera_angle: 'nadir',
    priority: 'coverage',
    special: 'multispectral_preferred',
    notes: 'Combine RGB ortho with NDVI for vegetation density analysis within defensible space zones',
  },
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

function calculateGSD(sensorWidthMm, focalLengthMm, imageWidthPx, altitudeM) {
  const gsd = (sensorWidthMm * altitudeM * 100) / (focalLengthMm * imageWidthPx);
  return gsd;
}

function calculateAltitudeForGSD(sensorWidthMm, focalLengthMm, imageWidthPx, targetGsdCm) {
  const altitude = (targetGsdCm * focalLengthMm * imageWidthPx) / (sensorWidthMm * 100);
  // Cap altitude at 400 feet (122 meters) per FAA regulations
  const maxAltitudeM = 122;
  return Math.min(altitude, maxAltitudeM);
}

function calculateFlightParameters(areaSqM, gsdCm, frontOverlap, sideOverlap, drone) {
  const sensor = drone.sensor;
  const gsdM = gsdCm / 100;
  
  const imageWidthM = sensor.pixels_x * gsdM;
  const imageHeightM = sensor.pixels_y * gsdM;
  
  const photoIntervalM = imageHeightM * (1 - frontOverlap / 100);
  const lineSpacingM = imageWidthM * (1 - sideOverlap / 100);
  
  const sideLength = Math.sqrt(areaSqM);
  
  const numLines = Math.ceil(sideLength / lineSpacingM);
  const photosPerLine = Math.ceil(sideLength / photoIntervalM);
  const totalPhotos = numLines * photosPerLine;
  
  const lineLengthM = sideLength;
  const turnDistanceM = lineSpacingM * 1.5;
  const totalDistanceM = (numLines * lineLengthM) + ((numLines - 1) * turnDistanceM);
  
  return {
    imageWidthM,
    imageHeightM,
    photoIntervalM,
    lineSpacingM,
    numLines,
    photosPerLine,
    totalPhotos,
    totalDistanceKm: totalDistanceM / 1000,
  };
}

function calculateFlightSpeed(gsdCm, photoIntervalM, shutterSpeed, windSpeed) {
  const minPhotoIntervalSec = 2.0;
  const maxSpeedForPhotoInterval = photoIntervalM / minPhotoIntervalSec;
  
  const pixelSizeM = gsdCm / 100;
  const maxBlurM = pixelSizeM * 0.5;
  const shutterTimeSec = 1 / parseInt(shutterSpeed.split('/')[1]);
  const maxSpeedForBlur = maxBlurM / shutterTimeSec;
  
  let recommendedSpeed = Math.min(maxSpeedForPhotoInterval, maxSpeedForBlur, 15);
  
  // Adjust for wind conditions
  const windAdjustments = {
    calm: 1.0,      // 0-5 mph - no adjustment
    light: 0.9,     // 5-10 mph - slight reduction
    moderate: 0.75, // 10-15 mph - moderate reduction
    strong: 0.6,    // 15-20 mph - significant reduction
  };
  
  recommendedSpeed *= windAdjustments[windSpeed] || 1.0;
  
  return Math.round(recommendedSpeed * 10) / 10;
}

function calculateFlightTime(totalDistanceKm, speedMs, totalPhotos) {
  const flightTimeMin = (totalDistanceKm * 1000 / speedMs) / 60;
  const photoTimeMin = totalPhotos * 0.5 / 60;
  const totalTimeMin = flightTimeMin + photoTimeMin;
  const bufferTimeMin = totalTimeMin * 0.15;
  return Math.ceil(totalTimeMin + bufferTimeMin);
}

function recommendCameraSettings(useCase, lightCondition) {
  const settings = {
    bright: {
      quality: { aperture: 'f/5.6', shutter: '1/800', iso: '100' },
      coverage: { aperture: 'f/5.6', shutter: '1/640', iso: '100' },
      aesthetics: { aperture: 'f/4.0', shutter: '1/1000', iso: '100' },
      accuracy: { aperture: 'f/5.6', shutter: '1/800', iso: '100' },
    },
    overcast: {
      quality: { aperture: 'f/4.0', shutter: '1/500', iso: '200' },
      coverage: { aperture: 'f/4.0', shutter: '1/400', iso: '200' },
      aesthetics: { aperture: 'f/2.8', shutter: '1/640', iso: '200' },
      accuracy: { aperture: 'f/4.0', shutter: '1/500', iso: '200' },
    },
    lowLight: {
      quality: { aperture: 'f/2.8', shutter: '1/320', iso: '400' },
      coverage: { aperture: 'f/2.8', shutter: '1/250', iso: '400' },
      aesthetics: { aperture: 'f/2.8', shutter: '1/400', iso: '400' },
      accuracy: { aperture: 'f/2.8', shutter: '1/320', iso: '400' },
    },
  };
  
  const priority = useCase.priority || 'coverage';
  return settings[lightCondition]?.[priority] || settings.overcast.coverage;
}

function selectBestDrone(useCase, drones) {
  const recommended = useCase.recommended_drones;
  
  const scores = recommended.map(droneId => {
    const drone = drones[droneId];
    let score = 0;
    
    score += drone.sensor.resolution_mp / 10;
    score += drone.flight.max_flight_time_min / 15;
    
    if (useCase.special === 'thermal' && drone.thermal) score += 50;
    if (useCase.special === 'multispectral' && drone.multispectral) score += 50;
    if (useCase.special === 'multispectral_preferred' && drone.multispectral) score += 20;
    
    if (drone.category === 'enterprise') score += 5;
    
    return { droneId, drone, score };
  });
  
  scores.sort((a, b) => b.score - a.score);
  return scores[0];
}

// ============================================================================
// REACT COMPONENTS
// ============================================================================

function DroneCard({ drone, isSelected, onSelect }) {
  return (
    <div 
      onClick={onSelect}
      style={{
        padding: '14px',
        border: isSelected ? '2px solid #3b82f6' : '2px solid #334155',
        borderRadius: '10px',
        backgroundColor: isSelected ? '#1e3a5f' : '#1e293b',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '15px', fontWeight: '600' }}>
            {drone.shortName}
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>{drone.name}</p>
        </div>
        <span style={{
          padding: '3px 6px',
          backgroundColor: drone.category === 'enterprise' ? '#3b82f6' : 
                          drone.category === 'agricultural' ? '#22c55e' : '#f59e0b',
          borderRadius: '4px',
          fontSize: '9px',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: '#fff',
        }}>
          {drone.category}
        </span>
      </div>
      <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
        <div>
          <span style={{ color: '#64748b' }}>Sensor:</span>
          <span style={{ color: '#e2e8f0', marginLeft: '4px' }}>{drone.sensor.resolution_mp}MP</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Flight:</span>
          <span style={{ color: '#e2e8f0', marginLeft: '4px' }}>{drone.flight.max_flight_time_min}min</span>
        </div>
      </div>
      {(drone.thermal || drone.multispectral) && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
          {drone.thermal && (
            <span style={{ padding: '2px 5px', backgroundColor: '#ef4444', borderRadius: '3px', fontSize: '9px', color: '#fff' }}>
              Thermal
            </span>
          )}
          {drone.multispectral && (
            <span style={{ padding: '2px 5px', backgroundColor: '#22c55e', borderRadius: '3px', fontSize: '9px', color: '#fff' }}>
              Multispectral
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function UseCaseCard({ useCase, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '12px',
        border: isSelected ? '2px solid #3b82f6' : '2px solid #334155',
        borderRadius: '8px',
        backgroundColor: isSelected ? '#1e3a5f' : '#1e293b',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '13px', fontWeight: '600' }}>
        {useCase.name}
      </h4>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', lineHeight: '1.4' }}>
        {useCase.description}
      </p>
      <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <span style={{ 
          padding: '2px 6px', 
          backgroundColor: '#334155', 
          borderRadius: '3px', 
          fontSize: '9px', 
          color: '#94a3b8' 
        }}>
          GSD: {useCase.target_gsd_cm}cm
        </span>
        <span style={{ 
          padding: '2px 6px', 
          backgroundColor: '#334155', 
          borderRadius: '3px', 
          fontSize: '9px', 
          color: '#94a3b8' 
        }}>
          {useCase.front_overlap}/{useCase.side_overlap}%
        </span>
      </div>
    </div>
  );
}

function ResultsPanel({ results }) {
  if (!results) return null;
  
  const { drone, useCase, calculations, settings, flightParams, terrainInfo, windInfo } = results;
  
  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '2px solid #3b82f6',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '20px',
        paddingBottom: '14px',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#3b82f6',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}>
          🛩️
        </div>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>Mission Plan</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>{useCase.name}</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Recommended Drone */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Recommended Drone
          </h3>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc' }}>{drone.shortName}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{drone.name}</div>
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {drone.strengths.slice(0, 3).map((s, i) => (
              <span key={i} style={{ 
                padding: '3px 6px', 
                backgroundColor: '#334155', 
                borderRadius: '4px', 
                fontSize: '9px', 
                color: '#e2e8f0' 
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
        
        {/* GSD & Altitude */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#22c55e', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            GSD & Altitude
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                {calculations.gsd.toFixed(2)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>cm/pixel</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>
                {Math.round(calculations.altitude)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>meters AGL ({Math.round(calculations.altitude * 3.281)} ft)</div>
            </div>
          </div>
          {calculations.altitudeCapped && (
            <div style={{ marginTop: '10px', padding: '6px 8px', backgroundColor: '#f59e0b22', border: '1px solid #f59e0b', borderRadius: '4px', fontSize: '9px', color: '#f59e0b' }}>
              ⚠️ Altitude capped at 400ft (122m) - GSD will be better than target
            </div>
          )}
          <div style={{ marginTop: '10px', padding: '6px', backgroundColor: '#0f172a', borderRadius: '4px', fontSize: '9px', color: '#94a3b8' }}>
            Target range: {useCase.gsd_range[0]} - {useCase.gsd_range[1]} cm/px
          </div>
        </div>
        
        {/* Camera Settings */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Camera Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>{settings.aperture}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Aperture</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>{settings.shutter}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Shutter</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>{settings.iso}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>ISO</div>
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '9px', color: '#94a3b8' }}>
            Gimbal: {useCase.camera_angle_degrees !== undefined ? `${useCase.camera_angle_degrees}°` : useCase.camera_angle} | Priority: {useCase.priority}
          </div>
          {useCase.dji_flight_modes && (
            <div style={{ marginTop: '10px', padding: '6px 8px', backgroundColor: '#22c55e22', border: '1px solid #22c55e', borderRadius: '4px' }}>
              <div style={{ fontSize: '9px', color: '#22c55e', marginBottom: '4px' }}>DJI Flight Modes:</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {useCase.dji_flight_modes.map((mode, i) => (
                  <span key={i} style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#22c55e33', 
                    borderRadius: '3px', 
                    fontSize: '10px', 
                    color: '#f8fafc' 
                  }}>
                    {mode}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Overlap Settings */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#a855f7', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Overlap Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#a855f7' }}>{useCase.front_overlap}%</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Front</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>{useCase.side_overlap}%</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Side</div>
            </div>
          </div>
          {useCase.crosshatch && (
            <div style={{ marginTop: '10px', padding: '6px 8px', backgroundColor: '#3b82f622', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '9px', color: '#3b82f6' }}>
              ✓ Crosshatch pattern recommended for best quality
            </div>
          )}
        </div>
        
        {/* Flight Parameters */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#06b6d4', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Flight Parameters
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{flightParams.speed} m/s</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Speed {windInfo.level !== 'calm' && `(${windInfo.level} wind adj.)`}</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{flightParams.estimatedTime} min</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Est. Time</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{flightParams.totalPhotos}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Photos</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>{flightParams.numLines}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Lines</div>
            </div>
          </div>
          {windInfo.advisory && (
            <div style={{ marginTop: '10px', padding: '6px 8px', backgroundColor: windInfo.level === 'strong' ? '#ef444422' : '#f59e0b22', border: `1px solid ${windInfo.level === 'strong' ? '#ef4444' : '#f59e0b'}`, borderRadius: '4px', fontSize: '9px', color: windInfo.level === 'strong' ? '#ef4444' : '#f59e0b' }}>
              ⚠️ {windInfo.advisory}
            </div>
          )}
        </div>
        
        {/* Terrain Follow Info */}
        {terrainInfo.enabled && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#14b8a6', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Terrain Follow
            </h3>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
              {terrainInfo.variation_m}m variation
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
              {terrainInfo.recommendation}
            </div>
            <div style={{ marginTop: '10px', padding: '6px 8px', backgroundColor: '#14b8a622', border: '1px solid #14b8a6', borderRadius: '4px', fontSize: '9px', color: '#14b8a6' }}>
              ✓ Enable terrain follow in DJI Pilot 2 / FlightHub 2
            </div>
          </div>
        )}
        
        {/* Coverage Details */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '14px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ec4899', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Coverage Details
          </h3>
          <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: '1.7' }}>
            <div>Footprint: <strong>{flightParams.imageWidthM.toFixed(1)}m × {flightParams.imageHeightM.toFixed(1)}m</strong></div>
            <div>Photo interval: <strong>{flightParams.photoIntervalM.toFixed(1)}m</strong></div>
            <div>Line spacing: <strong>{flightParams.lineSpacingM.toFixed(1)}m</strong></div>
            <div>Distance: <strong>{flightParams.totalDistanceKm.toFixed(2)} km</strong></div>
          </div>
        </div>
      </div>
      
      {/* Batteries Required */}
      <div style={{ 
        marginTop: '16px', 
        padding: '14px', 
        backgroundColor: '#1e293b', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Batteries: </span>
          <span style={{ color: '#f8fafc', fontSize: '18px', fontWeight: '700', marginLeft: '6px' }}>
            {Math.ceil(flightParams.estimatedTime / (drone.flight.max_flight_time_min * 0.8))}
          </span>
          <span style={{ color: '#64748b', fontSize: '10px', marginLeft: '6px' }}>
            (80% capacity)
          </span>
        </div>
        <div style={{ 
          padding: '6px 12px', 
          backgroundColor: flightParams.estimatedTime <= drone.flight.max_flight_time_min * 0.8 ? '#22c55e' : '#f59e0b',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#fff'
        }}>
          {flightParams.estimatedTime <= drone.flight.max_flight_time_min * 0.8 ? 'Single Flight' : 'Multi-Battery'}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function DroneMissionPlanner() {
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [areaSize, setAreaSize] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [lightCondition, setLightCondition] = useState('overcast');
  const [autoSelectDrone, setAutoSelectDrone] = useState(true);
  const [windSpeed, setWindSpeed] = useState('calm');
  const [terrainFollow, setTerrainFollow] = useState(false);
  const [terrainVariation, setTerrainVariation] = useState('');
  
  // Notify parent page of height changes (for iframe embed on aircaptures.com)
  useEffect(() => {
    let lastHeight = 0;
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      if (height !== lastHeight) {
        lastHeight = height;
        window.parent.postMessage({ iframeHeight: height }, '*');
      }
    };
    sendHeight();
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const areaSqM = useMemo(() => {
    const value = parseFloat(areaSize) || 0;
    const conversions = { acres: 4046.86, sqft: 0.0929, sqm: 1, hectares: 10000 };
    return value * conversions[areaUnit];
  }, [areaSize, areaUnit]);
  
  const results = useMemo(() => {
    if (!selectedUseCase || areaSqM <= 0) return null;
    
    const useCase = USE_CASES[selectedUseCase];
    let drone;
    
    if (autoSelectDrone) {
      const selection = selectBestDrone(useCase, DRONE_FLEET);
      drone = selection.drone;
    } else if (selectedDrone) {
      drone = DRONE_FLEET[selectedDrone];
    } else {
      return null;
    }
    
    const uncappedAltitude = (useCase.target_gsd_cm * drone.lens.actual_focal_mm * drone.sensor.pixels_x) / (drone.sensor.width_mm * 100);
    const altitude = calculateAltitudeForGSD(
      drone.sensor.width_mm,
      drone.lens.actual_focal_mm,
      drone.sensor.pixels_x,
      useCase.target_gsd_cm
    );
    const altitudeCapped = uncappedAltitude > 122;
    
    const gsd = calculateGSD(
      drone.sensor.width_mm,
      drone.lens.actual_focal_mm,
      drone.sensor.pixels_x,
      altitude
    );
    
    const settings = recommendCameraSettings(useCase, lightCondition);
    
    const flightCalcs = calculateFlightParameters(
      areaSqM,
      gsd,
      useCase.front_overlap,
      useCase.side_overlap,
      drone
    );
    
    const speed = calculateFlightSpeed(gsd, flightCalcs.photoIntervalM, settings.shutter, windSpeed);
    const estimatedTime = calculateFlightTime(flightCalcs.totalDistanceKm, speed, flightCalcs.totalPhotos);
    
    // Terrain follow considerations
    const terrainInfo = terrainFollow && terrainVariation ? {
      enabled: true,
      variation_m: parseFloat(terrainVariation) || 0,
      recommendation: parseFloat(terrainVariation) > 30 
        ? 'Consider multiple flights at different base altitudes for extreme terrain'
        : parseFloat(terrainVariation) > 15
        ? 'Terrain follow recommended - ensure DEM/DSM is loaded in flight app'
        : 'Terrain follow optional for mild elevation changes',
    } : { enabled: false };
    
    // Wind advisory
    const windInfo = {
      level: windSpeed,
      advisory: windSpeed === 'strong' 
        ? 'Consider postponing - reduced quality likely'
        : windSpeed === 'moderate'
        ? 'Flyable but expect some image softness'
        : null,
    };
    
    return {
      drone,
      useCase,
      calculations: { gsd, altitude, altitudeCapped },
      settings,
      flightParams: { ...flightCalcs, speed, estimatedTime },
      terrainInfo,
      windInfo,
    };
  }, [selectedUseCase, selectedDrone, areaSqM, lightCondition, autoSelectDrone]);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '24px',
    }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '26px', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Drone Mission Planner
        </h1>
        <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          AirCaptures Flight Planning System
        </p>
      </header>
      
      {/* Input Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#1e293b',
        borderRadius: '10px',
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Area Size
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="number"
              value={areaSize}
              onChange={(e) => setAreaSize(e.target.value)}
              placeholder="Size"
              style={{ 
                flex: 1, 
                minWidth: 0,
                background: '#0f172a', 
                border: '1px solid #334155', 
                color: '#f8fafc', 
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
            <select 
              value={areaUnit} 
              onChange={(e) => setAreaUnit(e.target.value)}
              style={{ 
                background: '#0f172a', 
                border: '1px solid #334155', 
                color: '#f8fafc', 
                padding: '8px',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              <option value="acres">Acres</option>
              <option value="sqft">Sq Ft</option>
              <option value="sqm">Sq M</option>
              <option value="hectares">Ha</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Lighting
          </label>
          <select 
            value={lightCondition} 
            onChange={(e) => setLightCondition(e.target.value)} 
            style={{ 
              width: '100%',
              background: '#0f172a', 
              border: '1px solid #334155', 
              color: '#f8fafc', 
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            <option value="bright">Bright / Sunny</option>
            <option value="overcast">Overcast</option>
            <option value="lowLight">Low Light</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Wind Conditions
          </label>
          <select 
            value={windSpeed} 
            onChange={(e) => setWindSpeed(e.target.value)} 
            style={{ 
              width: '100%',
              background: '#0f172a', 
              border: '1px solid #334155', 
              color: '#f8fafc', 
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            <option value="calm">Calm (0-5 mph)</option>
            <option value="light">Light (5-10 mph)</option>
            <option value="moderate">Moderate (10-15 mph)</option>
            <option value="strong">Strong (15-20 mph)</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Drone Selection
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 0' }}>
            <input
              type="checkbox"
              checked={autoSelectDrone}
              onChange={(e) => setAutoSelectDrone(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
            />
            <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Auto-select best</span>
          </label>
        </div>
      </div>
      
      {/* Terrain Follow Section */}
      <div style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '14px 16px',
        backgroundColor: '#1e293b',
        borderRadius: '10px',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={terrainFollow}
            onChange={(e) => setTerrainFollow(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#22c55e' }}
          />
          <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Terrain Follow Mode</span>
        </label>
        
        {terrainFollow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Elevation variation:</label>
            <input
              type="number"
              value={terrainVariation}
              onChange={(e) => setTerrainVariation(e.target.value)}
              placeholder="meters"
              style={{ 
                width: '80px',
                background: '#0f172a', 
                border: '1px solid #334155', 
                color: '#f8fafc', 
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>m (max elevation change in AOI)</span>
          </div>
        )}
      </div>
      
      {/* Use Case Selection */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>
          Mission Type
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {Object.entries(USE_CASES).map(([id, useCase]) => (
            <UseCaseCard
              key={id}
              useCase={useCase}
              isSelected={selectedUseCase === id}
              onSelect={() => setSelectedUseCase(id)}
            />
          ))}
        </div>
      </section>
      
      {/* Drone Fleet (when manual selection) */}
      {!autoSelectDrone && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>
            Select Drone
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.entries(DRONE_FLEET).map(([id, drone]) => (
              <DroneCard
                key={id}
                drone={drone}
                isSelected={selectedDrone === id}
                onSelect={() => setSelectedDrone(id)}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Results Panel */}
      <ResultsPanel results={results} />
      
      {/* Footer */}
      <footer style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #334155', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '11px' }}>
          Drone Mission Planner v1.0 • AirCaptures
        </p>
      </footer>
    </div>
  );
}
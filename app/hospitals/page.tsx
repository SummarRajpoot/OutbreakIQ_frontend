'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

interface Hospital {
  id: number;
  name: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  type: string;
  diseases: string[];
  emergency: boolean;
  beds: number;
  rating: number;
  can_treat?: boolean;
}

export default function HospitalFinderPage() {
  const [cities, setCities] = useState<string[]>([]);
  const [diseases, setDiseases] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Initial Pakistan center
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.3753, 69.3451]);
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    // Fetch filter data
    const fetchFilters = async () => {
      try {
        const [citiesRes, diseasesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/hospitals/cities'),
          fetch('http://127.0.0.1:8000/api/hospitals/diseases')
        ]);
        setCities(await citiesRes.json());
        setDiseases(await diseasesRes.json());
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    // Fetch hospitals based on filters
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (selectedCity) query.append('city', selectedCity);
        if (selectedDisease) query.append('disease', selectedDisease);
        
        const res = await fetch(`http://127.0.0.1:8000/api/hospitals/?${query.toString()}`);
        const data = await res.json();
        setHospitals(data);

        // If a specific city is selected, center the map on the first hospital of that city
        if (selectedCity && data.length > 0) {
          setMapCenter([data[0].lat, data[0].lng]);
          setMapZoom(12);
        } else if (!selectedCity) {
          setMapCenter([30.3753, 69.3451]);
          setMapZoom(6);
        }
      } catch (err) {
        console.error("Failed to fetch hospitals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, [selectedCity, selectedDisease]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-2">
            Hospital Finder
          </h1>
          <p className="text-slate-400 text-lg">
            Locate specialized medical facilities across Pakistan and check treatment availability.
          </p>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Filter by City</label>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
            >
              <option value="">All Cities</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Filter by Disease Specialist</label>
            <select 
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
            >
              <option value="">All Diseases</option>
              {diseases.map(disease => <option key={disease} value={disease}>{disease}</option>)}
            </select>
          </div>
        </div>

        {/* Map Container */}
        <div className="mb-12">
          <MapComponent 
            hospitals={hospitals} 
            center={mapCenter} 
            zoom={mapZoom} 
          />
        </div>

        {/* Hospital Cards List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              Nearby Facilities
              <span className="bg-slate-800 text-teal-400 text-sm px-3 py-1 rounded-full border border-teal-500/30">
                {hospitals.length} Found
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-slate-800/50 h-48 rounded-2xl animate-pulse border border-slate-700"></div>
              ))
            ) : hospitals.length > 0 ? (
              hospitals.map((hospital) => (
                <div 
                  key={hospital.id} 
                  className="bg-slate-800/40 border border-slate-700 hover:border-teal-500/50 rounded-2xl p-6 transition-all group backdrop-blur-sm shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors">{hospital.name}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${hospital.can_treat ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {hospital.can_treat ? 'Can Treat ✅' : 'Not Equipped ❌'}
                      </span>
                      <span className="bg-slate-700/50 text-slate-400 px-2 py-1 rounded text-[10px] font-medium border border-slate-600/30">
                        {hospital.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6 text-sm">
                    <p className="text-slate-400 flex items-center gap-2">
                      <span className="text-teal-500">📍</span> {hospital.address}
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <span className="text-teal-500">📞</span> {hospital.phone}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <p className="text-slate-300">
                        <strong className="text-slate-500 mr-1">Beds:</strong> {hospital.beds}
                      </p>
                      <p className="text-slate-300">
                        <strong className="text-slate-500 mr-1">Rating:</strong> {'⭐'.repeat(hospital.rating)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {hospital.diseases.map(d => (
                      <span key={d} className="bg-slate-700/30 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-600/20">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                <p className="text-slate-500 text-lg italic">No hospitals found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

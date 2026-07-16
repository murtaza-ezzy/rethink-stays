import { useState, useEffect } from 'react';
import { 
  Hotel, 
  Users, 
  Calendar, 
  Info, 
  Calculator, 
  Lightbulb, 
  Code, 
  BarChart3, 
  MapPin, 
  Thermometer, 
  CheckCircle2, 
  Globe,
  Leaf,
  Layers,
  ClipboardCheck,
  Copy
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.rethinktravel.org/api';

const countries = ['India', 'USA', 'Canada', 'Global'];

const states: Record<string, string[]> = {
  'India': [
    'National Average', 'Jharkhand', 'Chhattisgarh', 'West Bengal', 'Bihar', 'Uttar Pradesh', 
    'Delhi', 'Maharashtra', 'Rajasthan', 'Goa', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 
    'Telangana', 'Gujarat', 'Odisha', 'Punjab', 'Kerala', 'Himachal Pradesh', 'Uttarakhand', 'Sikkim'
  ],
  'USA': [
    'National Average', 'Wyoming', 'West Virginia', 'Kentucky', 'Missouri', 'Indiana', 'Utah', 
    'North Dakota', 'Kansas', 'Nebraska', 'Ohio', 'Colorado', 'Minnesota', 'Texas', 'Arizona', 
    'Florida', 'Michigan', 'Georgia', 'Pennsylvania', 'Illinois', 'Massachusetts', 'California', 
    'Oregon', 'New York', 'Washington', 'Vermont', 'Idaho'
  ],
  'Canada': [
    'National Average', 'Nova Scotia', 'Alberta', 'Saskatchewan', 'New Brunswick', 'Ontario', 
    'Prince Edward Island', 'Quebec', 'Manitoba', 'British Columbia', 'Newfoundland and Labrador', 
    'Yukon', 'Northwest Territories', 'Nunavut'
  ]
};

const climateZones = [
  { code: 'Af', name: 'Tropical Rainforest (e.g., Singapore, Mumbai)' },
  { code: 'Am', name: 'Tropical Monsoon (e.g., Chennai, Kolkata)' },
  { code: 'Aw', name: 'Tropical Savanna (e.g., Delhi, Bangkok)' },
  { code: 'BWh', name: 'Hot Desert (e.g., Dubai, Phoenix)' },
  { code: 'BSh', name: 'Hot Semi-Arid (e.g., Hyderabad)' },
  { code: 'Csa', name: 'Mediterranean (e.g., Los Angeles)' },
  { code: 'Cfa', name: 'Humid Subtropical (e.g., New York, Tokyo)' },
  { code: 'Cfb', name: 'Oceanic (e.g., London, Seattle)' },
  { code: 'Dfa', name: 'Hot Summer Continental (e.g., Chicago, Toronto)' },
  { code: 'Dfb', name: 'Warm Summer Continental (e.g., Montreal, Boston)' },
  { code: 'Dfc', name: 'Subarctic (e.g., Fairbanks)' },
  { code: 'ET', name: 'Tundra (e.g., Iqaluit)' }
];

const accommodationTypes = [
  'Hostel',
  'Homestay',
  'AirBnb or Similar',
  '3-star hotel',
  'Resort',
  '5-star hotel',
  'Luxury Resort',
  'Service Apartment'
];

interface EmissionsData {
  total_emissions_kg_co2e: number;
  per_person_kg_co2e: number;
  per_person_per_day_kg_co2e: number;
  room_nights: number;
  grid_factor_used: number;
  climate_multiplier_used: number;
  cost: number;
  breakdown: {
    electricity: number;
    water: number;
    waste: number;
    laundry: number;
    hvac: number;
    foodService: number;
    cleaning: number;
  };
  comparisons: {
    countries: Array<{ countryName: string; factor: number; total: number }>;
    states: Array<{ stateName: string; factor: number; total: number }>;
  };
}

export default function App() {
  const [accommodationType, setAccommodationType] = useState('3-star hotel');
  const [numberOfDays, setNumberOfDays] = useState(2);
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [country, setCountry] = useState('India');
  const [stateProvince, setStateProvince] = useState('Maharashtra');
  const [climateZone, setClimateZone] = useState('Am');
  const [activeTab, setActiveTab] = useState('calculator');
  const [copied, setCopied] = useState(false);

  const [emissions, setEmissions] = useState<EmissionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStates = () => {
    return states[country] || ['National Average'];
  };

  useEffect(() => {
    let active = true;
    const fetchEmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/offset/calculate-stay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accommodation_type: accommodationType,
            number_of_days: numberOfDays,
            number_of_rooms: numberOfRooms,
            number_of_people: numberOfPeople,
            country: country,
            state_province: stateProvince,
            climate_zone: climateZone
          })
        });

        if (!response.ok) {
          throw new Error('Failed to calculate emissions');
        }

        const resData = await response.json();
        if (active) {
          if (resData.success) {
            setEmissions(resData.data);
          } else {
            throw new Error('Server returned an error');
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Something went wrong');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchEmissions();
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [accommodationType, numberOfDays, numberOfRooms, numberOfPeople, country, stateProvince, climateZone]);

  const categoryNames: Record<string, string> = {
    electricity: 'Electricity Usage',
    water: 'Water Supply',
    waste: 'Waste Disposal',
    laundry: 'Linens & Laundry',
    hvac: 'HVAC Heating/Cooling',
    foodService: 'Food & Beverage',
    cleaning: 'Housekeeping'
  };

  const tips: Record<string, string[]> = {
    electricity: [
      'Turn off AC, TV, and lights when leaving your room - Save 10-15%',
      'Use natural daylight when possible instead of overhead lighting - Save 5-8%',
      'Set the thermostat to 24°C rather than 18°C - Save 15-20% on cooling load'
    ],
    water: [
      'Take shorter showers (5 minutes vs 10 minutes) - Save 20-30% of warm water usage',
      'Keep the tap closed while brushing teeth or shaving'
    ],
    laundry: [
      'Reuse towels and bed linens for multiple days - Save 40-50% on laundry footprint',
      'Decline daily housekeeping to save cleaning chemicals and energy'
    ],
    hvac: [
      'Keep curtains or blinds closed during peak hot hours to reduce heat gain',
      'Keep balcony doors and windows tightly shut when climate control is active'
    ]
  };

  const handleCopy = () => {
    const apiPayload = JSON.stringify({
      accommodation_type: accommodationType,
      number_of_days: numberOfDays,
      number_of_rooms: numberOfRooms,
      number_of_people: numberOfPeople,
      country: country,
      state_province: stateProvince,
      climate_zone: climateZone
    }, null, 2);
    
    navigator.clipboard.writeText(apiPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-200">
      {/* Top Brand Banner */}
      <div className="bg-[#14532d] text-white py-2 px-4 text-xs font-semibold text-center tracking-wide flex items-center justify-center gap-1.5 shadow-sm">
        <Leaf className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
        RETHINK CARBON ACCOMMODATION CALCULATOR v1.0
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <Hotel className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">ReThink Stay</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Demo Mode</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Multi-country, state-specific, and climate-adjusted carbon offset protocol</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-center">
            {[
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'comparison', label: 'Comparisons', icon: BarChart3 },
              { id: 'tips', label: 'Reduction Tips', icon: Lightbulb },
              { id: 'api', label: 'API Specs', icon: Code }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card 1: Location & Climate */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <MapPin className="w-5 h-5 text-emerald-600" />
                1. Location & Climate Context
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Country</label>
                    <select 
                      value={country}
                      onChange={(e) => { setCountry(e.target.value); setStateProvince('National Average'); }}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                    >
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">State / Province</label>
                    <select 
                      value={stateProvince}
                      onChange={(e) => setStateProvince(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={country === 'Global'}
                    >
                      {getStates().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                    Köppen Climate Classification (HVAC Impact)
                  </label>
                  <select 
                    value={climateZone}
                    onChange={(e) => setClimateZone(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                  >
                    {climateZones.map(zone => (
                      <option key={zone.code} value={zone.code}>{zone.code} — {zone.name}</option>
                    ))}
                  </select>
                </div>

                {emissions && (
                  <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-emerald-800">
                    <div>
                      <strong className="font-semibold block text-[11px] uppercase tracking-wider text-emerald-900 mb-0.5">Parameters Applied:</strong>
                      <span className="opacity-90">{country} {stateProvince !== 'National Average' && `(${stateProvince})`} • {climateZone} Climate</span>
                    </div>
                    <div className="flex gap-4 font-mono text-[11px] bg-white px-3 py-1.5 rounded-lg border border-emerald-100">
                      <div>GRID: <span className="font-bold text-emerald-700">{emissions.grid_factor_used.toFixed(3)} t/MWh</span></div>
                      <div>HVAC: <span className="font-bold text-emerald-700">{emissions.climate_multiplier_used.toFixed(2)}x</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Accommodation & Stay Details */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Globe className="w-5 h-5 text-emerald-600" />
                2. Accommodation & Stay parameters
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Accommodation Category</label>
                  <select 
                    value={accommodationType}
                    onChange={(e) => setAccommodationType(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                  >
                    {accommodationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Stay Duration (Days)
                    </label>
                    <input 
                      type="number" min="1" value={numberOfDays}
                      onChange={(e) => setNumberOfDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5 text-slate-400" /> Number of Rooms
                    </label>
                    <input 
                      type="number" min="1" value={numberOfRooms}
                      onChange={(e) => setNumberOfRooms(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Total Guests
                    </label>
                    <input 
                      type="number" min="1" value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-800 text-xs font-semibold">
                Calculation error: {error}. Please verify the backend connection.
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className={`space-y-6 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                {emissions ? (
                  <>
                    {/* Summary Banner */}
                    <div className="bg-gradient-to-br from-emerald-800 to-teal-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900">
                      <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10">
                        <Leaf className="w-64 h-64 text-white" />
                      </div>

                      <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Stay Carbon Footprint
                      </span>
                      
                      <h3 className="text-sm font-medium opacity-75">Calculated Emissions</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-5xl font-extrabold font-heading tracking-tight">
                          {emissions.total_emissions_kg_co2e.toFixed(1)}
                        </span>
                        <span className="text-lg font-bold opacity-90">kg CO₂e</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
                        <div>
                          <span className="text-[11px] opacity-70 block uppercase font-bold tracking-wider">Per Person</span>
                          <span className="text-lg font-bold">{emissions.per_person_kg_co2e.toFixed(1)} kg</span>
                        </div>
                        <div>
                          <span className="text-[11px] opacity-70 block uppercase font-bold tracking-wider">Per Person / Day</span>
                          <span className="text-lg font-bold">{emissions.per_person_per_day_kg_co2e.toFixed(1)} kg</span>
                        </div>
                      </div>

                      <div className="mt-6 bg-white/5 rounded-2xl p-3 border border-white/5 text-[11px] opacity-90 flex justify-between">
                        <span>Room Nights: <strong>{emissions.room_nights}</strong></span>
                        <span>Offset Cost: <strong>₹{emissions.cost}</strong></span>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        Impact Breakdown by Source
                      </h3>
                      
                      <div className="space-y-4">
                        {Object.entries(emissions.breakdown)
                          .filter(([_, val]) => val > 0)
                          .map(([cat, val]) => {
                            const percentage = ((val / emissions.total_emissions_kg_co2e) * 100) || 0;
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-slate-600">{categoryNames[cat] || cat}</span>
                                  <span className="text-slate-800">{val.toFixed(1)} kg CO₂e ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 text-sm font-semibold">Fetching stay emissions from server...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comparison' && (
              <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100 space-y-8 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2 font-heading">Region-to-Region Comparisons</h2>
                  <p className="text-slate-500 text-sm">See how grid factors and infrastructure heavily shift emissions for the exact same stay duration.</p>
                </div>

                {emissions ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Country Baseline Impact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {emissions.comparisons?.countries?.map(({ countryName, factor, total }) => {
                          const isEmerald = countryName === 'India';
                          const isBlue = countryName === 'USA';
                          const bg = isEmerald 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                            : isBlue 
                              ? 'bg-blue-50 border-blue-100 text-blue-800' 
                              : 'bg-teal-50 border-teal-100 text-teal-800';
                          return (
                            <div key={countryName} className={`rounded-2xl p-5 border ${bg}`}>
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">{countryName} (National)</span>
                                <span className="font-mono text-xs opacity-75">{factor.toFixed(3)} t/MWh</span>
                              </div>
                              <p className="text-3xl font-extrabold tracking-tight mt-3 font-heading">{total.toFixed(1)}</p>
                              <p className="text-xs opacity-80 font-medium">kg CO₂e total footprint</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">State Impact (India Case Example)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {emissions.comparisons?.states?.map(({ stateName, factor, total }) => {
                          const isSikkim = stateName.includes('Sikkim');
                          const isMaha = stateName.includes('Maharashtra');
                          const colorClass = isSikkim 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                            : isMaha 
                              ? 'text-amber-800 bg-amber-500/10 border-amber-200' 
                              : 'text-rose-800 bg-rose-50 border-rose-100';
                          return (
                            <div key={stateName} className={`rounded-2xl p-5 border ${colorClass}`}>
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs">{stateName}</span>
                                <span className="font-mono text-xs opacity-75">{factor.toFixed(3)}</span>
                              </div>
                              <p className="text-3xl font-extrabold tracking-tight mt-3 font-heading">{total.toFixed(1)}</p>
                              <p className="text-xs opacity-80 font-medium">kg CO₂e relative baseline</p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs flex gap-3 text-slate-600">
                        <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p>
                          <strong>7x Grid Variance:</strong> States like Sikkim rely entirely on hydro resources, resulting in much cleaner power. Choosing hotels operating in regions with progressive grid factor profiles or green tariffs drastically reduces carbon liability.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 text-xs">Loading comparison details...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2 font-heading">Reducing Your Stay Footprint</h2>
                  <p className="text-slate-500 text-sm">Actionable mitigation steps you can take as a guest to minimize impact.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(tips).map(([category, tipsList]) => (
                    <div key={category} className="border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all duration-200">
                      <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        {categoryNames[category] || category}
                      </h3>
                      <ul className="space-y-3">
                        {tipsList.map((tip, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 font-heading">API Calculation Specification</h2>
                    <p className="text-slate-500 text-sm">Send POST payloads to calculate accommodation offsets dynamically.</p>
                  </div>
                  
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-500/10 rounded-xl text-xs font-semibold text-slate-700 transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied Payload!' : 'Copy Request Body'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-900 font-mono text-xs">
                    <div className="bg-slate-900 px-4 py-2 text-slate-400 border-b border-slate-800 flex items-center justify-between text-[11px]">
                      <span>ENDPOINT</span>
                      <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">POST</span>
                    </div>
                    <div className="p-4 text-slate-300">
                      <p className="text-slate-500 mb-2"># Request Target</p>
                      <p className="text-emerald-400 mb-4">{API_BASE_URL}/offset/calculate-stay</p>
                      
                      <p className="text-slate-500 mb-2"># Request Body</p>
                      <pre className="text-indigo-300">{`{
  "accommodation_type": "${accommodationType}",
  "number_of_days": ${numberOfDays},
  "number_of_rooms": ${numberOfRooms},
  "number_of_people": ${numberOfPeople},
  "country": "${country}",
  "state_province": "${stateProvince}",
  "climate_zone": "${climateZone}"
}`}</pre>
                    </div>
                  </div>

                  {emissions && (
                    <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-900 font-mono text-xs">
                      <div className="bg-slate-900 px-4 py-2 text-slate-400 border-b border-slate-800 flex items-center justify-between text-[11px]">
                        <span>RESPONSE SCHEMA</span>
                        <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded">200 OK</span>
                      </div>
                      <div className="p-4">
                        <pre className="text-slate-300">{`{
  "success": true,
  "data": {
    "total_emissions_kg_co2e": ${emissions.total_emissions_kg_co2e.toFixed(2)},
    "per_person_kg_co2e": ${emissions.per_person_kg_co2e.toFixed(2)},
    "per_person_per_day_kg_co2e": ${emissions.per_person_per_day_kg_co2e.toFixed(2)},
    "room_nights": ${emissions.room_nights},
    "grid_factor_used": ${emissions.grid_factor_used.toFixed(3)},
    "climate_multiplier_used": ${emissions.climate_multiplier_used.toFixed(2)},
    "cost": ${emissions.cost},
    "methodology": {
      "framework": "GHG Protocol Scope 3 + HCMI v2.0",
      "standards": ["ISO 14064-1", "DEFRA 2023", "Cornell CHSB 2024"]
    }
  }
}`}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

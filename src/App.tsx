import { useState } from 'react';
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

// Grid factors by country (tCO2/MWh)
const gridFactors: Record<string, { national: number; states?: Record<string, number>; provinces?: Record<string, number> }> = {
  'India': {
    national: 0.727,
    states: {
      'National Average': 0.727,
      'Jharkhand': 1.050, 
      'Chhattisgarh': 0.980, 
      'West Bengal': 0.920,
      'Bihar': 0.880, 
      'Uttar Pradesh': 0.850, 
      'Delhi': 0.820,
      'Maharashtra': 0.800, 
      'Rajasthan': 0.780, 
      'Goa': 0.760,
      'Karnataka': 0.680, 
      'Tamil Nadu': 0.650, 
      'Andhra Pradesh': 0.620,
      'Telangana': 0.600, 
      'Gujarat': 0.580, 
      'Odisha': 0.550,
      'Punjab': 0.480, 
      'Kerala': 0.420, 
      'Himachal Pradesh': 0.280,
      'Uttarakhand': 0.260, 
      'Sikkim': 0.150
    }
  },
  'USA': {
    national: 0.389,
    states: {
      'National Average': 0.389,
      'Wyoming': 0.825, 
      'West Virginia': 0.786, 
      'Kentucky': 0.748,
      'Missouri': 0.712, 
      'Indiana': 0.695, 
      'Utah': 0.682,
      'North Dakota': 0.671, 
      'Kansas': 0.645, 
      'Nebraska': 0.638,
      'Ohio': 0.615, 
      'Colorado': 0.595, 
      'Minnesota': 0.485,
      'Texas': 0.425, 
      'Arizona': 0.418, 
      'Florida': 0.398,
      'Michigan': 0.382, 
      'Georgia': 0.368, 
      'Pennsylvania': 0.345,
      'Illinois': 0.328, 
      'Massachusetts': 0.312, 
      'California': 0.241,
      'Oregon': 0.198, 
      'New York': 0.188, 
      'Washington': 0.095,
      'Vermont': 0.012, 
      'Idaho': 0.082
    }
  },
  'Canada': {
    national: 0.120,
    provinces: {
      'National Average': 0.120,
      'Nova Scotia': 0.680, 
      'Alberta': 0.570, 
      'Saskatchewan': 0.560, 
      'New Brunswick': 0.285, 
      'Ontario': 0.040, 
      'Prince Edward Island': 0.015,
      'Quebec': 0.003, 
      'Manitoba': 0.002, 
      'British Columbia': 0.011,
      'Newfoundland and Labrador': 0.025, 
      'Yukon': 0.095,
      'Northwest Territories': 0.185, 
      'Nunavut': 0.780
    }
  },
  'Global': { national: 0.445 }
};

// Climate multipliers
const climateData: Record<string, { name: string; mult: number }> = {
  'Af': { name: 'Tropical Rainforest (e.g., Singapore, Mumbai)', mult: 1.35 },
  'Am': { name: 'Tropical Monsoon (e.g., Chennai, Kolkata)', mult: 1.28 },
  'Aw': { name: 'Tropical Savanna (e.g., Delhi, Bangkok)', mult: 1.22 },
  'BWh': { name: 'Hot Desert (e.g., Dubai, Phoenix)', mult: 1.45 },
  'BSh': { name: 'Hot Semi-Arid (e.g., Hyderabad)', mult: 1.30 },
  'Csa': { name: 'Mediterranean (e.g., Los Angeles)', mult: 0.85 },
  'Cfa': { name: 'Humid Subtropical (e.g., New York, Tokyo)', mult: 1.12 },
  'Cfb': { name: 'Oceanic (e.g., London, Seattle)', mult: 0.75 },
  'Dfa': { name: 'Hot Summer Continental (e.g., Chicago, Toronto)', mult: 1.25 },
  'Dfb': { name: 'Warm Summer Continental (e.g., Montreal, Boston)', mult: 1.18 },
  'Dfc': { name: 'Subarctic (e.g., Fairbanks)', mult: 1.35 },
  'ET': { name: 'Tundra (e.g., Iqaluit)', mult: 1.50 }
};

// Base accommodation data (kg CO2e per room per night, India baseline)
const accommodationData: Record<string, {
  total: number;
  electricity: number;
  water: number;
  waste: number;
  laundry: number;
  hvac: number;
  foodService?: number;
  cleaning?: number;
  occupancy: number;
}> = {
  'Hostel': {
    total: 6.5,
    electricity: 2.6, water: 0.65, waste: 0.52, laundry: 1.95, hvac: 0.78, occupancy: 6
  },
  'Homestay': {
    total: 8.2,
    electricity: 3.28, water: 1.15, waste: 0.74, laundry: 2.05, hvac: 0.98, occupancy: 2
  },
  'AirBnb or Similar': {
    total: 12.5,
    electricity: 5.0, water: 1.88, waste: 1.25, laundry: 2.5, hvac: 1.25, cleaning: 0.62, occupancy: 4
  },
  '3-star hotel': {
    total: 25.0,
    electricity: 10.0, water: 3.75, waste: 2.5, laundry: 6.25, hvac: 2.0, foodService: 0.5, occupancy: 2
  },
  'Resort': {
    total: 45.0,
    electricity: 18.0, water: 9.0, waste: 4.5, laundry: 9.0, hvac: 3.15, foodService: 1.35, occupancy: 2
  },
  '5-star hotel': {
    total: 60.0,
    electricity: 24.0, water: 10.8, waste: 6.0, laundry: 13.2, hvac: 4.2, foodService: 1.8, occupancy: 2
  },
  'Luxury Resort': {
    total: 85.0,
    electricity: 34.0, water: 17.0, waste: 8.5, laundry: 17.0, hvac: 5.95, foodService: 2.55, occupancy: 2
  },
  'Service Apartment': {
    total: 15.0,
    electricity: 6.0, water: 2.7, waste: 1.5, laundry: 3.0, hvac: 1.35, cleaning: 0.45, occupancy: 4
  }
};

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

  const getStates = () => {
    if (country === 'India') return Object.keys(gridFactors.India.states || {});
    if (country === 'USA') return Object.keys(gridFactors.USA.states || {});
    if (country === 'Canada') return Object.keys(gridFactors.Canada.provinces || {});
    return ['National Average'];
  };

  const getGridFactor = () => {
    if (!country || country === 'Global') return gridFactors.Global.national;
    const countryData = gridFactors[country];
    if (!countryData) return gridFactors.Global.national;

    if (stateProvince && stateProvince !== 'National Average') {
      const stateKey = country === 'Canada' ? 'provinces' : 'states';
      const provincesOrStates = countryData[stateKey];
      if (provincesOrStates && provincesOrStates[stateProvince] !== undefined) {
        return provincesOrStates[stateProvince];
      }
    }
    return countryData.national;
  };

  const calculate = () => {
    const base = accommodationData[accommodationType];
    const gridFactor = getGridFactor();
    const nationalGrid = country && gridFactors[country] ? gridFactors[country].national : gridFactors.Global.national;
    const climateMult = climateData[climateZone]?.mult || 1.0;

    const electricityAdj = base.electricity * (gridFactor / nationalGrid);
    const hvacAdj = base.hvac * climateMult;

    const totalPerRoom = 
      electricityAdj +
      base.water +
      base.waste +
      base.laundry +
      hvacAdj +
      (base.foodService || 0) +
      (base.cleaning || 0);

    const roomNights = numberOfRooms * numberOfDays;
    const total = totalPerRoom * roomNights;
    const perPerson = total / numberOfPeople;
    const perPersonPerDay = perPerson / numberOfDays;

    return {
      totalPerRoom, roomNights, total, perPerson, perPersonPerDay,
      electricityAdj, hvacAdj, gridFactor, climateMult,
      breakdown: {
        electricity: electricityAdj * roomNights,
        water: base.water * roomNights,
        waste: base.waste * roomNights,
        laundry: base.laundry * roomNights,
        hvac: hvacAdj * roomNights,
        foodService: (base.foodService || 0) * roomNights,
        cleaning: (base.cleaning || 0) * roomNights
      }
    };
  };

  const emissions = calculate();

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

        {activeTab === 'calculator' && (
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
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="Canada">Canada</option>
                        <option value="Global">Other (Global Fallback)</option>
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
                      {Object.entries(climateData).map(([code, data]) => (
                        <option key={code} value={code}>{code} — {data.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-emerald-800">
                    <div>
                      <strong className="font-semibold block text-[11px] uppercase tracking-wider text-emerald-900 mb-0.5">Parameters Applied:</strong>
                      <span className="opacity-90">{country} {stateProvince !== 'National Average' && `(${stateProvince})`} • {climateZone} Climate</span>
                    </div>
                    <div className="flex gap-4 font-mono text-[11px] bg-white px-3 py-1.5 rounded-lg border border-emerald-100">
                      <div>GRID: <span className="font-bold text-emerald-700">{emissions.gridFactor.toFixed(3)} t/MWh</span></div>
                      <div>HVAC: <span className="font-bold text-emerald-700">{emissions.climateMult.toFixed(2)}x</span></div>
                    </div>
                  </div>
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
                      {Object.keys(accommodationData).map(type => (
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
                  <span className="text-5xl font-extrabold font-heading tracking-tight">{emissions.total.toFixed(1)}</span>
                  <span className="text-lg font-bold opacity-90">kg CO₂e</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
                  <div>
                    <span className="text-[11px] opacity-70 block uppercase font-bold tracking-wider">Per Person</span>
                    <span className="text-lg font-bold">{emissions.perPerson.toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-[11px] opacity-70 block uppercase font-bold tracking-wider">Per Person / Day</span>
                    <span className="text-lg font-bold">{emissions.perPersonPerDay.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="mt-6 bg-white/5 rounded-2xl p-3 border border-white/5 text-[11px] opacity-90 flex justify-between">
                  <span>Room Nights: <strong>{emissions.roomNights}</strong></span>
                  <span>Unit Impact: <strong>{emissions.totalPerRoom.toFixed(1)} kg/room-night</strong></span>
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
                      const percentage = ((val / emissions.total) * 100) || 0;
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
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 font-heading">Region-to-Region Comparisons</h2>
              <p className="text-slate-500 text-sm">See how grid factors and infrastructure heavily shift emissions for the exact same stay duration.</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Country Baseline Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { countryName: 'India', factor: 0.727, bg: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
                    { countryName: 'USA', factor: 0.389, bg: 'bg-blue-50 border-blue-100 text-blue-800' },
                    { countryName: 'Canada', factor: 0.120, bg: 'bg-teal-50 border-teal-100 text-teal-800' }
                  ].map(({ countryName, factor, bg }) => {
                    const countryEmissions = emissions.total * (factor / emissions.gridFactor);
                    return (
                      <div key={countryName} className={`rounded-2xl p-5 border ${bg}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{countryName} (National)</span>
                          <span className="font-mono text-xs opacity-75">{factor.toFixed(3)} t/MWh</span>
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight mt-3 font-heading">{countryEmissions.toFixed(1)}</p>
                        <p className="text-xs opacity-80 font-medium">kg CO₂e total footprint</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">State Impact (India Case Example)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { stateName: 'Sikkim (Hydro Grid)', factor: 0.150, colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                    { stateName: 'Maharashtra (Mixed Grid)', factor: 0.800, colorClass: 'text-amber-800 bg-amber-55/10 border-amber-200' },
                    { stateName: 'Jharkhand (Coal Heavy)', factor: 1.050, colorClass: 'text-rose-800 bg-rose-50 border-rose-100' }
                  ].map(({ stateName, factor, colorClass }) => {
                    const sampleTotal = 120 * (factor / 0.727); // relative baseline
                    return (
                      <div key={stateName} className={`rounded-2xl p-5 border ${colorClass}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{stateName}</span>
                          <span className="font-mono text-xs opacity-75">{factor.toFixed(3)}</span>
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight mt-3 font-heading">{sampleTotal.toFixed(1)}</p>
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
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-55/10 rounded-xl text-xs font-semibold text-slate-700 transition-all active:scale-95"
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
                  <p className="text-emerald-400 mb-4">/api/v1/emissions/accommodation/calculate</p>
                  
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

              <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-900 font-mono text-xs">
                <div className="bg-slate-900 px-4 py-2 text-slate-400 border-b border-slate-800 flex items-center justify-between text-[11px]">
                  <span>RESPONSE SCHEMA</span>
                  <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded">200 OK</span>
                </div>
                <div className="p-4">
                  <pre className="text-slate-300">{`{
  "success": true,
  "data": {
    "total_emissions_kg_co2e": ${emissions.total.toFixed(2)},
    "per_person_kg_co2e": ${emissions.perPerson.toFixed(2)},
    "per_person_per_day_kg_co2e": ${emissions.perPersonPerDay.toFixed(2)},
    "room_nights": ${emissions.roomNights},
    "grid_factor_used": ${emissions.gridFactor.toFixed(3)},
    "climate_multiplier_used": ${emissions.climateMult.toFixed(2)},
    "methodology": {
      "framework": "GHG Protocol Scope 3 + HCMI v2.0",
      "standards": ["ISO 14064-1", "DEFRA 2023", "Cornell CHSB 2024"]
    }
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

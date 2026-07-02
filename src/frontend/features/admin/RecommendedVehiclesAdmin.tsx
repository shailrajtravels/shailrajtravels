import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { getRecommendedVehiclesFn, saveRecommendedVehiclesFn } from "@/backend/shared/recommended-vehicles";

interface VehiclesAdminProps {
  token: string;
}

export function RecommendedVehiclesAdmin({ token }: VehiclesAdminProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await getRecommendedVehiclesFn();
      setVehicles(data);
    } catch (e: any) {
      setError(e.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await saveRecommendedVehiclesFn({ data: { adminToken: token, vehicles } });
      setSuccess("Vehicles saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to save vehicles");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = { ...newVehicles[index], [field]: value };
    setVehicles(newVehicles);
  };

  const handleAmenitiesChange = (index: number, value: string) => {
    const amenities = value.split(',').map(a => a.trim()).filter(Boolean);
    handleChange(index, 'amenities', amenities);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading vehicles...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-brand-blue-deep flex items-center gap-2">
            Recommended Vehicles
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure the 6 vehicle types that appear on the tour pages. Max 6 allowed.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-orange text-white rounded-xl font-bold hover:bg-brand-orange-dark transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="m-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
          {success}
        </div>
      )}

      <div className="p-6 space-y-6">
        {vehicles.map((v, idx) => (
          <div key={idx} className="p-5 border border-gray-200 rounded-xl bg-gray-50/30 relative flex gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ID (unique)</label>
                <input
                  type="text"
                  value={v.id || ""}
                  onChange={(e) => handleChange(idx, "id", e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                  placeholder="e.g., swift-dzire"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={v.name || ""}
                  onChange={(e) => handleChange(idx, "name", e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                  placeholder="e.g., Swift Dzire"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Capacity String</label>
                <input
                  type="text"
                  value={v.capacityStr || ""}
                  onChange={(e) => handleChange(idx, "capacityStr", e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                  placeholder="e.g., 1-4 Travelers"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Min Cap</label>
                  <input
                    type="number"
                    value={v.minCap || 0}
                    onChange={(e) => handleChange(idx, "minCap", parseInt(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Max Cap</label>
                  <input
                    type="number"
                    value={v.maxCap || 0}
                    onChange={(e) => handleChange(idx, "maxCap", parseInt(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={v.description || ""}
                  onChange={(e) => handleChange(idx, "description", e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={v.image || ""}
                  onChange={(e) => handleChange(idx, "image", e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={(v.amenities || []).join(", ")}
                  onChange={(e) => handleAmenitiesChange(idx, e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange"
                />
              </div>
            </div>
            {vehicles.length > 1 && (
              <button
                onClick={() => setVehicles(vehicles.filter((_, i) => i !== idx))}
                className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 self-center"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}

        {vehicles.length < 6 && (
          <button
            onClick={() => setVehicles([...vehicles, { id: "", name: "", minCap: 1, maxCap: 4, amenities: [], order: vehicles.length }])}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Vehicle Slot
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ShieldCheck, Upload, Car, FileText, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VerificationModal = ({ isOpen, onClose, driver }) => {
  const { submitDriverVerification, triggerToast } = useApp();

  const [formData, setFormData] = useState({
    // Driver info
    fullName: driver?.name || 'Vikram Patil',
    phone: driver?.phone || '+91 94220 88991',
    drivingExperienceYears: '6',
    // Vehicle info
    carNumber: driver?.vehicle?.plateNumber || 'MH-24-AZ-7788',
    make: driver?.vehicle?.make || 'Hyundai',
    model: driver?.vehicle?.model || 'Creta SX',
    year: driver?.vehicle?.year || '2022',
    color: driver?.vehicle?.color || 'Knight Black',
    seatingCapacity: driver?.vehicle?.seatingCapacity || 5,
    fuelType: driver?.vehicle?.fuelType || 'Diesel',
    // Document info
    licenseNumber: driver?.verificationDoc?.licenseNumber || 'DL-2420190012901',
    licenseExpiry: driver?.verificationDoc?.licenseExpiry || '2038-11-05',
    rcNumber: driver?.verificationDoc?.rcNumber || 'RC-MH24-7788-2022',
    idType: 'Aadhaar Card',
    idNumber: '•••• •••• 1156',
    documentUploaded: true
  });

  if (!isOpen) return null;

  const handleAutofillDummy = () => {
    setFormData({
      fullName: driver?.name || 'Vikram Patil',
      phone: driver?.phone || '+91 94220 88991',
      drivingExperienceYears: '7',
      carNumber: 'MH-14-BZ-5599',
      make: 'Tata',
      model: 'Nexon EV',
      year: '2023',
      color: 'Teal Blue',
      seatingCapacity: 5,
      fuelType: 'Electric',
      licenseNumber: 'DL-1420210088765',
      licenseExpiry: '2037-05-18',
      rcNumber: 'RC-MH14-5599-2023',
      idType: 'Aadhaar Card',
      idNumber: '•••• •••• 9924',
      documentUploaded: true
    });
    triggerToast('Sample Data Loaded', 'Dummy vehicle and driving license loaded.', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.carNumber || !formData.licenseNumber) {
      triggerToast('Missing Fields', 'Please enter Vehicle Registration and Driving License numbers.', 'error');
      return;
    }

    const payload = {
      vehicle: {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        plateNumber: formData.carNumber.toUpperCase(),
        seatingCapacity: parseInt(formData.seatingCapacity),
        fuelType: formData.fuelType,
        features: ['Air Conditioning', 'Trunk Space', 'Safety Airbags']
      },
      verificationDoc: {
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        rcNumber: formData.rcNumber,
        idType: formData.idType,
        idNumber: formData.idNumber,
        dummyDocName: 'sample_driving_license_rc.pdf'
      }
    };

    submitDriverVerification(driver.id, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Driver & Vehicle Verification</h3>
              <p className="text-xs text-slate-500">Only verified car owners can publish rides on Rideshare_X</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutofillDummy}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Autofill Sample Docs
          </button>
        </div>

        {/* Status Indicator */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-6 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Current Status:</span>
          {driver?.verificationStatus === 'verified' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Car Owner
            </span>
          )}
          {driver?.verificationStatus === 'pending' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> Verification Pending Admin Review
            </span>
          )}
          {driver?.verificationStatus === 'rejected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
              <X className="w-3.5 h-3.5" /> Verification Rejected (Please Resubmit)
            </span>
          )}
          {(!driver?.verificationStatus || driver?.verificationStatus === 'not_verified') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-bold">
              Not Verified (Action Required)
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Vehicle Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600" />
              1. Vehicle Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Car / Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-PQ-9876"
                  value={formData.carNumber}
                  onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Total Seating Capacity *
                </label>
                <select
                  value={formData.seatingCapacity}
                  onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={4}>4-Seater (Hatchback / Sedan)</option>
                  <option value={5}>5-Seater (Compact SUV / Sedan)</option>
                  <option value={7}>7-Seater (MUV / Large SUV)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Make & Model</label>
                <input
                  type="text"
                  placeholder="e.g. Honda City / Hyundai Creta"
                  value={`${formData.make} ${formData.model}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setFormData({ ...formData, make: parts[0] || '', model: parts.slice(1).join(' ') || '' });
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fuel Type</label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG / Hybrid</option>
                  <option value="Electric">Electric (EV)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Driver License & ID Proof */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              2. Driving License & Government Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Driver License Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-1420110012345"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dummy Document Upload Preview */}
            <div className="p-4 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Sample RC Book & Driver License Attached
                  </div>
                  <div className="text-[11px] text-slate-500">
                    sample_verification_package_MH24.pdf (2.4 MB) • Mock document ready for Admin inspection
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                Uploaded ✓
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAutofillDummy}
              className="sm:hidden text-xs text-emerald-700 font-semibold underline"
            >
              Autofill Sample Docs
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Submit for Verification
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

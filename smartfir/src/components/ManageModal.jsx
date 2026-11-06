// src/components/ManageModal.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User, X, Shield } from "lucide-react";
import api from "@/services/api";

export default function ManageModal({
  showManageModal,
  setShowManageModal,
  selectedFir,
  manageForm,
  setManageForm,
  suspectPhoto,
  setSuspectPhoto,
  evidencePhotos,
  setEvidencePhotos,
  formErrors,
  setFormErrors,
  data,
  actions,
  refreshData
}) {
  if (!showManageModal || !selectedFir) return null;

  const getId = (val) => String(val?.id || val?._id || val || "");

  // ✅ MEMOIZED: only recalculates when data.suspects or selectedFir change
  const existing = useMemo(() => 
    (data.suspects || []).find(
      s => s.firIds?.some(fid => getId(fid) === getId(selectedFir))
    ),
    [data.suspects, selectedFir, getId]
  );

  const validateSuspect = () => {
    const errors = {};
    if (!manageForm.suspectName.trim()) errors.suspectName = "Suspect name is required";
    if (!manageForm.suspectFatherName.trim()) errors.suspectFatherName = "Father's name is required";
    if (!manageForm.suspectCnic.trim()) {
      errors.suspectCnic = "CNIC is required";
    } else if (!/^\d{5}-\d{7}-\d{1}$/.test(manageForm.suspectCnic)) {
      errors.suspectCnic = "CNIC format: XXXXX-XXXXXXX-X";
    }
    if (!manageForm.suspectDistrict.trim()) errors.suspectDistrict = "District is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateFIRStatus = async () => {
    try {
      await actions.updateFIR(getId(selectedFir), { status: manageForm.firStatus });
      alert('✅ FIR status updated successfully!');
      refreshData();
    } catch (error) {
      alert('❌ Failed to update FIR status.');
    }
  };

  const handleUpdateSuspect = async () => {
    if (!validateSuspect()) {
      alert('❌ Please fill all required suspect fields.');
      return;
    }
    try {
      const payload = {
        name: manageForm.suspectName.trim(),
        fatherName: manageForm.suspectFatherName.trim(),
        cnic: manageForm.suspectCnic.trim(),
        district: manageForm.suspectDistrict.trim(),
        status: manageForm.suspectStatus,
        firIds: [getId(selectedFir)]
      };

      if (existing) {
        await actions.updateSuspect(existing._id, payload);
      } else {
        await actions.addSuspect(payload);
      }
      alert('✅ Suspect updated/created successfully!');
      refreshData();
    } catch (error) {
      alert('❌ Failed to update suspect.');
    }
  };

  const handleUploadSuspectPhoto = async () => {
    if (!suspectPhoto) {
      alert('❌ Please select a suspect photo first.');
      return;
    }
    
    // ✅ Check file size (≥1 MB)
    if (suspectPhoto.size < 1024 * 1024) {
      alert('❌ Photo must be at least 1 MB.');
      return;
    }

    if (!manageForm.suspectName.trim()) {
      alert('❌ Please update suspect details first.');
      return;
    }
    try {
      if (!existing) {
        alert('❌ No suspect found. Please update suspect details first.');
        return;
      }
      const formData = new FormData();
      formData.append('photo', suspectPhoto);
      await api.post(`/suspects/${existing._id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('✅ Suspect photo uploaded!');
      setSuspectPhoto(null);
      refreshData();
    } catch (error) {
      alert('❌ Failed to upload suspect photo.');
    }
  };

  const handleUploadEvidence = async () => {
    if (evidencePhotos.length === 0) {
      alert('❌ Please select at least one evidence photo.');
      return;
    }
    try {
      if (!existing) {
        alert('❌ No suspect found. Please update suspect details first.');
        return;
      }
      for (let i = 0; i < evidencePhotos.length; i++) {
        const formData = new FormData();
        formData.append('photo', evidencePhotos[i]);
        await api.post(`/suspects/${existing._id}/evidence`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      alert('✅ Evidence photos uploaded!');
      setEvidencePhotos([]);
      refreshData();
    } catch (error) {
      alert('❌ Failed to upload evidence.');
    }
  };

  const handleMarkAsWanted = async () => {
    if (!validateSuspect()) {
      alert('❌ Please fill all required suspect fields.');
      return;
    }
    
    // ✅ Require photo (≥1 MB) before marking as wanted
    if (!suspectPhoto) {
      alert('❌ A suspect photo (≥1 MB) is required before marking as Wanted.');
      return;
    }
    if (suspectPhoto.size < 1024 * 1024) {
      alert('❌ Photo must be at least 1 MB.');
      return;
    }

    try {
      if (!existing) {
        alert('❌ No suspect found. Please update suspect details first.');
        return;
      }
      
      // Upload photo first (if not already uploaded)
      const formData = new FormData();
      formData.append('photo', suspectPhoto);
      await api.post(`/suspects/${existing._id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Then mark as wanted
      await actions.updateSuspect(existing._id, { status: 'wanted' });
      setManageForm({ ...manageForm, suspectStatus: 'wanted' });
      setSuspectPhoto(null);
      alert('✅ Suspect marked as WANTED! Camera detection is now active.');
      refreshData();
    } catch (error) {
      alert('❌ Failed to mark suspect as wanted.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Manage Case: {selectedFir.firNumber}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => {
            setShowManageModal(false);
            setFormErrors({});
          }}>
            <X size={18} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ── SECTION 1: FIR Status ────────────────────────── */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} /> FIR Status
            </h3>
            <div className="flex gap-2">
              <Select
                value={manageForm.firStatus}
                onValueChange={(v) => setManageForm({ ...manageForm, firStatus: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investigating">Under Investigation</SelectItem>
                  <SelectItem value="submitted_to_dsp">Submit to DSP</SelectItem>
                  <SelectItem value="closed">Close Case</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateFIRStatus}>
                Update FIR Status
              </Button>
            </div>
          </div>

          {/* ── SECTION 2: Suspect Details ───────────────────── */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} /> Suspect Details <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-3">
              <div>
                <Input
                  value={manageForm.suspectName}
                  onChange={(e) => setManageForm({ ...manageForm, suspectName: e.target.value })}
                  placeholder="Suspect Name *"
                  className={formErrors.suspectName ? "border-red-500" : ""}
                />
                {formErrors.suspectName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.suspectName}</p>
                )}
              </div>
              <div>
                <Input
                  value={manageForm.suspectFatherName}
                  onChange={(e) => setManageForm({ ...manageForm, suspectFatherName: e.target.value })}
                  placeholder="Father's Name *"
                  className={formErrors.suspectFatherName ? "border-red-500" : ""}
                />
                {formErrors.suspectFatherName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.suspectFatherName}</p>
                )}
              </div>
              <div>
                <Input
                  value={manageForm.suspectCnic}
                  onChange={(e) => setManageForm({ ...manageForm, suspectCnic: e.target.value })}
                  placeholder="CNIC (XXXXX-XXXXXXX-X) *"
                  className={formErrors.suspectCnic ? "border-red-500" : ""}
                />
                {formErrors.suspectCnic && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.suspectCnic}</p>
                )}
              </div>
              <div>
                <Input
                  value={manageForm.suspectDistrict}
                  onChange={(e) => setManageForm({ ...manageForm, suspectDistrict: e.target.value })}
                  placeholder="District *"
                  className={formErrors.suspectDistrict ? "border-red-500" : ""}
                />
                {formErrors.suspectDistrict && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.suspectDistrict}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Select
                  value={manageForm.suspectStatus}
                  onValueChange={(v) => setManageForm({ ...manageForm, suspectStatus: v })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_investigation">Under Investigation</SelectItem>
                    <SelectItem value="wanted">Wanted</SelectItem>
                    <SelectItem value="captured">Captured</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateSuspect}>
                  Update Suspect
                </Button>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Suspect Photo ──────────────────────── */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Suspect Photo <span className="text-red-500">* (Required for Wanted, ≥1 MB)</span>
            </h3>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size < 1024 * 1024) {
                      alert('❌ Photo must be at least 1 MB.');
                      return;
                    }
                    setSuspectPhoto(file);
                  }
                }}
              />
              {suspectPhoto && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{(suspectPhoto.size / 1024 / 1024).toFixed(2)} MB</span>
                  <Button size="sm" variant="outline" onClick={() => setSuspectPhoto(null)}>
                    <X size={14} /> Remove
                  </Button>
                </div>
              )}
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleUploadSuspectPhoto}>
                Upload Photo
              </Button>
            </div>
          </div>

          {/* ── SECTION 4: Evidence Photos ────────────────────── */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Evidence Photos (optional)</h3>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    const newPhotos = [];
                    for (let i = 0; i < files.length; i++) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        newPhotos.push(reader.result);
                        if (newPhotos.length === files.length) {
                          setEvidencePhotos([...evidencePhotos, ...newPhotos]);
                        }
                      };
                      reader.readAsDataURL(files[i]);
                    }
                  }
                }}
              />
              {evidencePhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {evidencePhotos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img src={photo} alt={`Evidence ${idx}`} className="h-16 w-16 object-cover rounded" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5"
                        onClick={() => setEvidencePhotos(evidencePhotos.filter((_, i) => i !== idx))}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleUploadEvidence}>
                Upload Evidence
              </Button>
            </div>
          </div>

          {/* ── SECTION 5: Mark as Wanted ─────────────────────── */}
          <div className="border-t pt-4">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleMarkAsWanted}
            >
              <Shield size={16} className="mr-2" />
              Mark Suspect as Wanted
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              Activates camera detection alerts across all stations. Requires ≥1 MB photo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
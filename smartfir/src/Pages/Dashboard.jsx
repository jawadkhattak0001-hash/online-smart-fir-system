// src/pages/Dashboard.jsx

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import api from "../services/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  FileText,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Building2,
  UserCheck,
  Activity
} from "lucide-react";


function Dashboard() {

  const { user } = useAuth();
  const { data, loading, actions } = useData();

  const [selectedFir, setSelectedFir] = useState(null);

  const [selectedOfficer, setSelectedOfficer] =
    useState("");

  const [investigationNote, setInvestigationNote] =
    useState("");

  const [updating, setUpdating] =
    useState(false);


  if (loading) {

    return (
      <div className="flex items-center justify-center h-64">

        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

      </div>
    );
  }


  const allFirs = data?.firs || [];

  const officers = data?.officers || [];


  // ======================================================
  // OPEN FIR
  // ======================================================

  const handleOpenModal = (fir) => {

    setSelectedFir(fir);

    setSelectedOfficer(
      fir?.assignedOfficer?._id ||
      fir?.assignedOfficer ||
      ""
    );

    setInvestigationNote(
      fir?.notes ||
      fir?.remarks ||
      fir?.investigationNotes?.[0] ||
      ""
    );
  };


  // ======================================================
  // START INVESTIGATION + ASSIGN OFFICER
  // ======================================================

  const handleSaveUpdates = async () => {

    if (!selectedFir) return;

    if (!selectedOfficer) {

      alert("Please select an Investigating Officer.");

      return;
    }


    setUpdating(true);


    try {

      const firId =
        selectedFir._id ||
        selectedFir.id;


      // Officer ka real MongoDB ObjectId
      const officerId = selectedOfficer;


      console.log("FIR ID:", firId);

      console.log("Officer ID:", officerId);


      // ----------------------------------------------
      // UPDATE FIR
      // ----------------------------------------------

      const result = await actions.updateFIR(
        firId,
        {
          status: "investigating",

          assignedOfficer: officerId,

          notes: investigationNote
        }
      );


      console.log(
        "FIR Update Result:",
        result
      );


      if (
        !result ||
        result.success === false
      ) {

        alert(
          result?.message ||
          "FIR update failed."
        );

        return;
      }


      // Database se fresh data
      await actions.refreshData();


      alert(
        "FIR successfully started for investigation and assigned to the officer."
      );


      setSelectedFir(null);

      setSelectedOfficer("");

      setInvestigationNote("");


    } catch (error) {

      console.error(
        "Start Investigation Error:",
        error
      );

      alert(
        error?.message ||
        "Unable to update FIR."
      );

    } finally {

      setUpdating(false);

    }
  };


  // ======================================================
  // STATISTICS
  // ======================================================

  const stats = [

    {
      title: "Total Registered FIRs",

      value: allFirs.length,

      icon: FileText,

      textColor: "text-blue-600",

      bgColor: "bg-blue-50",

      description: "District-wide complaints"
    },

    {
      title: "Under Investigation",

      value: allFirs.filter(
        f => f.status === "investigating"
      ).length,

      icon: ShieldAlert,

      textColor: "text-amber-600",

      bgColor: "bg-amber-50",

      description: "Cases under investigation"
    },

    {
      title: "Pending Action",

      value: allFirs.filter(
        f =>
          f.status === "pending" ||
          !f.status
      ).length,

      icon: Clock,

      textColor: "text-rose-600",

      bgColor: "bg-rose-50",

      description: "Awaiting initial review"
    }

  ];


  return (

    <div className="space-y-6 p-2">


      {/* HEADER */}

      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between border border-slate-800">

        <div className="flex items-center gap-4">

          <div className="p-3 bg-blue-600/30 rounded-xl border border-blue-500/40 hidden sm:block">

            <Building2 className="h-8 w-8 text-blue-400" />

          </div>


          <div>

            <h1 className="text-2xl sm:text-3xl font-extrabold">

              Station Dashboard

            </h1>


            <p className="text-slate-300 text-sm mt-1">

              Centralized FIR Management System

              {" • "}

              <span className="text-blue-300 font-medium">

                Logged in as:{" "}
                {user?.name || "Police Admin"}

              </span>

            </p>

          </div>

        </div>


        <div className="mt-4 md:mt-0">

          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">

            <span className="h-3 w-3 rounded-full bg-emerald-500"></span>

            <span className="text-xs font-semibold text-emerald-400 uppercase">

              Command Network Live

            </span>

          </div>

        </div>

      </div>



      {/* STATISTICS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {stats.map((stat) => (

          <Card
            key={stat.title}
            className="border border-slate-200 shadow-sm rounded-xl"
          >

            <CardContent className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">

                    {stat.title}

                  </p>

                  <div className="text-3xl font-black text-slate-900">

                    {stat.value}

                  </div>

                  <p className="text-xs text-slate-500 mt-1">

                    {stat.description}

                  </p>

                </div>


                <div
                  className={`p-4 rounded-2xl ${stat.bgColor} ${stat.textColor}`}
                >

                  <stat.icon className="h-7 w-7" />

                </div>

              </div>

            </CardContent>

          </Card>

        ))}

      </div>



      {/* FIR LIST */}

      <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">

        <CardHeader className="bg-slate-50 border-b py-4 px-6">

          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">

            <Activity className="h-5 w-5 text-blue-600" />

            Incoming FIR Complaints Log

          </CardTitle>

        </CardHeader>


        <CardContent className="p-6">

          <div className="space-y-3">


            {allFirs.length === 0 ? (

              <div className="text-center py-12 text-slate-400">

                No FIR complaints found.

              </div>

            ) : (

              allFirs.map((fir) => {

                const isInvestigating =
                  fir.status === "investigating";


                return (

                  <div
                    key={fir._id || fir.id}

                    onClick={() =>
                      handleOpenModal(fir)
                    }

                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all"
                  >

                    <div className="flex items-center gap-4">

                      <div className="p-3 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white">

                        <FileText className="h-5 w-5" />

                      </div>


                      <div>

                        <div className="flex items-center gap-2">

                          <span className="text-sm font-bold text-slate-900">

                            {fir.firNumber ||
                              fir.id ||
                              "FIR"}

                          </span>

                          <span>•</span>

                          <span className="text-sm font-semibold">

                            {fir.incidentType ||
                              fir.crimeType ||
                              "General Complaint"}

                          </span>

                        </div>


                        <p className="text-xs text-slate-500 mt-1">

                          Complainant:{" "}

                          <strong>

                            {fir.complainantName ||
                              fir.name ||
                              "N/A"}

                          </strong>

                        </p>

                      </div>

                    </div>


                    <div className="mt-3 sm:mt-0">

                      <Badge
                        className={
                          isInvestigating
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-rose-100 text-rose-700 border border-rose-200"
                        }
                      >

                        {isInvestigating
                          ? "Under Investigation"
                          : "Pending Review"}

                      </Badge>

                    </div>

                  </div>

                );

              })

            )}

          </div>

        </CardContent>

      </Card>



      {/* ==================================================
          FIR MODAL
      ================================================== */}

      {selectedFir && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">


            {/* HEADER */}

            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">

              <div>

                <span className="text-xs font-semibold text-blue-400 uppercase">

                  Case Review Portal

                </span>

                <h3 className="text-lg font-bold">

                  {selectedFir.firNumber ||
                    selectedFir.id ||
                    "FIR"}

                </h3>

              </div>


              <button
                onClick={() =>
                  setSelectedFir(null)
                }
                disabled={updating}
                className="text-slate-400 hover:text-white text-xl"
              >

                ✕

              </button>

            </div>



            {/* BODY */}

            <div className="p-6 space-y-5">


              {/* FIR INFO */}

              <div className="bg-slate-50 border rounded-xl p-4 space-y-3 text-sm">

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Complainant:
                  </span>

                  <span className="font-semibold">
                    {selectedFir.complainantName ||
                      "N/A"}
                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Incident Category:
                  </span>

                  <span className="font-semibold">
                    {selectedFir.incidentType ||
                      selectedFir.crimeType ||
                      "General"}
                  </span>

                </div>


                <div className="flex justify-between items-center pt-2 border-t">

                  <span className="text-slate-500">
                    Current Status:
                  </span>

                  <Badge
                    className={
                      selectedFir.status === "investigating"
                        ? "bg-blue-600 text-white"
                        : "bg-rose-600 text-white"
                    }
                  >

                    {selectedFir.status === "investigating"
                      ? "Under Investigation"
                      : "Pending Review"}

                  </Badge>

                </div>

              </div>



              {/* OFFICER */}

              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">

                  <UserCheck className="h-4 w-4 text-blue-600" />

                  Investigating Officer

                </label>


                {officers.length > 0 ? (

                  <select
                    value={selectedOfficer}
                    onChange={(e) =>
                      setSelectedOfficer(
                        e.target.value
                      )
                    }
                    disabled={updating}
                    className="w-full px-3 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="">
                      Select SI Officer
                    </option>


                    {officers.map((officer) => (

                      <option
                        key={
                          officer._id ||
                          officer.id
                        }
                        value={
                          officer._id ||
                          officer.id
                        }
                      >

                        {officer.name}

                        {officer.badgeNumber
                          ? ` — ${officer.badgeNumber}`
                          : ""}

                      </option>

                    ))}

                  </select>

                ) : (

                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">

                    No SI officers found in the system.

                  </div>

                )}

              </div>



              {/* NOTES */}

              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">

                  Investigation Instructions / Directives

                </label>


                <textarea
                  rows="3"
                  value={investigationNote}
                  onChange={(e) =>
                    setInvestigationNote(
                      e.target.value
                    )
                  }
                  disabled={updating}
                  placeholder="Enter specific investigation instructions..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

              </div>



              {/* BUTTONS */}

              <div className="flex items-center justify-end gap-3 pt-3 border-t">

                <button
                  onClick={() =>
                    setSelectedFir(null)
                  }
                  disabled={updating}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >

                  Cancel

                </button>


                <button
                  disabled={
                    updating ||
                    officers.length === 0 ||
                    !selectedOfficer
                  }
                  onClick={handleSaveUpdates}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                >

                  <CheckCircle2 className="h-4 w-4" />

                  {updating
                    ? "Updating Case..."
                    : selectedFir.status === "investigating"
                    ? "Save Directives"
                    : "Start Investigation"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


export default Dashboard;
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import TimePicker from "@/components/FormElements/DatePicker/TimePicker";

interface InterviewRequest {
  id: string;
  candidate: {
    id: string;
    name?: string;
    email: string;
  };
  enseignant: {
    id: string;
    name?: string;
    email: string;
  };
  status: string;
  createdAt: string;
  dateEntretien?: string;
  meetLink?: string;
  evaluation?: {
    francais?: number;
    anglais?: number;
    motivation?: number;
    cultureGenerale?: number;
    bonus?: number;
    noteSur100?: number;
    observation?: string;
    competence?: string;
  };
}

export default function InterviewRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<InterviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InterviewRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCandidateCV, setSelectedCandidateCV] = useState<any>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Evaluation form state
  const [evaluationForm, setEvaluationForm] = useState({
    francais: "",
    anglais: "",
    motivation: "",
    cultureGenerale: "",
    bonus: "",
    noteSur100: "",
    observation: "",
    competence: "AUCUNE"
  });
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");
  const [evaluationSuccess, setEvaluationSuccess] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    
    if ((session.user as any)?.role !== "ENSEIGNANT") {
      router.push("/welcome");
      return;
    }

    fetchRequests();
  }, [session, status, router]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/enseignant/interview-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedDate || !selectedTime || !meetingLink) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const combinedDateTime = `${selectedDate}T${selectedTime}`;

      const res = await fetch("/api/enseignant/accept-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          candidateId: selectedRequest.candidate.id,
          dateTime: combinedDateTime,
          meetingLink
        }),
      });

      if (res.ok) {
        setSuccess("Entretien confirmé avec succès !");
        setModalOpen(false);
        setSelectedRequest(null);
        setSelectedDate("");
        setSelectedTime("");
        setMeetingLink("");
        fetchRequests(); // Refresh the list
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Erreur lors de la confirmation");
      }
    } catch (error) {
      setError("Erreur lors de la confirmation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setEvaluating(true);
    setEvaluationError("");
    setEvaluationSuccess("");

    try {
      // Use the new evaluation API endpoint
      const res = await fetch("/api/enseignant/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewRequestId: selectedRequest.id,
          francais: evaluationForm.francais || null,
          anglais: evaluationForm.anglais || null,
          motivation: evaluationForm.motivation || null,
          cultureGenerale: evaluationForm.cultureGenerale || null,
          bonus: evaluationForm.bonus || null,
          noteSur100: evaluationForm.noteSur100 || null,
          observation: evaluationForm.observation || null,
          competence: evaluationForm.competence === "AUCUNE" ? null : evaluationForm.competence,
        }),
      });

      if (res.ok) {
        setEvaluationSuccess("Évaluation enregistrée avec succès !");
        setEvaluationModalOpen(false);
        setSelectedRequest(null);
        setEvaluationForm({
          francais: "",
          anglais: "",
          motivation: "",
          cultureGenerale: "",
          bonus: "",
          noteSur100: "",
          observation: "",
          competence: "AUCUNE"
        });
        fetchRequests(); // Refresh the list
      } else {
        const errorData = await res.json();
        setEvaluationError(errorData.error || "Erreur lors de l'enregistrement de l'évaluation");
      }
    } catch (error) {
      setEvaluationError("Erreur lors de l'enregistrement de l'évaluation");
    } finally {
      setEvaluating(false);
    }
  };

  const openEvaluationModal = (request: InterviewRequest) => {
    setSelectedRequest(request);
    if (request.evaluation) {
      setEvaluationForm({
        francais: request.evaluation.francais?.toString() || "",
        anglais: request.evaluation.anglais?.toString() || "",
        motivation: request.evaluation.motivation?.toString() || "",
        cultureGenerale: request.evaluation.cultureGenerale?.toString() || "",
        bonus: request.evaluation.bonus?.toString() || "",
        noteSur100: request.evaluation.noteSur100?.toString() || "",
        observation: request.evaluation.observation || "",
        competence: request.evaluation.competence || "AUCUNE"
      });
    } else {
      setEvaluationForm({
        francais: "",
        anglais: "",
        motivation: "",
        cultureGenerale: "",
        bonus: "",
        noteSur100: "",
        observation: "",
        competence: "AUCUNE"
      });
    }
    setEvaluationModalOpen(true);
    setEvaluationError("");
    setEvaluationSuccess("");
  };

  const openCVModal = async (candidateId: string) => {
    setCvLoading(true);
    setCvModalOpen(true);
    try {
      const response = await fetch(`/api/enseignant/candidate-cv/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCandidateCV(data.cv);
      } else {
        console.error("Failed to fetch CV");
        setSelectedCandidateCV(null);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
      setSelectedCandidateCV(null);
    } finally {
      setCvLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "ENSEIGNANT") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
              Demandes d'entretien
            </h1>
          </div>
          <p className="text-gray-700 text-lg">Gérez vos demandes d'entretien et évaluations</p>
        </div>

        {/* Content Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune demande d'entretien</h3>
              <p className="text-gray-600">Les nouvelles demandes apparaîtront ici.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
                <div key={request.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Candidate Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white font-semibold text-lg">
                              {(request.candidate.name || request.candidate.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {request.candidate.name || request.candidate.email}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Reçue le {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex flex-wrap gap-3">
                          {request.dateEntretien && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-700">
                                Confirmé le {new Date(request.dateEntretien).toLocaleDateString("fr-FR")} à {new Date(request.dateEntretien).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}

                          {request.evaluation && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-blue-700">
                                Évalué • Note: {request.evaluation.noteSur100}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex-shrink-0 flex flex-col gap-3">
                        {/* CV Buttons - Always visible */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openCVModal(request.candidate.id)}
                            className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 focus:ring-4 focus:ring-rose-200 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                            title="Voir CV dans une popup"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            CV
                          </button>
                          <button
                            onClick={() => router.push(`/enseignant/candidate-cv/${request.candidate.id}`)}
                            className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                            title="Ouvrir CV dans une nouvelle page"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>

                        {/* Main Action Button */}
                        {!request.dateEntretien ? (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setModalOpen(true);
                              setSelectedDate("");
                              setSelectedTime("");
                              setMeetingLink("");
                              setError("");
                              setSuccess("");
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Planifier l'entretien
                          </button>
                        ) : (
                          <button
                            onClick={() => openEvaluationModal(request)}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl focus:ring-4 focus:outline-none transition-all duration-200 shadow-lg hover:shadow-xl font-medium ${
                              request.evaluation
                                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 focus:ring-emerald-200"
                                : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus:ring-red-200"
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={request.evaluation ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                            </svg>
                            {request.evaluation ? "Modifier l'évaluation" : "Ajouter une évaluation"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for choosing date/time and meeting link */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Planifier l'entretien</h2>
            </div>

            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-700 font-medium">
                Candidat : <span className="font-semibold">{selectedRequest.candidate.name || selectedRequest.candidate.email}</span>
              </p>
            </div>

            <form onSubmit={handleAcceptRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de l'entretien
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Heure de l'entretien
                  </label>
                  <div className="w-full">
                    <TimePicker
                      name="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDate}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lien de réunion
                </label>
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedRequest(null);
                    setSelectedDate("");
                    setSelectedTime("");
                    setMeetingLink("");
                    setError("");
                    setSuccess("");
                  }}
                  className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedDate || !selectedTime || !meetingLink}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-medium shadow-lg"
                >
                  {submitting ? "Confirmation..." : "Confirmer l'entretien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {evaluationModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Évaluation de l'entretien</h2>
            </div>

            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-700 font-medium">
                Candidat : <span className="font-semibold">{selectedRequest.candidate.name || selectedRequest.candidate.email}</span>
              </p>
            </div>

            <form onSubmit={handleEvaluationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Français (sur 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={evaluationForm.francais}
                    onChange={(e) => setEvaluationForm({...evaluationForm, francais: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    placeholder="0-20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Anglais (sur 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={evaluationForm.anglais}
                    onChange={(e) => setEvaluationForm({...evaluationForm, anglais: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    placeholder="0-20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Motivation (sur 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={evaluationForm.motivation}
                    onChange={(e) => setEvaluationForm({...evaluationForm, motivation: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    placeholder="0-20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Culture Générale (sur 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={evaluationForm.cultureGenerale}
                    onChange={(e) => setEvaluationForm({...evaluationForm, cultureGenerale: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    placeholder="0-20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bonus (sur 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={evaluationForm.bonus}
                    onChange={(e) => setEvaluationForm({...evaluationForm, bonus: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    placeholder="0-20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Note sur 100
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={evaluationForm.noteSur100}
                    onChange={(e) => setEvaluationForm({...evaluationForm, noteSur100: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Compétence particulière
                  </label>
                  <select
                    value={evaluationForm.competence}
                    onChange={(e) => setEvaluationForm({...evaluationForm, competence: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                  >
                    <option value="AUCUNE">Aucune compétence particulière</option>
                    <option value="CULTURE">Culture</option>
                    <option value="ART">Art</option>
                    <option value="EXPERIENCE_ONG">Expérience ONG</option>
                    <option value="SPORT">Sport</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Observations
                  </label>
                  <textarea
                    value={evaluationForm.observation}
                    onChange={(e) => setEvaluationForm({...evaluationForm, observation: e.target.value})}
                    rows={4}
                    placeholder="Commentaires détaillés sur l'entretien, points forts, axes d'amélioration..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {evaluationError && (
                <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm font-medium">{evaluationError}</p>
                </div>
              )}
              {evaluationSuccess && (
                <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm font-medium">{evaluationSuccess}</p>
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEvaluationModalOpen(false);
                    setSelectedRequest(null);
                    setEvaluationForm({
                      francais: "",
                      anglais: "",
                      motivation: "",
                      cultureGenerale: "",
                      bonus: "",
                      noteSur100: "",
                      observation: "",
                      competence: "AUCUNE"
                    });
                    setEvaluationError("");
                    setEvaluationSuccess("");
                  }}
                  className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={evaluating}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-medium shadow-lg"
                >
                  {evaluating ? "Enregistrement..." : "Enregistrer l'évaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CV Modal */}
      {cvModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">CV du Candidat</h3>
              <button
                onClick={() => {
                  setCvModalOpen(false);
                  setSelectedCandidateCV(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {cvLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Chargement du CV...</p>
                  </div>
                </div>
              ) : selectedCandidateCV ? (
                <div className="space-y-6">
                  {/* Personal Info */}
                  {selectedCandidateCV.personalInfo && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Informations personnelles</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedCandidateCV.personalInfo.firstName} {selectedCandidateCV.personalInfo.lastName}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          {selectedCandidateCV.personalInfo.email && (
                            <p>📧 {selectedCandidateCV.personalInfo.email}</p>
                          )}
                          {selectedCandidateCV.personalInfo.phone && (
                            <p>📱 {selectedCandidateCV.personalInfo.phone}</p>
                          )}
                          {selectedCandidateCV.personalInfo.address && (
                            <p>📍 {selectedCandidateCV.personalInfo.address}</p>
                          )}
                        </div>
                        {selectedCandidateCV.personalInfo.summary && (
                          <p className="mt-3 text-gray-700">{selectedCandidateCV.personalInfo.summary}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedCandidateCV.education && selectedCandidateCV.education.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Formation</h4>
                      <div className="space-y-3">
                        {selectedCandidateCV.education.map((edu: any) => (
                          <div key={edu.id} className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                            <p className="text-blue-600 font-medium">{edu.institution}</p>
                            {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                            <p className="text-sm text-gray-500">
                              {new Date(edu.startDate).getFullYear()} - {edu.current ? "En cours" : new Date(edu.endDate).getFullYear()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedCandidateCV.experience && selectedCandidateCV.experience.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Expérience</h4>
                      <div className="space-y-3">
                        {selectedCandidateCV.experience.map((exp: any) => (
                          <div key={exp.id} className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900">{exp.position}</h5>
                            <p className="text-blue-600 font-medium">{exp.company}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(exp.startDate).getFullYear()} - {exp.current ? "En cours" : new Date(exp.endDate).getFullYear()}
                            </p>
                            {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedCandidateCV.skills && selectedCandidateCV.skills.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Compétences</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidateCV.skills.map((skill: any) => (
                          <span key={skill.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill.name} ({skill.level}/5)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {selectedCandidateCV.languages && selectedCandidateCV.languages.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Langues</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidateCV.languages.map((lang: any) => (
                          <span key={lang.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {lang.name} - {lang.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Ce candidat n'a pas encore créé de CV.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setCvModalOpen(false);
                  setSelectedCandidateCV(null);
                }}
                className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              {selectedCandidateCV && (
                <button
                  onClick={() => {
                    setCvModalOpen(false);
                    const candidateId = selectedCandidateCV.candidatId;
                    router.push(`/enseignant/candidate-cv/${candidateId}`);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-colors"
                >
                  Voir en pleine page
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
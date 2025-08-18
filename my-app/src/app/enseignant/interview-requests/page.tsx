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
}

export default function InterviewRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<InterviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InterviewRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Demandes d'entretien</h1>
          
          {requests.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              Aucune demande d'entretien en attente.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        Demande de {request.candidate.name || request.candidate.email}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Reçue le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      Choisir date/heure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for choosing date/time and meeting link */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirmer l'entretien</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Candidat : <strong>{selectedRequest.candidate.name || selectedRequest.candidate.email}</strong>
              </p>
            </div>
            
            <form onSubmit={handleAcceptRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  Date de l'entretien :
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border p-2 rounded w-full mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </label>

                <label className="block">
                  Heure de l'entretien :
                  <div className="mt-2">
                    <TimePicker
                      name="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDate}
                    />
                  </div>
                </label>
              </div>
              
              <label className="block">
                Lien de réunion :
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="border p-2 rounded w-full mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </label>

              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}

              <div className="flex justify-end gap-3">
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
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedDate || !selectedTime || !meetingLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Confirmation..." : "Confirmer l'entretien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
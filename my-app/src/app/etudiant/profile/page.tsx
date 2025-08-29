"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";

interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  dateDelivrance: string;
  lieuDelivrance: string;
  address: string;
  nationalite: string;
  civilite: string;
  dateNaissance: string;
  gouvernorat: string;
  specialite: string;
  createdAt: string;
  updatedAt: string;
}

export default function EtudiantProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data for editing
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    address: "",
    gouvernorat: "",
    specialite: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    
    if (session.user?.role !== "ETUDIANT") {
      router.push("/welcome");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/etudiant/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        
        // Initialize form data
        setFormData({
          nom: data.user.nom || "",
          prenom: data.user.prenom || "",
          telephone: data.user.telephone || "",
          address: data.user.address || "",
          gouvernorat: data.user.gouvernorat || "",
          specialite: data.user.specialite || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        setMessage(`❌ ${error.error}`);
      }
    } catch (error) {
      setMessage("❌ Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est obligatoire";
    }

    if (formData.newPassword && !formData.currentPassword) {
      newErrors.currentPassword = "Mot de passe actuel requis";
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      newErrors.newPassword = "Le nouveau mot de passe doit contenir au moins 8 caractères";
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        address: formData.address,
        gouvernorat: formData.gouvernorat,
        specialite: formData.specialite,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      };

      const response = await fetch("/api/etudiant/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("✅ Profil mis à jour avec succès!");
        setProfile(result.user);
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const gouvernoratOptions = [
    { value: "tunis", label: "Tunis" },
    { value: "ariana", label: "Ariana" },
    { value: "ben-arous", label: "Ben Arous" },
    { value: "manouba", label: "Manouba" },
    { value: "nabeul", label: "Nabeul" },
    { value: "zaghouan", label: "Zaghouan" },
    { value: "bizerte", label: "Bizerte" },
    { value: "beja", label: "Béja" },
    { value: "jendouba", label: "Jendouba" },
    { value: "kef", label: "Le Kef" },
    { value: "siliana", label: "Siliana" },
    { value: "kairouan", label: "Kairouan" },
    { value: "kasserine", label: "Kasserine" },
    { value: "sidi-bouzid", label: "Sidi Bouzid" },
    { value: "sousse", label: "Sousse" },
    { value: "monastir", label: "Monastir" },
    { value: "mahdia", label: "Mahdia" },
    { value: "sfax", label: "Sfax" },
    { value: "gafsa", label: "Gafsa" },
    { value: "tozeur", label: "Tozeur" },
    { value: "kebili", label: "Kébili" },
    { value: "gabes", label: "Gabès" },
    { value: "medenine", label: "Médenine" },
    { value: "tataouine", label: "Tataouine" },
  ];

  const specialiteOptions = [
    { value: "informatique", label: "Informatique" },
    { value: "telecommunications", label: "Télécommunications" },
    { value: "genie-civil", label: "Génie Civil" },
    { value: "electromecanique", label: "Électromécanique" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Chargement de votre profil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profil non trouvé</h2>
          <p className="text-gray-600">Impossible de charger les informations de votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent mb-2">
            Mon Profil Étudiant ESPRIT
          </h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et paramètres de compte
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('✅')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                message.includes('✅') ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {message.includes('✅') ? (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {profile.prenom?.[0]?.toUpperCase()}{profile.nom?.[0]?.toUpperCase()}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {profile.prenom} {profile.nom}
                </h2>
                <p className="text-gray-600 mb-2">{profile.email}</p>
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {profile.specialite || 'Spécialité non définie'}
                </span>
              </div>

              {/* Quick Info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0V4a2 2 0 014 0v2" />
                  </svg>
                  <span className="text-gray-600">CIN: {profile.cin || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">{profile.telephone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{profile.gouvernorat || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">Membre depuis {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Modifier mes informations</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputGroup
                      type="text"
                      label="Nom *"
                      placeholder="Votre nom"
                      name="nom"
                      handleChange={handleChange}
                      value={formData.nom}
                      className="[&_input]:py-[15px]"
                    />
                    {errors.nom && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.nom}</span>
                    )}
                  </div>
                  <div>
                    <InputGroup
                      type="text"
                      label="Prénom *"
                      placeholder="Votre prénom"
                      name="prenom"
                      handleChange={handleChange}
                      value={formData.prenom}
                      className="[&_input]:py-[15px]"
                    />
                    {errors.prenom && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.prenom}</span>
                    )}
                  </div>
                </div>

                <div>
                  <InputGroup
                    type="tel"
                    label="Téléphone"
                    placeholder="+216 12345678"
                    name="telephone"
                    handleChange={handleChange}
                    value={formData.telephone}
                    className="[&_input]:py-[15px]"
                  />
                </div>

                <div>
                  <InputGroup
                    type="text"
                    label="Adresse"
                    placeholder="Votre adresse complète"
                    name="address"
                    handleChange={handleChange}
                    value={formData.address}
                    className="[&_input]:py-[15px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Gouvernorat"
                      items={gouvernoratOptions}
                      placeholder="Sélectionner gouvernorat"
                      value={formData.gouvernorat}
                      onChange={(value) => setFormData(prev => ({ ...prev, gouvernorat: value }))}
                    />
                  </div>
                  <div>
                    <Select
                      label="Spécialité"
                      items={specialiteOptions}
                      placeholder="Sélectionner spécialité"
                      value={formData.specialite}
                      onChange={(value) => setFormData(prev => ({ ...prev, specialite: value }))}
                    />
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Changer le mot de passe
                  </h3>
                  
                  <div className="space-y-4">
                    <InputGroup
                      type="password"
                      label="Mot de passe actuel"
                      placeholder="Votre mot de passe actuel"
                      name="currentPassword"
                      handleChange={handleChange}
                      value={formData.currentPassword}
                      className="[&_input]:py-[15px]"
                    />
                    {errors.currentPassword && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.currentPassword}</span>
                    )}

                    <InputGroup
                      type="password"
                      label="Nouveau mot de passe"
                      placeholder="Nouveau mot de passe"
                      name="newPassword"
                      handleChange={handleChange}
                      value={formData.newPassword}
                      className="[&_input]:py-[15px]"
                    />
                    {errors.newPassword && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.newPassword}</span>
                    )}

                    <InputGroup
                      type="password"
                      label="Confirmer le nouveau mot de passe"
                      placeholder="Confirmer le nouveau mot de passe"
                      name="confirmPassword"
                      handleChange={handleChange}
                      value={formData.confirmPassword}
                      className="[&_input]:py-[15px]"
                    />
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                      saving
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    }`}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                        Sauvegarde...
                      </span>
                    ) : (
                      "Sauvegarder les modifications"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
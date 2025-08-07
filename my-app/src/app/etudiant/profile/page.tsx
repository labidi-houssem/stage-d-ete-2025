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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Erreur lors du chargement du profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mon Profil Étudiant
          </h1>
          <p className="text-gray-600">
            Consultez et modifiez vos informations personnelles
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
          {/* Read-only Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb- text-gray-00">
                Informations de Base
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CIN
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {profile.cin || "Non renseigné"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {profile.dateNaissance ? formatDate(profile.dateNaissance) : "Non renseignée"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationalité
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {profile.nationalite || "Non renseignée"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Civilité
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {profile.civilite || "Non renseignée"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de délivrance CIN
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {profile.dateDelivrance ? formatDate(profile.dateDelivrance) : "Non renseignée"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu de délivrance
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {profile.lieuDelivrance || "Non renseigné"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membre depuis
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Modifier mes informations
              </h2>

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
                    className={`px-6 py-3 rounded-lg font-medium ${
                      saving
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-opacity-90"
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
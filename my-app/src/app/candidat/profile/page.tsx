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

export default function CandidatProfilePage() {
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
    if (session.user?.role !== "CANDIDAT") {
      router.push("/welcome");
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/candidat/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom) newErrors.nom = "Nom requis";
    if (!formData.prenom) newErrors.prenom = "Prénom requis";
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/candidat/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Profil mis à jour avec succès");
        fetchProfile();
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!profile) return <div>Profil non trouvé</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
      {message && <div className="mb-4 text-center">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputGroup label="Nom" name="nom" value={formData.nom} handleChange={handleChange} />
        {errors.nom && <div className="text-red-500 text-sm">{errors.nom}</div>}
        <InputGroup label="Prénom" name="prenom" value={formData.prenom} handleChange={handleChange} />
        {errors.prenom && <div className="text-red-500 text-sm">{errors.prenom}</div>}
        <InputGroup label="Téléphone" name="telephone" value={formData.telephone} handleChange={handleChange} />
        <InputGroup label="Adresse" name="address" value={formData.address} handleChange={handleChange} />
        <InputGroup label="Gouvernorat" name="gouvernorat" value={formData.gouvernorat} handleChange={handleChange} />
        <InputGroup label="Spécialité" name="specialite" value={formData.specialite} handleChange={handleChange} />
        <InputGroup label="Mot de passe actuel" name="currentPassword" value={formData.currentPassword} handleChange={handleChange} type="password" />
        <InputGroup label="Nouveau mot de passe" name="newPassword" value={formData.newPassword} handleChange={handleChange} type="password" />
        <InputGroup label="Confirmer le nouveau mot de passe" name="confirmPassword" value={formData.confirmPassword} handleChange={handleChange} type="password" />
        {errors.confirmPassword && <div className="text-red-500 text-sm">{errors.confirmPassword}</div>}
        <button type="submit" className="w-full bg-primary text-white py-2 rounded" disabled={saving}>
          {saving ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
} 
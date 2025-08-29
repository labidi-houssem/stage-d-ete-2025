"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { Select } from "../FormElements/select";
import DatePickerOne from "../FormElements/DatePicker/DatePickerOne";

export default function SignupWithPassword() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    cin: "",
    nom: "",
    prenom: "",
    telephone: "+216",
    email: "",
    image: null as File | null,
    dateDelivrance: "",
    lieuDelivrance: "",
    address: "",
    password: "",
    confirmPassword: "",
    nationalite: "",
    civilite: "",
    dateNaissance: "",
    gouvernorat: "",
    specialite: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateCIN = (cin: string) => {
    const cinRegex = /^\d{8}$/;
    return cinRegex.test(cin);
  };

  const validateTelephone = (telephone: string) => {
    if (!telephone || telephone.trim() === '') {
      return true; // Optional field
    }
    const phoneRegex = /^\+216\d{8}$/;
    return phoneRegex.test(telephone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateField = (name: string, value: string | boolean) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'cin':
        if (!validateCIN(value as string)) {
          newErrors.cin = "CIN doit contenir exactement 8 chiffres";
        } else {
          delete newErrors.cin;
        }
        break;
      case 'nom':
      case 'prenom':
      case 'address':
      case 'lieuDelivrance':
        if (!(value as string).trim()) {
          newErrors[name] = "Ce champ est obligatoire";
        } else {
          delete newErrors[name];
        }
        break;
      case 'telephone':
        if (!validateTelephone(value as string)) {
          newErrors.telephone = "Téléphone doit commencer par +216 suivi de 8 chiffres";
        } else {
          delete newErrors.telephone;
        }
        break;
      case 'email':
        if (!validateEmail(value as string)) {
          newErrors.email = "Format d'email invalide";
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!validatePassword(value as string)) {
          newErrors.password = "Mot de passe: min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial";
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (value !== data.password) {
          newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'dateDelivrance':
      case 'dateNaissance':
        if (!(value as string).trim()) {
          newErrors[name] = "Date obligatoire";
        } else {
          delete newErrors[name];
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      setData({
        ...data,
        [name]: e.target.files?.[0] || null,
      });
    } else {
      // Special handling for telephone to maintain +216 prefix
      let newValue = value;
      if (name === 'telephone') {
        const cleaned = value.replace(/[^\d+]/g, '');

        if (!cleaned.startsWith('+216')) {
          newValue = '+216';
        } else if (cleaned.length > 12) {
          newValue = cleaned.slice(0, 12);
        } else {
          newValue = cleaned;
        }
      }

      // Special handling for CIN to allow only digits and max 8
      if (name === 'cin') {
        newValue = value.replace(/\D/g, '').slice(0, 8);
      }

      setData({
        ...data,
        [name]: newValue,
      });

      // Validate field on change
      validateField(name, newValue);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          data.nom.trim() &&
          data.prenom.trim() &&
          data.address.trim() &&
          validateCIN(data.cin) &&
          data.dateDelivrance.trim() &&
          data.lieuDelivrance.trim() &&
          !errors.nom && !errors.prenom && !errors.address && !errors.cin && !errors.dateDelivrance && !errors.lieuDelivrance
        );
      case 2:
        return (
          data.civilite &&
          data.nationalite &&
          validateEmail(data.email) &&
          (data.telephone === '' || validateTelephone(data.telephone)) &&
          data.dateNaissance.trim() &&
          data.gouvernorat &&
          validatePassword(data.password) &&
          data.confirmPassword === data.password &&
          !errors.email && !errors.telephone && !errors.password && !errors.confirmPassword && !errors.dateNaissance
        );
      case 3:
        return data.specialite && data.terms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateStep(3)) {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la création du compte');
        }

        console.log("Compte créé avec succès:", result);
        router.push('/Auth/Signin?message=Compte créé avec succès');
      } catch (error) {
        console.error("Erreur:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
        setErrors({ general: errorMessage });
      } finally {
        setLoading(false);
      }
    }
  };

  const civiliteOptions = [
    { value: "mr", label: "Monsieur" },
    { value: "mme", label: "Madame" },
    { value: "mlle", label: "Mademoiselle" },
  ];

  const nationaliteOptions = [
    { value: "tunisienne", label: "Tunisienne" },
    { value: "francaise", label: "Française" },
    { value: "algerienne", label: "Algérienne" },
    { value: "marocaine", label: "Marocaine" },
    { value: "autre", label: "Autre" },
  ];

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
    { value: "electromecanique", label: "Électromécanique" },
    { value: "genie-civil", label: "Génie Civil" },
  ];

  const handleSelectChange = (name: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const renderError = (fieldName: string) => {
    if (errors[fieldName]) {
      return <span className="text-red-500 text-sm mt-1 block">{errors[fieldName]}</span>;
    }
    return null;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Informations personnelles
      </h2>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-700 text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
          <input
            type="text"
            name="nom"
            value={data.nom}
            onChange={handleChange}
            className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
              errors.nom ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Votre nom"
          />
          {renderError('nom')}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
          <input
            type="text"
            name="prenom"
            value={data.prenom}
            onChange={handleChange}
            className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
              errors.prenom ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Votre prénom"
          />
          {renderError('prenom')}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse *</label>
        <input
          type="text"
          name="address"
          value={data.address}
          onChange={handleChange}
          className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
            errors.address ? 'border-red-300' : 'border-gray-200'
          }`}
          placeholder="Votre adresse complète"
        />
        {renderError('address')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">CIN *</label>
          <input
            type="text"
            name="cin"
            value={data.cin}
            onChange={handleChange}
            maxLength={8}
            className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
              errors.cin ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="12345678"
          />
          {renderError('cin')}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date de délivrance *</label>
          <DatePickerOne
            name="dateDelivrance"
            value={data.dateDelivrance}
            onChange={handleChange}
          />
          {renderError('dateDelivrance')}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu de délivrance *</label>
        <input
          type="text"
          name="lieuDelivrance"
          value={data.lieuDelivrance}
          onChange={handleChange}
          className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
            errors.lieuDelivrance ? 'border-red-300' : 'border-gray-200'
          }`}
          placeholder="Lieu de délivrance"
        />
        {renderError("lieuDelivrance")}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Informations complémentaires
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Civilité *</label>
          <Select
            label=""
            items={civiliteOptions}
            placeholder="Sélectionner civilité"
            value={data.civilite}
            onChange={(value) => handleSelectChange('civilite', value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nationalité *</label>
          <Select
            label=""
            items={nationaliteOptions}
            placeholder="Sélectionner nationalité"
            value={data.nationalite}
            onChange={(value) => handleSelectChange('nationalite', value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
              errors.email ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="votre@email.com"
          />
          {renderError('email')}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={data.telephone}
            onChange={handleChange}
            className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
              errors.telephone ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="+216 12345678"
          />
          {renderError('telephone')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date de naissance *</label>
          <DatePickerOne
            name="dateNaissance"
            value={data.dateNaissance}
            onChange={handleChange}
          />
          {renderError('dateNaissance')}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gouvernorat *</label>
          <Select
            label=""
            items={gouvernoratOptions}
            placeholder="Sélectionner gouvernorat"
            value={data.gouvernorat}
            onChange={(value) => handleSelectChange('gouvernorat', value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={data.password}
              onChange={handleChange}
              className={`w-full px-4 py-4 pr-12 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
                errors.password ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {renderError('password')}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer mot de passe *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={data.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-4 pr-12 border rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {renderError('confirmPassword')}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Spécialité et finalisation
      </h2>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Spécialité ESPRIT *</label>
        <Select
          label=""
          items={specialiteOptions}
          placeholder="Sélectionner votre spécialité"
          value={data.specialite}
          onChange={(value) => handleSelectChange('specialite', value)}
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="terms"
            checked={data.terms}
            onChange={(e) => setData({ ...data, terms: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2 mt-1"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            J'accepte les{" "}
            <a href="/terms" className="text-red-600 hover:text-red-700 font-medium underline">
              conditions d'utilisation
            </a>{" "}
            et la{" "}
            <a href="/privacy" className="text-red-600 hover:text-red-700 font-medium underline">
              politique de confidentialité
            </a>{" "}
            d'ESPRIT
          </span>
        </label>
        {errors.terms && <p className="text-red-600 text-xs mt-2">{errors.terms}</p>}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Modern Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= step
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep > step ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-20 h-1 mx-3 transition-all duration-300 ${
                  currentStep > step ? "bg-gradient-to-r from-red-600 to-rose-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-16">
          <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
            Informations personnelles
          </span>
          <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
            Détails complémentaires
          </span>
          <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
            Spécialité et finalisation
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-red-300 hover:text-red-600 font-medium transition-all duration-200"
          >
            ← Précédent
          </button>
        )}

        <div className="ml-auto">
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                validateStep(currentStep)
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Suivant →
            </button>
          ) : (
            <button
              type="submit"
              disabled={!validateStep(3) || loading}
              className={`flex items-center justify-center gap-3 px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                validateStep(3) && !loading
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Créer mon compte ESPRIT</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { Select } from "../FormElements/select";
import DatePickerOne from "../FormElements/DatePicker/DatePickerOne";

export default function SignupWithPassword() {
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
    // Allow empty telephone or valid format
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
        //TODO: file validation
        // if file size > 5MB => error
        // if file type !== image => error
        // file size and type validation

        [name]: e.target.files?.[0] || null,
      });
    } else {
      // Special handling for telephone to maintain +216 prefix
      let newValue = value;
      if (name === 'telephone') {
        // Remove any non-digit characters except the + at the beginning
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
      alert("🔄 Création de votre compte en cours...");
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
        // Show success message and redirect
        alert("🎉 Votre inscription a été complétée avec succès! Vous pouvez maintenant vous connecter.");
        window.location.href = '/Auth/Signin';
      } catch (error) {
        console.error("Erreur:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
        alert(`❌ ${errorMessage}`);
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
    { value: "genie-civil", label: "Génie Civil" },
    { value: "electromecanique", label: "Électromécanique" },
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InputGroup
            type="text"
            label="Nom"
            placeholder="Entrer votre nom"
            name="nom"
            handleChange={handleChange}
            value={data.nom}
            className="[&_input]:py-[15px]"
          />
          {renderError('nom')}
        </div>
        <div>
          <InputGroup
            type="text"
            label="Prénom"
            placeholder="Entrer votre prénom"
            name="prenom"
            handleChange={handleChange}
            value={data.prenom}
            className="[&_input]:py-[15px]"
          />
          {renderError('prenom')}
        </div>
      </div>

      <div>
        <InputGroup
          type="text"
          label="Adresse"
          placeholder="Entrer votre adresse complète"
          name="address"
          handleChange={handleChange}
          value={data.address}
          className="[&_input]:py-[15px]"
        />
        {renderError('address')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InputGroup
            type="text"
            label="CIN"
            placeholder="8 chiffres"
            name="cin"
            handleChange={handleChange}
            value={data.cin}
            className="[&_input]:py-[15px]"
          />
          {renderError('cin')}
        </div>
        <div>
          <label className="block text-body-sm font-medium text-dark dark:text-white mb-3">
            Date de délivrance
          </label>
          <DatePickerOne name="dateDelivrance" value={data.dateDelivrance} onChange={handleChange} />
          {renderError('dateDelivrance')}
        </div>
      </div>
      <div>
        <InputGroup type="text" label="Lieu de délivrance" placeholder="Entrer lieu de délivrance" name="lieuDelivrance" handleChange={handleChange} value={data.lieuDelivrance} className="[&_input]:py-[15px]" />
        {renderError("lieuDelivrance")}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Civilité"
          items={civiliteOptions}
          placeholder="Sélectionner civilité"
          value={data.civilite}
          onChange={(value) => handleSelectChange('civilite', value)}
        />
        <Select
          label="Nationalité"
          items={nationaliteOptions}
          placeholder="Sélectionner nationalité"
          value={data.nationalite}
          onChange={(value) => handleSelectChange('nationalite', value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InputGroup
            type="email"
            label="Email"
            placeholder="Entrer votre email"
            name="email"
            handleChange={handleChange}
            value={data.email}
            icon={<EmailIcon />}
            className="[&_input]:py-[15px]"
          />
          {renderError('email')}
        </div>
        <div>
          <InputGroup
            type="tel"
            label="Téléphone"
            placeholder="+216 12345678"
            name="telephone"
            handleChange={handleChange}
            value={data.telephone}
            className="[&_input]:py-[15px]"
          />
          {renderError('telephone')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-body-sm font-medium text-dark dark:text-white mb-3">
            Date de naissance
          </label>
          <DatePickerOne name="dateNaissance" value={data.dateNaissance} onChange={handleChange} />
          {renderError('dateNaissance')}
        </div>
        <div>
          <Select
            label="Gouvernorat"
            items={gouvernoratOptions}
            placeholder="Sélectionner gouvernorat"
            value={data.gouvernorat}
            onChange={(value) => handleSelectChange('gouvernorat', value)}
          />
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InputGroup
            type={showPassword ? "text" : "password"}
            label="Mot de passe"
            placeholder="Entrer votre mot de passe"
            name="password"
            handleChange={handleChange}
            value={data.password}
            rightIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="focus:outline-none"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
              >
                {showPassword ? (
                  // Open eye icon
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                ) : (
                  // Eye with slash (closed)
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M1.5 12S5.5 5 12 5c2.5 0 4.77.77 6.65 2.05M22.5 12S18.5 19 12 19c-2.5 0-4.77-.77-6.65-2.05M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .53-.14 1.03-.38 1.46" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                )}
              </button>
            }
            iconPosition="right"
            className="[&_input]:py-[15px]"
          />
          {renderError('password')}
        </div>
        <div>
          <InputGroup
            type={showConfirmPassword ? "text" : "password"}
            label="Confirmer mot de passe"
            placeholder="Confirmer votre mot de passe"
            name="confirmPassword"
            handleChange={handleChange}
            value={data.confirmPassword}
            rightIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="focus:outline-none"
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
              >
                {showConfirmPassword ? (
                  // Open eye icon
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                ) : (
                  // Eye with slash (closed)
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M1.5 12S5.5 5 12 5c2.5 0 4.77.77 6.65 2.05M22.5 12S18.5 19 12 19c-2.5 0-4.77-.77-6.65-2.05M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .53-.14 1.03-.38 1.46" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                )}
              </button>
            }
            iconPosition="right"
            className="[&_input]:py-[15px]"
          />
          {renderError('confirmPassword')}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-dark dark:text-white mb-4">
        Choisir votre spécialité
      </h3>
      <Select
        label="Spécialité"
        items={specialiteOptions}
        placeholder="Sélectionner votre spécialité"
        value={data.specialite}
        onChange={(value) => handleSelectChange('specialite', value)}
      />

      <div className="flex items-center gap-2 py-2 font-medium">
        <Checkbox
          label="J'accepte les termes et conditions"
          name="terms"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              terms: e.target.checked,
            })
          }
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  currentStep > step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Error Summary (optional enhancement) */}
      {currentStep === 1 && Object.keys(errors).filter(key => ['nom', 'prenom', 'address', 'cin', 'dateDelivrance', 'lieuDelivrance'].includes(key)).length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur:</strong> Veuillez corriger les champs suivants:
          <ul className="list-disc pl-5">
            {Object.keys(errors)
              .filter(key => ['nom', 'prenom', 'address', 'cin', 'dateDelivrance', 'lieuDelivrance'].includes(key))
              .map((key) => (
                <li key={key}>{errors[key]}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Step content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6">
        {currentStep > 1 && ( 
          <button
            type="button"
            onClick={handlePrevious}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Précédent
          </button>
        )}
        
        <div className="ml-auto">
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className={`px-6 py-3 rounded-lg ${
                validateStep(currentStep)
                  ? "bg-primary text-white hover:bg-opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              disabled={!validateStep(3)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg ${
                validateStep(3)
                  ? "bg-primary text-white hover:bg-opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Créer un compte
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
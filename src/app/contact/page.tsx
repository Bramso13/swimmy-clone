"use client";
import Link from "next/link";
import FormField from "@/components/forms/FormField";
import TextInput from "@/components/forms/TextInput";
import SelectInput from "@/components/forms/SelectInput";
import TextAreaInput from "@/components/forms/TextAreaInput";
import PrimaryButton from "@/components/forms/PrimaryButton";

const subjectOptions = [
  { value: "", label: "Sélectionnez un sujet" },
  { value: "question", label: "Question générale" },
  { value: "reservation", label: "Problème de réservation" },
  { value: "paiement", label: "Problème de paiement" },
  { value: "proprietaire", label: "Devenir propriétaire" },
  { value: "autre", label: "Autre" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600">
            Notre équipe est là pour vous accompagner
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulaire de contact */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Envoyez-nous un message
            </h2>
            
            <form className="space-y-6">
              <FormField label="Nom complet" htmlFor="name">
                <TextInput type="text" id="name" name="name" placeholder="Votre nom" />
              </FormField>

              <FormField label="Email" htmlFor="email">
                <TextInput type="email" id="email" name="email" placeholder="votre@email.com" />
              </FormField>

              <FormField label="Sujet" htmlFor="subject">
                <SelectInput id="subject" name="subject" options={subjectOptions} />
              </FormField>

              <FormField label="Message" htmlFor="message">
                <TextAreaInput id="message" name="message" rows={6} placeholder="Décrivez votre demande..." />
              </FormField>

              <PrimaryButton type="submit" className="w-full justify-center">
                Envoyer le message
              </PrimaryButton>
            </form>
          </div>

          {/* Informations de contact */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Autres moyens de contact
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">contact@YoumPool.fr</p>
                    <p className="text-sm text-gray-500">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                    <p className="text-gray-600">01 23 45 67 89</p>
                    <p className="text-sm text-gray-500">Lun-Ven 9h-18h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Chat en direct</h3>
                    <p className="text-gray-600">Disponible 24h/24</p>
                    <p className="text-sm text-gray-500">Via l'application</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Questions fréquentes
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Consultez notre FAQ pour des réponses rapides aux questions les plus courantes.
              </p>
              <Link
                href="/#faq"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Voir les questions fréquentes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


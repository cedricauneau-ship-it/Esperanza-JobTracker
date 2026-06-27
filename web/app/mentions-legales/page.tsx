export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Mentions légales</h1>
      <p className="text-gray-500 text-sm mb-8">
        Conformément aux dispositions des articles 6-III et 19 de la loi n° 2004-575
        du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN),
        il est précisé aux utilisateurs et visiteurs du présent site les informations suivantes.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">1. Éditeur du site</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Nom :</strong> Cédric Auneau</li>
          <li><strong>Statut :</strong> Entrepreneur individuel (auto-entrepreneur)</li>
          <li><strong>Adresse :</strong> 11 rue de la plaine de france, 95190 Fontenay-en-Parisis</li>
          <li><strong>E-mail :</strong> auneau.dev@gmail.com</li>
          <li><strong>SIRET :</strong> 10453602400011</li>
          <li><strong>TVA :</strong> Non applicable, article 293 B du CGI (franchise en base de TVA)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">2. Directeur de la publication</h2>
        <p className="text-sm text-gray-600">Cédric Auneau, en sa qualité d'éditeur du site.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">3. Hébergement</h2>
        <p className="text-sm text-gray-600 mb-2">Le site est hébergé par :</p>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          <li><strong>Société :</strong> Vercel Inc.</li>
          <li><strong>Adresse :</strong> 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis</li>
          <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline">vercel.com</a></li>
        </ul>
        <p className="text-sm text-gray-600 mb-2">L'API et la base de données sont hébergées par :</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Société :</strong> Railway Corporation</li>
          <li><strong>Site web :</strong> <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="underline">railway.app</a></li>
          <li><strong>Base de données :</strong> Supabase Inc. — <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">4. Nature du service</h2>
        <p className="text-sm text-gray-600 mb-2">
          Esperanza est un agrégateur d'offres d'emploi. Le service collecte et centralise
          des offres d'emploi issues de sources tierces publiques, notamment :
        </p>
        <ul className="text-sm text-gray-600 space-y-1 mb-2">
          <li><strong>France Travail</strong> — via leur API officielle (francetravail.fr). Les données sont fournies sous licence ouverte conformément aux CGU de l'API.</li>
          <li><strong>Sites d'emploi tiers</strong> — des offres publiquement accessibles peuvent être collectées depuis des plateformes tierces à des fins d'agrégation non commerciale.</li>
        </ul>
        <p className="text-sm text-gray-600">
          L'éditeur du site n'est en aucun cas l'auteur ni le propriétaire des offres d'emploi
          affichées. Ces offres sont la propriété de leurs auteurs respectifs (employeurs,
          plateformes d'emploi). L'éditeur ne saurait être tenu responsable de l'exactitude,
          de la disponibilité, de la légalité ou du contenu des offres affichées.
          Toute candidature est effectuée sous la seule responsabilité de l'utilisateur.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">5. Propriété intellectuelle</h2>
        <p className="text-sm text-gray-600">
          L'ensemble du code source, de l'architecture et du design de l'application Esperanza
          est la propriété exclusive de Cédric Auneau. Toute reproduction, totale ou partielle,
          est interdite sans autorisation écrite préalable.
          Les marques, logos et contenus des offres d'emploi affichées appartiennent
          à leurs propriétaires respectifs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">6. Données personnelles</h2>
        <p className="text-sm text-gray-600 mb-2">
          Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés,
          vous êtes informés des éléments suivants :
        </p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li><strong>Responsable du traitement :</strong> Cédric Auneau (coordonnées section 1).</li>
          <li><strong>Données collectées :</strong> adresse e-mail, nom d'utilisateur, mot de passe hashé (non lisible), historique des candidatures et entretiens saisis par l'utilisateur.</li>
          <li><strong>Finalité :</strong> fonctionnement du service de suivi de candidatures.</li>
          <li><strong>Base légale :</strong> exécution du contrat (utilisation du service).</li>
          <li><strong>Sous-traitants :</strong> Supabase (stockage des données), Vercel et Railway (hébergement). Ces prestataires sont soumis à des garanties contractuelles conformes au RGPD.</li>
          <li><strong>Durée de conservation :</strong> les données sont conservées pendant la durée d'utilisation du compte, et supprimées sur demande.</li>
          <li><strong>Vos droits :</strong> accès, rectification, effacement, portabilité, opposition. Pour exercer ces droits : <a href="mailto:auneau.dev@gmail.com" className="underline">auneau.dev@gmail.com</a>.</li>
          <li><strong>Réclamation :</strong> vous pouvez saisir la CNIL à l'adresse <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline">cnil.fr</a>.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">7. Cookies</h2>
        <p className="text-sm text-gray-600">
          Le site utilise uniquement des cookies strictement nécessaires au fonctionnement
          du service : un cookie de session contenant un token d'authentification JWT,
          déposé lors de la connexion et supprimé à la déconnexion. Aucun cookie publicitaire
          ni cookie de mesure d'audience n'est utilisé.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">8. Limitation de responsabilité</h2>
        <p className="text-sm text-gray-600">
          L'éditeur s'efforce d'assurer la disponibilité du service mais ne peut garantir
          une disponibilité continue. L'éditeur ne saurait être tenu responsable des dommages
          directs ou indirects résultant de l'utilisation du service, de l'indisponibilité
          des offres d'emploi tierces, ou de toute erreur dans les données agrégées.
          L'utilisateur est seul responsable de l'usage qu'il fait des informations
          consultées via le service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">9. Contact</h2>
        <p className="text-sm text-gray-600">
          Pour toute question relative aux présentes mentions légales ou à vos données
          personnelles : <a href="mailto:auneau.dev@gmail.com" className="underline">auneau.dev@gmail.com</a>
        </p>
      </section>

      <p className="text-xs text-gray-400">Dernière mise à jour : juin 2026.</p>
    </main>
  )
}
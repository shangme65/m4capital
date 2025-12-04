// Translation dictionary type
export type TranslationKey = keyof typeof translations.en;

// Translations object - add more languages as needed
export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.markets": "Markets",
    "nav.crypto": "Crypto",
    "nav.forex": "Forex",
    "nav.stocks": "Stocks",
    "nav.commodities": "Commodities",
    "nav.indices": "Indices",
    "nav.etfs": "ETFs",
    "nav.analytics": "Analytics",
    "nav.education": "Education",
    "nav.community": "Community",
    "nav.services": "Services",
    "nav.about": "About Us",
    "nav.help": "Help",
    "nav.contact": "Contact Us",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",

    // Hero section
    "hero.title1": "Unlock",
    "hero.title2": "Global",
    "hero.title3": "Markets",
    "hero.description":
      "Trade Forex, stocks, and commodities from a single, powerful platform.",
    "hero.getStarted": "Get Started",
    "hero.tryDemo": "Try Demo",
    "hero.learnMore": "Learn More",

    // Features section
    "features.title": "Why Choose M4Capital?",
    "features.subtitle":
      "Powerful tools and features designed for modern traders",
    "features.security.title": "Bank-Grade Security",
    "features.security.description":
      "Your funds and data are protected with industry-leading security measures",
    "features.trading.title": "Advanced Trading",
    "features.trading.description":
      "Access professional trading tools and real-time market data",
    "features.support.title": "24/7 Support",
    "features.support.description":
      "Our expert team is always available to help you succeed",
    "features.global.title": "Global Markets",
    "features.global.description":
      "Trade on markets worldwide with competitive spreads",

    // How it Works section
    "howItWorks.title": "How It Works",
    "howItWorks.subtitle": "Get started in three simple steps",
    "howItWorks.step1.title": "Create Account",
    "howItWorks.step1.description":
      "Sign up in minutes with our simple registration process",
    "howItWorks.step2.title": "Fund Your Account",
    "howItWorks.step2.description":
      "Deposit using your preferred payment method",
    "howItWorks.step3.title": "Start Trading",
    "howItWorks.step3.description":
      "Access global markets and start your trading journey",

    // Testimonials section
    "testimonials.title": "What Our Traders Say",
    "testimonials.subtitle": "Join thousands of satisfied traders worldwide",

    // FAQ section
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Find answers to common questions about M4Capital",

    // Call to Action section
    "cta.title": "Ready to dive in?",
    "cta.subtitle": "Start your trading journey today with M4Capital",
    "cta.button": "Create an account",
    "cta.badge": "Get Started",

    // Footer
    "footer.copyright": "© 2024 M4Capital. All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.disclaimer": "Trading involves risk",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.portfolio": "Portfolio Value",
    "dashboard.balance": "Balance",
    "dashboard.deposit": "Deposit",
    "dashboard.withdraw": "Withdraw",
    "dashboard.buy": "Buy",
    "dashboard.sell": "Sell",
    "dashboard.transfer": "Transfer",
    "dashboard.swap": "Swap",
    "dashboard.crypto": "Crypto",
    "dashboard.history": "History",
    "dashboard.addCrypto": "Add Crypto",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.view": "View",
    "common.close": "Close",
    "common.submit": "Submit",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.language": "Language",
    "common.chooseLanguage": "Choose Language",
    "common.downloadApp": "Download App",
    "common.marketsAssets": "Markets & Assets",

    // Mobile Menu
    "menu.historicalQuotes": "Historical Quotes",
    "menu.calendars": "Calendars",
    "menu.tradingSpecs": "Trading specifications",
    "menu.videoTutorials": "Video tutorials",
    "menu.marginTrading": "The basics of margin trading",
    "menu.tournaments": "Tournaments",
    "menu.blog": "Our blog",
    "menu.depositsWithdrawals": "Deposits & withdrawals",
    "menu.inNumbers": "In Numbers",
    "menu.press": "In the Press",
    "menu.awards": "Awards",
    "menu.licenses": "Licenses and Safeguards",
  },

  pt: {
    // Navigation
    "nav.home": "Início",
    "nav.dashboard": "Painel",
    "nav.markets": "Mercados",
    "nav.crypto": "Cripto",
    "nav.forex": "Forex",
    "nav.stocks": "Ações",
    "nav.commodities": "Commodities",
    "nav.indices": "Índices",
    "nav.etfs": "ETFs",
    "nav.analytics": "Análises",
    "nav.education": "Educação",
    "nav.community": "Comunidade",
    "nav.services": "Serviços",
    "nav.about": "Sobre Nós",
    "nav.help": "Ajuda",
    "nav.contact": "Contato",
    "nav.login": "Entrar",
    "nav.signup": "Cadastrar",
    "nav.logout": "Sair",

    // Hero section
    "hero.title1": "Desbloqueie",
    "hero.title2": "Mercados",
    "hero.title3": "Globais",
    "hero.description":
      "Negocie Forex, ações e commodities em uma única plataforma poderosa.",
    "hero.getStarted": "Começar Agora",
    "hero.tryDemo": "Experimentar Demo",
    "hero.learnMore": "Saiba Mais",

    // Features section
    "features.title": "Por Que Escolher a M4Capital?",
    "features.subtitle":
      "Ferramentas poderosas projetadas para traders modernos",
    "features.security.title": "Segurança Bancária",
    "features.security.description":
      "Seus fundos e dados são protegidos com medidas de segurança líderes do setor",
    "features.trading.title": "Trading Avançado",
    "features.trading.description":
      "Acesse ferramentas profissionais e dados de mercado em tempo real",
    "features.support.title": "Suporte 24/7",
    "features.support.description":
      "Nossa equipe de especialistas está sempre disponível para ajudá-lo",
    "features.global.title": "Mercados Globais",
    "features.global.description":
      "Negocie em mercados mundiais com spreads competitivos",

    // How it Works section
    "howItWorks.title": "Como Funciona",
    "howItWorks.subtitle": "Comece em três passos simples",
    "howItWorks.step1.title": "Criar Conta",
    "howItWorks.step1.description":
      "Cadastre-se em minutos com nosso processo simples",
    "howItWorks.step2.title": "Depositar Fundos",
    "howItWorks.step2.description":
      "Deposite usando seu método de pagamento preferido",
    "howItWorks.step3.title": "Começar a Negociar",
    "howItWorks.step3.description":
      "Acesse mercados globais e inicie sua jornada de trading",

    // Testimonials section
    "testimonials.title": "O Que Nossos Traders Dizem",
    "testimonials.subtitle":
      "Junte-se a milhares de traders satisfeitos em todo o mundo",

    // FAQ section
    "faq.title": "Perguntas Frequentes",
    "faq.subtitle":
      "Encontre respostas para perguntas comuns sobre a M4Capital",

    // Call to Action section
    "cta.title": "Pronto para começar?",
    "cta.subtitle": "Inicie sua jornada de trading hoje com a M4Capital",
    "cta.button": "Criar uma conta",
    "cta.badge": "Começar",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Todos os direitos reservados.",
    "footer.privacy": "Política de Privacidade",
    "footer.terms": "Termos de Serviço",
    "footer.disclaimer": "Trading envolve risco",

    // Dashboard
    "dashboard.title": "Painel",
    "dashboard.portfolio": "Valor do Portfólio",
    "dashboard.balance": "Saldo",
    "dashboard.deposit": "Depositar",
    "dashboard.withdraw": "Sacar",
    "dashboard.buy": "Comprar",
    "dashboard.sell": "Vender",
    "dashboard.transfer": "Transferir",
    "dashboard.swap": "Trocar",
    "dashboard.crypto": "Cripto",
    "dashboard.history": "Histórico",
    "dashboard.addCrypto": "Adicionar Cripto",

    // Common
    "common.loading": "Carregando...",
    "common.error": "Erro",
    "common.success": "Sucesso",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.save": "Salvar",
    "common.edit": "Editar",
    "common.delete": "Excluir",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.sort": "Ordenar",
    "common.view": "Ver",
    "common.close": "Fechar",
    "common.submit": "Enviar",
    "common.back": "Voltar",
    "common.next": "Próximo",
    "common.previous": "Anterior",
    "common.language": "Idioma",
    "common.chooseLanguage": "Escolher Idioma",
    "common.downloadApp": "Baixar App",
    "common.marketsAssets": "Mercados e Ativos",

    // Mobile Menu
    "menu.historicalQuotes": "Cotações Históricas",
    "menu.calendars": "Calendários",
    "menu.tradingSpecs": "Especificações de trading",
    "menu.videoTutorials": "Tutoriais em vídeo",
    "menu.marginTrading": "Básico de trading com margem",
    "menu.tournaments": "Torneios",
    "menu.blog": "Nosso blog",
    "menu.depositsWithdrawals": "Depósitos e saques",
    "menu.inNumbers": "Em Números",
    "menu.press": "Na Imprensa",
    "menu.awards": "Prêmios",
    "menu.licenses": "Licenças e Salvaguardas",
  },

  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.dashboard": "Panel",
    "nav.markets": "Mercados",
    "nav.crypto": "Cripto",
    "nav.forex": "Forex",
    "nav.stocks": "Acciones",
    "nav.commodities": "Commodities",
    "nav.indices": "Índices",
    "nav.etfs": "ETFs",
    "nav.analytics": "Análisis",
    "nav.education": "Educación",
    "nav.community": "Comunidad",
    "nav.services": "Servicios",
    "nav.about": "Sobre Nosotros",
    "nav.help": "Ayuda",
    "nav.contact": "Contáctanos",
    "nav.login": "Iniciar Sesión",
    "nav.signup": "Registrarse",
    "nav.logout": "Cerrar Sesión",

    // Hero section
    "hero.title1": "Desbloquea",
    "hero.title2": "Mercados",
    "hero.title3": "Globales",
    "hero.description":
      "Opera Forex, acciones y commodities desde una única plataforma poderosa.",
    "hero.getStarted": "Comenzar",
    "hero.tryDemo": "Probar Demo",
    "hero.learnMore": "Saber Más",

    // Features section
    "features.title": "¿Por Qué Elegir M4Capital?",
    "features.subtitle":
      "Herramientas poderosas diseñadas para traders modernos",
    "features.security.title": "Seguridad Bancaria",
    "features.security.description":
      "Tus fondos y datos están protegidos con medidas de seguridad líderes",
    "features.trading.title": "Trading Avanzado",
    "features.trading.description":
      "Accede a herramientas profesionales y datos de mercado en tiempo real",
    "features.support.title": "Soporte 24/7",
    "features.support.description":
      "Nuestro equipo de expertos siempre está disponible para ayudarte",
    "features.global.title": "Mercados Globales",
    "features.global.description":
      "Opera en mercados mundiales con spreads competitivos",

    // How it Works section
    "howItWorks.title": "Cómo Funciona",
    "howItWorks.subtitle": "Comienza en tres simples pasos",
    "howItWorks.step1.title": "Crear Cuenta",
    "howItWorks.step1.description":
      "Regístrate en minutos con nuestro proceso simple",
    "howItWorks.step2.title": "Depositar Fondos",
    "howItWorks.step2.description":
      "Deposita usando tu método de pago preferido",
    "howItWorks.step3.title": "Empezar a Operar",
    "howItWorks.step3.description":
      "Accede a mercados globales y comienza tu viaje de trading",

    // Testimonials section
    "testimonials.title": "Lo Que Dicen Nuestros Traders",
    "testimonials.subtitle":
      "Únete a miles de traders satisfechos en todo el mundo",

    // FAQ section
    "faq.title": "Preguntas Frecuentes",
    "faq.subtitle": "Encuentra respuestas a preguntas comunes sobre M4Capital",

    // Call to Action section
    "cta.title": "¿Listo para empezar?",
    "cta.subtitle": "Comienza tu viaje de trading hoy con M4Capital",
    "cta.button": "Crear una cuenta",
    "cta.badge": "Comenzar",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Todos los derechos reservados.",
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos de Servicio",
    "footer.disclaimer": "El trading implica riesgo",

    // Dashboard
    "dashboard.title": "Panel",
    "dashboard.portfolio": "Valor del Portafolio",
    "dashboard.balance": "Saldo",
    "dashboard.deposit": "Depositar",
    "dashboard.withdraw": "Retirar",
    "dashboard.buy": "Comprar",
    "dashboard.sell": "Vender",
    "dashboard.transfer": "Transferir",
    "dashboard.swap": "Intercambiar",
    "dashboard.crypto": "Cripto",
    "dashboard.history": "Historial",
    "dashboard.addCrypto": "Añadir Cripto",

    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.save": "Guardar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.sort": "Ordenar",
    "common.view": "Ver",
    "common.close": "Cerrar",
    "common.submit": "Enviar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.language": "Idioma",
    "common.chooseLanguage": "Elegir Idioma",
    "common.downloadApp": "Descargar App",
    "common.marketsAssets": "Mercados y Activos",

    // Mobile Menu
    "menu.historicalQuotes": "Cotizaciones Históricas",
    "menu.calendars": "Calendarios",
    "menu.tradingSpecs": "Especificaciones de trading",
    "menu.videoTutorials": "Video tutoriales",
    "menu.marginTrading": "Básicos de trading con margen",
    "menu.tournaments": "Torneos",
    "menu.blog": "Nuestro blog",
    "menu.depositsWithdrawals": "Depósitos y retiros",
    "menu.inNumbers": "En Números",
    "menu.press": "En la Prensa",
    "menu.awards": "Premios",
    "menu.licenses": "Licencias y Salvaguardas",
  },

  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.dashboard": "Tableau de bord",
    "nav.markets": "Marchés",
    "nav.crypto": "Crypto",
    "nav.forex": "Forex",
    "nav.stocks": "Actions",
    "nav.commodities": "Matières premières",
    "nav.indices": "Indices",
    "nav.etfs": "ETFs",
    "nav.analytics": "Analyses",
    "nav.education": "Éducation",
    "nav.community": "Communauté",
    "nav.services": "Services",
    "nav.about": "À propos",
    "nav.help": "Aide",
    "nav.contact": "Contactez-nous",
    "nav.login": "Connexion",
    "nav.signup": "S'inscrire",
    "nav.logout": "Déconnexion",

    // Hero section
    "hero.title1": "Débloquez",
    "hero.title2": "les Marchés",
    "hero.title3": "Mondiaux",
    "hero.description":
      "Tradez le Forex, les actions et les matières premières depuis une seule plateforme puissante.",
    "hero.getStarted": "Commencer",
    "hero.tryDemo": "Essayer la Démo",
    "hero.learnMore": "En savoir plus",

    // Features section
    "features.title": "Pourquoi Choisir M4Capital?",
    "features.subtitle":
      "Des outils puissants conçus pour les traders modernes",
    "features.security.title": "Sécurité Bancaire",
    "features.security.description":
      "Vos fonds et données sont protégés par des mesures de sécurité de pointe",
    "features.trading.title": "Trading Avancé",
    "features.trading.description":
      "Accédez aux outils professionnels et aux données de marché en temps réel",
    "features.support.title": "Support 24/7",
    "features.support.description":
      "Notre équipe d'experts est toujours disponible pour vous aider",
    "features.global.title": "Marchés Mondiaux",
    "features.global.description":
      "Tradez sur les marchés mondiaux avec des spreads compétitifs",

    // How it Works section
    "howItWorks.title": "Comment ça Marche",
    "howItWorks.subtitle": "Commencez en trois étapes simples",
    "howItWorks.step1.title": "Créer un Compte",
    "howItWorks.step1.description":
      "Inscrivez-vous en quelques minutes avec notre processus simple",
    "howItWorks.step2.title": "Déposer des Fonds",
    "howItWorks.step2.description":
      "Déposez en utilisant votre méthode de paiement préférée",
    "howItWorks.step3.title": "Commencer à Trader",
    "howItWorks.step3.description":
      "Accédez aux marchés mondiaux et commencez votre parcours de trading",

    // Testimonials section
    "testimonials.title": "Ce Que Disent Nos Traders",
    "testimonials.subtitle":
      "Rejoignez des milliers de traders satisfaits dans le monde",

    // FAQ section
    "faq.title": "Questions Fréquentes",
    "faq.subtitle":
      "Trouvez des réponses aux questions courantes sur M4Capital",

    // Call to Action section
    "cta.title": "Prêt à commencer?",
    "cta.subtitle":
      "Commencez votre parcours de trading aujourd'hui avec M4Capital",
    "cta.button": "Créer un compte",
    "cta.badge": "Commencer",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Tous droits réservés.",
    "footer.privacy": "Politique de Confidentialité",
    "footer.terms": "Conditions d'Utilisation",
    "footer.disclaimer": "Le trading comporte des risques",

    // Dashboard
    "dashboard.title": "Tableau de bord",
    "dashboard.portfolio": "Valeur du Portefeuille",
    "dashboard.balance": "Solde",
    "dashboard.deposit": "Déposer",
    "dashboard.withdraw": "Retirer",
    "dashboard.buy": "Acheter",
    "dashboard.sell": "Vendre",
    "dashboard.transfer": "Transférer",
    "dashboard.swap": "Échanger",
    "dashboard.crypto": "Crypto",
    "dashboard.history": "Historique",
    "dashboard.addCrypto": "Ajouter Crypto",

    // Common
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
    "common.cancel": "Annuler",
    "common.confirm": "Confirmer",
    "common.save": "Enregistrer",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.sort": "Trier",
    "common.view": "Voir",
    "common.close": "Fermer",
    "common.submit": "Soumettre",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.language": "Langue",
    "common.chooseLanguage": "Choisir la Langue",
    "common.downloadApp": "Télécharger l'App",
    "common.marketsAssets": "Marchés et Actifs",

    // Mobile Menu
    "menu.historicalQuotes": "Cotations Historiques",
    "menu.calendars": "Calendriers",
    "menu.tradingSpecs": "Spécifications de trading",
    "menu.videoTutorials": "Tutoriels vidéo",
    "menu.marginTrading": "Les bases du trading sur marge",
    "menu.tournaments": "Tournois",
    "menu.blog": "Notre blog",
    "menu.depositsWithdrawals": "Dépôts et retraits",
    "menu.inNumbers": "En Chiffres",
    "menu.press": "Dans la Presse",
    "menu.awards": "Récompenses",
    "menu.licenses": "Licences et Garanties",
  },

  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.dashboard": "Dashboard",
    "nav.markets": "Märkte",
    "nav.crypto": "Krypto",
    "nav.forex": "Forex",
    "nav.stocks": "Aktien",
    "nav.commodities": "Rohstoffe",
    "nav.indices": "Indizes",
    "nav.etfs": "ETFs",
    "nav.analytics": "Analysen",
    "nav.education": "Bildung",
    "nav.community": "Community",
    "nav.services": "Dienste",
    "nav.about": "Über Uns",
    "nav.help": "Hilfe",
    "nav.contact": "Kontakt",
    "nav.login": "Anmelden",
    "nav.signup": "Registrieren",
    "nav.logout": "Abmelden",

    // Hero section
    "hero.title1": "Erschließen Sie",
    "hero.title2": "Globale",
    "hero.title3": "Märkte",
    "hero.description":
      "Handeln Sie Forex, Aktien und Rohstoffe von einer einzigen, leistungsstarken Plattform aus.",
    "hero.getStarted": "Jetzt Starten",
    "hero.tryDemo": "Demo Testen",
    "hero.learnMore": "Mehr Erfahren",

    // Features section
    "features.title": "Warum M4Capital Wählen?",
    "features.subtitle": "Leistungsstarke Tools für moderne Trader",
    "features.security.title": "Bankensicherheit",
    "features.security.description":
      "Ihre Gelder und Daten sind mit branchenführenden Sicherheitsmaßnahmen geschützt",
    "features.trading.title": "Fortgeschrittenes Trading",
    "features.trading.description":
      "Zugang zu professionellen Tools und Echtzeit-Marktdaten",
    "features.support.title": "24/7 Support",
    "features.support.description": "Unser Expertenteam ist immer für Sie da",
    "features.global.title": "Globale Märkte",
    "features.global.description":
      "Handeln Sie auf Weltmärkten mit wettbewerbsfähigen Spreads",

    // How it Works section
    "howItWorks.title": "So Funktioniert Es",
    "howItWorks.subtitle": "Starten Sie in drei einfachen Schritten",
    "howItWorks.step1.title": "Konto Erstellen",
    "howItWorks.step1.description": "Registrieren Sie sich in wenigen Minuten",
    "howItWorks.step2.title": "Konto Aufladen",
    "howItWorks.step2.description":
      "Zahlen Sie mit Ihrer bevorzugten Zahlungsmethode ein",
    "howItWorks.step3.title": "Mit dem Handel Beginnen",
    "howItWorks.step3.description":
      "Greifen Sie auf globale Märkte zu und starten Sie Ihre Trading-Reise",

    // Testimonials section
    "testimonials.title": "Was Unsere Trader Sagen",
    "testimonials.subtitle":
      "Schließen Sie sich Tausenden zufriedener Trader weltweit an",

    // FAQ section
    "faq.title": "Häufig Gestellte Fragen",
    "faq.subtitle": "Finden Sie Antworten auf häufige Fragen zu M4Capital",

    // Call to Action section
    "cta.title": "Bereit loszulegen?",
    "cta.subtitle": "Starten Sie Ihre Trading-Reise heute mit M4Capital",
    "cta.button": "Konto erstellen",
    "cta.badge": "Starten",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Alle Rechte vorbehalten.",
    "footer.privacy": "Datenschutzrichtlinie",
    "footer.terms": "Nutzungsbedingungen",
    "footer.disclaimer": "Trading birgt Risiken",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.portfolio": "Portfoliowert",
    "dashboard.balance": "Guthaben",
    "dashboard.deposit": "Einzahlen",
    "dashboard.withdraw": "Abheben",
    "dashboard.buy": "Kaufen",
    "dashboard.sell": "Verkaufen",
    "dashboard.transfer": "Überweisen",
    "dashboard.swap": "Tauschen",
    "dashboard.crypto": "Krypto",
    "dashboard.history": "Verlauf",
    "dashboard.addCrypto": "Krypto Hinzufügen",

    // Common
    "common.loading": "Laden...",
    "common.error": "Fehler",
    "common.success": "Erfolg",
    "common.cancel": "Abbrechen",
    "common.confirm": "Bestätigen",
    "common.save": "Speichern",
    "common.edit": "Bearbeiten",
    "common.delete": "Löschen",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.sort": "Sortieren",
    "common.view": "Ansehen",
    "common.close": "Schließen",
    "common.submit": "Absenden",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.previous": "Zurück",
    "common.language": "Sprache",
    "common.chooseLanguage": "Sprache Wählen",
    "common.downloadApp": "App Herunterladen",
    "common.marketsAssets": "Märkte & Vermögenswerte",

    // Mobile Menu
    "menu.historicalQuotes": "Historische Kurse",
    "menu.calendars": "Kalender",
    "menu.tradingSpecs": "Trading-Spezifikationen",
    "menu.videoTutorials": "Video-Tutorials",
    "menu.marginTrading": "Grundlagen des Margin-Handels",
    "menu.tournaments": "Turniere",
    "menu.blog": "Unser Blog",
    "menu.depositsWithdrawals": "Ein- und Auszahlungen",
    "menu.inNumbers": "In Zahlen",
    "menu.press": "In der Presse",
    "menu.awards": "Auszeichnungen",
    "menu.licenses": "Lizenzen und Sicherheiten",
  },
} as const;

// Helper to get translation with fallback to English
export function getTranslation(language: string, key: TranslationKey): string {
  const lang = language as keyof typeof translations;
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  // Fallback to English
  return translations.en[key] || key;
}

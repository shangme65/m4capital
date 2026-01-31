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
    "hero.slide2.title": "Precision Trading Tools",
    "hero.slide2.description":
      "Leverage advanced charting and analytics for surgical market entry and exit.",
    "hero.slide3.title": "Blazing Fast Execution",
    "hero.slide3.description":
      "Gain a competitive edge with our low-latency infrastructure.",
    "hero.slide4.title": "Your Capital Secured",
    "hero.slide4.description":
      "Trade with confidence, knowing your funds are protected by industry-leading security.",
    "hero.slide5.title": "Next Generation Trading Platform",
    "hero.slide5.description":
      "Experience the pinnacle of trading technology, designed for performance and reliability.",
    "hero.getStarted": "Get Started",
    "hero.tryDemo": "Try Demo",
    "hero.learnMore": "Learn More",

    // Features section
    "features.title": "Why Choose M4Capital?",
    "features.subtitle":
      "Powerful tools and features designed for modern traders",
    "features.badge": "Trade Smarter",
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
    "features.execution.title": "Blazing-Fast Execution",
    "features.execution.description":
      "Execute trades in milliseconds with our high-performance infrastructure",
    "features.community.title": "Community Driven",
    "features.community.description":
      "Join a thriving community of traders and share insights and strategies",

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
    "faq.badge": "FAQ",
    "faq.q1.question": "What is the minimum deposit?",
    "faq.q1.answer":
      "The minimum deposit is $100 for a standard account. This may vary for different account types.",
    "faq.q2.question": "How secure are my funds?",
    "faq.q2.answer":
      "Your funds are held in segregated accounts with top-tier banks. We also use advanced encryption to protect your data.",
    "faq.q3.question": "What are the trading fees?",
    "faq.q3.answer":
      "We offer competitive spreads and low to zero commissions, depending on the account type and asset traded.",
    "faq.q4.question": "How do I withdraw my money?",
    "faq.q4.answer":
      "You can withdraw your funds at any time through the client portal. Withdrawals are typically processed within 24 hours.",

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
    "footer.markets.title": "MARKETS & ASSETS",
    "footer.markets.news": "News feed",
    "footer.markets.assets": "Assets",
    "footer.markets.collections": "Stock collections",
    "footer.markets.industries": "Industries",
    "footer.analytics.title": "ANALYTICS & TOOLS",
    "footer.analytics.quotes": "Historical quotes",
    "footer.analytics.calendars": "Calendars",
    "footer.analytics.specs": "Trading specifications",
    "footer.education.title": "EDUCATION & LEARNING",
    "footer.education.videos": "Video tutorials",
    "footer.education.margin": "The basics of margin trading",
    "footer.events.title": "EVENTS & COMMUNITY",
    "footer.events.blog": "Our blog",
    "footer.about.title": "ABOUT US",
    "footer.about.numbers": "In Numbers",
    "footer.about.press": "In the Press",
    "footer.about.awards": "Awards",
    "footer.about.contact": "Contact Us",
    "footer.about.sitemap": "Sitemap",
    "footer.about.licenses": "Licenses and Safeguards",
    "footer.support.title": "SUPPORT & SERVICES",
    "footer.support.download": "Download app",
    "footer.support.help": "Help",
    "footer.support.deposits": "Deposits & withdrawals",
    "footer.support.terms": "Terms & Conditions",
    "footer.risk.title": "Risk Warning",
    "footer.risk.text1":
      "The Financial Products offered by the company include Contracts for Difference ('CFDs') and other complex financial products. Trading CFDs carries a high level of risk since leverage can work both to your advantage and disadvantage. As a result, CFDs may not be suitable for all investors because it is possible to lose all of your invested capital. You should never invest money that you cannot afford to lose. Before trading in the complex financial products offered, please ensure to understand the risks involved.",
    "footer.risk.text2":
      "You are granted limited non-exclusive non-transferable rights to use the IP provided on this website for personal and non-commercial purposes in relation to the services offered on the Website only.",
    "footer.risk.text3":
      "The information on this website is not directed at residents of certain jurisdictions, including, without limitation, EU/EEA member states, and is not intended for distribution to any person in any country or jurisdiction where such distribution or use would be contrary to local law or regulation.",

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
      "Negocie Forex, ações e commodities em uma única plataforma poderosa.",    "hero.slide2.title": "Ferramentas de Negociação Precisas",
    "hero.slide2.description":
      "Aproveite gráficos avançados e análises para entrada e saída cirúrgica do mercado.",
    "hero.slide3.title": "Execução Ultrarrápida",
    "hero.slide3.description":
      "Ganhe uma vantagem competitiva com nossa infraestrutura de baixa latência.",
    "hero.slide4.title": "Seu Capital Protegido",
    "hero.slide4.description":
      "Negocie com confiança, sabendo que seus fundos estão protegidos por segurança líder do setor.",
    "hero.slide5.title": "Plataforma de Negociação de Próxima Geração",
    "hero.slide5.description":
      "Experimente o ápice da tecnologia de negociação, projetada para desempenho e confiabilidade.",    "hero.getStarted": "Começar Agora",
    "hero.tryDemo": "Experimentar Demo",
    "hero.learnMore": "Saiba Mais",

    // Features section
    "features.title": "Por Que Escolher a M4Capital?",
    "features.subtitle":
      "Ferramentas poderosas projetadas para traders modernos",
    "features.badge": "Negocie de Forma Mais Inteligente",
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
      "Negocie em mercados mundiais com spreads competitivos",    "features.execution.title": "Execução Ultrarrápida",
    "features.execution.description":
      "Execute negociações em milissegundos com nossa infraestrutura de alto desempenho",
    "features.community.title": "Impulsionado pela Comunidade",
    "features.community.description":
      "Junte-se a uma comunidade próspera de traders e compartilhe insights e estratégias",
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
    "faq.badge": "FAQ",
    "faq.q1.question": "Qual é o depósito mínimo?",
    "faq.q1.answer":
      "O depósito mínimo é de $100 para uma conta padrão. Isso pode variar para diferentes tipos de conta.",
    "faq.q2.question": "Quão seguros são meus fundos?",
    "faq.q2.answer":
      "Seus fundos são mantidos em contas segregadas com bancos de primeira linha. Também usamos criptografia avançada para proteger seus dados.",
    "faq.q3.question": "Quais são as taxas de negociação?",
    "faq.q3.answer":
      "Oferecemos spreads competitivos e comissões baixas ou zero, dependendo do tipo de conta e do ativo negociado.",
    "faq.q4.question": "Como faço para sacar meu dinheiro?",
    "faq.q4.answer":
      "Você pode sacar seus fundos a qualquer momento através do portal do cliente. Os saques geralmente são processados em até 24 horas.",

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
    "footer.markets.title": "MERCADOS & ATIVOS",
    "footer.markets.news": "Feed de notícias",
    "footer.markets.assets": "Ativos",
    "footer.markets.collections": "Coleções de ações",
    "footer.markets.industries": "Indústrias",
    "footer.analytics.title": "ANÁLISES & FERRAMENTAS",
    "footer.analytics.quotes": "Cotações históricas",
    "footer.analytics.calendars": "Calendários",
    "footer.analytics.specs": "Especificações de negociação",
    "footer.education.title": "EDUCAÇÃO & APRENDIZADO",
    "footer.education.videos": "Tutoriais em vídeo",
    "footer.education.margin": "Noções básicas de negociação de margem",
    "footer.events.title": "EVENTOS & COMUNIDADE",
    "footer.events.blog": "Nosso blog",
    "footer.about.title": "SOBRE NÓS",
    "footer.about.numbers": "Em Números",
    "footer.about.press": "Na Imprensa",
    "footer.about.awards": "Prêmios",
    "footer.about.contact": "Contate-nos",
    "footer.about.sitemap": "Mapa do site",
    "footer.about.licenses": "Licenças e Salvaguardas",
    "footer.support.title": "SUPORTE & SERVIÇOS",
    "footer.support.download": "Baixar aplicativo",
    "footer.support.help": "Ajuda",
    "footer.support.deposits": "Depósitos e saques",
    "footer.support.terms": "Termos e Condições",
    "footer.risk.title": "Aviso de Risco",
    "footer.risk.text1":
      "Os Produtos Financeiros oferecidos pela empresa incluem Contratos por Diferença ('CFDs') e outros produtos financeiros complexos. Negociar CFDs traz um alto nível de risco, pois a alavancagem pode funcionar tanto a seu favor quanto contra você. Como resultado, os CFDs podem não ser adequados para todos os investidores, pois é possível perder todo o capital investido. Você nunca deve investir dinheiro que não possa perder. Antes de negociar produtos financeiros complexos oferecidos, certifique-se de entender os riscos envolvidos.",
    "footer.risk.text2":
      "Você recebe direitos limitados, não exclusivos e não transferíveis para usar a PI fornecida neste site apenas para fins pessoais e não comerciais em relação aos serviços oferecidos no site.",
    "footer.risk.text3":
      "As informações neste site não são direcionadas a residentes de certas jurisdições, incluindo, sem limitação, estados membros da UE/EEE, e não se destinam à distribuição a qualquer pessoa em qualquer país ou jurisdição onde tal distribuição ou uso seja contrário à lei ou regulamento local.",

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
      "Opera Forex, acciones y commodities desde una única plataforma poderosa.",    "hero.slide2.title": "Herramientas de Trading de Precisión",
    "hero.slide2.description":
      "Aprovecha gráficos avanzados y análisis para entrada y salida quirúrgica del mercado.",
    "hero.slide3.title": "Ejecución Ultrarrápida",
    "hero.slide3.description":
      "Obtén una ventaja competitiva con nuestra infraestructura de baja latencia.",
    "hero.slide4.title": "Tu Capital Asegurado",
    "hero.slide4.description":
      "Opera con confianza, sabiendo que tus fondos están protegidos por seguridad líder en la industria.",
    "hero.slide5.title": "Plataforma de Trading de Nueva Generación",
    "hero.slide5.description":
      "Experimenta el pináculo de la tecnología de trading, diseñada para rendimiento y confiabilidad.",    "hero.getStarted": "Comenzar",
    "hero.tryDemo": "Probar Demo",
    "hero.learnMore": "Saber Más",

    // Features section
    "features.title": "¿Por Qué Elegir M4Capital?",
    "features.subtitle":
      "Herramientas poderosas diseñadas para traders modernos",
    "features.badge": "Opera de Manera Más Inteligente",
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
    "faq.badge": "FAQ",
    "faq.q1.question": "¿Cuál es el depósito mínimo?",
    "faq.q1.answer":
      "El depósito mínimo es de $100 para una cuenta estándar. Esto puede variar para diferentes tipos de cuenta.",
    "faq.q2.question": "¿Qué tan seguros están mis fondos?",
    "faq.q2.answer":
      "Tus fondos se mantienen en cuentas segregadas con bancos de primer nivel. También usamos encriptación avanzada para proteger tus datos.",
    "faq.q3.question": "¿Cuáles son las tarifas de trading?",
    "faq.q3.answer":
      "Ofrecemos spreads competitivos y comisiones bajas o nulas, dependiendo del tipo de cuenta y el activo negociado.",
    "faq.q4.question": "¿Cómo retiro mi dinero?",
    "faq.q4.answer":
      "Puedes retirar tus fondos en cualquier momento a través del portal del cliente. Los retiros generalmente se procesan en 24 horas.",

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
    "footer.markets.title": "MERCADOS Y ACTIVOS",
    "footer.markets.news": "Noticias",
    "footer.markets.assets": "Activos",
    "footer.markets.collections": "Colecciones de acciones",
    "footer.markets.industries": "Industrias",
    "footer.analytics.title": "ANÁLISIS Y HERRAMIENTAS",
    "footer.analytics.quotes": "Cotizaciones históricas",
    "footer.analytics.calendars": "Calendarios",
    "footer.analytics.specs": "Especificaciones de trading",
    "footer.education.title": "EDUCACIÓN Y APRENDIZAJE",
    "footer.education.videos": "Tutoriales en video",
    "footer.education.margin": "Conceptos básicos del trading con margen",
    "footer.events.title": "EVENTOS Y COMUNIDAD",
    "footer.events.blog": "Nuestro blog",
    "footer.about.title": "SOBRE NOSOTROS",
    "footer.about.numbers": "En Números",
    "footer.about.press": "En la Prensa",
    "footer.about.awards": "Premios",
    "footer.about.contact": "Contáctanos",
    "footer.about.sitemap": "Mapa del sitio",
    "footer.about.licenses": "Licencias y Garantías",
    "footer.support.title": "SOPORTE Y SERVICIOS",
    "footer.support.download": "Descargar app",
    "footer.support.help": "Ayuda",
    "footer.support.deposits": "Depósitos y retiros",
    "footer.support.terms": "Términos y Condiciones",
    "footer.risk.title": "Advertencia de Riesgo",
    "footer.risk.text1":
      "Los Productos Financieros ofrecidos por la compañía incluyen Contratos por Diferencia ('CFDs') y otros productos financieros complejos. Operar CFDs conlleva un alto nivel de riesgo, ya que el apalancamiento puede funcionar tanto a tu favor como en tu contra. Como resultado, los CFDs pueden no ser adecuados para todos los inversores porque es posible perder todo el capital invertido. Nunca debes invertir dinero que no puedas permitirte perder. Antes de operar con los productos financieros complejos ofrecidos, asegúrate de comprender los riesgos involucrados.",
    "footer.risk.text2":
      "Se te otorgan derechos limitados, no exclusivos y no transferibles para usar la PI proporcionada en este sitio web solo para fines personales y no comerciales en relación con los servicios ofrecidos en el sitio web.",
    "footer.risk.text3":
      "La información en este sitio web no está dirigida a residentes de ciertas jurisdicciones, incluyendo, sin limitación, estados miembros de la UE/EEE, y no está destinada a la distribución a ninguna persona en ningún país o jurisdicción donde dicha distribución o uso sea contrario a la ley o regulación local.",

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
      "Tradez le Forex, les actions et les matières premières depuis une seule plateforme puissante.",    "hero.slide2.title": "Outils de Trading de Précision",
    "hero.slide2.description":
      "Profitez de graphiques avancés et d'analyses pour une entrée et sortie chirurgicale du marché.",
    "hero.slide3.title": "Exécution Ultra-Rapide",
    "hero.slide3.description":
      "Obtenez un avantage concurrentiel avec notre infrastructure à faible latence.",
    "hero.slide4.title": "Votre Capital Sécurisé",
    "hero.slide4.description":
      "Tradez en toute confiance, sachant que vos fonds sont protégés par une sécurité de pointe.",
    "hero.slide5.title": "Plateforme de Trading Nouvelle Génération",
    "hero.slide5.description":
      "Découvrez le summum de la technologie de trading, conçue pour la performance et la fiabilité.",    "hero.getStarted": "Commencer",
    "hero.tryDemo": "Essayer la Démo",
    "hero.learnMore": "En savoir plus",

    // Features section
    "features.title": "Pourquoi Choisir M4Capital?",
    "features.subtitle":
      "Des outils puissants conçus pour les traders modernes",    "features.badge": "Tradez Plus Intelligemment",    "features.security.title": "Sécurité Bancaire",
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
      "Tradez sur les marchés mondiaux avec des spreads compétitifs",    "features.execution.title": "Exécution Ultra-Rapide",
    "features.execution.description":
      "Exécutez des transactions en millisecondes avec notre infrastructure haute performance",
    "features.community.title": "Piloté par la Communauté",
    "features.community.description":
      "Rejoignez une communauté florissante de traders et partagez des idées et des stratégies",
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
    "faq.badge": "FAQ",
    "faq.q1.question": "Quel est le dépôt minimum?",
    "faq.q1.answer":
      "Le dépôt minimum est de 100 $ pour un compte standard. Cela peut varier pour différents types de comptes.",
    "faq.q2.question": "Mes fonds sont-ils sécurisés?",
    "faq.q2.answer":
      "Vos fonds sont conservés dans des comptes ségrégués auprès de banques de premier rang. Nous utilisons également un cryptage avancé pour protéger vos données.",
    "faq.q3.question": "Quels sont les frais de trading?",
    "faq.q3.answer":
      "Nous offrons des spreads compétitifs et des commissions faibles ou nulles, selon le type de compte et l'actif négocié.",
    "faq.q4.question": "Comment retirer mon argent?",
    "faq.q4.answer":
      "Vous pouvez retirer vos fonds à tout moment via le portail client. Les retraits sont généralement traités sous 24 heures.",

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
    "footer.markets.title": "MARCHÉS ET ACTIFS",
    "footer.markets.news": "Fil d'actualité",
    "footer.markets.assets": "Actifs",
    "footer.markets.collections": "Collections d'actions",
    "footer.markets.industries": "Industries",
    "footer.analytics.title": "ANALYSES ET OUTILS",
    "footer.analytics.quotes": "Cotations historiques",
    "footer.analytics.calendars": "Calendriers",
    "footer.analytics.specs": "Spécifications de trading",
    "footer.education.title": "ÉDUCATION ET APPRENTISSAGE",
    "footer.education.videos": "Tutoriels vidéo",
    "footer.education.margin": "Les bases du trading sur marge",
    "footer.events.title": "ÉVÉNEMENTS ET COMMUNAUTÉ",
    "footer.events.blog": "Notre blog",
    "footer.about.title": "À PROPOS",
    "footer.about.numbers": "En Chiffres",
    "footer.about.press": "Dans la Presse",
    "footer.about.awards": "Prix",
    "footer.about.contact": "Nous Contacter",
    "footer.about.sitemap": "Plan du site",
    "footer.about.licenses": "Licences et Garanties",
    "footer.support.title": "SUPPORT ET SERVICES",
    "footer.support.download": "Télécharger l'app",
    "footer.support.help": "Aide",
    "footer.support.deposits": "Dépôts et retraits",
    "footer.support.terms": "Termes et Conditions",
    "footer.risk.title": "Avertissement sur les Risques",
    "footer.risk.text1":
      "Les Produits Financiers offerts par la société incluent les Contrats pour Différence ('CFD') et d'autres produits financiers complexes. Le trading de CFD comporte un niveau élevé de risque car l'effet de levier peut jouer en votre faveur ou à votre désavantage. Par conséquent, les CFD peuvent ne pas convenir à tous les investisseurs car il est possible de perdre tout votre capital investi. Vous ne devez jamais investir de l'argent que vous ne pouvez pas vous permettre de perdre. Avant de trader des produits financiers complexes offerts, assurez-vous de comprendre les risques encourus.",
    "footer.risk.text2":
      "Vous bénéficiez de droits limités, non exclusifs et non transférables pour utiliser la PI fournie sur ce site Web uniquement à des fins personnelles et non commerciales en relation avec les services offerts sur le site Web.",
    "footer.risk.text3":
      "Les informations sur ce site Web ne sont pas destinées aux résidents de certaines juridictions, y compris, sans limitation, les États membres de l'UE/EEE, et ne sont pas destinées à la distribution à toute personne dans un pays ou une juridiction où une telle distribution ou utilisation serait contraire à la loi ou à la réglementation locale.",

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
    "hero.slide2.title": "Präzise Trading-Tools",
    "hero.slide2.description":
      "Nutzen Sie fortschrittliche Charts und Analysen für präzise Markteinstiege und -ausstiege.",
    "hero.slide3.title": "Blitzschnelle Ausführung",
    "hero.slide3.description":
      "Verschaffen Sie sich einen Wettbewerbsvorteil mit unserer Low-Latency-Infrastruktur.",
    "hero.slide4.title": "Ihr Kapital Gesichert",
    "hero.slide4.description":
      "Handeln Sie mit Vertrauen, wissend dass Ihre Gelder durch branchenführende Sicherheit geschützt sind.",
    "hero.slide5.title": "Handelsplattform der Nächsten Generation",
    "hero.slide5.description":
      "Erleben Sie den Höhepunkt der Trading-Technologie, entwickelt für Leistung und Zuverlässigkeit.",
    "hero.getStarted": "Jetzt Starten",
    "hero.tryDemo": "Demo Testen",
    "hero.learnMore": "Mehr Erfahren",

    // Features section
    "features.title": "Warum M4Capital Wählen?",
    "features.subtitle": "Leistungsstarke Tools für moderne Trader",
    "features.badge": "Intelligenter Handeln",
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
    "features.execution.title": "Blitzschnelle Ausführung",
    "features.execution.description":
      "Führen Sie Trades in Millisekunden mit unserer Hochleistungsinfrastruktur aus",
    "features.community.title": "Community-getrieben",
    "features.community.description":
      "Treten Sie einer florierenden Trader-Community bei und teilen Sie Einblicke und Strategien",

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
    "faq.badge": "FAQ",
    "faq.q1.question": "Was ist die Mindesteinzahlung?",
    "faq.q1.answer":
      "Die Mindesteinzahlung beträgt 100 $ für ein Standardkonto. Dies kann je nach Kontotyp variieren.",
    "faq.q2.question": "Wie sicher sind meine Gelder?",
    "faq.q2.answer":
      "Ihre Gelder werden auf segregierten Konten bei erstklassigen Banken verwahrt. Wir verwenden auch fortschrittliche Verschlüsselung zum Schutz Ihrer Daten.",
    "faq.q3.question": "Was sind die Handelsgebühren?",
    "faq.q3.answer":
      "Wir bieten wettbewerbsfähige Spreads und niedrige bis keine Provisionen, abhängig vom Kontotyp und dem gehandelten Asset.",
    "faq.q4.question": "Wie hebe ich mein Geld ab?",
    "faq.q4.answer":
      "Sie können Ihre Gelder jederzeit über das Kundenportal abheben. Auszahlungen werden in der Regel innerhalb von 24 Stunden bearbeitet.",

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
    "footer.markets.title": "MÄRKTE & ANLAGEN",
    "footer.markets.news": "Nachrichten",
    "footer.markets.assets": "Anlagen",
    "footer.markets.collections": "Aktiensammlungen",
    "footer.markets.industries": "Branchen",
    "footer.analytics.title": "ANALYSEN & WERKZEUGE",
    "footer.analytics.quotes": "Historische Kurse",
    "footer.analytics.calendars": "Kalender",
    "footer.analytics.specs": "Handelsspezifikationen",
    "footer.education.title": "BILDUNG & LERNEN",
    "footer.education.videos": "Video-Tutorials",
    "footer.education.margin": "Grundlagen des Margin-Handels",
    "footer.events.title": "VERANSTALTUNGEN & COMMUNITY",
    "footer.events.blog": "Unser Blog",
    "footer.about.title": "ÜBER UNS",
    "footer.about.numbers": "In Zahlen",
    "footer.about.press": "In der Presse",
    "footer.about.awards": "Auszeichnungen",
    "footer.about.contact": "Kontaktieren Sie uns",
    "footer.about.sitemap": "Sitemap",
    "footer.about.licenses": "Lizenzen und Schutzmaßnahmen",
    "footer.support.title": "SUPPORT & SERVICES",
    "footer.support.download": "App herunterladen",
    "footer.support.help": "Hilfe",
    "footer.support.deposits": "Ein- und Auszahlungen",
    "footer.support.terms": "Geschäftsbedingungen",
    "footer.risk.title": "Risikowarnung",
    "footer.risk.text1":
      "Die von der Gesellschaft angebotenen Finanzprodukte umfassen Differenzkontrakte ('CFDs') und andere komplexe Finanzprodukte. Der Handel mit CFDs birgt ein hohes Risiko, da die Hebelwirkung sowohl zu Ihren Gunsten als auch zu Ihren Ungunsten wirken kann. Infolgedessen sind CFDs möglicherweise nicht für alle Anleger geeignet, da es möglich ist, Ihr gesamtes investiertes Kapital zu verlieren. Sie sollten niemals Geld investieren, dessen Verlust Sie sich nicht leisten können. Bevor Sie mit den angebotenen komplexen Finanzprodukten handeln, stellen Sie bitte sicher, dass Sie die damit verbundenen Risiken verstehen.",
    "footer.risk.text2":
      "Sie erhalten eingeschränkte, nicht exklusive und nicht übertragbare Rechte zur Nutzung des auf dieser Website bereitgestellten geistigen Eigentums nur für persönliche und nicht kommerzielle Zwecke in Bezug auf die auf der Website angebotenen Dienste.",
    "footer.risk.text3":
      "Die Informationen auf dieser Website richten sich nicht an Einwohner bestimmter Gerichtsbarkeiten, einschließlich, aber nicht beschränkt auf, EU/EWR-Mitgliedstaaten, und sind nicht für die Verteilung an Personen in Ländern oder Gerichtsbarkeiten bestimmt, in denen eine solche Verteilung oder Nutzung gegen lokale Gesetze oder Vorschriften verstoßen würde.",

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

  fil: {
    // Hero section
    "hero.slide1.title": "Kalakalan sa Hinaharap ng Crypto",
    "hero.slide1.description":
      "Magtayo ng iyong portfolio gamit ang mga nangungunang cryptocurrency at mga advanced trading tools",
    "hero.slide2.title": "Seguridad sa Antas ng Bangko",
    "hero.slide2.description":
      "Ang iyong pondo ay protektado ng industriya-pamantayan na encryption at multi-layer na seguridad",
    "hero.slide3.title": "Napakabilis na Pagsasagawa",
    "hero.slide3.description":
      "Makakuha ng competitive edge gamit ang aming low-latency infrastructure",
    "hero.slide4.title": "Ang Iyong Kapital ay Protektado",
    "hero.slide4.description":
      "Magtrade nang may kumpiyansa, alam na ang iyong pondo ay protektado ng nangunguna sa industriya na seguridad",
    "hero.slide5.title": "Susunod na Henerasyon ng Trading Platform",
    "hero.slide5.description":
      "Maranasan ang rurok ng trading technology, na dinisenyo para sa performance at reliability",
    "hero.getStarted": "Magsimula",
    "hero.tryDemo": "Subukan ang Demo",
    "hero.learnMore": "Matuto Pa",

    // Features section
    "features.title": "Bakit Piliin ang M4Capital?",
    "features.subtitle":
      "Malakas na mga tool na dinisenyo para sa mga modernong trader",
    "features.badge": "Magtrade nang Mas Matalino",
    "features.security.title": "Seguridad sa Antas ng Bangko",
    "features.security.description":
      "Ang iyong pondo at data ay protektado ng pinakamahusay na mga hakbang sa seguridad",
    "features.trading.title": "Advanced Trading",
    "features.trading.description":
      "Access sa propesyonal na trading tools at real-time market data",
    "features.support.title": "24/7 Support",
    "features.support.description":
      "Ang aming expert team ay laging available upang tumulong sa iyo",
    "features.global.title": "Pandaigdigang Merkado",
    "features.global.description":
      "Magtrade sa mga merkado sa buong mundo na may competitive spreads",
    "features.execution.title": "Napakabilis na Pagsasagawa",
    "features.execution.description":
      "Magsagawa ng trades sa milliseconds gamit ang aming high-performance infrastructure",
    "features.community.title": "Community Driven",
    "features.community.description":
      "Sumali sa isang umuunlad na komunidad ng mga trader at magbahagi ng insights at strategies",

    // How it Works section
    "howItWorks.title": "Paano Ito Gumagana",
    "howItWorks.subtitle": "Magsimula sa tatlong simpleng hakbang",
    "howItWorks.step1.title": "Lumikha ng Account",
    "howItWorks.step1.description":
      "Mag-sign up sa loob ng ilang minuto gamit ang aming simpleng proseso",
    "howItWorks.step2.title": "Magdeposito ng Pondo",
    "howItWorks.step2.description":
      "Magdeposito gamit ang iyong gustong paraan ng pagbabayad",
    "howItWorks.step3.title": "Magsimulang Magtrade",
    "howItWorks.step3.description":
      "Access sa pandaigdigang merkado at simulan ang iyong trading journey",

    // Testimonials section
    "testimonials.title": "Ano ang Sinasabi ng Aming Mga Trader",
    "testimonials.subtitle":
      "Sumali sa libu-libong satisfied traders sa buong mundo",

    // FAQ section
    "faq.title": "Madalas Itanong",
    "faq.subtitle": "Maghanap ng mga sagot sa karaniwang tanong tungkol sa M4Capital",
    "faq.badge": "FAQ",
    "faq.q1.question": "Ano ang minimum deposit?",
    "faq.q1.answer":
      "Ang minimum deposit ay $100 para sa standard account. Maaaring mag-iba ito para sa iba't ibang uri ng account.",
    "faq.q2.question": "Gaano kasigurado ang aking pondo?",
    "faq.q2.answer":
      "Ang iyong pondo ay naka-imbak sa segregated accounts sa mga nangungunang bangko. Gumagamit din kami ng advanced encryption para protektahan ang iyong data.",
    "faq.q3.question": "Ano ang mga bayad sa trading?",
    "faq.q3.answer":
      "Nag-aalok kami ng competitive spreads at mababa hanggang walang commissions, depende sa uri ng account at asset na tinatrade.",
    "faq.q4.question": "Paano ko maiwithdraw ang aking pera?",
    "faq.q4.answer":
      "Maaari mong i-withdraw ang iyong pondo anumang oras sa pamamagitan ng client portal. Ang mga withdrawal ay karaniwang napoproseso sa loob ng 24 oras.",

    // Call to Action section
    "cta.title": "Handa nang magsimula?",
    "cta.subtitle": "Simulan ang iyong trading journey ngayon kasama ang M4Capital",
    "cta.button": "Lumikha ng account",
    "cta.badge": "Magsimula",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Lahat ng karapatan ay nakalaan.",
    "footer.privacy": "Patakaran sa Privacy",
    "footer.terms": "Mga Tuntunin ng Serbisyo",
    "footer.disclaimer": "Ang trading ay may kasamang panganib",
    "footer.markets.title": "MGA MERKADO AT ASSETS",
    "footer.markets.news": "News feed",
    "footer.markets.assets": "Mga Asset",
    "footer.markets.collections": "Mga koleksyon ng stock",
    "footer.markets.industries": "Mga Industriya",
    "footer.analytics.title": "ANALYTICS AT MGA TOOL",
    "footer.analytics.quotes": "Historikal na quotes",
    "footer.analytics.calendars": "Mga Kalendaryo",
    "footer.analytics.specs": "Mga spesipikasyon sa trading",
    "footer.education.title": "EDUKASYON AT PAGKATUTO",
    "footer.education.videos": "Mga video tutorial",
    "footer.education.margin": "Mga pangunahing kaalaman sa margin trading",
    "footer.events.title": "MGA KAGANAPAN AT KOMUNIDAD",
    "footer.events.blog": "Ang aming blog",
    "footer.about.title": "TUNGKOL SA AMIN",
    "footer.about.numbers": "Sa Mga Numero",
    "footer.about.press": "Sa Press",
    "footer.about.awards": "Mga Parangal",
    "footer.about.contact": "Makipag-ugnayan sa Amin",
    "footer.about.sitemap": "Sitemap",
    "footer.about.licenses": "Mga Lisensya at Proteksyon",
    "footer.support.title": "SUPORTA AT MGA SERBISYO",
    "footer.support.download": "I-download ang app",
    "footer.support.help": "Tulong",
    "footer.support.deposits": "Mga deposito at withdrawal",
    "footer.support.terms": "Mga Tuntunin at Kondisyon",
    "footer.risk.title": "Babala sa Panganib",
    "footer.risk.text1":
      "Ang mga Produktong Pinansyal na inaalok ng kumpanya ay kinabibilangan ng Contracts for Difference ('CFDs') at iba pang komplikadong produktong pinansyal. Ang pag-trade ng CFDs ay may mataas na antas ng panganib dahil ang leverage ay maaaring gumana alinman sa iyong kalamangan o kapahamakan. Bilang resulta, ang mga CFD ay maaaring hindi angkop para sa lahat ng namumuhunan dahil posible na mawala ang lahat ng iyong namuhunan na kapital. Hindi ka dapat mamuhunan ng pera na hindi mo kayang mawala. Bago mag-trade sa mga komplikadong produktong pinansyal na inaalok, pakitiyak na nauunawaan mo ang mga panganib na kasangkot.",
    "footer.risk.text2":
      "Binibigyan ka ng limitadong hindi eksklusibo at hindi mailipat na mga karapatan na gamitin ang IP na ibinigay sa website na ito para lamang sa personal at non-commercial na layunin kaugnay ng mga serbisyong inaalok sa Website.",
    "footer.risk.text3":
      "Ang impormasyon sa website na ito ay hindi nakadirekta sa mga residente ng ilang partikular na hurisdiksyon, kabilang ang, ngunit hindi limitado sa, mga miyembro ng estado ng EU/EEA, at hindi inilaan para sa pamamahagi sa sinumang tao sa anumang bansa o hurisdiksyon kung saan ang naturang pamamahagi o paggamit ay salungat sa lokal na batas o regulasyon.",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.portfolio": "Halaga ng Portfolio",
    "dashboard.balance": "Balanse",
    "dashboard.deposit": "Magdeposito",
    "dashboard.withdraw": "Mag-withdraw",
    "dashboard.buy": "Bumili",
    "dashboard.sell": "Magbenta",
    "dashboard.transfer": "Maglipat",
    "dashboard.swap": "Magpalit",
    "dashboard.crypto": "Crypto",
    "dashboard.history": "Kasaysayan",
    "dashboard.addCrypto": "Magdagdag ng Crypto",

    // Common
    "common.loading": "Naglo-load...",
    "common.error": "Error",
    "common.success": "Tagumpay",
    "common.cancel": "Kanselahin",
    "common.confirm": "Kumpirmahin",
    "common.save": "I-save",
    "common.edit": "I-edit",
    "common.delete": "Tanggalin",
    "common.search": "Maghanap",
    "common.filter": "Salain",
    "common.sort": "Ayusin",
    "common.view": "Tingnan",
    "common.close": "Isara",
    "common.submit": "Isumite",
    "common.back": "Bumalik",
    "common.next": "Susunod",
    "common.previous": "Nakaraan",
    "common.language": "Wika",
    "common.chooseLanguage": "Pumili ng Wika",
    "common.downloadApp": "I-download ang App",
    "common.marketsAssets": "Mga Merkado at Assets",

    // Mobile Menu
    "menu.historicalQuotes": "Historikal na Quotes",
    "menu.calendars": "Mga Kalendaryo",
    "menu.tradingSpecs": "Mga spesipikasyon sa trading",
    "menu.videoTutorials": "Mga video tutorial",
    "menu.marginTrading": "Mga pangunahing kaalaman sa margin trading",
    "menu.tournaments": "Mga Torneo",
    "menu.blog": "Ang aming blog",
    "menu.depositsWithdrawals": "Mga deposito at withdrawal",
    "menu.inNumbers": "Sa Mga Numero",
    "menu.press": "Sa Press",
    "menu.awards": "Mga Parangal",
    "menu.licenses": "Mga Lisensya at Sicherheiten",
  },

  hi: {
    // Hero section
    "hero.slide1.title": "क्रिप्टो के भविष्य में व्यापार करें",
    "hero.slide1.description":
      "शीर्ष क्रिप्टोकरेंसी और उन्नत ट्रेडिंग टूल्स के साथ अपना पोर्टफोलियो बनाएं",
    "hero.slide2.title": "बैंक-ग्रेड सुरक्षा",
    "hero.slide2.description":
      "आपका फंड उद्योग-मानक एन्क्रिप्शन और बहु-स्तरीय सुरक्षा द्वारा संरक्षित है",
    "hero.slide3.title": "अति-तेज निष्पादन",
    "hero.slide3.description":
      "हमारे कम-विलंबता बुनियादी ढांचे के साथ प्रतिस्पर्धी बढ़त प्राप्त करें",
    "hero.slide4.title": "आपकी पूंजी सुरक्षित",
    "hero.slide4.description":
      "विश्वास के साथ व्यापार करें, यह जानते हुए कि आपका फंड उद्योग-अग्रणी सुरक्षा द्वारा संरक्षित है",
    "hero.slide5.title": "अगली पीढ़ी का ट्रेडिंग प्लेटफॉर्म",
    "hero.slide5.description":
      "प्रदर्शन और विश्वसनीयता के लिए डिज़ाइन की गई ट्रेडिंग तकनीक के शिखर का अनुभव करें",
    "hero.getStarted": "शुरू करें",
    "hero.tryDemo": "डेमो आज़माएं",
    "hero.learnMore": "और जानें",

    // Features section
    "features.title": "M4Capital क्यों चुनें?",
    "features.subtitle":
      "आधुनिक व्यापारियों के लिए डिज़ाइन किए गए शक्तिशाली उपकरण",
    "features.badge": "अधिक स्मार्ट तरीके से व्यापार करें",
    "features.security.title": "बैंक-ग्रेड सुरक्षा",
    "features.security.description":
      "आपका फंड और डेटा उद्योग-अग्रणी सुरक्षा उपायों से सुरक्षित है",
    "features.trading.title": "उन्नत ट्रेडिंग",
    "features.trading.description":
      "पेशेवर ट्रेडिंग टूल्स और रियल-टाइम मार्केट डेटा तक पहुंच",
    "features.support.title": "24/7 सहायता",
    "features.support.description":
      "हमारी विशेषज्ञ टीम आपकी सफलता में मदद के लिए हमेशा उपलब्ध है",
    "features.global.title": "वैश्विक बाजार",
    "features.global.description":
      "प्रतिस्पर्धी स्प्रेड के साथ दुनिया भर के बाजारों में व्यापार करें",
    "features.execution.title": "अति-तेज निष्पादन",
    "features.execution.description":
      "हमारे उच्च-प्रदर्शन बुनियादी ढांचे के साथ मिलीसेकंड में ट्रेड निष्पादित करें",
    "features.community.title": "समुदाय संचालित",
    "features.community.description":
      "व्यापारियों के एक संपन्न समुदाय में शामिल हों और अंतर्दृष्टि और रणनीतियों को साझा करें",

    // How it Works section
    "howItWorks.title": "यह कैसे काम करता है",
    "howItWorks.subtitle": "तीन सरल चरणों में शुरू करें",
    "howItWorks.step1.title": "खाता बनाएं",
    "howItWorks.step1.description":
      "हमारी सरल प्रक्रिया के साथ मिनटों में साइन अप करें",
    "howItWorks.step2.title": "फंड जमा करें",
    "howItWorks.step2.description":
      "अपनी पसंदीदा भुगतान विधि का उपयोग करके जमा करें",
    "howItWorks.step3.title": "ट्रेडिंग शुरू करें",
    "howItWorks.step3.description":
      "वैश्विक बाजारों तक पहुंचें और अपनी ट्रेडिंग यात्रा शुरू करें",

    // Testimonials section
    "testimonials.title": "हमारे व्यापारी क्या कहते हैं",
    "testimonials.subtitle":
      "दुनिया भर में हजारों संतुष्ट व्यापारियों के साथ जुड़ें",

    // FAQ section
    "faq.title": "अक्सर पूछे जाने वाले प्रश्न",
    "faq.subtitle": "M4Capital के बारे में सामान्य प्रश्नों के उत्तर खोजें",
    "faq.badge": "FAQ",
    "faq.q1.question": "न्यूनतम जमा राशि क्या है?",
    "faq.q1.answer":
      "मानक खाते के लिए न्यूनतम जमा $100 है। यह विभिन्न खाता प्रकारों के लिए भिन्न हो सकता है।",
    "faq.q2.question": "मेरा फंड कितना सुरक्षित है?",
    "faq.q2.answer":
      "आपका फंड शीर्ष-स्तरीय बैंकों के साथ अलग खातों में रखा जाता है। हम आपके डेटा की सुरक्षा के लिए उन्नत एन्क्रिप्शन का भी उपयोग करते हैं।",
    "faq.q3.question": "ट्रेडिंग शुल्क क्या हैं?",
    "faq.q3.answer":
      "हम खाता प्रकार और व्यापार किए गए परिसंपत्ति के आधार पर प्रतिस्पर्धी स्प्रेड और कम से शून्य कमीशन प्रदान करते हैं।",
    "faq.q4.question": "मैं अपना पैसा कैसे निकालूं?",
    "faq.q4.answer":
      "आप क्लाइंट पोर्टल के माध्यम से किसी भी समय अपना फंड निकाल सकते हैं। निकासी आमतौर पर 24 घंटों के भीतर संसाधित की जाती है।",

    // Call to Action section
    "cta.title": "शुरू करने के लिए तैयार हैं?",
    "cta.subtitle": "M4Capital के साथ आज ही अपनी ट्रेडिंग यात्रा शुरू करें",
    "cta.button": "खाता बनाएं",
    "cta.badge": "शुरू करें",

    // Footer
    "footer.copyright": "© 2024 M4Capital। सर्वाधिकार सुरक्षित।",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "footer.disclaimer": "ट्रेडिंग में जोखिम शामिल है",
    "footer.markets.title": "बाजार और परिसंपत्तियां",
    "footer.markets.news": "समाचार फ़ीड",
    "footer.markets.assets": "परिसंपत्तियां",
    "footer.markets.collection": "स्टॉक संग्रह",
    "footer.markets.industries": "उद्योग",
    "footer.analytics.title": "विश्लेषण और उपकरण",
    "footer.analytics.quotes": "ऐतिहासिक उद्धरण",
    "footer.analytics.calendars": "कैलेंडर",
    "footer.analytics.specs": "ट्रेडिंग विनिर्देश",
    "footer.education.title": "शिक्षा और सीखना",
    "footer.education.videos": "वीडियो ट्यूटोरियल",
    "footer.education.margin": "मार्जिन ट्रेडिंग की मूल बातें",
    "footer.events.title": "कार्यक्रम और समुदाय",
    "footer.events.blog": "हमारा ब्लॉग",
    "footer.about.title": "हमारे बारे में",
    "footer.about.numbers": "संख्या में",
    "footer.about.press": "प्रेस में",
    "footer.about.awards": "पुरस्कार",
    "footer.about.contact": "हमसे संपर्क करें",
    "footer.about.sitemap": "साइटमैप",
    "footer.about.licenses": "लाइसेंस और सुरक्षा उपाय",
    "footer.support.title": "सहायता और सेवाएं",
    "footer.support.download": "ऐप डाउनलोड करें",
    "footer.support.help": "मदद",
    "footer.support.deposits": "जमा और निकासी",
    "footer.support.terms": "नियम और शर्तें",
    "footer.risk.title": "जोखिम चेतावनी",
    "footer.risk.text1":
      "कंपनी द्वारा पेश किए गए वित्तीय उत्पादों में अंतर के लिए अनुबंध ('CFDs') और अन्य जटिल वित्तीय उत्पाद शामिल हैं। CFDs का व्यापार उच्च स्तर के जोखिम को वहन करता है क्योंकि लीवरेज आपके लाभ और नुकसान दोनों के लिए काम कर सकता है। परिणामस्वरूप, CFDs सभी निवेशकों के लिए उपयुक्त नहीं हो सकते क्योंकि आपकी सभी निवेशित पूंजी खोना संभव है। आपको कभी भी ऐसा पैसा निवेश नहीं करना चाहिए जिसे आप खोने का जोखिम नहीं उठा सकते। पेश किए गए जटिल वित्तीय उत्पादों में व्यापार करने से पहले, कृपया सुनिश्चित करें कि आप शामिल जोखिमों को समझते हैं।",
    "footer.risk.text2":
      "आपको इस वेबसाइट पर प्रदान की गई IP का उपयोग केवल वेबसाइट पर प्रदान की गई सेवाओं के संबंध में व्यक्तिगत और गैर-वाणिज्यिक उद्देश्यों के लिए सीमित गैर-अनन्य गैर-हस्तांतरणीय अधिकार दिए गए हैं।",
    "footer.risk.text3":
      "इस वेबसाइट पर जानकारी कुछ अधिकार क्षेत्रों के निवासियों को निर्देशित नहीं है, जिसमें EU/EEA सदस्य राज्य शामिल हैं, लेकिन इन्हीं तक सीमित नहीं है, और किसी भी देश या अधिकार क्षेत्र में किसी भी व्यक्ति को वितरण के लिए अभिप्रेत नहीं है जहां ऐसा वितरण या उपयोग स्थानीय कानून या विनियमन के विपरीत होगा।",

    // Dashboard
    "dashboard.title": "डैशबोर्ड",
    "dashboard.portfolio": "पोर्टफोलियो मूल्य",
    "dashboard.balance": "शेष राशि",
    "dashboard.deposit": "जमा करें",
    "dashboard.withdraw": "निकालें",
    "dashboard.buy": "खरीदें",
    "dashboard.sell": "बेचें",
    "dashboard.transfer": "स्थानांतरण",
    "dashboard.swap": "स्वैप",
    "dashboard.crypto": "क्रिप्टो",
    "dashboard.history": "इतिहास",
    "dashboard.addCrypto": "क्रिप्टो जोड़ें",

    // Common
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफलता",
    "common.cancel": "रद्द करें",
    "common.confirm": "पुष्टि करें",
    "common.save": "सहेजें",
    "common.edit": "संपादित करें",
    "common.delete": "हटाएं",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर करें",
    "common.sort": "क्रमबद्ध करें",
    "common.view": "देखें",
    "common.close": "बंद करें",
    "common.submit": "सबमिट करें",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.previous": "पिछला",
    "common.language": "भाषा",
    "common.chooseLanguage": "भाषा चुनें",
    "common.downloadApp": "ऐप डाउनलोड करें",
    "common.marketsAssets": "बाजार और परिसंपत्तियां",

    // Mobile Menu
    "menu.historicalQuotes": "ऐतिहासिक उद्धरण",
    "menu.calendars": "कैलेंडर",
    "menu.tradingSpecs": "ट्रेडिंग विनिर्देश",
    "menu.videoTutorials": "वीडियो ट्यूटोरियल",
    "menu.marginTrading": "मार्जिन ट्रेडिंग की मूल बातें",
    "menu.tournaments": "प्रतियोगिताएं",
    "menu.blog": "हमारा ब्लॉग",
    "menu.depositsWithdrawals": "जमा और निकासी",
    "menu.inNumbers": "संख्या में",
    "menu.press": "प्रेस में",
    "menu.awards": "पुरस्कार",
    "menu.licenses": "लाइसेंस और सुरक्षा उपाय",
  },

  ja: {
    // Navigation
    "nav.home": "ホーム",
    "nav.dashboard": "ダッシュボード",
    "nav.markets": "マーケット",
    "nav.crypto": "暗号資産",
    "nav.forex": "外国為替",
    "nav.stocks": "株式",
    "nav.commodities": "商品",
    "nav.indices": "指数",
    "nav.etfs": "ETF",
    "nav.analytics": "分析",
    "nav.education": "教育",
    "nav.community": "コミュニティ",
    "nav.services": "サービス",
    "nav.about": "会社概要",
    "nav.help": "ヘルプ",
    "nav.contact": "お問い合わせ",
    "nav.login": "ログイン",
    "nav.signup": "登録",
    "nav.logout": "ログアウト",

    // Hero section
    "hero.slide1.title": "暗号資産の未来を取引する",
    "hero.slide1.description":
      "トップクラスの暗号通貨と高度な取引ツールでポートフォリオを構築",
    "hero.slide2.title": "銀行レベルのセキュリティ",
    "hero.slide2.description":
      "業界標準の暗号化と多層セキュリティでお客様の資金を保護",
    "hero.slide3.title": "超高速実行",
    "hero.slide3.description":
      "低遅延インフラで競争力のあるエッジを獲得",
    "hero.slide4.title": "お客様の資本は安全です",
    "hero.slide4.description":
      "お客様の資金が業界最高水準のセキュリティで保護されていることを知り、安心して取引",
    "hero.slide5.title": "次世代取引プラットフォーム",
    "hero.slide5.description":
      "パフォーマンスと信頼性のために設計された取引技術の頂点を体験",
    "hero.getStarted": "始める",
    "hero.tryDemo": "デモを試す",
    "hero.learnMore": "詳細を見る",

    // Features section
    "features.title": "なぜM4Capitalを選ぶのか？",
    "features.subtitle": "現代のトレーダーのために設計された強力なツール",
    "features.badge": "よりスマートに取引",
    "features.security.title": "銀行レベルのセキュリティ",
    "features.security.description":
      "お客様の資金とデータは業界最高水準のセキュリティ対策で保護されています",
    "features.trading.title": "高度な取引",
    "features.trading.description":
      "プロフェッショナル取引ツールとリアルタイム市場データへのアクセス",
    "features.support.title": "24時間365日サポート",
    "features.support.description":
      "専門家チームがお客様の成功を常にサポート",
    "features.global.title": "グローバル市場",
    "features.global.description":
      "競争力のあるスプレッドで世界中の市場を取引",
    "features.execution.title": "超高速実行",
    "features.execution.description":
      "高性能インフラでミリ秒単位で取引を実行",
    "features.community.title": "コミュニティ主導",
    "features.community.description":
      "活気あるトレーダーコミュニティに参加して、洞察と戦略を共有",

    // How it Works section
    "howItWorks.title": "仕組み",
    "howItWorks.subtitle": "3つの簡単なステップで始めましょう",
    "howItWorks.step1.title": "アカウントを作成",
    "howItWorks.step1.description":
      "簡単なプロセスで数分でサインアップ",
    "howItWorks.step2.title": "資金を入金",
    "howItWorks.step2.description":
      "お好みの支払い方法を使用して入金",
    "howItWorks.step3.title": "取引を開始",
    "howItWorks.step3.description":
      "グローバル市場にアクセスして取引の旅を始めましょう",

    // Testimonials section
    "testimonials.title": "トレーダーの声",
    "testimonials.subtitle":
      "世界中の何千もの満足しているトレーダーに参加",

    // FAQ section
    "faq.title": "よくある質問",
    "faq.subtitle": "M4Capitalに関する一般的な質問への回答を見つける",
    "faq.badge": "FAQ",
    "faq.q1.question": "最低入金額はいくらですか？",
    "faq.q1.answer":
      "スタンダードアカウントの最低入金額は$100です。アカウントタイプによって異なる場合があります。",
    "faq.q2.question": "私の資金はどれくらい安全ですか？",
    "faq.q2.answer":
      "お客様の資金はトップティア銀行の分離口座に保管されます。また、お客様のデータを保護するために高度な暗号化を使用しています。",
    "faq.q3.question": "取引手数料はいくらですか？",
    "faq.q3.answer":
      "アカウントタイプと取引される資産に基づいて、競争力のあるスプレッドと低手数料からゼロ手数料を提供しています。",
    "faq.q4.question": "資金を引き出す方法は？",
    "faq.q4.answer":
      "クライアントポータルを通じていつでも資金を引き出すことができます。引き出しは通常24時間以内に処理されます。",

    // Call to Action section
    "cta.title": "始める準備はできましたか？",
    "cta.subtitle": "M4Capitalで今日から取引の旅を始めましょう",
    "cta.button": "アカウントを作成",
    "cta.badge": "始める",

    // Footer
    "footer.copyright": "© 2024 M4Capital。全著作権所有。",
    "footer.privacy": "プライバシーポリシー",
    "footer.terms": "利用規約",
    "footer.disclaimer": "取引にはリスクが伴います",
    "footer.markets.title": "市場と資産",
    "footer.markets.news": "ニュースフィード",
    "footer.markets.assets": "資産",
    "footer.markets.collection": "株式コレクション",
    "footer.markets.industries": "業界",
    "footer.analytics.title": "分析とツール",
    "footer.analytics.quotes": "過去の相場",
    "footer.analytics.calendars": "カレンダー",
    "footer.analytics.specs": "取引仕様",
    "footer.education.title": "教育と学習",
    "footer.education.videos": "ビデオチュートリアル",
    "footer.education.margin": "マージン取引の基礎",
    "footer.events.title": "イベントとコミュニティ",
    "footer.events.blog": "ブログ",
    "footer.about.title": "会社概要",
    "footer.about.numbers": "数字で見る",
    "footer.about.press": "プレスで",
    "footer.about.awards": "受賞歴",
    "footer.about.contact": "お問い合わせ",
    "footer.about.sitemap": "サイトマップ",
    "footer.about.licenses": "ライセンスとセーフガード",
    "footer.support.title": "サポートとサービス",
    "footer.support.download": "アプリをダウンロード",
    "footer.support.help": "ヘルプ",
    "footer.support.deposits": "入出金",
    "footer.support.terms": "利用規約",
    "footer.risk.title": "リスク警告",
    "footer.risk.text1":
      "当社が提供する金融商品には、差金決済取引（CFD）およびその他の複雑な金融商品が含まれます。CFD取引はレバレッジが利益と損失の両方に作用するため、高レベルのリスクを伴います。その結果、CFDはすべての投資家に適しているわけではなく、投資した資本をすべて失う可能性があります。失っても構わないお金以外は決して投資しないでください。提供される複雑な金融商品を取引する前に、関連するリスクを理解していることを確認してください。",
    "footer.risk.text2":
      "本ウェブサイトで提供されるIPの使用は、本ウェブサイトで提供されるサービスに関連する個人的および非商業的目的のための限定的な非独占的で譲渡不可能な権利に限定されます。",
    "footer.risk.text3":
      "本ウェブサイトの情報は、EU/EEA加盟国を含むがこれに限定されない特定の管轄区域の居住者を対象としておらず、そのような配布または使用が地域の法律または規制に反する国または管轄区域のいかなる人物への配布も意図されていません。",

    // Dashboard
    "dashboard.title": "ダッシュボード",
    "dashboard.portfolio": "ポートフォリオ価値",
    "dashboard.balance": "残高",
    "dashboard.deposit": "入金",
    "dashboard.withdraw": "出金",
    "dashboard.buy": "購入",
    "dashboard.sell": "売却",
    "dashboard.transfer": "送金",
    "dashboard.swap": "スワップ",
    "dashboard.crypto": "暗号資産",
    "dashboard.history": "履歴",
    "dashboard.addCrypto": "暗号資産を追加",

    // Common
    "common.loading": "読み込み中...",
    "common.error": "エラー",
    "common.success": "成功",
    "common.cancel": "キャンセル",
    "common.confirm": "確認",
    "common.save": "保存",
    "common.edit": "編集",
    "common.delete": "削除",
    "common.search": "検索",
    "common.filter": "フィルター",
    "common.sort": "並べ替え",
    "common.view": "表示",
    "common.close": "閉じる",
    "common.submit": "送信",
    "common.back": "戻る",
    "common.next": "次へ",
    "common.previous": "前へ",
    "common.language": "言語",
    "common.chooseLanguage": "言語を選択",
    "common.downloadApp": "アプリをダウンロード",
    "common.marketsAssets": "市場と資産",

    // Mobile Menu
    "menu.historicalQuotes": "過去の相場",
    "menu.calendars": "カレンダー",
    "menu.tradingSpecs": "取引仕様",
    "menu.videoTutorials": "ビデオチュートリアル",
    "menu.marginTrading": "マージン取引の基礎",
    "menu.tournaments": "トーナメント",
    "menu.blog": "ブログ",
    "menu.depositsWithdrawals": "入出金",
    "menu.inNumbers": "数字で見る",
    "menu.press": "プレスで",
    "menu.awards": "受賞歴",
    "menu.licenses": "ライセンスとセーフガード",
  },

  pl: {
    // Navigation
    "nav.home": "Strona główna",
    "nav.dashboard": "Panel",
    "nav.markets": "Rynki",
    "nav.crypto": "Kryptowaluty",
    "nav.forex": "Forex",
    "nav.stocks": "Akcje",
    "nav.commodities": "Commodities",
    "nav.indices": "Indeksy",
    "nav.etfs": "ETF-y",
    "nav.analytics": "Analityka",
    "nav.education": "Edukacja",
    "nav.community": "Społeczność",
    "nav.services": "Usługi",
    "nav.about": "O nas",
    "nav.help": "Pomoc",
    "nav.contact": "Kontakt",
    "nav.login": "Zaloguj się",
    "nav.signup": "Zarejestruj się",
    "nav.logout": "Wyloguj się",

    // Hero section
    "hero.slide1.title": "Handluj przyszłością kryptowalut",
    "hero.slide1.description":
      "Zbuduj swoje portfolio z najlepszymi kryptowalutami i zaawansowanymi narzędziami handlowymi",
    "hero.slide2.title": "Bezpieczeństwo na poziomie bankowym",
    "hero.slide2.description":
      "Twoje środki chronione przez szyfrowanie standardu przemysłowego i wielowarstwowe zabezpieczenia",
    "hero.slide3.title": "Ultraszybka realizacja",
    "hero.slide3.description":
      "Uzyskaj przewagę konkurencyjną dzięki naszej infrastrukturze o niskim opóźnieniu",
    "hero.slide4.title": "Twój kapitał jest bezpieczny",
    "hero.slide4.description":
      "Handluj z pewnością, wiedząc, że Twoje środki są chronione przez wiodące w branży zabezpieczenia",
    "hero.slide5.title": "Platforma handlowa nowej generacji",
    "hero.slide5.description":
      "Doświadcz szczytu technologii handlowej zaprojektowanej z myślą o wydajności i niezawodności",
    "hero.getStarted": "Rozpocznij",
    "hero.tryDemo": "Wypróbuj demo",
    "hero.learnMore": "Dowiedz się więcej",

    // Features section
    "features.title": "Dlaczego M4Capital?",
    "features.subtitle": "Potężne narzędzia zaprojektowane dla nowoczesnych traderów",
    "features.badge": "Handluj mądrzej",
    "features.security.title": "Bezpieczeństwo na poziomie bankowym",
    "features.security.description":
      "Twoje środki i dane zabezpieczone najlepszymi środkami bezpieczeństwa w branży",
    "features.trading.title": "Zaawansowany handel",
    "features.trading.description":
      "Dostęp do profesjonalnych narzędzi handlowych i danych rynkowych w czasie rzeczywistym",
    "features.support.title": "Wsparcie 24/7",
    "features.support.description":
      "Nasz zespół ekspertów zawsze dostępny, aby pomóc w Twoim sukcesie",
    "features.global.title": "Globalny rynek",
    "features.global.description":
      "Handluj na rynkach na całym świecie z konkurencyjnymi spreadami",
    "features.execution.title": "Ultraszybka realizacja",
    "features.execution.description":
      "Wykonuj transakcje w milisekundach dzięki naszej wydajnej infrastrukturze",
    "features.community.title": "Napędzane przez społeczność",
    "features.community.description":
      "Dołącz do tętniącej życiem społeczności traderów i dziel się spostrzeżeniami i strategiami",

    // How it Works section
    "howItWorks.title": "Jak to działa",
    "howItWorks.subtitle": "Rozpocznij w trzech prostych krokach",
    "howItWorks.step1.title": "Utwórz konto",
    "howItWorks.step1.description":
      "Zarejestruj się w kilka minut dzięki naszemu prostemu procesowi",
    "howItWorks.step2.title": "Wpłać środki",
    "howItWorks.step2.description":
      "Wpłać używając preferowanej metody płatności",
    "howItWorks.step3.title": "Zacznij handlować",
    "howItWorks.step3.description":
      "Uzyskaj dostęp do globalnych rynków i rozpocznij swoją podróż handlową",

    // Testimonials section
    "testimonials.title": "Co mówią nasi traderzy",
    "testimonials.subtitle":
      "Dołącz do tysięcy zadowolonych traderów na całym świecie",

    // FAQ section
    "faq.title": "Często zadawane pytania",
    "faq.subtitle": "Znajdź odpowiedzi na częste pytania dotyczące M4Capital",
    "faq.badge": "FAQ",
    "faq.q1.question": "Jaka jest minimalna wpłata?",
    "faq.q1.answer":
      "Minimalna wpłata dla standardowego konta wynosi $100. Może to się różnić w zależności od typu konta.",
    "faq.q2.question": "Jak bezpieczne są moje środki?",
    "faq.q2.answer":
      "Twoje środki są przechowywane na oddzielnych kontach w bankach najwyższej kategorii. Używamy również zaawansowanego szyfrowania do ochrony Twoich danych.",
    "faq.q3.question": "Jakie są opłaty handlowe?",
    "faq.q3.answer":
      "Oferujemy konkurencyjne spready i niskie do zerowych prowizji w zależności od typu konta i handlowanego aktywa.",
    "faq.q4.question": "Jak wypłacić moje środki?",
    "faq.q4.answer":
      "Możesz wypłacić swoje środki w dowolnym momencie przez portal klienta. Wypłaty są zazwyczaj przetwarzane w ciągu 24 godzin.",

    // Call to Action section
    "cta.title": "Gotowy do rozpoczęcia?",
    "cta.subtitle": "Rozpocznij swoją podróż handlową z M4Capital już dziś",
    "cta.button": "Utwórz konto",
    "cta.badge": "Rozpocznij",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Wszelkie prawa zastrzeżone.",
    "footer.privacy": "Polityka prywatności",
    "footer.terms": "Warunki usługi",
    "footer.disclaimer": "Handel wiąże się z ryzykiem",
    "footer.markets.title": "Rynki i aktywa",
    "footer.markets.news": "Kanał wiadomości",
    "footer.markets.assets": "Aktywa",
    "footer.markets.collection": "Kolekcja akcji",
    "footer.markets.industries": "Branże",
    "footer.analytics.title": "Analityka i narzędzia",
    "footer.analytics.quotes": "Notowania historyczne",
    "footer.analytics.calendars": "Kalendarze",
    "footer.analytics.specs": "Specyfikacje handlowe",
    "footer.education.title": "Edukacja i nauka",
    "footer.education.videos": "Poradniki wideo",
    "footer.education.margin": "Podstawy handlu z marżą",
    "footer.events.title": "Wydarzenia i społeczność",
    "footer.events.blog": "Nasz blog",
    "footer.about.title": "O nas",
    "footer.about.numbers": "W liczbach",
    "footer.about.press": "W prasie",
    "footer.about.awards": "Nagrody",
    "footer.about.contact": "Kontakt",
    "footer.about.sitemap": "Mapa strony",
    "footer.about.licenses": "Licencje i zabezpieczenia",
    "footer.support.title": "Wsparcie i usługi",
    "footer.support.download": "Pobierz aplikację",
    "footer.support.help": "Pomoc",
    "footer.support.deposits": "Wpłaty i wypłaty",
    "footer.support.terms": "Regulamin",
    "footer.risk.title": "Ostrzeżenie o ryzyku",
    "footer.risk.text1":
      "Produkty finansowe oferowane przez firmę obejmują kontrakty na różnicę ('CFD') i inne złożone instrumenty finansowe. Handel CFD wiąże się z wysokim poziomem ryzyka, ponieważ dźwignia może działać zarówno na Twoją korzyść, jak i na Twoją niekorzyść. W rezultacie CFD mogą nie być odpowiednie dla wszystkich inwestorów, ponieważ możesz stracić cały zainwestowany kapitał. Nigdy nie powinieneś inwestować pieniędzy, których utraty nie możesz sobie pozwolić. Przed handlem oferowanymi złożonymi produktami finansowymi upewnij się, że rozumiesz związane z tym ryzyko.",
    "footer.risk.text2":
      "Przyznano Ci ograniczone, niewyłączne, niezbywalne prawo do korzystania z IP dostarczonego na tej stronie internetowej wyłącznie w celach osobistych i niekomercyjnych w związku z usługami dostarczonymi na stronie internetowej.",
    "footer.risk.text3":
      "Informacje na tej stronie internetowej nie są skierowane do mieszkańców określonych jurysdykcji, w tym między innymi państw członkowskich UE/EOG, i nie są przeznaczone do dystrybucji do żadnej osoby w jakimkolwiek kraju lub jurysdykcji, gdzie taka dystrybucja lub użycie byłoby sprzeczne z lokalnym prawem lub regulacjami.",

    // Dashboard
    "dashboard.title": "Panel",
    "dashboard.portfolio": "Wartość portfela",
    "dashboard.balance": "Saldo",
    "dashboard.deposit": "Wpłać",
    "dashboard.withdraw": "Wypłać",
    "dashboard.buy": "Kup",
    "dashboard.sell": "Sprzedaj",
    "dashboard.transfer": "Transfer",
    "dashboard.swap": "Wymień",
    "dashboard.crypto": "Kryptowaluty",
    "dashboard.history": "Historia",
    "dashboard.addCrypto": "Dodaj kryptowalutę",

    // Common
    "common.loading": "Ładowanie...",
    "common.error": "Błąd",
    "common.success": "Sukces",
    "common.cancel": "Anuluj",
    "common.confirm": "Potwierdź",
    "common.save": "Zapisz",
    "common.edit": "Edytuj",
    "common.delete": "Usuń",
    "common.search": "Szukaj",
    "common.filter": "Filtruj",
    "common.sort": "Sortuj",
    "common.view": "Zobacz",
    "common.close": "Zamknij",
    "common.submit": "Wyślij",
    "common.back": "Wstecz",
    "common.next": "Dalej",
    "common.previous": "Poprzedni",
    "common.language": "Język",
    "common.chooseLanguage": "Wybierz język",
    "common.downloadApp": "Pobierz aplikację",
    "common.marketsAssets": "Rynki i aktywa",

    // Mobile Menu
    "menu.historicalQuotes": "Notowania historyczne",
    "menu.calendars": "Kalendarze",
    "menu.tradingSpecs": "Specyfikacje handlowe",
    "menu.videoTutorials": "Poradniki wideo",
    "menu.marginTrading": "Podstawy handlu z marżą",
    "menu.tournaments": "Turnieje",
    "menu.blog": "Nasz blog",
    "menu.depositsWithdrawals": "Wpłaty i wypłaty",
    "menu.inNumbers": "W liczbach",
    "menu.press": "W prasie",
    "menu.awards": "Nagrody",
    "menu.licenses": "Licencje i zabezpieczenia",
  },

  cs: {
    // Navigation
    "nav.home": "Domů",
    "nav.dashboard": "Přehled",
    "nav.markets": "Trhy",
    "nav.crypto": "Kryptoměny",
    "nav.forex": "Forex",
    "nav.stocks": "Akcie",
    "nav.commodities": "Komodity",
    "nav.indices": "Indexy",
    "nav.etfs": "ETF",
    "nav.analytics": "Analytika",
    "nav.education": "Vzdělávání",
    "nav.community": "Komunita",
    "nav.services": "Služby",
    "nav.about": "O nás",
    "nav.help": "Nápověda",
    "nav.contact": "Kontakt",
    "nav.login": "Přihlásit se",
    "nav.signup": "Registrovat se",
    "nav.logout": "Odhlásit se",

    // Hero section
    "hero.slide1.title": "Obchodujte budoucnost kryptoměn",
    "hero.slide1.description":
      "Vybudujte své portfolio s předními kryptoměnami a pokročilými obchodními nástroji",
    "hero.slide2.title": "Bezpečnost na bankovní úrovni",
    "hero.slide2.description":
      "Vaše prostředky chráněny průmyslovým šifrováním a vícevrstvou bezpečností",
    "hero.slide3.title": "Ultrarychlé provádění",
    "hero.slide3.description":
      "Získejte konkurenční výhodu s naší nízkolatentní infrastrukturou",
    "hero.slide4.title": "Váš kapitál je v bezpečí",
    "hero.slide4.description":
      "Obchodujte s důvěrou ve vědomí, že vaše prostředky jsou chráněny průmyslově předním zabezpečením",
    "hero.slide5.title": "Obchodní platforma nové generace",
    "hero.slide5.description":
      "Zažijte vrchol obchodní technologie navržené pro výkon a spolehlivost",
    "hero.getStarted": "Začít",
    "hero.tryDemo": "Vyzkoušet demo",
    "hero.learnMore": "Zjistit více",

    // Features section
    "features.title": "Proč M4Capital?",
    "features.subtitle": "Výkonné nástroje navržené pro moderní obchodníky",
    "features.badge": "Obchodujte chytřeji",
    "features.security.title": "Bezpečnost na bankovní úrovni",
    "features.security.description":
      "Vaše prostředky a data zabezpečeny nejlepšími bezpečnostními opatřeními v odvětví",
    "features.trading.title": "Pokročilé obchodování",
    "features.trading.description":
      "Přístup k profesionálním obchodním nástrojům a tržním datům v reálném čase",
    "features.support.title": "Podpora 24/7",
    "features.support.description":
      "Náš odborný tým je vždy k dispozici, aby vám pomohl uspět",
    "features.global.title": "Globální trhy",
    "features.global.description":
      "Obchodujte na trzích po celém světě s konkurenčními spready",
    "features.execution.title": "Ultrarychlé provádění",
    "features.execution.description":
      "Proveďte obchody v milisekundách s naší vysoce výkonnou infrastrukturou",
    "features.community.title": "Řízeno komunitou",
    "features.community.description":
      "Připojte se k pulzující komunitě obchodníků a sdílejte poznatky a strategie",

    // How it Works section
    "howItWorks.title": "Jak to funguje",
    "howItWorks.subtitle": "Začněte ve třech jednoduchých krocích",
    "howItWorks.step1.title": "Vytvořit účet",
    "howItWorks.step1.description":
      "Zaregistrujte se během několika minut s naším jednoduchým procesem",
    "howItWorks.step2.title": "Vložit prostředky",
    "howItWorks.step2.description":
      "Vložte pomocí preferované platební metody",
    "howItWorks.step3.title": "Začít obchodovat",
    "howItWorks.step3.description":
      "Získejte přístup ke globálním trhům a začněte svou obchodní cestu",

    // Testimonials section
    "testimonials.title": "Co říkají naši obchodníci",
    "testimonials.subtitle":
      "Připojte se k tisícům spokojených obchodníků po celém světě",

    // FAQ section
    "faq.title": "Často kladené otázky",
    "faq.subtitle": "Najděte odpovědi na běžné otázky o M4Capital",
    "faq.badge": "FAQ",
    "faq.q1.question": "Jaký je minimální vklad?",
    "faq.q1.answer":
      "Minimální vklad pro standardní účet je $100. Může se lišit podle typu účtu.",
    "faq.q2.question": "Jak bezpečné jsou moje prostředky?",
    "faq.q2.answer":
      "Vaše prostředky jsou uloženy na oddělených účtech u bank nejvyšší kategorie. Používáme také pokročilé šifrování k ochraně vašich dat.",
    "faq.q3.question": "Jaké jsou obchodní poplatky?",
    "faq.q3.answer":
      "Nabízíme konkurenční spready a nízké až nulové provize v závislosti na typu účtu a obchodovaném aktivu.",
    "faq.q4.question": "Jak vybrat své prostředky?",
    "faq.q4.answer":
      "Své prostředky můžete kdykoli vybrat prostřednictvím klientského portálu. Výběry jsou obvykle zpracovány do 24 hodin.",

    // Call to Action section
    "cta.title": "Připraveni začít?",
    "cta.subtitle": "Začněte svou obchodní cestu s M4Capital ještě dnes",
    "cta.button": "Vytvořit účet",
    "cta.badge": "Začít",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Všechna práva vyhrazena.",
    "footer.privacy": "Zásady ochrany osobních údajů",
    "footer.terms": "Podmínky služby",
    "footer.disclaimer": "Obchodování zahrnuje rizika",
    "footer.markets.title": "Trhy a aktiva",
    "footer.markets.news": "Zpravodajský kanál",
    "footer.markets.assets": "Aktiva",
    "footer.markets.collection": "Sbírka akcií",
    "footer.markets.industries": "Odvětví",
    "footer.analytics.title": "Analytika a nástroje",
    "footer.analytics.quotes": "Historické kotace",
    "footer.analytics.calendars": "Kalendáře",
    "footer.analytics.specs": "Obchodní specifikace",
    "footer.education.title": "Vzdělávání a učení",
    "footer.education.videos": "Video návody",
    "footer.education.margin": "Základy obchodování s maržemi",
    "footer.events.title": "Akce a komunita",
    "footer.events.blog": "Náš blog",
    "footer.about.title": "O nás",
    "footer.about.numbers": "V číslech",
    "footer.about.press": "V tisku",
    "footer.about.awards": "Ocenění",
    "footer.about.contact": "Kontakt",
    "footer.about.sitemap": "Mapa stránek",
    "footer.about.licenses": "Licence a záruky",
    "footer.support.title": "Podpora a služby",
    "footer.support.download": "Stáhnout aplikaci",
    "footer.support.help": "Nápověda",
    "footer.support.deposits": "Vklady a výběry",
    "footer.support.terms": "Podmínky",
    "footer.risk.title": "Varování před riziky",
    "footer.risk.text1":
      "Finanční produkty nabízené společností zahrnují kontrakty na rozdíl ('CFD') a další složité finanční nástroje. Obchodování s CFD nese vysokou úroveň rizika, protože pákový efekt může fungovat jak ve váš prospěch, tak proti vám. V důsledku toho nemusí být CFD vhodné pro všechny investory, protože můžete ztratit veškerý investovaný kapitál. Nikdy byste neměli investovat peníze, jejichž ztrátu si nemůžete dovolit. Než začnete obchodovat s nabízenými složitými finančními produkty, ujistěte se, že rozumíte souvisejícím rizikům.",
    "footer.risk.text2":
      "Bylo vám uděleno omezené nevýhradní nepřevoditelné právo k používání IP poskytnutého na této webové stránce výhradně pro osobní a nekomerční účely v souvislosti se službami poskytovanými na webové stránce.",
    "footer.risk.text3":
      "Informace na této webové stránce nejsou určeny rezidentům určitých jurisdikcí, včetně, ale nikoliv výhradně, členských států EU/EHP, a nejsou určeny k distribuci žádné osobě v žádné zemi nebo jurisdikci, kde by taková distribuce nebo použití bylo v rozporu s místními zákony nebo předpisy.",

    // Dashboard
    "dashboard.title": "Přehled",
    "dashboard.portfolio": "Hodnota portfolia",
    "dashboard.balance": "Zůstatek",
    "dashboard.deposit": "Vložit",
    "dashboard.withdraw": "Vybrat",
    "dashboard.buy": "Koupit",
    "dashboard.sell": "Prodat",
    "dashboard.transfer": "Převod",
    "dashboard.swap": "Vyměnit",
    "dashboard.crypto": "Krypto",
    "dashboard.history": "Historie",
    "dashboard.addCrypto": "Přidat krypto",

    // Common
    "common.loading": "Načítání...",
    "common.error": "Chyba",
    "common.success": "Úspěch",
    "common.cancel": "Zrušit",
    "common.confirm": "Potvrdit",
    "common.save": "Uložit",
    "common.edit": "Upravit",
    "common.delete": "Smazat",
    "common.search": "Hledat",
    "common.filter": "Filtrovat",
    "common.sort": "Seřadit",
    "common.view": "Zobrazit",
    "common.close": "Zavřít",
    "common.submit": "Odeslat",
    "common.back": "Zpět",
    "common.next": "Další",
    "common.previous": "Předchozí",
    "common.language": "Jazyk",
    "common.chooseLanguage": "Vybrat jazyk",
    "common.downloadApp": "Stáhnout aplikaci",
    "common.marketsAssets": "Trhy a aktiva",

    // Mobile Menu
    "menu.historicalQuotes": "Historické kotace",
    "menu.calendars": "Kalendáře",
    "menu.tradingSpecs": "Obchodní specifikace",
    "menu.videoTutorials": "Video návody",
    "menu.marginTrading": "Základy obchodování s maržemi",
    "menu.tournaments": "Turnaje",
    "menu.blog": "Náš blog",
    "menu.depositsWithdrawals": "Vklady a výběry",
    "menu.inNumbers": "V číslech",
    "menu.press": "V tisku",
    "menu.awards": "Ocenění",
    "menu.licenses": "Licence a záruky",
  },

  tr: {
    // Navigation
    "nav.home": "Ana Sayfa",
    "nav.dashboard": "Gösterge Paneli",
    "nav.markets": "Piyasalar",
    "nav.crypto": "Kripto",
    "nav.forex": "Forex",
    "nav.stocks": "Hisse Senetleri",
    "nav.commodities": "Emtialar",
    "nav.indices": "Endeksler",
    "nav.etfs": "ETF'ler",
    "nav.analytics": "Analitik",
    "nav.education": "Eğitim",
    "nav.community": "Topluluk",
    "nav.services": "Hizmetler",
    "nav.about": "Hakkımızda",
    "nav.help": "Yardım",
    "nav.contact": "İletişim",
    "nav.login": "Giriş Yap",
    "nav.signup": "Kayıt Ol",
    "nav.logout": "Çıkış Yap",

    // Hero section
    "hero.slide1.title": "Kripto geleceğini takas edin",
    "hero.slide1.description":
      "En iyi kripto paralarla ve gelişmiş ticaret araçlarıyla portföyünüzü oluşturun",
    "hero.slide2.title": "Banka düzeyinde güvenlik",
    "hero.slide2.description":
      "Fonlarınız endüstri standardı şifreleme ve çok katmanlı güvenlikle korunuyor",
    "hero.slide3.title": "Ultra hızlı uygulama",
    "hero.slide3.description":
      "Düşük gecikmeli altyapımızla rekabet avantajı elde edin",
    "hero.slide4.title": "Sermayeniz güvende",
    "hero.slide4.description":
      "Fonlarınızın sektör lideri güvenlikle korunduğunu bilerek güvenle işlem yapın",
    "hero.slide5.title": "Yeni nesil işlem platformu",
    "hero.slide5.description":
      "Performans ve güvenilirlik için tasarlanmış ticaret teknolojisinin zirvesini deneyimleyin",
    "hero.getStarted": "Başlayın",
    "hero.tryDemo": "Demo'yu deneyin",
    "hero.learnMore": "Daha fazla bilgi",

    // Features section
    "features.title": "Neden M4Capital?",
    "features.subtitle": "Modern tüccarlar için tasarlanmış güçlü araçlar",
    "features.badge": "Daha akıllı işlem yapın",
    "features.security.title": "Banka düzeyinde güvenlik",
    "features.security.description":
      "Fonlarınız ve verileriniz sektörün en iyi güvenlik önlemleriyle korunuyor",
    "features.trading.title": "Gelişmiş işlem",
    "features.trading.description":
      "Profesyonel işlem araçlarına ve gerçek zamanlı piyasa verilerine erişim",
    "features.support.title": "7/24 destek",
    "features.support.description":
      "Uzman ekibimiz başarınız için her zaman hazır",
    "features.global.title": "Küresel piyasalar",
    "features.global.description":
      "Rekabetçi spreadlerle dünya çapında piyasalarda işlem yapın",
    "features.execution.title": "Ultra hızlı uygulama",
    "features.execution.description":
      "Yüksek performanslı altyapımızla milisaniyeler içinde işlem gerçekleştirin",
    "features.community.title": "Topluluk odaklı",
    "features.community.description":
      "Canlı bir tüccar topluluğuna katılın ve içgörüler ve stratejiler paylaşın",

    // How it Works section
    "howItWorks.title": "Nasıl çalışır",
    "howItWorks.subtitle": "Üç basit adımda başlayın",
    "howItWorks.step1.title": "Hesap oluştur",
    "howItWorks.step1.description":
      "Basit sürecimizle dakikalar içinde kaydolun",
    "howItWorks.step2.title": "Para yatır",
    "howItWorks.step2.description":
      "Tercih ettiğiniz ödeme yöntemini kullanarak para yatırın",
    "howItWorks.step3.title": "İşleme başlayın",
    "howItWorks.step3.description":
      "Küresel piyasalara erişin ve işlem yolculuğunuza başlayın",

    // Testimonials section
    "testimonials.title": "Tüccarlarımız ne diyor",
    "testimonials.subtitle":
      "Dünya çapında binlerce memnun tüccara katılın",

    // FAQ section
    "faq.title": "Sık sorulan sorular",
    "faq.subtitle": "M4Capital hakkında yaygın soruların yanıtlarını bulun",
    "faq.badge": "SSS",
    "faq.q1.question": "Minimum para yatırma tutarı nedir?",
    "faq.q1.answer":
      "Standart hesap için minimum para yatırma tutarı $100'dür. Hesap türüne göre değişebilir.",
    "faq.q2.question": "Fonlarım ne kadar güvende?",
    "faq.q2.answer":
      "Fonlarınız üst düzey bankalarda ayrı hesaplarda tutulur. Ayrıca verilerinizi korumak için gelişmiş şifreleme kullanıyoruz.",
    "faq.q3.question": "İşlem ücretleri nelerdir?",
    "faq.q3.answer":
      "Hesap türüne ve işlem gören varlığa bağlı olarak rekabetçi spreadler ve düşük ila sıfır komisyon sunuyoruz.",
    "faq.q4.question": "Fonlarımı nasıl çekerim?",
    "faq.q4.answer":
      "Fonlarınızı müşteri portalı üzerinden istediğiniz zaman çekebilirsiniz. Para çekme işlemleri genellikle 24 saat içinde işlenir.",

    // Call to Action section
    "cta.title": "Başlamaya hazır mısınız?",
    "cta.subtitle": "M4Capital ile bugün işlem yolculuğunuza başlayın",
    "cta.button": "Hesap oluştur",
    "cta.badge": "Başlayın",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Tüm hakları saklıdır.",
    "footer.privacy": "Gizlilik politikası",
    "footer.terms": "Hizmet şartları",
    "footer.disclaimer": "İşlem risk içerir",
    "footer.markets.title": "Piyasalar ve varlıklar",
    "footer.markets.news": "Haber akışı",
    "footer.markets.assets": "Varlıklar",
    "footer.markets.collection": "Hisse senedi koleksiyonu",
    "footer.markets.industries": "Endüstriler",
    "footer.analytics.title": "Analitik ve araçlar",
    "footer.analytics.quotes": "Geçmiş fiyatlar",
    "footer.analytics.calendars": "Takvimler",
    "footer.analytics.specs": "İşlem özellikleri",
    "footer.education.title": "Eğitim ve öğrenme",
    "footer.education.videos": "Video eğitimleri",
    "footer.education.margin": "Marj ticareti temelleri",
    "footer.events.title": "Etkinlikler ve topluluk",
    "footer.events.blog": "Bloğumuz",
    "footer.about.title": "Hakkımızda",
    "footer.about.numbers": "Rakamlarla",
    "footer.about.press": "Basında",
    "footer.about.awards": "Ödüller",
    "footer.about.contact": "İletişim",
    "footer.about.sitemap": "Site haritası",
    "footer.about.licenses": "Lisanslar ve güvenceler",
    "footer.support.title": "Destek ve hizmetler",
    "footer.support.download": "Uygulamayı indir",
    "footer.support.help": "Yardım",
    "footer.support.deposits": "Para yatırma ve çekme",
    "footer.support.terms": "Şartlar",
    "footer.risk.title": "Risk uyarısı",
    "footer.risk.text1":
      "Şirket tarafından sunulan finansal ürünler, Fark Sözleşmeleri ('CFD'ler') ve diğer karmaşık finansal araçları içerir. CFD ticareti, kaldıraç hem lehte hem de aleyhinize çalışabileceğinden yüksek düzeyde risk taşır. Sonuç olarak, tüm yatırılan sermayenizi kaybedebileceğiniz için CFD'ler tüm yatırımcılar için uygun olmayabilir. Kaybetmeyi göze alamayacağınız parayı asla yatırmamalısınız. Sunulan karmaşık finansal ürünlerle işlem yapmadan önce, ilgili riskleri anladığınızdan emin olun.",
    "footer.risk.text2":
      "Bu web sitesinde sağlanan IP'yi, yalnızca web sitesinde sağlanan hizmetlerle bağlantılı olarak kişisel ve ticari olmayan amaçlar için kullanmak üzere sınırlı, münhasır olmayan, devredilemez bir hak verilmiştir.",
    "footer.risk.text3":
      "Bu web sitesindeki bilgiler, AB/AEA üye devletleri de dahil ancak bunlarla sınırlı olmamak üzere belirli yargı bölgelerinin sakinlerine yönelik değildir ve böyle bir dağıtım veya kullanımın yerel yasa veya düzenlemelere aykırı olacağı herhangi bir ülke veya yargı bölgesindeki herhangi bir kişiye dağıtım için tasarlanmamıştır.",

    // Dashboard
    "dashboard.title": "Gösterge paneli",
    "dashboard.portfolio": "Portföy değeri",
    "dashboard.balance": "Bakiye",
    "dashboard.deposit": "Para yatır",
    "dashboard.withdraw": "Para çek",
    "dashboard.buy": "Satın al",
    "dashboard.sell": "Sat",
    "dashboard.transfer": "Transfer",
    "dashboard.swap": "Takas",
    "dashboard.crypto": "Kripto",
    "dashboard.history": "Geçmiş",
    "dashboard.addCrypto": "Kripto ekle",

    // Common
    "common.loading": "Yükleniyor...",
    "common.error": "Hata",
    "common.success": "Başarılı",
    "common.cancel": "İptal",
    "common.confirm": "Onayla",
    "common.save": "Kaydet",
    "common.edit": "Düzenle",
    "common.delete": "Sil",
    "common.search": "Ara",
    "common.filter": "Filtrele",
    "common.sort": "Sırala",
    "common.view": "Görüntüle",
    "common.close": "Kapat",
    "common.submit": "Gönder",
    "common.back": "Geri",
    "common.next": "İleri",
    "common.previous": "Önceki",
    "common.language": "Dil",
    "common.chooseLanguage": "Dil seçin",
    "common.downloadApp": "Uygulamayı indir",
    "common.marketsAssets": "Piyasalar ve varlıklar",

    // Mobile Menu
    "menu.historicalQuotes": "Geçmiş fiyatlar",
    "menu.calendars": "Takvimler",
    "menu.tradingSpecs": "İşlem özellikleri",
    "menu.videoTutorials": "Video eğitimleri",
    "menu.marginTrading": "Marj ticareti temelleri",
    "menu.tournaments": "Turnuvalar",
    "menu.blog": "Bloğumuz",
    "menu.depositsWithdrawals": "Para yatırma ve çekme",
    "menu.inNumbers": "Rakamlarla",
    "menu.press": "Basında",
    "menu.awards": "Ödüller",
    "menu.licenses": "Lisanslar ve güvenceler",
  },

  ru: {
    // Navigation
    "nav.home": "Главная",
    "nav.dashboard": "Панель управления",
    "nav.markets": "Рынки",
    "nav.crypto": "Криптовалюты",
    "nav.forex": "Форекс",
    "nav.stocks": "Акции",
    "nav.commodities": "Товары",
    "nav.indices": "Индексы",
    "nav.etfs": "ETF",
    "nav.analytics": "Аналитика",
    "nav.education": "Обучение",
    "nav.community": "Сообщество",
    "nav.services": "Услуги",
    "nav.about": "О нас",
    "nav.help": "Помощь",
    "nav.contact": "Контакты",
    "nav.login": "Войти",
    "nav.signup": "Регистрация",
    "nav.logout": "Выйти",

    // Hero section
    "hero.slide1.title": "Торгуйте будущим криптовалют",
    "hero.slide1.description":
      "Создайте свой портфель с ведущими криптовалютами и продвинутыми торговыми инструментами",
    "hero.slide2.title": "Безопасность банковского уровня",
    "hero.slide2.description":
      "Ваши средства защищены шифрованием промышленного стандарта и многоуровневой безопасностью",
    "hero.slide3.title": "Сверхбыстрое исполнение",
    "hero.slide3.description":
      "Получите конкурентное преимущество с нашей низколатентной инфраструктурой",
    "hero.slide4.title": "Ваш капитал в безопасности",
    "hero.slide4.description":
      "Торгуйте с уверенностью, зная, что ваши средства защищены ведущими в отрасли мерами безопасности",
    "hero.slide5.title": "Торговая платформа нового поколения",
    "hero.slide5.description":
      "Испытайте вершину торговых технологий, разработанных для производительности и надежности",
    "hero.getStarted": "Начать",
    "hero.tryDemo": "Попробовать демо",
    "hero.learnMore": "Узнать больше",

    // Features section
    "features.title": "Почему M4Capital?",
    "features.subtitle": "Мощные инструменты, разработанные для современных трейдеров",
    "features.badge": "Торгуйте умнее",
    "features.security.title": "Безопасность банковского уровня",
    "features.security.description":
      "Ваши средства и данные защищены лучшими в отрасли мерами безопасности",
    "features.trading.title": "Продвинутая торговля",
    "features.trading.description":
      "Доступ к профессиональным торговым инструментам и рыночным данным в реальном времени",
    "features.support.title": "Поддержка 24/7",
    "features.support.description":
      "Наша команда экспертов всегда готова помочь вам добиться успеха",
    "features.global.title": "Глобальные рынки",
    "features.global.description":
      "Торгуйте на рынках по всему миру с конкурентными спредами",
    "features.execution.title": "Сверхбыстрое исполнение",
    "features.execution.description":
      "Исполняйте сделки за миллисекунды с нашей высокопроизводительной инфраструктурой",
    "features.community.title": "Управляемое сообществом",
    "features.community.description":
      "Присоединяйтесь к активному сообществу трейдеров и делитесь идеями и стратегиями",

    // How it Works section
    "howItWorks.title": "Как это работает",
    "howItWorks.subtitle": "Начните в три простых шага",
    "howItWorks.step1.title": "Создать аккаунт",
    "howItWorks.step1.description":
      "Зарегистрируйтесь за несколько минут с помощью нашего простого процесса",
    "howItWorks.step2.title": "Пополнить счет",
    "howItWorks.step2.description":
      "Пополните счет, используя предпочитаемый способ оплаты",
    "howItWorks.step3.title": "Начать торговать",
    "howItWorks.step3.description":
      "Получите доступ к глобальным рынкам и начните свой торговый путь",

    // Testimonials section
    "testimonials.title": "Что говорят наши трейдеры",
    "testimonials.subtitle":
      "Присоединяйтесь к тысячам довольных трейдеров по всему миру",

    // FAQ section
    "faq.title": "Часто задаваемые вопросы",
    "faq.subtitle": "Найдите ответы на распространенные вопросы о M4Capital",
    "faq.badge": "FAQ",
    "faq.q1.question": "Какой минимальный депозит?",
    "faq.q1.answer":
      "Минимальный депозит для стандартного счета составляет $100. Может варьироваться в зависимости от типа счета.",
    "faq.q2.question": "Насколько безопасны мои средства?",
    "faq.q2.answer":
      "Ваши средства хранятся на отдельных счетах в банках высшей категории. Мы также используем передовое шифрование для защиты ваших данных.",
    "faq.q3.question": "Какие торговые комиссии?",
    "faq.q3.answer":
      "Мы предлагаем конкурентные спреды и низкие или нулевые комиссии в зависимости от типа счета и торгуемого актива.",
    "faq.q4.question": "Как вывести свои средства?",
    "faq.q4.answer":
      "Вы можете вывести свои средства в любое время через клиентский портал. Вывод средств обычно обрабатывается в течение 24 часов.",

    // Call to Action section
    "cta.title": "Готовы начать?",
    "cta.subtitle": "Начните свой торговый путь с M4Capital уже сегодня",
    "cta.button": "Создать аккаунт",
    "cta.badge": "Начать",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Все права защищены.",
    "footer.privacy": "Политика конфиденциальности",
    "footer.terms": "Условия обслуживания",
    "footer.disclaimer": "Торговля сопряжена с рисками",
    "footer.markets.title": "Рынки и активы",
    "footer.markets.news": "Новостная лента",
    "footer.markets.assets": "Активы",
    "footer.markets.collection": "Коллекция акций",
    "footer.markets.industries": "Отрасли",
    "footer.analytics.title": "Аналитика и инструменты",
    "footer.analytics.quotes": "Исторические котировки",
    "footer.analytics.calendars": "Календари",
    "footer.analytics.specs": "Торговые спецификации",
    "footer.education.title": "Обучение и образование",
    "footer.education.videos": "Видеоуроки",
    "footer.education.margin": "Основы маржинальной торговли",
    "footer.events.title": "События и сообщество",
    "footer.events.blog": "Наш блог",
    "footer.about.title": "О нас",
    "footer.about.numbers": "В цифрах",
    "footer.about.press": "В прессе",
    "footer.about.awards": "Награды",
    "footer.about.contact": "Контакты",
    "footer.about.sitemap": "Карта сайта",
    "footer.about.licenses": "Лицензии и гарантии",
    "footer.support.title": "Поддержка и услуги",
    "footer.support.download": "Скачать приложение",
    "footer.support.help": "Помощь",
    "footer.support.deposits": "Депозиты и выводы",
    "footer.support.terms": "Условия",
    "footer.risk.title": "Предупреждение о рисках",
    "footer.risk.text1":
      "Финансовые продукты, предлагаемые компанией, включают контракты на разницу ('CFD') и другие сложные финансовые инструменты. Торговля CFD сопряжена с высоким уровнем риска, поскольку кредитное плечо может работать как в вашу пользу, так и против вас. В результате CFD могут не подходить для всех инвесторов, поскольку вы можете потерять весь вложенный капитал. Вы никогда не должны инвестировать деньги, которые не можете позволить себе потерять. Прежде чем торговать предлагаемыми сложными финансовыми продуктами, убедитесь, что вы понимаете связанные с этим риски.",
    "footer.risk.text2":
      "Вам предоставляется ограниченное неисключительное непередаваемое право на использование IP, предоставленного на этом веб-сайте, исключительно для личных и некоммерческих целей в связи с услугами, предоставляемыми на веб-сайте.",
    "footer.risk.text3":
      "Информация на этом веб-сайте не предназначена для жителей определенных юрисдикций, включая, помимо прочего, государства-члены ЕС/ЕЭЗ, и не предназначена для распространения среди любого лица в любой стране или юрисдикции, где такое распространение или использование противоречило бы местным законам или нормативным актам.",

    // Dashboard
    "dashboard.title": "Панель управления",
    "dashboard.portfolio": "Стоимость портфеля",
    "dashboard.balance": "Баланс",
    "dashboard.deposit": "Пополнить",
    "dashboard.withdraw": "Вывести",
    "dashboard.buy": "Купить",
    "dashboard.sell": "Продать",
    "dashboard.transfer": "Перевод",
    "dashboard.swap": "Обмен",
    "dashboard.crypto": "Криптовалюты",
    "dashboard.history": "История",
    "dashboard.addCrypto": "Добавить криптовалюту",

    // Common
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успешно",
    "common.cancel": "Отмена",
    "common.confirm": "Подтвердить",
    "common.save": "Сохранить",
    "common.edit": "Редактировать",
    "common.delete": "Удалить",
    "common.search": "Поиск",
    "common.filter": "Фильтр",
    "common.sort": "Сортировка",
    "common.view": "Просмотр",
    "common.close": "Закрыть",
    "common.submit": "Отправить",
    "common.back": "Назад",
    "common.next": "Далее",
    "common.previous": "Предыдущий",
    "common.language": "Язык",
    "common.chooseLanguage": "Выбрать язык",
    "common.downloadApp": "Скачать приложение",
    "common.marketsAssets": "Рынки и активы",

    // Mobile Menu
    "menu.historicalQuotes": "Исторические котировки",
    "menu.calendars": "Календари",
    "menu.tradingSpecs": "Торговые спецификации",
    "menu.videoTutorials": "Видеоуроки",
    "menu.marginTrading": "Основы маржинальной торговли",
    "menu.tournaments": "Турниры",
    "menu.blog": "Наш блог",
    "menu.depositsWithdrawals": "Депозиты и выводы",
    "menu.inNumbers": "В цифрах",
    "menu.press": "В прессе",
    "menu.awards": "Награды",
    "menu.licenses": "Лицензии и гарантии",
  },

  ko: {
    // Navigation
    "nav.home": "홈",
    "nav.dashboard": "대시보드",
    "nav.markets": "시장",
    "nav.crypto": "암호화폐",
    "nav.forex": "외환",
    "nav.stocks": "주식",
    "nav.commodities": "원자재",
    "nav.indices": "지수",
    "nav.etfs": "ETF",
    "nav.analytics": "분석",
    "nav.education": "교육",
    "nav.community": "커뮤니티",
    "nav.services": "서비스",
    "nav.about": "회사 소개",
    "nav.help": "도움말",
    "nav.contact": "문의하기",
    "nav.login": "로그인",
    "nav.signup": "회원가입",
    "nav.logout": "로그아웃",

    // Hero section
    "hero.slide1.title": "암호화폐의 미래를 거래하세요",
    "hero.slide1.description":
      "최고의 암호화폐와 고급 거래 도구로 포트폴리오를 구축하세요",
    "hero.slide2.title": "은행 수준의 보안",
    "hero.slide2.description":
      "업계 표준 암호화 및 다층 보안으로 자금을 보호합니다",
    "hero.slide3.title": "초고속 실행",
    "hero.slide3.description":
      "저지연 인프라로 경쟁 우위를 확보하세요",
    "hero.slide4.title": "귀하의 자본은 안전합니다",
    "hero.slide4.description":
      "업계 최고의 보안으로 자금이 보호된다는 사실을 알고 자신있게 거래하세요",
    "hero.slide5.title": "차세대 거래 플랫폼",
    "hero.slide5.description":
      "성능과 안정성을 위해 설계된 거래 기술의 정점을 경험하세요",
    "hero.getStarted": "시작하기",
    "hero.tryDemo": "데모 체험",
    "hero.learnMore": "자세히 알아보기",

    // Features section
    "features.title": "왜 M4Capital인가요?",
    "features.subtitle": "현대 트레이더를 위해 설계된 강력한 도구",
    "features.badge": "더 스마트하게 거래하세요",
    "features.security.title": "은행 수준의 보안",
    "features.security.description":
      "귀하의 자금과 데이터는 업계 최고의 보안 조치로 보호됩니다",
    "features.trading.title": "고급 거래",
    "features.trading.description":
      "전문 거래 도구 및 실시간 시장 데이터에 액세스하세요",
    "features.support.title": "연중무휴 지원",
    "features.support.description":
      "전문가 팀이 귀하의 성공을 위해 항상 대기하고 있습니다",
    "features.global.title": "글로벌 시장",
    "features.global.description":
      "경쟁력 있는 스프레드로 전 세계 시장에서 거래하세요",
    "features.execution.title": "초고속 실행",
    "features.execution.description":
      "고성능 인프라로 밀리초 단위로 거래를 실행하세요",
    "features.community.title": "커뮤니티 중심",
    "features.community.description":
      "활기찬 트레이더 커뮤니티에 참여하여 인사이트와 전략을 공유하세요",

    // How it Works section
    "howItWorks.title": "작동 방식",
    "howItWorks.subtitle": "세 가지 간단한 단계로 시작하세요",
    "howItWorks.step1.title": "계정 만들기",
    "howItWorks.step1.description":
      "간단한 프로세스로 몇 분 만에 가입하세요",
    "howItWorks.step2.title": "자금 입금",
    "howItWorks.step2.description":
      "선호하는 결제 방법을 사용하여 입금하세요",
    "howItWorks.step3.title": "거래 시작",
    "howItWorks.step3.description":
      "글로벌 시장에 액세스하고 거래 여정을 시작하세요",

    // Testimonials section
    "testimonials.title": "트레이더들의 평가",
    "testimonials.subtitle":
      "전 세계 수천 명의 만족스러운 트레이더와 함께하세요",

    // FAQ section
    "faq.title": "자주 묻는 질문",
    "faq.subtitle": "M4Capital에 대한 일반적인 질문에 대한 답변을 찾으세요",
    "faq.badge": "FAQ",
    "faq.q1.question": "최소 입금액은 얼마인가요?",
    "faq.q1.answer":
      "표준 계정의 최소 입금액은 $100입니다. 계정 유형에 따라 다를 수 있습니다.",
    "faq.q2.question": "제 자금은 얼마나 안전한가요?",
    "faq.q2.answer":
      "귀하의 자금은 최상위 은행의 분리된 계좌에 보관됩니다. 또한 귀하의 데이터를 보호하기 위해 고급 암호화를 사용합니다.",
    "faq.q3.question": "거래 수수료는 얼마인가요?",
    "faq.q3.answer":
      "계정 유형과 거래되는 자산에 따라 경쟁력 있는 스프레드와 낮은 수수료부터 무수수료까지 제공합니다.",
    "faq.q4.question": "자금을 인출하려면 어떻게 해야 하나요?",
    "faq.q4.answer":
      "클라이언트 포털을 통해 언제든지 자금을 인출할 수 있습니다. 인출은 일반적으로 24시간 이내에 처리됩니다.",

    // Call to Action section
    "cta.title": "시작할 준비가 되셨나요?",
    "cta.subtitle": "오늘 M4Capital과 함께 거래 여정을 시작하세요",
    "cta.button": "계정 만들기",
    "cta.badge": "시작하기",

    // Footer
    "footer.copyright": "© 2024 M4Capital. 모든 권리 보유.",
    "footer.privacy": "개인정보 보호정책",
    "footer.terms": "서비스 약관",
    "footer.disclaimer": "거래에는 위험이 따릅니다",
    "footer.markets.title": "시장 및 자산",
    "footer.markets.news": "뉴스 피드",
    "footer.markets.assets": "자산",
    "footer.markets.collection": "주식 컬렉션",
    "footer.markets.industries": "산업",
    "footer.analytics.title": "분석 및 도구",
    "footer.analytics.quotes": "과거 시세",
    "footer.analytics.calendars": "캘린더",
    "footer.analytics.specs": "거래 사양",
    "footer.education.title": "교육 및 학습",
    "footer.education.videos": "비디오 튜토리얼",
    "footer.education.margin": "마진 거래 기초",
    "footer.events.title": "이벤트 및 커뮤니티",
    "footer.events.blog": "블로그",
    "footer.about.title": "회사 소개",
    "footer.about.numbers": "숫자로 보기",
    "footer.about.press": "언론 보도",
    "footer.about.awards": "수상 내역",
    "footer.about.contact": "문의하기",
    "footer.about.sitemap": "사이트맵",
    "footer.about.licenses": "라이선스 및 보호 조치",
    "footer.support.title": "지원 및 서비스",
    "footer.support.download": "앱 다운로드",
    "footer.support.help": "도움말",
    "footer.support.deposits": "입금 및 출금",
    "footer.support.terms": "약관",
    "footer.risk.title": "위험 경고",
    "footer.risk.text1":
      "회사가 제공하는 금융 상품에는 차액 계약('CFD') 및 기타 복잡한 금융 상품이 포함됩니다. CFD 거래는 레버리지가 귀하에게 유리하게 작용할 수도 있고 불리하게 작용할 수도 있으므로 높은 수준의 위험을 수반합니다. 결과적으로 투자한 모든 자본을 잃을 수 있으므로 CFD가 모든 투자자에게 적합하지 않을 수 있습니다. 잃을 여유가 없는 돈은 절대 투자해서는 안 됩니다. 제공되는 복잡한 금융 상품을 거래하기 전에 관련 위험을 이해하고 있는지 확인하십시오.",
    "footer.risk.text2":
      "귀하는 이 웹사이트에서 제공되는 서비스와 관련하여 개인적이고 비상업적인 목적으로만 이 웹사이트에서 제공되는 IP를 사용할 수 있는 제한적이고 비독점적이며 양도할 수 없는 권리를 부여받았습니다.",
    "footer.risk.text3":
      "이 웹사이트의 정보는 EU/EEA 회원국을 포함하되 이에 국한되지 않는 특정 관할권의 거주자를 대상으로 하지 않으며, 그러한 배포 또는 사용이 현지 법률 또는 규정에 위배되는 국가 또는 관할권의 사람에게 배포하기 위한 것이 아닙니다.",

    // Dashboard
    "dashboard.title": "대시보드",
    "dashboard.portfolio": "포트폴리오 가치",
    "dashboard.balance": "잔액",
    "dashboard.deposit": "입금",
    "dashboard.withdraw": "출금",
    "dashboard.buy": "구매",
    "dashboard.sell": "판매",
    "dashboard.transfer": "이체",
    "dashboard.swap": "교환",
    "dashboard.crypto": "암호화폐",
    "dashboard.history": "기록",
    "dashboard.addCrypto": "암호화폐 추가",

    // Common
    "common.loading": "로딩 중...",
    "common.error": "오류",
    "common.success": "성공",
    "common.cancel": "취소",
    "common.confirm": "확인",
    "common.save": "저장",
    "common.edit": "편집",
    "common.delete": "삭제",
    "common.search": "검색",
    "common.filter": "필터",
    "common.sort": "정렬",
    "common.view": "보기",
    "common.close": "닫기",
    "common.submit": "제출",
    "common.back": "뒤로",
    "common.next": "다음",
    "common.previous": "이전",
    "common.language": "언어",
    "common.chooseLanguage": "언어 선택",
    "common.downloadApp": "앱 다운로드",
    "common.marketsAssets": "시장 및 자산",

    // Mobile Menu
    "menu.historicalQuotes": "과거 시세",
    "menu.calendars": "캘린더",
    "menu.tradingSpecs": "거래 사양",
    "menu.videoTutorials": "비디오 튜토리얼",
    "menu.marginTrading": "마진 거래 기초",
    "menu.tournaments": "토너먼트",
    "menu.blog": "블로그",
    "menu.depositsWithdrawals": "입금 및 출금",
    "menu.inNumbers": "숫자로 보기",
    "menu.press": "언론 보도",
    "menu.awards": "수상 내역",
    "menu.licenses": "라이선스 및 보호 조치",
  },

  it: {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.markets": "Mercati",
    "nav.crypto": "Criptovalute",
    "nav.forex": "Forex",
    "nav.stocks": "Azioni",
    "nav.commodities": "Materie Prime",
    "nav.indices": "Indici",
    "nav.etfs": "ETF",
    "nav.analytics": "Analisi",
    "nav.education": "Formazione",
    "nav.community": "Comunità",
    "nav.services": "Servizi",
    "nav.about": "Chi Siamo",
    "nav.help": "Aiuto",
    "nav.contact": "Contattaci",
    "nav.login": "Accedi",
    "nav.signup": "Registrati",
    "nav.logout": "Esci",

    // Hero section
    "hero.slide1.title": "Scambia il futuro delle criptovalute",
    "hero.slide1.description":
      "Costruisci il tuo portfolio con le principali criptovalute e strumenti di trading avanzati",
    "hero.slide2.title": "Sicurezza di livello bancario",
    "hero.slide2.description":
      "I tuoi fondi protetti da crittografia standard del settore e sicurezza multilivello",
    "hero.slide3.title": "Esecuzione ultra-veloce",
    "hero.slide3.description":
      "Ottieni un vantaggio competitivo con la nostra infrastruttura a bassa latenza",
    "hero.slide4.title": "Il tuo capitale è al sicuro",
    "hero.slide4.description":
      "Fai trading con fiducia sapendo che i tuoi fondi sono protetti da misure di sicurezza leader del settore",
    "hero.slide5.title": "Piattaforma di trading di nuova generazione",
    "hero.slide5.description":
      "Sperimenta l'apice della tecnologia di trading progettata per prestazioni e affidabilità",
    "hero.getStarted": "Inizia",
    "hero.tryDemo": "Prova la demo",
    "hero.learnMore": "Scopri di più",

    // Features section
    "features.title": "Perché M4Capital?",
    "features.subtitle": "Strumenti potenti progettati per i trader moderni",
    "features.badge": "Fai trading in modo più intelligente",
    "features.security.title": "Sicurezza di livello bancario",
    "features.security.description":
      "I tuoi fondi e dati protetti dalle migliori misure di sicurezza del settore",
    "features.trading.title": "Trading avanzato",
    "features.trading.description":
      "Accesso a strumenti di trading professionali e dati di mercato in tempo reale",
    "features.support.title": "Supporto 24/7",
    "features.support.description":
      "Il nostro team di esperti è sempre disponibile per aiutarti a raggiungere il successo",
    "features.global.title": "Mercati globali",
    "features.global.description":
      "Fai trading sui mercati di tutto il mondo con spread competitivi",
    "features.execution.title": "Esecuzione ultra-veloce",
    "features.execution.description":
      "Esegui operazioni in millisecondi con la nostra infrastruttura ad alte prestazioni",
    "features.community.title": "Guidato dalla comunità",
    "features.community.description":
      "Unisciti a una vivace comunità di trader e condividi intuizioni e strategie",

    // How it Works section
    "howItWorks.title": "Come funziona",
    "howItWorks.subtitle": "Inizia in tre semplici passaggi",
    "howItWorks.step1.title": "Crea un account",
    "howItWorks.step1.description":
      "Registrati in pochi minuti con il nostro processo semplice",
    "howItWorks.step2.title": "Deposita fondi",
    "howItWorks.step2.description":
      "Deposita utilizzando il tuo metodo di pagamento preferito",
    "howItWorks.step3.title": "Inizia a fare trading",
    "howItWorks.step3.description":
      "Accedi ai mercati globali e inizia il tuo viaggio di trading",

    // Testimonials section
    "testimonials.title": "Cosa dicono i nostri trader",
    "testimonials.subtitle":
      "Unisciti a migliaia di trader soddisfatti in tutto il mondo",

    // FAQ section
    "faq.title": "Domande frequenti",
    "faq.subtitle": "Trova risposte alle domande comuni su M4Capital",
    "faq.badge": "FAQ",
    "faq.q1.question": "Qual è il deposito minimo?",
    "faq.q1.answer":
      "Il deposito minimo per un conto standard è di $100. Può variare in base al tipo di conto.",
    "faq.q2.question": "Quanto sono sicuri i miei fondi?",
    "faq.q2.answer":
      "I tuoi fondi sono conservati in conti segregati presso banche di primo livello. Utilizziamo anche crittografia avanzata per proteggere i tuoi dati.",
    "faq.q3.question": "Quali sono le commissioni di trading?",
    "faq.q3.answer":
      "Offriamo spread competitivi e commissioni basse o nulle a seconda del tipo di conto e dell'asset negoziato.",
    "faq.q4.question": "Come posso prelevare i miei fondi?",
    "faq.q4.answer":
      "Puoi prelevare i tuoi fondi in qualsiasi momento tramite il portale clienti. I prelievi vengono generalmente elaborati entro 24 ore.",

    // Call to Action section
    "cta.title": "Pronto per iniziare?",
    "cta.subtitle": "Inizia il tuo viaggio di trading con M4Capital oggi",
    "cta.button": "Crea un account",
    "cta.badge": "Inizia",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Tutti i diritti riservati.",
    "footer.privacy": "Informativa sulla privacy",
    "footer.terms": "Termini di servizio",
    "footer.disclaimer": "Il trading comporta rischi",
    "footer.markets.title": "Mercati e asset",
    "footer.markets.news": "Feed di notizie",
    "footer.markets.assets": "Asset",
    "footer.markets.collection": "Collezione di azioni",
    "footer.markets.industries": "Settori",
    "footer.analytics.title": "Analisi e strumenti",
    "footer.analytics.quotes": "Quotazioni storiche",
    "footer.analytics.calendars": "Calendari",
    "footer.analytics.specs": "Specifiche di trading",
    "footer.education.title": "Formazione e apprendimento",
    "footer.education.videos": "Tutorial video",
    "footer.education.margin": "Fondamenti del margin trading",
    "footer.events.title": "Eventi e comunità",
    "footer.events.blog": "Il nostro blog",
    "footer.about.title": "Chi siamo",
    "footer.about.numbers": "In numeri",
    "footer.about.press": "Sulla stampa",
    "footer.about.awards": "Riconoscimenti",
    "footer.about.contact": "Contattaci",
    "footer.about.sitemap": "Mappa del sito",
    "footer.about.licenses": "Licenze e garanzie",
    "footer.support.title": "Supporto e servizi",
    "footer.support.download": "Scarica l'app",
    "footer.support.help": "Aiuto",
    "footer.support.deposits": "Depositi e prelievi",
    "footer.support.terms": "Termini",
    "footer.risk.title": "Avvertenza sui rischi",
    "footer.risk.text1":
      "I prodotti finanziari offerti dalla società includono Contratti per Differenza ('CFD') e altri strumenti finanziari complessi. Il trading di CFD comporta un alto livello di rischio poiché la leva può funzionare sia a tuo favore che contro di te. Di conseguenza, i CFD potrebbero non essere adatti a tutti gli investitori poiché potresti perdere tutto il capitale investito. Non dovresti mai investire denaro che non puoi permetterti di perdere. Prima di negoziare i prodotti finanziari complessi offerti, assicurati di comprendere i rischi coinvolti.",
    "footer.risk.text2":
      "Ti è stato concesso un diritto limitato, non esclusivo e non trasferibile di utilizzare la PI fornita su questo sito web esclusivamente per scopi personali e non commerciali in relazione ai servizi forniti sul sito web.",
    "footer.risk.text3":
      "Le informazioni su questo sito web non sono dirette ai residenti di determinate giurisdizioni, tra cui, ma non solo, gli Stati membri dell'UE/SEE, e non sono destinate alla distribuzione a nessuna persona in qualsiasi paese o giurisdizione in cui tale distribuzione o uso sarebbe contrario alla legge o ai regolamenti locali.",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.portfolio": "Valore del portfolio",
    "dashboard.balance": "Saldo",
    "dashboard.deposit": "Deposita",
    "dashboard.withdraw": "Preleva",
    "dashboard.buy": "Acquista",
    "dashboard.sell": "Vendi",
    "dashboard.transfer": "Trasferisci",
    "dashboard.swap": "Scambia",
    "dashboard.crypto": "Criptovalute",
    "dashboard.history": "Cronologia",
    "dashboard.addCrypto": "Aggiungi criptovaluta",

    // Common
    "common.loading": "Caricamento...",
    "common.error": "Errore",
    "common.success": "Successo",
    "common.cancel": "Annulla",
    "common.confirm": "Conferma",
    "common.save": "Salva",
    "common.edit": "Modifica",
    "common.delete": "Elimina",
    "common.search": "Cerca",
    "common.filter": "Filtra",
    "common.sort": "Ordina",
    "common.view": "Visualizza",
    "common.close": "Chiudi",
    "common.submit": "Invia",
    "common.back": "Indietro",
    "common.next": "Avanti",
    "common.previous": "Precedente",
    "common.language": "Lingua",
    "common.chooseLanguage": "Scegli la lingua",
    "common.downloadApp": "Scarica l'app",
    "common.marketsAssets": "Mercati e asset",

    // Mobile Menu
    "menu.historicalQuotes": "Quotazioni storiche",
    "menu.calendars": "Calendari",
    "menu.tradingSpecs": "Specifiche di trading",
    "menu.videoTutorials": "Tutorial video",
    "menu.marginTrading": "Fondamenti del margin trading",
    "menu.tournaments": "Tornei",
    "menu.blog": "Il nostro blog",
    "menu.depositsWithdrawals": "Depositi e prelievi",
    "menu.inNumbers": "In numeri",
    "menu.press": "Sulla stampa",
    "menu.awards": "Riconoscimenti",
    "menu.licenses": "Licenze e garanzie",
  },

  fj: {
    // Navigation
    "nav.home": "Vale",
    "nav.dashboard": "Dashboard",
    "nav.markets": "Makete",
    "nav.crypto": "Crypto",
    "nav.forex": "Forex",
    "nav.stocks": "Stocks",
    "nav.commodities": "Commodities",
    "nav.indices": "Indices",
    "nav.etfs": "ETFs",
    "nav.analytics": "Analytics",
    "nav.education": "Vuli",
    "nav.community": "Veiwekani",
    "nav.services": "Veiqaravi",
    "nav.about": "Keda",
    "nav.help": "Veivuke",
    "nav.contact": "Veitaratara",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",

    // Hero section
    "hero.slide1.title": "Veiganitaki na gauna mai muri ni cryptocurrency",
    "hero.slide1.description":
      "Vakayagataka na nomu portfolio ena cryptocurrency ni yaloyalo kei na iyaya ni veiveiganitaki vakatabakidua",
    "hero.slide2.title": "Vakararawataki vakabanisi",
    "hero.slide2.description":
      "Na nomu ilavo e vakararawataki ena vakatokatoka ni veivanua kei na vakararawataki ni vula e tolu",
    "hero.slide3.title": "Vakacurumitaki totoka",
    "hero.slide3.description":
      "Kauta na veika vinaka ena veiveiganitaki ena noda infrastructure ni vakacurumitaki lalai",
    "hero.slide4.title": "Na nomu ilavo e saravanua",
    "hero.slide4.description":
      "Veiganitaka vakavinaka ena kila ni na nomu ilavo e vakararawataki ena veika ni vakararawataki ni yaloyalo",
    "hero.slide5.title": "Platform ni veiveiganitaki vou",
    "hero.slide5.description":
      "Vakayagataka na vakatulewataki ni veiveiganitaki ni veika ni digitaki ni ka vakatabakidua kei na vakararawatak",
    "hero.getStarted": "Tomana",
    "hero.tryDemo": "Vakayagataka na Demo",
    "hero.learnMore": "Kila Cake",

    // Features section
    "features.title": "Cava na ka e gadreva kina M4Capital?",
    "features.subtitle": "Iyaya kaukauwa ni vakatabakidua vei ira na veiveiganitaki makawa",
    "features.badge": "Veiganitaka Vakatabakidua",
    "features.security.title": "Vakararawataki vakabanisi",
    "features.security.description":
      "Na nomu ilavo kei na nomu itukutuku e vakararawataki ena veika ni vakararawataki ni yaloyalo",
    "features.trading.title": "Veiveiganitaki Vakatabakidua",
    "features.trading.description":
      "Kauta na iyaya ni veiveiganitaki ni professional kei na itukutuku ni makete ni ka yaco",
    "features.support.title": "Veivuke 24/7",
    "features.support.description":
      "Na noda timi ni veivakadeitaki e tu vei kemuni ena veisiga kecega",
    "features.global.title": "Makete ni Vuravura",
    "features.global.description":
      "Veiganitaka ena makete ena vuravura kecega ena spread ni vinaka",
    "features.execution.title": "Vakacurumitaki totoka",
    "features.execution.description":
      "Vakayagataka na veiveiganitaki ena milliseconds ena noda infrastructure ni yaloyalo",
    "features.community.title": "Vakabula ena Veiwekani",
    "features.community.description":
      "Veiwekani ena veiwekani ni veiveiganitaki ni bula kei na veiwekani ni noda veika",

    // How it Works section
    "howItWorks.title": "Na ka e yaco kina",
    "howItWorks.subtitle": "Tomana ena yabaki tolu ni rawarawa",
    "howItWorks.step1.title": "Vakayagataka na Account",
    "howItWorks.step1.description":
      "Vakamacalataka ena miniti e rua ena noda veisolisoli ni rawarawa",
    "howItWorks.step2.title": "Vakamuria na Ilavo",
    "howItWorks.step2.description":
      "Vakamuria ena vakayagataka na ka ni vakalailaitaka ni kemuni",
    "howItWorks.step3.title": "Tomana na Veiveiganitaki",
    "howItWorks.step3.description":
      "Kauta na makete ni vuravura kei na tomana na nomu veiveiganitaki",

    // Testimonials section
    "testimonials.title": "Na ka e vosa kina na noda veiveiganitaki",
    "testimonials.subtitle":
      "Veiwekani ena udolu na veiveiganitaki ni marautaka ena vuravura",

    // FAQ section
    "faq.title": "Taro ni Totoka Duadua",
    "faq.subtitle": "Kune na veisau vei na taro ni vakayagataki ka baleta M4Capital",
    "faq.badge": "FAQ",
    "faq.q1.question": "Na vica na deposit ni lalai?",
    "faq.q1.answer":
      "Na deposit ni lalai vei na account standard e $100. E rawa ni veisau ena ka ni account.",
    "faq.q2.question": "Na vica na vakararawataki ni nomu ilavo?",
    "faq.q2.answer":
      "Na nomu ilavo e tiko ena accounts ni veitabani ena banisi ni yaloyalo. Keitou vakayagataka talega na encryption ni vakatabakidua me vakararawataka na nomu itukutuku.",
    "faq.q3.question": "Na vica na veiqaravi ni veiveiganitaki?",
    "faq.q3.answer":
      "Keitou solia na spread ni vinaka kei na commission ni lalai se vakacava ena ka ni account kei na asset ni veiveiganitaki.",
    "faq.q4.question": "Au rawa ni kerea na nomu ilavo?",
    "faq.q4.answer":
      "O rawa ni kerea na nomu ilavo ena gauna kecega ena client portal. Na withdrawal e vakayagataki ena 24 na aua.",

    // Call to Action section
    "cta.title": "Sarava me tomana?",
    "cta.subtitle": "Tomana na nomu veiveiganitaki ena M4Capital nikua",
    "cta.button": "Vakayagataka na Account",
    "cta.badge": "Tomana",

    // Footer
    "footer.copyright": "© 2024 M4Capital. Kecega na dikevi e taqomaki.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.disclaimer": "Na veiveiganitaki e vakamuria na rawa ni veivakalailaitaki",
    "footer.markets.title": "Makete kei na Asset",
    "footer.markets.news": "News Feed",
    "footer.markets.assets": "Assets",
    "footer.markets.collection": "Stock Collection",
    "footer.markets.industries": "Industries",
    "footer.analytics.title": "Analytics kei na Iyaya",
    "footer.analytics.quotes": "Historical Quotes",
    "footer.analytics.calendars": "Calendars",
    "footer.analytics.specs": "Trading Specs",
    "footer.education.title": "Vuli kei na Kila",
    "footer.education.videos": "Video Tutorials",
    "footer.education.margin": "Margin Trading Basics",
    "footer.events.title": "Events kei na Veiwekani",
    "footer.events.blog": "Noda Blog",
    "footer.about.title": "Keda",
    "footer.about.numbers": "Ena Namba",
    "footer.about.press": "Ena Press",
    "footer.about.awards": "Awards",
    "footer.about.contact": "Veitaratara Keirau",
    "footer.about.sitemap": "Sitemap",
    "footer.about.licenses": "Licenses kei na Safeguards",
    "footer.support.title": "Veivuke kei na Services",
    "footer.support.download": "Download App",
    "footer.support.help": "Veivuke",
    "footer.support.deposits": "Deposits kei na Withdrawals",
    "footer.support.terms": "Terms",
    "footer.risk.title": "Vakatakila ni Rawa",
    "footer.risk.text1":
      "Na veiqaravi ni ilavo ni solia ena company e baleta na Contracts for Difference ('CFDs') kei na veika ni ilavo ni veivakayagataki. Na veiveiganitaki CFD e vakamuria na level ni yaloyalo ni rawa ni veivakalailaitaki baleta ni leverage e rawa ni yaco vei kemuni se keirau. E yaco kina, na CFDs e sega ni dodonu vei ira kecega na investors baleta ni o rawa ni lako kecega na nomu ilavo ni vakayagataki. O sega ni rawa ni vakayagataka na ilavo ni o sega ni rawa ni lako. E sega ni veiveiganitaki na veiqaravi ni ilavo ni veivakayagataki ni solia, vakavinavinaka me o kila na rawa ni veivakalailaitaki.",
    "footer.risk.text2":
      "O sa soli vei kemuni na dikevi ni vakayagataki ni IP ni solia ena website oqo me yaga vei na ka ni nomu yau kei na ka ni sega ni business baleta na veiqaravi ni solia ena website.",
    "footer.risk.text3":
      "Na itukutuku ena website oqo e sega ni vakadinadina vei ira na tamata ni tiko ena jurisdictions e taucoko, e baleta talega na EU/EEA member states, ka sega ni vakadinadina me soli vei ira na tamata kecega ena vanua se jurisdiction me yaco kina na veisoli se vakayagataki ni veivakacacani ena law se regulation ni vanua.",

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
    "common.loading": "Vakamuria...",
    "common.error": "Veisau",
    "common.success": "Vinaka",
    "common.cancel": "Vakacuruma",
    "common.confirm": "Vakatokoni",
    "common.save": "Taqomaka",
    "common.edit": "Vosataka",
    "common.delete": "Kauta Tani",
    "common.search": "Qaravi",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.view": "Raica",
    "common.close": "Sogo",
    "common.submit": "Vakalailaitaka",
    "common.back": "Lesu",
    "common.next": "Mai Muri",
    "common.previous": "Mai Murimuri",
    "common.language": "Vosa",
    "common.chooseLanguage": "Vakasama na Vosa",
    "common.downloadApp": "Download App",
    "common.marketsAssets": "Makete kei na Assets",

    // Mobile Menu
    "menu.historicalQuotes": "Historical Quotes",
    "menu.calendars": "Calendars",
    "menu.tradingSpecs": "Trading Specs",
    "menu.videoTutorials": "Video Tutorials",
    "menu.marginTrading": "Margin Trading Basics",
    "menu.tournaments": "Tournaments",
    "menu.blog": "Noda Blog",
    "menu.depositsWithdrawals": "Deposits kei na Withdrawals",
    "menu.inNumbers": "Ena Namba",
    "menu.press": "Ena Press",
    "menu.awards": "Awards",
    "menu.licenses": "Licenses kei na Safeguards",
  },
} as const;

// Helper to get translation with fallback to English
export function getTranslation(language: string, key: TranslationKey): string {
  const lang = language as keyof typeof translations;
  const langTranslations = (translations as any)[lang];
  if (langTranslations && langTranslations[key]) {
    return langTranslations[key];
  }
  // Fallback to English
  return (translations.en as any)[key] || key;
}
